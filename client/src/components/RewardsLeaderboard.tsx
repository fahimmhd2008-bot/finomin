import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Gift, Award, Plus, CheckCircle2, Ticket, QrCode, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { api, getStoredUser } from '../lib/api';

interface RewardsLeaderboardProps {
  balanceData: any;
  catalog: any[];
  leaderboard: any[];
  onRefresh: () => void;
}

export const RewardsLeaderboard: React.FC<RewardsLeaderboardProps> = ({
  balanceData,
  catalog,
  leaderboard,
  onRefresh,
}) => {
  const currentUser = getStoredUser();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [bottleCount, setBottleCount] = useState(6);
  const [plasticType, setPlasticType] = useState('PET');
  const [isDepositing, setIsDepositing] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redemptionSuccess, setRedemptionSuccess] = useState<any | null>(null);

  const totalPoints = balanceData?.balance?.total_points || 0;
  const bottlesRecycled = balanceData?.balance?.total_bottles_recycled || 0;

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsDepositing(true);
      await api.depositPlastic({
        student_id: currentUser.id,
        bottle_count: Number(bottleCount),
        recycling_type: plasticType,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#6366f1'],
      });

      setShowDepositModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleRedeem = async (reward: any) => {
    if (totalPoints < reward.points_cost) {
      alert(`Insufficient eco points. You need ${reward.points_cost - totalPoints} more points to redeem this.`);
      return;
    }

    try {
      setRedeemingId(reward.id);
      const res = await api.redeemReward({
        student_id: currentUser.id,
        reward_id: reward.id,
        points_required: reward.points_cost,
        item_name: reward.title,
      });

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });

      setRedemptionSuccess(res.voucher);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Redemption failed');
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Wallet & Stats Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-6 shadow-glow-emerald">
        <div className="space-y-1">
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Gift className="h-4 w-4" />
            Eco-Rewards Student Wallet
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {totalPoints} <span className="text-sm font-semibold text-emerald-300">Eco Points</span>
          </h3>
          <p className="text-xs text-slate-300">
            Account Holder: <strong className="text-white">{currentUser.full_name}</strong> •{' '}
            <strong className="text-emerald-400">{bottlesRecycled} containers</strong> recycled to date
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDepositModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Record Plastic Deposit
          </button>
        </div>
      </div>

      {/* Rewards Catalog & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reward Store Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
                Sustainability Rewards Store
              </h4>
              <p className="text-xs text-slate-400">Redeem points for campus bookstore and dining vouchers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {catalog.map((item) => {
              const canAfford = totalPoints >= item.points_cost;

              return (
                <div
                  key={item.id}
                  className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="font-bold text-xs text-white leading-snug">{item.title}</span>
                      <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                        {item.points_cost} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">In stock: {item.available_stock}</span>
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={!canAfford || redeemingId === item.id}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        canAfford
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {redeemingId === item.id ? 'Redeeming...' : canAfford ? 'Redeem Voucher' : 'Need Points'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recycling Leaderboard (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                Campus Recycler Leaderboard
              </h4>
              <span className="text-[10px] uppercase font-bold text-slate-500">All Semesters</span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((student, idx) => (
                <div
                  key={student.student_id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    idx === 0
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : idx === 1
                      ? 'bg-slate-800/60 border-slate-700 text-slate-200'
                      : idx === 2
                      ? 'bg-amber-950/10 border-amber-800/30 text-amber-300'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/40 font-bold text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{student.student_name}</p>
                      <span className="text-[10px] text-slate-400">
                        {student.total_bottles_recycled} bottles recycled
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-emerald-400">
                    {student.total_points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Vouchers Preview */}
          {balanceData?.activeVouchers?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-cyan-400" />
                Your Active Vouchers
              </h5>
              <div className="space-y-1.5">
                {balanceData.activeVouchers.slice(0, 2).map((v: any) => (
                  <div
                    key={v.id}
                    className="p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-cyan-200">{v.item_name}</p>
                      <span className="font-mono text-[10px] text-slate-400">Code: {v.voucher_code}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Redemption Success Modal */}
      {redemptionSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-emerald-500/40 bg-[#0c1427] text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Voucher Issued!</h4>
              <p className="text-xs text-slate-400 mt-1">{redemptionSuccess.item_name}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-dashed border-emerald-500/50 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Scan or Present at Counter</span>
              <p className="text-xl font-mono font-black text-emerald-300 tracking-wider">
                {redemptionSuccess.voucher_code}
              </p>
            </div>

            <button
              onClick={() => setRedemptionSuccess(null)}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Record Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 bg-[#0c1427]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="h-4 w-4 text-emerald-400" />
                Plastic Collection Kiosk Check-In
              </h4>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Student Recycler ID</label>
                <input
                  type="text"
                  value={currentUser.id}
                  disabled
                  className="w-full rounded-xl glass-input p-2.5 text-xs text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Plastic Container Type</label>
                <select
                  value={plasticType}
                  onChange={(e) => setPlasticType(e.target.value)}
                  className="w-full rounded-xl glass-input p-2.5 text-xs"
                >
                  <option value="PET">PET #1 (Clear Beverage Bottles)</option>
                  <option value="HDPE">HDPE #2 (Milk Jugs / Detergent)</option>
                  <option value="Mixed">Mixed Recyclable Plastic</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Quantity ({bottleCount} units)</label>
                  <span className="font-bold text-emerald-400">+{bottleCount * 10} points</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={bottleCount}
                  onChange={(e) => setBottleCount(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDepositing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-glow-emerald"
                >
                  {isDepositing ? 'Logging...' : 'Confirm Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
