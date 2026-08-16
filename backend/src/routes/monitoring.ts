import { Router, Request, Response } from 'express';
import { ScanRepository } from '@weblens/database';
import { requireAuth } from '../middleware/auth.js';

export function createMonitoringRouter(repo: ScanRepository): Router {
  const router = Router();

  // --- Monitored Sites ---
  router.get('/sites', requireAuth, (req: Request, res: Response) => {
    const sites = repo.getMonitoredSites(req.user!.id);
    return res.json(sites);
  });

  router.post('/sites', requireAuth, (req: Request, res: Response) => {
    try {
      const { url, domain, frequency, projectId } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'Target URL is required.' });
      }

      const site = repo.createMonitoredSite({
        userId: req.user!.id,
        projectId: projectId || null,
        url,
        domain: domain || new URL(url).hostname,
        frequency: frequency || 'daily'
      });

      return res.status(201).json(site);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to add monitored target.' });
    }
  });

  router.delete('/sites/:id', requireAuth, (req: Request, res: Response) => {
    repo.deleteMonitoredSite(req.params.id, req.user!.id);
    return res.json({ success: true, message: 'Monitored target removed.' });
  });

  // --- Alerts History ---
  router.get('/alerts', requireAuth, (req: Request, res: Response) => {
    const alerts = repo.getAlertsByUserId(req.user!.id);
    return res.json(alerts);
  });

  // --- Webhooks & Notification Channels ---
  router.get('/webhooks', requireAuth, (req: Request, res: Response) => {
    const webhooks = repo.getWebhooksByUserId(req.user!.id);
    return res.json(webhooks);
  });

  router.post('/webhooks', requireAuth, (req: Request, res: Response) => {
    try {
      const { name, type, url } = req.body;
      if (!name || !url) {
        return res.status(400).json({ error: 'Name and webhook URL are required.' });
      }

      const webhook = repo.createWebhook(req.user!.id, name, type || 'webhook', url);
      return res.status(201).json(webhook);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to add webhook destination.' });
    }
  });

  router.delete('/webhooks/:id', requireAuth, (req: Request, res: Response) => {
    repo.deleteWebhook(req.params.id, req.user!.id);
    return res.json({ success: true, message: 'Webhook destination removed.' });
  });

  return router;
}
