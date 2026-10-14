import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRODUCT_CATALOG } from '../lib/catalog';
import { supabase } from '../lib/supabase';
import {
  buildRfqPayload,
  nextRfqCode,
  RfqContact,
  RfqPayload,
  summarizeRfq,
} from '../lib/rfq';
import { Product, Project, UserProfile } from '../types';

/**
 * Service to handle all interactions with Supabase (Cloud Database, Auth & RFQ).
 *
 * Princípios:
 *  - Nunca reportar "enviado" sem confirmação do servidor. Falhas de rede/DB → fila local (outbox)
 *    e status `queued`, comunicado ao usuário.
 *  - Envio idempotente: `rfq_code` é UNIQUE; violação (23505) = pedido já recebido.
 */

export type RfqDeliveryStatus = 'sent' | 'queued' | 'failed';

export interface RfqResponse {
  success: boolean;
  status: RfqDeliveryStatus;
  rfqCode?: string;
  projectId?: string;
  /** true quando o servidor já tinha este código (reenvio/duplo toque). */
  duplicate?: boolean;
  error?: string;
}

const OUTBOX_KEY = 'qls-rfq-outbox';

interface OutboxEntry {
  code: string;
  project: Project;
  profile?: UserProfile | null;
  payload: RfqPayload;
  queuedAt: string;
  attempts: number;
}

// ───────────────────────── Sessão (guest-first) ─────────────────────────

/** Garante um usuário (anônimo se necessário) para que as policies RLS por `auth.uid()` funcionem. */
export async function ensureSession(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) return data.session.user.id;
    const { data: anon, error } = await supabase.auth.signInAnonymously();
    if (error) return null;
    return anon.user?.id ?? null;
  } catch {
    return null;
  }
}

// ───────────────────────── Sincronização do projeto ─────────────────────────

const ADDITIONAL_ROOM_SUFFIX = '-additional';

/** Syncs a complete project and all its rooms/items to Supabase. */
export async function syncProjectToSupabase(
  project: Project,
  userId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: projectError } = await supabase.from('projects').upsert({
      id: project.id,
      user_id: userId,
      project_name: project.projectName,
      client_name: project.clientName || null,
      project_address: project.projectAddress || null,
      status: project.status || 'draft',
      total_fixtures_count: project.totalFixturesCount,
      total_power_watts: project.totalPowerWatts,
      total_estimated_cost: project.totalEstimatedCost,
      updated_at: new Date().toISOString(),
    });
    if (projectError) return { success: false, error: projectError.message };

    const roomRows = project.rooms.map((room) => ({
      id: room.id,
      project_id: project.id,
      room_name: room.name,
      room_type: room.roomType,
      length_m: room.length,
      width_m: room.width,
      height_m: room.height,
      target_lux: room.targetLux,
      required_lumens: room.requiredLumens,
    }));

    if ((project.additionalItems ?? []).length > 0) {
      roomRows.push({
        id: `${project.id}${ADDITIONAL_ROOM_SUFFIX}`,
        project_id: project.id,
        room_name: 'Additional items',
        room_type: 'living_room',
        length_m: 0,
        width_m: 0,
        height_m: 0,
        target_lux: 0,
        required_lumens: 0,
      });
    }

    if (roomRows.length > 0) {
      const { error: roomsError } = await supabase.from('rooms').upsert(roomRows);
      if (roomsError) return { success: false, error: roomsError.message };
    }

    const items: { roomId: string; item: Project['rooms'][number]['selectedItem'] }[] = [
      ...project.rooms.map((r) => ({ roomId: r.id, item: r.selectedItem })),
      ...(project.additionalItems ?? []).map((i) => ({ roomId: `${project.id}${ADDITIONAL_ROOM_SUFFIX}`, item: i })),
    ];

    const itemRows = items.flatMap(({ roomId, item }) => {
      if (!item) return [];
      const rows: Record<string, unknown>[] = [
        {
          id: item.id,
          room_id: roomId,
          product_id: item.product.id,
          tier_type: item.tierType,
          quantity: item.quantity,
          selected_finish: item.selectedFinish,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
          lux_achieved: item.luxAchieved,
        },
      ];
      (item.kit ?? []).forEach((k) =>
        rows.push({
          id: `${item.id}-${k.role}`,
          room_id: roomId,
          product_id: k.product.id,
          tier_type: `kit_${k.role}`,
          quantity: k.quantity,
          selected_finish: 'Standard',
          unit_price: k.unitPrice,
          subtotal: k.subtotal,
          lux_achieved: 0,
        })
      );
      return rows;
    });

    if (itemRows.length > 0) {
      const { error: itemsError } = await supabase.from('room_items').upsert(itemRows);
      if (itemsError) return { success: false, error: itemsError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Unknown network error' };
  }
}

// ───────────────────────── RFQ ─────────────────────────

