import {
  Product,
  ProductTier,
  RoomCalculationResult,
  RoomPreferences,
  RoomType,
  TierResult,
} from '../types';
import { ipLevel, isContinuousSource, isLightSource, PRODUCT_CATALOG } from './catalog';
import { calculateFixtureCount, calculateRoomLighting } from './lightingEngine';
import { AUSTRALIAN_LIGHTING_STANDARDS } from './standards';

export interface RecommendLightingParams {
  roomName: string;
  roomType: RoomType;
  length: number;
  width: number;
  height?: number;
  catalog?: Product[];
  preferences?: Partial<RoomPreferences>;
}

const CCT_TOLERANCE_K = 300;

export function matchesCct(p: Product, cct: number): boolean {
  if (p.cctRange && cct >= p.cctRange[0] && cct <= p.cctRange[1]) return true;
  return Math.abs(p.cctKelvin - cct) <= CCT_TOLERANCE_K;
}

/** UGR is only claimed when the product carries the data (or it is an anti-glare panel). */
export function meetsLowGlare(p: Product): boolean {
  return p.ugr !== undefined && p.ugr <= 19;
}

const efficacy = (p: Product) => (p.powerWatts > 0 ? p.lumens / p.powerWatts : 0);

/** Applies a filter; if it empties the list, keeps the original and records a warning (explicit relaxation). */
function softFilter(
  list: Product[],
  predicate: (p: Product) => boolean,
  warning: string,
  warnings: string[]
): Product[] {
  const filtered = list.filter(predicate);
  if (filtered.length === 0) {
    warnings.push(warning);
    return list;
  }
  return filtered;
}

/**
 * Intelligent lighting recommendation engine:
 * Evaluates room parameters against AS/NZS 1680 (Lumen Method), filters the QLS catalogue
 * (LEDYi range) by the user's preferences and returns 3 differentiated options
 * (Recommended, Premium, Budget) — each with data-backed justifications.
 *
 * The result is a PRELIMINARY ESTIMATE; reflectances, IES curves and layout are not modelled.
 */
