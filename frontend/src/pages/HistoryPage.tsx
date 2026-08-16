import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScanHistory } from '../lib/api.js';
import { HistoricalScanItem } from '@weblens/shared';
import { Button } from '../components/ui/Button.js';
import { 
  Clock, 
  Search, 
  GitCompare, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Layers
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils.js';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoricalScanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const data = await getScanHistory();
        setHistory(data);
      } finally {
        setIsLoading(false);
      }
    };

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

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    return item.domain.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-indigo-400" />
            <span>Scan History & Delta Tracking</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse previous audits, monitor performance regressions, or select two scans to compare side-by-side.
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
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by domain (e.g. example.com)"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong>{filteredHistory.length}</strong> audits • Select any 2 checkboxes to compare
        </div>
      </div>

      {/* History Table */}
      <div className="card-glow rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 w-10">Compare</th>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Overall Health Score</th>
                <th className="px-5 py-3">Score Delta</th>
                <th className="px-5 py-3">Scan Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.map((item) => {
                const isSelected = selectedForCompare.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      'transition-colors',
                      isSelected ? 'bg-blue-950/30' : 'hover:bg-slate-900/40'
                    )}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white">
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
                        <span className="text-slate-500 font-mono">Running...</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {item.scoreChange !== null && item.scoreChange !== undefined ? (
                        <span className={cn(
                          'font-mono font-semibold text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-0.5',
                          item.scoreChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        )}>
                          {item.scoreChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {item.scoreChange > 0 ? `+${item.scoreChange}` : item.scoreChange}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono">—</span>
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
                        View Report →
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredHistory.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No scans found matching your search.
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
