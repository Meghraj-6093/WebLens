import React from 'react';
import { ScanStage } from '@weblens/shared';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  Globe, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Sparkles, 
  CheckSquare 
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface StageChecklistProps {
  currentStage: ScanStage;
  progress: number;
}

interface StageDefinition {
  id: ScanStage;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STAGES: StageDefinition[] = [
  { id: 'connecting', title: 'Connecting & SSRF Guard', description: 'DNS resolution & security address isolation', icon: <Globe className="w-4 h-4" /> },
  { id: 'fetching', title: 'Response & TLS Probing', description: 'Probing HTTP headers, TLS cert, robots.txt, sitemap', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'performance', title: 'Measuring Core Web Vitals', description: 'LCP, FCP, CLS, TBT, INP, and asset compression', icon: <Zap className="w-4 h-4" /> },
  { id: 'seo', title: 'Auditing SEO Structure', description: 'Headings, title length, meta description, Open Graph', icon: <Globe className="w-4 h-4" /> },
  { id: 'accessibility', title: 'WCAG Accessibility Audit', description: 'axe-core tests, ARIA landmarks, form labels, image alt text', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'security', title: 'Security Posture Checks', description: 'HSTS, CSP, X-Frame-Options, and mixed content', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'mobile', title: 'Mobile Readiness Testing', description: 'Viewport scaling, touch target sizes, and layout overflow', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'best_practices', title: 'Best Practices & Standards', description: 'Console logs, modern HTML5 doctype, and HTTPS consistency', icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'scoring', title: 'Compiling Health Dashboard', description: 'Calculating weighted scores and actionable fixes', icon: <Sparkles className="w-4 h-4" /> },
];

export const StageChecklist: React.FC<StageChecklistProps> = ({ currentStage }) => {
  const stageOrder: ScanStage[] = [
    'connecting',
    'fetching',
    'performance',
    'seo',
    'accessibility',
    'security',
    'mobile',
    'best_practices',
    'scoring',
    'completed',
  ];

  const getStageStatus = (stageId: ScanStage) => {
    const currentIndex = stageOrder.indexOf(currentStage);
    const targetIndex = stageOrder.indexOf(stageId);

    if (currentStage === 'completed' || currentIndex > targetIndex) {
      return 'completed';
    }
    if (currentIndex === targetIndex) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="space-y-2.5 max-w-xl mx-auto w-full text-left">
      {STAGES.map((s) => {
        const status = getStageStatus(s.id);
        return (
          <div
            key={s.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-xl border transition-all duration-300',
              status === 'completed' && 'bg-[#11151B] border-[rgba(243,240,232,0.08)] text-[#D8D4CA]',
              status === 'active' && 'bg-[#151A21] border-[#FF6B35]/60 text-[#F3F0E8] shadow-lg shadow-[#FF6B35]/10 scale-[1.01]',
              status === 'pending' && 'bg-[#080A0E]/50 border-[rgba(243,240,232,0.04)] text-[#6E6A63] opacity-60'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0',
                  status === 'completed' && 'bg-emerald-500/10 text-[#34D399] border border-emerald-500/20',
                  status === 'active' && 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/40 animate-pulse',
                  status === 'pending' && 'bg-[#11151B] text-[#6E6A63]'
                )}
              >
                {s.icon}
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold tracking-tight truncate text-[#F3F0E8]">{s.title}</div>
                <div className="text-[11px] text-[#8E8A82] truncate">{s.description}</div>
              </div>
            </div>

            <div className="shrink-0 pl-2">
              {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-[#34D399]" />}
              {status === 'active' && <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin" />}
              {status === 'pending' && <Circle className="w-3.5 h-3.5 text-[#6E6A63]" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
