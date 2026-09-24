// server/src/services/store.ts
import { v4 as uuidv4 } from 'uuid';
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

export interface Dustbin {
  id: string;
  bin_code: string;
  zone_name: string;
  fill_level: number;
  battery_level: number;
  last_cleaned_at: string;
  status: 'ok' | 'warning' | 'critical';
  latitude: number;
  longitude: number;
}

export interface FoodWasteEntry {
  id: string;
  cafeteria_name: string;
  log_date: string;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner';
  prepared_weight_kg: number;
  waste_weight_kg: number;
  headcount: number;
  edible_waste_kg: number;
  inedible_waste_kg: number;
  ai_suggested_prep_kg?: number;
}

export interface WaterSensor {
  id: string;
  sensor_code: string;
  pipe_zone: string;
  current_flow_lpm: number;
  baseline_flow_lpm: number;
  pressure_psi: number;
  is_leak_detected: boolean;
  severity: 'none' | 'minor' | 'major' | 'critical';
  valve_status: 'OPEN' | 'THROTTLED' | 'ISOLATED';
  updated_at: string;
}

export interface EnergyLogEntry {
  id: string;
  building_name: string;
  kwh_consumed: number;
  peak_demand_kw: number;
  power_factor: number;
  carbon_kg_est: number;
  recorded_at: string;
}

export interface PlasticDepositEntry {
  id: string;
  student_id: string;
  student_name: string;
  bottle_count: number;
  weight_grams: number;
  recycling_type: string;
  points_earned: number;
  station_code: string;
  deposited_at: string;
}

export interface StudentBalance {
  student_id: string;
  student_name: string;
  total_points: number;
  total_bottles_recycled: number;
  updated_at: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  category: 'Cafeteria' | 'Bookstore' | 'Stationery' | 'Eco-Merch' | 'Campus Services';
  available_stock: number;
  voucher_code_prefix: string;
}

export interface RewardRedemptionEntry {
  id: string;
  student_id: string;
  reward_id: string;
  item_name: string;
  points_spent: number;
  voucher_code: string;
  status: 'active' | 'redeemed' | 'expired';
  redeemed_at: string;
}

export interface RainwaterTank {
  id: string;
  tank_name: string;
  capacity_liters: number;
  current_liters: number;
  inflow_rate_lpm: number;
  outflow_rate_lpm: number;
  filter_health_pct: number;
  catchment_area_sqm: number;
  updated_at: string;
}

export interface AirQualityEntry {
  id: string;
  zone_name: string;
  aqi: number;
  pm2_5: number;
  pm10: number;
  co2_ppm: number;
  voc_ppb: number;
  temperature_c: number;
  humidity_pct: number;
  recorded_at: string;
}

export interface SystemAlertEntry {
  id: string;
  domain: 'dustbin' | 'food' | 'water' | 'energy' | 'plastic' | 'rainwater' | 'air';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  is_resolved: boolean;
  created_at: string;
}

class CampusDataStore {
  dustbins: Dustbin[] = [
    { id: uuidv4(), bin_code: 'BIN-CENTRAL-01', zone_name: 'Central Plaza', fill_level: 92, battery_level: 78, last_cleaned_at: new Date(Date.now() - 3600000 * 5).toISOString(), status: 'critical', latitude: 37.774929, longitude: -122.419416 },
    { id: uuidv4(), bin_code: 'BIN-ENG-L1', zone_name: 'Engineering Hall - Ground Floor', fill_level: 45, battery_level: 95, last_cleaned_at: new Date(Date.now() - 3600000 * 2).toISOString(), status: 'ok', latitude: 37.775129, longitude: -122.418416 },
    { id: uuidv4(), bin_code: 'BIN-SCI-L2', zone_name: 'Science Complex - Lab Corridor', fill_level: 78, battery_level: 62, last_cleaned_at: new Date(Date.now() - 3600000 * 4).toISOString(), status: 'warning', latitude: 37.776229, longitude: -122.420116 },
    { id: uuidv4(), bin_code: 'BIN-LIB-ENTRY', zone_name: 'Main Library - West Entrance', fill_level: 25, battery_level: 88, last_cleaned_at: new Date(Date.now() - 3600000 * 1).toISOString(), status: 'ok', latitude: 37.774129, longitude: -122.421416 },
    { id: uuidv4(), bin_code: 'BIN-CAF-PATIO', zone_name: 'Dining Quad Patio', fill_level: 88, battery_level: 41, last_cleaned_at: new Date(Date.now() - 3600000 * 7).toISOString(), status: 'critical', latitude: 37.773529, longitude: -122.417416 },
    { id: uuidv4(), bin_code: 'BIN-DORM-A', zone_name: 'Residence Hall A Lawn', fill_level: 58, battery_level: 85, last_cleaned_at: new Date(Date.now() - 3600000 * 3).toISOString(), status: 'ok', latitude: 37.772529, longitude: -122.419916 },
    { id: uuidv4(), bin_code: 'BIN-GYM-01', zone_name: 'Athletic Center Lobby', fill_level: 69, battery_level: 73, last_cleaned_at: new Date(Date.now() - 3600000 * 6).toISOString(), status: 'warning', latitude: 37.776829, longitude: -122.416216 },
    { id: uuidv4(), bin_code: 'BIN-ART-L3', zone_name: 'Creative Arts Studio', fill_level: 31, battery_level: 91, last_cleaned_at: new Date(Date.now() - 3600000 * 2).toISOString(), status: 'ok', latitude: 37.775829, longitude: -122.422516 },
  ];

