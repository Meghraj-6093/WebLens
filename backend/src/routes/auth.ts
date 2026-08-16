import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();

  // POST /api/auth/register
  router.post('/register', async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const result = await authService.register({ email, password, name });
      return res.status(201).json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  });

  // POST /api/auth/login
  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const result = await authService.login({ email, password });
      return res.json(result);
    } catch (err: any) {
      return res.status(401).json({ error: err.message || 'Login failed.' });
    }
  });

  // GET /api/auth/me
  router.get('/me', requireAuth, (req: Request, res: Response) => {
    return res.json({ user: req.user });
  });

  return router;
}
