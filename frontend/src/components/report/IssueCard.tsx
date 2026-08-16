import React, { useState } from 'react';
import { AuditResult } from '@weblens/shared';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Copy, 
  Sparkles, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  ShieldAlert,
  Code2
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { AIExplanationDrawer } from '../ai/AIExplanationDrawer.js';

export interface IssueCardProps {
  issue: AuditResult;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const getSeverityBadge = () => {
    if (issue.passed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Passed
        </span>
      );
    }
    switch (issue.severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
            <ShieldAlert className="w-3 h-3" /> Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <AlertTriangle className="w-3 h-3" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" /> Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Info className="w-3 h-3" /> Low
          </span>
        );
      default:
        return null;
    }
  };

  const handleCopyDetails = () => {
    if (issue.technicalDetails) {
      navigator.clipboard.writeText(issue.technicalDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className={cn(
        'card-glow rounded-2xl border transition-all duration-200 overflow-hidden',
        isOpen ? 'border-slate-700 shadow-xl' : 'border-slate-800/80 hover:border-slate-700/80'
      )}>
        {/* Card Header Row */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0">{getSeverityBadge()}</div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                {issue.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {issue.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!issue.passed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAiOpen(true);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-300 hover:text-white hover:border-blue-500/60 text-xs font-semibold transition-all shadow-sm group"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
                <span>AI Explain & Fix</span>
              </button>
            )}

            <div className="p-1 rounded-lg text-slate-500 hover:text-slate-200 transition-colors">
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Expanded Drawer Details */}
        {isOpen && (
          <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 border-t border-slate-800/60 space-y-4 text-xs">
            {/* Mobile AI Button */}
            {!issue.passed && (
              <div className="sm:hidden pt-3">
                <button
                  type="button"
                  onClick={() => setIsAiOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open AI Diagnostic Assistant</span>
                </button>
              </div>
            )}

            {/* Why It Matters */}
            <div className="space-y-1 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                Why this matters:
              </span>
              <p className="text-slate-300 leading-relaxed pl-5">
                {issue.impact}
              </p>
            </div>

            {/* Actionable Fix */}
            <div className="space-y-1 bg-blue-950/20 p-3.5 rounded-xl border border-blue-900/30">
              <span className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                How to resolve:
              </span>
              <p className="text-slate-300 leading-relaxed pl-5">
                {issue.recommendation}
              </p>
            </div>

            {/* Technical Diagnostics */}
            {issue.technicalDetails && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold flex items-center gap-1.5 text-xs">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Technical Output</span>
                  </span>
                  <button
                    onClick={handleCopyDetails}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-[#050811] p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto selection:bg-blue-600">
                  {issue.technicalDetails}
                </div>
              </div>
            )}

            {/* Footer Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono text-slate-500">
              <span>Rule ID: {issue.ruleId}</span>
              {issue.location && <span>Location: {issue.location}</span>}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Drawer Modal */}
      <AIExplanationDrawer
        issue={isAiOpen ? issue : null}
        onClose={() => setIsAiOpen(false)}
      />
    </>
  );
};
