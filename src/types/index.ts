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

/** Categorias de luminárias/fontes de luz (entram no cálculo de lux). */
export type LightSourceCategory =
  | 'downlight'
  | 'linear'
  | 'track'
  | 'panel'
  | 'spotlight'
  | 'outdoor'
  | 'strip'
  | 'neon'
  | 'wallwasher';

/** Categorias de componentes do kit (não geram lux, mas são necessários à instalação). */
export type KitCategory = 'profile' | 'driver' | 'control';

export type ProductCategory = LightSourceCategory | KitCategory;

export type DimmingType = 'none' | 'triac' | 'dali' | '0-10v' | 'pwm';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  mountingType: 'recessed' | 'surface' | 'suspended' | 'track';
  /** Fluxo luminoso por unidade comercial (por peça, ou por metro quando unit = 'm'). */
  lumens: number;
  /** Potência por unidade comercial (W por peça ou W por metro). */
  powerWatts: number;
  cctKelvin: number;
  /** Faixa de CCT ajustável (Tunable White). */
  cctRange?: [number, number];
  cri: number;
  beamAngle: number;
  ipRating: string;
  dimmingType: DimmingType;
  finishes: string[];
  /** Preço indicativo por unidade comercial (AUD). O valor final vem da proposta formal da QLS. */
  basePrice: number;
  imageUrl: string;
  datasheetUrl?: string;
  description: string;
  tier?: ProductTier;

  /** Unidade comercial: peça ('pc') ou metro ('m'). Padrão: 'pc'. */
  unit?: 'pc' | 'm';
  brand?: string;
  /** Tensão de operação (V) — fitas e drivers devem coincidir. */
  voltage?: number;
  /** UGR (apenas quando houver dado confiável). */
  ugr?: number;
  /** Largura da PCB da fita (mm) — fitas — ou largura interna máxima (mm) — perfis. */
  widthMm?: number;
  /** Comprimento comercial do perfil (m). */
  lengthM?: number;
  /** Capacidade máxima do driver (W). */
  maxWatts?: number;
  /** Link da página do fabricante (referência do produto). */
  sourceUrl?: string;
  /** true somente quando SKU/specs foram validados com a QLS. */
  verified?: boolean;
}

export interface TierResult {
  product: Product;
  quantity: number;
  totalLumens: number;
  luxAchieved: number;
  totalCost: number;
}

export interface RoomPreferences {
  /** Modo de entrada usado no wizard. */
  mode: 'guided' | 'professional';
  /** CCT desejada (K). */
  cct: number;
  /** Exigir baixo ofuscamento (UGR < 19). */
  lowGlare: boolean;
  /** IP mínimo exigido pelo usuário (ex.: 'IP44', 'IP65'). */
  minIP?: string;
  /** Tipo de fonte preferida. */
  sourceKind: 'any' | 'point' | 'continuous';
  /** Efeito/intenção descrita no modo guiado (apenas para exibição). */
  intent?: string;
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
  utilizationFactor: number;
  maintenanceFactor: number;
  recommendedProducts: Record<ProductTier, TierResult>;
  /** Justificativas por tier, geradas exclusivamente a partir de dados do produto. */
  justifications: Record<ProductTier, string[]>;
  /** Premissas do cálculo — exibidas ao usuário (estimativa preliminar). */
  assumptions: string[];
  /** Alertas técnicos (ex.: filtros relaxados, fita como luz de apoio). */
  warnings: string[];
  /** Informações que o cálculo não considerou e a QLS validará. */
  missingInfo: string[];
  preferences?: RoomPreferences;
}

/** Linha do kit (perfil / driver / controle) vinculada a um item de ambiente. */
export interface KitSelection {
  role: KitCategory;
  required: boolean;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  note?: string;
}

export interface SelectedRoomItem {
  id: string;
  roomId?: string;
  product: Product;
  quantity: number;
  selectedFinish: string;
  tierType: ProductTier;
  unitPrice: number;
  subtotal: number;
  luxAchieved: number;
  /** Componentes complementares (perfil, driver, controle). */
  kit?: KitSelection[];
  /** Componentes obrigatórios ainda não definidos (alerta no RFQ). */
  kitMissing?: string[];
}

export interface Room {
  id: string;
  projectId: string;
  name: string;
  roomType: RoomType;
  length: number;
  width: number;
  height: number;
  ceilingType?: string;
  targetLux: number;
  requiredLumens: number;
  selectedItem?: SelectedRoomItem | null;
  calculation?: RoomCalculationResult;
  createdAt: string;
}

export type ProjectStatus = 'draft' | 'pending_send' | 'submitted' | 'under_review' | 'quoted';

export interface RfqRecord {
  code: string;
  projectId: string;
  projectName: string;
  status: 'queued' | 'sent';
  pieceCount?: number;
  itemsCount?: number;
  estimatedTotal?: number;
  contact?: unknown;
  submittedAt: string;
  contactChannel?: 'email' | 'whatsapp';
  notes?: string;
}

export interface Project {
  id: string;
  userId?: string;
  projectName: string;
  clientName?: string;
  projectAddress?: string;
  status: ProjectStatus;
  rooms: Room[];
  /** Itens avulsos adicionados direto do catálogo (sem cálculo de ambiente). */
  additionalItems: SelectedRoomItem[];
  totalFixturesCount: number;
  totalPowerWatts: number;
  totalEstimatedCost: number;
  /** Protocolo do último RFQ enviado/enfileirado. */
  rfqCode?: string;
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

export type AiPlanMode = 'existing_plan' | 'architectural_from_scratch';

export interface AiDetectedProduct {
  sku: string;
  name: string;
  quantity: number;
  unit: 'pc' | 'm';
  reason?: string;
  category?: ProductCategory;
}

export interface AiDetectedRoom {
  id: string;
  roomName: string;
  roomType: RoomType;
  length: number;
  width: number;
  height: number;
  ceilingType?: string;
  targetLux: number;
  existingNotes?: string;
  includeLinearStrip?: boolean;
  linearMeters?: number;
  suggestedProducts: AiDetectedProduct[];
  selectedProductTier: ProductTier;
  calculationResult?: RoomCalculationResult;
  selectedItem?: SelectedRoomItem | null;
}

export interface AiAnalysisResult {
  mode: AiPlanMode;
  fileName: string;
  summary: string;
  rooms: AiDetectedRoom[];
  warnings?: string[];
}

