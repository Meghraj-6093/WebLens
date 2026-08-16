import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalWorkspaceDB } from '../lib/db.js';
import { startScan } from '../lib/api.js';
import { HistoricalScanItem } from '@weblens/shared';
import { Button } from '../components/ui/Button.js';
import { 
  Clock, 
  Search, 
  GitCompare, 
  Trash2, 
  RotateCw, 
  Download,
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils.js';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoricalScanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [reScanningId, setReScanningId] = useState<string | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await LocalWorkspaceDB.getAllScans();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load local scan history', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleToggleSelect = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const handleRunCompare = () => {
    if (selectedForCompare.length === 2) {
      navigate(`/compare?id1=${selectedForCompare[0]}&id2=${selectedForCompare[1]}`);
    }
  };

  const handleDelete = async (id: string, domain: string) => {
    if (window.confirm(`Delete audit record for ${domain}?`)) {
      await LocalWorkspaceDB.deleteScan(id);
      await loadHistory();
    }
  };

  const handleReScan = async (domain: string, scanId: string) => {
    setReScanningId(scanId);
    try {
      const res = await startScan(domain);
      navigate(`/scan/${res.scanId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to re-scan.');
      setReScanningId(null);
    }
  };

  const handleExportScan = async (scanId: string, domain: string) => {
    const report = await LocalWorkspaceDB.getReport(scanId);
    if (!report) {
      alert('Report data not found locally.');
      return;
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weblens-audit-${domain}-${scanId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    return item.domain.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(243,240,232,0.08)] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F0E8] tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-[#FF6B35]" />
            <span>Local Scan History</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8A82] mt-1">
            Browse audits persisted in your browser's IndexedDB, compare regressions, or export JSON reports.
          </p>
        </div>

        {selectedForCompare.length === 2 && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunCompare}
            leftIcon={<GitCompare className="w-3.5 h-3.5" />}
            className="animate-pulse"
          >
            Compare 2 Selected Audits
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#8E8A82] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by domain (e.g. example.com)"
            className="w-full bg-[#11151B] border border-[rgba(243,240,232,0.12)] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F3F0E8] placeholder-[#8E8A82] focus:outline-none focus:border-[#FF6B35] font-mono"
          />
        </div>

        <div className="text-xs text-[#8E8A82]">
          Showing <strong>{filteredHistory.length}</strong> saved audits • Select 2 to compare
        </div>
      </div>

      {/* History Table */}
      <div className="card-glow rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151A21] border-b border-[rgba(243,240,232,0.08)] text-[#8E8A82] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 w-10">Compare</th>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Health Score</th>
                <th className="px-5 py-3">Delta</th>
                <th className="px-5 py-3">Audit Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.06)] font-mono">
              {filteredHistory.map((item) => {
                const isSelected = selectedForCompare.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      'transition-colors',
                      isSelected ? 'bg-[#FF6B35]/10' : 'hover:bg-[#151A21]/50'
                    )}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="rounded border-[rgba(243,240,232,0.2)] bg-[#11151B] accent-[#FF6B35] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#F3F0E8]">
                      <span>{item.domain}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {item.overallScore !== null ? (
                        <span className={cn(
                          'font-bold px-2 py-0.5 rounded text-xs',
                          item.overallScore >= 90 ? 'bg-[#FF6B35]/15 text-[#FF6B35]' :
                          item.overallScore >= 75 ? 'bg-[#FF804F]/15 text-[#FF804F]' :
                          item.overallScore >= 50 ? 'bg-[#D94F20]/15 text-[#D94F20]' : 'bg-rose-500/15 text-rose-400'
                        )}>
                          {item.overallScore}/100
                        </span>
                      ) : (
                        <span className="text-[#6E6A63]">In Progress</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {item.scoreChange !== null && item.scoreChange !== undefined ? (
                        <span className={cn(
                          'font-semibold text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-0.5',
                          item.scoreChange >= 0 ? 'bg-emerald-500/10 text-[#34D399]' : 'bg-rose-500/10 text-rose-400'
                        )}>
                          {item.scoreChange >= 0 ? '+' : ''}{item.scoreChange}
                        </span>
                      ) : (
                        <span className="text-[#6E6A63]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[#8E8A82] text-[11px]">
                      {formatDate(item.completedAt || item.startedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-1.5 font-sans">
                      <button
                        onClick={() => navigate(`/report/${item.id}`)}
                        className="text-xs font-bold text-[#FF6B35] hover:text-[#080A0E] transition-colors px-2.5 py-1 rounded-xl bg-[#FF6B35]/15 hover:bg-[#FF6B35]"
                      >
                        View Report
                      </button>
                      <button
                        onClick={() => handleReScan(item.domain, item.id)}
                        disabled={reScanningId === item.id}
                        title="Re-run audit"
                        className="p-1.5 rounded-lg text-[#8E8A82] hover:text-[#F3F0E8] hover:bg-[#151A21] transition"
                      >
                        <RotateCw className={cn("w-3.5 h-3.5", reScanningId === item.id && "animate-spin text-[#FF6B35]")} />
                      </button>
                      <button
                        onClick={() => handleExportScan(item.id, item.domain)}
                        title="Export JSON"
                        className="p-1.5 rounded-lg text-[#8E8A82] hover:text-[#34D399] hover:bg-emerald-500/10 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.domain)}
                        title="Delete from local history"
                        className="p-1.5 rounded-lg text-[#8E8A82] hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredHistory.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#8E8A82] font-sans">
                    No audits found in your local history.
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
