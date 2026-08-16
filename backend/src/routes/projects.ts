import { Router, Request, Response } from 'express';
import { ScanRepository } from '@weblens/database';
import { requireAuth } from '../middleware/auth.js';

export function createProjectRouter(repo: ScanRepository): Router {
  const router = Router();

  // GET /api/projects - List user's projects with latest scores and delta stats
  router.get('/', requireAuth, (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const projects = repo.getProjectsByUserId(userId);
      return res.json(projects);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch projects.' });
    }
  });

  // POST /api/projects - Create a new project workspace
  router.post('/', requireAuth, (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { name, domain, description } = req.body;
      if (!name || !domain) {
        return res.status(400).json({ error: 'Name and domain are required.' });
      }

      const project = repo.createProject(userId, name, domain, description);
      return res.status(201).json(project);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to create project.' });
    }
  });

  // GET /api/projects/:id - Get project details and scan history
  router.get('/:id', requireAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const project = repo.getProjectById(id);
      if (!project || project.userId !== req.user!.id) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      const scans = repo.getScansByDomain(project.domain, 20);
      return res.json({ project, scans });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to retrieve project.' });
    }
  });

  // POST /api/projects/:id/scans - Link a scan to this project
  router.post('/:id/scans', requireAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { scanId } = req.body;
      if (!scanId) {
        return res.status(400).json({ error: 'scanId is required.' });
      }

      repo.linkScanToProject(id, scanId);
      return res.status(201).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to link scan.' });
    }
  });

  return router;
}
