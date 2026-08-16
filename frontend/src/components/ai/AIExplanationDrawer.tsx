import React, { useState, useEffect } from 'react';
import { AuditResult, AIExplanation, FrameworkCodeSnippet } from '@weblens/shared';
import { getAiExplanation } from '../../lib/api.js';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Clock, 
  Zap, 
  ShieldAlert, 
  AlertCircle, 
  Code2, 
  FileCode, 
  Loader2 
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface AIExplanationDrawerProps {
  issue: AuditResult | null;
  onClose: () => void;
}

export const AIExplanationDrawer: React.FC<AIExplanationDrawerProps> = ({ issue, onClose }) => {
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<string>('html');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!issue) {
      setExplanation(null);
      return;
    }

    const fetchExplanation = async () => {
      setIsLoading(true);
      try {
        const data = await getAiExplanation(issue);
        setExplanation(data);
        if (data.codeSnippets.length > 0) {
          setSelectedFramework(data.codeSnippets[0].framework);
        }
      } catch (err) {
        console.error('Failed to generate AI diagnosis:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [issue]);

  if (!issue) return null;

  const currentSnippet = explanation?.codeSnippets.find((s) => s.framework === selectedFramework) || explanation?.codeSnippets[0];

  const handleCopyCode = () => {
    if (currentSnippet?.code) {
      navigator.clipboard.writeText(currentSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0B101E] border-l border-slate-800 h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-blue-400">AI Diagnostic Assistant</span>
                <h3 className="text-base font-bold text-white tracking-tight">{issue.title}</h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400 text-xs">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span>Synthesizing diagnostic advice and code fixes...</span>
            </div>
          ) : explanation ? (
            <div className="space-y-5 text-xs">
              {/* Priority & Effort Banner */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card-glow rounded-xl p-3 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Suggested Priority</span>
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      explanation.priority === 'Critical' ? 'bg-rose-500' :
                      explanation.priority === 'High' ? 'bg-orange-500' : 'bg-amber-500'
                    )} />
                    {explanation.priority} Priority
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{explanation.priorityRationale}</p>
                </div>

                <div className="card-glow rounded-xl p-3 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Estimated Fix Time</span>
                  </div>
                  <div className="text-sm font-bold text-white">{explanation.estimatedEffort}</div>
                  <p className="text-[11px] text-slate-400 leading-tight">Fast drop-in configuration</p>
                </div>
              </div>

              {/* What Happened */}
              <div className="card-glow rounded-2xl p-4 border border-slate-800 space-y-1.5">
                <div className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>What Happened (Plain English)</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{explanation.whatHappened}</p>
              </div>

              {/* Why It Matters */}
              <div className="card-glow rounded-2xl p-4 border border-slate-800 space-y-1.5 bg-amber-950/10">
                <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Business & User Impact</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{explanation.whyItMatters}</p>
              </div>

              {/* How to Fix */}
              <div className="card-glow rounded-2xl p-4 border border-slate-800 space-y-1.5 bg-blue-950/20">
                <div className="font-bold text-blue-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Actionable Recommendation</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{explanation.howToFix}</p>
              </div>

              {/* Multi-Framework Code Generator */}
              {explanation.codeSnippets.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-300 text-xs">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ready-to-use Code Fix</span>
                    </div>
                    {currentSnippet?.filename && (
                      <span className="text-[10px] font-mono text-slate-500">{currentSnippet.filename}</span>
                    )}
                  </div>

                  {/* Framework Selector Tabs */}
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    {explanation.codeSnippets.map((s) => (
                      <button
                        key={s.framework}
                        onClick={() => setSelectedFramework(s.framework)}
                        className={cn(
                          'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                          selectedFramework === s.framework
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Code Box */}
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#050811] relative group">
                    <div className="bg-slate-900/80 px-3.5 py-1.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{currentSnippet?.label}</span>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <pre className="p-4 text-[11px] font-mono text-blue-300 overflow-x-auto selection:bg-blue-600">
                      <code>{currentSnippet?.code}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span>Rule: {issue.ruleId}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Close Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
