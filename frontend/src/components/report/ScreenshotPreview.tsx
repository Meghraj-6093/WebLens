import React, { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export interface ScreenshotPreviewProps {
  screenshotUrl?: string | null;
  mobileScreenshotUrl?: string | null;
  domain: string;
}

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({
  screenshotUrl,
  mobileScreenshotUrl,
  domain,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');

  if (!screenshotUrl && !mobileScreenshotUrl) return null;

  return (
    <div className="card-glow rounded-2xl p-5 border border-[rgba(243,240,232,0.08)] bg-[#11151B] space-y-4">
      {/* Header & Viewport Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#F3F0E8] tracking-tight">Visual Page Capture</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151A21] text-[#8E8A82] border border-[rgba(243,240,232,0.10)]">
            {viewport === 'desktop' ? '1280 × 800' : '390 × 844'}
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#080A0E] rounded-xl border border-[rgba(243,240,232,0.08)] text-xs">
          <button
            onClick={() => setViewport('desktop')}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all',
              viewport === 'desktop'
                ? 'bg-[#FF6B35] text-[#080A0E] shadow-sm font-bold'
                : 'text-[#8E8A82] hover:text-[#F3F0E8]'
            )}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            disabled={!mobileScreenshotUrl}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all',
              viewport === 'mobile'
                ? 'bg-[#FF6B35] text-[#080A0E] shadow-sm font-bold'
                : 'text-[#8E8A82] hover:text-[#F3F0E8] disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      {viewport === 'desktop' ? (
        <div className="rounded-xl overflow-hidden border border-[rgba(243,240,232,0.10)] bg-[#05070A] shadow-2xl relative group">
          {/* Desktop Browser Chrome Mockup */}
          <div className="bg-[#151A21] px-3.5 py-2 border-b border-[rgba(243,240,232,0.08)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex-1 max-w-sm text-center text-[10px] font-mono text-[#D8D4CA] bg-[#080A0E] px-3 py-1 rounded-md border border-[rgba(243,240,232,0.08)] truncate">
              https://{domain}
            </div>
            <div className="w-8" />
          </div>

          <img
            src={screenshotUrl || ''}
            alt={`Desktop snapshot of ${domain}`}
            className="w-full h-auto max-h-[380px] object-cover object-top"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="flex justify-center py-2">
          {/* Mobile Phone Mockup */}
          <div className="w-[260px] rounded-[32px] overflow-hidden border-4 border-[#151A21] bg-[#05070A] shadow-2xl relative">
            {/* Phone Notch */}
            <div className="bg-[#151A21] h-5 w-full flex items-center justify-center relative">
              <div className="w-16 h-3 bg-[#080A0E] rounded-full" />
            </div>

            <img
              src={mobileScreenshotUrl || screenshotUrl || ''}
              alt={`Mobile snapshot of ${domain}`}
              className="w-full h-auto max-h-[420px] object-cover object-top"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};
