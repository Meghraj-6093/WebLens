import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { compareScans } from '../lib/api.js';
import { LocalWorkspaceDB } from '../lib/db.js';
import { ComparisonReport, AuditCategory, HistoricalScanItem } from '@weblens/shared';
import { Button } from '../components/ui/Button.js';
import { IssueCard } from '../components/report/IssueCard.js';
import { 
  GitCompare, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils.js';

export const ComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const id1 = searchParams.get('id1');
  const id2 = searchParams.get('id2');

  const [comparison, setComparison] = useState<ComparisonReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual selector states if IDs are not in URL
  const [allScans, setAllScans] = useState<HistoricalScanItem[]>([]);
  const [selectedId1, setSelectedId1] = useState<string>(id1 || '');
  const [selectedId2, setSelectedId2] = useState<string>(id2 || '');

  useEffect(() => {
    LocalWorkspaceDB.getAllScans().then((data) => {
      setAllScans(data);
      if (!id1 && data.length >= 2) {
        setSelectedId1(data[1].id);
        setSelectedId2(data[0].id);
      }
    }).catch(() => {});
  }, [id1, id2]);

  useEffect(() => {
    const runCompare = async (firstId: string, secondId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await compareScans(firstId, secondId);
        setComparison(data);
      } catch (err: any) {
        setError(err.message || 'Failed to compare scans.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id1 && id2) {
      runCompare(id1, id2);
    } else if (selectedId1 && selectedId2 && selectedId1 !== selectedId2) {
      runCompare(selectedId1, selectedId2);
    }
  }, [id1, id2, selectedId1, selectedId2]);

  const categories: Array<{ id: AuditCategory; label: string }> = [
    { id: 'performance', label: 'Performance (25%)' },
    { id: 'seo', label: 'SEO (20%)' },
    { id: 'accessibility', label: 'Accessibility (20%)' },
    { id: 'security', label: 'Security (15%)' },
    { id: 'mobile', label: 'Mobile (10%)' },
    { id: 'best_practices', label: 'Best Practices (10%)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-slate-400 hover:text-blue-400 inline-flex items-center gap-1 mb-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to History
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <GitCompare className="w-7 h-7 text-blue-400" />
            <span>Audit Comparison & Regression Diff</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analyze exactly what improved, stayed stable, or regressed between two audit checkpoints.
          </p>
        </div>

        {/* Scan Selectors */}
        {allScans.length >= 2 && (
          <div className="flex items-center gap-2 text-xs">
            <select
              value={selectedId1}
              onChange={(e) => setSelectedId1(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            >
              {allScans.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.domain} ({formatDate(s.completedAt || s.startedAt)}) - {s.overallScore}/100
                </option>
              ))}
            </select>
            <span className="text-slate-500 font-bold">vs</span>
            <select
              value={selectedId2}
              onChange={(e) => setSelectedId2(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
            >
              {allScans.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.domain} ({formatDate(s.completedAt || s.startedAt)}) - {s.overallScore}/100
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {comparison && (
        <div className="space-y-8">
          {/* 1. Overall Hero Delta Banner */}
          <div className="card-glow rounded-3xl p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-[#0B101E] via-slate-900 to-[#0B101E] space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="space-y-2">
                <span className="text-xs uppercase font-mono font-bold text-blue-400">Comparison Summary</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {comparison.beforeScan.domain} Health Progression
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  {comparison.summaryExplanation}
                </p>
              </div>

              {/* Visual Score Jump */}
              <div className="flex items-center gap-4 shrink-0 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                <div className="text-center space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono">Previous Scan</div>
                  <div className="text-3xl font-extrabold font-mono text-slate-300">
                    {comparison.beforeScan.overallScore}/100
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {formatDate(comparison.beforeScan.completedAt || comparison.beforeScan.startedAt)}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center px-2">
                  <ArrowRight className="w-5 h-5 text-slate-500" />
                  <span className={cn(
                    'text-xs font-mono font-extrabold px-2 py-0.5 rounded-full mt-1',
                    comparison.overallDelta >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  )}>
                    {comparison.overallDelta >= 0 ? `+${comparison.overallDelta}` : comparison.overallDelta}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-[10px] text-slate-400 font-mono">Latest Scan</div>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400">
                    {comparison.afterScan.overallScore}/100
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {formatDate(comparison.afterScan.completedAt || comparison.afterScan.startedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Category Deltas Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight">Category Score Deltas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => {
                const deltaObj = comparison.categoryDeltas[c.id];
                if (!deltaObj) return null;
                return (
                  <div key={c.id} className="card-glow rounded-xl p-4 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>{c.label}</span>
                      <span className={cn(
                        'font-mono font-bold px-2 py-0.5 rounded text-[11px]',
                        deltaObj.delta > 0 ? 'bg-emerald-500/10 text-emerald-400' :
                        deltaObj.delta < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                      )}>
                        {deltaObj.delta > 0 ? `+${deltaObj.delta}` : deltaObj.delta}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                      <span className="text-slate-500">{deltaObj.beforeScore}/100</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-white font-bold">{deltaObj.afterScore}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Resolved vs Regression Issues */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Fixed Issues */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Resolved Issues ({comparison.issuesDelta.fixedIssues.length})
                </h3>
              </div>

              <div className="space-y-2.5">
                {comparison.issuesDelta.fixedIssues.map((issue, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                      <span>{issue.title}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Fixed</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{issue.description}</p>
                  </div>
                ))}
                {comparison.issuesDelta.fixedIssues.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500 card-glow rounded-xl border border-slate-800">
                    No previously failing issues were resolved between these two scans.
                  </div>
                )}
              </div>
            </div>

            {/* Newly Regressed Issues */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  New Regression Issues ({comparison.issuesDelta.newIssues.length})
                </h3>
              </div>

              <div className="space-y-2.5">
                {comparison.issuesDelta.newIssues.map((issue, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                      <span>{issue.title}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">Regression</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{issue.description}</p>
                  </div>
                ))}
                {comparison.issuesDelta.newIssues.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500 card-glow rounded-xl border border-slate-800">
                    Zero new regressions detected!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!comparison && !isLoading && (
        <div className="card-glow rounded-3xl p-12 border border-slate-800 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
            <GitCompare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Compare Multiple Audits</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run at least two audits on your websites to view historical delta graphs and detect newly introduced regressions.
          </p>
          <Button size="sm" variant="primary" onClick={() => navigate('/')}>
            Run an Audit
          </Button>
        </div>
      )}
    </div>
  );
};
