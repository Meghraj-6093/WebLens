import { Router, Request, Response } from 'express';
import { CompetitorService } from '../services/competitorService.js';
import { ScanService } from '../services/scanService.js';

export function createCompetitorRouter(scanService: ScanService): Router {
  const router = Router();
  const competitorService = new CompetitorService(scanService);

  // POST /api/competitor/compare - Multi-domain competitor benchmarking
  router.post('/compare', async (req: Request, res: Response) => {
    try {
      const { urls } = req.body;
      if (!urls || !Array.isArray(urls) || urls.length < 2) {
        return res.status(400).json({ error: 'Please provide an array of at least 2 website URLs to compare.' });
      }

      const userId = req.user ? req.user.id : null;
      const comparison = await competitorService.compareSites(urls, userId);
      return res.json(comparison);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Competitor benchmark failed.' });
    }
  });

  return router;
}
