// server/src/routes/rainwater.ts
import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';
import { RainwaterTelemetrySchema, RainwaterForecastRequestSchema } from '../schemas.js';
import { store } from '../services/store.js';

const router = Router();

// GET all rainwater tanks, volumes, and weather forecast
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  const tanks = [...store.rainwaterTanks];

  const totalCapacityLiters = tanks.reduce((acc, t) => acc + t.capacity_liters, 0);
  const currentTotalLiters = tanks.reduce((acc, t) => acc + t.current_liters, 0);
  const avgStoragePct = totalCapacityLiters > 0 
    ? Number(((currentTotalLiters / totalCapacityLiters) * 100).toFixed(1)) 
    : 0;
  const avgFilterHealth = Math.round(tanks.reduce((acc, t) => acc + t.filter_health_pct, 0) / (tanks.length || 1));

  // Precipitation forecast integration
  const weatherForecast = {
    next24hRainfallMm: 18.5,
    probabilityOfPrecipitationPct: 75,
    forecastSummary: 'Moderate to heavy evening showers expected over Northern Ridge catchment.',
    estimatedCampusRunoffYieldLiters: 92400,
  };

  res.json({
    metrics: {
      totalCapacityLiters,
      currentTotalLiters,
      avgStoragePct,
      avgFilterHealth,
      tanksCount: tanks.length,
      waterAutonomyDays: Number((currentTotalLiters / 8500).toFixed(1)), // based on 8.5k L/day non-potable demand
    },
    weatherForecast,
    tanks,
  });
});

// POST update tank telemetry
router.post('/telemetry', authenticateToken, requireStaffOrAdmin, validateBody(RainwaterTelemetrySchema), async (req: Request, res: Response) => {
  const { tank_name, capacity_liters, current_liters, inflow_rate_lpm, outflow_rate_lpm, filter_health_pct } = req.body;

  let tank = store.rainwaterTanks.find(t => t.tank_name === tank_name);
  if (tank) {
    tank.capacity_liters = capacity_liters;
    tank.current_liters = current_liters;
    tank.inflow_rate_lpm = inflow_rate_lpm ?? tank.inflow_rate_lpm;
    tank.outflow_rate_lpm = outflow_rate_lpm ?? tank.outflow_rate_lpm;
    tank.filter_health_pct = filter_health_pct ?? tank.filter_health_pct;
    tank.updated_at = new Date().toISOString();
  } else {
    tank = {
      id: crypto.randomUUID(),
      tank_name,
      capacity_liters,
      current_liters,
      inflow_rate_lpm: inflow_rate_lpm || 0,
      outflow_rate_lpm: outflow_rate_lpm || 0,
      filter_health_pct: filter_health_pct || 100,
      catchment_area_sqm: 2000,
      updated_at: new Date().toISOString(),
    };
    store.rainwaterTanks.push(tank);
  }

  // Raise warning if filter health drops below 50%
  if (filter_health_pct && filter_health_pct < 50) {
    store.addAlert(
      'rainwater',
      'warning',
      `Filter Clog Alert: ${tank_name} sediment filter degraded to ${filter_health_pct}%. Backwash cycle required.`
    );
  }

  res.status(200).json({
    message: 'Rainwater telemetry logged',
    tank,
  });
});

// POST calculate runoff yield based on rainfall forecast
router.post('/forecast', authenticateToken, requireStaffOrAdmin, validateBody(RainwaterForecastRequestSchema), async (req: Request, res: Response) => {
  const { tank_name, rainfall_forecast_mm, catchment_area_sqm, runoff_coefficient } = req.body;

  // Formula: Yield (Liters) = Rainfall (mm) * Catchment Area (m2) * Runoff Coefficient
  const estimatedYieldLiters = Number((rainfall_forecast_mm * catchment_area_sqm * (runoff_coefficient || 0.85)).toFixed(0));

  const tank = store.rainwaterTanks.find(t => t.tank_name === tank_name);
  const remainingCapacity = tank ? Math.max(tank.capacity_liters - tank.current_liters, 0) : 10000;
  const potentialOverflowLiters = Math.max(estimatedYieldLiters - remainingCapacity, 0);

  res.json({
    tank_name,
    rainfall_forecast_mm,
    catchment_area_sqm,
    runoff_coefficient: runoff_coefficient || 0.85,
    estimated_yield_liters: estimatedYieldLiters,
    remaining_storage_capacity_liters: remainingCapacity,
    projected_overflow_liters: potentialOverflowLiters,
    recommendation: potentialOverflowLiters > 0
      ? `High overflow probability! Pre-divert ${potentialOverflowLiters} Liters into ground aquifer recharge beds prior to storm front.`
      : 'Cistern has sufficient headroom to capture 100% of forecast precipitation.',
  });
});

export default router;
