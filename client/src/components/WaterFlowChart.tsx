import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Droplets, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, Sliders } from 'lucide-react';
import { api } from '../lib/api';

interface WaterSensor {
  id: string;
  sensor_code: string;
  pipe_zone: string;
  current_flow_lpm: number;
  baseline_flow_lpm: number;
  pressure_psi: number;
  is_leak_detected: boolean;
  severity: 'none' | 'minor' | 'major' | 'critical';
  valve_status: 'OPEN' | 'THROTTLED' | 'ISOLATED';
}

interface WaterFlowChartProps {
  sensors: WaterSensor[];
  onRefresh: () => void;
  isAdminOrStaff?: boolean;
}

export const WaterFlowChart: React.FC<WaterFlowChartProps> = ({ sensors, onRefresh, isAdminOrStaff = true }) => {
  const [selectedSensor, setSelectedSensor] = useState<WaterSensor>(sensors[0] || null);
  const [analyzingSensor, setAnalyzingSensor] = useState<string | null>(null);
  const [aiDiagnostic, setAiDiagnostic] = useState<any | null>(null);
  const [valveUpdating, setValveUpdating] = useState<string | null>(null);

  // Generate 12-hour simulated flow trend comparison
  const activeSensor = selectedSensor || sensors[0];
  const chartData = [
    { time: '02:00', baseline: activeSensor?.baseline_flow_lpm || 80, current: (activeSensor?.baseline_flow_lpm || 80) * 0.95 },
    { time: '04:00', baseline: activeSensor?.baseline_flow_lpm || 80, current: (activeSensor?.baseline_flow_lpm || 80) * 0.98 },
    { time: '06:00', baseline: activeSensor?.baseline_flow_lpm || 80, current: (activeSensor?.baseline_flow_lpm || 80) * 1.05 },
    { time: '08:00', baseline: activeSensor?.baseline_flow_lpm || 80, current: (activeSensor?.baseline_flow_lpm || 80) * 1.25 },
    { time: '10:00', baseline: activeSensor?.baseline_flow_lpm || 80, current: activeSensor?.current_flow_lpm || 120 },
    { time: '12:00 (Now)', baseline: activeSensor?.baseline_flow_lpm || 80, current: activeSensor?.current_flow_lpm || 142.5 },
  ];

  const handleRunAiDiagnostic = async (sensor: WaterSensor) => {
    try {
      setAnalyzingSensor(sensor.sensor_code);
      setAiDiagnostic(null);
      const res = await api.analyzeWaterLeak({
        sensor_code: sensor.sensor_code,
        pipe_zone: sensor.pipe_zone,
        current_flow: sensor.current_flow_lpm,
        baseline_flow: sensor.baseline_flow_lpm,
        pressure_psi: sensor.pressure_psi,
      });
      setAiDiagnostic(res.analysis);
    } catch (err) {
      console.error('AI Leak diagnostic error:', err);
    } finally {
      setAnalyzingSensor(null);
    }
  };

  const handleValveToggle = async (sensorCode: string, action: 'OPEN' | 'THROTTLED' | 'ISOLATED') => {
    try {
      setValveUpdating(sensorCode);
      await api.updateWaterValve(sensorCode, action);
      onRefresh();
    } catch (err) {
      console.error('Failed to update valve:', err);
    } finally {
      setValveUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Zone Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-400" />
            Hydraulic Flow & Burst Anomaly Monitoring
          </h3>
          <p className="text-xs text-slate-400">
            Real-time differential telemetry vs baseline with automated emergency isolation valves
          </p>
        </div>

        {/* Sensor selector tabs */}
        <div className="flex flex-wrap gap-2 text-xs">
          {sensors.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSensor(s);
                setAiDiagnostic(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                (activeSensor?.id === s.id)
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{s.sensor_code}</span>
              {s.is_leak_detected && (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Hydraulic Dashboard Row */}
      {activeSensor && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recharts Flow telemetry chart (8 cols) */}
          <div className="lg:col-span-8 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">{activeSensor.pipe_zone}</h4>
                <p className="text-xs text-slate-400">
                  Sensor ID: <span className="font-mono text-cyan-400">{activeSensor.sensor_code}</span> | Pressure: {activeSensor.pressure_psi} PSI
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${
                    activeSensor.severity === 'critical'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-glow-rose'
                      : activeSensor.severity === 'major'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {activeSensor.severity === 'none' ? 'Flow Nominal' : `${activeSensor.severity.toUpperCase()} LEAK`}
                </span>
              </div>
            </div>

            {/* Recharts Component */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 'dataMax + 40']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    name="Baseline Flow (L/min)"
                    dataKey="baseline"
                    stroke="#059669"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    name="Live Flow (L/min)"
                    dataKey="current"
                    stroke={activeSensor.is_leak_detected ? '#f43f5e' : '#06b6d4'}
                    strokeWidth={3}
                    dot={{ r: 4, fill: activeSensor.is_leak_detected ? '#f43f5e' : '#06b6d4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Valve Controls & Quick Metric Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400">Current Flow: </span>
                  <strong className="text-white text-sm">{activeSensor.current_flow_lpm} L/min</strong>
                </div>
                <div>
                  <span className="text-slate-400">Baseline: </span>
                  <strong className="text-slate-300">{activeSensor.baseline_flow_lpm} L/min</strong>
                </div>
                <div>
                  <span className="text-slate-400">Variance: </span>
                  <strong className={activeSensor.current_flow_lpm > activeSensor.baseline_flow_lpm ? 'text-rose-400' : 'text-emerald-400'}>
                    +{(activeSensor.current_flow_lpm - activeSensor.baseline_flow_lpm).toFixed(1)} L/min
                  </strong>
                </div>
              </div>

              {/* Valve Actuator buttons */}
              {isAdminOrStaff && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                    <Sliders className="h-3 w-3" /> Valve:
                  </span>
                  {(['OPEN', 'THROTTLED', 'ISOLATED'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleValveToggle(activeSensor.sensor_code, mode)}
                      disabled={valveUpdating === activeSensor.sensor_code}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors ${
                        activeSensor.valve_status === mode
                          ? mode === 'ISOLATED'
                            ? 'bg-rose-600 text-white'
                            : mode === 'THROTTLED'
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Diagnostic & Action Panel (4 cols) */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  Gemini Pipe Diagnostics
                </span>
                <span className="text-[10px] text-slate-400">Model: Gemini 2.5 Flash</span>
              </div>

              {aiDiagnostic ? (
                <div className="space-y-3.5 text-xs animate-in fade-in">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 font-medium">Leak Probability</span>
                      <span className="text-base font-black text-rose-400">
                        {aiDiagnostic.leak_probability_pct}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Estimated Water Loss:</span>
                      <strong className="text-amber-300">{aiDiagnostic.estimated_loss_liters_per_hour} L/hr</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Emergency Isolation Directives
                    </label>
                    <p className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/30 text-rose-200 text-xs leading-relaxed">
                      {aiDiagnostic.isolation_valve_instructions}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 text-[11px]">
                    <span className="text-slate-400 font-medium">Dispatch Priority:</span>
                    <strong className="text-cyan-300">{aiDiagnostic.dispatch_priority}</strong>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 space-y-2">
                  <ShieldAlert className="h-8 w-8 mx-auto text-slate-600" />
                  <p className="text-xs text-slate-400">
                    Click below to trigger AI hydraulic anomaly diagnostic for {activeSensor.sensor_code}.
                  </p>
                </div>
              )}
            </div>

            {isAdminOrStaff && (
              <div className="pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => handleRunAiDiagnostic(activeSensor)}
                  disabled={analyzingSensor === activeSensor.sensor_code}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {analyzingSensor === activeSensor.sensor_code ? 'Analyzing Telemetry...' : 'Run AI Diagnostic'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
