export type ResourceType = 
  | 'document'
  | 'script'
  | 'stylesheet'
  | 'image'
  | 'font'
  | 'media'
  | 'fetch'
  | 'xhr'
  | 'other';

export interface ResourceRecord {
  id?: string;
  scanId: string;
  url: string;
  resourceType: ResourceType;
  sizeBytes: number;
  loadTimeMs: number;
  statusCode: number;
  mimeType?: string;
  startTimeMs?: number;
  endTimeMs?: number;
  isCompressed?: boolean;
  isCached?: boolean;
  createdAt?: string;
}

export interface ResourceBreakdown {
  totalCount: number;
  totalSizeBytes: number;
  totalLoadTimeMs: number;
  byType: Record<ResourceType, {
    count: number;
    sizeBytes: number;
  }>;
}
