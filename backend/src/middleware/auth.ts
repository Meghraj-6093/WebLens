import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { User } from '@weblens/shared';

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
    }
  }
}

export function createAuthMiddleware(authService: AuthService) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = authService.getUserFromToken(token);
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required to access this resource.' });
  }
  next();
}
