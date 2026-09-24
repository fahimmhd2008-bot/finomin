import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Utensils, TrendingDown, ChefHat, Scale, Users, CheckCircle2 } from 'lucide-react';
import { FoodPrepWidget } from '../components/FoodPrepWidget';
import { MetricCard } from '../components/MetricCard';
import { api } from '../lib/api';

export const FoodWastePage: React.FC = () => {
  const { data, refetch } = useQuery({
    queryKey: ['food-waste-logs'],
    queryFn: () => api.getFoodWasteLogs(),
  });

  const stats = data?.stats || {
    totalPreparedKg: 2480,
    totalWasteKg: 326.5,
    totalHeadcount: 5160,
    avgWastePct: 13.2,
    edibleWasteKg: 216.5,
    inedibleWasteKg: 110.0,
    compostDiversionPct: 78.4,
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <Utensils className="h-6 w-6 text-amber-400" />
          Cafeteria Operations & Food Waste Reduction
        </h2>
        <p className="text-xs text-slate-400">
          AI meal prep estimation, leftover batch analytics, and organic composting diversion
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Prepared"
          value={stats.totalPreparedKg}
          unit="kg"
          icon={ChefHat}
          colorVariant="amber"
          subtitle="Past 7 days"
        />

        <MetricCard
          title="Total Food Waste"
          value={stats.totalWasteKg}
          unit="kg"
          icon={Scale}
          colorVariant="rose"
          subtitle={`${stats.edibleWasteKg} kg edible scrap`}
          trend={{ value: -14.2, isPositiveGood: true, label: 'reduction' }}
        />

        <MetricCard
          title="Average Waste Ratio"
          value={`${stats.avgWastePct}%`}
          icon={TrendingDown}
          colorVariant={stats.avgWastePct > 15 ? 'amber' : 'emerald'}
          subtitle="Target threshold: <10%"
          statusBadge={stats.avgWastePct > 15 ? 'Tuning Req' : 'Optimal'}
        />

        <MetricCard
          title="Compost Diversion"
          value={`${stats.compostDiversionPct}%`}
          icon={CheckCircle2}
          colorVariant="emerald"
          subtitle="Sent to campus gardens"
        />
      </div>

      {/* AI Estimator & Logger Widget */}
      <FoodPrepWidget onLogSuccess={refetch} />

      {/* Historical Logs Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Historical Cafeteria Meal Logs</h3>
          <span className="text-xs text-slate-400">{data?.logs?.length || 0} Records logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Facility</th>
                <th className="pb-3 font-semibold">Service</th>
                <th className="pb-3 font-semibold text-right">Headcount</th>
                <th className="pb-3 font-semibold text-right">Prepared (kg)</th>
                <th className="pb-3 font-semibold text-right">Waste (kg)</th>
                <th className="pb-3 font-semibold text-right">Waste %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {data?.logs?.map((log: any) => {
                const wastePct = ((log.waste_weight_kg / log.prepared_weight_kg) * 100).toFixed(1);
                const isHigh = Number(wastePct) > 15;

                return (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 font-mono text-slate-400">{log.log_date}</td>
                    <td className="py-3 font-medium text-white">{log.cafeteria_name}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                        {log.meal_type}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono">{log.headcount}</td>
                    <td className="py-3 text-right font-mono">{log.prepared_weight_kg} kg</td>
                    <td className="py-3 text-right font-mono text-rose-300">{log.waste_weight_kg} kg</td>
                    <td className="py-3 text-right">
                      <span className={`font-bold font-mono ${isHigh ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {wastePct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
