import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8A82]">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-[#11151B] border border-[rgba(243,240,232,0.12)] rounded-xl px-3.5 py-2.5 text-xs text-[#F3F0E8] placeholder:text-[#8E8A82] focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]/50 transition-all font-sans',
            leftIcon && 'pl-10',
            error && 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[11px] text-rose-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
