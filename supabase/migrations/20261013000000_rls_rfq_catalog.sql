-- ==============================================================================
-- Migration: 20261013000000_rls_rfq_catalog.sql
-- Description:
--   1. Schema extensions for products (LEDYi strips/profiles/drivers attributes)
--   2. Schema extensions for rfq_submissions (contact details, linear metres, payload)
--   3. Seed LEDYi reference catalogue products (verified = false)
--   4. Hardening Row-Level Security (RLS) policies based on auth.uid()
-- ==============================================================================

-- 1. EXTEND PRODUCTS TABLE
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pc',
  ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'QLS',
  ADD COLUMN IF NOT EXISTS voltage INTEGER,
  ADD COLUMN IF NOT EXISTS ugr INTEGER,
  ADD COLUMN IF NOT EXISTS width_mm INTEGER,
  ADD COLUMN IF NOT EXISTS length_m INTEGER,
  ADD COLUMN IF NOT EXISTS max_watts NUMERIC(8, 2),
  ADD COLUMN IF NOT EXISTS cct_min INTEGER,
  ADD COLUMN IF NOT EXISTS cct_max INTEGER,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- 2. EXTEND RFQ_SUBMISSIONS TABLE
ALTER TABLE public.rfq_submissions
  ADD COLUMN IF NOT EXISTS contact_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_channel TEXT DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS piece_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS linear_metres NUMERIC(8, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payload JSONB;

-- 3. SEED LEDYI REFERENCE PRODUCTS (Unverified reference items)
INSERT INTO public.products (
  id, sku, name, category, mounting_type, unit, brand, voltage, width_mm, length_m,
  lumens, power_watts, cct_kelvin, cct_min, cct_max, cri, beam_angle, ip_rating,
  dimming_type, finishes, base_price, image_url, source_url, description, tier, verified, is_active
) VALUES
  (
    'led-cob-24v-10w', 'LEDYI-REF-COB-24V-10W', 'COB LED Strip 24V · 10 W/m (dotless)',
    'strip', 'recessed', 'm', 'LEDYi', 24, 8, NULL,
    1000, 10, 3000, NULL, NULL, 90, 180, 'IP20', 'pwm',
    '{"Standard"}', 14.00,
    'https://www.ledyilighting.com/wp-content/uploads/2024/11/cob-led-strips.jpg',
    'https://www.ledyilighting.com/cob-led-strip/',
    'Continuous, dot-free COB strip for coves, joinery and shelving. Pair with an aluminium profile and a 24 V driver.',
    'recommended', false, true
  ),
  (
    'led-cob-24v-12w-cri95', 'LEDYI-REF-COB-24V-12W-CRI95', 'COB LED Strip 24V · 12 W/m (CRI 95+)',
    'strip', 'recessed', 'm', 'LEDYi', 24, 8, NULL,
    1150, 12, 3000, NULL, NULL, 95, 180, 'IP20', 'pwm',
    '{"Standard"}', 22.00,
    'https://www.ledyilighting.com/wp-content/uploads/2024/11/cob-led-strips.jpg',
    'https://www.ledyilighting.com/cob-led-strip/',
    'High-CRI COB strip for premium joinery, kitchens and retail displays where colour fidelity matters.',
    'premium', false, true
  ),
  (
    'led-smd-24v-14w', 'LEDYI-REF-SMD-24V-14W', 'Single Colour LED Strip 24V · 14.4 W/m',
    'strip', 'surface', 'm', 'LEDYi', 24, 10, NULL,
    1400, 14.4, 3000, NULL, NULL, 82, 120, 'IP20', 'pwm',
    '{"Standard"}', 8.00,
    'https://www.ledyilighting.com/wp-content/uploads/2024/11/single-color-led-strip.jpg',
    'https://www.ledyilighting.com/single-color-led-strip/',
    'Value single-colour strip for general backlighting and utility runs.',
    'budget', false, true
  ),
  (
    'led-tw-24v-14w', 'LEDYI-REF-TW-24V-14W', 'Tunable White LED Strip 24V · 14 W/m (2700–6500K)',
    'strip', 'recessed', 'm', 'LEDYi', 24, 10, NULL,
    1100, 14, 3000, 2700, 6500, 95, 120, 'IP20', 'pwm',
    '{"Standard"}', 24.00,
    'https://www.ledyilighting.com/wp-content/uploads/2024/11/tunable-white-led-strip.jpg',
    'https://www.ledyilighting.com/tunable-white-led-strip/',
    'Adjustable colour temperature from warm to cool white. Requires a CCT-capable controller.',
    'premium', false, true
  ),
  (
    'led-neon-24v-10w', 'LEDYI-REF-NEON-24V-10W-IP67', 'Silicone LED Neon Flex 24V · 10 W/m (IP67)',
    'neon', 'surface', 'm', 'LEDYi', 24, 12, NULL,
    650, 10, 3000, NULL, NULL, 90, 160, 'IP67', 'pwm',
    '{"Standard"}', 32.00,
    'https://www.ledyilighting.com/wp-content/uploads/2024/11/silicone-led-neon-flex.jpg',
    'https://www.ledyilighting.com/silicone-led-neon-flex/',
    'UV-resistant silicone neon flex for exterior facades, landscape and curved architectural details.',
    'recommended', false, true
  ),
  (
    'led-ww-24v-24w', 'LEDYI-REF-WW-24V-24W-IP67', 'High-Power Linear Wall Washer 24V · 24 W/m (IP67)',
    'wallwasher', 'surface', 'm', 'LEDYi', 24, 25, NULL,
    2200, 24, 3000, NULL, NULL, 90, 30, 'IP67', 'pwm',
    '{"Standard"}', 48.00,
    'https://www.ledyilighting.com/wp-content/uploads/2024/11/led-wall-washer.jpg',
    'https://www.ledyilighting.com/led-wall-washer/',
    'Precision-optic linear wall washer for architectural facade illumination.',
    'premium', false, true
  ),
  (
    'kit-profile-1506', 'LEDYI-REF-PROF-1506-2M', 'Recessed Slim Profile 15×6 mm (2 m + Opal Diffuser)',
    'profile', 'recessed', 'pc', 'LEDYi', NULL, 15, 2,
    0, 0, 0, NULL, NULL, 0, 0, 'IP20', 'none',
    '{"Anodised Silver", "Matte Black"}', 22.00,
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    'https://www.ledyilighting.com/led-aluminum-profile/',
    'Anodised aluminium profile for 8 mm and 10 mm strips. Includes frosted PMMA diffuser and end caps.',
    'recommended', false, true
  ),
  (
    'kit-profile-2020', 'LEDYI-REF-PROF-2020-2M', 'Deep Architectural Profile 20×20 mm (2 m + Opal Diffuser)',
    'profile', 'surface', 'pc', 'LEDYi', NULL, 20, 2,
    0, 0, 0, NULL, NULL, 0, 0, 'IP20', 'none',
    '{"Anodised Silver", "Matte Black", "White"}', 28.00,
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    'https://www.ledyilighting.com/led-aluminum-profile/',
    'Deep extrusion for spotless diffusion with standard SMD strips.',
    'recommended', false, true
  ),
  (
    'kit-driver-24v-60w', 'LEDYI-REF-DRV-24V-60W', 'Constant-Voltage Driver 24V · 60 W (Triac Dimmable)',
    'driver', 'surface', 'pc', 'LEDYi', 24, NULL, NULL,
    0, 0, 0, NULL, NULL, 0, 0, 'IP20', 'triac',
    '{"Standard"}', 48.00,
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    'https://www.ledyilighting.com/pt/',
    '24 V / 60 W constant-voltage driver with phase-cut (Triac) dimming.',
    'recommended', false, true
  ),
  (
    'kit-driver-24v-100w', 'LEDYI-REF-DRV-24V-100W', 'Constant-Voltage Driver 24V · 100 W (Triac Dimmable)',
    'driver', 'surface', 'pc', 'LEDYi', 24, NULL, NULL,
    0, 0, 0, NULL, NULL, 0, 0, 'IP20', 'triac',
    '{"Standard"}', 78.00,
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    'https://www.ledyilighting.com/pt/',
    '24 V / 100 W constant-voltage driver with Triac dimming.',
    'recommended', false, true
  ),
  (
    'kit-driver-24v-100w-dali', 'LEDYI-REF-DRV-24V-100W-DALI', 'Constant-Voltage Driver 24V · 100 W (DALI-2)',
    'driver', 'surface', 'pc', 'LEDYi', 24, NULL, NULL,
    0, 0, 0, NULL, NULL, 0, 0, 'IP20', 'dali',
    '{"Standard"}', 120.00,
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    'https://www.ledyilighting.com/pt/',
    'DALI-2 dimmable 24 V driver for building-automation projects.',
    'premium', false, true
  ),
  (
    'kit-driver-24v-200w-dali', 'LEDYI-REF-DRV-24V-200W-DALI', 'Constant-Voltage Driver 24V · 200 W (DALI-2)',
    'driver', 'surface', 'pc', 'LEDYi', 24, NULL, NULL,
    0, 0, 0, NULL, NULL, 0, 0, 'IP20', 'dali',
    '{"Standard"}', 160.00,
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    'https://www.ledyilighting.com/pt/',
    'High-capacity DALI-2 dimmable 24 V driver for long strip runs.',
    'premium', false, true
  ),
  (
    'kit-control-cct', 'LEDYI-REF-CTL-CCT', 'Tunable White CCT Controller (2-channel)',
    'control', 'surface', 'pc', 'LEDYi', 24, NULL, NULL,
    0, 0, 0, NULL, NULL, 0, 0, 'IP20', 'pwm',
    '{"Standard"}', 65.00,
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    'https://www.ledyilighting.com/pt/',
    'Controls brightness and colour temperature of Tunable White strips.',
    'recommended', false, true
  ),
  (
    'kit-control-dimmer', 'LEDYI-REF-CTL-PWM-DIM', 'PWM Dimmer Controller 24V (single colour)',
    'control', 'surface', 'pc', 'LEDYi', 24, NULL, NULL,
    0, 0, 0, NULL, NULL, 0, 0, 'IP20', 'pwm',
    '{"Standard"}', 35.00,
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80',
    'https://www.ledyilighting.com/pt/',
    'Single-channel PWM dimmer for constant-voltage strips.',
    'recommended', false, true
  )
ON CONFLICT (id) DO UPDATE SET
  unit = EXCLUDED.unit,
  brand = EXCLUDED.brand,
  voltage = EXCLUDED.voltage,
  width_mm = EXCLUDED.width_mm,
  length_m = EXCLUDED.length_m,
  source_url = EXCLUDED.source_url,
  verified = EXCLUDED.verified;

-- 4. HARDEN ROW-LEVEL SECURITY (RLS) POLICIES
-- Profiles
DROP POLICY IF EXISTS "Allow select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated, anon USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated, anon WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated, anon USING (id = auth.uid());

-- Projects
DROP POLICY IF EXISTS "Public access projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all for authenticated projects" ON public.projects;
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT TO authenticated, anon USING (user_id = auth.uid());
CREATE POLICY "Users can insert own projects" ON public.projects
  FOR INSERT TO authenticated, anon WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE TO authenticated, anon USING (user_id = auth.uid());
CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE TO authenticated, anon USING (user_id = auth.uid());

-- Rooms (Cascaded through Project ownership)
DROP POLICY IF EXISTS "Public access rooms" ON public.rooms;
CREATE POLICY "Users can view own rooms" ON public.rooms
  FOR SELECT TO authenticated, anon USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = rooms.project_id AND p.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own rooms" ON public.rooms
  FOR INSERT TO authenticated, anon WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = rooms.project_id AND p.user_id = auth.uid())
  );
