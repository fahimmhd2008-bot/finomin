-- ==============================================================================
-- AI-POWERED CAMPUS ENVIRONMENTAL & SUSTAINABILITY MONITORING SYSTEM
-- COMPLETE PRODUCTION POSTGRESQL SCHEMA WITH RLS & DEMO SEED DATA
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'student')) DEFAULT 'student',
  avatar_url TEXT,
  department TEXT DEFAULT 'Campus Community',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SMART DUSTBINS TABLE
CREATE TABLE IF NOT EXISTS public.smart_dustbins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bin_code TEXT NOT NULL UNIQUE,
  zone_name TEXT NOT NULL,
  fill_level INT NOT NULL CHECK (fill_level BETWEEN 0 AND 100),
  battery_level INT NOT NULL CHECK (battery_level BETWEEN 0 AND 100),
  last_cleaned_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('ok', 'warning', 'critical')) DEFAULT 'ok',
  latitude NUMERIC(10, 6) DEFAULT 37.774929,
  longitude NUMERIC(10, 6) DEFAULT -122.419416,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FOOD WASTE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.food_waste_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cafeteria_name TEXT NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner')),
  prepared_weight_kg NUMERIC(8,2) NOT NULL,
  waste_weight_kg NUMERIC(8,2) NOT NULL,
  headcount INT NOT NULL,
  edible_waste_kg NUMERIC(8,2) DEFAULT 0,
  inedible_waste_kg NUMERIC(8,2) DEFAULT 0,
  ai_suggested_prep_kg NUMERIC(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WATER SENSORS & ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.water_sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_code TEXT NOT NULL UNIQUE,
  pipe_zone TEXT NOT NULL,
  current_flow_lpm NUMERIC(8,2) NOT NULL,
  baseline_flow_lpm NUMERIC(8,2) NOT NULL,
  pressure_psi NUMERIC(6,2) DEFAULT 45.0,
  is_leak_detected BOOLEAN DEFAULT FALSE,
  severity TEXT CHECK (severity IN ('none', 'minor', 'major', 'critical')) DEFAULT 'none',
  valve_status TEXT CHECK (valve_status IN ('OPEN', 'THROTTLED', 'ISOLATED')) DEFAULT 'OPEN',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CAMPUS ENERGY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.energy_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  building_name TEXT NOT NULL,
  kwh_consumed NUMERIC(10,2) NOT NULL,
  peak_demand_kw NUMERIC(8,2) NOT NULL,
  power_factor NUMERIC(4,2) DEFAULT 0.95,
  carbon_kg_est NUMERIC(10,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PLASTIC REWARDS LEDGER & BALANCES
CREATE TABLE IF NOT EXISTS public.plastic_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bottle_count INT NOT NULL CHECK (bottle_count > 0),
  weight_grams NUMERIC(8,2) DEFAULT 0,
  recycling_type TEXT DEFAULT 'PET',
  points_earned INT NOT NULL CHECK (points_earned > 0),
  station_code TEXT DEFAULT 'STATION-MAIN-01',
  deposited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_balances (
  student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points INT DEFAULT 0 CHECK (total_points >= 0),
  total_bottles_recycled INT DEFAULT 0 CHECK (total_bottles_recycled >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REWARD CATALOG & REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.reward_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points_cost INT NOT NULL CHECK (points_cost > 0),
  category TEXT NOT NULL CHECK (category IN ('Cafeteria', 'Bookstore', 'Stationery', 'Eco-Merch', 'Campus Services')),
  available_stock INT DEFAULT 100,
  voucher_code_prefix TEXT DEFAULT 'ECO',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.reward_catalog(id) ON DELETE CASCADE,
  points_spent INT NOT NULL,
  voucher_code TEXT NOT NULL UNIQUE,
  status TEXT CHECK (status IN ('active', 'redeemed', 'expired')) DEFAULT 'active',
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RAINWATER HARVESTING TANKS TABLE
CREATE TABLE IF NOT EXISTS public.rainwater_tanks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tank_name TEXT NOT NULL UNIQUE,
  capacity_liters NUMERIC(10,2) NOT NULL,
  current_liters NUMERIC(10,2) NOT NULL,
  inflow_rate_lpm NUMERIC(8,2) DEFAULT 0,
  outflow_rate_lpm NUMERIC(8,2) DEFAULT 0,
  filter_health_pct INT CHECK (filter_health_pct BETWEEN 0 AND 100) DEFAULT 100,
  catchment_area_sqm NUMERIC(8,2) DEFAULT 1200.0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AIR QUALITY SENSORS TABLE
CREATE TABLE IF NOT EXISTS public.air_quality_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_name TEXT NOT NULL,
  aqi INT NOT NULL,
  pm2_5 NUMERIC(6,2) NOT NULL,
  pm10 NUMERIC(6,2) NOT NULL,
  co2_ppm INT NOT NULL,
  voc_ppb NUMERIC(6,2) DEFAULT 35.0,
  temperature_c NUMERIC(4,1) DEFAULT 24.5,
  humidity_pct NUMERIC(4,1) DEFAULT 52.0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SYSTEM ALERTS TABLE
CREATE TABLE IF NOT EXISTS public.system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL CHECK (domain IN ('dustbin', 'food', 'water', 'energy', 'plastic', 'rainwater', 'air')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_dustbins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plastic_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rainwater_tanks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.air_quality_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_alerts ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin/staff role
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users read own profile; Staff/Admin read all
DROP POLICY IF EXISTS "Read profiles" ON public.profiles;
CREATE POLICY "Read profiles" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Plastic Deposits & Balances
DROP POLICY IF EXISTS "Student read own balance" ON public.student_balances;
CREATE POLICY "Student read own balance" ON public.student_balances FOR SELECT
  USING (auth.uid() = student_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Student read own deposits" ON public.plastic_deposits;
CREATE POLICY "Student read own deposits" ON public.plastic_deposits FOR SELECT
  USING (auth.uid() = student_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff insert deposits" ON public.plastic_deposits;
CREATE POLICY "Staff insert deposits" ON public.plastic_deposits FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

-- Rewards
DROP POLICY IF EXISTS "Authenticated read rewards" ON public.reward_catalog;
CREATE POLICY "Authenticated read rewards" ON public.reward_catalog FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Student read redemptions" ON public.reward_redemptions;
CREATE POLICY "Student read redemptions" ON public.reward_redemptions FOR SELECT
  USING (auth.uid() = student_id OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Student insert redemptions" ON public.reward_redemptions;
CREATE POLICY "Student insert redemptions" ON public.reward_redemptions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Universal Read Policies for Environment Metrics (Authenticated users)
DROP POLICY IF EXISTS "Authenticated read dustbins" ON public.smart_dustbins;
CREATE POLICY "Authenticated read dustbins" ON public.smart_dustbins FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read food logs" ON public.food_waste_logs;
CREATE POLICY "Authenticated read food logs" ON public.food_waste_logs FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read water sensors" ON public.water_sensors;
CREATE POLICY "Authenticated read water sensors" ON public.water_sensors FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read energy logs" ON public.energy_logs;
CREATE POLICY "Authenticated read energy logs" ON public.energy_logs FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read rainwater tanks" ON public.rainwater_tanks;
CREATE POLICY "Authenticated read rainwater tanks" ON public.rainwater_tanks FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read air quality" ON public.air_quality_logs;
CREATE POLICY "Authenticated read air quality" ON public.air_quality_logs FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated read alerts" ON public.system_alerts;
CREATE POLICY "Authenticated read alerts" ON public.system_alerts FOR SELECT USING (auth.role() = 'authenticated');

-- Write Policies: Restricted to Staff/Admin
DROP POLICY IF EXISTS "Staff manage dustbins" ON public.smart_dustbins;
CREATE POLICY "Staff manage dustbins" ON public.smart_dustbins FOR ALL USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff manage food logs" ON public.food_waste_logs;
CREATE POLICY "Staff manage food logs" ON public.food_waste_logs FOR ALL USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff manage water sensors" ON public.water_sensors;
CREATE POLICY "Staff manage water sensors" ON public.water_sensors FOR ALL USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff manage energy logs" ON public.energy_logs;
CREATE POLICY "Staff manage energy logs" ON public.energy_logs FOR ALL USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff manage rainwater tanks" ON public.rainwater_tanks;
CREATE POLICY "Staff manage rainwater tanks" ON public.rainwater_tanks FOR ALL USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff manage air quality" ON public.air_quality_logs;
CREATE POLICY "Staff manage air quality" ON public.air_quality_logs FOR ALL USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff manage alerts" ON public.system_alerts;
CREATE POLICY "Staff manage alerts" ON public.system_alerts FOR ALL USING (public.is_staff_or_admin());

-- ==============================================================================
-- SEED DATA FOR DEMO & TESTING
-- ==============================================================================

-- 1. Dustbins Seed
INSERT INTO public.smart_dustbins (bin_code, zone_name, fill_level, battery_level, status)
VALUES
  ('BIN-CENTRAL-01', 'Central Plaza', 92, 78, 'critical'),
  ('BIN-ENG-L1', 'Engineering Hall - Ground Floor', 45, 95, 'ok'),
  ('BIN-SCI-L2', 'Science Complex - Lab Corridor', 78, 62, 'warning'),
  ('BIN-LIB-ENTRY', 'Main Library - West Entrance', 25, 88, 'ok'),
  ('BIN-CAF-PATIO', 'Dining Quad Patio', 88, 41, 'critical'),
  ('BIN-DORM-A', 'Residence Hall A Lawn', 58, 85, 'ok'),
  ('BIN-GYM-01', 'Athletic Center Lobby', 69, 73, 'warning'),
  ('BIN-ART-L3', 'Creative Arts Studio', 31, 91, 'ok')
ON CONFLICT (bin_code) DO UPDATE
SET fill_level = EXCLUDED.fill_level, battery_level = EXCLUDED.battery_level, status = EXCLUDED.status;

-- 2. Food Waste Logs Seed
INSERT INTO public.food_waste_logs (cafeteria_name, log_date, meal_type, prepared_weight_kg, waste_weight_kg, headcount, edible_waste_kg, inedible_waste_kg, ai_suggested_prep_kg)
VALUES
  ('Main Campus Dining Hall', CURRENT_DATE - INTERVAL '3 day', 'Lunch', 420.0, 58.5, 840, 38.0, 20.5, 380.0),
  ('Main Campus Dining Hall', CURRENT_DATE - INTERVAL '3 day', 'Dinner', 380.0, 46.0, 710, 31.0, 15.0, 350.0),
  ('Science Tower Cafe', CURRENT_DATE - INTERVAL '2 day', 'Lunch', 210.0, 28.0, 410, 19.5, 8.5, 190.0),
  ('Engineering Bistro', CURRENT_DATE - INTERVAL '2 day', 'Lunch', 260.0, 39.5, 490, 27.0, 12.5, 235.0),
  ('Main Campus Dining Hall', CURRENT_DATE - INTERVAL '1 day', 'Breakfast', 180.0, 16.0, 520, 11.0, 5.0, 170.0),
  ('Main Campus Dining Hall', CURRENT_DATE - INTERVAL '1 day', 'Lunch', 450.0, 68.0, 890, 48.0, 20.0, 405.0),
  ('Main Campus Dining Hall', CURRENT_DATE - INTERVAL '1 day', 'Dinner', 390.0, 52.0, 760, 36.0, 16.0, 355.0),
  ('Main Campus Dining Hall', CURRENT_DATE, 'Breakfast', 190.0, 18.5, 540, 12.0, 6.5, 175.0);

-- 3. Water Sensors Seed
INSERT INTO public.water_sensors (sensor_code, pipe_zone, current_flow_lpm, baseline_flow_lpm, pressure_psi, is_leak_detected, severity, valve_status)
VALUES
  ('WTR-MAIN-NORTH', 'Main Feed North Campus', 142.5, 85.0, 38.2, TRUE, 'critical', 'OPEN'),
  ('WTR-ENG-RISER', 'Engineering Quad Riser #2', 24.0, 22.5, 48.0, FALSE, 'none', 'OPEN'),
  ('WTR-SCI-BASE', 'Science Center Sub-basement', 68.4, 32.0, 41.5, TRUE, 'major', 'OPEN'),
  ('WTR-DORM-LOOP', 'Student Village Potable Loop', 55.2, 53.0, 47.2, FALSE, 'none', 'OPEN'),
  ('WTR-IRR-SOUTH', 'Sports Turf Irrigation Riser', 31.5, 12.0, 43.0, TRUE, 'minor', 'THROTTLED'),
  ('WTR-LIB-HVAC', 'Library Chilled Water Loop', 92.0, 90.5, 52.0, FALSE, 'none', 'OPEN')
ON CONFLICT (sensor_code) DO UPDATE
SET current_flow_lpm = EXCLUDED.current_flow_lpm, is_leak_detected = EXCLUDED.is_leak_detected, severity = EXCLUDED.severity;

-- 4. Energy Logs Seed
INSERT INTO public.energy_logs (building_name, kwh_consumed, peak_demand_kw, power_factor, carbon_kg_est, recorded_at)
VALUES
  ('Engineering Innovation Complex', 1420.5, 210.4, 0.94, 639.2, NOW() - INTERVAL '5 hour'),
  ('Science & Medical Research Lab', 1890.0, 285.0, 0.96, 850.5, NOW() - INTERVAL '5 hour'),
  ('University Library & Learning Commons', 780.2, 98.5, 0.92, 351.1, NOW() - INTERVAL '5 hour'),
  ('Student Center & Dining Pavilion', 1120.8, 175.2, 0.93, 504.4, NOW() - INTERVAL '5 hour'),
  ('Athletic Center & Pool', 950.0, 142.0, 0.91, 427.5, NOW() - INTERVAL '5 hour'),
  ('Residence Hall West Cluster', 860.4, 118.0, 0.95, 387.2, NOW() - INTERVAL '5 hour'),
  ('Creative Arts Center', 540.0, 72.0, 0.93, 243.0, NOW() - INTERVAL '5 hour');

-- 5. Rainwater Tanks Seed
INSERT INTO public.rainwater_tanks (tank_name, capacity_liters, current_liters, inflow_rate_lpm, outflow_rate_lpm, filter_health_pct, catchment_area_sqm)
VALUES
  ('North Quad Cistern Alpha', 50000.0, 38400.0, 18.5, 12.0, 94, 2400.0),
  ('Science Rooftop Harvester Beta', 35000.0, 29800.0, 14.0, 9.5, 88, 1800.0),
  ('Library Underground Reservoir', 75000.0, 48200.0, 26.0, 22.0, 72, 3600.0),
  ('Athletic Field Runoff Basin', 60000.0, 18500.0, 5.0, 30.0, 96, 4500.0)
ON CONFLICT (tank_name) DO UPDATE
SET current_liters = EXCLUDED.current_liters, filter_health_pct = EXCLUDED.filter_health_pct;

-- 6. Air Quality Logs Seed
INSERT INTO public.air_quality_logs (zone_name, aqi, pm2_5, pm10, co2_ppm, voc_ppb, temperature_c, humidity_pct, recorded_at)
VALUES
  ('Central Campus Plaza (Outdoor)', 42, 9.4, 18.2, 412, 18.0, 24.2, 48.0, NOW() - INTERVAL '15 minute'),
  ('Engineering Machine Shop (Indoor)', 88, 28.5, 54.0, 785, 95.0, 23.5, 52.0, NOW() - INTERVAL '15 minute'),
  ('Science Lab Wing C (Indoor)', 54, 14.2, 26.0, 590, 42.0, 22.8, 50.0, NOW() - INTERVAL '15 minute'),
  ('Main Library Reading Hall (Indoor)', 36, 7.8, 14.5, 510, 16.0, 22.0, 49.0, NOW() - INTERVAL '15 minute'),
  ('Dining Pavilion Kitchen Area (Indoor)', 115, 41.2, 78.0, 940, 140.0, 27.5, 68.0, NOW() - INTERVAL '15 minute'),
  ('Student Quad Lawn (Outdoor)', 38, 8.2, 16.0, 408, 14.0, 25.0, 46.0, NOW() - INTERVAL '15 minute'),
  ('West Perimeter Transit Hub (Outdoor)', 128, 46.8, 88.5, 480, 85.0, 26.2, 44.0, NOW() - INTERVAL '15 minute');

-- 7. System Alerts Seed
INSERT INTO public.system_alerts (domain, severity, message, is_resolved)
VALUES
  ('water', 'critical', 'Critical leak alert: WTR-MAIN-NORTH flow is 142.5 L/min (+67% over baseline). Possible main pipe rupture.', FALSE),
  ('dustbin', 'critical', 'Bin BIN-CENTRAL-01 at Central Plaza exceeded 90% capacity (92%). Immediate collection dispatched.', FALSE),
  ('air', 'warning', 'West Perimeter Transit Hub AQI elevated to 128 (Unhealthy for sensitive groups). Ventilation active.', FALSE),
  ('dustbin', 'warning', 'Bin BIN-CAF-PATIO at Dining Quad Patio at 88% capacity. Needs emptying before lunch rush.', FALSE),
  ('water', 'warning', 'Science Center Sub-basement WTR-SCI-BASE indicates abnormal micro-leak flow of 68.4 L/min.', FALSE),
  ('energy', 'info', 'Engineering Innovation Complex approaching 85% peak demand limit (210 kW peak).', FALSE);

-- 8. Reward Catalog Seed
INSERT INTO public.reward_catalog (title, description, points_cost, category, available_stock, voucher_code_prefix)
VALUES
  ('$10 Campus Bookstore Voucher', 'Redeemable on textbooks, electronics, and university merchandise.', 250, 'Bookstore', 50, 'BOOK'),
  ('Free Organic Cafeteria Meal', 'Complimentary lunch or dinner combo at any campus dining hall.', 180, 'Cafeteria', 80, 'MEAL'),
  ('Stainless Steel Eco Water Bottle', 'BPA-free vacuum insulated 750ml flask with campus sustainability logo.', 300, 'Eco-Merch', 35, 'BOTTLE'),
  ('Priority Campus Bike Share Pass (1 Month)', 'Unlimited access to the university electric bicycle sharing network.', 400, 'Campus Services', 20, 'BIKE'),
  ('Recycled Campus Notebook & Pen Set', 'Notebook made from 100% post-consumer recycled paper and bamboo pen.', 120, 'Stationery', 100, 'NOTE'),
  ('Fair Trade Espresso Bar Voucher (5 Cups)', 'Redeemable for 5 handcrafted espresso drinks at the Science Cafe.', 220, 'Cafeteria', 45, 'CAFE');

-- ==============================================================================
-- AUTO PROFILE CREATION TRIGGER
-- Fires on every new auth.users INSERT (Google OAuth, email sign-up, magic link)
-- and creates a matching row in public.profiles with a default 'student' role.
-- Admins can then promote roles via the /admin/users page.
-- ==============================================================================

-- Function that creates the profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url, department)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Campus Community')
  )
  ON CONFLICT (id) DO NOTHING; -- Idempotent: skip if profile already exists
  RETURN NEW;
END;
$$;

-- Trigger: fires AFTER every INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS INSERT policy: allow the trigger function (SECURITY DEFINER) to write profiles
DROP POLICY IF EXISTS "Service insert profiles" ON public.profiles;
CREATE POLICY "Service insert profiles" ON public.profiles FOR INSERT
  WITH CHECK (true);
