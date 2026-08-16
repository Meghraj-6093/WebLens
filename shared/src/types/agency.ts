export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Team {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  email: string;
  name: string;
  role: TeamRole;
  joinedAt: string;
}

export interface AgencySettings {
  id: string;
  userId: string;
  teamId?: string | null;
  brandName: string;
  logoUrl?: string | null;
  primaryColor: string;
  accentColor: string;
  footerText?: string | null;
  companyWebsite?: string | null;
  customDomain?: string | null;
  updatedAt: string;
}

export interface ClientRecord {
  id: string;
  userId: string;
  teamId?: string | null;
  clientName: string;
  contactEmail?: string | null;
  domain: string;
  notes?: string | null;
  createdAt: string;
}
