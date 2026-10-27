import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trash2,
  Utensils,
  Droplets,
  Zap,
  Gift,
  CloudRain,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MetricCard } from '../components/MetricCard';
import { api, getStoredUser } from '../lib/api';
import { useAIModal } from '../App';

interface DashboardPageProps {
  onOpenAIPlan?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenAIPlan }) => {
  const { openAIPlan } = useAIModal();
  const handleOpenAI = onOpenAIPlan || openAIPlan;
  const queryClient = useQueryClient();
  const currentUser = getStoredUser();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['telemetry-overview'],
    queryFn: () => api.getTelemetryOverview(),
    refetchInterval: 10000,
  });

  const resolveMutation = useMutation({
    mutationFn: (alertId: string) => api.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telemetry-overview'] });
    },
  });

  const d = data?.domains;
  const healthScore = data?.campusHealthScore ?? 88;

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/50 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-6 shadow-glow-emerald relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tracking-wider">
              Autonomous Sustainability Engine
            </span>
            <span className="text-xs text-slate-400">
              Campus Net: <strong>Active</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Campus Environmental Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Welcome back, <strong className="text-white">{currentUser.full_name}</strong>. Aggregating 7 real-time IoT sustainability telemetry streams with automated Google Gemini mitigation planning.
          </p>
        </div>

        {/* Big Health Score Dial */}
        <div className="flex items-center gap-4 z-10 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Campus Eco Score</span>
            <p className="text-3xl font-black text-white">{healthScore}<span className="text-xs text-emerald-400 font-semibold">/100</span></p>
            <span className={`text-[10px] font-bold ${healthScore >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data?.statusText || 'Real-time telemetry'}
            </span>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Activity className="h-7 w-7 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 7-Domain KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Dustbins */}
        <Link to="/dustbins">
          <MetricCard
            title="Smart Dustbins"
            value={d ? `${d.dustbins.averageFillPct}%` : '--'}
            subtitle={`${d?.dustbins.critical || 0} critical overflow`}
            icon={Trash2}
            colorVariant={d?.dustbins.critical > 0 ? 'rose' : 'emerald'}
            statusBadge={d?.dustbins.critical > 0 ? 'Action Req' : 'Normal'}
            trend={{ value: -12, isPositiveGood: true, label: 'fill rate' }}
          />
        </Link>

        {/* 2. Food Waste */}
        <Link to="/food-waste">
          <MetricCard
            title="Cafeteria Waste"
            value={d ? `${d.foodWaste.totalWasteKg}` : '--'}
            unit="kg"
            subtitle={`${d?.foodWaste.avgWastePct || 0}% leftover ratio`}
            icon={Utensils}
            colorVariant={d?.foodWaste.avgWastePct > 15 ? 'amber' : 'emerald'}
            statusBadge={d?.foodWaste.avgWastePct > 15 ? 'Batch Tune' : 'Optimized'}
            trend={{ value: -18.4, isPositiveGood: true, label: 'vs last week' }}
          />
        </Link>

        {/* 3. Water Leaks */}
        <Link to="/water">
          <MetricCard
            title="Water Leak Sensors"
            value={d ? `${d.water.activeLeaks}` : '--'}
            unit="leaks"
            subtitle={`Flow: ${d?.water.currentFlowLpm || 0} L/min`}
            icon={Droplets}
            colorVariant={d?.water.activeLeaks > 0 ? 'rose' : 'cyan'}
            statusBadge={d?.water.activeLeaks > 0 ? 'Alert' : 'Nominal'}
            trend={{ value: 2.5, isPositiveGood: false, label: 'flow var' }}
          />
        </Link>

        {/* 4. Campus Energy */}
        <Link to="/energy">
          <MetricCard
            title="Energy Peak Demand"
            value={d ? `${d.energy.peakDemandKw}` : '--'}
            unit="kW"
            subtitle={`Total: ${d?.energy.totalKwh || 0} kWh`}
            icon={Zap}
            colorVariant={d?.energy.peakDemandKw > 250 ? 'amber' : 'emerald'}
            statusBadge={d?.energy.peakDemandKw > 250 ? 'Peak Surge' : 'Stable'}
            trend={{ value: -8.2, isPositiveGood: true, label: 'grid load' }}
          />
        </Link>

        {/* 5. Plastic Rewards */}
        <Link to="/rewards">
          <MetricCard
            title="Bottles Recycled"
            value={d ? `${d.plastic.totalBottlesRecycled}` : '--'}
            unit="units"
            subtitle={`${d?.plastic.activeRecyclers || 0} active students`}
            icon={Gift}
            colorVariant="violet"
            statusBadge="Gamified"
            trend={{ value: 24, isPositiveGood: true, label: 'recycling' }}
          />
        </Link>

        {/* 6. Rainwater Harvesting */}
        <Link to="/rainwater">
          <MetricCard
            title="Rainwater Cisterns"
            value={d ? `${d.rainwater.storageCapacityPct}%` : '--'}
            subtitle={`${((d?.rainwater.totalLitersStored || 0) / 1000).toFixed(0)}k L stored`}
            icon={CloudRain}
            colorVariant="cyan"
            statusBadge={`${d?.rainwater.autonomyDays || 0}d Buffer`}
            trend={{ value: 14.5, isPositiveGood: true, label: 'storage' }}
          />
        </Link>

        {/* 7. Air Quality */}
        <Link to="/air-quality">
          <MetricCard
            title="Campus Air Quality"
            value={d ? `${d.airQuality.avgAqi}` : '--'}
            unit="AQI"
            subtitle={`Max: ${d?.airQuality.maxAqi || 0} AQI`}
            icon={Wind}
            colorVariant={d?.airQuality.maxAqi > 100 ? 'amber' : 'emerald'}
            statusBadge={d?.airQuality.maxAqi > 100 ? 'Moderate' : 'Good'}
            trend={{ value: -5, isPositiveGood: true, label: 'PM2.5' }}
          />
        </Link>

        {/* 8. AI Quick Master Plan Card */}
        <div
          onClick={handleOpenAI}
          className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-slate-900 cursor-pointer transform hover:-translate-y-1 transition-all shadow-glow-emerald flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold text-emerald-400">Gemini 2.5 Brain</span>
              <Sparkles className="h-5 w-5 text-emerald-400 animate-spin-slow" />
            </div>
            <h4 className="text-sm font-bold text-white leading-snug">
              Master Sustainability Advisory
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Synthesize cross-domain IoT streams into daily facility actions.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-300 font-semibold">
            <span>Generate Plan</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Active System Alerts Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-time Sub-System Telemetry Alerts
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {data?.alerts?.length || 0} Unresolved Flag(s)
          </span>
        </div>

        {data?.alerts?.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            Zero operational exceptions. All sensors reporting within calibrated parameters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.alerts?.map((alert: any) => {
              const isCrit = alert.severity === 'critical';
              const isWarn = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between gap-2 ${
                    isCrit
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                      : isWarn
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      : 'bg-cyan-950/20 border-cyan-800/40 text-cyan-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-black/40">
                        {alert.domain}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="leading-snug pt-1">{alert.message}</p>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-white/10">
                    <button
                      onClick={() => resolveMutation.mutate(alert.id)}
                      className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Acknowledge & Resolve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
