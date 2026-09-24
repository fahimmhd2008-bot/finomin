import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ShieldCheck, User, Sparkles, Key, Lock, Mail, ArrowRight } from 'lucide-react';
import { api, setStoredToken, setStoredUser } from '../lib/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@campus-eco.edu');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'admin' | 'staff' | 'student'>('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickLogin = async (selectedRole: 'admin' | 'staff' | 'student') => {
    try {
      setIsSubmitting(true);
      const data = await api.demoLogin(selectedRole);
      setStoredToken(data.token);
      setStoredUser(data.user);

      if (selectedRole === 'student') {
        navigate('/rewards');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      alert(`Login failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleQuickLogin(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080e1a] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10 animate-in fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-glow-emerald mb-2">
            <Leaf className="h-7 w-7 animate-float" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            CampusEco Intelligence
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            AI-Powered Environmental & Sustainability IoT Operations System
          </p>
        </div>

        {/* 1-Click Persona Quick Access Box */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              1-Click Persona Demo Sign-In
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Zero Setup</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={isSubmitting}
              className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-950/20 text-left transition-all group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white group-hover:text-rose-300">Dr. Evelyn Vance</span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-500/40">
                    Administrator
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Full access: IoT overrides, AI advisory & user controls</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => handleQuickLogin('staff')}
              disabled={isSubmitting}
              className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-950/20 text-left transition-all group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white group-hover:text-amber-300">Carlos Mendez</span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
                    Facility Staff
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Dustbin dispatch, water valves, food logs & energy</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => handleQuickLogin('student')}
              disabled={isSubmitting}
              className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-950/20 text-left transition-all group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300">Alex Chen</span>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    Student
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Recycling wallet, voucher store & air quality view</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        {/* Standard Email / Password Form */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block text-center">
            Or Sign In with Credentials
          </span>

          <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Campus Email</label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl glass-input pl-9 pr-3 py-2 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl glass-input pl-9 pr-3 py-2 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full rounded-xl glass-input p-2 text-xs"
              >
                <option value="admin">Administrator</option>
                <option value="staff">Facility & Kitchen Staff</option>
                <option value="student">Student</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald transition-all"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to CampusEco'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
