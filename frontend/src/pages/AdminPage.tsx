import React, { useState, useEffect } from 'react';
import { Shield, Server, Cpu } from 'lucide-react';
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
      <div className="flex items-center justify-between border-b border-[rgba(243,240,232,0.08)] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-black text-[#F3F0E8] tracking-tight">Admin & Operations Control Center</h1>
          </div>
          <p className="text-xs text-[#8E8A82] mt-1">
            Real-time scanner cluster telemetry, worker queue monitoring, failure diagnostics, and user metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#34D399] bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
          Cluster Healthy
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
            <div className="text-[11px] font-bold text-[#8E8A82] uppercase">Total Scans</div>
            <div className="text-2xl font-black text-[#F3F0E8] font-mono">{stats.totalScans}</div>
          </div>
          <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
            <div className="text-[11px] font-bold text-[#8E8A82] uppercase">Success Rate</div>
            <div className="text-2xl font-black text-[#34D399] font-mono">{stats.successRatePercent}%</div>
          </div>
          <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
            <div className="text-[11px] font-bold text-[#8E8A82] uppercase">Average Score</div>
            <div className="text-2xl font-black text-[#FF6B35] font-mono">{stats.averageScore}/100</div>
          </div>
          <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
            <div className="text-[11px] font-bold text-[#8E8A82] uppercase">Total Users</div>
            <div className="text-2xl font-black text-[#F3F0E8] font-mono">{stats.totalUsers}</div>
          </div>
          <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
            <div className="text-[11px] font-bold text-[#8E8A82] uppercase">Monitored Targets</div>
            <div className="text-2xl font-black text-[#FF804F] font-mono">{stats.activeMonitors}</div>
          </div>
          <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
            <div className="text-[11px] font-bold text-[#8E8A82] uppercase">Avg Duration</div>
            <div className="text-2xl font-black text-[#D8D4CA] font-mono">{(stats.avgDurationMs / 1000).toFixed(1)}s</div>
          </div>
        </div>
      )}

      {/* Queue & Infrastructure Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker Queue Status */}
        <div className="card-glow p-6 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>Scanner Concurrency Queue</span>
          </div>

          {queue && (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#080A0E] p-3 rounded-xl border border-[rgba(243,240,232,0.08)]">
                <div className="text-[10px] text-[#8E8A82] uppercase">Running</div>
                <div className="text-xl font-bold text-[#34D399] font-mono">{queue.workers.running}</div>
              </div>
              <div className="bg-[#080A0E] p-3 rounded-xl border border-[rgba(243,240,232,0.08)]">
                <div className="text-[10px] text-[#8E8A82] uppercase">Queued</div>
                <div className="text-xl font-bold text-[#FF804F] font-mono">{queue.workers.queued}</div>
              </div>
              <div className="bg-[#080A0E] p-3 rounded-xl border border-[rgba(243,240,232,0.08)]">
                <div className="text-[10px] text-[#8E8A82] uppercase">Limit</div>
                <div className="text-xl font-bold text-[#F3F0E8] font-mono">{queue.workers.maxConcurrency}</div>
              </div>
            </div>
          )}
        </div>

        {/* Database & Node Telemetry */}
        <div className="lg:col-span-2 card-glow p-6 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
            <Server className="w-4 h-4" />
            <span>Cluster Health & Engine Architecture</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#080A0E] border border-[rgba(243,240,232,0.08)] space-y-1">
              <div className="text-[10px] text-[#6E6A63] uppercase font-mono">Persistence</div>
              <div className="text-xs font-bold text-[#F3F0E8]">node:sqlite (WAL Mode)</div>
              <div className="text-[10px] text-[#34D399]">Zero C++ Dependencies</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080A0E] border border-[rgba(243,240,232,0.08)] space-y-1">
              <div className="text-[10px] text-[#6E6A63] uppercase font-mono">Browser Sandboxing</div>
              <div className="text-xs font-bold text-[#F3F0E8]">Playwright Headless</div>
              <div className="text-[10px] text-[#FF6B35]">Subresource SSRF Intercept</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#080A0E] border border-[rgba(243,240,232,0.08)] space-y-1">
              <div className="text-[10px] text-[#6E6A63] uppercase font-mono">Job Queue</div>
              <div className="text-xs font-bold text-[#F3F0E8]">Async Semaphore</div>
              <div className="text-[10px] text-[#FF804F]">45s Auto-Recovery Watchdog</div>
            </div>
          </div>
        </div>
      </div>

      {/* Failure Diagnostic Log */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-[#8E8A82] uppercase tracking-wider">Failure Diagnostics Log (Why did a scan fail?)</h2>
        <div className="card-glow rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151A21] border-b border-[rgba(243,240,232,0.08)] text-[#8E8A82] font-mono uppercase tracking-wider">
              <tr>
                <th className="p-4">Target Domain</th>
                <th className="p-4">Failure Category</th>
                <th className="p-4">Error Diagnostics</th>
                <th className="p-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
              {failures.map((f) => (
                <tr key={f.scanId} className="hover:bg-[#151A21]/50 transition">
                  <td className="p-4 font-bold text-[#F3F0E8] font-mono">{f.domain}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase border ${f.category === 'ssrf' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : f.category === 'dns' ? 'bg-[#FF804F]/15 text-[#FF804F] border-[#FF804F]/30' : 'bg-[#151A21] text-[#8E8A82] border-[rgba(243,240,232,0.08)]'}`}>
                      {f.category}
                    </span>
                  </td>
                  <td className="p-4 text-[#D8D4CA] font-mono text-[11px] truncate max-w-md">
                    {f.errorMessage}
                  </td>
                  <td className="p-4 text-right text-[#8E8A82] font-mono text-[11px]">
                    {new Date(f.occurredAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
              {failures.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#8E8A82]">
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