CREATE POLICY "Users can update own rooms" ON public.rooms
  FOR UPDATE TO authenticated, anon USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = rooms.project_id AND p.user_id = auth.uid())
  );
CREATE POLICY "Users can delete own rooms" ON public.rooms
  FOR DELETE TO authenticated, anon USING (
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = rooms.project_id AND p.user_id = auth.uid())
  );

-- Room Items (Cascaded through Room -> Project ownership)
DROP POLICY IF EXISTS "Public access room_items" ON public.room_items;
CREATE POLICY "Users can view own room items" ON public.room_items
  FOR SELECT TO authenticated, anon USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      WHERE r.id = room_items.room_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own room items" ON public.room_items
  FOR INSERT TO authenticated, anon WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      WHERE r.id = room_items.room_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own room items" ON public.room_items
  FOR UPDATE TO authenticated, anon USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      WHERE r.id = room_items.room_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own room items" ON public.room_items
  FOR DELETE TO authenticated, anon USING (
    EXISTS (
      SELECT 1 FROM public.rooms r
      JOIN public.projects p ON p.id = r.project_id
      WHERE r.id = room_items.room_id AND p.user_id = auth.uid()
    )
  );

-- RFQ Submissions
DROP POLICY IF EXISTS "Public access rfq_submissions" ON public.rfq_submissions;
CREATE POLICY "Users can view own RFQs" ON public.rfq_submissions
  FOR SELECT TO authenticated, anon USING (user_id = auth.uid());
CREATE POLICY "Users can insert own RFQs" ON public.rfq_submissions
  FOR INSERT TO authenticated, anon WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.projects p WHERE p.id = rfq_submissions.project_id AND p.user_id = auth.uid())
  );
