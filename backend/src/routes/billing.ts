import { Router, Request, Response } from 'express';
import { ScanRepository } from '@weblens/database';
import { requireAuth } from '../middleware/auth.js';
import { PLANS_CONFIG, UserTier } from '@weblens/shared';

export function createBillingRouter(repo: ScanRepository): Router {
  const router = Router();

  // GET /api/billing/plans - Single source of truth for subscription plans
  router.get('/plans', (_req: Request, res: Response) => {
    return res.json(PLANS_CONFIG);
  });

  // POST /api/billing/upgrade - Upgrade user subscription tier
  router.post('/upgrade', requireAuth, (req: Request, res: Response) => {
    try {
      const { tier } = req.body;
      if (!tier || !['free', 'pro', 'agency'].includes(tier)) {
        return res.status(400).json({ error: 'Valid tier (free, pro, agency) is required.' });
      }

      repo.updateUserTier(req.user!.id, tier as UserTier);

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
