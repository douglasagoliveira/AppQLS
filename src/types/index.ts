export type RoomType =
  | 'kitchen'
  | 'living_room'
  | 'dining_room'
  | 'bedroom'
  | 'bathroom'
  | 'home_office'
  | 'outdoor_patio'
  | 'commercial_office'
  | 'retail'
  | 'warehouse';

export interface RoomStandard {
  type: RoomType;
  label: string;
  targetLux: number; // AS/NZS 1680 standard lux
  minLux: number;
  recommendedCCT: number; // in Kelvin, e.g. 3000K
  minCRI: number; // e.g. 80 or 90
  minIPRating: string; // e.g. "IP20", "IP44", "IP65"
  description: string;
}

export type ProductTier = 'recommended' | 'premium' | 'budget';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'downlight' | 'linear' | 'track' | 'panel' | 'spotlight' | 'outdoor';
  mountingType: 'recessed' | 'surface' | 'suspended' | 'track';
  lumens: number;
  powerWatts: number;
  cctKelvin: number;
  cri: number;
  beamAngle: number;
  ipRating: string;
  dimmingType: 'none' | 'triac' | 'dali' | '0-10v';
  finishes: string[];
  basePrice: number;
  imageUrl: string;
  datasheetUrl?: string;
  description: string;
  tier?: ProductTier;
}

export interface RoomCalculationResult {
  roomType: RoomType;
  roomName: string;
  dimensions: {
    length: number; // meters
    width: number; // meters
    height: number; // meters
  };
  areaM2: number;
  targetLux: number;
  totalLumensRequired: number;
  roomIndexK: number;
  recommendedProducts: {
    recommended: { product: Product; quantity: number; totalLumens: number; luxAchieved: number };
    premium: { product: Product; quantity: number; totalLumens: number; luxAchieved: number };
    budget: { product: Product; quantity: number; totalLumens: number; luxAchieved: number };
  };
}

export interface SelectedRoomItem {
  id: string;
  roomId: string;
  product: Product;
  quantity: number;
  selectedFinish: string;
  tierType: ProductTier;
  unitPrice: number;
  subtotal: number;
  luxAchieved: number;
}

export interface Room {
  id: string;
  projectId: string;
  name: string;
  roomType: RoomType;
  length: number;
  width: number;
  height: number;
  targetLux: number;
  requiredLumens: number;
  selectedItem?: SelectedRoomItem;
  calculation?: RoomCalculationResult;
  createdAt: string;
}

export interface Project {
  id: string;
  userId?: string;
  projectName: string;
  clientName?: string;
  projectAddress?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'quoted';
  rooms: Room[];
  totalFixturesCount: number;
  totalPowerWatts: number;
  totalEstimatedCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  companyName?: string;
  phone?: string;
  userType: 'architect' | 'electrician' | 'designer' | 'builder' | 'homeowner' | 'other';
}
