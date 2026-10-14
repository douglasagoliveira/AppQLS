import { ipLevel, PRODUCT_CATALOG, isLightSource } from '../lib/catalog';
import { buildKit, kitSubtotal } from '../lib/kitEngine';
import {
  GUIDED_INTENTS,
  matchesCct,
  recommendRoomLighting,
  resolveGuidedPreferences,
} from '../lib/recommendationEngine';
import { Product } from '../types';

const base = { roomName: 'Test', length: 4.5, width: 3.2, height: 2.7 };

const mk = (over: Partial<Product>): Product => ({
  id: 'x',
  sku: 'X',
  name: 'X',
  category: 'downlight',
  mountingType: 'recessed',
  lumens: 1000,
  powerWatts: 10,
  cctKelvin: 3000,
  cri: 90,
  beamAngle: 40,
  ipRating: 'IP20',
  dimmingType: 'triac',
  finishes: ['Std'],
  basePrice: 50,
  imageUrl: '',
  description: '',
  ...over,
});

describe('catalog helpers', () => {
  it('ipLevel parses ratings', () => {
    expect(ipLevel('IP65')).toBe(65);
    expect(ipLevel('IP44')).toBe(44);
    expect(ipLevel('')).toBe(0);
    expect(ipLevel(undefined)).toBe(0);
    expect(ipLevel('weird')).toBe(0);
  });

  it('catalog has unique ids and SKUs', () => {
    const ids = new Set(PRODUCT_CATALOG.map((p) => p.id));
    const skus = new Set(PRODUCT_CATALOG.map((p) => p.sku));
    expect(ids.size).toBe(PRODUCT_CATALOG.length);
    expect(skus.size).toBe(PRODUCT_CATALOG.length);
  });

  it('no catalogue entry claims to be verified before QLS validates it', () => {
    expect(PRODUCT_CATALOG.every((p) => p.verified !== true)).toBe(true);
  });

  it('light sources have positive lumens; kit parts do not emit light', () => {
    PRODUCT_CATALOG.forEach((p) => {
      if (isLightSource(p)) expect(p.lumens).toBeGreaterThan(0);
      else expect(p.lumens).toBe(0);
    });
  });

  it('matchesCct honours tunable ranges and the ±300K tolerance', () => {
    expect(matchesCct(mk({ cctKelvin: 3000 }), 2700)).toBe(true);
    expect(matchesCct(mk({ cctKelvin: 3000 }), 4000)).toBe(false);
    expect(matchesCct(mk({ cctKelvin: 3000, cctRange: [2700, 6500] }), 5000)).toBe(true);
  });
});

