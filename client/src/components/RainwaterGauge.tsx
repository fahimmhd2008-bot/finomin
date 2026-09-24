import React, { useState } from 'react';
import { CloudRain, Droplets, Filter, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '../lib/api';

interface RainwaterTank {
  id: string;
  tank_name: string;
  capacity_liters: number;
  current_liters: number;
  inflow_rate_lpm: number;
  outflow_rate_lpm: number;
  filter_health_pct: number;
  catchment_area_sqm: number;
}

interface RainwaterGaugeProps {
  tanks: RainwaterTank[];
  forecast: any;
  onRefresh: () => void;
  isAdminOrStaff?: boolean;
}

export const RainwaterGauge: React.FC<RainwaterGaugeProps> = ({
  tanks,
  forecast,
  onRefresh,
  isAdminOrStaff = true,
}) => {
  const [selectedTank, setSelectedTank] = useState<RainwaterTank>(tanks[0] || null);
  const [forecastMm, setForecastMm] = useState(25.0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [forecastResult, setForecastResult] = useState<any | null>(null);

  const activeTank = selectedTank || tanks[0];

  const handleCalculateRunoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTank) return;
    try {
      setIsCalculating(true);
      const res = await api.forecastRainwater({
        tank_name: activeTank.tank_name,
        rainfall_forecast_mm: Number(forecastMm),
        catchment_area_sqm: activeTank.catchment_area_sqm || 2000,
        runoff_coefficient: 0.85,
      });
      setForecastResult(res);
    } catch (err) {
      console.error('Failed to calculate runoff:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-teal-400" />
            Campus Rainwater Harvesting & Hydrology
          </h3>
          <p className="text-xs text-slate-400">
            Cistern storage capacity, real-time inflow/outflow balance, and storm runoff yield forecasting
          </p>
        </div>

        {/* Rain Forecast Pill */}
        {forecast && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs">
            <CloudRain className="h-4 w-4 text-teal-400" />
            <span className="text-slate-300">Next 24h Rain:</span>
            <strong className="text-teal-300">{forecast.next24hRainfallMm} mm ({forecast.probabilityOfPrecipitationPct}% prob)</strong>
          </div>
        )}
      </div>

      {/* Tank Gauges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tanks.map((tank) => {
          const fillPct = Math.round((tank.current_liters / tank.capacity_liters) * 100);
          const isSelected = activeTank?.id === tank.id;
          const isFilterWarning = tank.filter_health_pct < 80;

          return (
            <div
              key={tank.id}
              onClick={() => {
                setSelectedTank(tank);
                setForecastResult(null);
              }}
              className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-500/60 bg-teal-950/20 shadow-glow-cyan'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-bold text-xs text-white truncate max-w-[170px]">
                  {tank.tank_name}
                </span>
                <span className="text-[10px] font-mono font-bold text-teal-400">
                  {fillPct}%
                </span>
              </div>

              {/* Water Cylinder Visual */}
              <div className="relative h-28 w-full rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden flex flex-col justify-end p-2 mb-3">
                <div
                  className="w-full bg-gradient-to-t from-teal-600 via-cyan-500 to-teal-400 rounded-lg transition-all duration-700 relative overflow-hidden"
                  style={{ height: `${fillPct}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse-subtle" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-white drop-shadow">
                    {(tank.current_liters / 1000).toFixed(1)}k L
                  </span>
                  <span className="text-[9px] text-slate-300 drop-shadow">
                    / {(tank.capacity_liters / 1000).toFixed(0)}k L
                  </span>
                </div>
              </div>

              {/* Filter and Inflow/Outflow */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Filter className="h-3 w-3 text-slate-400" /> Filter Health:
                  </span>
                  <span className={`font-semibold ${isFilterWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {tank.filter_health_pct}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ArrowDownRight className="h-3 w-3" /> Inflow:
                  </span>
                  <span className="text-slate-200 font-semibold">{tank.inflow_rate_lpm} L/min</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <ArrowUpRight className="h-3 w-3" /> Demand:
                  </span>
                  <span className="text-slate-200 font-semibold">{tank.outflow_rate_lpm} L/min</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Cistern Runoff Forecast Form */}
      {activeTank && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
                Runoff Catchment Modeling
              </span>
              <h4 className="text-lg font-extrabold text-white mt-1">{activeTank.tank_name}</h4>
              <p className="text-slate-400">
                Catchment Area: <strong className="text-white">{activeTank.catchment_area_sqm} m²</strong> (Rooftop & Paved Basin)
              </p>
            </div>

            <form onSubmit={handleCalculateRunoff} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Precipitation Forecast ({forecastMm} mm)</label>
                  <span className="text-teal-400 font-bold">Rain Front</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={forecastMm}
                  onChange={(e) => setForecastMm(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              {isAdminOrStaff && (
                <button
                  type="submit"
                  disabled={isCalculating}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 font-bold text-white shadow-glow-cyan transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {isCalculating ? 'Computing Hydrology...' : 'Simulate Runoff Harvest Yield'}
                </button>
              )}
            </form>
          </div>

          {/* Forecast Output (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 flex flex-col justify-between">
            {forecastResult ? (
              <div className="space-y-4 animate-in fade-in text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    Hydraulic Simulation Results
                  </span>
                  <span className="text-[10px] text-slate-400">Runoff Coeff: 0.85</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                    <span className="text-[10px] uppercase font-bold text-teal-400">Harvest Yield</span>
                    <p className="text-xl font-black text-white mt-1">
                      {forecastResult.estimated_yield_liters.toLocaleString()} <span className="text-xs font-normal">L</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">Remaining Tank Headroom</span>
                    <p className="text-xl font-black text-cyan-300 mt-1">
                      {forecastResult.remaining_storage_capacity_liters.toLocaleString()} <span className="text-xs font-normal">L</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Projected Overflow</span>
                    <p className="text-xl font-black text-amber-300 mt-1">
                      {forecastResult.projected_overflow_liters.toLocaleString()} <span className="text-xs font-normal">L</span>
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300">
                  <span className="text-[11px] font-bold text-teal-400 block mb-1">
                    AI Hydraulic Recommendation:
                  </span>
                  <p className="leading-relaxed">{forecastResult.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                <CloudRain className="h-9 w-9 text-slate-700" />
                <p className="text-xs text-slate-400 max-w-sm">
                  Adjust expected storm precipitation (mm) and click "Simulate Runoff Harvest Yield" to test cistern capacity margins.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