export function recommendRoomLighting(params: RecommendLightingParams): RoomCalculationResult {
  const { roomName, roomType, length, width, height = 2.7, catalog = PRODUCT_CATALOG } = params;

  const standard = AUSTRALIAN_LIGHTING_STANDARDS[roomType] || AUSTRALIAN_LIGHTING_STANDARDS.living_room;

  const prefs: RoomPreferences = {
    mode: params.preferences?.mode ?? 'professional',
    cct: params.preferences?.cct ?? standard.recommendedCCT,
    lowGlare: params.preferences?.lowGlare ?? false,
    minIP: params.preferences?.minIP,
    sourceKind: params.preferences?.sourceKind ?? 'any',
    intent: params.preferences?.intent,
  };

  // 1. Photometric calculation
  const calc = calculateRoomLighting({ roomType, length, width, height });
  const warnings: string[] = [];

  // 2. Candidates: light sources from the catalogue only
  let candidates = catalog.filter(isLightSource);

  // 2a. Source type (point × continuous)
  if (prefs.sourceKind === 'continuous') {
    candidates = softFilter(
      candidates,
      (p) => isContinuousSource(p) || p.category === 'linear',
      'No continuous-light products available — showing point sources instead.',
      warnings
    );
  } else {
    // General lighting: strips/neon serve as support, not as the main source.
    candidates = softFilter(candidates, (p) => !isContinuousSource(p), 'Only continuous sources available.', warnings);
  }

  // 2b. Ingress protection (space standard + user requirement)
  const requiredIP = Math.max(ipLevel(standard.minIPRating), ipLevel(prefs.minIP));
  if (requiredIP > 20) {
    candidates = softFilter(
      candidates,
      (p) => ipLevel(p.ipRating) >= requiredIP,
      `No product in the catalogue meets IP${requiredIP} — showing closest options; QLS will confirm suitability.`,
      warnings
    );
  }

  // 2c. Colour temperature
  candidates = softFilter(
    candidates,
    (p) => matchesCct(p, prefs.cct),
    `No product matches ${prefs.cct}K — showing closest options.`,
    warnings
  );

  // 2d. Low glare (only where UGR data exists)
  if (prefs.lowGlare) {
    candidates = softFilter(
      candidates,
      meetsLowGlare,
      'No product with published UGR ≤ 19 matches your other filters — glare control will be reviewed by QLS.',
      warnings
    );
  }

  if (candidates.length === 0) candidates = catalog.filter(isLightSource);

  // 3. Quantidades por candidato
  const evaluate = (p: Product): TierResult => {
    const c = calculateFixtureCount(calc.totalLumensRequired, p.lumens, calc.areaM2, calc.utilizationFactor, calc.maintenanceFactor);
    return {
      product: p,
      quantity: c.quantity,
      totalLumens: c.totalLumens,
      luxAchieved: c.luxAchieved,
      totalCost: Math.round(c.quantity * p.basePrice * 100) / 100,
    };
  };
  const evaluated = candidates.map(evaluate);

  // 4. Seleção diferenciada dos 3 níveis
  const score = (r: TierResult): number => {
    const p = r.product;
    return (
      (p.cri >= standard.minCRI ? 2 : 0) +
      (matchesCct(p, prefs.cct) ? 1 : 0) +
      (r.luxAchieved >= calc.targetLux ? 1 : 0) +
      efficacy(p) / 100 +
      (p.tier === 'recommended' ? 0.5 : 0)
    );
  };

  const recommended = [...evaluated].sort((a, b) => score(b) - score(a))[0];

  const remainingForPremium = evaluated.filter((r) => r.product.id !== recommended.product.id);
  const premium =
    [...remainingForPremium].sort(
      (a, b) =>
        b.product.cri - a.product.cri ||
        (a.product.ugr ?? 99) - (b.product.ugr ?? 99) ||
        b.product.basePrice - a.product.basePrice
    )[0] ?? recommended;

  const remainingForBudget = evaluated.filter(
    (r) => r.product.id !== recommended.product.id && r.product.id !== premium.product.id
  );
  const budget =
    [...(remainingForBudget.length ? remainingForBudget : remainingForPremium)].sort(
      (a, b) => a.totalCost - b.totalCost
    )[0] ?? recommended;

  const recommendedProducts: Record<ProductTier, TierResult> = { recommended, premium, budget };

  // 5. Justificativas — somente a partir de dados do produto
  const justify = (tier: ProductTier, r: TierResult): string[] => {
    const p = r.product;
    const unit = p.unit === 'm' ? 'm' : 'pcs';
    const out: string[] = [];

    if (tier !== 'recommended' && p.id === recommended.product.id) {
      return ['No distinct alternative available in the current catalogue for these filters.'];
    }

    if (tier === 'recommended') {
      out.push(`Estimated ${r.luxAchieved} lx vs ${calc.targetLux} lx target (AS/NZS 1680).`);
      out.push(`CRI ${p.cri} (recommended minimum for this space: ${standard.minCRI}).`);
      if (efficacy(p) > 0) out.push(`Efficacy ${Math.round(efficacy(p))} lm/W.`);
      if (matchesCct(p, prefs.cct)) out.push(`Matches your ${prefs.cct}K colour temperature.`);
      if (p.ugr !== undefined) out.push(`Published UGR ${p.ugr}.`);
    } else if (tier === 'premium') {
      out.push(`Highest colour fidelity among eligible options: CRI ${p.cri}.`);
      if (p.ugr !== undefined) out.push(`Published UGR ${p.ugr} — stronger glare control.`);
      if (p.dimmingType === 'dali') out.push('DALI-2 dimming for building-automation projects.');
      if (p.cctRange) out.push(`Adjustable ${p.cctRange[0]}–${p.cctRange[1]}K.`);
    } else {
      out.push(`Lowest indicative cost for this space: ${r.quantity} ${unit} ≈ $${r.totalCost.toFixed(2)} AUD.`);
      out.push(`CRI ${p.cri}${p.cri < standard.minCRI ? ` — below the ${standard.minCRI} recommended for this space` : ''}.`);
      if (r.luxAchieved < calc.targetLux) out.push(`Below target illuminance (${r.luxAchieved} lx).`);
    }
    return out;
  };

  const justifications: Record<ProductTier, string[]> = {
    recommended: justify('recommended', recommended),
    premium: justify('premium', premium),
    budget: justify('budget', budget),
  };

  // 6. Premissas e lacunas (estimativa preliminar ≠ projeto validado)
  const assumptions = [
    `Lumen Method: Φ = (E × A) / (μ × d) with μ = ${calc.utilizationFactor} (estimated from room index K = ${calc.roomIndexK}) and d = ${calc.maintenanceFactor}.`,
    'Working plane at 0.8 m; average (not point-by-point) illuminance.',
    `Target ${calc.targetLux} lx and minimum CRI ${standard.minCRI} per AS/NZS 1680 guidance for this space type.`,
  ];

  const missingInfo = [
    'Surface reflectances (ceiling, walls, floor).',
    'Photometric distribution (IES) and fixture layout / uniformity.',
    'Furniture and task-area positions.',
    'Final price, stock and lead time — confirmed in the QLS formal proposal.',
  ];

  if (isContinuousSource(recommended.product)) {
    warnings.push(
      'Continuous LED is usually supplementary or indirect light. The lumen method is optimistic for cove/joinery lighting — QLS will review before quoting.'
    );
  }

  return {
    roomName,
    roomType,
    dimensions: { length, width, height },
    areaM2: calc.areaM2,
    targetLux: calc.targetLux,
    totalLumensRequired: calc.totalLumensRequired,
    roomIndexK: calc.roomIndexK,
    utilizationFactor: calc.utilizationFactor,
    maintenanceFactor: calc.maintenanceFactor,
    recommendedProducts,
    justifications,
    assumptions,
    warnings,
    missingInfo,
    preferences: prefs,
  };
}

