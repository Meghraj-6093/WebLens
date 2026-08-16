import React, { useState } from 'react';
import { ResourceRecord, ResourceBreakdown } from '@weblens/shared';
import { formatBytes, formatMs } from '../../lib/utils.js';
import { FileCode, Image, FileText, Film, Box, Check, X, ArrowUpDown } from 'lucide-react';

export interface ResourceTableProps {
  resources: ResourceRecord[];
  breakdown: ResourceBreakdown;
}

export const ResourceTable: React.FC<ResourceTableProps> = ({ resources, breakdown }) => {
  const [sortField, setSortField] = useState<'size' | 'time' | 'type'>('size');
  const [sortAsc, setSortAsc] = useState(false);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'script':
        return <FileCode className="w-3.5 h-3.5 text-[#FF804F]" />;
      case 'stylesheet':
        return <FileText className="w-3.5 h-3.5 text-[#FF6B35]" />;
      case 'image':
        return <Image className="w-3.5 h-3.5 text-[#D8D4CA]" />;
      case 'media':
        return <Film className="w-3.5 h-3.5 text-[#D8D4CA]" />;
      default:
        return <Box className="w-3.5 h-3.5 text-[#8E8A82]" />;
    }
  };

  const sortedResources = [...resources].sort((a, b) => {
    let diff = 0;
    if (sortField === 'size') diff = (a.sizeBytes || 0) - (b.sizeBytes || 0);
    if (sortField === 'time') diff = (a.loadTimeMs || 0) - (b.loadTimeMs || 0);
    if (sortField === 'type') diff = a.resourceType.localeCompare(b.resourceType);
    return sortAsc ? diff : -diff;
  });

  const handleSort = (field: 'size' | 'time' | 'type') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breakdown Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-glow rounded-xl p-3.5 border border-[rgba(243,240,232,0.08)] bg-[#11151B]">
          <div className="text-[11px] text-[#8E8A82] font-medium">Total Resources</div>
          <div className="text-xl font-bold font-mono text-[#F3F0E8] mt-1">{breakdown.totalCount}</div>
        </div>
        <div className="card-glow rounded-xl p-3.5 border border-[rgba(243,240,232,0.08)] bg-[#11151B]">
          <div className="text-[11px] text-[#8E8A82] font-medium">Total Transferred</div>
          <div className="text-xl font-bold font-mono text-[#FF6B35] mt-1">{formatBytes(breakdown.totalSizeBytes)}</div>
        </div>
        <div className="card-glow rounded-xl p-3.5 border border-[rgba(243,240,232,0.08)] bg-[#11151B]">
          <div className="text-[11px] text-[#8E8A82] font-medium">Scripts & Styles</div>
          <div className="text-xl font-bold font-mono text-[#FF804F] mt-1">
            {formatBytes(breakdown.byType.script.sizeBytes + breakdown.byType.stylesheet.sizeBytes)}
          </div>
        </div>
        <div className="card-glow rounded-xl p-3.5 border border-[rgba(243,240,232,0.08)] bg-[#11151B]">
          <div className="text-[11px] text-[#8E8A82] font-medium">Image Payloads</div>
          <div className="text-xl font-bold font-mono text-[#D8D4CA] mt-1">
            {formatBytes(breakdown.byType.image.sizeBytes)}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-glow rounded-xl border border-[rgba(243,240,232,0.08)] bg-[#11151B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151A21] text-[#8E8A82] border-b border-[rgba(243,240,232,0.08)] font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Resource</th>
                <th
                  onClick={() => handleSort('type')}
                  className="py-3 px-4 cursor-pointer hover:text-[#FF6B35]"
                >
                  <div className="flex items-center gap-1">
                    <span>Type</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('size')}
                  className="py-3 px-4 cursor-pointer hover:text-[#FF6B35] text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Size</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('time')}
                  className="py-3 px-4 cursor-pointer hover:text-[#FF6B35] text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Duration</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Compressed</th>
                <th className="py-3 px-4 text-center">Cached</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.06)] font-mono">
              {sortedResources.slice(0, 50).map((r, idx) => (
                <tr key={idx} className="hover:bg-[#151A21]/50 transition-colors">
                  <td className="py-2.5 px-4 max-w-xs sm:max-w-md truncate text-[#F3F0E8]">
                    <div className="flex items-center gap-2 truncate">
                      {getResourceIcon(r.resourceType)}
                      <span className="truncate" title={r.url}>
                        {r.url.split('/').pop() || r.url}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-[#8E8A82] capitalize">{r.resourceType}</td>
                  <td className="py-2.5 px-4 text-right text-[#D8D4CA]">{formatBytes(r.sizeBytes)}</td>
                  <td className="py-2.5 px-4 text-right text-[#8E8A82]">{formatMs(r.loadTimeMs)}</td>
                  <td className="py-2.5 px-4 text-center">
                    {r.isCompressed ? (
                      <span className="inline-flex items-center text-[#34D399]"><Check className="w-3.5 h-3.5" /></span>
                    ) : (
                      <span className="inline-flex items-center text-[#6E6A63]"><X className="w-3.5 h-3.5" /></span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {r.isCached ? (
                      <span className="inline-flex items-center text-[#FF6B35]"><Check className="w-3.5 h-3.5" /></span>
                    ) : (
                      <span className="inline-flex items-center text-[#6E6A63]"><X className="w-3.5 h-3.5" /></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
