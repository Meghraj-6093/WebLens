import React from 'react';
import { Monitor } from 'lucide-react';

export interface ScreenshotPreviewProps {
  screenshotUrl?: string | null;
  domain: string;
}

export const ScreenshotPreview: React.FC<ScreenshotPreviewProps> = ({ screenshotUrl, domain }) => {
  if (!screenshotUrl) return null;

  return (
    <div className="card-glow rounded-xl p-5 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">Desktop Viewport Capture</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">1280 × 800</span>
      </div>

      <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#050811] shadow-2xl relative group">
        {/* Browser Top Bar Mockup */}
        <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <div className="mx-auto text-[10px] font-mono text-slate-400 bg-slate-950 px-3 py-0.5 rounded-md border border-slate-800">
            https://{domain}
          </div>
        </div>

        <img
          src={screenshotUrl}
          alt={`Screenshot of ${domain}`}
          className="w-full h-auto max-h-96 object-cover object-top"
          loading="lazy"
        />
      </div>
    </div>
  );
};