describe('recommendRoomLighting', () => {
  it('returns three tiers with quantities and justifications', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'kitchen' });
    (['recommended', 'premium', 'budget'] as const).forEach((tier) => {
      expect(r.recommendedProducts[tier].quantity).toBeGreaterThanOrEqual(1);
      expect(r.justifications[tier].length).toBeGreaterThan(0);
    });
  });

  it('does not exceed catalogue-driven result shape: preliminary assumptions and gaps are always present', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'kitchen' });
    expect(r.assumptions.length).toBeGreaterThan(0);
    expect(r.missingInfo.join(' ')).toMatch(/formal proposal/i);
  });

  it('achieves the target lux for each tier (N rounded up)', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'living_room' });
    (['recommended', 'premium', 'budget'] as const).forEach((tier) => {
      expect(r.recommendedProducts[tier].luxAchieved).toBeGreaterThanOrEqual(r.targetLux);
    });
  });

  it('only recommends IP44+ products for bathrooms', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'bathroom' });
    (['recommended', 'premium', 'budget'] as const).forEach((tier) => {
      expect(ipLevel(r.recommendedProducts[tier].product.ipRating)).toBeGreaterThanOrEqual(44);
    });
  });

  it('only recommends IP65+ products outdoors', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'outdoor_patio' });
    (['recommended', 'premium', 'budget'] as const).forEach((tier) => {
      expect(ipLevel(r.recommendedProducts[tier].product.ipRating)).toBeGreaterThanOrEqual(65);
    });
  });

  it('honours a user-required IP rating', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'living_room', preferences: { minIP: 'IP65' } });
    expect(ipLevel(r.recommendedProducts.recommended.product.ipRating)).toBeGreaterThanOrEqual(65);
  });

  it('filters by colour temperature', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'bedroom', preferences: { cct: 2700 } });
    expect(matchesCct(r.recommendedProducts.recommended.product, 2700)).toBe(true);
  });

  it('low-glare only picks products with published UGR ≤ 19', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'home_office', preferences: { lowGlare: true, cct: 4000 } });
    (['recommended', 'premium', 'budget'] as const).forEach((tier) => {
      const ugr = r.recommendedProducts[tier].product.ugr;
      expect(ugr).toBeDefined();
      expect(ugr as number).toBeLessThanOrEqual(19);
    });
  });

  it('continuous preference picks strips/neon/washers/linear', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'living_room', preferences: { sourceKind: 'continuous' } });
    expect(['strip', 'neon', 'wallwasher', 'linear']).toContain(r.recommendedProducts.recommended.product.category);
  });

  it('warns that continuous LED is supplementary light', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'living_room', preferences: { sourceKind: 'continuous' } });
    expect(r.warnings.join(' ')).toMatch(/supplementary|indirect/i);
  });

  it('general lighting excludes continuous sources by default', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'kitchen' });
    expect(['strip', 'neon', 'wallwasher']).not.toContain(r.recommendedProducts.recommended.product.category);
  });

  it('never invents UGR claims: no UGR line for products without UGR data', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'living_room', preferences: { sourceKind: 'continuous' } });
    const p = r.recommendedProducts.recommended.product;
    if (p.ugr === undefined) {
      expect(r.justifications.recommended.join(' ')).not.toMatch(/UGR/);
    }
  });

  it('relaxes filters explicitly (with a warning) when nothing matches', () => {
    const only = [mk({ id: 'a', ipRating: 'IP20' })];
    const r = recommendRoomLighting({ ...base, roomType: 'outdoor_patio', catalog: only });
    expect(r.warnings.join(' ')).toMatch(/IP65/);
    expect(r.recommendedProducts.recommended.product.id).toBe('a');
  });

  it('does not fake differentiation with a single-product catalogue', () => {
    const only = [mk({ id: 'a' })];
    const r = recommendRoomLighting({ ...base, roomType: 'living_room', catalog: only });
    expect(r.recommendedProducts.premium.product.id).toBe('a');
    expect(r.justifications.premium[0]).toMatch(/No distinct alternative/);
  });

  it('keeps tiers distinct when the catalogue has enough candidates', () => {
    const cat = [
      mk({ id: 'a', cri: 90, basePrice: 40 }),
      mk({ id: 'b', cri: 97, basePrice: 90 }),
      mk({ id: 'c', cri: 80, basePrice: 20 }),
    ];
    const r = recommendRoomLighting({ ...base, roomType: 'living_room', catalog: cat, preferences: { cct: 3000 } });
    const ids = [
      r.recommendedProducts.recommended.product.id,
      r.recommendedProducts.premium.product.id,
      r.recommendedProducts.budget.product.id,
    ];
    expect(new Set(ids).size).toBe(3);
    expect(r.recommendedProducts.premium.product.id).toBe('b'); // highest CRI
    expect(r.recommendedProducts.budget.product.id).toBe('c'); // lowest cost
  });

  it('budget tier is never more expensive than the premium tier', () => {
    const r = recommendRoomLighting({ ...base, roomType: 'living_room' });
    expect(r.recommendedProducts.budget.totalCost).toBeLessThanOrEqual(r.recommendedProducts.premium.totalCost);
  });
});