  foodWasteLogs: FoodWasteEntry[] = [
    { id: uuidv4(), cafeteria_name: 'Main Campus Dining Hall', log_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], meal_type: 'Lunch', prepared_weight_kg: 420.0, waste_weight_kg: 58.5, headcount: 840, edible_waste_kg: 38.0, inedible_waste_kg: 20.5, ai_suggested_prep_kg: 380.0 },
    { id: uuidv4(), cafeteria_name: 'Main Campus Dining Hall', log_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], meal_type: 'Dinner', prepared_weight_kg: 380.0, waste_weight_kg: 46.0, headcount: 710, edible_waste_kg: 31.0, inedible_waste_kg: 15.0, ai_suggested_prep_kg: 350.0 },
    { id: uuidv4(), cafeteria_name: 'Science Tower Cafe', log_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], meal_type: 'Lunch', prepared_weight_kg: 210.0, waste_weight_kg: 28.0, headcount: 410, edible_waste_kg: 19.5, inedible_waste_kg: 8.5, ai_suggested_prep_kg: 190.0 },
    { id: uuidv4(), cafeteria_name: 'Engineering Bistro', log_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], meal_type: 'Lunch', prepared_weight_kg: 260.0, waste_weight_kg: 39.5, headcount: 490, edible_waste_kg: 27.0, inedible_waste_kg: 12.5, ai_suggested_prep_kg: 235.0 },
    { id: uuidv4(), cafeteria_name: 'Main Campus Dining Hall', log_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], meal_type: 'Breakfast', prepared_weight_kg: 180.0, waste_weight_kg: 16.0, headcount: 520, edible_waste_kg: 11.0, inedible_waste_kg: 5.0, ai_suggested_prep_kg: 170.0 },
    { id: uuidv4(), cafeteria_name: 'Main Campus Dining Hall', log_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], meal_type: 'Lunch', prepared_weight_kg: 450.0, waste_weight_kg: 68.0, headcount: 890, edible_waste_kg: 48.0, inedible_waste_kg: 20.0, ai_suggested_prep_kg: 405.0 },
    { id: uuidv4(), cafeteria_name: 'Main Campus Dining Hall', log_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], meal_type: 'Dinner', prepared_weight_kg: 390.0, waste_weight_kg: 52.0, headcount: 760, edible_waste_kg: 36.0, inedible_waste_kg: 16.0, ai_suggested_prep_kg: 355.0 },
    { id: uuidv4(), cafeteria_name: 'Main Campus Dining Hall', log_date: new Date().toISOString().split('T')[0], meal_type: 'Breakfast', prepared_weight_kg: 190.0, waste_weight_kg: 18.5, headcount: 540, edible_waste_kg: 12.0, inedible_waste_kg: 6.5, ai_suggested_prep_kg: 175.0 },
  ];

  waterSensors: WaterSensor[] = [
    { id: uuidv4(), sensor_code: 'WTR-MAIN-NORTH', pipe_zone: 'Main Feed North Campus', current_flow_lpm: 142.5, baseline_flow_lpm: 85.0, pressure_psi: 38.2, is_leak_detected: true, severity: 'critical', valve_status: 'OPEN', updated_at: new Date().toISOString() },
    { id: uuidv4(), sensor_code: 'WTR-ENG-RISER', pipe_zone: 'Engineering Quad Riser #2', current_flow_lpm: 24.0, baseline_flow_lpm: 22.5, pressure_psi: 48.0, is_leak_detected: false, severity: 'none', valve_status: 'OPEN', updated_at: new Date().toISOString() },
    { id: uuidv4(), sensor_code: 'WTR-SCI-BASE', pipe_zone: 'Science Center Sub-basement', current_flow_lpm: 68.4, baseline_flow_lpm: 32.0, pressure_psi: 41.5, is_leak_detected: true, severity: 'major', valve_status: 'OPEN', updated_at: new Date().toISOString() },
    { id: uuidv4(), sensor_code: 'WTR-DORM-LOOP', pipe_zone: 'Student Village Potable Loop', current_flow_lpm: 55.2, baseline_flow_lpm: 53.0, pressure_psi: 47.2, is_leak_detected: false, severity: 'none', valve_status: 'OPEN', updated_at: new Date().toISOString() },
    { id: uuidv4(), sensor_code: 'WTR-IRR-SOUTH', pipe_zone: 'Sports Turf Irrigation Riser', current_flow_lpm: 31.5, baseline_flow_lpm: 12.0, pressure_psi: 43.0, is_leak_detected: true, severity: 'minor', valve_status: 'THROTTLED', updated_at: new Date().toISOString() },
    { id: uuidv4(), sensor_code: 'WTR-LIB-HVAC', pipe_zone: 'Library Chilled Water Loop', current_flow_lpm: 92.0, baseline_flow_lpm: 90.5, pressure_psi: 52.0, is_leak_detected: false, severity: 'none', valve_status: 'OPEN', updated_at: new Date().toISOString() },
  ];

  energyLogs: EnergyLogEntry[] = [
    { id: uuidv4(), building_name: 'Engineering Innovation Complex', kwh_consumed: 1420.5, peak_demand_kw: 210.4, power_factor: 0.94, carbon_kg_est: 639.2, recorded_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: uuidv4(), building_name: 'Science & Medical Research Lab', kwh_consumed: 1890.0, peak_demand_kw: 285.0, power_factor: 0.96, carbon_kg_est: 850.5, recorded_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: uuidv4(), building_name: 'University Library & Learning Commons', kwh_consumed: 780.2, peak_demand_kw: 98.5, power_factor: 0.92, carbon_kg_est: 351.1, recorded_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: uuidv4(), building_name: 'Student Center & Dining Pavilion', kwh_consumed: 1120.8, peak_demand_kw: 175.2, power_factor: 0.93, carbon_kg_est: 504.4, recorded_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: uuidv4(), building_name: 'Athletic Center & Pool', kwh_consumed: 950.0, peak_demand_kw: 142.0, power_factor: 0.91, carbon_kg_est: 427.5, recorded_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: uuidv4(), building_name: 'Residence Hall West Cluster', kwh_consumed: 860.4, peak_demand_kw: 118.0, power_factor: 0.95, carbon_kg_est: 387.2, recorded_at: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: uuidv4(), building_name: 'Creative Arts Center', kwh_consumed: 540.0, peak_demand_kw: 72.0, power_factor: 0.93, carbon_kg_est: 243.0, recorded_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  ];

  plasticDeposits: PlasticDepositEntry[] = [
    { id: uuidv4(), student_id: '11111111-1111-1111-1111-111111111111', student_name: 'Alex Chen', bottle_count: 8, weight_grams: 240, recycling_type: 'PET', points_earned: 80, station_code: 'STATION-MAIN-01', deposited_at: new Date(Date.now() - 3600000 * 1).toISOString() },
    { id: uuidv4(), student_id: '22222222-2222-2222-2222-222222222222', student_name: 'Samantha Ray', bottle_count: 14, weight_grams: 420, recycling_type: 'PET', points_earned: 140, station_code: 'STATION-NORTH-02', deposited_at: new Date(Date.now() - 3600000 * 3).toISOString() },
    { id: uuidv4(), student_id: '33333333-3333-3333-3333-333333333333', student_name: 'Marcus Brody', bottle_count: 5, weight_grams: 150, recycling_type: 'HDPE', points_earned: 50, station_code: 'STATION-DORM-01', deposited_at: new Date(Date.now() - 3600000 * 4).toISOString() },
  ];

  studentBalances: Map<string, StudentBalance> = new Map([
    ['11111111-1111-1111-1111-111111111111', { student_id: '11111111-1111-1111-1111-111111111111', student_name: 'Alex Chen', total_points: 380, total_bottles_recycled: 38, updated_at: new Date().toISOString() }],
    ['22222222-2222-2222-2222-222222222222', { student_id: '22222222-2222-2222-2222-222222222222', student_name: 'Samantha Ray', total_points: 520, total_bottles_recycled: 52, updated_at: new Date().toISOString() }],
    ['33333333-3333-3333-3333-333333333333', { student_id: '33333333-3333-3333-3333-333333333333', student_name: 'Marcus Brody', total_points: 210, total_bottles_recycled: 21, updated_at: new Date().toISOString() }],
  ]);

  rewardCatalog: RewardItem[] = [
    { id: 'rew-01', title: '$10 Campus Bookstore Voucher', description: 'Redeemable on textbooks, electronics, and university merchandise.', points_cost: 250, category: 'Bookstore', available_stock: 50, voucher_code_prefix: 'BOOK' },
    { id: 'rew-02', title: 'Free Organic Cafeteria Meal', description: 'Complimentary lunch or dinner combo at any campus dining hall.', points_cost: 180, category: 'Cafeteria', available_stock: 80, voucher_code_prefix: 'MEAL' },
    { id: 'rew-03', title: 'Stainless Steel Eco Water Bottle', description: 'BPA-free vacuum insulated 750ml flask with campus sustainability logo.', points_cost: 300, category: 'Eco-Merch', available_stock: 35, voucher_code_prefix: 'BOTTLE' },
    { id: 'rew-04', title: 'Priority Campus Bike Share Pass (1 Month)', description: 'Unlimited access to the university electric bicycle sharing network.', points_cost: 400, category: 'Campus Services', available_stock: 20, voucher_code_prefix: 'BIKE' },
    { id: 'rew-05', title: 'Recycled Campus Notebook & Pen Set', description: 'Notebook made from 100% post-consumer recycled paper and bamboo pen.', points_cost: 120, category: 'Stationery', available_stock: 100, voucher_code_prefix: 'NOTE' },
    { id: 'rew-06', title: 'Fair Trade Espresso Bar Voucher (5 Cups)', description: 'Redeemable for 5 handcrafted espresso drinks at the Science Cafe.', points_cost: 220, category: 'Cafeteria', available_stock: 45, voucher_code_prefix: 'CAFE' },
  ];

  rewardRedemptions: RewardRedemptionEntry[] = [
    { id: uuidv4(), student_id: '11111111-1111-1111-1111-111111111111', reward_id: 'rew-02', item_name: 'Free Organic Cafeteria Meal', points_spent: 180, voucher_code: 'MEAL-7894-ECO', status: 'active', redeemed_at: new Date(Date.now() - 86400000 * 2).toISOString() }
  ];

  rainwaterTanks: RainwaterTank[] = [
    { id: uuidv4(), tank_name: 'North Quad Cistern Alpha', capacity_liters: 50000.0, current_liters: 38400.0, inflow_rate_lpm: 18.5, outflow_rate_lpm: 12.0, filter_health_pct: 94, catchment_area_sqm: 2400.0, updated_at: new Date().toISOString() },
    { id: uuidv4(), tank_name: 'Science Rooftop Harvester Beta', capacity_liters: 35000.0, current_liters: 29800.0, inflow_rate_lpm: 14.0, outflow_rate_lpm: 9.5, filter_health_pct: 88, catchment_area_sqm: 1800.0, updated_at: new Date().toISOString() },
    { id: uuidv4(), tank_name: 'Library Underground Reservoir', capacity_liters: 75000.0, current_liters: 48200.0, inflow_rate_lpm: 26.0, outflow_rate_lpm: 22.0, filter_health_pct: 72, catchment_area_sqm: 3600.0, updated_at: new Date().toISOString() },
    { id: uuidv4(), tank_name: 'Athletic Field Runoff Basin', capacity_liters: 60000.0, current_liters: 18500.0, inflow_rate_lpm: 5.0, outflow_rate_lpm: 30.0, filter_health_pct: 96, catchment_area_sqm: 4500.0, updated_at: new Date().toISOString() },
  ];

  airQualityLogs: AirQualityEntry[] = [
    { id: uuidv4(), zone_name: 'Central Campus Plaza (Outdoor)', aqi: 42, pm2_5: 9.4, pm10: 18.2, co2_ppm: 412, voc_ppb: 18.0, temperature_c: 24.2, humidity_pct: 48.0, recorded_at: new Date(Date.now() - 900000).toISOString() },
    { id: uuidv4(), zone_name: 'Engineering Machine Shop (Indoor)', aqi: 88, pm2_5: 28.5, pm10: 54.0, co2_ppm: 785, voc_ppb: 95.0, temperature_c: 23.5, humidity_pct: 52.0, recorded_at: new Date(Date.now() - 900000).toISOString() },
    { id: uuidv4(), zone_name: 'Science Lab Wing C (Indoor)', aqi: 54, pm2_5: 14.2, pm10: 26.0, co2_ppm: 590, voc_ppb: 42.0, temperature_c: 22.8, humidity_pct: 50.0, recorded_at: new Date(Date.now() - 900000).toISOString() },
    { id: uuidv4(), zone_name: 'Main Library Reading Hall (Indoor)', aqi: 36, pm2_5: 7.8, pm10: 14.5, co2_ppm: 510, voc_ppb: 16.0, temperature_c: 22.0, humidity_pct: 49.0, recorded_at: new Date(Date.now() - 900000).toISOString() },
    { id: uuidv4(), zone_name: 'Dining Pavilion Kitchen Area (Indoor)', aqi: 115, pm2_5: 41.2, pm10: 78.0, co2_ppm: 940, voc_ppb: 140.0, temperature_c: 27.5, humidity_pct: 68.0, recorded_at: new Date(Date.now() - 900000).toISOString() },
    { id: uuidv4(), zone_name: 'Student Quad Lawn (Outdoor)', aqi: 38, pm2_5: 8.2, pm10: 16.0, co2_ppm: 408, voc_ppb: 14.0, temperature_c: 25.0, humidity_pct: 46.0, recorded_at: new Date(Date.now() - 900000).toISOString() },
    { id: uuidv4(), zone_name: 'West Perimeter Transit Hub (Outdoor)', aqi: 128, pm2_5: 46.8, pm10: 88.5, co2_ppm: 480, voc_ppb: 85.0, temperature_c: 26.2, humidity_pct: 44.0, recorded_at: new Date(Date.now() - 900000).toISOString() },
  ];

  systemAlerts: SystemAlertEntry[] = [
    { id: uuidv4(), domain: 'water', severity: 'critical', message: 'Critical leak alert: WTR-MAIN-NORTH flow is 142.5 L/min (+67% over baseline). Possible main pipe rupture.', is_resolved: false, created_at: new Date(Date.now() - 1800000).toISOString() },
    { id: uuidv4(), domain: 'dustbin', severity: 'critical', message: 'Bin BIN-CENTRAL-01 at Central Plaza exceeded 90% capacity (92%). Immediate collection dispatched.', is_resolved: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: uuidv4(), domain: 'air', severity: 'warning', message: 'West Perimeter Transit Hub AQI elevated to 128 (Unhealthy for sensitive groups). Ventilation active.', is_resolved: false, created_at: new Date(Date.now() - 5400000).toISOString() },
    { id: uuidv4(), domain: 'dustbin', severity: 'warning', message: 'Bin BIN-CAF-PATIO at Dining Quad Patio at 88% capacity. Needs emptying before lunch rush.', is_resolved: false, created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: uuidv4(), domain: 'water', severity: 'warning', message: 'Science Center Sub-basement WTR-SCI-BASE indicates abnormal micro-leak flow of 68.4 L/min.', is_resolved: false, created_at: new Date(Date.now() - 9000000).toISOString() },
    { id: uuidv4(), domain: 'energy', severity: 'info', message: 'Engineering Innovation Complex approaching 85% peak demand limit (210 kW peak).', is_resolved: false, created_at: new Date(Date.now() - 10800000).toISOString() },
  ];

  // Helper methods
  addAlert(domain: SystemAlertEntry['domain'], severity: SystemAlertEntry['severity'], message: string) {
    const alert: SystemAlertEntry = {
      id: uuidv4(),
      domain,
      severity,
      message,
      is_resolved: false,
      created_at: new Date().toISOString()
    };
    this.systemAlerts.unshift(alert);
    return alert;
  }
}

export const store = new CampusDataStore();
