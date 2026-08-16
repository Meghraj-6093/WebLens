import React, { useState } from 'react';
import { ResourceRecord, ResourceType } from '@weblens/shared';
import { formatMs, formatBytes } from '../../lib/utils.js';
import { Activity, ChevronDown, ChevronUp, Clock, FileCode, Layers } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface WaterfallViewProps {
  resources: ResourceRecord[];
}

export const WaterfallView: React.FC<WaterfallViewProps> = ({ resources }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!resources || resources.length === 0) return null;

  const filtered = resources.filter(r => {
    if (filterType === 'all') return true;
    return r.resourceType === filterType;
  });

  const maxTime = Math.max(...filtered.map(r => r.loadTimeMs || 100), 500);
  const displayed = isExpanded ? filtered : filtered.slice(0, 15);

  const getBarColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-500 shadow-sm shadow-blue-500/30';
      case 'script':
        return 'bg-amber-500 shadow-sm shadow-amber-500/30';
      case 'stylesheet':
        return 'bg-cyan-400 shadow-sm shadow-cyan-400/30';
      case 'image':
        return 'bg-emerald-400 shadow-sm shadow-emerald-400/30';
      case 'font':
        return 'bg-purple-400 shadow-sm shadow-purple-400/30';
      default:
        return 'bg-slate-500';
    }
  };

  const getCleanFilename = (url: string) => {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      const filename = pathname.split('/').pop();
      return filename || parsed.hostname;
    } catch {
      return url.split('/').pop() || url;
    }
  };

  return (
    <div className="card-glow rounded-3xl p-6 sm:p-7 border border-slate-800 space-y-5 scroll-mt-24">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span>Request Waterfall Timeline</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological load duration and byte weight of assets loaded by the browser engine.
          </p>
        </div>

        {/* Legend / Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg transition',
              filterType === 'all' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            )}
          >
            All ({resources.length})
          </button>
          <button
            onClick={() => setFilterType('document')}
            className={cn(
              'px-2 py-1 rounded-lg transition flex items-center gap-1',
              filterType === 'document' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Doc
          </button>
          <button
            onClick={() => setFilterType('script')}
            className={cn(
              'px-2 py-1 rounded-lg transition flex items-center gap-1',
              filterType === 'script' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" /> JS
          </button>
          <button
            onClick={() => setFilterType('stylesheet')}
            className={cn(
              'px-2 py-1 rounded-lg transition flex items-center gap-1',
              filterType === 'stylesheet' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> CSS
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={cn(
              'px-2 py-1 rounded-lg transition flex items-center gap-1',
              filterType === 'image' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Img
          </button>
          <button
            onClick={() => setFilterType('font')}
            className={cn(
              'px-2 py-1 rounded-lg transition flex items-center gap-1',
              filterType === 'font' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" /> Font
          </button>
        </div>
      </div>

      {/* Waterfall Rows */}
      <div className="space-y-2 font-mono text-xs overflow-x-auto">
        {displayed.map((r, idx) => {
          const duration = r.loadTimeMs || 50;
          const widthPercent = Math.min(100, Math.max(6, (duration / maxTime) * 100));
          const filename = getCleanFilename(r.url);

          return (
            <div
              key={idx}
              className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-slate-900/60 transition border border-transparent hover:border-slate-800 text-[11px]"
            >
              {/* Asset Name & Size */}
              <div className="w-2/5 sm:w-1/3 truncate text-slate-300 flex items-center gap-2" title={r.url}>
                <span className="text-slate-500 text-[10px] shrink-0">#{idx + 1}</span>
                <span className="truncate text-white font-medium">{filename}</span>
                {r.sizeBytes > 0 && (
                  <span className="hidden sm:inline text-[10px] text-slate-500 shrink-0">
                    ({formatBytes(r.sizeBytes)})
                  </span>
                )}
              </div>

              {/* Progress Bar & Timing */}
              <div className="w-3/5 sm:w-2/3 flex items-center gap-3">
                <div className="flex-1 bg-slate-950 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-800 relative">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', getBarColor(r.resourceType))}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <div className="w-20 text-right text-slate-300 font-bold text-[11px] shrink-0">
                  {formatMs(duration)}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No resources found for the "{filterType}" category.
          </div>
        )}
      </div>

      {/* Expand / Collapse Button if > 15 resources */}
      {filtered.length > 15 && (
        <div className="pt-2 border-t border-slate-800/60 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Show Fewer Assets</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                <span>View All {filtered.length} Network Resources</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
