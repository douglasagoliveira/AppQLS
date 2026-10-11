/**
 * Script de inicialização e Seed automático para o Supabase
 * Executa o seed de todos os produtos do catálogo para a tabela 'products'
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis do .env se existirem
const envPath = path.join(__dirname, '..', '.env');
let supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      if (key === 'EXPO_PUBLIC_SUPABASE_URL') supabaseUrl = val;
      if (key === 'EXPO_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = val;
    }
  });
}

if (!supabaseUrl || supabaseUrl.includes('your-project') || !supabaseKey || supabaseKey.includes('your-anon-key')) {
  console.log('⚠️ As credenciais do Supabase ainda não foram configuradas no arquivo .env.');
  console.log('Por favor, informe a URL e a Anon Key do seu projeto.');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PRODUCTS_SEED = [
  {
    id: 'prod-dl-1',
    sku: 'QLS-DL90-12W-3K',
    name: 'Aero Recessed Architectural Downlight 12W',
    category: 'downlight',
    mounting_type: 'recessed',
    lumens: 1050,
    power_watts: 12,
    cct_kelvin: 3000,
    cri: 92,
    beam_angle: 38,
    ip_rating: 'IP44',
    dimming_type: 'triac',
    finishes: ['Matt White', 'Matt Black', 'Brushed Chrome'],
    base_price: 42.00,
    image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    datasheet_pdf_url: 'https://qlslighting.com.au/specs/QLS-DL90-12W.pdf',
    description: 'High-efficacy 90mm cut-out recessed architectural downlight with deep baffle anti-glare design (UGR < 19). Standard for Australian residential & boutique commercial spaces.',
    tier: 'recommended',
    is_active: true
  },
  {
    id: 'prod-dl-2',
    sku: 'QLS-DL90-PRO-15W-CRI97',
    name: 'Vortex Pro Darklight Downlight 15W (CRI 97+)',
    category: 'downlight',
    mounting_type: 'recessed',
    lumens: 1350,
    power_watts: 15,
    cct_kelvin: 2700,
    cri: 97,
    beam_angle: 36,
    ip_rating: 'IP54',
    dimming_type: 'dali',
    finishes: ['Textured Black / Gold Baffle', 'Matt White / Black Baffle', 'Custom Powdercoat'],
    base_price: 78.00,
    image_url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500&q=80',
    datasheet_pdf_url: 'https://qlslighting.com.au/specs/QLS-DL90-PRO.pdf',
    description: 'Ultra-premium architectural fixture with TruColor 97+ rendering, magnetic interchangeable baffles, and flicker-free DALI-2 integration.',
    tier: 'premium',
    is_active: true
  },
  {
    id: 'prod-dl-3',
    sku: 'QLS-ECO-10W-3CCT',
    name: 'Swift Eco Downlight 10W (Tri-Colour Switchable)',
    category: 'downlight',
    mounting_type: 'recessed',
    lumens: 850,
    power_watts: 10,
    cct_kelvin: 3000,
    cri: 82,
    beam_angle: 60,
    ip_rating: 'IP44',
    dimming_type: 'triac',
    finishes: ['Matt White', 'Matt Black Ring'],
    base_price: 24.50,
    image_url: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=500&q=80',
    datasheet_pdf_url: 'https://qlslighting.com.au/specs/QLS-ECO-10W.pdf',
    description: 'Value-engineered trade downlight with DIP switch (3000K/4000K/5700K) and fast-fit plug & lead.',
    tier: 'budget',
    is_active: true
  },
  {
    id: 'prod-out-1',
    sku: 'QLS-MARINA-IP65-12W',
    name: 'Marina Coastal IP65 Downlight 12W',
    category: 'outdoor',
    mounting_type: 'recessed',
    lumens: 980,
    power_watts: 12,
    cct_kelvin: 3000,
    cri: 90,
    beam_angle: 45,
    ip_rating: 'IP65',
    dimming_type: 'triac',
    finishes: ['Marine Grade Matt White', 'Marine Grade Matt Black', 'Solid Brass'],
    base_price: 58.00,
    image_url: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=500&q=80',
    datasheet_pdf_url: 'https://qlslighting.com.au/specs/QLS-MARINA-IP65.pdf',
    description: 'Corrosion-resistant marine anodized housing certified for Australian coastal conditions and shower recesses.',
    tier: 'recommended',
    is_active: true
  },
  {
    id: 'prod-out-2',
    sku: 'QLS-OCEAN-IP67-PRO',
    name: 'Oceania Pro IP67 Surface Mount Cylinder 18W',
    category: 'outdoor',
    mounting_type: 'surface',
    lumens: 1600,
    power_watts: 18,
    cct_kelvin: 3000,
    cri: 92,
    beam_angle: 30,
    ip_rating: 'IP67',
    dimming_type: '0-10v',
    finishes: ['Raw Corten', 'Architectural Black', 'Graphite Grey'],
    base_price: 110.00,
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80',
    datasheet_pdf_url: 'https://qlslighting.com.au/specs/QLS-OCEAN-PRO.pdf',
    description: 'Solid machined 6063 aluminium exterior architectural cylinder with IK08 impact resistance.',
    tier: 'premium',
    is_active: true
  },
  {
    id: 'prod-lin-1',
    sku: 'QLS-LINEA-75-30W-1200',
    name: 'Linea Architectural Suspended/Surface Linear 1200mm (30W)',
    category: 'linear',
    mounting_type: 'suspended',
    lumens: 3200,
    power_watts: 30,
    cct_kelvin: 4000,
    cri: 88,
    beam_angle: 90,
    ip_rating: 'IP20',
    dimming_type: 'dali',
    finishes: ['Matt Black', 'Matt White', 'Anodized Silver'],
    base_price: 135.00,
    image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80',
    datasheet_pdf_url: 'https://qlslighting.com.au/specs/QLS-LINEA-75.pdf',
    description: 'Sleek 75mm profile direct continuous linear system with micro-prismatic diffuser for glare-free commercial and office spaces.',
    tier: 'recommended',
    is_active: true
  },
  {
    id: 'prod-lin-2',
    sku: 'QLS-LINEA-PRO-50W-UPDOWN',
    name: 'Linea Lux Direct/Indirect Up-Down Linear 1500mm (50W)',
    category: 'linear',
    mounting_type: 'suspended',
    lumens: 5200,
    power_watts: 50,
    cct_kelvin: 4000,
    cri: 92,
    beam_angle: 110,
    ip_rating: 'IP20',
    dimming_type: 'dali',
    finishes: ['Textured Black', 'Natural Anodized', 'Custom RAL'],
    base_price: 220.00,
    image_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&q=80',
    datasheet_pdf_url: 'https://qlslighting.com.au/specs/QLS-LINEA-PRO.pdf',
    description: 'Dual-circuit 70% down / 30% up illumination with tuneable white options and smart sensor integration.',
    tier: 'premium',
    is_active: true
  },
  {
    id: 'prod-trk-1',
    sku: 'QLS-TRACK-SPOT-20W-CRI95',
    name: 'Focus 3-Circuit Track Spotlight 20W (CRI 95+)',
    category: 'track',
    mounting_type: 'track',
    lumens: 1850,
    power_watts: 20,
    cct_kelvin: 3000,
    cri: 95,
    beam_angle: 24,
    ip_rating: 'IP20',
    dimming_type: 'triac',
    finishes: ['Matt Black', 'Matt White'],
    base_price: 65.00,
    image_url: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500&q=80',
    datasheet_pdf_url: 'https://qlslighting.com.au/specs/QLS-TRACK-SPOT.pdf',
    description: 'Universal 3-circuit track luminaire with high-efficacy COB LED and 355° rotation / 90° tilt for retail and art galleries.',
    tier: 'recommended',
    is_active: true
  }
];

async function seed() {
  console.log('🚀 Iniciando conexão com o Supabase...');
  try {
    const { data, error } = await supabase
      .from('products')
      .upsert(PRODUCTS_SEED, { onConflict: 'sku' });

    if (error) {
      console.error('❌ Erro ao sincronizar catálogo:', error.message);
    } else {
      console.log('✅ Catálogo oficial QLS sincronizado com sucesso no Supabase!');
    }
  } catch (err) {
    console.error('❌ Falha na execução:', err.message);
  }
}

seed();
