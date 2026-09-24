import { z } from 'zod';

// ==========================================
// 1. SMART DUSTBIN SCHEMAS
// ==========================================
export const DustbinTelemetrySchema = z.object({
  bin_code: z.string().min(2, 'Bin code is required'),
  zone_name: z.string().min(2, 'Zone name is required'),
  fill_level: z.number().min(0).max(100, 'Fill level must be between 0 and 100'),
  battery_level: z.number().min(0).max(100, 'Battery level must be between 0 and 100'),
  status: z.enum(['ok', 'warning', 'critical']).optional(),
});

export const DustbinCleanSchema = z.object({
  bin_code: z.string().min(2),
  notes: z.string().optional(),
});

// ==========================================
// 2. FOOD WASTE REDUCTION SCHEMAS
// ==========================================
export const FoodWasteLogSchema = z.object({
  cafeteria_name: z.string().min(2, 'Cafeteria name is required'),
  meal_type: z.enum(['Breakfast', 'Lunch', 'Dinner']),
  prepared_weight_kg: z.number().positive('Prepared weight must be greater than 0'),
  waste_weight_kg: z.number().min(0, 'Waste weight cannot be negative'),
  headcount: z.number().int().positive('Headcount must be positive integer'),
  log_date: z.string().optional(),
  edible_waste_kg: z.number().min(0).optional(),
  inedible_waste_kg: z.number().min(0).optional(),
});

export const FoodPrepPredictionRequestSchema = z.object({
  cafeteria_name: z.string().min(2),
  meal_type: z.enum(['Breakfast', 'Lunch', 'Dinner']),
  target_date: z.string(),
  expected_headcount: z.number().int().positive(),
  historical_avg_waste_kg: z.number().min(0),
  weather_forecast: z.string().default('Sunny, 24°C'),
  special_events: z.string().optional(),
});

// ==========================================
// 3. SMART WATER LEAK DETECTOR SCHEMAS
// ==========================================
export const WaterSensorTelemetrySchema = z.object({
  sensor_code: z.string().min(2),
  pipe_zone: z.string().min(2),
  current_flow_lpm: z.number().min(0),
  baseline_flow_lpm: z.number().min(0),
  pressure_psi: z.number().min(0).optional().default(45.0),
  is_leak_detected: z.boolean().optional(),
  severity: z.enum(['none', 'minor', 'major', 'critical']).optional(),
});

export const WaterLeakAnalysisRequestSchema = z.object({
  sensor_code: z.string().min(2),
  pipe_zone: z.string().min(2),
  current_flow: z.number().min(0),
  baseline_flow: z.number().min(0),
  pressure_psi: z.number().min(0),
});

// ==========================================
// 4. CAMPUS ENERGY SCHEMAS
// ==========================================
export const EnergyLogSchema = z.object({
  building_name: z.string().min(2),
  kwh_consumed: z.number().min(0),
  peak_demand_kw: z.number().min(0),
  power_factor: z.number().min(0).max(1).optional().default(0.95),
  recorded_at: z.string().optional(),
});

export const EnergyOptimizationRequestSchema = z.object({
  building_name: z.string().min(2),
  current_load_kw: z.number().min(0),
  peak_threshold_kw: z.number().min(0),
  ambient_temp_c: z.number().default(28.0),
  occupancy_estimate: z.number().min(0).default(350),
  hvac_status: z.string().default('Active (Auto-cool)'),
});

// ==========================================
// 5. PLASTIC COLLECTION REWARDS SCHEMAS
// ==========================================
export const PlasticDepositSchema = z.object({
  student_id: z.string().uuid('Valid Student UUID required'),
  bottle_count: z.number().int().positive('Bottle count must be at least 1'),
  weight_grams: z.number().min(0).optional(),
  recycling_type: z.enum(['PET', 'HDPE', 'Mixed']).default('PET'),
  station_code: z.string().optional().default('STATION-NORTH-01'),
});

export const RewardRedemptionSchema = z.object({
  student_id: z.string().uuid(),
  reward_id: z.string().min(2),
  points_required: z.number().int().positive(),
  item_name: z.string().min(2),
});

// ==========================================
// 6. RAINWATER HARVESTING SCHEMAS
// ==========================================
export const RainwaterTelemetrySchema = z.object({
  tank_name: z.string().min(2),
  capacity_liters: z.number().positive(),
  current_liters: z.number().min(0),
  inflow_rate_lpm: z.number().min(0).optional().default(0),
  outflow_rate_lpm: z.number().min(0).optional().default(0),
  filter_health_pct: z.number().min(0).max(100).default(100),
});

export const RainwaterForecastRequestSchema = z.object({
  tank_name: z.string().min(2),
  rainfall_forecast_mm: z.number().min(0),
  catchment_area_sqm: z.number().positive(),
  runoff_coefficient: z.number().min(0).max(1).default(0.85),
});

// ==========================================
// 7. AIR QUALITY (AQI) SCHEMAS
// ==========================================
export const AirQualitySchema = z.object({
  zone_name: z.string().min(2),
  aqi: z.number().int().min(0).max(500),
  pm2_5: z.number().min(0),
  pm10: z.number().min(0),
  co2_ppm: z.number().int().positive(),
  voc_ppb: z.number().min(0).optional().default(45),
  temperature_c: z.number().optional().default(24.5),
  humidity_pct: z.number().min(0).max(100).optional().default(55),
});

// ==========================================
// 8. MASTER CAMPUS ADVISORY SCHEMAS
// ==========================================
export const MasterAdvisoryRequestSchema = z.object({
  dustbin_critical_count: z.number().int().min(0).default(0),
  food_waste_total_kg: z.number().min(0).default(0),
  water_leaks_detected: z.number().int().min(0).default(0),
  energy_peak_demand_kw: z.number().min(0).default(0),
  plastic_bottles_today: z.number().int().min(0).default(0),
  rainwater_storage_pct: z.number().min(0).max(100).default(0),
  max_aqi_recorded: z.number().int().min(0).default(0),
  campus_event_notes: z.string().optional().default('Regular academic workday'),
});

// ==========================================
// 9. SYSTEM ALERTS SCHEMAS
// ==========================================
export const SystemAlertSchema = z.object({
  domain: z.enum(['dustbin', 'food', 'water', 'energy', 'plastic', 'rainwater', 'air']),
  severity: z.enum(['info', 'warning', 'critical']),
  message: z.string().min(5),
  is_resolved: z.boolean().default(false),
});

// Type exports
export type DustbinTelemetry = z.infer<typeof DustbinTelemetrySchema>;
export type FoodWasteLog = z.infer<typeof FoodWasteLogSchema>;
export type FoodPrepPredictionRequest = z.infer<typeof FoodPrepPredictionRequestSchema>;
export type WaterSensorTelemetry = z.infer<typeof WaterSensorTelemetrySchema>;
export type WaterLeakAnalysisRequest = z.infer<typeof WaterLeakAnalysisRequestSchema>;
export type EnergyLog = z.infer<typeof EnergyLogSchema>;
export type EnergyOptimizationRequest = z.infer<typeof EnergyOptimizationRequestSchema>;
export type PlasticDeposit = z.infer<typeof PlasticDepositSchema>;
export type RewardRedemption = z.infer<typeof RewardRedemptionSchema>;
export type RainwaterTelemetry = z.infer<typeof RainwaterTelemetrySchema>;
export type AirQuality = z.infer<typeof AirQualitySchema>;
export type MasterAdvisoryRequest = z.infer<typeof MasterAdvisoryRequestSchema>;
export type SystemAlert = z.infer<typeof SystemAlertSchema>;
