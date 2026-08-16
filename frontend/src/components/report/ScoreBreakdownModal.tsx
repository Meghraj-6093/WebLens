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
    { id: 'performance', label: 'Performance', weight: 0.25, weightPct: '25%', icon: Zap, color: 'text-[#FF6B35]' },
    { id: 'seo', label: 'SEO', weight: 0.20, weightPct: '20%', icon: Globe, color: 'text-[#D8D4CA]' },
    { id: 'accessibility', label: 'Accessibility', weight: 0.20, weightPct: '20%', icon: Sparkles, color: 'text-[#10B981]' },
    { id: 'security', label: 'Security', weight: 0.15, weightPct: '15%', icon: ShieldCheck, color: 'text-[#D8D4CA]' },
    { id: 'mobile', label: 'Mobile Readiness', weight: 0.10, weightPct: '10%', icon: Smartphone, color: 'text-[#FF804F]' },
    { id: 'best_practices', label: 'Best Practices', weight: 0.10, weightPct: '10%', icon: CheckCircle2, color: 'text-[#D8D4CA]' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="card-glow rounded-3xl border border-[rgba(243,240,232,0.14)] bg-[#0C0F14] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[rgba(243,240,232,0.08)] flex items-center justify-between bg-[#11151B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#F3F0E8] tracking-tight">
                Score Breakdown & Arithmetic Verification
              </h3>
              <p className="text-xs text-[#8E8A82]">
                100% transparent score derivation from verified measurements and point deductions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8E8A82] hover:text-[#F3F0E8] rounded-xl hover:bg-[#151A21] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[rgba(243,240,232,0.08)] px-6 bg-[#080A0E] flex items-center gap-1.5 overflow-x-auto py-2">
          <button
            onClick={() => setSelectedTab('overall')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap',
              selectedTab === 'overall'
                ? 'bg-[#FF6B35] text-[#080A0E] shadow-sm'
                : 'text-[#8E8A82] hover:text-[#F3F0E8] hover:bg-[#151A21]'
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
                    ? 'bg-[#151A21] text-[#FF6B35] border border-[#FF6B35]/30'
                    : 'text-[#8E8A82] hover:text-[#F3F0E8] hover:bg-[#151A21]'
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
              <div className="p-4 rounded-2xl bg-[#151A21] border border-[#FF6B35]/25 space-y-2">
                <div className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Weighted Scoring Model</span>
                </div>
                <p className="text-xs text-[#D8D4CA] leading-relaxed font-mono">
                  Overall Score = (Perf × 25%) + (SEO × 20%) + (A11y × 20%) + (Sec × 15%) + (Mobile × 10%) + (BestPractices × 10%)
                </p>
              </div>

              {/* Arithmetic Contributions Table */}
              <div className="rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151A21] border-b border-[rgba(243,240,232,0.08)] text-[#8E8A82] font-mono uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-center">Score</th>
                      <th className="p-3.5 text-center">Weight</th>
                      <th className="p-3.5 text-right">Contribution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(243,240,232,0.06)] font-mono">
                    {contributions.map((c) => {
                      const Icon = c.icon;
                      return (
                        <tr key={c.id} className="hover:bg-[#151A21]/50">
                          <td className="p-3.5 font-sans font-bold text-[#F3F0E8] flex items-center gap-2">
                            <Icon className={cn('w-4 h-4', c.color)} />
                            <span>{c.label}</span>
                          </td>
                          <td className="p-3.5 text-center text-[#D8D4CA] font-bold">{c.score}/100</td>
                          <td className="p-3.5 text-center text-[#8E8A82]">{c.weightPct}</td>
                          <td className="p-3.5 text-right font-bold text-[#FF6B35]">+{c.contribution} pts</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#151A21] border-t border-[rgba(243,240,232,0.12)] font-mono text-xs">
                    <tr>
                      <td colSpan={3} className="p-4 font-sans font-black text-[#F3F0E8] uppercase tracking-wider">
                        Sum of Category Contributions
                      </td>
                      <td className="p-4 text-right font-black text-[#F3F0E8] text-sm">
                        {rawWeightedSum.toFixed(2)} pts
                      </td>
                    </tr>
                    <tr className="bg-[#FF6B35]/15 text-[#FF6B35]">
                      <td colSpan={3} className="p-4 font-sans font-black text-[#FF6B35] uppercase tracking-wider">
                        Final Overall Score (Rounded)
                      </td>
                      <td className="p-4 text-right font-black text-[#FF6B35] text-lg">
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
              <div className="p-4 rounded-2xl bg-[#11151B] border border-[rgba(243,240,232,0.08)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#151A21] flex items-center justify-center">
                    <activeCategoryConfig.icon className={cn('w-5 h-5', activeCategoryConfig.color)} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#F3F0E8]">{activeCategoryConfig.label} Score</h4>
                    <p className="text-xs text-[#8E8A82]">Starts at a baseline of 100 with point deductions per defect.</p>
                  </div>
                </div>
                <div className="text-2xl font-black font-mono text-[#F3F0E8]">
                  {activeCategoryData.score} <span className="text-xs font-normal text-[#8E8A82]">/ 100</span>
                </div>
              </div>

              {/* Deductions Itemized Table */}
              <div className="rounded-2xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151A21] border-b border-[rgba(243,240,232,0.08)] text-[#8E8A82] font-mono uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Audit Finding</th>
                      <th className="p-3.5 text-center">Severity</th>
                      <th className="p-3.5 text-right">Score Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                    <tr className="bg-[#080A0E] font-mono">
                      <td className="p-3.5 font-bold text-[#10B981] flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        <span>Baseline Clean Score</span>
                      </td>
                      <td className="p-3.5 text-center text-[#8E8A82]">—</td>
                      <td className="p-3.5 text-right font-bold text-[#10B981]">100 pts</td>
                    </tr>

                    {activeCategoryData.issues.filter(i => !i.passed).map((issue, idx) => (
                      <tr key={idx} className="hover:bg-[#151A21]/50">
                        <td className="p-3.5 font-bold text-[#F3F0E8]">
                          <div>{issue.title}</div>
                          <div className="text-[11px] text-[#8E8A82] font-normal mt-0.5 line-clamp-1">
                            {issue.description}
                          </div>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border',
                            issue.severity === 'critical' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' :
                            issue.severity === 'high' ? 'bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30' :
                            issue.severity === 'medium' ? 'bg-[#FF804F]/15 text-[#FF804F] border border-[#FF804F]/30' :
                            'bg-[rgba(243,240,232,0.08)] text-[#D8D4CA] border border-[rgba(243,240,232,0.14)]'
                          )}>
                            {issue.severity}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-[#FF6B35] whitespace-nowrap">
                          -{issue.scoreImpact || 0} pts
                        </td>
                      </tr>
                    ))}

                    {activeCategoryData.issues.filter(i => !i.passed).length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-[#8E8A82] font-medium">
                          🎉 Zero defects detected! Perfect 100/100 score maintained.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-[#151A21] border-t border-[rgba(243,240,232,0.12)] font-mono text-xs">
                    <tr>
                      <td colSpan={2} className="p-4 font-sans font-black text-[#F3F0E8] uppercase tracking-wider">
                        Final {activeCategoryConfig.label} Score
                      </td>
                      <td className="p-4 text-right font-black text-[#F3F0E8] text-sm">
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
        <div className="p-4 border-t border-[rgba(243,240,232,0.08)] bg-[#11151B] flex items-center justify-between text-xs text-[#8E8A82]">
          <span>WebLens Deterministic Scoring Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#151A21] hover:bg-[#1A2028] text-[#F3F0E8] border border-[rgba(243,240,232,0.12)] font-semibold transition"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
