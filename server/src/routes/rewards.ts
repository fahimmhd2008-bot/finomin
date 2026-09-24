// server/src/routes/rewards.ts
import { Router, Request, Response } from 'express';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken } from '../middleware/auth.js';
import { PlasticDepositSchema, RewardRedemptionSchema } from '../schemas.js';
import { store } from '../services/store.js';

const router = Router();

// GET student balance & stats
router.get('/balance/:studentId', authenticateToken, async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const balance = store.studentBalances.get(studentId) || {
    student_id: studentId,
    student_name: req.user?.full_name || 'Campus Student',
    total_points: 0,
    total_bottles_recycled: 0,
    updated_at: new Date().toISOString(),
  };

  const userDeposits = store.plasticDeposits.filter(d => d.student_id === studentId);
  const userRedemptions = store.rewardRedemptions.filter(r => r.student_id === studentId);

  res.json({
    balance,
    recentDeposits: userDeposits.slice(0, 10),
    activeVouchers: userRedemptions,
  });
});

// GET rewards catalog
router.get('/catalog', authenticateToken, async (req: Request, res: Response) => {
  res.json({
    catalog: store.rewardCatalog,
  });
});

// GET recycling leaderboard
router.get('/leaderboard', authenticateToken, async (req: Request, res: Response) => {
  const allBalances = Array.from(store.studentBalances.values())
    .sort((a, b) => b.total_bottles_recycled - a.total_bottles_recycled);

  const totalBottlesCampus = allBalances.reduce((acc, b) => acc + b.total_bottles_recycled, 0);
  const totalPointsDistributed = allBalances.reduce((acc, b) => acc + b.total_points, 0);
  const plasticKgDiverted = Number(((totalBottlesCampus * 28) / 1000).toFixed(1)); // ~28g per bottle

  res.json({
    stats: {
      totalBottlesCampus,
      totalPointsDistributed,
      plasticKgDiverted,
      activeRecyclers: allBalances.length,
    },
    leaderboard: allBalances.slice(0, 20),
  });
});

// POST record plastic deposit
router.post('/deposit', authenticateToken, validateBody(PlasticDepositSchema), async (req: Request, res: Response) => {
  const { student_id, bottle_count, weight_grams, recycling_type, station_code } = req.body;

  // Points formula: 10 points per bottle, plus bonus if weight exceeds standard
  const points_earned = bottle_count * 10;
  const weight = weight_grams || bottle_count * 28;

  const depositEntry = {
    id: crypto.randomUUID(),
    student_id,
    student_name: req.user?.full_name || 'Alex Chen',
    bottle_count,
    weight_grams: weight,
    recycling_type: recycling_type || 'PET',
    points_earned,
    station_code: station_code || 'STATION-MAIN-01',
    deposited_at: new Date().toISOString(),
  };

  store.plasticDeposits.unshift(depositEntry);

  // Update or initialize student balance
  let currentBalance = store.studentBalances.get(student_id);
  if (currentBalance) {
    currentBalance.total_points += points_earned;
    currentBalance.total_bottles_recycled += bottle_count;
    currentBalance.updated_at = new Date().toISOString();
  } else {
    currentBalance = {
      student_id,
      student_name: req.user?.full_name || 'Student Recycler',
      total_points: points_earned,
      total_bottles_recycled: bottle_count,
      updated_at: new Date().toISOString(),
    };
    store.studentBalances.set(student_id, currentBalance);
  }

  res.status(201).json({
    message: `Successfully recycled ${bottle_count} containers! Earned +${points_earned} eco points.`,
    deposit: depositEntry,
    newBalance: currentBalance,
  });
});

// POST redeem reward voucher
router.post('/redeem', authenticateToken, validateBody(RewardRedemptionSchema), async (req: Request, res: Response) => {
  const { student_id, reward_id, points_required, item_name } = req.body;

  const currentBalance = store.studentBalances.get(student_id);
  if (!currentBalance || currentBalance.total_points < points_required) {
    res.status(400).json({
      error: 'Insufficient points',
      current_points: currentBalance ? currentBalance.total_points : 0,
      points_required,
    });
    return;
  }

  // Deduct points
  currentBalance.total_points -= points_required;
  currentBalance.updated_at = new Date().toISOString();

  // Generate unique redeemable voucher
  const voucherCode = `${reward_id.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}-ECO`;
  const redemption = {
    id: crypto.randomUUID(),
    student_id,
    reward_id,
    item_name,
    points_spent: points_required,
    voucher_code: voucherCode,
    status: 'active' as const,
    redeemed_at: new Date().toISOString(),
  };

  store.rewardRedemptions.unshift(redemption);

  res.status(200).json({
    message: `Congratulations! Redeemed ${item_name}.`,
    voucher: redemption,
    remaining_points: currentBalance.total_points,
  });
});

export default router;
