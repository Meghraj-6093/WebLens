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
      <div className="card-glow rounded-3xl p-6 sm:p-8 border border-[rgba(243,240,232,0.12)] bg-[#11151B] relative overflow-hidden">
        {/* Background Energy Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF6B35]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          {/* Left Info & Domain Details */}
          <div className="space-y-4 max-w-xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30 text-xs font-mono font-bold">
                <Globe className="w-3.5 h-3.5" />
                {scan.domain}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#8E8A82] font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#6E6A63]" />
                {formatDate(scan.completedAt || scan.startedAt)}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F3F0E8] tracking-tight flex items-center gap-2.5">
                <span>{scan.domain}</span>
                <a
                  href={scan.normalizedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#8E8A82] hover:text-[#FF6B35] transition-colors inline-flex"
                  title="Open analyzed website"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </h1>
              <p className="text-sm text-[#D8D4CA] mt-2 leading-relaxed">
                {overall.summaryText}
              </p>
            </div>

            {/* Explicit Summary Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#34D399] text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {total.passed} Passed
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF804F] text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {totalIssuesCount} Issues
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#151A21] border border-[rgba(243,240,232,0.10)] text-[#D8D4CA] text-xs font-mono font-medium">
                <Layers className="w-3.5 h-3.5 text-[#8E8A82]" />
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
                  leftIcon={<RotateCw className="w-3.5 h-3.5 text-[#FF6B35]" />}
                >
                  Re-scan
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                isLoading={isSharing}
                leftIcon={copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#FF6B35]" />}
              >
                {copiedShare ? 'Share Link Copied!' : 'Share Report'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintPdf}
                leftIcon={<Download className="w-3.5 h-3.5 text-[#8E8A82]" />}
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
            className="shrink-0 flex flex-col items-center justify-center p-6 sm:p-8 bg-[#0C0F14] rounded-3xl border border-[rgba(243,240,232,0.12)] shadow-2xl w-full lg:w-auto cursor-pointer hover:border-[#FF6B35]/50 hover:scale-[1.01] transition-all group"
            title="Click to view detailed score arithmetic"
          >
            <ScoreGauge
              score={overall.score}
              size="lg"
              label="Overall Website Health"
              showRating={true}
              forceOrange={true}
            />
            <span className="text-[11px] font-mono text-[#FF6B35] group-hover:underline mt-2 flex items-center gap-1">
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
