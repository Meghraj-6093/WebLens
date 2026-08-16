import React, { useState, useEffect } from 'react';
import { LocalWorkspaceDB } from '../lib/db.js';
import { Button } from '../components/ui/Button.js';
import { 
  HardDrive, 
  Download, 
  Upload, 
  Trash2, 
  Lock, 
  FileJson,
  CheckCircle2
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [stats, setStats] = useState<{
    totalScans: number;
    scansToday: number;
    scansThisWeek: number;
    scansThisMonth: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    uniqueDomains: number;
    projectsCount: number;
    monitorsCount: number;
    competitorsCount: number;
  }>({
    totalScans: 0,
    scansToday: 0,
    scansThisWeek: 0,
    scansThisMonth: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    uniqueDomains: 0,
    projectsCount: 0,
    monitorsCount: 0,
    competitorsCount: 0
  });

  const [storageEstimate, setStorageEstimate] = useState<string>('Local IndexedDB');
  const [isExporting, setIsExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [clearConfirmation, setClearConfirmation] = useState('');

  const loadStats = async () => {
    try {
      const s = await LocalWorkspaceDB.getWorkspaceStats();
      setStats(s);

      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        if (est.usage) {
          const usageMb = (est.usage / (1024 * 1024)).toFixed(2);
          setStorageEstimate(`${usageMb} MB used`);
        }
      }
    } catch (err) {
      console.error('Failed to load workspace stats', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const json = await LocalWorkspaceDB.exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weblens-workspace-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await LocalWorkspaceDB.importAllData(text);
        setImportStatus(`Successfully restored ${res.importedCount} records to local workspace.`);
        await loadStats();
        setTimeout(() => setImportStatus(null), 4000);
      } catch (err: any) {
        alert(err.message || 'Failed to import WebLens data.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleClearScans = async () => {
    if (window.confirm('Are you sure you want to delete all saved scan reports from this browser?')) {
      await LocalWorkspaceDB.clearScans();
      await loadStats();
      alert('Scan history cleared.');
    }
  };

  const handleClearProjects = async () => {
    if (window.confirm('Are you sure you want to delete all project workspaces from this browser?')) {
      await LocalWorkspaceDB.clearProjects();
      await loadStats();
      alert('Project workspaces cleared.');
    }
  };

  const handleClearAll = async () => {
    if (clearConfirmation !== 'DELETE') {
      alert('Please type DELETE to confirm wiping all local browser data.');
      return;
    }
    await LocalWorkspaceDB.clearAllData();
    setClearConfirmation('');
    await loadStats();
    alert('All local WebLens data wiped.');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="card-glow rounded-3xl p-6 sm:p-8 border border-[rgba(243,240,232,0.08)] bg-[#11151B] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF804F] to-[#D94F20] flex items-center justify-center text-[#080A0E] shadow-lg shadow-[#FF6B35]/20 shrink-0">
              <HardDrive className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-[#F3F0E8] tracking-tight">
                  WebLens Workspace
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30">
                  Client-Side
                </span>
              </div>
              <div className="text-xs text-[#8E8A82] mt-1">
                Private, local browser persistence powered by IndexedDB. Zero accounts required.
              </div>
              <div className="text-[11px] text-[#6E6A63] mt-1 flex items-center gap-2 font-mono">
                <span>Storage engine: {storageEstimate}</span>
                <span>•</span>
                <span className="text-[#34D399] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> Active Local Session
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              isLoading={isExporting}
              leftIcon={<Download className="w-3.5 h-3.5 text-[#FF6B35]" />}
            >
              Export Workspace JSON
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Workspace Storage Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
          <div className="text-[10px] font-bold text-[#8E8A82] uppercase tracking-wider">Saved Audits</div>
          <div className="text-2xl font-black text-[#F3F0E8] font-mono">{stats.totalScans}</div>
          <div className="text-[10px] text-[#6E6A63]">{stats.uniqueDomains} unique domains</div>
        </div>

        <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
          <div className="text-[10px] font-bold text-[#8E8A82] uppercase tracking-wider">Average Score</div>
          <div className="text-2xl font-black text-[#FF6B35] font-mono">
            {stats.averageScore > 0 ? `${stats.averageScore}/100` : '—'}
          </div>
          <div className="text-[10px] text-[#6E6A63]">Across local scans</div>
        </div>

        <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
          <div className="text-[10px] font-bold text-[#8E8A82] uppercase tracking-wider">Peak Score</div>
          <div className="text-2xl font-black text-[#34D399] font-mono">
            {stats.highestScore > 0 ? `${stats.highestScore}/100` : '—'}
          </div>
          <div className="text-[10px] text-[#6E6A63]">Highest recorded</div>
        </div>

        <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
          <div className="text-[10px] font-bold text-[#8E8A82] uppercase tracking-wider">Workspaces</div>
          <div className="text-2xl font-black text-[#F3F0E8] font-mono">{stats.projectsCount}</div>
          <div className="text-[10px] text-[#6E6A63]">Active project sets</div>
        </div>

        <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
          <div className="text-[10px] font-bold text-[#8E8A82] uppercase tracking-wider">Monitors</div>
          <div className="text-2xl font-black text-[#FF804F] font-mono">{stats.monitorsCount}</div>
          <div className="text-[10px] text-[#6E6A63]">Scheduled checks</div>
        </div>

        <div className="card-glow p-4 rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-1">
          <div className="text-[10px] font-bold text-[#8E8A82] uppercase tracking-wider">Competitors</div>
          <div className="text-2xl font-black text-[#D8D4CA] font-mono">{stats.competitorsCount}</div>
          <div className="text-[10px] text-[#6E6A63]">Saved benchmarks</div>
        </div>
      </div>

      {/* 3. Data Backup, Export & Restore */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="card-glow rounded-3xl p-6 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
            <Download className="w-4 h-4" />
            <span>Export WebLens Data</span>
          </div>
          <p className="text-xs text-[#D8D4CA] leading-relaxed">
            Download a portable JSON snapshot containing your saved audit reports, project workspaces, monitor configurations, and competitor comparisons.
          </p>

          <Button
            size="sm"
            variant="primary"
            onClick={handleExportData}
            isLoading={isExporting}
            leftIcon={<FileJson className="w-3.5 h-3.5" />}
          >
            Export All Data (.json)
          </Button>
        </div>

        {/* Import Card */}
        <div className="card-glow rounded-3xl p-6 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#34D399] uppercase tracking-wider">
            <Upload className="w-4 h-4" />
            <span>Restore / Import Data</span>
          </div>
          <p className="text-xs text-[#D8D4CA] leading-relaxed">
            Import a previously exported WebLens JSON backup file to restore audit history into this browser's IndexedDB.
          </p>

          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#151A21] border border-[rgba(243,240,232,0.12)] hover:border-[#FF6B35]/40 text-xs font-semibold text-[#F3F0E8] transition">
              <Upload className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Select Backup File</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-[#34D399] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Privacy Guarantee */}
      <div className="p-6 rounded-3xl bg-[#11151B] border border-[rgba(243,240,232,0.08)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#34D399] uppercase tracking-wider">
          <Lock className="w-4 h-4" />
          <span>Local-First Privacy Architecture</span>
        </div>
        <p className="text-xs text-[#D8D4CA] leading-relaxed">
          WebLens does not require an account or cloud user profile. Your saved audit history, project configurations, and comparisons are stored locally in this browser. Website scans are processed securely by the WebLens scanning engine, while saved results and telemetry remain strictly inside your browser.
        </p>
      </div>

      {/* 5. Danger Zone / Data Wipe */}
      <div className="p-6 sm:p-7 rounded-3xl bg-rose-950/15 border border-rose-500/25 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <Trash2 className="w-5 h-5" />
          <h3 className="text-base font-bold tracking-tight">Clear Workspace Data</h3>
        </div>
        <p className="text-xs text-[#D8D4CA] leading-relaxed">
          Manage or permanently remove data saved in this browser's IndexedDB.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearScans}
            className="text-xs text-[#D8D4CA]"
          >
            Clear Scan History Only
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleClearProjects}
            className="text-xs text-[#D8D4CA]"
          >
            Clear Projects Only
          </Button>
        </div>

        <div className="pt-4 border-t border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="text"
            placeholder="Type DELETE to wipe all"
            value={clearConfirmation}
            onChange={(e) => setClearConfirmation(e.target.value)}
            className="bg-[#080A0E] border border-rose-500/40 rounded-xl px-3 py-1.5 text-xs text-[#F3F0E8] font-mono placeholder-[#6E6A63] focus:outline-none focus:border-rose-500"
          />
          <Button
            size="sm"
            variant="danger"
            onClick={handleClearAll}
            disabled={clearConfirmation !== 'DELETE'}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear All Local Data
          </Button>
        </div>
      </div>
    </div>
  );
};
