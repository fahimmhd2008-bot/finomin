// server/src/routes/ai.ts
import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';
import { MasterAdvisoryRequestSchema } from '../schemas.js';
import { generateMasterAdvisory } from '../services/aiService.js';
import { store } from '../services/store.js';

const router = Router();

// POST generate comprehensive AI master advisory across all 7 domains
router.post('/master-advisory', authenticateToken, requireStaffOrAdmin, validateBody(MasterAdvisoryRequestSchema), async (req: Request, res: Response) => {
  try {
    const input = req.body;
    const advisory = await generateMasterAdvisory(input);

    res.json({
      success: true,
      input,
      advisory,
    });
  } catch (error: any) {
    console.error('[Master Advisory AI] Error:', error.message);
    res.status(500).json({ error: 'Failed to synthesize master campus sustainability advisory' });
  }
});

// GET automated synthesis based on current real-time store metrics
router.get('/auto-synthesize', authenticateToken, async (req: Request, res: Response) => {
  try {
    const dustbins = store.dustbins;
    const foodLogs = store.foodWasteLogs;
    const waterSensors = store.waterSensors;
    const energyLogs = store.energyLogs;
    const balances = Array.from(store.studentBalances.values());
    const rainwaterTanks = store.rainwaterTanks;
    const aqiLogs = store.airQualityLogs;

    const totalCapacity = rainwaterTanks.reduce((a, b) => a + b.capacity_liters, 0);
    const currentStored = rainwaterTanks.reduce((a, b) => a + b.current_liters, 0);

    const telemetryInput = {
      dustbin_critical_count: dustbins.filter(b => b.fill_level >= 85).length,
      food_waste_total_kg: foodLogs.reduce((a, b) => a + b.waste_weight_kg, 0),
      water_leaks_detected: waterSensors.filter(s => s.is_leak_detected).length,
      energy_peak_demand_kw: Math.max(...energyLogs.map(b => b.peak_demand_kw), 0),
      plastic_bottles_today: balances.reduce((a, b) => a + b.total_bottles_recycled, 0),
      rainwater_storage_pct: totalCapacity > 0 ? Math.round((currentStored / totalCapacity) * 100) : 0,
      max_aqi_recorded: Math.max(...aqiLogs.map(b => b.aqi), 0),
      campus_event_notes: 'Academic peak semester; mid-term laboratory sessions running.',
    };

    const advisory = await generateMasterAdvisory(telemetryInput);

    res.json({
      success: true,
      telemetry: telemetryInput,
      advisory,
    });
  } catch (error: any) {
    console.error('[AI Auto Synthesize] Error:', error.message);
    res.status(500).json({ error: 'Failed to auto-synthesize campus intelligence advisory' });
  }
});

export default router;
