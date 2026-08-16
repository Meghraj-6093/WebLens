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
        return <Clock className="w-4 h-4 text-[#FF6B35]" />;
      case 'fcp':
        return <Zap className="w-4 h-4 text-[#FF804F]" />;
      case 'cls':
        return <Activity className="w-4 h-4 text-[#D8D4CA]" />;
      case 'tbt':
        return <Gauge className="w-4 h-4 text-rose-400" />;
      case 'inp':
        return <MousePointerClick className="w-4 h-4 text-[#D8D4CA]" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-[#10B981]" />;
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
        return 'bg-emerald-500/10 text-[#34D399] border-emerald-500/20';
      case 'needs_improvement':
        return 'bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30';
      case 'poor':
        return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#F3F0E8] tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FF6B35]" />
            <span>Core Web Vitals & Real-User Performance Metrics</span>
          </h3>
          <p className="text-xs text-[#8E8A82] mt-0.5">
            Key field & lab measurements defining user perception, visual stability, and interaction speed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div
            key={m.id}
            className="card-glow rounded-xl p-4 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-3 relative overflow-hidden group hover:border-[#FF6B35]/40 transition-all"
          >
            {/* Metric Top Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#151A21] group-hover:scale-105 transition-transform">
                  {getMetricIcon(m.id)}
                </div>
                <span className="text-xs font-semibold text-[#F3F0E8]">{m.name.split('(')[0]}</span>
              </div>
              <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', getStatusBadge(m.status))}>
                {m.status.replace('_', ' ')}
              </span>
            </div>

            {/* Metric Value */}
            <div className="flex items-baseline justify-between pt-1">
              <span className={cn(
                'text-3xl font-extrabold font-mono tracking-tight',
                m.status === 'good' ? 'text-[#34D399]' : m.status === 'needs_improvement' ? 'text-[#FF6B35]' : 'text-rose-400'
              )}>
                {m.value}
              </span>
              <span className="text-[10px] font-mono text-[#8E8A82]">
                {getThresholdText(m.id)}
              </span>
            </div>

            {/* Metric Description */}
            <div className="pt-2 border-t border-[rgba(243,240,232,0.08)] text-[11px] text-[#8E8A82] leading-relaxed">
              {m.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
