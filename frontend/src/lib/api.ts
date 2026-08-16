import { 
  CreateScanResponse, 
  ScanStatusResponse, 
  FullScanReport,
  ShareReportResponse 
} from '@weblens/shared';

const API_BASE = '/api';

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
  const res = await fetch(`${API_BASE}/scans/${scanId}/results`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load report.');
  }
  return data;
}

export async function getDemoReport(): Promise<FullScanReport> {
  const res = await fetch(`${API_BASE}/demo`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load demo report.');
  }
  return data;
}

export async function createShareLink(scanId: string): Promise<ShareReportResponse> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scanId }),
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
