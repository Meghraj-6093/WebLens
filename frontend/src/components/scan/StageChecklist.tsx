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
  { id: 'connecting', title: 'Connecting to Target', description: 'SSRF verification and DNS lookup', icon: <Globe className="w-4 h-4" /> },
  { id: 'fetching', title: 'Fetching Response', description: 'Probing headers, TLS cert, and HTML stream', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'performance', title: 'Analyzing Performance', description: 'Core Web Vitals, LCP, FCP, CLS, and resources', icon: <Zap className="w-4 h-4" /> },
  { id: 'seo', title: 'Auditing SEO Structure', description: 'Headings, meta description, open graph, robots', icon: <Globe className="w-4 h-4" /> },
  { id: 'accessibility', title: 'Accessibility Compliance', description: 'WCAG rules, ARIA roles, labels, and landmarks', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'security', title: 'Security Posture Checks', description: 'HTTPS, CSP, HSTS, and frame protection', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'mobile', title: 'Mobile Readiness', description: 'Viewport meta, overflow, and touch target sizes', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'best_practices', title: 'Best Practices', description: 'Console exceptions, modern HTML5, and safety', icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'scoring', title: 'Generating Health Report', description: 'Calculating scores and prioritizing actionable fixes', icon: <Sparkles className="w-4 h-4" /> },
];

export const StageChecklist: React.FC<StageChecklistProps> = ({ currentStage, progress }) => {
  const getStageStatus = (stageId: ScanStage) => {
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
    <div className="space-y-3 max-w-xl mx-auto w-full">
      {STAGES.map((s) => {
        const status = getStageStatus(s.id);
        return (
          <div
            key={s.id}
            className={cn(
              'flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300',
              status === 'completed' && 'bg-slate-900/60 border-slate-800/80 text-slate-300',
              status === 'active' && 'bg-blue-950/40 border-blue-500/40 text-white shadow-lg shadow-blue-900/20 scale-[1.01]',
              status === 'pending' && 'bg-slate-900/20 border-slate-800/30 text-slate-500 opacity-60'
            )}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                  status === 'completed' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                  status === 'active' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse',
                  status === 'pending' && 'bg-slate-800/40 text-slate-600'
                )}
              >
                {s.icon}
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight">{s.title}</div>
                <div className="text-xs text-slate-400">{s.description}</div>
              </div>
            </div>

            <div className="shrink-0 pl-2">
              {status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {status === 'active' && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
              {status === 'pending' && <Circle className="w-4 h-4 text-slate-700" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
