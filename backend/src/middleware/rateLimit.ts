import { Request, Response, NextFunction } from 'express';
import { ScanRepository } from '@weblens/database';

export function createRateLimiter(repo: ScanRepository) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Identifier: user ID if authenticated, else client IP
    const user = req.user;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const identifier = user ? user.id : `ip_${clientIp}`;

    const usageToday = repo.getUsageToday(identifier);
    let maxLimit = 3; // Anonymous default

    if (user) {
      if (user.tier === 'agency') maxLimit = 500;
      else if (user.tier === 'pro') maxLimit = 50;
      else maxLimit = 10;
    }

    if (usageToday >= maxLimit) {
      return res.status(429).json({
        error: `Daily scan limit reached (${usageToday}/${maxLimit}). ${user ? 'Upgrade to Pro for higher limits.' : 'Create a free account to get 10 scans per day.'}`,
        usageToday,
        maxLimit,
        requiresAuth: !user,
      });
    }

    // Increment usage for this scan
    repo.incrementUsage(identifier);
    next();
  };
}
