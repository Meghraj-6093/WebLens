import React from 'react';
import { cn } from '../../lib/utils.js';

export interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  subLabel?: string;
  showRating?: boolean;
  className?: string;
  forceOrange?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 'md',
  label,
  subLabel,
  showRating = true,
  className,
  forceOrange = true,
}) => {
  const boundedScore = Math.max(0, Math.min(100, Math.round(score)));

  const getColorConfig = (val: number) => {
    if (forceOrange) {
      return {
        stroke: '#FF6B35', // Signal Orange
        glow: 'rgba(255, 107, 53, 0.25)',
        text: 'text-[#FF6B35]',
        rating: val >= 90 ? 'Optimal' : val >= 75 ? 'Good' : val >= 50 ? 'Needs Attention' : 'Critical',
        bgTrack: 'rgba(243, 240, 232, 0.08)'
      };
    }
    if (val >= 90) {
      return {
        stroke: '#FF6B35',
        glow: 'rgba(255, 107, 53, 0.25)',
        text: 'text-[#FF6B35]',
        rating: 'Optimal',
        bgTrack: 'rgba(243, 240, 232, 0.08)'
      };
    }
    if (val >= 70) {
      return {
        stroke: '#FF804F',
        glow: 'rgba(255, 128, 79, 0.25)',
        text: 'text-[#FF804F]',
        rating: 'Good',
        bgTrack: 'rgba(243, 240, 232, 0.08)'
      };
    }
    if (val >= 50) {
      return {
        stroke: '#D94F20',
        glow: 'rgba(217, 79, 32, 0.25)',
        text: 'text-[#D94F20]',
        rating: 'Needs Attention',
        bgTrack: 'rgba(243, 240, 232, 0.08)'
      };
    }
    return {
      stroke: '#EF4444',
      glow: 'rgba(239, 68, 68, 0.25)',
      text: 'text-rose-400',
      rating: 'Critical',
      bgTrack: 'rgba(243, 240, 232, 0.08)'
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
          className="absolute inset-0 rounded-full blur-xl opacity-35 pointer-events-none transition-all duration-500"
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

        {/* Center Score Number (Space Grotesk 700-800) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              'font-extrabold font-display tracking-tight text-[#F3F0E8] transition-colors duration-300',
              size === 'sm' ? 'text-lg' : size === 'md' ? 'text-3xl' : 'text-5xl'
            )}
          >
            {boundedScore}
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] uppercase font-display font-bold text-[#8E8A82] -mt-0.5 tracking-wider">
              / 100
            </span>
          )}
        </div>
      </div>

      {/* Label and Rating Text */}
      {(label || showRating) && (
        <div className="mt-2.5 space-y-0.5">
          {label && <div className="text-xs font-display font-semibold text-[#D8D4CA]">{label}</div>}
          {showRating && (
            <div className="text-[11px] font-display font-bold uppercase tracking-wider text-[#FF6B35]">
              {config.rating}
            </div>
          )}
          {subLabel && <div className="text-[11px] font-sans text-[#8E8A82]">{subLabel}</div>}
        </div>
      )}
    </div>
  );
};
