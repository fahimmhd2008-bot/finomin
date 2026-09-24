// server/src/routes/airQuality.ts
import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';
import { AirQualitySchema } from '../schemas.js';
import { store } from '../services/store.js';

const router = Router();

// Helper to determine AQI category
function getAqiCategory(aqi: number) {
  if (aqi <= 50) return { level: 'Good', color: 'emerald', advisory: 'Air quality is satisfactory and poses little or no risk.' };
  if (aqi <= 100) return { level: 'Moderate', color: 'amber', advisory: 'Air quality is acceptable. Unusually sensitive individuals should limit prolonged outdoor exertion.' };
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'orange', advisory: 'Members of sensitive groups may experience health effects. General public not likely affected.' };
  if (aqi <= 200) return { level: 'Unhealthy', color: 'rose', advisory: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.' };
  return { level: 'Hazardous', color: 'purple', advisory: 'Emergency health warning: serious health effects for entire campus population. Close outdoor facilities.' };
}

// GET all air quality zones
router.get('/zones', authenticateToken, async (req: Request, res: Response) => {
  const zones = store.airQualityLogs.map(zone => {
    const category = getAqiCategory(zone.aqi);
    return {
      ...zone,
      category: category.level,
      color: category.color,
      advisory: category.advisory,
    };
  });

  const avgAqi = Math.round(zones.reduce((acc, z) => acc + z.aqi, 0) / (zones.length || 1));
  const maxAqi = Math.max(...zones.map(z => z.aqi), 0);
  const worstZone = zones.find(z => z.aqi === maxAqi);
  const campusOverallStatus = getAqiCategory(avgAqi);

  res.json({
    summary: {
      avgAqi,
      maxAqi,
      overallCategory: campusOverallStatus.level,
      worstZoneName: worstZone?.zone_name || 'N/A',
      activeSensorsCount: zones.length,
      generalHealthAdvisory: campusOverallStatus.advisory,
    },
    zones,
  });
});

// POST log air quality telemetry
router.post('/telemetry', authenticateToken, requireStaffOrAdmin, validateBody(AirQualitySchema), async (req: Request, res: Response) => {
  const { zone_name, aqi, pm2_5, pm10, co2_ppm, voc_ppb, temperature_c, humidity_pct } = req.body;

  let zone = store.airQualityLogs.find(z => z.zone_name === zone_name);
  if (zone) {
    zone.aqi = aqi;
    zone.pm2_5 = pm2_5;
    zone.pm10 = pm10;
    zone.co2_ppm = co2_ppm;
    zone.voc_ppb = voc_ppb ?? zone.voc_ppb;
    zone.temperature_c = temperature_c ?? zone.temperature_c;
    zone.humidity_pct = humidity_pct ?? zone.humidity_pct;
    zone.recorded_at = new Date().toISOString();
  } else {
    zone = {
      id: crypto.randomUUID(),
      zone_name,
      aqi,
      pm2_5,
      pm10,
      co2_ppm,
      voc_ppb: voc_ppb || 25,
      temperature_c: temperature_c || 24.0,
      humidity_pct: humidity_pct || 50.0,
      recorded_at: new Date().toISOString(),
    };
    store.airQualityLogs.push(zone);
  }

  // Check alert thresholds
  if (aqi > 150) {
    store.addAlert(
      'air',
      'critical',
      `Hazardous Air Alert: Zone ${zone_name} AQI spiked to ${aqi} (PM2.5: ${pm2_5} µg/m³). High-efficiency filtration dispatched.`
    );
  } else if (aqi > 100) {
    store.addAlert(
      'air',
      'warning',
      `Air Quality Advisory: Zone ${zone_name} AQI reached ${aqi} (Unhealthy for sensitive individuals).`
    );
  }

  const category = getAqiCategory(aqi);

  res.status(200).json({
    message: 'Air quality telemetry logged',
    zone: {
      ...zone,
      category: category.level,
      advisory: category.advisory,
    },
  });
});

export default router;
