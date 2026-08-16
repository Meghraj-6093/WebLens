export interface ApiKeyRecord {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  lastUsedAt?: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  apiKey: string; // Plaintext returned only once at creation
  keyPrefix: string;
  createdAt: string;
}

export interface PublicApiScanRequest {
  url: string;
  webhookUrl?: string;
  includeScreenshots?: boolean;
}

export interface PublicApiScanResponse {
  scanId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  url: string;
  domain: string;
  reportUrl: string;
  createdAt: string;
}
