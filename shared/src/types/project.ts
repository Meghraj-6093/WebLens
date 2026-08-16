import { ScanRecord } from './scan.js';

export interface ProjectRecord {
  id: string;
  userId: string;
  name: string;
  domain: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary extends ProjectRecord {
  totalScans: number;
  latestScore: number | null;
  scoreChange: number | null; // e.g. +7 or -4
  latestScan?: ScanRecord | null;
}
