import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScanEvents } from '../hooks/useScanEvents.js';
import { StageChecklist } from '../components/scan/StageChecklist.js';
import { Button } from '../components/ui/Button.js';
import { Activity, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

export const ScanProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const state = useScanEvents(id);

  useEffect(() => {
    if (state.isCompleted && id) {
      const timer = setTimeout(() => {
        navigate(`/report/${id}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.isCompleted, id, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
      <div className="card-glow rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-8 text-center relative overflow-hidden">
        {/* Top Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Scan ID: {id}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {state.isFailed ? 'Scan Encountered An Issue' : 'Analyzing Website Health'}
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {state.message}
          </p>
        </div>

        {/* Progress Bar */}
        {!state.isFailed && (
          <div className="max-w-xl mx-auto w-full space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="capitalize">{state.stage.replace('_', ' ')}</span>
              <span className="font-bold text-blue-400">{state.progress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, state.progress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Failure banner */}
        {state.isFailed && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs max-w-xl mx-auto text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-sm">Scan Failed</div>
              <p className="leading-relaxed">
                {state.errorMessage || 'Unable to complete automated analysis on this target.'}
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/')}
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Try Another URL
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stage Checklist */}
        {!state.isFailed && (
          <div className="pt-2">
            <StageChecklist currentStage={state.stage} progress={state.progress} />
          </div>
        )}
      </div>
    </div>
  );
};
