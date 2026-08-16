import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScanEvents } from '../hooks/useScanEvents.js';
import { StageChecklist } from '../components/scan/StageChecklist.js';
import { Button } from '../components/ui/Button.js';
import { AlertTriangle, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import { WebLensIcon } from '../components/brand/WebLensLogo.js';

export const ScanProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const state = useScanEvents(id);

  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (state.isCompleted && id) {
      const timeout = setTimeout(() => {
        navigate(`/report/${id}`);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [state.isCompleted, id, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
      <div className="card-glow rounded-3xl p-6 sm:p-10 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-8 text-center relative overflow-hidden">
        {/* Top Energy Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FF6B35]/8 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-mono font-bold">
              <WebLensIcon size={14} className="animate-pulse" />
              <span>Scan ID: {id?.substring(0, 8)}...</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151A21] border border-[rgba(243,240,232,0.10)] text-[#8E8A82] text-xs font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{secondsElapsed}s elapsed</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F3F0E8] tracking-tight">
            {state.isCompleted ? (
              <span className="text-[#34D399] flex items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 inline" /> Audit Complete!
              </span>
            ) : state.isFailed ? (
              'Scan Could Not Complete'
            ) : (
              'Analyzing Target Website...'
            )}
          </h1>
          <p className="text-sm text-[#D8D4CA] max-w-lg mx-auto leading-relaxed">
            {state.message}
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        {!state.isFailed && (
          <div className="max-w-xl mx-auto w-full space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#8E8A82]">
              <span className="capitalize text-[#FF6B35] font-bold">{state.stage.replace('_', ' ')}</span>
              <span className="font-bold text-[#F3F0E8] text-sm">{state.progress}%</span>
            </div>
            <div className="w-full bg-[#080A0E] h-3 rounded-full overflow-hidden p-0.5 border border-[rgba(243,240,232,0.08)] shadow-inner">
              <div
                className="bg-gradient-to-r from-[#FF804F] via-[#FF6B35] to-[#D94F20] h-full rounded-full transition-all duration-500 shadow-lg shadow-[#FF6B35]/30"
                style={{ width: `${Math.max(5, state.progress)}%` }}
              />
            </div>
          </div>
        )}

        {/* Failure state */}
        {state.isFailed && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs max-w-xl mx-auto text-left flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div className="font-bold text-sm text-[#F3F0E8]">Target Check Blocked / Unavailable</div>
              <p className="text-[#D8D4CA] leading-relaxed">
                {state.errorMessage || 'Target domain could not be analyzed. Verify that the URL is public, online, and not restricted by firewall or internal network protections.'}
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/')}
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                >
                  Return to Home
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
