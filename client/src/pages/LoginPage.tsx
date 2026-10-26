import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Sparkles, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, setStoredToken, setStoredUser } from '../lib/api';
import { supabase, isLiveSupabase } from '../lib/supabase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@campus-eco.edu');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'admin' | 'staff' | 'student'>('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if user already has an active Supabase session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setStoredToken(session.access_token);
          setStoredUser({
            id: session.user.id,
            email: session.user.email || 'user@campus-eco.edu',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role || 'student',
            department: session.user.user_metadata?.department || 'Campus Community',
          });
          navigate('/dashboard');
        }
      } catch (err) {
        console.warn('Session check warning:', err);
      }
    };
    checkSession();

    // 2. Listen for OAuth callback authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setStoredToken(session.access_token);
        setStoredUser({
          id: session.user.id,
          email: session.user.email || 'user@campus-eco.edu',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'student',
          department: session.user.user_metadata?.department || 'Campus Community',
        });
        navigate('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed. Please verify Supabase Google Provider configuration.');
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (selectedRole: 'admin' | 'staff' | 'student') => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const data = await api.demoLogin(selectedRole);
      setStoredToken(data.token);
      setStoredUser(data.user);

      if (selectedRole === 'student') {
        navigate('/rewards');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(`Login failed: ${err.message}`);
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

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google OAuth & Supabase Sign In Box */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Sign In with Google
            </span>
            <span className="text-[9px] text-emerald-400/90 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Supabase Auth
            </span>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            type="button"
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {isSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
          </button>
        </div>

        {/* 1-Click Persona Quick Access Box */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              1-Click Demo Personas
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Instant Preview</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => handleQuickLogin('admin')}
              disabled={isSubmitting}
              className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 hover:border-rose-500/60 hover:bg-rose-950/20 text-left transition-all group flex items-center justify-between cursor-pointer"
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
              className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-950/20 text-left transition-all group flex items-center justify-between cursor-pointer"
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
              className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-950/20 text-left transition-all group flex items-center justify-between cursor-pointer"
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
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-glow-emerald transition-all cursor-pointer"
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In with Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
