import { Router, Request, Response } from 'express';
import { ScanRepository } from '@weblens/database';
import { requireAuth } from '../middleware/auth.js';
import { PricingPlan } from '@weblens/shared';

const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Tier',
    priceMonthly: 0,
    description: 'Essential website scanning and Core Web Vitals diagnostics.',
    maxScansPerMonth: 10,
    maxMonitors: 1,
    features: [
      '10 Scans per day',
      'All 6 Audit Categories',
      'Desktop & Mobile Screenshots',
      'Basic Issue Recommendations',
      'Public Report Sharing'
    ]
  },
  {
    id: 'pro',
    name: 'WebLens Pro',
    priceMonthly: 29,
    description: 'For growing web professionals, SEOs, and developers.',
    maxScansPerMonth: 50,
    maxMonitors: 5,
    highlighted: true,
    features: [
      '50 Scans per day',
      'Continuous Daily Monitoring',
      'Email & Slack Change Alerts',
      'AI Code Fixes (HTML, React, Next.js)',
      'Side-by-Side Audit Comparisons',
      'Executive PDF Export',
      'Full Scan History'
    ]
  },
  {
    id: 'agency',
    name: 'Agency & Enterprise',
    priceMonthly: 99,
    description: 'Complete white-label platform for digital agencies and teams.',
    maxScansPerMonth: 500,
    maxMonitors: 25,
    features: [
      '500 Scans per day',
      'Multi-Competitor 3-Way Benchmarking',
      'Custom White-Label Branding & Logos',
      'Team Workspaces & Client Rosters',
      'Developer Public REST API (v1)',
      'Unlimited Webhooks (Discord, Slack, Custom)',
      'Priority Concurrency Queue'
    ]
  }
];

export function createBillingRouter(repo: ScanRepository): Router {
  const router = Router();

  // GET /api/billing/plans
  router.get('/plans', (_req: Request, res: Response) => {
    return res.json(PLANS);
  });

  // POST /api/billing/upgrade - Upgrade user subscription tier
  router.post('/upgrade', requireAuth, (req: Request, res: Response) => {
    try {
      const { tier } = req.body;
      if (!tier || !['free', 'pro', 'agency'].includes(tier)) {
        return res.status(400).json({ error: 'Valid tier (free, pro, agency) is required.' });
      }

      // Update tier in DB
      (repo as any).db.prepare(`UPDATE users SET tier = ? WHERE id = ?`).run(tier, req.user!.id);

      const updatedUser = repo.getUserById(req.user!.id);
      return res.json({
        success: true,
        message: `Plan upgraded to ${tier.toUpperCase()} successfully!`,
        user: updatedUser
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Billing upgrade failed.' });
    }
  });

  return router;
}
