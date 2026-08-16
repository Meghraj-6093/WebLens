import React, { useState } from 'react';
import { FullScanReport } from '@weblens/shared';
import { ScoreGauge } from '../ui/ScoreGauge.js';
import { Button } from '../ui/Button.js';
import { 
  RotateCw, 
  Share2, 
  Download, 
  Globe, 
  Calendar, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';
import { createShareLink } from '../../lib/api.js';

export interface OverallScoreCardProps {
  report: FullScanReport;
  onRescan?: () => void;
}

export const OverallScoreCard: React.FC<OverallScoreCardProps> = ({ report, onRescan }) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const { scan, overall } = report;
  const total = overall.totalIssues;

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const res = await createShareLink(scan.id);
      const fullUrl = `${window.location.origin}${res.shareUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // Fallback copy current URL
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } finally {
      setIsSharing(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="card-glow rounded-2xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
      {/* Subtle background gradient radial glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
        {/* Left Info & Domain */}
        <div className="space-y-4 max-w-xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-medium">
              <Globe className="w-3.5 h-3.5" />
              {scan.domain}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatDate(scan.completedAt || scan.startedAt)}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{scan.domain}</span>
              <a
                href={scan.normalizedUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-blue-400 transition-colors inline-flex"
                title="Visit website"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {overall.summaryText}
            </p>
          </div>

          {/* Issue Breakdown Stat Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {total.critical > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                {total.critical} Critical
              </div>
            )}
            {total.high > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {total.high} High
              </div>
            )}
            {total.medium > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {total.medium} Medium
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {total.passed} Passed Checks
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onRescan && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onRescan}
                leftIcon={<RotateCw className="w-3.5 h-3.5 text-blue-400" />}
              >
                Re-scan
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              isLoading={isSharing}
              leftIcon={copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            >
              {copiedShare ? 'Link Copied!' : 'Share Report'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintPdf}
              leftIcon={<Download className="w-3.5 h-3.5 text-slate-400" />}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Right Gauge */}
        <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800/80 w-full lg:w-auto">
          <ScoreGauge
            score={overall.score}
            size="lg"
            label="Overall Website Health"
            showRating={true}
          />
        </div>
      </div>
    </div>
  );
};
