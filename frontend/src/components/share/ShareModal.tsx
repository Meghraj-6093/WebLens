import React, { useState, useEffect } from 'react';
import { createShareLink } from '../../lib/api.js';
import { Button } from '../ui/Button.js';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Lock, 
  Globe, 
  Calendar, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export interface ShareModalProps {
  scanId: string;
  domain: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ scanId, domain, isOpen, onClose }) => {
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [expiresDays, setExpiresDays] = useState<number | undefined>(undefined);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const generateLink = async () => {
      setIsLoading(true);
      try {
        const res = await createShareLink(scanId, { visibility, expiresDays });
        setShareUrl(`${window.location.origin}${res.shareUrl}`);
      } catch (err) {
        setShareUrl(window.location.href);
      } finally {
        setIsLoading(false);
      }
    };

    generateLink();
  }, [isOpen, scanId, visibility, expiresDays]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate lightweight SVG QR code url via standard chart API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl || window.location.href)}&bgcolor=0B101E&color=FFFFFF&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="card-glow rounded-3xl w-full max-w-md p-6 sm:p-8 border border-slate-800 relative bg-[#0B101E] shadow-2xl space-y-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Share Audit Report</h3>
          </div>
          <p className="text-xs text-slate-400">
            Share this technical health audit of <strong>{domain}</strong> with team members or clients.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 text-xs">
          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              {visibility === 'public' ? <Globe className="w-4 h-4 text-blue-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
              <div>
                <div className="font-semibold text-white">Access Privacy</div>
                <div className="text-[11px] text-slate-400">
                  {visibility === 'public' ? 'Anyone with link can view' : 'Only account members'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setVisibility(visibility === 'public' ? 'private' : 'public')}
              className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white"
            >
              {visibility === 'public' ? 'Public' : 'Private'}
            </button>
          </div>

          {/* Expiration Dropdown */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <div className="font-semibold text-white">Link Expiration</div>
                <div className="text-[11px] text-slate-400">Control report lifetime</div>
              </div>
            </div>
            <select
              value={expiresDays || ''}
              onChange={(e) => setExpiresDays(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value="">Never expires</option>
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>
        </div>

        {/* Share Link Box */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300">Public Share URL</label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs text-blue-400 font-mono flex-1 px-2 focus:outline-none selection:bg-blue-600 truncate"
            />
            <Button
              size="sm"
              variant="primary"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* QR Code Toggle */}
        <div className="pt-1 text-center space-y-3">
          <button
            onClick={() => setShowQr(!showQr)}
            className="text-xs text-slate-400 hover:text-blue-400 inline-flex items-center gap-1.5 transition-colors font-medium"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>{showQr ? 'Hide Mobile QR Code' : 'View Mobile QR Code'}</span>
          </button>

          {showQr && (
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2 animate-fade-in">
              <img
                src={qrCodeUrl}
                alt={`QR code for ${shareUrl}`}
                className="w-40 h-40 rounded-xl border border-slate-800 p-2 bg-[#0B101E]"
              />
              <span className="text-[11px] text-slate-400">Scan with your phone to open audit</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
