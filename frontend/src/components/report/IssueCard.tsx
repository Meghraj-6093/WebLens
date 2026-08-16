import React, { useState } from 'react';
import { AuditResult } from '@weblens/shared';
import { Badge } from '../ui/Badge.js';
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Code,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface IssueCardProps {
  issue: AuditResult;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [isExpanded, setIsExpanded] = useState(!issue.passed && (issue.severity === 'critical' || issue.severity === 'high'));
  const [copied, setCopied] = useState(false);

  const handleCopyRecommendation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${issue.title}\n\nProblem:\n${issue.description}\n\nImpact:\n${issue.impact}\n\nFix:\n${issue.recommendation}${issue.technicalDetails ? `\n\nCode:\n${issue.technicalDetails}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200 overflow-hidden',
        issue.passed
          ? 'bg-slate-900/30 border-slate-800/60 hover:border-slate-700/80'
          : issue.severity === 'critical'
          ? 'bg-slate-900/90 border-rose-500/30 hover:border-rose-500/50 shadow-sm shadow-rose-950/20'
          : issue.severity === 'high'
          ? 'bg-slate-900/80 border-orange-500/30 hover:border-orange-500/50'
          : 'card-glow border-slate-800/80 hover:border-slate-700'
      )}
    >
      {/* Header Row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-start gap-3">
          <Badge severity={issue.severity} size="sm" />
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>{issue.title}</span>
              {issue.scoreImpact > 0 && (
                <span className="text-[11px] font-mono font-medium text-rose-400">
                  -{issue.scoreImpact} pts
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {issue.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pt-0.5">
          <button
            onClick={handleCopyRecommendation}
            title="Copy fix recommendation"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <div className="p-1 text-slate-500">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3.5 bg-[#090E1A]/60 text-xs">
          {/* Why it matters / Impact */}
          <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/60 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Why This Matters</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {issue.impact}
            </p>
          </div>

          {/* Actionable Fix Recommendation */}
          <div className="rounded-lg bg-blue-950/20 p-3 border border-blue-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Actionable Fix</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {issue.recommendation}
            </p>
          </div>

          {/* Technical Details / Code Snippet */}
          {issue.technicalDetails && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 font-mono">
                <Code className="w-3.5 h-3.5 text-slate-500" />
                <span>Technical Implementation:</span>
              </div>
              <pre className="p-3 rounded-lg bg-[#050811] border border-slate-800 text-[11px] font-mono text-blue-300 overflow-x-auto selection:bg-blue-600">
                <code>{issue.technicalDetails}</code>
              </pre>
            </div>
          )}

          {/* Metadata Footer: Location & Rule ID */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/50 text-[11px] text-slate-500 font-mono">
            {issue.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Location: {issue.location}</span>
              </span>
            )}
            <span>Rule: {issue.ruleId}</span>
          </div>
        </div>
      )}
    </div>
  );
};
