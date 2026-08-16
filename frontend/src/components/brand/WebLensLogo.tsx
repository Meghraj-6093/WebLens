import React from 'react';
import { cn } from '../../lib/utils.js';

export interface WebLensLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showWordmark?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  iconOnly?: boolean;
}

/**
 * Precision Digital Lens + Orbital Scan Brand Icon
 */
export const WebLensIcon: React.FC<{ size?: number | string; className?: string }> = ({
  size = 32,
  className = ''
}) => {
  const pixelSize = typeof size === 'number' ? size : size;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none overflow-visible', className)}
      aria-hidden="true"
    >
      <defs>
        {/* Deep Lens Gradients */}
        <radialGradient id="wl-lens-core" cx="38%" cy="36%" r="62%">
          <stop offset="0%" stopColor="#1E2530" />
          <stop offset="45%" stopColor="#0E1218" />
          <stop offset="85%" stopColor="#05070A" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        <linearGradient id="wl-lens-rim" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F3F0E8" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#FF6B35" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#151A21" />
        </linearGradient>

        {/* 3D Orbital Ring Gradients */}
        <linearGradient id="wl-orbit-front" x1="8" y1="36" x2="42" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF946C" />
          <stop offset="35%" stopColor="#FF6B35" />
          <stop offset="70%" stopColor="#D94F20" />
          <stop offset="100%" stopColor="#F3F0E8" />
        </linearGradient>

        <linearGradient id="wl-orbit-back" x1="10" y1="20" x2="38" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8C2C08" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D94F20" stopOpacity="0.5" />
        </linearGradient>

        {/* Ambient Signal Glow Filter */}
        <filter id="wl-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Diagnostic Scan Target Brackets (Top-Left & Bottom-Right) */}
      <path
        d="M6 14V9C6 7.34315 7.34315 6 9 6H14"
        stroke="#FF6B35"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="14" cy="6" r="1" fill="#FF804F" />

      <path
        d="M42 34V39C42 40.6569 40.6569 42 39 42H34"
        stroke="#FF6B35"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="34" cy="42" r="1" fill="#FF804F" />

      {/* Optional subtle corner dots */}
      <circle cx="41" cy="7" r="1.2" fill="#8E8A82" opacity="0.4" />
      <circle cx="7" cy="41" r="1.2" fill="#8E8A82" opacity="0.4" />

      {/* 2. Back Half of 3D Orbital Scan Ring (Passes behind the lens) */}
      <path
        d="M10.5 28C10 23.5 16 16.5 28 16.5C36.5 16.5 40 20 40 23"
        stroke="url(#wl-orbit-back)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* 3. Outer Lens Chassis */}
      <circle
        cx="24"
        cy="24"
        r="12.5"
        fill="url(#wl-lens-core)"
        stroke="url(#wl-lens-rim)"
        strokeWidth="1.4"
      />

      {/* 4. Internal Aperture Glass Reflection & Depth Rings */}
      <circle
        cx="24"
        cy="24"
        r="9"
        fill="#080A0E"
        stroke="#232B36"
        strokeWidth="0.8"
      />

      {/* Inner specular crescent */}
      <path
        d="M17 21C18.2 17.5 22 16 26.5 16.8C23 18.2 20.5 20.8 19.5 24.5C18.5 23 17.5 22 17 21Z"
        fill="#F3F0E8"
        opacity="0.35"
      />

      {/* 5. Front Half of 3D Orbital Scan Ring (Sweeps over the lens foreground) */}
      <path
        d="M7 29C9.5 35.5 18 37 28.5 34.5C35.5 32.5 41 28 42 23.5"
        stroke="url(#wl-orbit-front)"
        strokeWidth="3.6"
        strokeLinecap="round"
        filter="url(#wl-glow)"
      />

      {/* Front Ring Sharp Edge Highlight */}
      <path
        d="M9 29.2C11.5 34.8 19 36.2 28 34C34 32.2 39.5 28.2 40.8 24.5"
        stroke="#F3F0E8"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* 6. Primary Specular Eye Reflection Dot */}
      <circle cx="21" cy="20.5" r="2.2" fill="#F3F0E8" />
      <circle cx="25.5" cy="26" r="1" fill="#F3F0E8" opacity="0.6" />

      {/* 7. Active Optical Sensor Focus Node */}
      <circle cx="9" cy="29" r="2" fill="#FF804F" />
      <circle cx="9" cy="29" r="0.8" fill="#FFFFFF" />
    </svg>
  );
};

/**
 * Complete WebLens Brand Identity (Icon + WebLens Wordmark + PRO Badge)
 */
export const WebLensLogo: React.FC<WebLensLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showBadge = true,
  badgeText = 'PRO',
  className = '',
  iconOnly = false
}) => {
  const sizeMap = {
    xs: { icon: 20, text: 'text-xs', badge: 'text-[9px] px-1 py-0.2' },
    sm: { icon: 24, text: 'text-sm', badge: 'text-[9.5px] px-1.5 py-0.5' },
    md: { icon: 32, text: 'text-base', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { icon: 40, text: 'text-lg', badge: 'text-[11px] px-2 py-0.5' },
    xl: { icon: 52, text: 'text-2xl', badge: 'text-xs px-2.5 py-1' }
  };

  const currentSize = typeof size === 'number' ? { icon: size, text: 'text-base', badge: 'text-[10px] px-1.5 py-0.5' } : sizeMap[size];

  if (iconOnly || !showWordmark) {
    return <WebLensIcon size={currentSize.icon} className={className} />;
  }

  return (
    <div className={cn('inline-flex items-center gap-2.5 select-none group', className)}>
      <WebLensIcon size={currentSize.icon} className="transition-transform duration-200 group-hover:scale-105" />
      <span className={cn('font-extrabold tracking-tight font-mono flex items-center leading-none', currentSize.text)}>
        <span className="text-[#F3F0E8]">Web</span>
        <span className="text-[#FF6B35]">Lens</span>
      </span>
      {showBadge && (
        <span className={cn(
          'font-mono font-bold uppercase rounded-md bg-[#0C0F14] text-[#F3F0E8] border border-[#FF6B35]/40 shadow-sm flex items-center gap-1 leading-tight',
          currentSize.badge
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse shrink-0" />
          <span>{badgeText}</span>
        </span>
      )}
    </div>
  );
};

export default WebLensLogo;
