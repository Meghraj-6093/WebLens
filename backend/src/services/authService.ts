import crypto from 'crypto';
import { User, RegisterRequest, LoginRequest, AuthResponse } from '@weblens/shared';
import { ScanRepository } from '@weblens/database';

const JWT_SECRET = process.env.JWT_SECRET || 'weblens-super-secret-jwt-key-2026';

export class AuthService {
  private repo: ScanRepository;

  constructor(repo?: ScanRepository) {
    this.repo = repo || new ScanRepository();
  }

  // Password hashing via PBKDF2
  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password: string, storedHash: string): boolean {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(verifyHash, 'hex'));
  }

  // Generate lightweight signed token (base64url header.payload.signature)
  createToken(user: User): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 86400 // 7 days
    })).toString('base64url');

    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  verifyToken(token: string): { sub: string; email: string; name: string; tier: string } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [header, payload, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return null;
      }

      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return null; // expired
      }

      return decoded;
    } catch {
      return null;
    }
  }

  async register(req: RegisterRequest): Promise<AuthResponse> {
    const existing = this.repo.getUserByEmail(req.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = this.hashPassword(req.password);
    const user = this.repo.createUser({
      email: req.email,
      passwordHash,
      name: req.name || req.email.split('@')[0],
      tier: 'free'
    });

    const token = this.createToken(user);
    return { user, token };
  }

  async login(req: LoginRequest): Promise<AuthResponse> {
    const userWithHash = this.repo.getUserByEmail(req.email);
    if (!userWithHash) {
      throw new Error('Invalid email or password.');
    }

    const isValid = this.verifyPassword(req.password, userWithHash.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password.');
    }

    const user = this.repo.getUserById(userWithHash.id)!;
    const token = this.createToken(user);
    return { user, token };
  }

  getUserFromToken(token: string): User | null {
    const decoded = this.verifyToken(token);
    if (!decoded || !decoded.sub) return null;
    return this.repo.getUserById(decoded.sub);
  }
}
