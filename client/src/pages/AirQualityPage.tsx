import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wind, ShieldAlert, Activity, Thermometer, ShieldCheck } from 'lucide-react';
import { AQIBadge } from '../components/AQIBadge';
import { MetricCard } from '../components/MetricCard';
import { api, getStoredUser } from '../lib/api';

export const AirQualityPage: React.FC = () => {
  const currentUser = getStoredUser();
  const isAdminOrStaff = currentUser.role === 'admin' || currentUser.role === 'staff';

  const { data, refetch } = useQuery({
    queryKey: ['air-quality-zones'],
    queryFn: () => api.getAirQualityZones(),
    refetchInterval: 8000,
  });

  const summary = data?.summary || {
    avgAqi: 72,
    maxAqi: 128,
    overallCategory: 'Moderate',
    worstZoneName: 'West Perimeter Transit Hub',
    activeSensorsCount: 7,
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <Wind className="h-6 w-6 text-teal-400" />
          Campus Air Quality (AQI) & Micro-Climate Matrix
        </h2>
        <p className="text-xs text-slate-400">
          Continuous particulate monitoring (PM2.5, PM10), CO₂ concentration, and automated health advisories
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Campus Average AQI"
          value={summary.avgAqi}
          unit="AQI"
          icon={Wind}
          colorVariant={summary.avgAqi > 100 ? 'amber' : 'emerald'}
          subtitle="All outdoor & indoor zones"
          statusBadge={summary.overallCategory}
        />

        <MetricCard
          title="Peak Zone AQI"
          value={summary.maxAqi}
          unit="AQI"
          icon={ShieldAlert}
          colorVariant={summary.maxAqi > 100 ? 'amber' : 'emerald'}
          subtitle={summary.worstZoneName}
          statusBadge={summary.maxAqi > 100 ? 'Ventilating' : 'Clean'}
        />

        <MetricCard
          title="Monitored Micro-Zones"
          value={summary.activeSensorsCount}
          unit="stations"
          icon={ShieldCheck}
          colorVariant="cyan"
          subtitle="Indoor quads & laboratories"
        />

        <MetricCard
          title="Campus Ventilation"
          value="Active"
          icon={Activity}
          colorVariant="emerald"
          subtitle="HEPA economizer cycles"
        />
      </div>

      {/* AQI Heatmap Component */}
      <AQIBadge
        zones={data?.zones || []}
        summary={summary}
        onRefresh={refetch}
        isAdminOrStaff={isAdminOrStaff}
      />
    </div>
  );
};
