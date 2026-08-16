import { Router, Request, Response, NextFunction } from 'express';
import { ScanRepository } from '@weblens/database';
import { ScanService } from '../../services/scanService.js';
import { requireAuth } from '../../middleware/auth.js';

export function createPublicApiRouter(scanService: ScanService, repo: ScanRepository): Router {
  const router = Router();

  // API Key Authentication Middleware for Public Endpoints
  const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const customHeader = req.headers['x-api-key'];
    let rawKey = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      rawKey = authHeader.substring(7).trim();
    } else if (typeof customHeader === 'string') {
      rawKey = customHeader.trim();
    }

    if (!rawKey) {
      return res.status(401).json({
        error: 'Missing API key. Provide "Authorization: Bearer weblens_sk_..." or "X-API-Key" header.'
      });
    }

    const keyUser = repo.verifyApiKey(rawKey);
    if (!keyUser) {
      return res.status(401).json({ error: 'Invalid or revoked API key.' });
    }

    // Attach user to request
    (req as any).apiUserId = keyUser.userId;
    (req as any).apiKeyName = keyUser.name;
    next();
  };

  // POST /api/v1/scan - Initiate scan via developer API
  router.post('/scan', requireApiKey, async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL field is required in request body.' });
      }

      const userId = (req as any).apiUserId;
      const result = await scanService.startScan(url, userId);

      return res.status(202).json({
        scanId: result.scanId,
        status: result.status,
        url: result.url,
        domain: result.domain,
        reportUrl: `/report/${result.scanId}`,
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to start scan via API.' });
    }
  });

  // GET /api/v1/scan/:id - Retrieve full report via developer API
  router.get('/scan/:id', requireApiKey, (req: Request, res: Response) => {
    const report = scanService.getFullReport(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found for this scan ID.' });
    }
    return res.json(report);
  });

  // GET /api/v1/me - Get API user info & quota
  router.get('/me', requireApiKey, (req: Request, res: Response) => {
    const userId = (req as any).apiUserId;
    const user = repo.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    return res.json({
      userId: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      scansToday: user.scansToday,
      maxScansPerDay: user.maxScansPerDay,
      apiKeyName: (req as any).apiKeyName
    });
  });

  // --- API Key Management (Session Authenticated) ---
  router.get('/keys', requireAuth, (req: Request, res: Response) => {
    const keys = repo.getApiKeysByUserId(req.user!.id);
    return res.json(keys);
  });

  router.post('/keys', requireAuth, (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Key description name is required.' });

      const newKey = repo.createApiKey(req.user!.id, name);
      return res.status(201).json(newKey);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to create API key.' });
    }
  });

  router.delete('/keys/:id', requireAuth, (req: Request, res: Response) => {
    repo.deleteApiKey(req.params.id, req.user!.id);
    return res.json({ success: true, message: 'API key revoked.' });
  });

  return router;
}
