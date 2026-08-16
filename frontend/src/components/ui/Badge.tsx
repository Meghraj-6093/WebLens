import React from 'react';
import { IssueSeverity } from '@weblens/shared';
import { cn } from '../../lib/utils.js';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface BadgeProps {
  severity?: IssueSeverity;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  severity = 'medium',
  children,
  className,
  size = 'md',
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />;
      case 'high':
        return <AlertCircle className="w-3 h-3 text-orange-400 shrink-0" />;
      case 'medium':
        return <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />;
      case 'low':
        return <Info className="w-3 h-3 text-blue-400 shrink-0" />;
      case 'passed':
        return <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />;
    }
  };

  const getStyle = () => {
    switch (severity) {
      case 'critical':
        return 'badge-glow-critical';
      case 'high':
        return 'badge-glow-high';
      case 'medium':
        return 'badge-glow-medium';
      case 'low':
        return 'badge-glow-low';
      case 'passed':
        return 'badge-glow-passed';
    }
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full uppercase tracking-wider',
        getStyle(),
        sizes[size],
        className
      )}
    >
      {getIcon()}
      <span>{children || severity}</span>
    </span>
  );
};
