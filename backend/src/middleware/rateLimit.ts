import { Request, Response, NextFunction } from 'express';
import { ScanRepository } from '@weblens/database';

export function createRateLimiter(repo: ScanRepository) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Identifier: user ID if authenticated, else sanitized client IP
    const user = req.user;
    let clientIp = '127.0.0.1';

    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      clientIp = forwarded.split(',')[0].trim();
    } else if (Array.isArray(forwarded) && forwarded.length > 0) {
      clientIp = forwarded[0].trim();
    } else if (req.socket.remoteAddress) {
      clientIp = req.socket.remoteAddress;
    }

    // Clean IPv6 mapped IPv4 format if present (e.g. ::ffff:127.0.0.1)
    if (clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.substring(7);
    }

    const identifier = user ? user.id : `ip_${clientIp}`;

    const usageToday = repo.getUsageToday(identifier);
    // In local-first workstation mode, provide generous limits (1000/day)
    const maxLimit = 1000;

    if (usageToday >= maxLimit) {
      return res.status(429).json({
        error: `Daily scan rate limit reached (${usageToday}/${maxLimit}). Please try again tomorrow.`,
        usageToday,
        maxLimit,
      });
    }

    // Increment usage for this scan
    repo.incrementUsage(identifier);
    next();
  };
}
