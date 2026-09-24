// server/src/routes/telemetry.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';
import { store } from '../services/store.js';

const router = Router();

// GET unified overview across all 7 domains
router.get('/overview', authenticateToken, async (req: Request, res: Response) => {
  // 1. Dustbins summary
  const dustbins = store.dustbins;
  const criticalDustbins = dustbins.filter(b => b.fill_level >= 85).length;
  const avgDustbinFill = Math.round(dustbins.reduce((a, b) => a + b.fill_level, 0) / (dustbins.length || 1));

  // 2. Food Waste summary
  const foodLogs = store.foodWasteLogs;
  const totalFoodPrepKg = foodLogs.reduce((a, b) => a + b.prepared_weight_kg, 0);
  const totalFoodWasteKg = foodLogs.reduce((a, b) => a + b.waste_weight_kg, 0);
  const avgFoodWastePct = totalFoodPrepKg > 0 ? Number(((totalFoodWasteKg / totalFoodPrepKg) * 100).toFixed(1)) : 0;

  // 3. Water Sensors summary
  const waterSensors = store.waterSensors;
  const activeWaterLeaks = waterSensors.filter(s => s.is_leak_detected).length;
  const totalWaterFlowLpm = Number(waterSensors.reduce((a, b) => a + b.current_flow_lpm, 0).toFixed(1));

  // 4. Energy summary
  const energyLogs = store.energyLogs;
  const totalEnergyKwh = Number(energyLogs.reduce((a, b) => a + b.kwh_consumed, 0).toFixed(1));
  const peakDemandKw = Math.max(...energyLogs.map(b => b.peak_demand_kw), 0);
  const totalCarbonKg = Number(energyLogs.reduce((a, b) => a + b.carbon_kg_est, 0).toFixed(1));

  // 5. Plastic Rewards summary
  const balances = Array.from(store.studentBalances.values());
  const totalBottlesRecycled = balances.reduce((a, b) => a + b.total_bottles_recycled, 0);
  const totalPointsDistributed = balances.reduce((a, b) => a + b.total_points, 0);

  // 6. Rainwater summary
  const rainwaterTanks = store.rainwaterTanks;
  const totalRainCapacity = rainwaterTanks.reduce((a, b) => a + b.capacity_liters, 0);
  const currentRainLiters = rainwaterTanks.reduce((a, b) => a + b.current_liters, 0);
  const rainwaterStoredPct = totalRainCapacity > 0 ? Math.round((currentRainLiters / totalRainCapacity) * 100) : 0;

  // 7. Air Quality summary
  const aqiLogs = store.airQualityLogs;
  const avgAqi = Math.round(aqiLogs.reduce((a, b) => a + b.aqi, 0) / (aqiLogs.length || 1));
  const maxAqi = Math.max(...aqiLogs.map(b => b.aqi), 0);

  // Overall Campus Sustainability Health Index (0-100)
  let healthScore = 100;
  if (activeWaterLeaks > 0) healthScore -= activeWaterLeaks * 10;
  if (criticalDustbins > 0) healthScore -= criticalDustbins * 5;
  if (maxAqi > 100) healthScore -= Math.min(Math.round((maxAqi - 100) * 0.3), 15);
  if (avgFoodWastePct > 15) healthScore -= 8;
  healthScore = Math.max(Math.min(healthScore, 100), 20);

  // Unresolved alerts
  const activeAlerts = store.systemAlerts.filter(a => !a.is_resolved).slice(0, 8);

  res.json({
    campusHealthScore: healthScore,
    statusText: healthScore >= 80 ? 'Optimal' : healthScore >= 65 ? 'Attention Required' : 'Critical Action Needed',
    lastSyncTimestamp: new Date().toISOString(),
    domains: {
      dustbins: {
        total: dustbins.length,
        critical: criticalDustbins,
        averageFillPct: avgDustbinFill,
        status: criticalDustbins > 0 ? 'warning' : 'ok',
      },
      foodWaste: {
        totalPreparedKg: totalFoodPrepKg,
        totalWasteKg: totalFoodWasteKg,
        avgWastePct: avgFoodWastePct,
        status: avgFoodWastePct > 15 ? 'warning' : 'ok',
      },
      water: {
        totalSensors: waterSensors.length,
        activeLeaks: activeWaterLeaks,
        currentFlowLpm: totalWaterFlowLpm,
        status: activeWaterLeaks > 0 ? 'critical' : 'ok',
      },
      energy: {
        totalKwh: totalEnergyKwh,
        peakDemandKw,
        carbonKg: totalCarbonKg,
        status: peakDemandKw > 250 ? 'warning' : 'ok',
      },
      plastic: {
        totalBottlesRecycled,
        totalPointsDistributed,
        activeRecyclers: balances.length,
        status: 'ok',
      },
      rainwater: {
        totalLitersStored: currentRainLiters,
        storageCapacityPct: rainwaterStoredPct,
        autonomyDays: Number((currentRainLiters / 8500).toFixed(1)),
        status: 'ok',
      },
      airQuality: {
        avgAqi,
        maxAqi,
        status: maxAqi > 100 ? 'warning' : 'ok',
      },
    },
    alerts: activeAlerts,
  });
});

// POST resolve alert
router.post('/resolve-alert/:alertId', authenticateToken, requireStaffOrAdmin, async (req: Request, res: Response) => {
  const { alertId } = req.params;
  const alert = store.systemAlerts.find(a => a.id === alertId);

  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  alert.is_resolved = true;
  res.json({
    message: 'Alert resolved successfully',
    alert,
  });
});

export default router;
