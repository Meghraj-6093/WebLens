import { AuditCategory } from './audit.js';

export interface CompetitorSiteScore {
  domain: string;
  url: string;
  scanId: string;
  overallScore: number;
  rating: string;
  categoryScores: Record<AuditCategory, number>;
  totalIssuesCount: number;
  criticalIssuesCount: number;
  screenshotUrl?: string | null;
}

export interface CompetitorComparisonResult {
  primaryDomain: string;
  domains: string[];
  sites: CompetitorSiteScore[];
  winnerDomain: string;
  categoryLeaders: Record<AuditCategory, { domain: string; score: number }>;
  insights: string[];
  comparedAt: string;
}
