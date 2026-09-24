import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Shield, ShieldCheck, UserCheck, AlertCircle, Key, CheckCircle2 } from 'lucide-react';
import { api, getStoredUser } from '../lib/api';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const currentUser = getStoredUser();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.getUsers(),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUpdatingId(null);
    },
    onError: (err: any) => {
      alert(`Failed to update user role: ${err.message}`);
      setUpdatingId(null);
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    setUpdatingId(userId);
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  if (currentUser.role !== 'admin') {
    return (
      <div className="p-12 text-center space-y-4">
        <Shield className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          The User & Role Access Manager is restricted to Campus System Administrators. Use the persona switcher in the top right to switch to the Admin role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <Users className="h-6 w-6 text-emerald-400" />
          Campus User Roles & Security Access Control
        </h2>
        <p className="text-xs text-slate-400">
          Supabase Row-Level-Security (RLS) enforcement and granular role assignment (Admin, Facility Staff, Student)
        </p>
      </div>

      {/* RLS Security Guard Explanation Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <Key className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-white">Active RLS Security Policy Guard:</span>
          <p className="text-slate-300 leading-relaxed">
            All database mutations (valve toggles, route optimization, food waste logs, telemetry intake) are enforced strictly on PostgreSQL via <code className="text-emerald-400 font-mono">is_staff_or_admin()</code> security definer function.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Enrolled Campus Profiles</h3>
          <span className="text-xs text-slate-400">{data?.users?.length || 0} Registered Users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Department</th>
                <th className="pb-3 font-semibold">Assigned Role</th>
                <th className="pb-3 font-semibold text-right">Modify Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {data?.users?.map((user: any) => {
                const isCurrent = user.id === currentUser.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 font-medium text-white flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span>{user.full_name}</span>
                        {isCurrent && (
                          <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                            You
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 font-mono text-slate-400">{user.email}</td>
                    <td className="py-3 text-slate-300">{user.department || 'Campus Member'}</td>

                    <td className="py-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          user.role === 'admin'
                            ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                            : user.role === 'staff'
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        className="rounded-lg glass-input px-2.5 py-1 text-xs bg-slate-800 text-slate-200 cursor-pointer"
                      >
                        <option value="student">Student (Read Public)</option>
                        <option value="staff">Staff (Telemetry & Ops)</option>
                        <option value="admin">Administrator (Full Access)</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
