import { KitCategory, KitSelection, Product } from '../types';
import { isContinuousSource, PRODUCT_CATALOG } from './catalog';

/** Margem de capacidade do driver sobre a carga total (PLANO §2.4: W = m × W/m × 1,20). */
export const DRIVER_HEADROOM = 1.2;

/** Comprimento máximo recomendado por alimentação contínua em 24 V (queda de tensão). */
export const MAX_RUN_METRES_24V = 5;

export interface KitPlan {
  /** Linhas sugeridas (já com produto escolhido). */
  lines: KitSelection[];
  /** Componentes obrigatórios para os quais não há produto compatível no catálogo. */
  missing: string[];
  /** Avisos técnicos para o usuário. */
  warnings: string[];
  /** true quando todos os componentes obrigatórios foram resolvidos. */
  complete: boolean;
  totalLoadWatts: number;
  requiredDriverWatts: number;
}

export interface KitOptions {
  /** Protocolo de dimerização desejado para o driver. */
  dimming?: 'triac' | 'dali' | 'none';
  /** Tipo de montagem desejado do perfil. */
  mounting?: 'recessed' | 'surface';
  catalog?: Product[];
}

const line = (
  role: KitCategory,
  required: boolean,
  product: Product,
  quantity: number,
  note?: string
): KitSelection => ({
  role,
  required,
  product,
  quantity,
  unitPrice: product.basePrice,
  subtotal: Math.round(quantity * product.basePrice * 100) / 100,
  note,
});

/**
 * Monta o kit necessário para fontes contínuas (fita / neon / wall washer).
 * Luminárias de ponto (downlights etc.) têm driver integrado → kit vazio e completo.
 */
export function buildKit(source: Product, metres: number, options: KitOptions = {}): KitPlan {
  const catalog = options.catalog ?? PRODUCT_CATALOG;
  const empty: KitPlan = {
    lines: [],
    missing: [],
    warnings: [],
    complete: true,
    totalLoadWatts: Math.round(source.powerWatts * Math.max(0, metres) * 10) / 10,
    requiredDriverWatts: 0,
  };
  if (!isContinuousSource(source) || metres <= 0) return empty;

  const lines: KitSelection[] = [];
  const missing: string[] = [];
  const warnings: string[] = [];

  const totalLoadWatts = Math.round(source.powerWatts * metres * 10) / 10;
  const requiredDriverWatts = Math.ceil(totalLoadWatts * DRIVER_HEADROOM);
  const voltage = source.voltage ?? 24;

  // ── Driver ─────────────────────────────────────────────────────────────
  const drivers = catalog
    .filter((p) => p.category === 'driver' && (p.voltage ?? voltage) === voltage && (p.maxWatts ?? 0) > 0)
    .sort((a, b) => (a.maxWatts as number) - (b.maxWatts as number));

  const wantedDimming = options.dimming ?? (source.cctRange ? 'dali' : 'triac');
  const preferred = drivers.filter((d) => wantedDimming === 'none' || d.dimmingType === wantedDimming);
  const pool = preferred.length > 0 ? preferred : drivers;
  if (preferred.length === 0 && drivers.length > 0 && wantedDimming !== 'none') {
    warnings.push(`No ${wantedDimming.toUpperCase()} driver in catalogue — showing the closest alternative.`);
  }

  if (pool.length === 0) {
    missing.push(`${voltage}V driver ≥ ${requiredDriverWatts} W`);
  } else {
    const fits = pool.find((d) => (d.maxWatts as number) >= requiredDriverWatts);
    if (fits) {
      lines.push(
        line('driver', true, fits, 1, `Load ${totalLoadWatts} W + 20% headroom = ${requiredDriverWatts} W`)
      );
    } else {
      const largest = pool[pool.length - 1];
      const qty = Math.ceil(requiredDriverWatts / (largest.maxWatts as number));
      lines.push(
        line(
          'driver',
          true,
          largest,
          qty,
          `Load ${totalLoadWatts} W (+20%) needs ${qty} × ${largest.maxWatts} W — split strip runs per driver`
        )
      );
    }
  }

  // ── Perfil de alumínio (somente fitas; neon/wall washer já têm canal próprio) ──
  if (source.category === 'strip') {
    const stripWidth = source.widthMm ?? 10;
    const profiles = catalog.filter(
      (p) => p.category === 'profile' && (p.widthMm ?? 0) >= stripWidth && (p.lengthM ?? 0) > 0
    );
    const wantedMount = options.mounting ?? (source.mountingType === 'surface' ? 'surface' : 'recessed');
    const profile =
      profiles.find((p) => p.mountingType === wantedMount) ?? profiles.sort((a, b) => a.basePrice - b.basePrice)[0];
    if (profile) {
      const qty = Math.ceil(metres / (profile.lengthM as number));
      lines.push(line('profile', true, profile, qty, `${qty} × ${profile.lengthM} m for ${metres} m of strip`));
    } else {
      missing.push(`Aluminium profile for ${stripWidth} mm strip`);
    }
  } else {
    warnings.push('Neon / wall-washer: mounting clips and end caps are specified by QLS at quotation.');
  }

  // ── Controle ──────────────────────────────────────────────────────────
  const needsCct = !!source.cctRange;
  const controls = catalog.filter((p) => p.category === 'control');
  const control = needsCct
    ? controls.find((p) => /cct|tunable/i.test(p.name))
    : controls.find((p) => !/cct|tunable/i.test(p.name));
  if (control) {
    lines.push(
      line(
        'control',
        needsCct,
        control,
        1,
        needsCct ? 'Required to change colour temperature' : 'Optional — local dimming'
      )
    );
  } else if (needsCct) {
    missing.push('Tunable White CCT controller');
  }

  if (voltage <= 24 && metres > MAX_RUN_METRES_24V) {
    warnings.push(
      `${metres} m exceeds ${MAX_RUN_METRES_24V} m per ${voltage} V run — split into shorter runs or feed from both ends (QLS will confirm).`
    );
  }

  return {
    lines,
    missing,
    warnings,
    complete: missing.length === 0,
    totalLoadWatts,
    requiredDriverWatts,
  };
}

/** Soma monetária do kit. */
export function kitSubtotal(kit: KitSelection[] | undefined): number {
  return Math.round((kit ?? []).reduce((acc, k) => acc + k.subtotal, 0) * 100) / 100;
}
