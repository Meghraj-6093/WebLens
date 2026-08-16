import React, { useState } from 'react';
import { ResourceRecord, ResourceType } from '@weblens/shared';
import { formatMs, formatBytes } from '../../lib/utils.js';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
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
        return 'bg-[#FF6B35] shadow-sm shadow-[#FF6B35]/30';
      case 'script':
        return 'bg-[#FF804F] shadow-sm shadow-[#FF804F]/20';
      case 'stylesheet':
        return 'bg-[#D94F20] shadow-sm shadow-[#D94F20]/20';
      case 'image':
        return 'bg-[#D8D4CA] shadow-sm shadow-white/10';
      case 'font':
        return 'bg-[#8E8A82]';
      default:
        return 'bg-[#6E6A63]';
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
    <div className="card-glow rounded-3xl p-6 sm:p-7 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-5 scroll-mt-24">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(243,240,232,0.08)] pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#F3F0E8] tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#FF6B35]" />
            <span>Request Waterfall Timeline</span>
          </h3>
          <p className="text-xs text-[#8E8A82] mt-0.5">
            Chronological load duration and byte weight of assets loaded by the browser engine.
          </p>
        </div>

        {/* Legend / Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'px-2.5 py-1 rounded-lg transition',
              filterType === 'all' ? 'bg-[#FF6B35] text-[#080A0E] font-bold' : 'bg-[#151A21] text-[#8E8A82] hover:text-[#F3F0E8]'
            )}
          >
            All ({resources.length})
          </button>
          <button
            onClick={() => setFilterType('document')}
            className={cn(
              'px-2 py-1 rounded-lg transition flex items-center gap-1',
              filterType === 'document' ? 'bg-[#151A21] text-[#FF6B35] border border-[#FF6B35]/40 font-bold' : 'bg-[#151A21] text-[#8E8A82] hover:text-[#F3F0E8]'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF6B35]" /> Doc
          </button>
          <button
            onClick={() => setFilterType('script')}
            className={cn(
              'px-2 py-1 rounded-lg transition flex items-center gap-1',
              filterType === 'script' ? 'bg-[#151A21] text-[#FF804F] border border-[#FF804F]/40 font-bold' : 'bg-[#151A21] text-[#8E8A82] hover:text-[#F3F0E8]'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF804F]" /> JS
          </button>
          <button
            onClick={() => setFilterType('stylesheet')}
            className={cn(
              'px-2 py-1 rounded-lg transition flex items-center gap-1',
              filterType === 'stylesheet' ? 'bg-[#151A21] text-[#D94F20] border border-[#D94F20]/40 font-bold' : 'bg-[#151A21] text-[#8E8A82] hover:text-[#F3F0E8]'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#D94F20]" /> CSS
          </button>
          <button
            onClick={() => setFilterType('image')}
            className={cn(
              'px-2 py-1 rounded-lg transition flex items-center gap-1',
              filterType === 'image' ? 'bg-[#151A21] text-[#D8D4CA] border border-[#D8D4CA]/40 font-bold' : 'bg-[#151A21] text-[#8E8A82] hover:text-[#F3F0E8]'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#D8D4CA]" /> Img
          </button>
          <button
            onClick={() => setFilterType('font')}
            className={cn(
              'px-2 py-1 rounded-lg transition flex items-center gap-1',
              filterType === 'font' ? 'bg-[#151A21] text-[#8E8A82] border border-[#8E8A82]/40 font-bold' : 'bg-[#151A21] text-[#8E8A82] hover:text-[#F3F0E8]'
            )}
          >
            <span className="w-2 h-2 rounded-full bg-[#8E8A82]" /> Font
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
              className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-[#151A21]/60 transition border border-transparent hover:border-[rgba(243,240,232,0.08)] text-[11px]"
            >
              {/* Asset Name & Size */}
              <div className="w-2/5 sm:w-1/3 truncate text-[#D8D4CA] flex items-center gap-2" title={r.url}>
                <span className="text-[#8E8A82] text-[10px] shrink-0">#{idx + 1}</span>
                <span className="truncate text-[#F3F0E8] font-medium">{filename}</span>
                {r.sizeBytes > 0 && (
                  <span className="hidden sm:inline text-[10px] text-[#8E8A82] shrink-0">
                    ({formatBytes(r.sizeBytes)})
                  </span>
                )}
              </div>

              {/* Progress Bar & Timing */}
              <div className="w-3/5 sm:w-2/3 flex items-center gap-3">
                <div className="flex-1 bg-[#080A0E] rounded-full h-3.5 overflow-hidden p-0.5 border border-[rgba(243,240,232,0.08)] relative">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', getBarColor(r.resourceType))}
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <div className="w-20 text-right text-[#D8D4CA] font-bold text-[11px] shrink-0">
                  {formatMs(duration)}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-[#8E8A82] text-xs">
            No resources found for the "{filterType}" category.
          </div>
        )}
      </div>

      {/* Expand / Collapse Button if > 15 resources */}
      {filtered.length > 15 && (
        <div className="pt-2 border-t border-[rgba(243,240,232,0.08)] text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#151A21] border border-[rgba(243,240,232,0.10)] hover:border-[#FF6B35]/40 text-xs font-semibold text-[#D8D4CA] hover:text-[#F3F0E8] transition"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>Show Fewer Assets</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>View All {filtered.length} Network Resources</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
