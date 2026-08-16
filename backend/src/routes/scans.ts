import { Router, Request, Response } from 'express';
import { ScanService } from '../services/scanService.js';

export function createScanRouter(scanService: ScanService): Router {
  const router = Router();

  // POST /api/scans
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required.' });
      }

      const result = await scanService.startScan(url);
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to start scan.' });
    }
  });

  // GET /api/scans/:id
  router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const status = scanService.getScanStatus(id);
    if (!status) {
      return res.status(404).json({ error: 'Scan not found.' });
    }
    return res.json(status);
  });

  // GET /api/scans/:id/results
  router.get('/:id/results', (req: Request, res: Response) => {
    const { id } = req.params;
    const report = scanService.getFullReport(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found for this scan.' });
    }
    return res.json(report);
  });

  // GET /api/scans/:id/events (Server-Sent Events for live progress)
  router.get('/:id/events', (req: Request, res: Response) => {
    const { id } = req.params;
    const status = scanService.getScanStatus(id);
    if (!status) {
      return res.status(404).json({ error: 'Scan not found.' });
    }

    // Configure headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial status
    res.write(`data: ${JSON.stringify({ scanId: id, stage: status.stage || 'connecting', progress: status.progress || 0, status: status.status })}\n\n`);

    if (status.status === 'completed' || status.status === 'failed') {
      res.write(`data: ${JSON.stringify({ scanId: id, completed: true, status: status.status })}\n\n`);
      res.end();
      return;
    }

    // Subscribe to live events
    const unsubscribe = scanService.subscribe(id, (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (data.completed || data.status === 'failed') {
        res.end();
      }
    });

    req.on('close', () => {
      unsubscribe();
    });
  });

  return router;
}