// ───────────────────────── Modo Guiado ─────────────────────────

export interface GuidedIntent {
  id: string;
  label: string;
  description: string;
  cct?: number;
  lowGlare?: boolean;
  sourceKind?: RoomPreferences['sourceKind'];
}

export const GUIDED_INTENTS: GuidedIntent[] = [
  { id: 'cozy', label: 'Cozy & relaxing', description: 'Warm, intimate glow for unwinding.', cct: 2700 },
  { id: 'elegant', label: 'Warm & elegant', description: 'Refined residential light, easy to dim.', cct: 3000 },
  { id: 'focused', label: 'Bright & focused', description: 'Crisp light for tasks, benches and desks.', cct: 4000 },
  {
    id: 'comfort',
    label: 'Easy on the eyes',
    description: 'Low-glare light for long hours of work.',
    cct: 4000,
    lowGlare: true,
  },
  {
    id: 'continuous',
    label: 'Continuous glow',
    description: 'Seamless line of light for coves, joinery and shelves.',
    cct: 3000,
    sourceKind: 'continuous',
  },
];

export interface GuidedResolution {
  preferences: RoomPreferences;
  /** Explicação em linguagem simples das escolhas feitas em nome do usuário. */
  explanation: string[];
}

/** Traduz o efeito desejado em parâmetros técnicos e explica o porquê. */
export function resolveGuidedPreferences(roomType: RoomType, intentId: string): GuidedResolution {
  const intent = GUIDED_INTENTS.find((i) => i.id === intentId) ?? GUIDED_INTENTS[1];
  const standard = AUSTRALIAN_LIGHTING_STANDARDS[roomType] || AUSTRALIAN_LIGHTING_STANDARDS.living_room;
  const cct = intent.cct ?? standard.recommendedCCT;
  const explanation: string[] = [];

  explanation.push(
    `"${intent.label}" → ${cct}K colour temperature (${
      cct <= 2700 ? 'warm' : cct <= 3000 ? 'soft white' : 'neutral white'
    }).`
  );
  if (intent.lowGlare) explanation.push('Low-glare option enabled (UGR ≤ 19) — only products with published UGR are considered.');
  if (intent.sourceKind === 'continuous') explanation.push('Continuous line sources prioritised (strips, neon, linear).');
  if (ipLevel(standard.minIPRating) > 20) {
    explanation.push(`${standard.minIPRating} or higher required because ${standard.label} is a wet/exposed area.`);
  }
  explanation.push(`Target ${standard.targetLux} lx from AS/NZS 1680 for ${standard.label}.`);

  return {
    preferences: {
      mode: 'guided',
      cct,
      lowGlare: !!intent.lowGlare,
      sourceKind: intent.sourceKind ?? 'any',
      intent: intent.label,
    },
    explanation,
  };
}
