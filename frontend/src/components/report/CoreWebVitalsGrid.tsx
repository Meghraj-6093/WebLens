import React from 'react';
import { MetricItem } from '@weblens/shared';
import { Zap, Clock, Activity, MousePointerClick, ShieldCheck, Gauge } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface CoreWebVitalsGridProps {
  metrics: MetricItem[];
}

export const CoreWebVitalsGrid: React.FC<CoreWebVitalsGridProps> = ({ metrics }) => {
  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'lcp':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'fcp':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'cls':
        return <Activity className="w-4 h-4 text-purple-400" />;
      case 'tbt':
        return <Gauge className="w-4 h-4 text-rose-400" />;
      case 'inp':
        return <MousePointerClick className="w-4 h-4 text-cyan-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getThresholdText = (id: string) => {
    switch (id) {
      case 'lcp':
        return 'Good: ≤ 2.5s • Poor: > 4.0s';
      case 'fcp':
        return 'Good: ≤ 1.8s • Poor: > 3.0s';
      case 'cls':
        return 'Good: ≤ 0.1 • Poor: > 0.25';
      case 'tbt':
        return 'Good: ≤ 200ms • Poor: > 600ms';
      case 'inp':
        return 'Good: ≤ 200ms • Poor: > 500ms';
      case 'ttfb':
        return 'Good: ≤ 600ms • Poor: > 1200ms';
      default:
        return 'Standard web threshold';
    }
  };

  const getStatusBadge = (status: 'good' | 'needs_improvement' | 'poor') => {
    switch (status) {
      case 'good':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'needs_improvement':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'poor':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Core Web Vitals & Real-User Performance Metrics</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key field & lab measurements defining user perception, visual stability, and interaction speed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="card-glow rounded-xl p-4 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all"
          >
            {/* Metric Top Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-800/80 group-hover:scale-105 transition-transform">
                  {getMetricIcon(m.id)}
                </div>
                <span className="text-xs font-semibold text-slate-200">{m.name.split('(')[0]}</span>
              </div>
              <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', getStatusBadge(m.status))}>
                {m.status.replace('_', ' ')}
              </span>
            </div>

            {/* Metric Value */}
            <div className="flex items-baseline justify-between pt-1">
              <span className={cn(
                'text-3xl font-extrabold font-mono tracking-tight',
                m.status === 'good' ? 'text-emerald-400' : m.status === 'needs_improvement' ? 'text-amber-400' : 'text-rose-400'
              )}>
                {m.value}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {getThresholdText(m.id)}
              </span>
            </div>

            {/* Metric Description */}
            <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
              {m.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
