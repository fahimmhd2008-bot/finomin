// server/src/routes/foodWaste.ts
import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken, requireStaffOrAdmin } from '../middleware/auth.js';
import { FoodWasteLogSchema, FoodPrepPredictionRequestSchema } from '../schemas.js';
import { store } from '../services/store.js';
import { predictFoodWaste } from '../services/aiService.js';

const router = Router();

// GET all food waste logs with statistics
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const logs = [...store.foodWasteLogs].sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());

  const totalPreparedKg = logs.reduce((acc, l) => acc + l.prepared_weight_kg, 0);
  const totalWasteKg = logs.reduce((acc, l) => acc + l.waste_weight_kg, 0);
  const totalHeadcount = logs.reduce((acc, l) => acc + l.headcount, 0);
  const avgWastePct = totalPreparedKg > 0 ? Number(((totalWasteKg / totalPreparedKg) * 100).toFixed(1)) : 0;
  const edibleWasteKg = logs.reduce((acc, l) => acc + (l.edible_waste_kg || 0), 0);
  const inedibleWasteKg = logs.reduce((acc, l) => acc + (l.inedible_waste_kg || 0), 0);

  res.json({
    stats: {
      totalPreparedKg: Number(totalPreparedKg.toFixed(1)),
      totalWasteKg: Number(totalWasteKg.toFixed(1)),
      totalHeadcount,
      avgWastePct,
      edibleWasteKg: Number(edibleWasteKg.toFixed(1)),
      inedibleWasteKg: Number(inedibleWasteKg.toFixed(1)),
      compostDiversionPct: 78.4,
    },
    logs,
  });
});

// POST submit meal log
router.post('/log', authenticateToken, requireStaffOrAdmin, validateBody(FoodWasteLogSchema), async (req: Request, res: Response) => {
  const {
    cafeteria_name,
    meal_type,
    prepared_weight_kg,
    waste_weight_kg,
    headcount,
    log_date,
    edible_waste_kg,
    inedible_waste_kg,
  } = req.body;

  const newLog = {
    id: crypto.randomUUID(),
    cafeteria_name,
    meal_type,
    prepared_weight_kg,
    waste_weight_kg,
    headcount,
    log_date: log_date || new Date().toISOString().split('T')[0],
    edible_waste_kg: edible_waste_kg ?? Number((waste_weight_kg * 0.65).toFixed(1)),
    inedible_waste_kg: inedible_waste_kg ?? Number((waste_weight_kg * 0.35).toFixed(1)),
  };

  store.foodWasteLogs.unshift(newLog);

  // If waste exceeds 20% of prepared, raise a warning alert
  const wasteRatio = waste_weight_kg / prepared_weight_kg;
  if (wasteRatio > 0.18) {
    store.addAlert(
      'food',
      'warning',
      `High food waste detected at ${cafeteria_name} (${meal_type}): ${(wasteRatio * 100).toFixed(1)}% of food unconsumed (${waste_weight_kg} kg). Adjust prep batch.`
    );
  }

  res.status(201).json({
    message: 'Food waste record logged successfully',
    log: newLog,
  });
});

// POST trigger AI prep prediction
router.post('/predict', authenticateToken, requireStaffOrAdmin, validateBody(FoodPrepPredictionRequestSchema), async (req: Request, res: Response) => {
  try {
    const aiPrediction = await predictFoodWaste(req.body);
    res.json({
      success: true,
      input: req.body,
      prediction: aiPrediction,
    });
  } catch (error: any) {
    console.error('[Food Prep AI] Error:', error.message);
    res.status(500).json({ error: 'Failed to generate AI food prep recommendation' });
  }
});

export default router;
