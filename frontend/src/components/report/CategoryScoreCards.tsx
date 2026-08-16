import React from 'react';
import { AuditCategory, FullScanReport } from '@weblens/shared';
import { 
  Zap, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  ChevronRight,
  Calculator
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface CategoryScoreCardsProps {
  report: FullScanReport;
  selectedCategory?: AuditCategory | 'all';
  onSelectCategory: (cat: AuditCategory | 'all') => void;
  onOpenBreakdown?: (cat: AuditCategory) => void;
}

interface CategoryCardMeta {
  key: AuditCategory;
  title: string;
  weight: string;
  icon: React.ReactNode;
}

const CATEGORY_META: CategoryCardMeta[] = [
  { key: 'performance', title: 'Performance', weight: '25%', icon: <Zap className="w-4 h-4 text-amber-400" /> },
  { key: 'seo', title: 'SEO', weight: '20%', icon: <Globe className="w-4 h-4 text-blue-400" /> },
  { key: 'accessibility', title: 'Accessibility', weight: '20%', icon: <Sparkles className="w-4 h-4 text-emerald-400" /> },
  { key: 'security', title: 'Security', weight: '15%', icon: <ShieldCheck className="w-4 h-4 text-cyan-400" /> },
  { key: 'mobile', title: 'Mobile', weight: '10%', icon: <Smartphone className="w-4 h-4 text-purple-400" /> },
  { key: 'best_practices', title: 'Best Practices', weight: '10%', icon: <CheckCircle2 className="w-4 h-4 text-indigo-400" /> },
];

export const CategoryScoreCards: React.FC<CategoryScoreCardsProps> = ({
  report,
  selectedCategory = 'all',
  onSelectCategory,
  onOpenBreakdown,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 75) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {CATEGORY_META.map((meta) => {
        const catData = report.categories[meta.key];
        const score = catData?.score ?? 0;
        const isSelected = selectedCategory === meta.key;
        const issues = catData?.issues || [];
        const failedCount = issues.filter(i => !i.passed).length;

        return (
          <div
            key={meta.key}
            onClick={() => onSelectCategory(isSelected ? 'all' : meta.key)}
            className={cn(
              'p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative',
              isSelected
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]'
                : 'card-glow border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-slate-800/60 group-hover:scale-110 transition-transform">
                    {meta.icon}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">{meta.title}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">{meta.weight}</span>
              </div>

              <div className="flex items-baseline justify-between mt-3">
                <span className={cn('text-2xl font-extrabold font-mono tracking-tight', getScoreColor(score).split(' ')[0])}>
                  {score}
                </span>
                <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', getScoreColor(score))}>
                  {catData?.rating || 'Score'}
                </span>
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>{failedCount === 0 ? 'All passed' : `${failedCount} issue${failedCount > 1 ? 's' : ''}`}</span>
              {onOpenBreakdown ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBreakdown(meta.key);
                  }}
                  className="p-1 text-slate-500 hover:text-blue-400 rounded transition"
                  title={`View ${meta.title} score deductions`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                </button>
              ) : (
                <ChevronRight className={cn('w-3.5 h-3.5 transition-transform text-slate-500', isSelected && 'rotate-90 text-blue-400')} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
