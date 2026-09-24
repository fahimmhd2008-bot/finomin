import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositiveGood?: boolean;
    label?: string;
  };
  colorVariant?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'violet';
  subtitle?: string;
  statusBadge?: string;
  onClick?: () => void;
}

const colorMaps = {
  emerald: {
    iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    glow: 'hover:shadow-glow-emerald',
    border: 'hover:border-emerald-500/30',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    glow: 'hover:shadow-glow-cyan',
    border: 'hover:border-cyan-500/30',
    badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30',
  },
  amber: {
    iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    glow: 'hover:shadow-glow-amber',
    border: 'hover:border-amber-500/30',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
  },
  rose: {
    iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    glow: 'hover:shadow-glow-rose',
    border: 'hover:border-rose-500/30',
    badge: 'bg-rose-950/80 text-rose-300 border-rose-500/30',
  },
  violet: {
    iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    glow: 'hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.3)]',
    border: 'hover:border-indigo-500/30',
    badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  colorVariant = 'emerald',
  subtitle,
  statusBadge,
  onClick,
}) => {
  const styles = colorMaps[colorVariant];
  const isUp = trend ? trend.value >= 0 : false;
  const isGood = trend ? (trend.isPositiveGood ?? true) ? isUp : !isUp : true;

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-5 transition-all duration-300 ${styles.border} ${styles.glow} ${
        onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</p>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</span>
            {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border ${styles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
        {trend ? (
          <div className="flex items-center gap-1">
            <span
              className={`flex items-center font-bold text-xs ${
                isGood ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-[11px] text-slate-400 ml-1">{trend.label || 'vs last week'}</span>
          </div>
        ) : subtitle ? (
          <span className="text-[11px] text-slate-400">{subtitle}</span>
        ) : (
          <span className="text-[11px] text-slate-500">Live sensor feed</span>
        )}

        {statusBadge && (
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${styles.badge}`}>
            {statusBadge}
          </span>
        )}
      </div>
    </div>
  );
};
