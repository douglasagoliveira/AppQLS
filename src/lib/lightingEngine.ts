import { RoomType } from '../types';
import { AUSTRALIAN_LIGHTING_STANDARDS } from './standards';

export interface CalculationInput {
  roomType: RoomType;
  length: number; // in meters
  width: number; // in meters
  height?: number; // in meters (default 2.7m)
  workingPlaneHeight?: number; // default 0.8m for tables/desks, 0m for floor
  lightLossFactor?: number; // default 0.80 maintenance factor
  utilizationFactor?: number; // default 0.65 for typical clean room
}

export interface CalculationOutput {
  areaM2: number;
  roomIndexK: number;
  targetLux: number;
  totalLumensRequired: number;
  standardInfo: typeof AUSTRALIAN_LIGHTING_STANDARDS[RoomType];
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
    height = 2.7,
    workingPlaneHeight = 0.8,
    lightLossFactor = 0.8,
    utilizationFactor = 0.65,
  } = input;

  const areaM2 = Math.round(length * width * 100) / 100;
  const mountingHeightAboveWorkingPlane = Math.max(0.5, height - workingPlaneHeight);

  // Room Index K = (L * W) / (Hm * (L + W))
  const roomIndexK =
    Math.round(
      ((length * width) / (mountingHeightAboveWorkingPlane * (length + width))) * 100
    ) / 100;

  const standardInfo = AUSTRALIAN_LIGHTING_STANDARDS[roomType] || AUSTRALIAN_LIGHTING_STANDARDS.living_room;
  const targetLux = standardInfo.targetLux;

  // Total Lumens = (Target Lux * Area) / (Utilization Factor * Light Loss Factor)
  const totalLumensRequired = Math.round((targetLux * areaM2) / (utilizationFactor * lightLossFactor));

  return {
    areaM2,
    roomIndexK,
    targetLux,
    totalLumensRequired,
    standardInfo,
  };
}

/**
 * Calculates number of fixtures required for a given product
 */
export function calculateFixtureCount(
  totalLumensRequired: number,
  fixtureLumens: number,
  areaM2: number
): { quantity: number; totalLumens: number; luxAchieved: number } {
  if (fixtureLumens <= 0) {
    return { quantity: 1, totalLumens: 0, luxAchieved: 0 };
  }

  // Minimum count based on lumens required
  let quantity = Math.ceil(totalLumensRequired / fixtureLumens);

  // Ensure reasonable minimum density for large rooms (at least 1 fixture per ~3-4 m² for downlights)
  if (quantity < 1) quantity = 1;

  const totalLumens = quantity * fixtureLumens;
  // Lux achieved = (totalLumens * 0.65 * 0.80) / areaM2
  const luxAchieved = Math.round((totalLumens * 0.65 * 0.8) / Math.max(1, areaM2));

  return {
    quantity,
    totalLumens,
    luxAchieved,
  };
}
