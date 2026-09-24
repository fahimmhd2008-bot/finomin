// server/src/routes/energy.ts
import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';
import { EnergyLogSchema, EnergyOptimizationRequestSchema } from '../schemas.js';
import { store } from '../services/store.js';
import { optimizeEnergyLoad } from '../services/aiService.js';

const router = Router();

// GET campus energy metrics and building loads
router.get('/buildings', authenticateToken, async (req: Request, res: Response) => {
  const buildings = [...store.energyLogs];

  const totalKwh = buildings.reduce((acc, b) => acc + b.kwh_consumed, 0);
  const maxPeakDemandKw = Math.max(...buildings.map(b => b.peak_demand_kw), 0);
  const totalCarbonKg = buildings.reduce((acc, b) => acc + b.carbon_kg_est, 0);
  const avgPowerFactor = buildings.reduce((acc, b) => acc + b.power_factor, 0) / (buildings.length || 1);

  res.json({
    metrics: {
      totalKwh: Number(totalKwh.toFixed(1)),
      maxPeakDemandKw: Number(maxPeakDemandKw.toFixed(1)),
      totalCarbonKg: Number(totalCarbonKg.toFixed(1)),
      avgPowerFactor: Number(avgPowerFactor.toFixed(2)),
      activeBuildingsMonitored: buildings.length,
      gridStatus: maxPeakDemandKw > 250 ? 'PEAK ALERT' : 'NORMAL STABLE',
    },
    buildings,
  });
});

// POST submit building energy reading
router.post('/log', authenticateToken, requireStaffOrAdmin, validateBody(EnergyLogSchema), async (req: Request, res: Response) => {
  const { building_name, kwh_consumed, peak_demand_kw, power_factor } = req.body;

  const carbon_kg_est = Number((kwh_consumed * 0.45).toFixed(1)); // 0.45 kg CO2 per kWh grid factor

  const newLog = {
    id: crypto.randomUUID(),
    building_name,
    kwh_consumed,
    peak_demand_kw,
    power_factor: power_factor || 0.95,
    carbon_kg_est,
    recorded_at: new Date().toISOString(),
  };

  store.energyLogs.push(newLog);

  // If peak demand exceeds 250 kW, trigger load shedding warning
  if (peak_demand_kw > 250) {
    store.addAlert(
      'energy',
      'warning',
      `Peak Demand Surge: Building [${building_name}] registered ${peak_demand_kw} kW. Immediate HVAC cycling recommended.`
    );
  }

  res.status(201).json({
    message: 'Energy log created',
    entry: newLog,
  });
});

// POST AI peak shaving and HVAC schedule optimizer
router.post('/optimize', authenticateToken, requireStaffOrAdmin, validateBody(EnergyOptimizationRequestSchema), async (req: Request, res: Response) => {
  try {
    const optimization = await optimizeEnergyLoad(req.body);
    res.json({
      success: true,
      input: req.body,
      optimization,
    });
  } catch (error: any) {
    console.error('[Energy AI Optimization] Error:', error.message);
    res.status(500).json({ error: 'Failed to generate energy optimization schedule' });
  }
});

export default router;
