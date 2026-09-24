import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trash2, AlertCircle, CheckCircle, Battery } from 'lucide-react';
import { DustbinGrid } from '../components/DustbinGrid';
import { MetricCard } from '../components/MetricCard';
import { api, getStoredUser } from '../lib/api';

export const DustbinsPage: React.FC = () => {
  const currentUser = getStoredUser();
  const isAdminOrStaff = currentUser.role === 'admin' || currentUser.role === 'staff';

  const [filterZone, setFilterZone] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dustbins', filterZone, filterStatus],
    queryFn: () => api.getDustbins({ zone: filterZone, status: filterStatus }),
    refetchInterval: 8000,
  });

  const metrics = data?.metrics || {
    total: 8,
    critical: 2,
    warning: 2,
    ok: 4,
    avgFill: 61,
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Trash2 className="h-6 w-6 text-emerald-400" />
            Smart Dustbin Fleet Management
          </h2>
          <p className="text-xs text-slate-400">
            Automated fill-level percentage tracking, overflow alert dispatch, and route optimization
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 text-xs">
          <input
            type="text"
            placeholder="Search by zone..."
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="rounded-xl glass-input px-3 py-1.5 text-xs w-44"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl glass-input px-3 py-1.5 text-xs"
          >
            <option value="">All Statuses</option>
            <option value="ok">Nominal (&lt;60%)</option>
            <option value="warning">Warning (60-84%)</option>
            <option value="critical">Critical (&gt;=85%)</option>
          </select>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Bins"
          value={metrics.total}
          unit="units"
          icon={Trash2}
          colorVariant="cyan"
          subtitle="Smart ultrasonic sensors"
        />

        <MetricCard
          title="Critical Overflows"
          value={metrics.critical}
          unit="bins"
          icon={AlertCircle}
          colorVariant="rose"
          subtitle="Fill level > 85%"
          statusBadge={metrics.critical > 0 ? 'Urgent' : 'None'}
        />

        <MetricCard
          title="Warning Level"
          value={metrics.warning}
          unit="bins"
          icon={Trash2}
          colorVariant="amber"
          subtitle="Fill level 60-84%"
        />

        <MetricCard
          title="Fleet Average Fill"
          value={`${metrics.avgFill}%`}
          icon={CheckCircle}
          colorVariant="emerald"
          subtitle="Volumetric capacity"
        />
      </div>

      {/* Dustbin Grid & Route Planner */}
      <DustbinGrid
        dustbins={data?.dustbins || []}
        onRefresh={refetch}
        isAdminOrStaff={isAdminOrStaff}
      />
    </div>
  );
};
