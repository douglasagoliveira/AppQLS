import {
  calculateFixtureCount,
  calculateLuxAchieved,
  calculatePowerDensity,
  calculateRoomLighting,
  DIMENSION_LIMITS,
  estimateUtilizationFactor,
  validateDimensions,
} from '../lib/lightingEngine';
import { AUSTRALIAN_LIGHTING_STANDARDS } from '../lib/standards';

describe('calculateRoomLighting (Lumen Method, AS/NZS 1680)', () => {
  it('computes area and room index K for a 4.5 × 3.2 × 2.7 m kitchen', () => {
    const r = calculateRoomLighting({ roomType: 'kitchen', length: 4.5, width: 3.2, height: 2.7 });
    expect(r.areaM2).toBe(14.4);
    // Hm = 2.7 − 0.8 = 1.9 → K = 14.4 / (1.9 × 7.7) = 0.984
    expect(r.roomIndexK).toBeCloseTo(0.98, 2);
  });

  it('computes Φ = (E × A) / (μ × d) with μ estimated from K', () => {
    const r = calculateRoomLighting({ roomType: 'kitchen', length: 4.5, width: 3.2, height: 2.7 });
    expect(r.targetLux).toBe(300);
    expect(r.utilizationFactor).toBe(0.6); // K < 1
    expect(r.maintenanceFactor).toBe(0.8);
    expect(r.totalLumensRequired).toBe(9000); // 300 × 14.4 / (0.6 × 0.8)
  });

  it('honours an explicit utilization factor override', () => {
    const r = calculateRoomLighting({
      roomType: 'kitchen',
      length: 4.5,
      width: 3.2,
      height: 2.7,
      utilizationFactor: 0.65,
    });
    expect(r.totalLumensRequired).toBe(8308); // 4320 / 0.52 → 8307.69
  });

  it('clamps the mounting height above the working plane to 0.5 m (very low ceilings)', () => {
    const r = calculateRoomLighting({ roomType: 'home_office', length: 4, width: 4, height: 0.9 });
    // Hm = max(0.5, 0.1) = 0.5 → K = 16 / (0.5 × 8) = 4
    expect(r.roomIndexK).toBe(4);
    expect(r.utilizationFactor).toBe(0.75);
  });

  it('lowers K for tall ceilings', () => {
    const r = calculateRoomLighting({ roomType: 'retail', length: 4, width: 4, height: 6 });
    expect(r.roomIndexK).toBeCloseTo(0.38, 2);
    expect(r.utilizationFactor).toBe(0.6);
  });

  it('falls back to living-room standard for unknown types', () => {
    const r = calculateRoomLighting({ roomType: 'nope' as any, length: 4, width: 4 });
    expect(r.targetLux).toBe(AUSTRALIAN_LIGHTING_STANDARDS.living_room.targetLux);
  });
});

describe('estimateUtilizationFactor', () => {
  it.each([
    [0.5, 0.6],
    [0.99, 0.6],
    [1, 0.65],
    [1.99, 0.65],
    [2, 0.7],
    [2.99, 0.7],
    [3, 0.75],
    [10, 0.75],
  ])('K=%p → μ=%p (always within the 0.60–0.75 spec range)', (k, mu) => {
    expect(estimateUtilizationFactor(k)).toBe(mu);
  });
});

describe('calculateFixtureCount / calculateLuxAchieved', () => {
  it('N = ceil(Φ_total / Φ_unit) and reports resulting lux', () => {
    const r = calculateFixtureCount(9000, 1050, 14.4, 0.6, 0.8);
    expect(r.quantity).toBe(9);
    expect(r.totalLumens).toBe(9450);
    expect(r.luxAchieved).toBe(315); // 9450 × 0.6 × 0.8 / 14.4
  });

  it('achieved lux meets the target whenever N is rounded up', () => {
    const calc = calculateRoomLighting({ roomType: 'living_room', length: 6, width: 4, height: 2.7 });
    const r = calculateFixtureCount(calc.totalLumensRequired, 900, calc.areaM2, calc.utilizationFactor, calc.maintenanceFactor);
    expect(r.luxAchieved).toBeGreaterThanOrEqual(calc.targetLux);
  });

  it('always returns at least one unit', () => {
    expect(calculateFixtureCount(10, 5000, 10).quantity).toBe(1);
  });

  it('guards against non-positive fixture lumens', () => {
    expect(calculateFixtureCount(1000, 0, 10)).toEqual({ quantity: 1, totalLumens: 0, luxAchieved: 0 });
    expect(calculateFixtureCount(1000, -5, 10).totalLumens).toBe(0);
  });

  it('returns 0 lux for zero area (no divide-by-zero)', () => {
    expect(calculateLuxAchieved(1000, 0, 0.65)).toBe(0);
    expect(calculateLuxAchieved(0, 10, 0.65)).toBe(0);
  });
});

describe('calculatePowerDensity', () => {
  it('returns W/m² rounded to 1 decimal', () => {
    expect(calculatePowerDensity(264, 62.4)).toBe(4.2);
  });
  it('returns 0 for zero area', () => {
    expect(calculatePowerDensity(100, 0)).toBe(0);
  });
});

describe('validateDimensions', () => {
  it('accepts values inside the limits', () => {
    expect(validateDimensions(4.5, 3.2, 2.7)).toEqual({ valid: true, errors: [] });
  });

  it('accepts the exact boundaries', () => {
    const { length, width, height } = DIMENSION_LIMITS;
    expect(validateDimensions(length.min, width.min, height.min).valid).toBe(true);
    expect(validateDimensions(length.max, width.max, height.max).valid).toBe(true);
  });

  it('rejects out-of-range and non-finite values with one error per field', () => {
    const r = validateDimensions(0, 51, NaN);
    expect(r.valid).toBe(false);
    expect(r.errors).toHaveLength(3);
  });

  it('rejects negative values', () => {
    expect(validateDimensions(-1, 3, 2.7).valid).toBe(false);
  });
});

describe('AS/NZS 1680 benchmark table (PROJECT_SPEC §4.1)', () => {
  const within = (type: keyof typeof AUSTRALIAN_LIGHTING_STANDARDS, min: number, max: number) => {
    const s = AUSTRALIAN_LIGHTING_STANDARDS[type];
    expect(s.targetLux).toBeGreaterThanOrEqual(min);
    expect(s.targetLux).toBeLessThanOrEqual(max);
  };

  it('keeps each target inside the range documented in the spec', () => {
    within('kitchen', 240, 300);
    within('living_room', 150, 200);
    within('bedroom', 100, 150);
    within('home_office', 320, 500);
    within('bathroom', 200, 300);
    within('outdoor_patio', 100, 150);
  });

  it('keeps minLux ≤ targetLux for every room type and keys consistent', () => {
    Object.entries(AUSTRALIAN_LIGHTING_STANDARDS).forEach(([key, s]) => {
      expect(s.type).toBe(key);
      expect(s.minLux).toBeLessThanOrEqual(s.targetLux);
    });
  });

  it('requires wet-area protection for bathrooms and outdoors', () => {
    expect(AUSTRALIAN_LIGHTING_STANDARDS.bathroom.minIPRating).toBe('IP44');
    expect(AUSTRALIAN_LIGHTING_STANDARDS.outdoor_patio.minIPRating).toBe('IP65');
  });
});
