import { Router, Request, Response } from 'express';
import { ScanRepository } from '@weblens/database';
import { AuthService } from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';

export function createUserRouter(repo: ScanRepository, authService: AuthService): Router {
  const router = Router();

  // All user endpoints require authentication
  router.use(requireAuth);

  // GET /api/user/profile - Complete aggregated profile and statistics
  router.get('/profile', (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = repo.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const stats = repo.getUserProfileStats(userId);
      const recentActivity = repo.getUserRecentActivity(userId, 15);
      const recentScans = repo.getRecentScans(10, userId);
      const projects = repo.getProjectsByUserId(userId);
      const monitors = repo.getMonitoredSites(userId);
      const apiKeys = repo.getApiKeysByUserId(userId);

      return res.json({
        user,
        stats,
        recentActivity,
        recentScans,
        projects,
        monitors,
        apiKeys,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch user profile.' });
    }
  });

  // PUT /api/user/profile - Update account profile details
  router.put('/profile', (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { name, email } = req.body;
      if (!name && !email) {
        return res.status(400).json({ error: 'Name or email is required.' });
      }

      repo.updateUserProfile(userId, { name, email });
      const updated = repo.getUserById(userId);
      return res.json({ user: updated, message: 'Profile updated successfully.' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to update profile.' });
    }
  });

  // PUT /api/user/password - Change password
  router.put('/password', async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }

      // Verify current password
      const user = repo.getUserByEmail(req.user!.email);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const isValid = await authService.comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return res.status(400).json({ error: 'Incorrect current password.' });
      }

      const newHash = await authService.hashPassword(newPassword);
      repo.updatePassword(userId, newHash);

      return res.json({ message: 'Password changed successfully.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update password.' });
    }
  });

  // DELETE /api/user/account - Danger Zone account deletion with full cascade
  router.delete('/account', (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      repo.deleteUserAccount(userId);
      return res.json({ message: 'Account and all associated data permanently deleted.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete account.' });
    }
  });

  return router;
}
