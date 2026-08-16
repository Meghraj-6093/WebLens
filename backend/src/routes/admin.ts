import { Router, Request, Response } from 'express';
import { ScanRepository } from '@weblens/database';
import { ScanService } from '../services/scanService.js';
import { requireAuth } from '../middleware/auth.js';

export function createAdminRouter(repo: ScanRepository, scanService: ScanService): Router {
  const router = Router();

  // Admin routes require authentication and admin privileges
  router.use(requireAuth);
  router.use((req: Request, res: Response, next) => {
    if (req.user?.role !== 'admin' && req.user?.email !== 'admin@weblens.dev') {
      return res.status(403).json({ error: 'Forbidden: Administrator privileges required.' });
    }
    next();
  });

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
