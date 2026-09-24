import React, { useState } from 'react';
import { Zap, Flame, Thermometer, Sparkles, Building2, Sliders, CheckCircle2, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';

interface BuildingEnergy {
  id: string;
  building_name: string;
  kwh_consumed: number;
  peak_demand_kw: number;
  power_factor: number;
  carbon_kg_est: number;
  recorded_at: string;
}

interface EnergyHeatmapProps {
  buildings: BuildingEnergy[];
  onRefresh: () => void;
  isAdminOrStaff?: boolean;
}

export const EnergyHeatmap: React.FC<EnergyHeatmapProps> = ({ buildings, onRefresh, isAdminOrStaff = true }) => {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingEnergy>(buildings[0] || null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any | null>(null);

  const activeBuilding = selectedBuilding || buildings[0];

  const handleOptimizeHVAC = async (b: BuildingEnergy) => {
    try {
      setIsOptimizing(true);
      setOptimizationResult(null);

      const res = await api.optimizeEnergy({
        building_name: b.building_name,
        current_load_kw: b.peak_demand_kw,
        peak_threshold_kw: 200,
        ambient_temp_c: 28.5,
        occupancy_estimate: 420,
        hvac_status: 'Active (Cooling Mode 21.5°C)',
      });

      setOptimizationResult(res.optimization);
    } catch (err) {
      console.error('Failed to optimize energy:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            Building Electrical Load & Peak-Shaving Intelligence
          </h3>
          <p className="text-xs text-slate-400">
            Real-time power demand, carbon coefficient indexing, and AI HVAC curtailment dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <Building2 className="h-4 w-4 text-emerald-400" />
            {buildings.length} Monitored Facilities
          </span>
        </div>
      </div>

      {/* Buildings Heatmap Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buildings.map((b) => {
          const isHighPeak = b.peak_demand_kw >= 200;
          const isModerate = b.peak_demand_kw >= 140 && b.peak_demand_kw < 200;
          const isSelected = activeBuilding?.id === b.id;

          return (
            <div
              key={b.id}
              onClick={() => {
                setSelectedBuilding(b);
                setOptimizationResult(null);
              }}
              className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
                isSelected
                  ? 'border-amber-500/60 bg-amber-950/20 shadow-glow-amber'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-bold text-xs text-white truncate max-w-[170px]">
                  {b.building_name}
                </span>
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    isHighPeak
                      ? 'bg-rose-950 text-rose-400 border-rose-600/40'
                      : isModerate
                      ? 'bg-amber-950 text-amber-400 border-amber-600/40'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-600/40'
                  }`}
                >
                  {isHighPeak ? 'Peak Surge' : isModerate ? 'Moderate' : 'Stable'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-slate-400">Peak Demand:</span>
                  <span className="text-lg font-black text-amber-300">
                    {b.peak_demand_kw} <span className="text-[10px] font-normal text-slate-400">kW</span>
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isHighPeak ? 'bg-rose-500' : isModerate ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min((b.peak_demand_kw / 300) * 100, 100)}%` }}
                  />
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Consumption:</span>
                  <span className="font-semibold text-slate-200">{b.kwh_consumed} kWh</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Carbon Est:</span>
                  <span className="font-semibold text-emerald-400">{b.carbon_kg_est} kg CO₂</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Facility Detail & AI HVAC Optimizer Panel */}
      {activeBuilding && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Selected Facility Analysis
              </span>
              <h4 className="text-lg font-extrabold text-white mt-1">{activeBuilding.building_name}</h4>
              <p className="text-xs text-slate-400">
                Telemetry recorded at {new Date(activeBuilding.recorded_at).toLocaleTimeString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Power Factor (cos φ)</span>
                <p className="text-base font-bold text-white mt-1">{activeBuilding.power_factor}</p>
                <span className="text-[10px] text-emerald-400 font-medium">95%+ Efficiency</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Peak Demand Ratio</span>
                <p className="text-base font-bold text-amber-300 mt-1">
                  {Math.round((activeBuilding.peak_demand_kw / 250) * 100)}%
                </p>
                <span className="text-[10px] text-slate-400">of 250 kW substation cap</span>
              </div>
            </div>

            {isAdminOrStaff && (
              <button
                onClick={() => handleOptimizeHVAC(activeBuilding)}
                disabled={isOptimizing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-glow-amber transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {isOptimizing ? 'Analyzing Thermodynamic Profiles...' : 'Generate AI Peak-Shaving Plan'}
              </button>
            )}
          </div>

          {/* Right AI Optimization Plan (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 flex flex-col justify-between">
            {optimizationResult ? (
              <div className="space-y-4 animate-in fade-in text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-slate-200 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    HVAC Schedule & Load-Shedding Directives
                  </span>
                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      optimizationResult.peak_shaving_urgency === 'CRITICAL' || optimizationResult.peak_shaving_urgency === 'HIGH'
                        ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    Urgency: {optimizationResult.peak_shaving_urgency}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Curtailment Potential</span>
                    <p className="text-xl font-black text-white mt-1">
                      {optimizationResult.curtailment_potential_kw} <span className="text-xs font-normal">kW</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">Optimal Thermostat</span>
                    <p className="text-xl font-black text-cyan-300 mt-1">
                      {optimizationResult.suggested_hvac_setpoint_c}°C
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Projected Savings</span>
                    <p className="text-xl font-black text-emerald-300 mt-1">
                      ${optimizationResult.estimated_cost_savings_usd}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Actionable Load-Shedding Steps
                  </h5>
                  <ul className="space-y-2">
                    {optimizationResult.load_shedding_actions?.map((step: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                <Sliders className="h-9 w-9 text-slate-700" />
                <p className="text-xs text-slate-400 max-w-sm">
                  Click "Generate AI Peak-Shaving Plan" to evaluate real-time demand charges and generate chiller setback schedules.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
