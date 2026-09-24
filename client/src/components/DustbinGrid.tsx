import React, { useState } from 'react';
import { Trash2, Battery, Clock, Check, AlertCircle, Sparkles, Navigation, Send } from 'lucide-react';
import { api } from '../lib/api';

interface Dustbin {
  id: string;
  bin_code: string;
  zone_name: string;
  fill_level: number;
  battery_level: number;
  last_cleaned_at: string;
  status: 'ok' | 'warning' | 'critical';
}

interface DustbinGridProps {
  dustbins: Dustbin[];
  onRefresh: () => void;
  isAdminOrStaff?: boolean;
}

export const DustbinGrid: React.FC<DustbinGridProps> = ({ dustbins, onRefresh, isAdminOrStaff = true }) => {
  const [cleaningBinCode, setCleaningBinCode] = useState<string | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simBinCode, setSimBinCode] = useState('');
  const [simFill, setSimFill] = useState(88);
  const [simZone, setSimZone] = useState('Central Plaza');
  const [routePlan, setRoutePlan] = useState<any | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  const handleClean = async (binCode: string) => {
    try {
      setCleaningBinCode(binCode);
      await api.cleanDustbin(binCode);
      onRefresh();
    } catch (err) {
      console.error('Failed to clean dustbin:', err);
    } finally {
      setCleaningBinCode(null);
    }
  };

  const handleSimulateTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitDustbinTelemetry({
        bin_code: simBinCode || 'BIN-SIM-01',
        zone_name: simZone,
        fill_level: Number(simFill),
        battery_level: 90,
      });
      setShowSimulateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Telemetry submission failed');
    }
  };

  const fetchRoutePlan = async () => {
    try {
      setIsLoadingRoute(true);
      const data = await api.getDustbinRoutePlan();
      setRoutePlan(data);
    } catch (err) {
      console.error('Failed to fetch route plan:', err);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-emerald-400" />
            Campus Smart Dustbin Grid
          </h3>
          <p className="text-xs text-slate-400">
            Real-time volumetric fill sensors and battery health telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrStaff && (
            <>
              <button
                onClick={() => setShowSimulateModal(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5 text-cyan-400" />
                Simulate Telemetry
              </button>

              <button
                onClick={fetchRoutePlan}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-glow-emerald transition-all flex items-center gap-1.5"
              >
                <Navigation className="h-3.5 w-3.5" />
                {isLoadingRoute ? 'Optimizing...' : 'Route Optimizer'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Route Optimizer Box */}
      {routePlan && (
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/20 animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Optimized Custodial Sweep Route ({routePlan.total_stops} Priority Bins)
              </h4>
            </div>
            <button
              onClick={() => setRoutePlan(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>

          <p className="text-xs text-slate-300 mb-3">
            Estimated Route Completion: <strong className="text-white">{routePlan.estimated_total_time_mins} minutes</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {routePlan.stops.map((stop: any) => (
              <div
                key={stop.bin_code}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center gap-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                  #{stop.stop_sequence}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{stop.bin_code}</span>
                    <span className="text-[10px] font-bold text-rose-400">{stop.fill_level}%</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{stop.zone_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dustbins Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dustbins.map((bin) => {
          const isCritical = bin.fill_level >= 85;
          const isWarning = bin.fill_level >= 60 && bin.fill_level < 85;

          const statusColor = isCritical
            ? 'from-rose-500/20 to-red-950/40 border-rose-500/40'
            : isWarning
            ? 'from-amber-500/20 to-amber-950/40 border-amber-500/40'
            : 'from-emerald-500/20 to-emerald-950/40 border-emerald-500/30';

          const barColor = isCritical
            ? 'bg-rose-500 shadow-glow-rose'
            : isWarning
            ? 'bg-amber-400 shadow-glow-amber'
            : 'bg-emerald-500 shadow-glow-emerald';

          return (
            <div
              key={bin.id}
              className={`glass-panel rounded-2xl p-4 border bg-gradient-to-b ${statusColor} transition-all duration-300 hover:scale-[1.01]`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-white tracking-wide">{bin.bin_code}</span>
                  <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{bin.zone_name}</p>
                </div>
                <span
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    isCritical
                      ? 'bg-rose-950 text-rose-400 border-rose-600/40'
                      : isWarning
                      ? 'bg-amber-950 text-amber-400 border-amber-600/40'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-600/40'
                  }`}
                >
                  {isCritical ? 'Critical' : isWarning ? 'Warning' : 'Normal'}
                </span>
              </div>

              {/* Volumetric Fill Gauge Bar */}
              <div className="my-4">
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium">Fill Level</span>
                  <span className="text-base font-extrabold text-white">{bin.fill_level}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-800/80 p-0.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${bin.fill_level}%` }}
                  />
                </div>
              </div>

              {/* Sub-metrics */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Battery className="h-3.5 w-3.5 text-slate-400" /> Battery
                  </span>
                  <span className="font-semibold text-slate-200">{bin.battery_level}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> Cleaned
                  </span>
                  <span className="text-slate-300">
                    {bin.last_cleaned_at ? new Date(bin.last_cleaned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Clean Button */}
              {isAdminOrStaff && (
                <div className="mt-3 pt-2">
                  <button
                    onClick={() => handleClean(bin.bin_code)}
                    disabled={cleaningBinCode === bin.bin_code || bin.fill_level === 0}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      bin.fill_level === 0
                        ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                        : isCritical
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-glow-rose'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {cleaningBinCode === bin.bin_code
                      ? 'Emptying...'
                      : bin.fill_level === 0
                      ? 'Bin Empty'
                      : 'Dispatch / Clean'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Telemetry Simulator Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 bg-[#0c1427]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-emerald-400" />
                Simulate Dustbin IoT Telemetry
              </h4>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateTelemetry} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Bin Code</label>
                <select
                  value={simBinCode}
                  onChange={(e) => {
                    setSimBinCode(e.target.value);
                    const b = dustbins.find(x => x.bin_code === e.target.value);
                    if (b) setSimZone(b.zone_name);
                  }}
                  className="w-full rounded-lg glass-input p-2 text-xs"
                >
                  <option value="">-- Select Existing or New Bin --</option>
                  {dustbins.map(b => (
                    <option key={b.bin_code} value={b.bin_code}>
                      {b.bin_code} ({b.zone_name})
                    </option>
                  ))}
                  <option value="BIN-NEW-LABS">BIN-NEW-LABS (New Sensor)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Location Zone Name</label>
                <input
                  type="text"
                  value={simZone}
                  onChange={(e) => setSimZone(e.target.value)}
                  className="w-full rounded-lg glass-input p-2 text-xs"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Fill Level Percentage ({simFill}%)</label>
                  <span className={`text-[10px] font-bold ${simFill >= 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {simFill >= 85 ? 'Will Trigger Alert' : 'Normal'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simFill}
                  onChange={(e) => setSimFill(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-glow-emerald"
                >
                  Transmit Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
