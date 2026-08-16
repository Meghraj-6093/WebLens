import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startScan } from '../lib/api.js';
import { LocalWorkspaceDB } from '../lib/db.js';
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
  Clock, 
  HardDrive,
  Plus,
  Lock
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils.js';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [history, setHistory] = useState<HistoricalScanItem[]>([]);
  const [stats, setStats] = useState<{
    totalScans: number;
    scansToday: number;
    averageScore: number;
    highestScore: number;
    uniqueDomains: number;
    projectsCount: number;
    monitorsCount: number;
  }>({
    totalScans: 0,
    scansToday: 0,
    averageScore: 0,
    highestScore: 0,
    uniqueDomains: 0,
    projectsCount: 0,
    monitorsCount: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [newScanUrl, setNewScanUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const loadLocalData = async () => {
    setIsLoading(true);
    try {
      const [allScans, allProjects, workspaceStats] = await Promise.all([
        LocalWorkspaceDB.getAllScans(),
        LocalWorkspaceDB.getProjects(),
        LocalWorkspaceDB.getWorkspaceStats()
      ]);
      setHistory(allScans);
      setProjects(allProjects);
      setStats(workspaceStats);
    } catch (err) {
      console.error('Failed to load local workspace data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLocalData();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(243,240,232,0.08)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F0E8] tracking-tight">
              WebLens Local Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30">
              <Lock className="w-3 h-3 text-[#10B981]" /> Local-First
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8E8A82] mt-1">
            Track website audits, monitor regressions across projects, and discover actionable fixes — persisted locally in this browser.
          </p>
        </div>

        {/* Quick URL Scan Box */}
        <form onSubmit={handleQuickScan} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8E8A82] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={newScanUrl}
              onChange={(e) => setNewScanUrl(e.target.value)}
              placeholder="Run quick audit (e.g. site.com)"
              className="w-full bg-[#11151B] border border-[rgba(243,240,232,0.12)] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3F0E8] placeholder-[#8E8A82] focus:outline-none focus:border-[#FF6B35] font-mono"
            />
          </div>
          <Button type="submit" size="sm" variant="primary" isLoading={isScanning} className="shrink-0 text-xs">
            Start Audit
          </Button>
        </form>
      </div>

      {/* 1. Real Local Workspace Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-glow rounded-2xl p-5 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-2">
          <div className="flex items-center justify-between text-[#8E8A82]">
            <span className="text-xs font-display font-semibold">Saved Audits</span>
            <Activity className="w-4 h-4 text-[#FF6B35]" />
          </div>
          <div className="text-3xl font-bold font-display text-[#F3F0E8] tracking-tight">
            {stats.totalScans}
          </div>
          <div className="text-[11px] font-sans text-[#6E6A63]">{stats.uniqueDomains} unique domains</div>
        </div>

        <div className="card-glow rounded-2xl p-5 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-2">
          <div className="flex items-center justify-between text-[#8E8A82]">
            <span className="text-xs font-display font-semibold">Average Health Score</span>
            <TrendingUp className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="text-3xl font-bold font-display text-[#FF6B35] tracking-tight">
            {stats.averageScore > 0 ? `${stats.averageScore}/100` : '—'}
          </div>
          <div className="text-[11px] font-sans text-[#6E6A63]">Across your saved audits</div>
        </div>

        <div className="card-glow rounded-2xl p-5 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-2">
          <div className="flex items-center justify-between text-[#8E8A82]">
            <span className="text-xs font-display font-semibold">Peak Score</span>
            <Sparkles className="w-4 h-4 text-[#FF804F]" />
          </div>
          <div className="text-3xl font-bold font-display text-[#F3F0E8] tracking-tight">
            {stats.highestScore > 0 ? `${stats.highestScore}/100` : '—'}
          </div>
          <div className="text-[11px] font-sans text-[#6E6A63]">Highest recorded score</div>
        </div>

        <div className="card-glow rounded-2xl p-5 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-2">
          <div className="flex items-center justify-between text-[#8E8A82]">
            <span className="text-xs font-display font-semibold">Browser Storage</span>
            <HardDrive className="w-4 h-4 text-[#D8D4CA]" />
          </div>
          <div className="text-xl font-bold font-display text-[#F3F0E8] tracking-tight">
            {stats.projectsCount} Proj • {stats.monitorsCount} Mon
          </div>
          <div className="text-[11px] font-sans text-[#6E6A63]">Stored in IndexedDB</div>
        </div>
      </div>

      {/* 2. Project Workspaces Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-[#F3F0E8] tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF6B35]" />
              <span>Local Workspaces ({projects.length})</span>
            </h2>
            <p className="text-xs text-[#8E8A82]">Organize client sites, personal portfolios, and web apps.</p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/projects')}
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
                className="card-glow rounded-2xl p-5 border border-[rgba(243,240,232,0.08)] bg-[#11151B] hover:border-[#FF6B35]/40 cursor-pointer space-y-3 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F3F0E8] group-hover:text-[#FF6B35] transition-colors truncate">
                    {p.name}
                  </span>
                  <span className="text-[11px] font-mono text-[#8E8A82]">
                    {p.domain}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div className="text-2xl font-extrabold font-mono text-[#FF6B35]">
                    {p.latestScore !== null ? `${p.latestScore}/100` : 'Not scanned'}
                  </div>

                  {p.scoreChange !== null && (
                    <span className={cn(
                      'text-xs font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5',
                      p.scoreChange >= 0 ? 'bg-emerald-500/10 text-[#34D399]' : 'bg-rose-500/10 text-rose-400'
                    )}>
                      {p.scoreChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {p.scoreChange > 0 ? `+${p.scoreChange}` : p.scoreChange}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-[rgba(243,240,232,0.08)] flex items-center justify-between text-[11px] text-[#8E8A82]">
                  <span>{p.totalScans} audit{p.totalScans === 1 ? '' : 's'} recorded</span>
                  <span className="text-[#FF6B35] group-hover:translate-x-0.5 transition-transform font-semibold">View →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-glow rounded-2xl p-8 border border-[rgba(243,240,232,0.08)] bg-[#11151B] text-center space-y-3">
            <FolderPlus className="w-8 h-8 text-[#8E8A82] mx-auto" />
            <h3 className="text-sm font-bold text-[#F3F0E8]">Create your first Project Workspace</h3>
            <p className="text-xs text-[#8E8A82] max-w-sm mx-auto">
              Group related scans and track historical health improvements over time in your local workspace.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/projects')}
            >
              Create Workspace
            </Button>
          </div>
        )}
      </div>

      {/* 3. Recent Scans Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#F3F0E8] tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF6B35]" />
            <span>Recent Audits & History</span>
          </h2>
          <Button size="sm" variant="ghost" onClick={() => navigate('/history')}>
            View All History →
          </Button>
        </div>

        <div className="card-glow rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#151A21] border-b border-[rgba(243,240,232,0.08)] text-[#8E8A82] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Domain</th>
                  <th className="px-5 py-3">Overall Score</th>
                  <th className="px-5 py-3">Score Delta</th>
                  <th className="px-5 py-3">Audit Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                {history.slice(0, 8).map((item) => (
                  <tr key={item.id} className="hover:bg-[#151A21]/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#F3F0E8] flex items-center gap-2">
                      <span className="font-mono">{item.domain}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {item.overallScore !== null ? (
                        <span className={cn(
                          'font-mono font-bold px-2 py-0.5 rounded text-xs',
                          item.overallScore >= 90 ? 'bg-[#FF6B35]/15 text-[#FF6B35]' :
                          item.overallScore >= 75 ? 'bg-[#FF804F]/15 text-[#FF804F]' :
                          item.overallScore >= 50 ? 'bg-[#D94F20]/15 text-[#D94F20]' : 'bg-rose-500/15 text-rose-400'
                        )}>
                          {item.overallScore}/100
                        </span>
                      ) : (
                        <span className="text-[#6E6A63] font-mono">In Progress</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {item.scoreChange !== null && item.scoreChange !== undefined ? (
                        <span className={cn(
                          'font-mono font-semibold text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-0.5',
                          item.scoreChange >= 0 ? 'bg-emerald-500/10 text-[#34D399]' : 'bg-rose-500/10 text-rose-400'
                        )}>
                          {item.scoreChange >= 0 ? '+' : ''}{item.scoreChange}
                        </span>
                      ) : (
                        <span className="text-[#6E6A63]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[#8E8A82] font-mono text-[11px]">
                      {formatDate(item.completedAt || item.startedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/report/${item.id}`)}
                        className="text-xs font-semibold text-[#FF6B35] hover:text-[#FF804F] transition-colors"
                      >
                        Open Report →
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-[#8E8A82] font-sans">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Activity className="w-8 h-8 text-[#6E6A63] mx-auto" />
                        <div className="font-bold text-[#F3F0E8] text-sm">No Scans Yet</div>
                        <p className="text-xs text-[#8E8A82]">Analyze your first website to start building your local audit history.</p>
                        <div className="pt-2">
                          <Button size="sm" variant="primary" onClick={() => navigate('/')}>
                            Analyze Website
                          </Button>
                        </div>
                      </div>
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
