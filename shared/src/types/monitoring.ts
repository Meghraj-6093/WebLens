export type MonitoringFrequency = 'daily' | 'weekly' | 'monthly';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info';
export type WebhookType = 'webhook' | 'slack' | 'discord' | 'email';

export interface MonitoredSite {
  id: string;
  userId: string;
  projectId?: string | null;
  url: string;
  domain: string;
  frequency: MonitoringFrequency;
  lastScanId?: string | null;
  lastScore?: number | null;
  lastScannedAt?: string | null;
  nextScanAt: string;
  status: 'active' | 'paused';
  createdAt: string;
  updatedAt: string;
}

export interface ChangeAlert {
  id: string;
  userId: string;
  siteId?: string | null;
  scanId: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  channel: WebhookType;
  sentAt: string;
}

export interface WebhookDestination {
  id: string;
  userId: string;
  name: string;
  type: WebhookType;
  url: string;
  isActive: boolean;
  createdAt: string;
}
