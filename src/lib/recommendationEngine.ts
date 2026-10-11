import { Product, RoomCalculationResult, RoomType } from '../types';
import { calculateFixtureCount, calculateRoomLighting } from './lightingEngine';
import { FACTORY_CATALOG } from './mockCatalog';
import { AUSTRALIAN_LIGHTING_STANDARDS } from './standards';

export interface RecommendLightingParams {
  roomName: string;
  roomType: RoomType;
  length: number;
  width: number;
  height?: number;
  catalog?: Product[];
}

/**
 * Intelligent lighting recommendation engine:
 * Evaluates room parameters against AS/NZS 1680 standards,
 * filters matching factory products, and returns 3 tailored options (Recommended, Premium, Budget).
 */
export function recommendRoomLighting(params: RecommendLightingParams): RoomCalculationResult {
  const { roomName, roomType, length, width, height = 2.7, catalog = FACTORY_CATALOG } = params;

  // 1. Calculate lighting requirements
  const calc = calculateRoomLighting({
    roomType,
    length,
    width,
    height,
  });

  const standard = AUSTRALIAN_LIGHTING_STANDARDS[roomType] || AUSTRALIAN_LIGHTING_STANDARDS.living_room;

  // 2. Filter products matching minimum environment requirements (e.g. IP rating for outdoor/bathroom)
  let eligibleProducts = catalog.filter((p) => {
    if (standard.minIPRating === 'IP65') {
      return p.ipRating === 'IP65' || p.ipRating === 'IP67';
    }
    if (standard.minIPRating === 'IP44') {
      return p.ipRating === 'IP44' || p.ipRating === 'IP54' || p.ipRating === 'IP65' || p.ipRating === 'IP67';
    }
    return true;
  });

  if (eligibleProducts.length === 0) {
    eligibleProducts = catalog;
  }

  // 3. Find Best Recommended Product (Balance of CRI, efficiency, and aesthetics)
  const recommendedProd =
    eligibleProducts.find((p) => p.tier === 'recommended') || eligibleProducts[0];

  // 4. Find Premium Product (High CRI >= 92, DALI or advanced aesthetics)
  const premiumProd =
    eligibleProducts.find((p) => p.tier === 'premium' && p.id !== recommendedProd.id) ||
    eligibleProducts.find((p) => p.cri >= 92) ||
    recommendedProd;

  // 5. Find Budget Product (High value, commercial trade)
  const budgetProd =
    eligibleProducts.find(
      (p) => p.tier === 'budget' && p.id !== recommendedProd.id && p.id !== premiumProd.id
    ) ||
    eligibleProducts.find((p) => p.id !== recommendedProd.id) ||
    recommendedProd;

  // 6. Calculate fixture counts & lux for each tier
  const recommendedCalc = calculateFixtureCount(
    calc.totalLumensRequired,
    recommendedProd.lumens,
    calc.areaM2
  );
  const premiumCalc = calculateFixtureCount(
    calc.totalLumensRequired,
    premiumProd.lumens,
    calc.areaM2
  );
  const budgetCalc = calculateFixtureCount(
    calc.totalLumensRequired,
    budgetProd.lumens,
    calc.areaM2
  );

  return {
    roomName,
    roomType,
    dimensions: { length, width, height },
    areaM2: calc.areaM2,
    targetLux: calc.targetLux,
    totalLumensRequired: calc.totalLumensRequired,
    roomIndexK: calc.roomIndexK,
    recommendedProducts: {
      recommended: {
        product: recommendedProd,
        quantity: recommendedCalc.quantity,
        totalLumens: recommendedCalc.totalLumens,
        luxAchieved: recommendedCalc.luxAchieved,
      },
      premium: {
        product: premiumProd,
        quantity: premiumCalc.quantity,
        totalLumens: premiumCalc.totalLumens,
        luxAchieved: premiumCalc.luxAchieved,
      },
      budget: {
        product: budgetProd,
        quantity: budgetCalc.quantity,
        totalLumens: budgetCalc.totalLumens,
        luxAchieved: budgetCalc.luxAchieved,
      },
    },
  };
}
