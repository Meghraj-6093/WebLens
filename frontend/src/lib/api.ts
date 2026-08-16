import { 
  CreateScanResponse, 
  ScanStatusResponse, 
  FullScanReport,
  ShareReportResponse,
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  ProjectRecord,
  ProjectSummary,
  HistoricalScanItem,
  ComparisonReport,
  ScoreTrendPoint,
  AIExplanation,
  AuditResult
} from '@weblens/shared';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('weblens_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- Auth APIs ---
export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Registration failed.');
  return resData;
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Login failed.');
  return resData;
}

export async function getMe(): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Session expired.');
  return resData;
}

// --- Scan APIs ---
export async function startScan(url: string): Promise<CreateScanResponse> {
  const res = await fetch(`${API_BASE}/scans`, {
    method: 'POST',
    headers: getAuthHeaders(),
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

export async function createShareLink(scanId: string, options?: { visibility?: string; expiresDays?: number }): Promise<ShareReportResponse> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: getAuthHeaders(),
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

// --- Projects APIs ---
export async function getProjects(): Promise<ProjectSummary[]> {
  const res = await fetch(`${API_BASE}/projects`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch projects.');
  return data;
}

export async function createProject(data: { name: string; domain: string; description?: string }): Promise<ProjectRecord> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) throw new Error(resData.error || 'Failed to create project.');
  return resData;
}

// --- History & Comparison APIs ---
export async function getScanHistory(): Promise<HistoricalScanItem[]> {
  const res = await fetch(`${API_BASE}/history`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch history.');
  return data;
}

export async function compareScans(id1: string, id2: string): Promise<ComparisonReport> {
  const res = await fetch(`${API_BASE}/history/compare/${id1}/${id2}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Comparison failed.');
  return data;
}

export async function getDomainTrends(domain: string): Promise<ScoreTrendPoint[]> {
  const res = await fetch(`${API_BASE}/history/trends/${encodeURIComponent(domain)}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch trends.');
  return data;
}

// --- AI Diagnostic APIs ---
export async function getAiExplanation(issue: AuditResult): Promise<AIExplanation> {
  const res = await fetch(`${API_BASE}/ai/explain`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(issue),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate AI diagnosis.');
  return data;
}
