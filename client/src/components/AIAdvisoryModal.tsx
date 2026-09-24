import React, { useState, useEffect } from 'react';
import { Sparkles, X, CheckCircle2, AlertTriangle, ShieldAlert, RefreshCw, Cpu, Award } from 'lucide-react';
import { api } from '../lib/api';

interface AIAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAdvisoryModal: React.FC<AIAdvisoryModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [advisoryData, setAdvisoryData] = useState<any | null>(null);

  const fetchAdvisory = async () => {
    try {
      setLoading(true);
      const res = await api.getAutoSynthesize();
      setAdvisoryData(res.advisory);
    } catch (err) {
      console.error('Failed to auto-synthesize advisory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !advisoryData) {
      fetchAdvisory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="glass-panel w-full sm:max-w-2xl h-full sm:h-[94vh] rounded-none sm:rounded-3xl border border-emerald-500/30 bg-[#080e1a]/95 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-white shadow-glow-emerald">
              <Sparkles className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">CampusEco-Brain Executive Plan</h3>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                  Gemini 2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Autonomous Multi-Domain IoT Telemetry Intelligence Layer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdvisory}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Re-synthesize"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-3">
              <Cpu className="h-10 w-10 text-emerald-400 animate-bounce" />
              <h4 className="text-sm font-bold text-white">Synthesizing 7 Telemetry Streams...</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Aggregating dustbins, cafeteria food logs, hydraulic pipe pressure, electrical substation demand, and air quality indices.
              </p>
            </div>
          ) : advisoryData ? (
            <div className="space-y-6 animate-in fade-in">
              {/* Score & CO2 Headline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Sustainability Index</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-white">{advisoryData.campus_health_score}</span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Award className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/60 to-slate-900 border border-teal-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-400">Projected CO₂ Abatement</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black text-teal-200">{advisoryData.projected_co2_reduction_kg}</span>
                      <span className="text-xs text-slate-400">kg / day</span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                  Chief Sustainability Officer Brief
                </span>
                <p className="text-slate-200 leading-relaxed text-xs">
                  {advisoryData.executive_summary}
                </p>
              </div>

              {/* Priority Action Directives */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  Prioritized Operational Mitigations
                </h4>

                <div className="space-y-2.5">
                  {advisoryData.priority_action_items?.map((item: any, idx: number) => {
                    const isCritical = item.priority === 'CRITICAL';
                    const isWarning = item.priority === 'WARNING';

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border text-xs flex flex-col gap-1.5 transition-all ${
                          isCritical
                            ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                            : isWarning
                            ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                            : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="uppercase text-[9px] font-extrabold px-2 py-0.5 rounded bg-black/40 tracking-wider">
                            Domain: {item.domain}
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              isCritical
                                ? 'bg-rose-600 text-white'
                                : isWarning
                                ? 'bg-amber-500 text-black'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-100">{item.action}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-white/10">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>Estimated Impact: {item.estimated_impact}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 7-Domain Status Matrix */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cross-Domain Telemetry Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {advisoryData.domain_summaries &&
                    Object.entries(advisoryData.domain_summaries).map(([domain, text]: any) => (
                      <div
                        key={domain}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px]"
                      >
                        <span className="font-bold text-white uppercase tracking-wider block mb-1">
                          {domain}
                        </span>
                        <p className="text-slate-400 leading-snug">{text}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#080e1a] flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Generated: {advisoryData?.generated_at ? new Date(advisoryData.generated_at).toLocaleTimeString() : 'N/A'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-200 transition-colors"
          >
            Close Plan
          </button>
        </div>
      </div>
    </div>
  );
};
