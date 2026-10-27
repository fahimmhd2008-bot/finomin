import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Leaf,
  Bell,
  Sparkles,
  User,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  LogIn,
  LogOut,
  ExternalLink,
  Video
} from 'lucide-react';
import { getStoredUser, setStoredUser, api, setStoredToken, clearStoredToken } from '../lib/api';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  onOpenAIPlan?: () => void;
  alerts?: any[];
  onResolveAlert?: (alertId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAIPlan, alerts = [], onResolveAlert }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleSignOut = async () => {
    try {
      clearStoredToken();
      if (supabase && supabase.auth) {
        await supabase.auth.signOut().catch(() => {});
      }
    } finally {
      navigate('/login?force=true');
    }
  };

  const handleRoleSwitch = async (role: 'admin' | 'staff' | 'student') => {
    try {
      const data = await api.demoLogin(role);
      setStoredToken(data.token);
      setStoredUser(data.user);
      setCurrentUser(data.user);
      setShowRoleDropdown(false);
      window.location.reload();
    } catch (err) {
      console.error('Role switch error:', err);
    }
  };

  const unresolvedAlerts = alerts.filter((a: any) => !a.is_resolved);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080e1a]/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-glow-emerald">
            <Leaf className="h-5 w-5 text-white animate-float" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                CampusEco
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                Gemini 2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              AI Environmental & Sustainability Intelligence System
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Explainer Video Link */}
          <a
            href="/walkthrough.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 hover:text-cyan-200 transition-all transform hover:scale-[1.02]"
            title="Watch Animated Explainer Video with Voiceover & Architecture Breakdown"
          >
            <Video className="h-3.5 w-3.5 text-cyan-400" />
            <span>Explainer Video</span>
          </a>

          {/* Master AI Plan Button */}
          {currentUser.role !== 'student' && (
            <button
              onClick={onOpenAIPlan}
              className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-glow-emerald transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-3.5 w-3.5 animate-spin-slow" />
              <span>Campus AI Advisory</span>
            </button>
          )}

          {/* System Alerts Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="System Alerts"
            >
              <Bell className="h-5 w-5" />
              {unresolvedAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                  {unresolvedAlerts.length}
                </span>
              )}
            </button>

            {/* Alerts Dropdown Modal */}
            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-800 bg-[#0c1427] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Active Telemetry Alerts ({unresolvedAlerts.length})
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowAlertsDropdown(false)}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Close
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {unresolvedAlerts.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      All campus sub-systems operating within normal baselines.
                    </div>
                  ) : (
                    unresolvedAlerts.map((alert: any) => (
                      <div
                        key={alert.id}
                        className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1.5 ${
                          alert.severity === 'critical'
                            ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                            : alert.severity === 'warning'
                            ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                            : 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="uppercase text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-black/40 tracking-wider">
                            {alert.domain}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-snug">{alert.message}</p>
                        {onResolveAlert && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                onResolveAlert(alert.id);
                              }}
                              className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
                            >
                              Mark Resolved
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Direct Login Button on the Topside of the Web Page */}
          <Link
            to="/login?force=true"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 transition-all transform hover:scale-[1.02] shadow-sm"
            title="Open Login & Authentication Page"
          >
            <LogIn className="h-3.5 w-3.5 text-emerald-400" />
            <span>Login</span>
          </Link>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="text-left hidden md:block">
                <p className="font-semibold leading-none">{currentUser.full_name}</p>
                <span className={`text-[9px] uppercase font-bold tracking-wider ${
                  currentUser.role === 'admin' ? 'text-rose-400' : currentUser.role === 'staff' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {/* Profile & Login dropdown on the topside of the webpage */}
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-[#0c1427] shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                {/* User Header */}
                <div className="px-2.5 py-2 border-b border-slate-800 mb-2">
                  <p className="text-xs font-bold text-white">{currentUser.full_name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  <span className={`inline-block mt-1 text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                    currentUser.role === 'admin'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                      : currentUser.role === 'staff'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {currentUser.role} Role Active
                  </span>
                </div>

                {/* Quick Link to Full Login Page */}
                <Link
                  to="/login?force=true"
                  onClick={() => setShowRoleDropdown(false)}
                  className="w-full mb-2 flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                    Open Login Page
                  </span>
                  <ExternalLink className="h-3 w-3 text-emerald-400" />
                </Link>

                {/* Persona Switch Options */}
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Persona / Role
                </div>

                <div className="space-y-1 mb-2">
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      currentUser.role === 'admin' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-rose-400" />
                      Administrator
                    </span>
                    {currentUser.role === 'admin' && <span className="text-[10px] font-bold">Active</span>}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('staff')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      currentUser.role === 'staff' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                      Facility Staff
                    </span>
                    {currentUser.role === 'staff' && <span className="text-[10px] font-bold">Active</span>}
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('student')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      currentUser.role === 'student' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-emerald-400" />
                      Student
                    </span>
                    {currentUser.role === 'student' && <span className="text-[10px] font-bold">Active</span>}
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out & Go to Login</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
