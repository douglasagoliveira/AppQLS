import { Project, UserProfile } from '../types';
import { buildBom, collectKitGaps, computeTotals } from './projectMath';

export type BuyerType = 'architect' | 'electrician' | 'designer' | 'builder' | 'homeowner' | 'other';
export type ContactChannel = 'email' | 'whatsapp';

export const BUYER_TYPES: { id: BuyerType; label: string }[] = [
  { id: 'architect', label: 'Architect / Designer' },
  { id: 'electrician', label: 'Electrician' },
  { id: 'builder', label: 'Builder' },
  { id: 'homeowner', label: 'Homeowner' },
];

export interface RfqContact {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  buyerType: BuyerType;
  channel: ContactChannel;
  notes?: string;
}

export type ContactErrors = Partial<Record<'fullName' | 'email' | 'phone', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Client-side validation. The server must revalidate (constraints/RLS in the migration). */
export function validateContact(c: RfqContact): ContactErrors {
  const errors: ContactErrors = {};
  if (c.fullName.trim().length < 2) errors.fullName = 'Please enter your full name.';
  if (!EMAIL_RE.test(c.email.trim())) errors.email = 'Please enter a valid email address.';
  const digits = c.phone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) errors.phone = 'Please enter a valid phone / WhatsApp number.';
  return errors;
}

export function contactFromProfile(profile: UserProfile | null | undefined): RfqContact {
  return {
    fullName: profile?.fullName ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    companyName: profile?.companyName ?? '',
    buyerType: (profile?.userType as BuyerType) ?? 'architect',
    channel: 'email',
    notes: '',
  };
}

/** `RFQ-AB12CD` on first send; `RFQ-AB12CD-R2`, `-R3`… on revised resends. */
export function baseRfqCode(projectId: string): string {
  return `RFQ-${projectId.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase()}`;
}

export function nextRfqCode(project: Pick<Project, 'id' | 'rfqCode'>): string {
  const base = baseRfqCode(project.id);
  if (!project.rfqCode) return base;
  const m = /-R(\d+)$/.exec(project.rfqCode);
  const n = m ? parseInt(m[1], 10) + 1 : 2;
  return `${base}-R${n}`;
}

export const RFQ_DISCLAIMER =
  'Preliminary estimate (Lumen Method, AS/NZS 1680). Prices are indicative. Final price, stock, lead time and compatibility are confirmed in the formal proposal issued by QLS.';

/** Structured snapshot sent to the QLS sales team. */
export interface RfqPayload {
  code: string;
  generatedAt: string;
  contact: RfqContact;
  project: { id: string; name: string; client?: string; address?: string };
  spaces: {
    name: string;
    type: string;
    lengthM: number;
    widthM: number;
    heightM: number;
    targetLux: number;
    luxAchieved?: number;
  }[];
  bom: ReturnType<typeof buildBom>;
  kitGaps: ReturnType<typeof collectKitGaps>;
  totals: ReturnType<typeof computeTotals>;
  disclaimer: string;
}

export function buildRfqPayload(project: Project, contact: RfqContact, code: string): RfqPayload {
  return {
    code,
    generatedAt: new Date().toISOString(),
    contact: { ...contact, notes: contact.notes?.trim() || undefined },
    project: {
      id: project.id,
      name: project.projectName,
      client: project.clientName || undefined,
      address: project.projectAddress || undefined,
    },
    spaces: project.rooms.map((r) => ({
      name: r.name,
      type: r.roomType,
      lengthM: r.length,
      widthM: r.width,
      heightM: r.height,
      targetLux: r.targetLux,
      luxAchieved: r.selectedItem?.luxAchieved,
    })),
    bom: buildBom(project),
    kitGaps: collectKitGaps(project),
    totals: computeTotals(project.rooms, project.additionalItems ?? []),
    disclaimer: RFQ_DISCLAIMER,
  };
}

/** Plain-text summary — used as a readable fallback in `notes` and in email/WhatsApp bodies. */
export function summarizeRfq(p: RfqPayload): string {
  const lines = [
    `${p.code} — ${p.project.name}`,
    `From: ${p.contact.fullName}${p.contact.companyName ? ` (${p.contact.companyName})` : ''} · ${p.contact.email} · ${p.contact.phone}`,
    `Spaces: ${p.spaces.length} · Pieces: ${p.totals.pieces} · Linear: ${p.totals.linearMetres} m · Load: ${p.totals.watts} W`,
    ...p.bom.map((b) => `- [${b.space}] ${b.qty} ${b.unit} × ${b.sku} (${b.name})`),
  ];
  if (p.kitGaps.length) lines.push(`Kit gaps: ${p.kitGaps.map((g) => `${g.space}: ${g.missing.join(', ')}`).join('; ')}`);
  if (p.contact.notes) lines.push(`Notes: ${p.contact.notes}`);
  return lines.join('\n');
}
