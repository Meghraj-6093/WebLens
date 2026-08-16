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
  { key: 'performance', title: 'Performance', weight: '25%', icon: <Zap className="w-4 h-4 text-[#FF6B35]" /> },
  { key: 'seo', title: 'SEO', weight: '20%', icon: <Globe className="w-4 h-4 text-[#D8D4CA]" /> },
  { key: 'accessibility', title: 'Accessibility', weight: '20%', icon: <Sparkles className="w-4 h-4 text-[#10B981]" /> },
  { key: 'security', title: 'Security', weight: '15%', icon: <ShieldCheck className="w-4 h-4 text-[#D8D4CA]" /> },
  { key: 'mobile', title: 'Mobile', weight: '10%', icon: <Smartphone className="w-4 h-4 text-[#FF804F]" /> },
  { key: 'best_practices', title: 'Best Practices', weight: '10%', icon: <CheckCircle2 className="w-4 h-4 text-[#D8D4CA]" /> },
];

export const CategoryScoreCards: React.FC<CategoryScoreCardsProps> = ({
  report,
  selectedCategory = 'all',
  onSelectCategory,
  onOpenBreakdown,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[#FF6B35] bg-[#FF6B35]/15 border-[#FF6B35]/30';
    if (score >= 70) return 'text-[#FF804F] bg-[#FF804F]/15 border-[#FF804F]/30';
    if (score >= 50) return 'text-[#D94F20] bg-[#D94F20]/15 border-[#D94F20]/30';
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
                ? 'bg-[#151A21] border-[#FF6B35] shadow-lg shadow-[#FF6B35]/10 scale-[1.02]'
                : 'card-glow border-[rgba(243,240,232,0.08)] hover:border-[#FF6B35]/40 hover:bg-[#151A21]'
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-[#151A21] group-hover:scale-110 transition-transform shrink-0">
                    {meta.icon}
                  </div>
                  <span className="text-xs font-display font-semibold text-[#F3F0E8] truncate">{meta.title}</span>
                </div>
                <span className="text-[10px] font-display font-medium text-[#8E8A82] shrink-0">{meta.weight}</span>
              </div>

              <div className="flex items-baseline justify-between mt-3">
                <span className="text-2xl font-bold font-display tracking-tight text-[#F3F0E8]">
                  {score}
                </span>
                <span className={cn('text-[10px] font-display font-bold uppercase px-2 py-0.5 rounded-full border', getScoreColor(score))}>
                  {catData?.rating || 'Score'}
                </span>
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-[rgba(243,240,232,0.08)] flex items-center justify-between text-[11px] font-sans text-[#8E8A82]">
              <span>{failedCount === 0 ? 'All passed' : `${failedCount} issue${failedCount > 1 ? 's' : ''}`}</span>
              {onOpenBreakdown ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBreakdown(meta.key);
                  }}
                  className="p-1 text-[#8E8A82] hover:text-[#FF6B35] rounded transition"
                  title={`View ${meta.title} score deductions`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                </button>
              ) : (
                <ChevronRight className={cn('w-3.5 h-3.5 transition-transform text-[#8E8A82]', isSelected && 'rotate-90 text-[#FF6B35]')} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
