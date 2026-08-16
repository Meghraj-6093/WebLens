import { Router, Request, Response } from 'express';
import { ScanService } from '../services/scanService.js';
import { ScanRepository } from '@weblens/database';

export function createReportRouter(scanService: ScanService, repo: ScanRepository): Router {
  const router = Router();

  // POST /api/reports - Generate shareable report token
  router.post('/', (req: Request, res: Response) => {
    try {
      const { scanId } = req.body;
      if (!scanId) {
        return res.status(400).json({ error: 'scanId is required.' });
      }

      const result = scanService.createShareToken(scanId);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create shareable report.' });
    }
  });

  // GET /api/reports/:token - Retrieve public report by token
  router.get('/:token', (req: Request, res: Response) => {
    const { token } = req.params;
    const scanId = repo.getScanIdByShareToken(token);
    if (!scanId) {
      return res.status(404).json({ error: 'Shared report not found.' });
    }

    const report = scanService.getFullReport(scanId);
    if (!report) {
      return res.status(404).json({ error: 'Scan data not found.' });
    }

    return res.json(report);
  });

  return router;
}
