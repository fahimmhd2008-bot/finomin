// server/src/routes/dustbins.ts
import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';
import { DustbinTelemetrySchema } from '../schemas.js';
import { store } from '../services/store.js';

const router = Router();

// GET all dustbins
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const { zone, status } = req.query;
  let bins = [...store.dustbins];

  if (zone) {
    bins = bins.filter(b => b.zone_name.toLowerCase().includes(String(zone).toLowerCase()));
  }
  if (status) {
    bins = bins.filter(b => b.status === status);
  }

  // Calculate summary metrics
  const total = bins.length;
  const critical = bins.filter(b => b.fill_level >= 85).length;
  const warning = bins.filter(b => b.fill_level >= 60 && b.fill_level < 85).length;
  const ok = bins.filter(b => b.fill_level < 60).length;
  const avgFill = Math.round(bins.reduce((acc, b) => acc + b.fill_level, 0) / (total || 1));

  res.json({
    metrics: { total, critical, warning, ok, avgFill },
    dustbins: bins,
  });
});

// POST telemetry update
router.post('/telemetry', authenticateToken, requireStaffOrAdmin, validateBody(DustbinTelemetrySchema), async (req: Request, res: Response) => {
  const { bin_code, zone_name, fill_level, battery_level } = req.body;

  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (fill_level >= 85) {
    status = 'critical';
  } else if (fill_level >= 60) {
    status = 'warning';
  }

  // Find or create bin
  let bin = store.dustbins.find(b => b.bin_code === bin_code);
  if (bin) {
    bin.fill_level = fill_level;
    bin.battery_level = battery_level;
    bin.status = status;
    bin.zone_name = zone_name;
  } else {
    bin = {
      id: crypto.randomUUID(),
      bin_code,
      zone_name,
      fill_level,
      battery_level,
      last_cleaned_at: new Date().toISOString(),
      status,
      latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
    };
    store.dustbins.push(bin);
  }

  // Trigger automated critical alert if threshold exceeded
  if (fill_level >= 85) {
    store.addAlert(
      'dustbin',
      'critical',
      `High overflow hazard: Smart Dustbin [${bin_code}] at ${zone_name} has reached ${fill_level}% capacity.`
    );
  }

  res.status(200).json({
    message: 'Telemetry logged successfully',
    bin,
  });
});

// POST clean dustbin
router.post('/:binCode/clean', authenticateToken, requireStaffOrAdmin, async (req: Request, res: Response) => {
  const { binCode } = req.params;
  const bin = store.dustbins.find(b => b.bin_code === binCode);

  if (!bin) {
    res.status(404).json({ error: `Bin with code ${binCode} not found` });
    return;
  }

  bin.fill_level = 0;
  bin.status = 'ok';
  bin.last_cleaned_at = new Date().toISOString();

  res.json({
    message: `Bin ${binCode} successfully marked as cleaned and emptied.`,
    bin,
  });
});

// GET route optimization for waste collection
router.get('/route-plan', authenticateToken, requireStaffOrAdmin, async (req: Request, res: Response) => {
  // Sort bins prioritizing fill level > 85% first, then > 60%
  const priorityBins = store.dustbins
    .filter(b => b.fill_level >= 60)
    .sort((a, b) => b.fill_level - a.fill_level);

  const routePlan = priorityBins.map((bin, index) => ({
    stop_sequence: index + 1,
    bin_code: bin.bin_code,
    zone_name: bin.zone_name,
    fill_level: bin.fill_level,
    urgency: bin.fill_level >= 85 ? 'URGENT - Dispatch Immediately' : 'HIGH - Empty in next sweep',
    estimated_stop_duration_mins: 5,
  }));

  const estimatedTotalTimeMins = routePlan.length * 8; // 5 min stop + 3 min transit

  res.json({
    total_stops: routePlan.length,
    estimated_total_time_mins: estimatedTotalTimeMins,
    stops: routePlan,
  });
});

export default router;
