-- ==============================================================================
-- QLS LIGHTING APP - FULL DATABASE SCHEMA & SEED FOR SUPABASE
-- Project ID: briefingqls-supabase
-- Project URL: https://rcmdstsewqhsjmlcydev.supabase.co
-- Standards: AS/NZS 1680 Compliant Lighting Specification
-- ==============================================================================

-- 1. Profiles Table (Architects, Engineers, Specifiers, Contractors)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  user_type TEXT DEFAULT 'architect',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table (QLS Australian Factory Catalog)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'downlight', 'linear', 'track', 'panel', 'outdoor'
  mounting_type TEXT NOT NULL, -- 'recessed', 'surface', 'suspended', 'track'
  lumens NUMERIC NOT NULL,
  power_watts NUMERIC NOT NULL,
  cct_kelvin INTEGER NOT NULL,
  cri INTEGER NOT NULL,
  beam_angle INTEGER NOT NULL,
  ip_rating TEXT NOT NULL DEFAULT 'IP20',
  dimming_type TEXT NOT NULL DEFAULT 'none',
  finishes TEXT[] NOT NULL DEFAULT '{"Matt White", "Matt Black"}',
  base_price NUMERIC(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  datasheet_pdf_url TEXT,
  description TEXT,
  tier TEXT DEFAULT 'recommended',
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Projects Table (Project specifications)
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  client_name TEXT,
  project_address TEXT,
  status TEXT DEFAULT 'draft' NOT NULL, -- 'draft', 'submitted', 'under_review', 'quoted'
  total_fixtures_count INTEGER DEFAULT 0,
  total_power_watts NUMERIC DEFAULT 0,
  total_estimated_cost NUMERIC(12, 2) DEFAULT 0,
  generated_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Rooms Table (Engineered Spaces by Room Type & Dimensions)
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  room_name TEXT NOT NULL,
  room_type TEXT NOT NULL,
  length_m NUMERIC(6, 2) NOT NULL,
  width_m NUMERIC(6, 2) NOT NULL,
  height_m NUMERIC(6, 2) NOT NULL DEFAULT 2.70,
  target_lux INTEGER NOT NULL,
  required_lumens NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Room Items (Selected Luminaires, Finishes & Quantities per Room)
CREATE TABLE IF NOT EXISTS public.room_items (
  id TEXT PRIMARY KEY DEFAULT ('item-' || floor(random() * 1000000000)::text),
  room_id TEXT REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE RESTRICT NOT NULL,
  tier_type TEXT NOT NULL, -- 'recommended', 'premium', 'budget'
  quantity INTEGER NOT NULL,
  selected_finish TEXT NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  lux_achieved INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RFQ Submissions Table (Factory Quote Inquiries)
CREATE TABLE IF NOT EXISTS public.rfq_submissions (
  id TEXT PRIMARY KEY DEFAULT ('rfq-' || floor(random() * 1000000000)::text),
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rfq_code TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'submitted' NOT NULL,
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Grant Permissions to anon and authenticated roles for Data API
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 8. Row-Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_submissions ENABLE ROW LEVEL SECURITY;

-- Products Policies: Public read for active fixtures, admin write
DROP POLICY IF EXISTS "Public read active products" ON public.products;
CREATE POLICY "Public read active products" ON public.products
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Service role manage products" ON public.products;
CREATE POLICY "Service role manage products" ON public.products
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Profiles Policies
DROP POLICY IF EXISTS "Allow select profiles" ON public.profiles;
CREATE POLICY "Allow select profiles" ON public.profiles
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert profiles" ON public.profiles;
CREATE POLICY "Allow insert profiles" ON public.profiles
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update profiles" ON public.profiles;
CREATE POLICY "Allow update profiles" ON public.profiles
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Projects Policies
DROP POLICY IF EXISTS "Allow select projects" ON public.projects;
CREATE POLICY "Allow select projects" ON public.projects
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow insert projects" ON public.projects;
CREATE POLICY "Allow insert projects" ON public.projects
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update projects" ON public.projects;
CREATE POLICY "Allow update projects" ON public.projects
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete projects" ON public.projects;
CREATE POLICY "Allow delete projects" ON public.projects
  FOR DELETE TO anon, authenticated USING (true);

-- Rooms Policies
DROP POLICY IF EXISTS "Allow manage rooms" ON public.rooms;
CREATE POLICY "Allow manage rooms" ON public.rooms
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Room Items Policies
DROP POLICY IF EXISTS "Allow manage room items" ON public.room_items;
CREATE POLICY "Allow manage room items" ON public.room_items
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- RFQ Submissions Policies
DROP POLICY IF EXISTS "Allow manage rfq submissions" ON public.rfq_submissions;
CREATE POLICY "Allow manage rfq submissions" ON public.rfq_submissions
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- 9. POPULATE QLS OFFICIAL FACTORY CATALOG (SEED DATA)
INSERT INTO public.products (
  id, sku, name, category, mounting_type, lumens, power_watts,
  cct_kelvin, cri, beam_angle, ip_rating, dimming_type,
  finishes, base_price, image_url, datasheet_pdf_url, description, tier, is_active
) VALUES
(
  'prod-dl-1',
  'QLS-DL90-12W-3K',
  'Aero Recessed Architectural Downlight 12W',
  'downlight',
  'recessed',
  1050,
  12,
  3000,
  92,
  38,
  'IP44',
  'triac',
  ARRAY['Matt White', 'Matt Black', 'Brushed Chrome'],
  42.00,
  'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
  'https://qlslighting.com.au/specs/QLS-DL90-12W.pdf',
  'High-efficacy 90mm cut-out recessed architectural downlight with deep baffle anti-glare design (UGR < 19). Standard for Australian residential & boutique commercial spaces.',
  'recommended',
  true
),
(
  'prod-dl-2',
  'QLS-DL90-PRO-15W-CRI97',
  'Vortex Pro Darklight Downlight 15W (CRI 97+)',
  'downlight',
  'recessed',
  1350,
  15,
  2700,
  97,
  36,
  'IP54',
  'dali',
  ARRAY['Textured Black / Gold Baffle', 'Matt White / Black Baffle', 'Custom Powdercoat'],
  78.00,
  'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500&q=80',
  'https://qlslighting.com.au/specs/QLS-DL90-PRO.pdf',
  'Ultra-premium architectural fixture with TruColor 97+ rendering, magnetic interchangeable baffles, and flicker-free DALI-2 integration.',
  'premium',
  true
),
(
  'prod-dl-3',
  'QLS-ECO-10W-3CCT',
  'Swift Eco Downlight 10W (Tri-Colour Switchable)',
  'downlight',
  'recessed',
  850,
  10,
  3000,
  82,
  60,
  'IP44',
  'triac',
  ARRAY['Matt White', 'Matt Black Ring'],
  24.50,
  'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?w=500&q=80',
  'https://qlslighting.com.au/specs/QLS-ECO-10W.pdf',
  'Value-engineered trade downlight with DIP switch (3000K/4000K/5700K) and fast-fit plug & lead.',
  'budget',
  true
),
(
  'prod-out-1',
  'QLS-MARINA-IP65-12W',
  'Marina Coastal IP65 Downlight 12W',
  'outdoor',
  'recessed',
  980,
  12,
  3000,
  90,
  45,
  'IP65',
  'triac',
  ARRAY['Marine Grade Matt White', 'Marine Grade Matt Black', 'Solid Brass'],
  58.00,
  'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=500&q=80',
  'https://qlslighting.com.au/specs/QLS-MARINA-IP65.pdf',
  'Corrosion-resistant marine anodized housing certified for Australian coastal conditions and shower recesses.',
  'recommended',
  true
),
(
  'prod-out-2',
  'QLS-OCEAN-IP67-PRO',
  'Oceania Pro IP67 Surface Mount Cylinder 18W',
  'outdoor',
  'surface',
  1600,
  18,
  3000,
  92,
  30,
  'IP67',
  '0-10v',
  ARRAY['Raw Corten', 'Architectural Black', 'Graphite Grey'],
  110.00,
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80',
  'https://qlslighting.com.au/specs/QLS-OCEAN-PRO.pdf',
  'Solid machined 6063 aluminium exterior architectural cylinder with IK08 impact resistance.',
  'premium',
  true
),
(
  'prod-lin-1',
  'QLS-LINEA-75-30W-1200',
  'Linea Architectural Suspended/Surface Linear 1200mm (30W)',
  'linear',
  'suspended',
  3200,
  30,
  4000,
  88,
  90,
  'IP20',
  'dali',
  ARRAY['Matt Black', 'Matt White', 'Anodized Silver'],
  135.00,
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80',
  'https://qlslighting.com.au/specs/QLS-LINEA-75.pdf',
  'Sleek 75mm profile direct continuous linear system with micro-prismatic diffuser for glare-free commercial and office spaces.',
  'recommended',
  true
),
(
  'prod-lin-2',
  'QLS-LINEA-PRO-50W-UPDOWN',
  'Linea Lux Direct/Indirect Up-Down Linear 1500mm (50W)',
  'linear',
  'suspended',
  5200,
  50,
  4000,
  92,
  110,
  'IP20',
  'dali',
  ARRAY['Textured Black', 'Natural Anodized', 'Custom RAL'],
  220.00,
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=500&q=80',
  'https://qlslighting.com.au/specs/QLS-LINEA-PRO.pdf',
  'Dual-circuit 70% down / 30% up illumination with tuneable white options and smart sensor integration.',
  'premium',
  true
),
(
  'prod-trk-1',
  'QLS-TRACK-SPOT-20W-CRI95',
  'Focus 3-Circuit Track Spotlight 20W (CRI 95+)',
  'track',
  'track',
  1850,
  20,
  3000,
  95,
  24,
  'IP20',
  'triac',
  ARRAY['Matt Black', 'Matt White'],
  65.00,
  'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=500&q=80',
  'https://qlslighting.com.au/specs/QLS-TRACK-SPOT.pdf',
  'Universal 3-circuit track luminaire with high-efficacy COB LED and 355° rotation / 90° tilt for retail and art galleries.',
  'recommended',
  true
)
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  mounting_type = EXCLUDED.mounting_type,
  lumens = EXCLUDED.lumens,
  power_watts = EXCLUDED.power_watts,
  cct_kelvin = EXCLUDED.cct_kelvin,
  cri = EXCLUDED.cri,
  beam_angle = EXCLUDED.beam_angle,
  ip_rating = EXCLUDED.ip_rating,
  dimming_type = EXCLUDED.dimming_type,
  finishes = EXCLUDED.finishes,
  base_price = EXCLUDED.base_price,
  image_url = EXCLUDED.image_url,
  datasheet_pdf_url = EXCLUDED.datasheet_pdf_url,
  description = EXCLUDED.description,
  tier = EXCLUDED.tier,
  is_active = EXCLUDED.is_active;
