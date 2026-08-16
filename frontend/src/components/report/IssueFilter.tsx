import React from 'react';
import { IssueSeverity } from '@weblens/shared';
import { cn } from '../../lib/utils.js';
import { Search, ShieldAlert, AlertCircle, AlertTriangle, Info, CheckCircle2, ListFilter } from 'lucide-react';

export type SeverityFilterType = 'all' | IssueSeverity;

export interface IssueFilterProps {
  selectedSeverity: SeverityFilterType;
  onSelectSeverity: (s: SeverityFilterType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  counts: {
    all: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: number;
  };
}

export const IssueFilter: React.FC<IssueFilterProps> = ({
  selectedSeverity,
  onSelectSeverity,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  const filterButtons: Array<{ id: SeverityFilterType; label: string; count: number; icon: React.ReactNode }> = [
    { id: 'all', label: 'All Findings', count: counts.all, icon: <ListFilter className="w-3.5 h-3.5" /> },
    { id: 'critical', label: 'Critical', count: counts.critical, icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'high', label: 'High', count: counts.high, icon: <AlertCircle className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'medium', label: 'Medium', count: counts.medium, icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'low', label: 'Low', count: counts.low, icon: <Info className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'passed', label: 'Passed', count: counts.passed, icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2">
      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
        {filterButtons.map((btn) => {
          const isActive = selectedSeverity === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => onSelectSeverity(btn.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
            >
              {btn.icon}
              <span>{btn.label}</span>
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                  isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                )}
              >
                {btn.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative min-w-[220px]">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter issues..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
      </div>
    </div>
  );
};
