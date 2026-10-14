import { RoomType } from '../types';
import { AUSTRALIAN_LIGHTING_STANDARDS } from './standards';

export const DEFAULT_MAINTENANCE_FACTOR = 0.8; // d (PROJECT_SPEC §4.2)
export const DEFAULT_WORKING_PLANE = 0.8; // m
export const DEFAULT_CEILING_HEIGHT = 2.7; // m

/** Limites aceitos pelo wizard (m). Evita entradas absurdas e divisões por zero. */
export const DIMENSION_LIMITS = {
  length: { min: 1, max: 50 },
  width: { min: 1, max: 50 },
  height: { min: 2, max: 12 },
} as const;

export interface CalculationInput {
  roomType: RoomType;
  length: number; // in meters
  width: number; // in meters
  height?: number; // in meters (default 2.7m)
  workingPlaneHeight?: number; // default 0.8m for tables/desks
  lightLossFactor?: number; // d — default 0.80 maintenance factor
  /** μ — se omitido, é estimado a partir do índice do recinto K (faixa 0,60–0,75). */
  utilizationFactor?: number;
}

export interface CalculationOutput {
  areaM2: number;
  roomIndexK: number;
  targetLux: number;
  totalLumensRequired: number;
  utilizationFactor: number;
  maintenanceFactor: number;
  standardInfo: typeof AUSTRALIAN_LIGHTING_STANDARDS[RoomType];
}

export interface DimensionValidation {
  valid: boolean;
  errors: string[];
}

/** Valida C × L × H contra os limites do app. */
export function validateDimensions(length: number, width: number, height: number): DimensionValidation {
  const errors: string[] = [];
  const check = (label: string, v: number, lim: { min: number; max: number }) => {
    if (!Number.isFinite(v)) errors.push(`${label} must be a number.`);
    else if (v < lim.min || v > lim.max) errors.push(`${label} must be between ${lim.min} m and ${lim.max} m.`);
  };
  check('Length', length, DIMENSION_LIMITS.length);
  check('Width', width, DIMENSION_LIMITS.width);
  check('Ceiling height', height, DIMENSION_LIMITS.height);
  return { valid: errors.length === 0, errors };
}

/**
 * Estima o fator de utilização μ a partir do índice do recinto K.
 * Recintos "achatados" (K alto) aproveitam melhor o fluxo. Mantido dentro da faixa
 * 0,60–0,75 definida em PROJECT_SPEC §4.2. É uma estimativa — refletâncias não são modeladas.
 */
export function estimateUtilizationFactor(roomIndexK: number): number {
  if (roomIndexK < 1) return 0.6;
  if (roomIndexK < 2) return 0.65;
  if (roomIndexK < 3) return 0.7;
  return 0.75;
}

/**
 * Calculates Room Index (K), Required Total Lumens and Target Lux
 * based on Lumen Method (Luminous Flux Method) / AS/NZS 1680
 */
export function calculateRoomLighting(input: CalculationInput): CalculationOutput {
  const {
    roomType,
    length,
    width,
    height = DEFAULT_CEILING_HEIGHT,
    workingPlaneHeight = DEFAULT_WORKING_PLANE,
    lightLossFactor = DEFAULT_MAINTENANCE_FACTOR,
  } = input;

  const areaM2 = Math.round(length * width * 100) / 100;
  const mountingHeightAboveWorkingPlane = Math.max(0.5, height - workingPlaneHeight);

  // Room Index K = (L * W) / (Hm * (L + W))
  const roomIndexK =
    Math.round(((length * width) / (mountingHeightAboveWorkingPlane * (length + width))) * 100) / 100;

  const utilizationFactor = input.utilizationFactor ?? estimateUtilizationFactor(roomIndexK);

  const standardInfo = AUSTRALIAN_LIGHTING_STANDARDS[roomType] || AUSTRALIAN_LIGHTING_STANDARDS.living_room;
  const targetLux = standardInfo.targetLux;

  // Total Lumens = (Target Lux * Area) / (Utilization Factor * Light Loss Factor)
  const totalLumensRequired = Math.round((targetLux * areaM2) / (utilizationFactor * lightLossFactor));

  return {
    areaM2,
    roomIndexK,
    targetLux,
    totalLumensRequired,
    utilizationFactor,
    maintenanceFactor: lightLossFactor,
    standardInfo,
  };
}

/** Iluminância média resultante: E = (Φ × μ × d) / A. */
export function calculateLuxAchieved(
  totalLumens: number,
  areaM2: number,
  utilizationFactor: number,
  maintenanceFactor: number = DEFAULT_MAINTENANCE_FACTOR
): number {
  if (areaM2 <= 0 || totalLumens <= 0) return 0;
  return Math.round((totalLumens * utilizationFactor * maintenanceFactor) / areaM2);
}

/**
 * Calculates number of units (pieces or metres) required for a given product
 * N = ceil(Φ_total / Φ_unit)
 */
export function calculateFixtureCount(
  totalLumensRequired: number,
  fixtureLumens: number,
  areaM2: number,
  utilizationFactor = 0.65,
  maintenanceFactor = DEFAULT_MAINTENANCE_FACTOR
): { quantity: number; totalLumens: number; luxAchieved: number } {
  if (fixtureLumens <= 0) {
    return { quantity: 1, totalLumens: 0, luxAchieved: 0 };
  }

  const quantity = Math.max(1, Math.ceil(totalLumensRequired / fixtureLumens));
  const totalLumens = quantity * fixtureLumens;
  const luxAchieved = calculateLuxAchieved(totalLumens, areaM2, utilizationFactor, maintenanceFactor);

  return { quantity, totalLumens, luxAchieved };
}

/** Densidade de potência instalada (W/m²). */
export function calculatePowerDensity(totalWatts: number, areaM2: number): number {
  if (areaM2 <= 0) return 0;
  return Math.round((totalWatts / areaM2) * 10) / 10;
}
