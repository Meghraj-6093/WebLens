import React, { useState, useEffect } from 'react';
import { Shield, Activity, Users, AlertTriangle, CheckCircle2, Server, Cpu, Database } from 'lucide-react';
import { AdminSystemStats, FailureLogEntry } from '@weblens/shared';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminSystemStats | null>(null);
  const [failures, setFailures] = useState<FailureLogEntry[]>([]);
  const [queue, setQueue] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAdminData = async () => {
    try {
      const [statsRes, failuresRes, queueRes, usersRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/stats'),
        fetch('http://localhost:3001/api/admin/failures'),
        fetch('http://localhost:3001/api/admin/queue'),
        fetch('http://localhost:3001/api/admin/users'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (failuresRes.ok) setFailures(await failuresRes.json());
      if (queueRes.ok) setQueue(await queueRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin & Operations Control Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time scanner cluster telemetry, worker queue monitoring, failure diagnostics, and user metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Cluster Healthy
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Scans</div>
            <div className="text-2xl font-black text-white font-mono">{stats.totalScans}</div>
          </div>
          <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Success Rate</div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{stats.successRatePercent}%</div>
          </div>
          <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Average Score</div>
            <div className="text-2xl font-black text-blue-400 font-mono">{stats.averageScore}/100</div>
          </div>
          <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Users</div>
            <div className="text-2xl font-black text-purple-400 font-mono">{stats.totalUsers}</div>
          </div>
          <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Monitored Targets</div>
            <div className="text-2xl font-black text-amber-400 font-mono">{stats.activeMonitors}</div>
          </div>
          <div className="card-glow p-4 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Avg Duration</div>
            <div className="text-2xl font-black text-slate-300 font-mono">{(stats.avgDurationMs / 1000).toFixed(1)}s</div>
          </div>
        </div>
      )}

      {/* Queue & Infrastructure Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker Queue Status */}
        <div className="card-glow p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Scanner Concurrency Queue</span>
          </div>

          {queue && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Running</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">{queue.workers.running}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Queued</div>
                <div className="text-xl font-bold text-amber-400 font-mono">{queue.workers.queued}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Limit</div>
                <div className="text-xl font-bold text-white font-mono">{queue.workers.maxConcurrency}</div>
              </div>
            </div>
          )}
        </div>

        {/* Database & Node Telemetry */}
        <div className="lg:col-span-2 card-glow p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <Server className="w-4 h-4" />
            <span>Cluster Health & Engine Architecture</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Persistence</div>
              <div className="text-xs font-bold text-white">node:sqlite (WAL Mode)</div>
              <div className="text-[10px] text-emerald-400">Zero C++ Dependencies</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Browser Sandboxing</div>
              <div className="text-xs font-bold text-white">Playwright Headless</div>
              <div className="text-[10px] text-blue-400">Subresource SSRF Intercept</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Job Queue</div>
              <div className="text-xs font-bold text-white">Async Semaphore</div>
              <div className="text-[10px] text-amber-400">45s Auto-Recovery Watchdog</div>
            </div>
          </div>
        </div>
      </div>

      {/* Failure Diagnostic Log */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failure Diagnostics Log (Why did a scan fail?)</h2>
        <div className="card-glow rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Target Domain</th>
                <th className="p-4">Failure Category</th>
                <th className="p-4">Error Diagnostics</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {failures.map((f) => (
                <tr key={f.scanId} className="hover:bg-slate-900/30 transition">
                  <td className="p-4 font-bold text-white font-mono">{f.domain}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase border ${f.category === 'ssrf' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : f.category === 'dns' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {f.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px] truncate max-w-md">
                    {f.errorMessage}
                  </td>
                  <td className="p-4 text-right text-slate-500 font-mono text-[11px]">
                    {new Date(f.occurredAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {failures.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Zero recent scan failures recorded in cluster!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
