import React, { useState } from 'react';
import { FullScanReport, AuditCategory } from '@weblens/shared';
import { 
  Calculator, 
  X, 
  Zap, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  Layers,
  ArrowRight,
  MinusCircle,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface ScoreBreakdownModalProps {
  report: FullScanReport;
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: AuditCategory | 'overall';
}

export const ScoreBreakdownModal: React.FC<ScoreBreakdownModalProps> = ({
  report,
  isOpen,
  onClose,
  initialCategory = 'overall',
}) => {
  const [selectedTab, setSelectedTab] = useState<AuditCategory | 'overall'>(initialCategory);

  if (!isOpen) return null;

  const { overall, categories } = report;

  const categoryConfigs: Array<{ id: AuditCategory; label: string; weight: number; weightPct: string; icon: any; color: string }> = [
    { id: 'performance', label: 'Performance', weight: 0.25, weightPct: '25%', icon: Zap, color: 'text-amber-400' },
    { id: 'seo', label: 'SEO', weight: 0.20, weightPct: '20%', icon: Globe, color: 'text-blue-400' },
    { id: 'accessibility', label: 'Accessibility', weight: 0.20, weightPct: '20%', icon: Sparkles, color: 'text-emerald-400' },
    { id: 'security', label: 'Security', weight: 0.15, weightPct: '15%', icon: ShieldCheck, color: 'text-cyan-400' },
    { id: 'mobile', label: 'Mobile Readiness', weight: 0.10, weightPct: '10%', icon: Smartphone, color: 'text-purple-400' },
    { id: 'best_practices', label: 'Best Practices', weight: 0.10, weightPct: '10%', icon: CheckCircle2, color: 'text-indigo-400' },
  ];

  // Calculate overall weighted contributions
  let rawWeightedSum = 0;
  const contributions = categoryConfigs.map((c) => {
    const score = categories[c.id]?.score ?? 0;
    const contribution = score * c.weight;
    rawWeightedSum += contribution;
    return {
      ...c,
      score,
      contribution: contribution.toFixed(2),
    };
  });

  const activeCategoryData = selectedTab !== 'overall' ? categories[selectedTab] : null;
  const activeCategoryConfig = selectedTab !== 'overall' ? categoryConfigs.find(c => c.id === selectedTab) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="card-glow rounded-3xl border border-slate-800 w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Score Breakdown & Arithmetic Verification
              </h3>
              <p className="text-xs text-slate-400">
                100% transparent score derivation from verified measurements and point deductions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800/80 px-6 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto py-2">
          <button
            onClick={() => setSelectedTab('overall')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap',
              selectedTab === 'overall'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overall ({overall.score}/100)</span>
          </button>

          {categoryConfigs.map((c) => {
            const Icon = c.icon;
            const score = categories[c.id]?.score ?? 0;
            const isTabActive = selectedTab === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedTab(c.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap',
                  isTabActive
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', c.color)} />
                <span>{c.label} ({score})</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* OVERALL TAB */}
          {selectedTab === 'overall' && (
            <div className="space-y-6">
              {/* Formula Callout Banner */}
              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2">
                <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Weighted Scoring Model</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  Overall Score = (Perf × 25%) + (SEO × 20%) + (A11y × 20%) + (Sec × 15%) + (Mobile × 10%) + (BestPractices × 10%)
                </p>
              </div>

              {/* Arithmetic Contributions Table */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-center">Score</th>
                      <th className="p-3.5 text-center">Weight</th>
                      <th className="p-3.5 text-right">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {contributions.map((c) => {
                      const Icon = c.icon;
                      return (
                        <tr key={c.id} className="hover:bg-slate-900/30">
                          <td className="p-3.5 font-sans font-bold text-white flex items-center gap-2">
                            <Icon className={cn('w-4 h-4', c.color)} />
                            <span>{c.label}</span>
                          </td>
                          <td className="p-3.5 text-center text-slate-300 font-bold">{c.score}/100</td>
                          <td className="p-3.5 text-center text-slate-400">{c.weightPct}</td>
                          <td className="p-3.5 text-right font-bold text-emerald-400">+{c.contribution} pts</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-900/90 border-t border-slate-700 font-mono text-xs">
                    <tr>
                      <td colSpan={3} className="p-4 font-sans font-black text-white uppercase tracking-wider">
                        Sum of Category Contributions
                      </td>
                      <td className="p-4 text-right font-black text-white text-sm">
                        {rawWeightedSum.toFixed(2)} pts
                      </td>
                    </tr>
                    <tr className="bg-blue-600/10 text-blue-300">
                      <td colSpan={3} className="p-4 font-sans font-black text-white uppercase tracking-wider">
                        Final Overall Score (Rounded)
                      </td>
                      <td className="p-4 text-right font-black text-blue-400 text-lg">
                        {overall.score} / 100
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* INDIVIDUAL CATEGORY TAB */}
          {selectedTab !== 'overall' && activeCategoryData && activeCategoryConfig && (
            <div className="space-y-6">
              {/* Category Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center">
                    <activeCategoryConfig.icon className={cn('w-5 h-5', activeCategoryConfig.color)} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{activeCategoryConfig.label} Score</h4>
                    <p className="text-xs text-slate-400">Starts at a baseline of 100 with point deductions per defect.</p>
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-white">
                  {activeCategoryData.score} <span className="text-xs font-normal text-slate-500">/ 100</span>
                </div>
              </div>

              {/* Deductions Itemized Table */}
              <div className="rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Audit Finding</th>
                      <th className="p-3.5 text-center">Severity</th>
                      <th className="p-3.5 text-right">Score Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr className="bg-slate-900/20 font-mono">
                      <td className="p-3.5 font-bold text-emerald-400 flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        <span>Baseline Clean Score</span>
                      </td>
                      <td className="p-3.5 text-center text-slate-500">—</td>
                      <td className="p-3.5 text-right font-bold text-emerald-400">100 pts</td>
                    </tr>

                    {activeCategoryData.issues.filter(i => !i.passed).map((issue, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30">
                        <td className="p-3.5 font-bold text-white">
                          <div>{issue.title}</div>
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5 line-clamp-1">
                            {issue.description}
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border',
                            issue.severity === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                            issue.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                            issue.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          )}>
                            {issue.severity}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-rose-400 whitespace-nowrap">
                          -{issue.scoreImpact || 0} pts
                        </td>
                      </tr>
                    ))}

                    {activeCategoryData.issues.filter(i => !i.passed).length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-slate-400 font-medium">
                          🎉 Zero defects detected! Perfect 100/100 score maintained.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-900/90 border-t border-slate-700 font-mono text-xs">
                    <tr>
                      <td colSpan={2} className="p-4 font-sans font-black text-white uppercase tracking-wider">
                        Final {activeCategoryConfig.label} Score
                      </td>
                      <td className="p-4 text-right font-black text-white text-sm">
                        {activeCategoryData.score} / 100
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>WebLens Deterministic Scoring Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
