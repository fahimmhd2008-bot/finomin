import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Trash2,
  Utensils,
  Droplets,
  Zap,
  Gift,
  CloudRain,
  Wind,
  Users,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { getStoredUser, clearStoredToken } from '../lib/api';

interface SidebarProps {
  onOpenAIPlan?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAIPlan }) => {
  const currentUser = getStoredUser();
  const isAdmin = currentUser?.role === 'admin';
  const isStaffOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'staff';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: 'Live',
      allowed: true,
    },
    {
      to: '/dustbins',
      label: 'Smart Dustbins',
      icon: Trash2,
      allowed: isStaffOrAdmin,
    },
    {
      to: '/food-waste',
      label: 'Cafeteria Ops',
      icon: Utensils,
      allowed: isStaffOrAdmin,
    },
    {
      to: '/water',
      label: 'Water Leak Detection',
      icon: Droplets,
      allowed: isStaffOrAdmin,
    },
    {
      to: '/energy',
      label: 'Campus Energy',
      icon: Zap,
      allowed: isStaffOrAdmin,
    },
    {
      to: '/rewards',
      label: 'Plastic Rewards Hub',
      icon: Gift,
      badge: 'Points',
      allowed: true,
    },
    {
      to: '/rainwater',
      label: 'Rainwater Cisterns',
      icon: CloudRain,
      allowed: isStaffOrAdmin,
    },
    {
      to: '/air-quality',
      label: 'Campus Air Quality',
      icon: Wind,
      allowed: true,
    },
    {
      to: '/admin/users',
      label: 'User & Access Control',
      icon: Users,
      allowed: isAdmin,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#080e1a]/95 flex flex-col justify-between shrink-0 hidden md:flex h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Navigation Section */}
        <div>
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Intelligence Domains
          </div>
          <nav className="space-y-1">
            {navItems
              .filter(item => item.allowed)
              .map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 uppercase">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
          </nav>
        </div>

        {/* AI Quick Insight Box */}
        {isStaffOrAdmin && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/20 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <Sparkles className="h-4 w-4" />
              <span>CampusEco-Brain</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Autonomous telemetry synthesis powered by Gemini 2.5 Pro & Flash.
            </p>
            <button
              onClick={onOpenAIPlan}
              className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              Synthesize Advisory
            </button>
          </div>
        )}
      </div>

      {/* Footer Info & Sign out */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="text-[11px]">
            <p className="text-slate-400 font-medium">Campus Eco Net</p>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              IoT Stream Active
            </span>
          </div>
          <button
            onClick={() => {
              clearStoredToken();
              window.location.href = '/login';
            }}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
