import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CloudRain, Droplets, Filter, Calendar, ShieldCheck } from 'lucide-react';
import { RainwaterGauge } from '../components/RainwaterGauge';
import { MetricCard } from '../components/MetricCard';
import { api, getStoredUser } from '../lib/api';

export const RainwaterPage: React.FC = () => {
  const currentUser = getStoredUser();
  const isAdminOrStaff = currentUser.role === 'admin' || currentUser.role === 'staff';

  const { data, refetch } = useQuery({
    queryKey: ['rainwater-status'],
    queryFn: () => api.getRainwaterStatus(),
    refetchInterval: 10000,
  });

  const metrics = data?.metrics || {
    totalCapacityLiters: 220000,
    currentTotalLiters: 134900,
    avgStoragePct: 61.3,
    avgFilterHealth: 88,
    tanksCount: 4,
    waterAutonomyDays: 15.9,
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <CloudRain className="h-6 w-6 text-teal-400" />
          Rainwater Harvesting & Storm Runoff Hydrology
        </h2>
        <p className="text-xs text-slate-400">
          Cistern volumetric metering, filtration membrane monitoring, and AI rainfall runoff yield forecasting
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Stored Harvest Water"
          value={(metrics.currentTotalLiters / 1000).toFixed(1)}
          unit="k Liters"
          icon={Droplets}
          colorVariant="cyan"
          subtitle={`Capacity: ${(metrics.totalCapacityLiters / 1000).toFixed(0)}k L`}
          trend={{ value: 16.2, isPositiveGood: true, label: 'month-to-date' }}
        />

        <MetricCard
          title="Storage Fill Ratio"
          value={`${metrics.avgStoragePct}%`}
          icon={CloudRain}
          colorVariant="teal"
          subtitle={`${metrics.tanksCount} major campus cisterns`}
          statusBadge={metrics.avgStoragePct > 80 ? 'Near Capacity' : 'Headroom OK'}
        />

        <MetricCard
          title="Water Autonomy"
          value={metrics.waterAutonomyDays}
          unit="days"
          icon={Calendar}
          colorVariant="emerald"
          subtitle="Non-potable landscaping demand"
        />

        <MetricCard
          title="Membrane Filter Health"
          value={`${metrics.avgFilterHealth}%`}
          icon={Filter}
          colorVariant={metrics.avgFilterHealth < 75 ? 'amber' : 'emerald'}
          subtitle="Sediment & carbon filters"
        />
      </div>

      {/* Rainwater Gauge Component */}
      <RainwaterGauge
        tanks={data?.tanks || []}
        forecast={data?.weatherForecast}
        onRefresh={refetch}
        isAdminOrStaff={isAdminOrStaff}
      />
    </div>
  );
};
