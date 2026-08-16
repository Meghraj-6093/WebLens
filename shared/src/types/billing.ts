export type SubscriptionTier = 'free' | 'pro' | 'agency';

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  priceMonthly: number;
  description: string;
  features: string[];
  maxScansPerMonth: number;
  maxMonitors: number;
  highlighted?: boolean;
}
