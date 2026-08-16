import { ScanRecord, ScanStatus, ScanStage } from './scan.js';
import { AuditResult, MetricItem, AuditCategory } from './audit.js';
import { CategoryScore, OverallScoreResult } from './score.js';
import { ResourceRecord, ResourceBreakdown } from './resource.js';

export interface CreateScanRequest {
  url: string;
}

export interface CreateScanResponse {
  scanId: string;
  url: string;
  domain: string;
  status: ScanStatus;
  message: string;
}

export interface ScanStatusResponse {
  scanId: string;
  status: ScanStatus;
  stage?: ScanStage;
  progress?: number;
  message?: string;
  errorMessage?: string | null;
  overallScore?: number | null;
  startedAt: string;
  completedAt?: string | null;
}

export interface FullScanReport {
  scan: ScanRecord;
  overall: OverallScoreResult;
  categories: Record<AuditCategory, {
    score: number;
    rating: string;
    metrics: MetricItem[];
    issues: AuditResult[];
  }>;
  resources: ResourceRecord[];
  resourceBreakdown: ResourceBreakdown;
  screenshotUrl?: string | null;
}

export interface ShareReportResponse {
  shareToken: string;
  shareUrl: string;
}
