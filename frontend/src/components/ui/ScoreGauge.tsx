import React from 'react';
import { cn } from '../../lib/utils.js';

export interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  subLabel?: string;
  showRating?: boolean;
  className?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 'md',
  label,
  subLabel,
  showRating = true,
  className,
}) => {
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));

  const getColorConfig = (val: number) => {
    if (val >= 90) {
      return {
        stroke: '#10B981', // emerald
        glow: 'rgba(16, 185, 129, 0.25)',
        text: 'text-emerald-400',
        rating: 'Excellent',
        bgTrack: 'rgba(16, 185, 129, 0.1)'
      };
    }
    if (val >= 75) {
      return {
        stroke: '#3B82F6', // blue
        glow: 'rgba(59, 130, 246, 0.25)',
        text: 'text-blue-400',
        rating: 'Good',
        bgTrack: 'rgba(59, 130, 246, 0.1)'
      };
    }
    if (val >= 50) {
      return {
        stroke: '#F59E0B', // amber
        glow: 'rgba(245, 158, 11, 0.25)',
        text: 'text-amber-400',
        rating: 'Needs Improvement',
        bgTrack: 'rgba(245, 158, 11, 0.1)'
      };
    }
    return {
      stroke: '#F43F5E', // rose
      glow: 'rgba(244, 63, 94, 0.25)',
      text: 'text-rose-400',
      rating: 'Poor',
      bgTrack: 'rgba(244, 63, 94, 0.1)'
    };
  };

  const config = getColorConfig(boundedScore);

  const dimension = size === 'sm' ? 68 : size === 'md' ? 120 : 160;
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 9 : 12;
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (boundedScore / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', className)}>
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        {/* Glow backdrop */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40 pointer-events-none transition-all duration-500"
          style={{ background: config.glow }}
        />

        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="transparent"
            stroke={config.bgTrack}
            strokeWidth={strokeWidth}
          />
          {/* Progress Arc */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="transparent"
            stroke={config.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>

        {/* Center Score Number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'font-extrabold font-mono tracking-tight transition-colors duration-300',
              size === 'sm' ? 'text-lg' : size === 'md' ? 'text-3xl' : 'text-5xl',
              config.text
            )}
          >
            {boundedScore}
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] uppercase font-bold text-slate-400 -mt-0.5 tracking-wider">
              / 100
            </span>
          )}
        </div>
      </div>

      {/* Label and Rating Text */}
      {(label || showRating) && (
        <div className="mt-2.5 space-y-0.5">
          {label && <div className="text-xs font-semibold text-slate-300">{label}</div>}
          {showRating && (
            <div className={cn('text-[11px] font-bold uppercase tracking-wider', config.text)}>
              {config.rating}
            </div>
          )}
          {subLabel && <div className="text-[11px] text-slate-400">{subLabel}</div>}
        </div>
      )}
    </div>
  );
};
