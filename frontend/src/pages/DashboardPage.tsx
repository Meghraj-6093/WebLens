import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { getProjects, getScanHistory, startScan } from '../lib/api.js';
import { ProjectSummary, HistoricalScanItem } from '@weblens/shared';
import { Button } from '../components/ui/Button.js';
import { 
  Activity, 
  Layers, 
  FolderPlus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Zap, 
  ChevronRight,
  ExternalLink,
  GitCompare,
  Plus
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils.js';

export const DashboardPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [history, setHistory] = useState<HistoricalScanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newScanUrl, setNewScanUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [projData, histData] = await Promise.all([
          getProjects().catch(() => []),
          getScanHistory().catch(() => []),
        ]);
        setProjects(projData);
        setHistory(histData);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScanUrl.trim()) return;
    setIsScanning(true);
    try {
      const res = await startScan(newScanUrl.trim());
      navigate(`/scan/${res.scanId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to start scan.');
      setIsScanning(false);
    }
  };

  // Calculations
  const completedScans = history.filter((h) => h.status === 'completed' && h.overallScore !== null);
  const totalScansCount = completedScans.length;
  const avgScore = totalScansCount > 0
    ? Math.round(completedScans.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalScansCount)
    : 0;
  const bestScore = totalScansCount > 0
    ? Math.max(...completedScans.map((h) => h.overallScore || 0))
    : 0;

  const usagePercent = user ? Math.round((user.scansToday / user.maxScansPerDay) * 100) : 30;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {user ? `Welcome back, ${user.name}` : 'WebLens Developer Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track website audits, monitor regressions across projects, and discover actionable AI fixes.
          </p>
        </div>

        {/* Quick URL Scan Box */}
        <form onSubmit={handleQuickScan} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={newScanUrl}
              onChange={(e) => setNewScanUrl(e.target.value)}
              placeholder="Run quick audit (e.g. site.com)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <Button type="submit" size="sm" isLoading={isScanning} className="shrink-0 text-xs">
            Start Audit
          </Button>
        </form>
      </div>

      {/* 1. High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-glow rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Audits</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            {totalScansCount}
          </div>
          <div className="text-[11px] text-slate-500">Across all monitored targets</div>
        </div>

        <div className="card-glow rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Average Health Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {avgScore > 0 ? `${avgScore}/100` : '—'}
          </div>
          <div className="text-[11px] text-slate-500">Calculated across 6 categories</div>
        </div>

        <div className="card-glow rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Best Score Recorded</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
            {bestScore > 0 ? `${bestScore}/100` : '—'}
          </div>
          <div className="text-[11px] text-slate-500">Peak performance benchmark</div>
        </div>

        <div className="card-glow rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Daily Usage Quota</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {user ? `${user.scansToday} / ${user.maxScansPerDay}` : '3 / 3 (Anon)'}
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, usagePercent)}%` }} />
          </div>
        </div>
      </div>

      {/* 2. Project Workspaces Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Project Workspaces</span>
            </h2>
            <p className="text-xs text-slate-400">Organize client sites, personal portfolios, and web apps.</p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!user) openAuthModal('register');
              else navigate('/projects');
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Project
          </Button>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/projects`)}
                className="card-glow rounded-2xl p-5 border border-slate-800 hover:border-slate-700 cursor-pointer space-y-3 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                    {p.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {p.domain}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div className="text-2xl font-extrabold font-mono text-emerald-400">
                    {p.latestScore !== null ? `${p.latestScore}/100` : 'Not scanned'}
                  </div>

                  {p.scoreChange !== null && (
                    <span className={cn(
                      'text-xs font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5',
                      p.scoreChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    )}>
                      {p.scoreChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {p.scoreChange > 0 ? `+${p.scoreChange}` : p.scoreChange}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{p.totalScans} audit{p.totalScans === 1 ? '' : 's'} recorded</span>
                  <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">View →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-glow rounded-2xl p-8 border border-slate-800 text-center space-y-3">
            <FolderPlus className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">Create your first Project Workspace</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Keep a dedicated audit history for your portfolio or client websites and detect score drops over time.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (!user) openAuthModal('register');
                else navigate('/projects');
              }}
            >
              Create Workspace
            </Button>
          </div>
        )}
      </div>

      {/* 3. Recent Scans Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Recent Audits & History</span>
          </h2>
          <Button size="sm" variant="ghost" onClick={() => navigate('/history')}>
            View All History →
          </Button>
        </div>

        <div className="card-glow rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Domain</th>
                  <th className="px-5 py-3">Overall Score</th>
                  <th className="px-5 py-3">Score Delta</th>
                  <th className="px-5 py-3">Audit Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.slice(0, 8).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                      <span className="font-mono">{item.domain}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {item.overallScore !== null ? (
                        <span className={cn(
                          'font-mono font-bold px-2 py-0.5 rounded text-xs',
                          item.overallScore >= 90 ? 'bg-emerald-500/10 text-emerald-400' :
                          item.overallScore >= 75 ? 'bg-blue-500/10 text-blue-400' :
                          item.overallScore >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        )}>
                          {item.overallScore}/100
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">In Progress</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {item.scoreChange !== null && item.scoreChange !== undefined ? (
                        <span className={cn(
                          'font-mono font-semibold text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-0.5',
                          item.scoreChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        )}>
                          {item.scoreChange >= 0 ? '+' : ''}{item.scoreChange}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {formatDate(item.completedAt || item.startedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/report/${item.id}`)}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Open Report →
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                      No scans executed yet. Run your first audit above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
