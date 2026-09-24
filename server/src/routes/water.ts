// server/src/routes/water.ts
import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';
import { WaterSensorTelemetrySchema, WaterLeakAnalysisRequestSchema } from '../schemas.js';
import { store } from '../services/store.js';
import { analyzeWaterLeak } from '../services/aiService.js';

const router = Router();

// GET all water sensors and hydraulic status
router.get('/sensors', authenticateToken, async (req: Request, res: Response) => {
  const sensors = [...store.waterSensors];
  const totalSensors = sensors.length;
  const activeLeaks = sensors.filter(s => s.is_leak_detected).length;
  const criticalLeaks = sensors.filter(s => s.severity === 'critical').length;
  const totalFlowLpm = sensors.reduce((acc, s) => acc + s.current_flow_lpm, 0);
  const baselineFlowLpm = sensors.reduce((acc, s) => acc + s.baseline_flow_lpm, 0);
  const flowDeviationPct = baselineFlowLpm > 0 
    ? Number((((totalFlowLpm - baselineFlowLpm) / baselineFlowLpm) * 100).toFixed(1)) 
    : 0;

  res.json({
    metrics: {
      totalSensors,
      activeLeaks,
      criticalLeaks,
      totalFlowLpm: Number(totalFlowLpm.toFixed(1)),
      baselineFlowLpm: Number(baselineFlowLpm.toFixed(1)),
      flowDeviationPct,
      dailyEstimatedLossLiters: activeLeaks * 3200,
    },
    sensors,
  });
});

// POST flow telemetry update
router.post('/telemetry', authenticateToken, requireStaffOrAdmin, validateBody(WaterSensorTelemetrySchema), async (req: Request, res: Response) => {
  const { sensor_code, pipe_zone, current_flow_lpm, baseline_flow_lpm, pressure_psi } = req.body;

  const delta = current_flow_lpm - baseline_flow_lpm;
  const is_leak = delta > 10;
  let severity: 'none' | 'minor' | 'major' | 'critical' = 'none';

  if (delta > 40 || (pressure_psi && pressure_psi < 35)) {
    severity = 'critical';
  } else if (delta > 20) {
    severity = 'major';
  } else if (delta > 10) {
    severity = 'minor';
  }

  let sensor = store.waterSensors.find(s => s.sensor_code === sensor_code);
  if (sensor) {
    sensor.current_flow_lpm = current_flow_lpm;
    sensor.baseline_flow_lpm = baseline_flow_lpm;
    sensor.pressure_psi = pressure_psi || sensor.pressure_psi;
    sensor.is_leak_detected = is_leak;
    sensor.severity = severity;
    sensor.updated_at = new Date().toISOString();
  } else {
    sensor = {
      id: crypto.randomUUID(),
      sensor_code,
      pipe_zone,
      current_flow_lpm,
      baseline_flow_lpm,
      pressure_psi: pressure_psi || 45.0,
      is_leak_detected: is_leak,
      severity,
      valve_status: 'OPEN',
      updated_at: new Date().toISOString(),
    };
    store.waterSensors.push(sensor);
  }

  // Raise system alert if severe leak
  if (severity === 'critical' || severity === 'major') {
    store.addAlert(
      'water',
      severity === 'critical' ? 'critical' : 'warning',
      `Water Anomaly: Sensor [${sensor_code}] in ${pipe_zone} detected flow rate of ${current_flow_lpm} L/min (baseline: ${baseline_flow_lpm} L/min). Flow deviation +${delta.toFixed(1)} L/min.`
    );
  }

  res.status(200).json({
    message: 'Water sensor telemetry recorded',
    sensor,
  });
});

// POST AI pipe leak diagnostic & isolation instructions
router.post('/analyze', authenticateToken, requireStaffOrAdmin, validateBody(WaterLeakAnalysisRequestSchema), async (req: Request, res: Response) => {
  try {
    const analysis = await analyzeWaterLeak(req.body);
    res.json({
      success: true,
      input: req.body,
      analysis,
    });
  } catch (error: any) {
    console.error('[Water AI Analysis] Error:', error.message);
    res.status(500).json({ error: 'Failed to analyze water leak diagnostics' });
  }
});

// POST toggle valve status
router.post('/valve/:sensorCode', authenticateToken, requireStaffOrAdmin, async (req: Request, res: Response) => {
  const { sensorCode } = req.params;
  const { action } = req.body; // 'OPEN' | 'THROTTLED' | 'ISOLATED'

  const sensor = store.waterSensors.find(s => s.sensor_code === sensorCode);
  if (!sensor) {
    res.status(404).json({ error: `Sensor ${sensorCode} not found` });
    return;
  }

  if (['OPEN', 'THROTTLED', 'ISOLATED'].includes(action)) {
    sensor.valve_status = action;
    sensor.updated_at = new Date().toISOString();

    if (action === 'ISOLATED') {
      sensor.current_flow_lpm = 0;
      sensor.is_leak_detected = false;
      sensor.severity = 'none';
      store.addAlert('water', 'info', `Zone valve for ${sensorCode} (${sensor.pipe_zone}) has been ISOLATED by facility staff.`);
    }

    res.json({
      message: `Valve status for ${sensorCode} updated to ${action}`,
      sensor,
    });
  } else {
    res.status(400).json({ error: "Invalid action. Must be 'OPEN', 'THROTTLED', or 'ISOLATED'" });
  }
});

export default router;
