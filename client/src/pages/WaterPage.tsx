import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Droplets, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { WaterFlowChart } from '../components/WaterFlowChart';
import { MetricCard } from '../components/MetricCard';
import { api, getStoredUser } from '../lib/api';

export const WaterPage: React.FC = () => {
  const currentUser = getStoredUser();
  const isAdminOrStaff = currentUser.role === 'admin' || currentUser.role === 'staff';

  const { data, refetch } = useQuery({
    queryKey: ['water-sensors'],
    queryFn: () => api.getWaterSensors(),
    refetchInterval: 8000,
  });

  const metrics = data?.metrics || {
    totalSensors: 6,
    activeLeaks: 3,
    criticalLeaks: 1,
    totalFlowLpm: 413.6,
    baselineFlowLpm: 295.0,
    flowDeviationPct: 40.2,
    dailyEstimatedLossLiters: 9600,
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <Droplets className="h-6 w-6 text-cyan-400" />
          Smart Water Leak & Pipe Burst Intelligence
        </h2>
        <p className="text-xs text-slate-400">
          Continuous flow telemetry, baseline deviation detection, and automated isolation valve actuators
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Leaks"
          value={metrics.activeLeaks}
          unit="zones"
          icon={AlertTriangle}
          colorVariant={metrics.activeLeaks > 0 ? 'rose' : 'cyan'}
          subtitle={`${metrics.criticalLeaks} critical rupture`}
          statusBadge={metrics.activeLeaks > 0 ? 'Urgent' : 'Nominal'}
        />

        <MetricCard
          title="Campus Flow Rate"
          value={metrics.totalFlowLpm}
          unit="L/min"
          icon={Droplets}
          colorVariant="cyan"
          subtitle={`Baseline: ${metrics.baselineFlowLpm} L/min`}
          trend={{ value: metrics.flowDeviationPct, isPositiveGood: false, label: 'above baseline' }}
        />

        <MetricCard
          title="Est. Loss Rate"
          value={(metrics.dailyEstimatedLossLiters / 1000).toFixed(1)}
          unit="k L/day"
          icon={Activity}
          colorVariant="rose"
          subtitle="Potable water wasted"
        />

        <MetricCard
          title="Monitored Zones"
          value={metrics.totalSensors}
          unit="risers"
          icon={ShieldCheck}
          colorVariant="emerald"
          subtitle="Acoustic & pressure transducers"
        />
      </div>

      {/* Flow Graph & AI Diagnostic Component */}
      <WaterFlowChart
        sensors={data?.sensors || []}
        onRefresh={refetch}
        isAdminOrStaff={isAdminOrStaff}
      />
    </div>
  );
};
