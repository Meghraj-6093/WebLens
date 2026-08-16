import { Router, Request, Response } from 'express';
import { ScanRepository } from '@weblens/database';
import { ScanService } from '../services/scanService.js';

export function createAdminRouter(repo: ScanRepository, scanService: ScanService): Router {
  const router = Router();

  // GET /api/admin/stats
  router.get('/stats', (_req: Request, res: Response) => {
    const stats = repo.getAdminSystemStats();
    return res.json(stats);
  });

  // GET /api/admin/failures
  router.get('/failures', (_req: Request, res: Response) => {
    const failures = repo.getRecentFailureLogs(30);
    return res.json(failures);
  });

  // GET /api/admin/users
  router.get('/users', (_req: Request, res: Response) => {
    const users = repo.getAllUsersSummary(50);
    return res.json(users);
  });

  // GET /api/admin/queue
  router.get('/queue', (_req: Request, res: Response) => {
    return res.json({
      workers: scanService.queueStats,
      timestamp: new Date().toISOString()
    });
  });

  return router;
}
