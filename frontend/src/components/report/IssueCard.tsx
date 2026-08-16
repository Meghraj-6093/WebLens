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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold uppercase bg-emerald-500/10 text-[#34D399] border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Passed
        </span>
      );
    }
    switch (issue.severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> Critical
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold uppercase bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30">
            <AlertTriangle className="w-3 h-3" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold uppercase bg-[#FF804F]/15 text-[#FF804F] border border-[#FF804F]/30">
            <AlertCircle className="w-3 h-3" /> Medium
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold uppercase bg-[rgba(243,240,232,0.08)] text-[#D8D4CA] border border-[rgba(243,240,232,0.14)]">
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
        'card-glow rounded-2xl border transition-all duration-200 overflow-hidden bg-[#11151B]',
        isOpen ? 'border-[#FF6B35]/40 shadow-xl' : 'border-[rgba(243,240,232,0.08)] hover:border-[#FF6B35]/40'
      )}>
        {/* Card Header Row */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 flex items-center gap-1.5">
              {getSeverityBadge()}
              {!issue.passed && issue.scoreImpact !== undefined && issue.scoreImpact > 0 && (
                <span className="hidden xs:inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-display font-semibold bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30">
                  -{issue.scoreImpact} pts
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-display font-semibold text-[#F3F0E8] tracking-tight truncate">
                {issue.title}
              </h4>
              <p className="text-[11px] font-sans text-[#8E8A82] truncate mt-0.5">
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
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#151A21] border border-[#FF6B35]/40 text-[#FF6B35] hover:bg-[#FF6B35] hover:text-[#080A0E] text-xs font-bold transition-all shadow-sm group"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B35] group-hover:text-[#080A0E] group-hover:rotate-12 transition-transform" />
                <span>AI Explain & Fix</span>
              </button>
            )}

            <div className="p-1 rounded-lg text-[#8E8A82] hover:text-[#F3F0E8] transition-colors">
              {isOpen ? <ChevronUp className="w-4 h-4 text-[#FF6B35]" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Expanded Drawer Details */}
        {isOpen && (
          <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 border-t border-[rgba(243,240,232,0.08)] space-y-4 text-xs">
            {/* Mobile AI Button */}
            {!issue.passed && (
              <div className="sm:hidden pt-3">
                <button
                  type="button"
                  onClick={() => setIsAiOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF6B35] text-[#080A0E] font-bold text-xs shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open AI Diagnostic Assistant</span>
                </button>
              </div>
            )}

            {/* Why It Matters */}
            <div className="space-y-1 bg-[#0C0F14] p-3.5 rounded-xl border border-[rgba(243,240,232,0.08)]">
              <span className="font-display font-semibold text-[#D8D4CA] text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#FF6B35]" />
                Why this matters:
              </span>
              <p className="font-sans text-[#8E8A82] text-xs leading-relaxed pl-5">
                {issue.impact}
              </p>
            </div>

            {/* Actionable Fix */}
            <div className="space-y-1 bg-[#151A21] p-3.5 rounded-xl border border-[#FF6B35]/25">
              <span className="font-display font-semibold text-[#FF6B35] text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
                How to resolve:
              </span>
              <p className="font-sans text-[#F3F0E8] text-xs leading-relaxed pl-5">
                {issue.recommendation}
              </p>
            </div>

            {/* Technical Diagnostics */}
            {issue.technicalDetails && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[#8E8A82]">
                  <span className="font-semibold flex items-center gap-1.5 text-xs text-[#D8D4CA]">
                    <Code2 className="w-3.5 h-3.5 text-[#8E8A82]" />
                    <span>Technical Output</span>
                  </span>
                  <button
                    onClick={handleCopyDetails}
                    className="flex items-center gap-1 text-[11px] text-[#8E8A82] hover:text-[#F3F0E8] transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-[#05070A] p-3 rounded-xl border border-[rgba(243,240,232,0.08)] font-mono text-[11px] text-[#D8D4CA] overflow-x-auto selection:bg-[#FF6B35] selection:text-[#080A0E]">
                  {issue.technicalDetails}
                </div>
              </div>
            )}

            {/* Footer Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono text-[#6E6A63]">
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
