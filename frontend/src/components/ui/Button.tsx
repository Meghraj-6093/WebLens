import React from 'react';
import { cn } from '../../lib/utils.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080A0E] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const variants = {
    primary: 'bg-[#FF6B35] hover:bg-[#FF804F] active:bg-[#D94F20] text-[#080A0E] font-bold shadow-md shadow-[#FF6B35]/25 border border-[#FF804F]/50 focus:ring-[#FF6B35]',
    secondary: 'bg-[#151A21] hover:bg-[#1A2028] text-[#F3F0E8] border border-[rgba(243,240,232,0.14)] hover:border-[rgba(243,240,232,0.25)] shadow-sm focus:ring-[#FF6B35]',
    outline: 'bg-transparent hover:bg-[#151A21] text-[#D8D4CA] hover:text-[#F3F0E8] border border-[rgba(243,240,232,0.12)] hover:border-[#FF6B35]/50 focus:ring-[#FF6B35]',
    ghost: 'bg-transparent hover:bg-[#151A21] text-[#8E8A82] hover:text-[#F3F0E8] focus:ring-[#FF6B35]',
    danger: 'bg-rose-600/90 hover:bg-rose-600 text-white shadow-md shadow-rose-600/20 border border-rose-500/30 focus:ring-rose-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-bold',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
};
