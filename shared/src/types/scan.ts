export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed' | 'timeout' | 'partial';

export type ScanStage = 
  | 'connecting'
  | 'fetching'
  | 'performance'
  | 'seo'
  | 'accessibility'
  | 'security'
  | 'mobile'
  | 'best_practices'
  | 'scoring'
  | 'completed';

export interface ScanStageProgress {
  stage: ScanStage;
  progress: number; // 0 - 100
  message: string;
  timestamp: number;
}

export interface ScanRecord {
  id: string;
  userId?: string | null;
  url: string;
  normalizedUrl: string;
  domain: string;
  status: ScanStatus;
  overallScore: number | null;
  stage?: ScanStage;
  progress?: number;
  screenshotUrl?: string | null;
  errorMessage?: string | null;
  startedAt: string;
  completedAt?: string | null;
  createdAt: string;
}
