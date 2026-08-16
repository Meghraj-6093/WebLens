export type UserTier = 'free' | 'pro' | 'agency';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: UserTier;
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