describe('resolveGuidedPreferences', () => {
  it('maps the "cozy" intent to 2700K and explains it', () => {
    const g = resolveGuidedPreferences('bedroom', 'cozy');
    expect(g.preferences.cct).toBe(2700);
    expect(g.preferences.mode).toBe('guided');
    expect(g.explanation.join(' ')).toMatch(/2700K/);
  });

  it('explains the wet-area IP requirement for bathrooms', () => {
    const g = resolveGuidedPreferences('bathroom', 'elegant');
    expect(g.explanation.join(' ')).toMatch(/IP44/);
  });

  it('enables low glare for the "comfort" intent', () => {
    expect(resolveGuidedPreferences('home_office', 'comfort').preferences.lowGlare).toBe(true);
  });

  it('prefers continuous sources for the "continuous" intent', () => {
    expect(resolveGuidedPreferences('living_room', 'continuous').preferences.sourceKind).toBe('continuous');
  });

  it('falls back to a safe default for unknown intents', () => {
    expect(resolveGuidedPreferences('kitchen', 'unknown').preferences.cct).toBe(3000);
  });

  it('every intent resolves to a valid recommendation', () => {
    GUIDED_INTENTS.forEach((i) => {
      const { preferences } = resolveGuidedPreferences('living_room', i.id);
      const r = recommendRoomLighting({ ...base, roomType: 'living_room', preferences });
      expect(r.recommendedProducts.recommended.quantity).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('buildKit (strip + profile + driver + control)', () => {
  const byId = (id: string) => PRODUCT_CATALOG.find((p) => p.id === id) as Product;

  it('sizes the driver with 20% headroom and a matching profile for a COB strip', () => {
    const kit = buildKit(byId('led-cob-24v-10w'), 6);
    expect(kit.totalLoadWatts).toBe(60);
    expect(kit.requiredDriverWatts).toBe(72);
    const driver = kit.lines.find((l) => l.role === 'driver');
    expect(driver?.product.maxWatts).toBeGreaterThanOrEqual(72);
    expect(driver?.quantity).toBe(1);
    const profile = kit.lines.find((l) => l.role === 'profile');
    expect(profile?.quantity).toBe(3); // 6 m / 2 m
    expect(kit.complete).toBe(true);
  });

  it('warns about runs over 5 m at 24 V', () => {
    expect(buildKit(byId('led-cob-24v-10w'), 6).warnings.join(' ')).toMatch(/5 m/);
    expect(buildKit(byId('led-cob-24v-10w'), 4).warnings.join(' ')).not.toMatch(/exceeds/);
  });

  it('requires a CCT controller and a DALI driver for tunable white', () => {
    const kit = buildKit(byId('led-tw-24v-14w'), 4);
    const control = kit.lines.find((l) => l.role === 'control');
    expect(control?.required).toBe(true);
    expect(control?.product.name).toMatch(/CCT/i);
    expect(kit.lines.find((l) => l.role === 'driver')?.product.dimmingType).toBe('dali');
  });

  it('uses several drivers when the load exceeds the largest unit', () => {
    const kit = buildKit(byId('led-cob-24v-10w'), 20, { dimming: 'triac' });
    // 200 W load → 240 W required; largest triac driver is 100 W → 3 units
    const driver = kit.lines.find((l) => l.role === 'driver');
    expect(driver?.product.maxWatts).toBe(100);
    expect(driver?.quantity).toBe(3);
  });

  it('flags missing required parts instead of silently omitting them', () => {
    const noDrivers = PRODUCT_CATALOG.filter((p) => p.category !== 'driver');
    const kit = buildKit(byId('led-cob-24v-10w'), 4, { catalog: noDrivers });
    expect(kit.complete).toBe(false);
    expect(kit.missing.join(' ')).toMatch(/driver/i);
  });

  it('flags a missing profile when none fits the strip width', () => {
    const wide = { ...byId('led-cob-24v-10w'), widthMm: 40 };
    const kit = buildKit(wide, 4);
    expect(kit.complete).toBe(false);
    expect(kit.missing.join(' ')).toMatch(/profile/i);
  });

  it('neon/wall-washer need a driver but no aluminium profile', () => {
    const kit = buildKit(byId('led-neon-24v-10w'), 3);
    expect(kit.lines.some((l) => l.role === 'profile')).toBe(false);
    expect(kit.lines.some((l) => l.role === 'driver')).toBe(true);
  });

  it('point sources (downlights) need no kit', () => {
    const kit = buildKit(byId('prod-dl-1'), 6);
    expect(kit.lines).toHaveLength(0);
    expect(kit.complete).toBe(true);
  });

  it('returns an empty kit for zero length', () => {
    expect(buildKit(byId('led-cob-24v-10w'), 0).lines).toHaveLength(0);
  });

  it('kitSubtotal sums line subtotals', () => {
    const kit = buildKit(byId('led-cob-24v-10w'), 6);
    const expected = Math.round(kit.lines.reduce((a, l) => a + l.subtotal, 0) * 100) / 100;
    expect(kitSubtotal(kit.lines)).toBe(expected);
    expect(kitSubtotal(undefined)).toBe(0);
  });
});
