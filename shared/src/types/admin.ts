export interface AdminSystemStats {
  totalScans: number;
  completedScans: number;
  failedScans: number;
  successRatePercent: number;
  averageScore: number;
  totalUsers: number;
  totalProjects: number;
  activeMonitors: number;
  avgDurationMs: number;
}

export interface FailureLogEntry {
  scanId: string;
  url: string;
  domain: string;
  errorMessage: string;
  category: 'dns' | 'ssrf' | 'timeout' | 'network' | 'unknown';
  occurredAt: string;
}
