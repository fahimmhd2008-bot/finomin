import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift, Award, Scale, Users } from 'lucide-react';
import { RewardsLeaderboard } from '../components/RewardsLeaderboard';
import { MetricCard } from '../components/MetricCard';
import { api, getStoredUser } from '../lib/api';

export const RewardsPage: React.FC = () => {
  const currentUser = getStoredUser();

  const { data: balanceData, refetch: refetchBalance } = useQuery({
    queryKey: ['rewards-balance', currentUser.id],
    queryFn: () => api.getStudentBalance(currentUser.id),
  });

  const { data: catalogData } = useQuery({
    queryKey: ['rewards-catalog'],
    queryFn: () => api.getRewardsCatalog(),
  });

  const { data: leaderboardData, refetch: refetchLeaderboard } = useQuery({
    queryKey: ['rewards-leaderboard'],
    queryFn: () => api.getLeaderboard(),
  });

  const handleRefresh = () => {
    refetchBalance();
    refetchLeaderboard();
  };

  const stats = leaderboardData?.stats || {
    totalBottlesCampus: 111,
    totalPointsDistributed: 1110,
    plasticKgDiverted: 3.1,
    activeRecyclers: 3,
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <Gift className="h-6 w-6 text-emerald-400" />
          Plastic Recycling Rewards & Student Incentive Hub
        </h2>
        <p className="text-xs text-slate-400">
          Automated deposit optical sorting kiosks, transparent student point ledger, and campus reward redemption
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Campus Bottles Recycled"
          value={stats.totalBottlesCampus}
          unit="bottles"
          icon={Gift}
          colorVariant="emerald"
          subtitle="Diverted from landfill"
          trend={{ value: 32.5, isPositiveGood: true, label: 'this month' }}
        />

        <MetricCard
          title="Eco Points Issued"
          value={stats.totalPointsDistributed}
          unit="pts"
          icon={Award}
          colorVariant="violet"
          subtitle="Redeemable campus credit"
        />

        <MetricCard
          title="Polymer Mass Diverted"
          value={stats.plasticKgDiverted}
          unit="kg PET"
          icon={Scale}
          colorVariant="cyan"
          subtitle="Zero-waste initiative"
        />

        <MetricCard
          title="Active Recyclers"
          value={stats.activeRecyclers}
          unit="students"
          icon={Users}
          colorVariant="amber"
          subtitle="Participating in program"
        />
      </div>

      {/* Rewards Hub Main Component */}
      <RewardsLeaderboard
        balanceData={balanceData}
        catalog={catalogData?.catalog || []}
        leaderboard={leaderboardData?.leaderboard || []}
        onRefresh={handleRefresh}
      />
    </div>
  );
};
