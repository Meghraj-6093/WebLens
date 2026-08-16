export type AuditCategory = 
  | 'performance'
  | 'seo'
  | 'accessibility'
  | 'security'
  | 'mobile'
  | 'best_practices';

export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'passed';

export type FixStatus = 'not_fixed' | 'fixed' | 'ignored';

export interface AuditResult {
  id?: string;
  scanId: string;
  category: AuditCategory;
  ruleId: string;
  severity: IssueSeverity;
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  technicalDetails?: string | null;
  location?: string | null;
  passed: boolean;
  scoreImpact: number; // point deduction if failed (e.g. 20, 10, 5, 2)
  fixStatus?: FixStatus;
  createdAt?: string;
}

export interface MetricItem {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  status: 'good' | 'needs_improvement' | 'poor';
  description: string;
}
