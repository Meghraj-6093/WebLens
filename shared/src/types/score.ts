import { AuditCategory } from './audit.js';

export interface CategoryScore {
  id?: string;
  scanId: string;
  category: AuditCategory;
  score: number; // 0 - 100
  rating: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  issuesCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: number;
  };
  weight: number; // e.g. 0.25 for performance
  createdAt?: string;
}

export interface OverallScoreResult {
  score: number; // 0 - 100
  rating: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  summaryText: string;
  categoryScores: Record<AuditCategory, CategoryScore>;
  totalIssues: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: number;
  };
}
