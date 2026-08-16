import React, { useState } from 'react';
import { FullScanReport, AuditCategory } from '@weblens/shared';
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
  ExternalLink,
  Calculator,
  Layers
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';
import { createShareLink } from '../../lib/api.js';
import { ScoreBreakdownModal } from './ScoreBreakdownModal.js';

export interface OverallScoreCardProps {
  report: FullScanReport;
  onRescan?: () => void;
}

export const OverallScoreCard: React.FC<OverallScoreCardProps> = ({ report, onRescan }) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [breakdownCategory, setBreakdownCategory] = useState<AuditCategory | 'overall'>('overall');

  const { scan, overall } = report;
  const total = overall.totalIssues;
  const totalIssuesCount = total.critical + total.high + total.medium + total.low;
  const totalChecksCount = total.passed + totalIssuesCount;

  const handleShare = async () => {
    try {
      setIsSharing(true);
      const res = await createShareLink(scan.id);
      const fullUrl = `${window.location.origin}${res.shareUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
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
    <>
      <div className="card-glow rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          {/* Left Info & Domain Details */}
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
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <span>{scan.domain}</span>
                <a
                  href={scan.normalizedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:text-blue-400 transition-colors inline-flex"
                  title="Open analyzed website"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {overall.summaryText}
              </p>
            </div>

            {/* Explicit Summary Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {total.passed} Passed
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {totalIssuesCount} Issues
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono font-medium">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                {totalChecksCount} Total Checks
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setBreakdownCategory('overall');
                  setIsBreakdownOpen(true);
                }}
                leftIcon={<Calculator className="w-3.5 h-3.5" />}
              >
                Why this score? (Score Breakdown)
              </Button>
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
                leftIcon={copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-blue-400" />}
              >
                {copiedShare ? 'Share Link Copied!' : 'Share Report'}
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

          {/* Right Hero Score Gauge (Interactive) */}
          <div 
            onClick={() => {
              setBreakdownCategory('overall');
              setIsBreakdownOpen(true);
            }}
            className="shrink-0 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-900/70 rounded-3xl border border-slate-800 shadow-2xl w-full lg:w-auto cursor-pointer hover:border-blue-500/40 hover:scale-[1.01] transition-all group"
            title="Click to view detailed score arithmetic"
          >
            <ScoreGauge
              score={overall.score}
              size="lg"
              label="Overall Website Health"
              showRating={true}
            />
            <span className="text-[11px] font-mono text-blue-400 group-hover:underline mt-2 flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              View Arithmetic Derivation →
            </span>
          </div>
        </div>
      </div>

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        report={report}
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        initialCategory={breakdownCategory}
      />
    </>
  );
};
