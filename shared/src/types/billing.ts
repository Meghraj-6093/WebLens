export type SubscriptionTier = 'free' | 'pro' | 'agency';

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  priceMonthly: number;
  description: string;
  features: string[];
  maxScansPerDay: number;
  maxScansPerMonth: number;
  maxMonitors: number;
  highlighted?: boolean;
}

export const PLANS_CONFIG: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Developer',
    priceMonthly: 0,
    description: 'Essential diagnostics for independent web developers and personal projects.',
    features: [
      '10 scans / day',
      'Full 6-category technical health audits',
      'AI Diagnostic Explanations & Code Fixes',
      'Single project workspace',
      'Standard test runner queue'
    ],
    maxScansPerDay: 10,
    maxScansPerMonth: 300,
    maxMonitors: 1,
  },
  {
    id: 'pro',
    name: 'Pro Engineer',
    priceMonthly: 29,
    description: 'Advanced Core Web Vitals tracking, unlimited projects, and continuous monitoring.',
    features: [
      '50 scans / day',
      'Unlimited Project Workspaces',
      'Daily automated site monitoring',
      'Full PDF & JSON report exports',
      '3-Way Competitor Benchmarks',
      'Priority scan execution queue'
    ],
    maxScansPerDay: 50,
    maxScansPerMonth: 1500,
    maxMonitors: 10,
    highlighted: true,
  },
  {
    id: 'agency',
    name: 'Agency Suite',
    priceMonthly: 99,
    description: 'White-label reporting, client portal workspaces, and high-concurrency scans.',
    features: [
      '500 scans / day',
      'White-label PDF reports with custom branding',
      'Custom domain client portal',
      'Dedicated team member seats',
      'Developer Public REST API (10k req/mo)',
      'Automated webhook regression alerts'
    ],
    maxScansPerDay: 500,
    maxScansPerMonth: 15000,
    maxMonitors: 50,
  }
];
