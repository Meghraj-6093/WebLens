export type UserTier = 'free' | 'pro' | 'agency';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
  role?: string; // 'user' | 'admin'
  avatarUrl?: string | null;
  scansToday: number;
  maxScansPerDay: number;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfileStats {
  totalScans: number;
  completedScans: number;
  failedScans: number;
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  uniqueDomains: number;
  projectsCount: number;
  monitorsCount: number;
  apiKeysCount: number;
  savedReportsCount: number;
}

export interface UserActivityItem {
  id: string;
  type: 'scan' | 'project' | 'monitor' | 'report' | 'key';
  title: string;
  detail: string;
  timestamp: string;
  link?: string;
}

export interface UserProfileData {
  user: User;
  stats: UserProfileStats;
  recentActivity: UserActivityItem[];
  recentScans: any[];
  projects: any[];
  monitors: any[];
  apiKeys: any[];
}
