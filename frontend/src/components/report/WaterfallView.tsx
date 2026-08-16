import React from 'react';
import { ResourceRecord } from '@weblens/shared';
import { formatMs, formatBytes } from '../../lib/utils.js';

export interface WaterfallViewProps {
  resources: ResourceRecord[];
}

export const WaterfallView: React.FC<WaterfallViewProps> = ({ resources }) => {
  const maxTime = Math.max(...resources.map(r => r.loadTimeMs || 100), 500);

  const getBarColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-500';
      case 'script':
        return 'bg-amber-500';
      case 'stylesheet':
        return 'bg-cyan-500';
      case 'image':
        return 'bg-emerald-500';
      case 'font':
        return 'bg-purple-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="card-glow rounded-xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-tight">Request Waterfall Timing</h3>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span> Doc</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span> JS</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block"></span> CSS</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span> Img</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500 inline-block"></span> Font</span>
        </div>
      </div>

      <div className="space-y-2 font-mono text-xs">
        {resources.slice(0, 15).map((r, idx) => {
          const duration = r.loadTimeMs || 50;
          const widthPercent = Math.min(100, Math.max(5, (duration / maxTime) * 100));

          return (
            <div key={idx} className="flex items-center gap-3 py-1 border-b border-slate-800/40 text-[11px]">
              <div className="w-1/3 truncate text-slate-300" title={r.url}>
                {r.url.split('/').pop() || r.url}
              </div>
              <div className="w-2/3 flex items-center gap-2">
                <div className="flex-1 bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full ${getBarColor(r.resourceType)} opacity-80`}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <span className="w-16 text-right text-slate-400 text-[10px] shrink-0">
                  {formatMs(duration)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
