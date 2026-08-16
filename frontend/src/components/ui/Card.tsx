import React from 'react';
import { cn } from '../../lib/utils.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'card-glow rounded-xl p-5 transition-all duration-200',
        hoverable && 'hover:translate-y-[-2px] hover:shadow-xl cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
