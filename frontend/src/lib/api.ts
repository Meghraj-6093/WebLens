import { 
  CreateScanResponse, 
  ScanStatusResponse, 
  FullScanReport,
  ShareReportResponse,
  ProjectRecord,
  ProjectSummary,
  HistoricalScanItem,
  ComparisonReport,
  ScoreTrendPoint,
  AIExplanation,
  AuditResult
} from '@weblens/shared';
import { LocalWorkspaceDB } from './db.js';

const API_BASE = '/api';

// --- Scan APIs ---
export async function startScan(url: string): Promise<CreateScanResponse> {
  const res = await fetch(`${API_BASE}/scans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to initiate scan.');
  }

  return data;
}

export async function getScanStatus(scanId: string): Promise<ScanStatusResponse> {
  const res = await fetch(`${API_BASE}/scans/${scanId}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch scan status.');
  }
  return data;
}

export async function getScanReport(scanId: string): Promise<FullScanReport> {
  // 1. Try local IndexedDB first for fast offline recovery
  try {
    const localReport = await LocalWorkspaceDB.getReport(scanId);
    if (localReport) {
      return localReport;
    }
  } catch (err) {
    console.warn('IndexedDB read failed, falling back to server fetch', err);
  }

  // 2. Fetch from backend scanner API
  const res = await fetch(`${API_BASE}/scans/${scanId}/results`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load report.');
  }

  // 3. Auto-persist to browser IndexedDB
  try {
    await LocalWorkspaceDB.saveScanReport(data);
  } catch (err) {
    console.warn('Failed to auto-save scan report to IndexedDB', err);
  }

  return data;
}

export async function createShareLink(scanId: string, options?: { visibility?: string; expiresDays?: number }): Promise<ShareReportResponse> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scanId, ...options }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create share link.');
  }
  return data;
}

export async function getSharedReport(token: string): Promise<FullScanReport> {
  const res = await fetch(`${API_BASE}/reports/${token}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Shared report not found.');
  }
  return data;
}

// --- AI Diagnostic APIs ---
export async function getAiExplanation(issue: AuditResult): Promise<AIExplanation> {
  const res = await fetch(`${API_BASE}/ai/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(issue),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate AI diagnosis.');
  return data;
}

// --- Multi-Domain Competitor Benchmark API ---
export async function compareCompetitorDomains(urls: string[]): Promise<any> {
  const res = await fetch(`${API_BASE}/competitor/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Competitor comparison failed.');
  return data;
}

// --- Historical Scan Comparison API ---
export async function compareScans(id1: string, id2: string): Promise<ComparisonReport> {
  const res = await fetch(`${API_BASE}/history/compare/${id1}/${id2}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Comparison failed.');
  return data;
}

// --- API Test Console Runner ---
export async function testApiEndpoint(
  path: string, 
  method: string = 'GET', 
  body?: any, 
  headers?: Record<string, string>
): Promise<{ status: number; durationMs: number; data: any; headers: Record<string, string> }> {
  const startTime = performance.now();
  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  const options: RequestInit = {
    method,
    headers: reqHeaders
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(path, options);
  const durationMs = Math.round(performance.now() - startTime);

  let data: any;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  const resHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    resHeaders[key] = value;
  });

  return {
    status: res.status,
    durationMs,
    data,
    headers: resHeaders
  };
}
