import React from 'react';
import { cn } from '../../lib/utils.js';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
  ...props
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-800/60 rounded-md',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'circle' && 'rounded-full',
        className
      )}
      {...props}
    />
  );
};