/** Tenta entregar um RFQ ao servidor. Nunca lança; devolve o status real. */
async function deliverRfq(project: Project, payload: RfqPayload): Promise<RfqResponse> {
  const code = payload.code;
  try {
    const userId = await ensureSession();

    const sync = await syncProjectToSupabase(project, userId);
    if (!sync.success) return { success: false, status: 'queued', rfqCode: code, projectId: project.id, error: sync.error };

    const full = {
      project_id: project.id,
      user_id: userId,
      rfq_code: code,
      status: 'submitted',
      notes: summarizeRfq(payload),
      contact_name: payload.contact.fullName,
      contact_email: payload.contact.email,
      contact_phone: payload.contact.phone,
      company_name: payload.contact.companyName || null,
      contact_channel: payload.contact.channel,
      piece_count: payload.totals.pieces,
      payload,
    };

    let { error } = await supabase.from('rfq_submissions').insert(full);

    // Migração de hardening ainda não aplicada → colunas novas inexistentes: reenvia só com o legado.
    if (error && (error.code === 'PGRST204' || error.code === '42703')) {
      ({ error } = await supabase.from('rfq_submissions').insert({
        project_id: project.id,
        user_id: userId,
        rfq_code: code,
        status: 'submitted',
        notes: summarizeRfq(payload),
      }));
    }

    if (error) {
      // 23505 = unique_violation → este RFQ já foi recebido (idempotência).
      if (error.code === '23505') return { success: true, status: 'sent', rfqCode: code, projectId: project.id, duplicate: true };
      return { success: false, status: 'queued', rfqCode: code, projectId: project.id, error: error.message };
    }

    await supabase.from('projects').update({ status: 'submitted' }).eq('id', project.id);
    return { success: true, status: 'sent', rfqCode: code, projectId: project.id };
  } catch (err: any) {
    return { success: false, status: 'queued', rfqCode: code, projectId: project.id, error: err?.message || 'Network error' };
  }
}

async function readOutbox(): Promise<OutboxEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(OUTBOX_KEY);
    return raw ? (JSON.parse(raw) as OutboxEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeOutbox(entries: OutboxEntry[]): Promise<void> {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(entries));
}

export async function getOutboxCount(): Promise<number> {
  return (await readOutbox()).length;
}

/**
 * Envia um RFQ à QLS. Se o servidor não confirmar, o pedido fica salvo no aparelho
 * (`status: 'queued'`) e é reenviado por `flushRfqOutbox`. Nunca simula sucesso.
 */
export async function submitRfqToSupabase(
  project: Project,
  userProfile: UserProfile | null | undefined,
  contact: RfqContact
): Promise<RfqResponse> {
  const code = nextRfqCode(project);
  const payload = buildRfqPayload(project, contact, code);

  const result = await deliverRfq(project, payload);
  if (result.status === 'sent') {
    // Remove eventual duplicata da fila (ex.: usuário reenviou manualmente).
    const box = await readOutbox();
    if (box.some((e) => e.code === code)) await writeOutbox(box.filter((e) => e.code !== code));
    return result;
  }

  // Falhou: guarda para reenvio (sem duplicar por código).
  const box = await readOutbox();
  const entry: OutboxEntry = {
    code,
    project,
    profile: userProfile,
    payload,
    queuedAt: new Date().toISOString(),
    attempts: 1,
  };
  await writeOutbox([entry, ...box.filter((e) => e.code !== code)]);
  return { ...result, success: false, status: 'queued' };
}

/** Reenvia pedidos pendentes. Devolve os códigos confirmados pelo servidor. */
export async function flushRfqOutbox(): Promise<string[]> {
  const box = await readOutbox();
  if (box.length === 0) return [];

  const sent: string[] = [];
  const remaining: OutboxEntry[] = [];

  for (const entry of box) {
    const res = await deliverRfq(entry.project, entry.payload);
    if (res.status === 'sent') sent.push(entry.code);
    else remaining.push({ ...entry, attempts: entry.attempts + 1 });
  }

  await writeOutbox(remaining);
  return sent;
}

// ───────────────────────── Catálogo ─────────────────────────

function mapProductRow(item: any): Product {
  const cctRange: [number, number] | undefined =
    item.cct_min && item.cct_max ? [Number(item.cct_min), Number(item.cct_max)] : undefined;
  return {
    id: item.id,
    sku: item.sku,
    name: item.name,
    category: item.category,
    mountingType: item.mounting_type,
    lumens: Number(item.lumens),
    powerWatts: Number(item.power_watts),
    cctKelvin: item.cct_kelvin,
    cctRange,
    cri: item.cri,
    beamAngle: item.beam_angle,
    ipRating: item.ip_rating,
    dimmingType: item.dimming_type,
    finishes: item.finishes || ['Standard'],
    basePrice: Number(item.base_price),
    imageUrl: item.image_url,
    datasheetUrl: item.datasheet_pdf_url ?? undefined,
    description: item.description ?? '',
    tier: item.tier || 'recommended',
    unit: item.unit === 'm' ? 'm' : 'pc',
    brand: item.brand ?? undefined,
    voltage: item.voltage ?? undefined,
    ugr: item.ugr ?? undefined,
    widthMm: item.width_mm ?? undefined,
    lengthM: item.length_m ?? undefined,
    maxWatts: item.max_watts ?? undefined,
    sourceUrl: item.source_url ?? undefined,
    verified: !!item.verified,
  };
}

/**
 * Catálogo vindo do Supabase (fonte da verdade) com fallback offline.
 * Itens locais ausentes no banco são mantidos enquanto a tabela `products` não for totalmente populada.
 */
export async function getProductCatalog(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from('products').select('*').eq('is_active', true);
    if (error || !data || data.length === 0) return PRODUCT_CATALOG;

    const remote = data.map(mapProductRow);
    const remoteIds = new Set(remote.map((p) => p.id));
    return [...remote, ...PRODUCT_CATALOG.filter((p) => !remoteIds.has(p.id))];
  } catch {
    return PRODUCT_CATALOG;
  }
}
