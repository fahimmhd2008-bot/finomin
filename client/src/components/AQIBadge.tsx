import React, { useState } from 'react';
import { Wind, AlertTriangle, ShieldCheck, Thermometer, Droplets, Info } from 'lucide-react';

interface AirQualityZone {
  id: string;
  zone_name: string;
  aqi: number;
  pm2_5: number;
  pm10: number;
  co2_ppm: number;
  voc_ppb: number;
  temperature_c: number;
  humidity_pct: number;
  category: string;
  color: string;
  advisory: string;
  recorded_at: string;
}

interface AQIBadgeProps {
  zones: AirQualityZone[];
  summary: any;
  onRefresh: () => void;
  isAdminOrStaff?: boolean;
}

export const AQIBadge: React.FC<AQIBadgeProps> = ({ zones, summary }) => {
  const [selectedZone, setSelectedZone] = useState<AirQualityZone | null>(zones[0] || null);

  const activeZone = selectedZone || zones[0];

  const getAqiGradient = (aqi: number) => {
    if (aqi <= 50) return 'from-emerald-500/20 to-emerald-950/40 border-emerald-500/30 text-emerald-400';
    if (aqi <= 100) return 'from-amber-500/20 to-amber-950/40 border-amber-500/30 text-amber-400';
    if (aqi <= 150) return 'from-orange-500/20 to-orange-950/40 border-orange-500/30 text-orange-400';
    if (aqi <= 200) return 'from-rose-500/20 to-rose-950/40 border-rose-500/30 text-rose-400';
    return 'from-purple-500/20 to-purple-950/40 border-purple-500/30 text-purple-400';
  };

  return (
    <div className="space-y-6">
      {/* Header with Campus Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Wind className="h-5 w-5 text-teal-400" />
            Campus Ambient & Indoor Air Quality (AQI) Heatmap
          </h3>
          <p className="text-xs text-slate-400">
            Micro-climate telemetry across academic quads, laboratories, and dining halls
          </p>
        </div>

        {summary && (
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
              <span className="text-slate-400">Campus Average:</span>
              <strong className="text-white text-sm">{summary.avgAqi} AQI</strong>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                {summary.overallCategory}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Air Quality Zone Heatmap Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {zones.map((zone) => {
          const style = getAqiGradient(zone.aqi);
          const isSelected = activeZone?.id === zone.id;

          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer bg-gradient-to-b ${style} ${
                isSelected ? 'ring-2 ring-teal-400 shadow-glow-cyan' : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-bold text-xs text-white truncate max-w-[160px]">
                  {zone.zone_name}
                </span>
                <span className="text-2xl font-black font-mono tracking-tight">{zone.aqi}</span>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/40 inline-block mb-3">
                {zone.category}
              </span>

              {/* Pollutants row */}
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800/80 text-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] block">PM2.5</span>
                  <strong>{zone.pm2_5} µg</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">PM10</span>
                  <strong>{zone.pm10} µg</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">CO₂</span>
                  <strong>{zone.co2_ppm} ppm</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Zone Deep Dive & Health Advisory */}
      {activeZone && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
                Active Zone Deep-Dive
              </span>
              <h4 className="text-lg font-extrabold text-white mt-1">{activeZone.zone_name}</h4>
              <p className="text-xs text-slate-400">
                Logged at {new Date(activeZone.recorded_at).toLocaleTimeString()}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] block">Ambient Temp</span>
                  <span className="text-base font-bold text-white">{activeZone.temperature_c}°C</span>
                </div>
                <Thermometer className="h-5 w-5 text-amber-400" />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] block">Relative Humidity</span>
                  <span className="text-base font-bold text-white">{activeZone.humidity_pct}%</span>
                </div>
                <Droplets className="h-5 w-5 text-cyan-400" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400">VOCs (Volatile Organics)</span>
                <span className="font-mono font-bold text-emerald-400">{activeZone.voc_ppb} ppb</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Baseline healthy threshold is below 120 ppb in indoor learning environments.
              </p>
            </div>
          </div>

          {/* Health Advisory & Operational Protocols */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 flex flex-col justify-between">
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-teal-400" />
                  Health Advisory & Environmental Protocol
                </span>
                <span className="text-[10px] font-mono text-slate-400">Index Scale: US EPA AQI</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
                  Zone Clinical Health Advisory:
                </span>
                <p className="text-slate-200 leading-relaxed text-xs">{activeZone.advisory}</p>
              </div>

              <div className="space-y-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Recommended Campus Actions
                </h5>
                <ul className="space-y-1.5 text-slate-300 text-xs">
                  {activeZone.aqi > 100 ? (
                    <>
                      <li className="flex items-center gap-2 text-rose-300">
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                        Increase HVAC outdoor air intake filtration dampers to MERV 14 level.
                      </li>
                      <li className="flex items-center gap-2 text-amber-300">
                        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                        Notify physical education and athletics faculty to shift high-exertion drills indoors.
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2 text-emerald-300">
                        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                        Outdoor air quality is optimal for open-air study sessions and natural ventilation.
                      </li>
                      <li className="flex items-center gap-2 text-slate-300">
                        <Info className="h-4 w-4 text-cyan-400 shrink-0" />
                        Standard economizer ventilation cycles running continuously.
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
