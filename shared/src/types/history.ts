import { AuditCategory, AuditResult } from './audit.js';
import { ScanRecord } from './scan.js';

export interface HistoricalScanItem extends ScanRecord {
  scoreChange?: number | null; // e.g. +7
}

export interface ScoreTrendPoint {
  scanId: string;
  date: string;
  overallScore: number;
  performanceScore?: number;
  seoScore?: number;
  accessibilityScore?: number;
  securityScore?: number;
  mobileScore?: number;
  bestPracticesScore?: number;
}

export interface CategoryComparisonDelta {
  category: AuditCategory;
  beforeScore: number;
  afterScore: number;
  delta: number; // e.g. +5 or -10
}

export interface IssueComparisonDelta {
  fixedIssues: AuditResult[];
  newIssues: AuditResult[];
  unresolvedIssues: AuditResult[];
}

export interface ComparisonReport {
  beforeScan: ScanRecord;
  afterScan: ScanRecord;
  overallDelta: number; // after.score - before.score
  categoryDeltas: Record<AuditCategory, CategoryComparisonDelta>;
  issuesDelta: IssueComparisonDelta;
  summaryExplanation: string;
}
