import { Router, Request, Response } from 'express';
import { ScanRepository } from '@weblens/database';
import { requireAuth } from '../middleware/auth.js';

export function createTeamRouter(repo: ScanRepository): Router {
  const router = Router();

  // GET /api/teams - Get user's current team
  router.get('/', requireAuth, (req: Request, res: Response) => {
    let team = repo.getTeamByUserId(req.user!.id);
    if (!team) {
      // Auto-provision personal/agency team if not existing
      team = repo.createTeam(req.user!.id, `${req.user!.name}'s Agency Workspace`);
    }

    const members = repo.getTeamMembers(team.id);
    return res.json({ team, members });
  });

  // POST /api/teams - Create a new team
  router.post('/', requireAuth, (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Team name is required.' });

      const team = repo.createTeam(req.user!.id, name);
      const members = repo.getTeamMembers(team.id);
      return res.status(201).json({ team, members });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to create team.' });
    }
  });

  // POST /api/teams/:id/members - Invite team member
  router.post('/:id/members', requireAuth, (req: Request, res: Response) => {
    try {
      const { email, role } = req.body;
      if (!email) return res.status(400).json({ error: 'Member email is required.' });

      let invitedUser = repo.getUserByEmail(email);
      if (!invitedUser) {
        // Create user placeholder
        invitedUser = repo.createUser({
          email: email.toLowerCase(),
          passwordHash: 'placeholder_invited',
          name: email.split('@')[0],
          tier: 'free'
        }) as any;
      }

      if (invitedUser) {
        repo.addTeamMember(req.params.id, invitedUser.id, role || 'member');
      }
      const members = repo.getTeamMembers(req.params.id);
      return res.status(201).json({ success: true, members });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to add member.' });
    }
  });

  // DELETE /api/teams/:id/members/:userId - Remove member
  router.delete('/:id/members/:userId', requireAuth, (req: Request, res: Response) => {
    repo.removeTeamMember(req.params.id, req.params.userId);
    const members = repo.getTeamMembers(req.params.id);
    return res.json({ success: true, members });
  });

  // --- Clients Roster ---
  router.get('/clients', requireAuth, (req: Request, res: Response) => {
    const clients = repo.getClientsByUserId(req.user!.id);
    return res.json(clients);
  });

  router.post('/clients', requireAuth, (req: Request, res: Response) => {
    try {
      const { clientName, contactEmail, domain, notes } = req.body;
      if (!clientName || !domain) {
        return res.status(400).json({ error: 'Client name and domain are required.' });
      }

      const client = repo.createClient(req.user!.id, { clientName, contactEmail, domain, notes });
      return res.status(201).json(client);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to create client record.' });
    }
  });

  router.delete('/clients/:id', requireAuth, (req: Request, res: Response) => {
    repo.deleteClient(req.params.id, req.user!.id);
    return res.json({ success: true, message: 'Client removed.' });
  });

  return router;
}
