import { Router, Request, Response } from 'express';
import { ScanRepository } from '@weblens/database';
import { requireAuth } from '../middleware/auth.js';

export function createWhiteLabelRouter(repo: ScanRepository): Router {
  const router = Router();

  // GET /api/white-label - Get agency settings for current user
  router.get('/', requireAuth, (req: Request, res: Response) => {
    let settings = repo.getAgencySettings(req.user!.id);
    if (!settings) {
      settings = {
        userId: req.user!.id,
        brandName: `${req.user!.name}'s Digital Agency`,
        logoUrl: null,
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        footerText: 'Powered by WebLens Enterprise Engine',
        companyWebsite: null,
        customDomain: null,
        updatedAt: new Date().toISOString()
      };
    }
    return res.json(settings);
  });

  // POST /api/white-label - Save custom branding
  router.post('/', requireAuth, (req: Request, res: Response) => {
    try {
      const { brandName, logoUrl, primaryColor, accentColor, footerText, companyWebsite, customDomain } = req.body;
      if (!brandName) {
        return res.status(400).json({ error: 'Brand name is required.' });
      }

      const settings = repo.saveAgencySettings(req.user!.id, {
        brandName,
        logoUrl,
        primaryColor,
        accentColor,
        footerText,
        companyWebsite,
        customDomain
      });

      return res.json(settings);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to save agency branding.' });
    }
  });

  // GET /api/white-label/branding/:userId - Public branding endpoint for shared reports
  router.get('/branding/:userId', (req: Request, res: Response) => {
    const settings = repo.getAgencySettings(req.params.userId);
    return res.json(settings || null);
  });

  return router;
}
