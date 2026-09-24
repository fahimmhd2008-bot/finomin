import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Activity, Building2, Flame, ShieldCheck } from 'lucide-react';
import { EnergyHeatmap } from '../components/EnergyHeatmap';
import { MetricCard } from '../components/MetricCard';
import { api, getStoredUser } from '../lib/api';

export const EnergyPage: React.FC = () => {
  const currentUser = getStoredUser();
  const isAdminOrStaff = currentUser.role === 'admin' || currentUser.role === 'staff';

  const { data, refetch } = useQuery({
    queryKey: ['energy-buildings'],
    queryFn: () => api.getEnergyBuildings(),
    refetchInterval: 10000,
  });

  const metrics = data?.metrics || {
    totalKwh: 7561.9,
    maxPeakDemandKw: 285.0,
    totalCarbonKg: 3402.9,
    avgPowerFactor: 0.94,
    activeBuildingsMonitored: 7,
    gridStatus: 'PEAK ALERT',
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <Zap className="h-6 w-6 text-amber-400" />
          Campus Energy Monitoring & HVAC Peak-Shaving
        </h2>
        <p className="text-xs text-slate-400">
          Building-level power draw (kWh), off-hour anomaly detection, and thermodynamic chiller scheduling
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Campus Total Load"
          value={metrics.totalKwh}
          unit="kWh"
          icon={Zap}
          colorVariant="amber"
          subtitle="Past 24 hours"
          trend={{ value: -6.4, isPositiveGood: true, label: 'efficiency' }}
        />

        <MetricCard
          title="Max Peak Demand"
          value={metrics.maxPeakDemandKw}
          unit="kW"
          icon={Flame}
          colorVariant={metrics.maxPeakDemandKw > 250 ? 'rose' : 'emerald'}
          subtitle="Science Lab sub-station"
          statusBadge={metrics.gridStatus}
        />

        <MetricCard
          title="Carbon Footprint"
          value={metrics.totalCarbonKg}
          unit="kg CO₂"
          icon={Activity}
          colorVariant="emerald"
          subtitle="Scope 2 emissions"
        />

        <MetricCard
          title="Avg Power Factor"
          value={metrics.avgPowerFactor}
          unit="cos φ"
          icon={ShieldCheck}
          colorVariant="cyan"
          subtitle="Inductive reactive load"
        />
      </div>

      {/* Energy Heatmap & HVAC Optimizer */}
      <EnergyHeatmap
        buildings={data?.buildings || []}
        onRefresh={refetch}
        isAdminOrStaff={isAdminOrStaff}
      />
    </div>
  );
};
