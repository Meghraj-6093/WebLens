import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from './db.js';
import { 
  ScanRecord, 
  ScanStatus, 
  ScanStage, 
  AuditResult, 
  CategoryScore, 
  ResourceRecord, 
  AuditCategory,
  User,
  UserTier,
  ProjectRecord,
  ProjectSummary,
  HistoricalScanItem
} from '@weblens/shared';
import crypto from 'crypto';

export class ScanRepository {
  private db: DatabaseSync;

  constructor(db?: DatabaseSync) {
    this.db = db || getDatabase();
  }

  // --- Users & Authentication ---
  createUser(userData: {
    email: string;
    passwordHash: string;
    name: string;
    tier?: UserTier;
    avatarUrl?: string | null;
  }): User {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const tier = userData.tier || 'free';

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash, name, tier, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, userData.email.toLowerCase(), userData.passwordHash, userData.name, tier, userData.avatarUrl || null, now);
    return this.getUserById(id)!;
  }

  getUserById(id: string): User | null {
    const stmt = this.db.prepare(`
      SELECT id, email, name, tier, avatar_url as avatarUrl, created_at as createdAt
      FROM users WHERE id = ?
    `);
    const row = stmt.get(id) as any;
    if (!row) return null;

    const scansToday = this.getUsageToday(row.id);
    const maxScans = row.tier === 'agency' ? 500 : row.tier === 'pro' ? 50 : 10;

    return {
      ...row,
      scansToday,
      maxScansPerDay: maxScans
    };
  }

  getUserByEmail(email: string): (User & { passwordHash: string }) | null {
    const stmt = this.db.prepare(`
      SELECT id, email, password_hash as passwordHash, name, tier, avatar_url as avatarUrl, created_at as createdAt
      FROM users WHERE email = ?
    `);
    const row = stmt.get(email.toLowerCase()) as any;
    if (!row) return null;

    const scansToday = this.getUsageToday(row.id);
    const maxScans = row.tier === 'agency' ? 500 : row.tier === 'pro' ? 50 : 10;

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      name: row.name,
      tier: row.tier,
      avatarUrl: row.avatarUrl,
      createdAt: row.createdAt,
      scansToday,
      maxScansPerDay: maxScans
    };
  }

  // --- Password Reset ---
  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: string): void {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, used, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `);
    stmt.run(id, userId, tokenHash, expiresAt, now);
  }

  verifyPasswordResetToken(tokenHash: string): { userId: string } | null {
    const stmt = this.db.prepare(`
      SELECT user_id as userId, expires_at as expiresAt, used
      FROM password_reset_tokens
      WHERE token_hash = ?
    `);
    const row = stmt.get(tokenHash) as { userId: string; expiresAt: string; used: number } | undefined;
    if (!row || row.used === 1) return null;

    if (new Date().getTime() > new Date(row.expiresAt).getTime()) {
      return null; // expired
    }

    return { userId: row.userId };
  }

  markPasswordResetTokenUsed(tokenHash: string): void {
    const stmt = this.db.prepare(`UPDATE password_reset_tokens SET used = 1 WHERE token_hash = ?`);
    stmt.run(tokenHash);
  }

  updatePassword(userId: string, newPasswordHash: string): void {
    const stmt = this.db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`);
    stmt.run(newPasswordHash, userId);
  }

  // --- Projects System ---
  createProject(userId: string, name: string, domain: string, description?: string): ProjectRecord {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO projects (id, user_id, name, domain, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, name, domain.toLowerCase(), description || null, now, now);

    return {
      id,
      userId,
      name,
      domain: domain.toLowerCase(),
      description: description || null,
      createdAt: now,
      updatedAt: now
    };
  }

  getProjectsByUserId(userId: string): ProjectSummary[] {
    const stmt = this.db.prepare(`
      SELECT id, user_id as userId, name, domain, description, created_at as createdAt, updated_at as updatedAt
      FROM projects WHERE user_id = ? ORDER BY created_at DESC
    `);
    const projects = stmt.all(userId) as ProjectRecord[];

    return projects.map((p) => {
      // Find latest scan for this domain or linked project
      const scansStmt = this.db.prepare(`
        SELECT id, domain, status, overall_score as overallScore, started_at as startedAt, completed_at as completedAt, created_at as createdAt
        FROM scans 
        WHERE (domain = ? OR id IN (SELECT scan_id FROM project_scans WHERE project_id = ?))
          AND status = 'completed'
        ORDER BY created_at DESC LIMIT 2
      `);
      const recentScans = scansStmt.all(p.domain, p.id) as any[];

      const totalScansStmt = this.db.prepare(`
        SELECT COUNT(*) as count FROM scans 
        WHERE domain = ? OR id IN (SELECT scan_id FROM project_scans WHERE project_id = ?)
      `);
      const totalScans = (totalScansStmt.get(p.domain, p.id) as any)?.count || 0;

      const latestScan = recentScans[0] || null;
      let scoreChange: number | null = null;
      if (recentScans.length >= 2 && recentScans[0].overallScore !== null && recentScans[1].overallScore !== null) {
        scoreChange = recentScans[0].overallScore - recentScans[1].overallScore;
      }

      return {
        ...p,
        totalScans,
        latestScore: latestScan?.overallScore ?? null,
        scoreChange,
        latestScan
      };
    });
  }

  getProjectById(id: string): ProjectRecord | null {
    const stmt = this.db.prepare(`
      SELECT id, user_id as userId, name, domain, description, created_at as createdAt, updated_at as updatedAt
      FROM projects WHERE id = ?
    `);
    return (stmt.get(id) as any) || null;
  }

  linkScanToProject(projectId: string, scanId: string): void {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO project_scans (id, project_id, scan_id, created_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, projectId, scanId, now);
  }

  // --- Scans CRUD ---
  createScan(scan: {
    id?: string;
    userId?: string | null;
    url: string;
    normalizedUrl: string;
    domain: string;
  }): ScanRecord {
    const id = scan.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO scans (id, user_id, url, normalized_url, domain, status, stage, progress, started_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      scan.userId || null,
      scan.url,
      scan.normalizedUrl,
      scan.domain,
      'queued',
      'connecting',
      0,
      now,
      now
    );

    return this.getScanById(id)!;
  }

  updateScanProgress(id: string, stage: ScanStage, progress: number): void {
    const stmt = this.db.prepare(`
      UPDATE scans 
      SET status = 'running', stage = ?, progress = ?
      WHERE id = ?
    `);
    stmt.run(stage, progress, id);
  }

  updateScanCompleted(id: string, overallScore: number, screenshotUrl?: string | null, mobileScreenshotUrl?: string | null): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE scans 
      SET status = 'completed', stage = 'completed', progress = 100, overall_score = ?, screenshot_url = ?, mobile_screenshot_url = ?, completed_at = ?
      WHERE id = ?
    `);
    stmt.run(overallScore, screenshotUrl || null, mobileScreenshotUrl || null, now, id);
  }

  updateScanFailed(id: string, errorMessage: string, status: ScanStatus = 'failed'): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE scans 
      SET status = ?, error_message = ?, completed_at = ?
      WHERE id = ?
    `);
    stmt.run(status, errorMessage, now, id);
  }

  getScanById(id: string): ScanRecord | null {
    const stmt = this.db.prepare(`
      SELECT 
        id, 
        user_id as userId, 
        url, 
        normalized_url as normalizedUrl, 
        domain, 
        status, 
        overall_score as overallScore, 
        stage, 
        progress, 
        screenshot_url as screenshotUrl, 
        mobile_screenshot_url as mobileScreenshotUrl,
        error_message as errorMessage, 
        started_at as startedAt, 
        completed_at as completedAt, 
        created_at as createdAt
      FROM scans 
      WHERE id = ?
    `);
    const row = stmt.get(id) as any;
    return row || null;
  }

  getRecentScans(limit: number = 15, userId?: string | null): HistoricalScanItem[] {
    let sql = `
      SELECT 
        id, 
        user_id as userId, 
        url, 
        normalized_url as normalizedUrl, 
        domain, 
        status, 
        overall_score as overallScore, 
        stage, 
        progress, 
        screenshot_url as screenshotUrl, 
        mobile_screenshot_url as mobileScreenshotUrl,
        error_message as errorMessage, 
        started_at as startedAt, 
        completed_at as completedAt, 
        created_at as createdAt
      FROM scans 
    `;
    const params: any[] = [];
    if (userId) {
      sql += ` WHERE user_id = ? `;
      params.push(userId);
    }
    sql += ` ORDER BY created_at DESC LIMIT ? `;
    params.push(limit);

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as HistoricalScanItem[];

    // Calculate delta changes against preceding scan for same domain
    return rows.map((r, i) => {
      let scoreChange: number | null = null;
      // Look for previous scan of same domain
      const prev = rows.slice(i + 1).find((other) => other.domain === r.domain && other.overallScore !== null);
      if (prev && r.overallScore !== null && prev.overallScore !== null) {
        scoreChange = r.overallScore - prev.overallScore;
      }
      return { ...r, scoreChange };
    });
  }

  getScansByDomain(domain: string, limit: number = 10): ScanRecord[] {
    const stmt = this.db.prepare(`
      SELECT 
        id, 
        user_id as userId, 
        url, 
        normalized_url as normalizedUrl, 
        domain, 
        status, 
        overall_score as overallScore, 
        stage, 
        progress, 
        screenshot_url as screenshotUrl, 
        mobile_screenshot_url as mobileScreenshotUrl,
        error_message as errorMessage, 
        started_at as startedAt, 
        completed_at as completedAt, 
        created_at as createdAt
      FROM scans 
      WHERE domain = ? AND status = 'completed'
      ORDER BY created_at DESC LIMIT ?
    `);
    return stmt.all(domain.toLowerCase(), limit) as any;
  }

  // --- Category Scores ---
  saveCategoryScores(scores: CategoryScore[]): void {
    const insert = this.db.prepare(`
      INSERT INTO category_scores (
        id, scan_id, category, score, rating, 
        critical_count, high_count, medium_count, low_count, passed_count, weight, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    for (const s of scores) {
      insert.run(
        s.id || crypto.randomUUID(),
        s.scanId,
        s.category,
        s.score,
        s.rating,
        s.issuesCount.critical,
        s.issuesCount.high,
        s.issuesCount.medium,
        s.issuesCount.low,
        s.issuesCount.passed,
        s.weight,
        s.createdAt || now
      );
    }
  }

  getCategoryScoresByScanId(scanId: string): CategoryScore[] {
    const stmt = this.db.prepare(`
      SELECT 
        id, 
        scan_id as scanId, 
        category, 
        score, 
        rating, 
        critical_count as criticalCount, 
        high_count as highCount, 
        medium_count as mediumCount, 
        low_count as lowCount, 
        passed_count as passedCount, 
        weight, 
        created_at as createdAt
      FROM category_scores 
      WHERE scan_id = ?
    `);
    const rows = stmt.all(scanId) as Array<{
      id: string;
      scanId: string;
      category: AuditCategory;
      score: number;
      rating: 'excellent' | 'good' | 'needs_improvement' | 'poor';
      criticalCount: number;
      highCount: number;
      mediumCount: number;
      lowCount: number;
      passedCount: number;
      weight: number;
      createdAt: string;
    }>;

    return rows.map(r => ({
      id: r.id,
      scanId: r.scanId,
      category: r.category,
      score: r.score,
      rating: r.rating,
      weight: r.weight,
      issuesCount: {
        critical: r.criticalCount,
        high: r.highCount,
        medium: r.mediumCount,
        low: r.lowCount,
        passed: r.passedCount
      },
      createdAt: r.createdAt
    }));
  }

  // --- Audit Results ---
  saveAuditResults(results: AuditResult[]): void {
    const insert = this.db.prepare(`
      INSERT INTO audit_results (
        id, scan_id, category, rule_id, severity, title, 
        description, impact, recommendation, technical_details, 
        location, passed, score_impact, fix_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    for (const r of results) {
      insert.run(
        r.id || crypto.randomUUID(),
        r.scanId,
        r.category,
        r.ruleId,
        r.severity,
        r.title,
        r.description,
        r.impact,
        r.recommendation,
        r.technicalDetails || null,
        r.location || null,
        r.passed ? 1 : 0,
        r.scoreImpact,
        r.fixStatus || 'not_fixed',
        r.createdAt || now
      );
    }
  }

  getAuditResultsByScanId(scanId: string, category?: AuditCategory): AuditResult[] {
    let sql = `
      SELECT 
        id, 
        scan_id as scanId, 
        category, 
        rule_id as ruleId, 
        severity, 
        title, 
        description, 
        impact, 
        recommendation, 
        technical_details as technicalDetails, 
        location, 
        passed, 
        score_impact as scoreImpact, 
        fix_status as fixStatus, 
        created_at as createdAt
      FROM audit_results 
      WHERE scan_id = ?
    `;
    const params: (string | number)[] = [scanId];

    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }

    sql += ` ORDER BY CASE severity 
              WHEN 'critical' THEN 1 
              WHEN 'high' THEN 2 
              WHEN 'medium' THEN 3 
              WHEN 'low' THEN 4 
              ELSE 5 END`;

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as any[];
    return rows.map(r => ({
      id: r.id,
      scanId: r.scanId,
      category: r.category,
      ruleId: r.ruleId,
      severity: r.severity,
      title: r.title,
      description: r.description,
      impact: r.impact,
      recommendation: r.recommendation,
      technicalDetails: r.technicalDetails,
      location: r.location,
      passed: Boolean(r.passed),
      scoreImpact: r.scoreImpact,
      fixStatus: r.fixStatus,
      createdAt: r.createdAt
    }));
  }

  // --- Resources ---
  saveResources(resources: ResourceRecord[]): void {
    const insert = this.db.prepare(`
      INSERT INTO resources (
        id, scan_id, url, resource_type, size_bytes, 
        load_time_ms, status_code, mime_type, is_compressed, is_cached, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();
    for (const res of resources) {
      insert.run(
        res.id || crypto.randomUUID(),
        res.scanId,
        res.url,
        res.resourceType,
        res.sizeBytes,
        res.loadTimeMs,
        res.statusCode,
        res.mimeType || null,
        res.isCompressed ? 1 : 0,
        res.isCached ? 1 : 0,
        res.createdAt || now
      );
    }
  }

  getResourcesByScanId(scanId: string): ResourceRecord[] {
    const stmt = this.db.prepare(`
      SELECT 
        id, 
        scan_id as scanId, 
        url, 
        resource_type as resourceType, 
        size_bytes as sizeBytes, 
        load_time_ms as loadTimeMs, 
        status_code as statusCode, 
        mime_type as mimeType, 
        is_compressed as isCompressed, 
        is_cached as isCached, 
        created_at as createdAt
      FROM resources 
      WHERE scan_id = ?
      ORDER BY size_bytes DESC
    `);
    const rows = stmt.all(scanId) as any[];
    return rows.map(r => ({
      id: r.id,
      scanId: r.scanId,
      url: r.url,
      resourceType: r.resourceType,
      sizeBytes: r.sizeBytes,
      loadTimeMs: r.loadTimeMs,
      statusCode: r.statusCode,
      mimeType: r.mimeType,
      isCompressed: Boolean(r.isCompressed),
      isCached: Boolean(r.isCached),
      createdAt: r.createdAt
    }));
  }

  // --- Reports (Sharing) ---
  createShareReport(scanId: string, visibility: 'public' | 'private' = 'public', expiresDays?: number): { shareToken: string; id: string } {
    const existing = this.db.prepare(`SELECT id, share_token as shareToken FROM reports WHERE scan_id = ?`).get(scanId) as { id: string; shareToken: string } | undefined;
    if (existing) {
      return existing;
    }

    const id = crypto.randomUUID();
    const shareToken = crypto.randomBytes(6).toString('hex');
    const now = new Date();
    const expiresAt = expiresDays ? new Date(now.getTime() + expiresDays * 86400000).toISOString() : null;

    const stmt = this.db.prepare(`
      INSERT INTO reports (id, scan_id, share_token, visibility, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, scanId, shareToken, visibility, now.toISOString(), expiresAt);

    return { id, shareToken };
  }

  getScanIdByShareToken(shareToken: string): string | null {
    const stmt = this.db.prepare(`SELECT scan_id as scanId, expires_at as expiresAt FROM reports WHERE share_token = ?`);
    const row = stmt.get(shareToken) as { scanId: string; expiresAt?: string | null } | undefined;
    if (!row) return null;

    if (row.expiresAt) {
      const expiration = new Date(row.expiresAt).getTime();
      if (Date.now() > expiration) return null; // expired
    }

    return row.scanId;
  }

  // --- Daily Usage Limits & Rate-Limiting ---
  getUsageToday(identifier: string): number {
    const today = new Date().toISOString().split('T')[0];
    const stmt = this.db.prepare(`SELECT count FROM usage_records WHERE identifier = ? AND date = ?`);
    const row = stmt.get(identifier, today) as { count: number } | undefined;
    return row ? row.count : 0;
  }

  incrementUsage(identifier: string): number {
    const today = new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO usage_records (id, identifier, date, count)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(identifier, date) DO UPDATE SET count = count + 1
    `);
    stmt.run(id, identifier, today);
    return this.getUsageToday(identifier);
  }

  // ==========================================
  // PHASE 4: MONITORING & ALERTS
  // ==========================================

  createMonitoredSite(data: {
    userId: string;
    projectId?: string | null;
    url: string;
    domain: string;
    frequency: 'daily' | 'weekly' | 'monthly';
  }): any {
    const id = crypto.randomUUID();
    const now = new Date();
    const nextScan = new Date(now.getTime() + (data.frequency === 'monthly' ? 30 : data.frequency === 'weekly' ? 7 : 1) * 86400000);

    const stmt = this.db.prepare(`
      INSERT INTO monitored_sites (id, user_id, project_id, url, domain, frequency, next_scan_at, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `);
    stmt.run(id, data.userId, data.projectId || null, data.url, data.domain.toLowerCase(), data.frequency, nextScan.toISOString(), now.toISOString(), now.toISOString());

    return this.getMonitoredSiteById(id);
  }

  getMonitoredSiteById(id: string): any {
    const stmt = this.db.prepare(`
      SELECT 
        id, user_id as userId, project_id as projectId, url, domain, frequency,
        last_scan_id as lastScanId, last_score as lastScore, last_scanned_at as lastScannedAt,
        next_scan_at as nextScanAt, status, created_at as createdAt, updated_at as updatedAt
      FROM monitored_sites WHERE id = ?
    `);
    return stmt.get(id) || null;
  }

  getMonitoredSites(userId: string): any[] {
    const stmt = this.db.prepare(`
      SELECT 
        id, user_id as userId, project_id as projectId, url, domain, frequency,
        last_scan_id as lastScanId, last_score as lastScore, last_scanned_at as lastScannedAt,
        next_scan_at as nextScanAt, status, created_at as createdAt, updated_at as updatedAt
      FROM monitored_sites WHERE user_id = ? ORDER BY created_at DESC
    `);
    return stmt.all(userId) as any[];
  }

  getDueMonitoredSites(): any[] {
    const nowIso = new Date().toISOString();
    const stmt = this.db.prepare(`
      SELECT 
        id, user_id as userId, project_id as projectId, url, domain, frequency,
        last_scan_id as lastScanId, last_score as lastScore, last_scanned_at as lastScannedAt,
        next_scan_at as nextScanAt, status, created_at as createdAt, updated_at as updatedAt
      FROM monitored_sites 
      WHERE status = 'active' AND next_scan_at <= ?
      LIMIT 10
    `);
    return stmt.all(nowIso) as any[];
  }

  updateMonitoredSiteScan(id: string, scanId: string, score: number, frequency: 'daily' | 'weekly' | 'monthly'): void {
    const now = new Date();
    const nextScan = new Date(now.getTime() + (frequency === 'monthly' ? 30 : frequency === 'weekly' ? 7 : 1) * 86400000);
    const stmt = this.db.prepare(`
      UPDATE monitored_sites 
      SET last_scan_id = ?, last_score = ?, last_scanned_at = ?, next_scan_at = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(scanId, score, now.toISOString(), nextScan.toISOString(), now.toISOString(), id);
  }

  deleteMonitoredSite(id: string, userId: string): void {
    const stmt = this.db.prepare(`DELETE FROM monitored_sites WHERE id = ? AND user_id = ?`);
    stmt.run(id, userId);
  }

  // --- Alerts & Webhooks ---
  createAlert(data: {
    userId: string;
    siteId?: string | null;
    scanId: string;
    severity: string;
    title: string;
    message: string;
    channel: string;
  }): any {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO alerts (id, user_id, site_id, scan_id, severity, title, message, channel, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.userId, data.siteId || null, data.scanId, data.severity, data.title, data.message, data.channel, now);
    return { id, ...data, sentAt: now };
  }

  getAlertsByUserId(userId: string, limit: number = 20): any[] {
    const stmt = this.db.prepare(`
      SELECT id, user_id as userId, site_id as siteId, scan_id as scanId, severity, title, message, channel, sent_at as sentAt
      FROM alerts WHERE user_id = ? ORDER BY sent_at DESC LIMIT ?
    `);
    return stmt.all(userId, limit) as any[];
  }

  createWebhook(userId: string, name: string, type: string, url: string): any {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO webhook_destinations (id, user_id, name, type, url, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);
    stmt.run(id, userId, name, type, url, now);
    return { id, userId, name, type, url, isActive: true, createdAt: now };
  }

  getWebhooksByUserId(userId: string): any[] {
    const stmt = this.db.prepare(`
      SELECT id, user_id as userId, name, type, url, is_active as isActive, created_at as createdAt
      FROM webhook_destinations WHERE user_id = ? ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId) as any[];
    return rows.map(r => ({ ...r, isActive: Boolean(r.isActive) }));
  }

  deleteWebhook(id: string, userId: string): void {
    const stmt = this.db.prepare(`DELETE FROM webhook_destinations WHERE id = ? AND user_id = ?`);
    stmt.run(id, userId);
  }

  // ==========================================
  // PHASE 4: DEVELOPER API KEYS
  // ==========================================

  createApiKey(userId: string, name: string): { id: string; name: string; apiKey: string; keyPrefix: string; createdAt: string } {
    const id = crypto.randomUUID();
    const rawSecret = crypto.randomBytes(24).toString('hex');
    const apiKey = `weblens_sk_${rawSecret}`;
    const keyPrefix = apiKey.substring(0, 16) + '...';
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO api_keys (id, user_id, name, key_hash, key_prefix, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, name, keyHash, keyPrefix, now);

    return { id, name, apiKey, keyPrefix, createdAt: now };
  }

  getApiKeysByUserId(userId: string): any[] {
    const stmt = this.db.prepare(`
      SELECT id, user_id as userId, name, key_prefix as keyPrefix, last_used_at as lastUsedAt, created_at as createdAt
      FROM api_keys WHERE user_id = ? ORDER BY created_at DESC
    `);
    return stmt.all(userId) as any[];
  }

  verifyApiKey(rawApiKey: string): { userId: string; name: string } | null {
    if (!rawApiKey || !rawApiKey.startsWith('weblens_sk_')) return null;
    const keyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');
    const stmt = this.db.prepare(`
      SELECT id, user_id as userId, name
      FROM api_keys WHERE key_hash = ?
    `);
    const row = stmt.get(keyHash) as any;
    if (!row) return null;

    // Update last used timestamp
    const now = new Date().toISOString();
    this.db.prepare(`UPDATE api_keys SET last_used_at = ? WHERE id = ?`).run(now, row.id);
    return { userId: row.userId, name: row.name };
  }

  deleteApiKey(id: string, userId: string): void {
    const stmt = this.db.prepare(`DELETE FROM api_keys WHERE id = ? AND user_id = ?`);
    stmt.run(id, userId);
  }

  // ==========================================
  // PHASE 4: TEAMS, CLIENTS & WHITE-LABEL
  // ==========================================

  createTeam(ownerId: string, name: string): any {
    const id = crypto.randomUUID();
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + crypto.randomBytes(3).toString('hex');
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO teams (id, name, slug, owner_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, slug, ownerId, now);

    // Add owner as owner member
    const memberStmt = this.db.prepare(`
      INSERT INTO team_members (id, team_id, user_id, role, joined_at)
      VALUES (?, ?, ?, 'owner', ?)
    `);
    memberStmt.run(crypto.randomUUID(), id, ownerId, now);

    return { id, name, slug, ownerId, createdAt: now };
  }

  getTeamByUserId(userId: string): any | null {
    const stmt = this.db.prepare(`
      SELECT t.id, t.name, t.slug, t.owner_id as ownerId, t.created_at as createdAt
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = ?
      LIMIT 1
    `);
    return stmt.get(userId) || null;
  }

  getTeamMembers(teamId: string): any[] {
    const stmt = this.db.prepare(`
      SELECT tm.id, tm.team_id as teamId, tm.user_id as userId, u.email, u.name, tm.role, tm.joined_at as joinedAt
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = ?
      ORDER BY tm.joined_at ASC
    `);
    return stmt.all(teamId) as any[];
  }

  addTeamMember(teamId: string, userId: string, role: string = 'member'): void {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO team_members (id, team_id, user_id, role, joined_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, teamId, userId, role, now);
  }

  removeTeamMember(teamId: string, memberUserId: string): void {
    const stmt = this.db.prepare(`DELETE FROM team_members WHERE team_id = ? AND user_id = ? AND role != 'owner'`);
    stmt.run(teamId, memberUserId);
  }

  saveAgencySettings(userId: string, data: {
    brandName: string;
    logoUrl?: string | null;
    primaryColor?: string;
    accentColor?: string;
    footerText?: string | null;
    companyWebsite?: string | null;
    customDomain?: string | null;
  }): any {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO agency_settings (
        id, user_id, brand_name, logo_url, primary_color, accent_color,
        footer_text, company_website, custom_domain, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        brand_name = excluded.brand_name,
        logo_url = excluded.logo_url,
        primary_color = excluded.primary_color,
        accent_color = excluded.accent_color,
        footer_text = excluded.footer_text,
        company_website = excluded.company_website,
        custom_domain = excluded.custom_domain,
        updated_at = excluded.updated_at
    `);
    stmt.run(
      id, userId, data.brandName, data.logoUrl || null,
      data.primaryColor || '#3B82F6', data.accentColor || '#10B981',
      data.footerText || null, data.companyWebsite || null,
      data.customDomain || null, now
    );
    return this.getAgencySettings(userId);
  }

  getAgencySettings(userId: string): any | null {
    const stmt = this.db.prepare(`
      SELECT 
        id, user_id as userId, team_id as teamId, brand_name as brandName,
        logo_url as logoUrl, primary_color as primaryColor, accent_color as accentColor,
        footer_text as footerText, company_website as companyWebsite,
        custom_domain as customDomain, updated_at as updatedAt
      FROM agency_settings WHERE user_id = ?
    `);
    return stmt.get(userId) || null;
  }

  createClient(userId: string, data: { clientName: string; contactEmail?: string | null; domain: string; notes?: string | null }): any {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO clients (id, user_id, client_name, contact_email, domain, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, data.clientName, data.contactEmail || null, data.domain.toLowerCase(), data.notes || null, now);
    return { id, userId, ...data, createdAt: now };
  }

  getClientsByUserId(userId: string): any[] {
    const stmt = this.db.prepare(`
      SELECT id, user_id as userId, client_name as clientName, contact_email as contactEmail, domain, notes, created_at as createdAt
      FROM clients WHERE user_id = ? ORDER BY created_at DESC
    `);
    return stmt.all(userId) as any[];
  }

  deleteClient(id: string, userId: string): void {
    const stmt = this.db.prepare(`DELETE FROM clients WHERE id = ? AND user_id = ?`);
    stmt.run(id, userId);
  }

  // ==========================================
  // PHASE 4: ADMIN OBSERVABILITY & METRICS
  // ==========================================

  getAdminSystemStats(): any {
    const totalScans = (this.db.prepare(`SELECT COUNT(*) as count FROM scans`).get() as any)?.count || 0;
    const completedScans = (this.db.prepare(`SELECT COUNT(*) as count FROM scans WHERE status = 'completed'`).get() as any)?.count || 0;
    const failedScans = (this.db.prepare(`SELECT COUNT(*) as count FROM scans WHERE status = 'failed'`).get() as any)?.count || 0;
    const avgScore = (this.db.prepare(`SELECT AVG(overall_score) as avg FROM scans WHERE status = 'completed' AND overall_score IS NOT NULL`).get() as any)?.avg || 0;
    const totalUsers = (this.db.prepare(`SELECT COUNT(*) as count FROM users`).get() as any)?.count || 0;
    const totalProjects = (this.db.prepare(`SELECT COUNT(*) as count FROM projects`).get() as any)?.count || 0;
    const activeMonitors = (this.db.prepare(`SELECT COUNT(*) as count FROM monitored_sites WHERE status = 'active'`).get() as any)?.count || 0;

    return {
      totalScans,
      completedScans,
      failedScans,
      successRatePercent: totalScans > 0 ? Math.round((completedScans / totalScans) * 100) : 100,
      averageScore: Math.round(avgScore),
      totalUsers,
      totalProjects,
      activeMonitors,
      avgDurationMs: 4200
    };
  }

  getRecentFailureLogs(limit: number = 25): any[] {
    const stmt = this.db.prepare(`
      SELECT id as scanId, url, domain, error_message as errorMessage, completed_at as occurredAt
      FROM scans 
      WHERE status = 'failed' 
      ORDER BY created_at DESC LIMIT ?
    `);
    const rows = stmt.all(limit) as any[];
    return rows.map(r => {
      let category: 'dns' | 'ssrf' | 'timeout' | 'network' | 'unknown' = 'unknown';
      const msg = (r.errorMessage || '').toLowerCase();
      if (msg.includes('dns') || msg.includes('getaddrinfo')) category = 'dns';
      else if (msg.includes('ssrf') || msg.includes('restricted') || msg.includes('port')) category = 'ssrf';
      else if (msg.includes('timeout') || msg.includes('timed out')) category = 'timeout';
      else if (msg.includes('network') || msg.includes('econnrefused')) category = 'network';
      return { ...r, category, occurredAt: r.occurredAt || new Date().toISOString() };
    });
  }

  getAllUsersSummary(limit: number = 50): any[] {
    const stmt = this.db.prepare(`
      SELECT u.id, u.email, u.name, u.tier, u.created_at as createdAt,
             COUNT(s.id) as scanCount
      FROM users u
      LEFT JOIN scans s ON u.id = s.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC LIMIT ?
    `);
    return stmt.all(limit) as any[];
  }

  // ==========================================
  // USER PROFILE, STATS & ACTIVITY
  // ==========================================

  getUserProfileStats(userId: string): any {
    const totalScans = (this.db.prepare(`SELECT COUNT(*) as count FROM scans WHERE user_id = ?`).get(userId) as any)?.count || 0;
    const completedScans = (this.db.prepare(`SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND status = 'completed'`).get(userId) as any)?.count || 0;
    const failedScans = (this.db.prepare(`SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND status = 'failed'`).get(userId) as any)?.count || 0;
    const avgScore = (this.db.prepare(`SELECT AVG(overall_score) as avg FROM scans WHERE user_id = ? AND status = 'completed' AND overall_score IS NOT NULL`).get(userId) as any)?.avg || 0;
    const highestScore = (this.db.prepare(`SELECT MAX(overall_score) as max FROM scans WHERE user_id = ? AND status = 'completed' AND overall_score IS NOT NULL`).get(userId) as any)?.max || 0;
    const lowestScore = (this.db.prepare(`SELECT MIN(overall_score) as min FROM scans WHERE user_id = ? AND status = 'completed' AND overall_score IS NOT NULL`).get(userId) as any)?.min || 0;
    const uniqueDomains = (this.db.prepare(`SELECT COUNT(DISTINCT domain) as count FROM scans WHERE user_id = ?`).get(userId) as any)?.count || 0;
    const projectsCount = (this.db.prepare(`SELECT COUNT(*) as count FROM projects WHERE user_id = ?`).get(userId) as any)?.count || 0;
    const monitorsCount = (this.db.prepare(`SELECT COUNT(*) as count FROM monitored_sites WHERE user_id = ?`).get(userId) as any)?.count || 0;
    const apiKeysCount = (this.db.prepare(`SELECT COUNT(*) as count FROM api_keys WHERE user_id = ?`).get(userId) as any)?.count || 0;
    const savedReportsCount = (this.db.prepare(`SELECT COUNT(*) as count FROM reports r JOIN scans s ON r.scan_id = s.id WHERE s.user_id = ?`).get(userId) as any)?.count || 0;
    const scansToday = this.getUsageToday(userId);

    // Month and week calculations
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const scansThisWeek = (this.db.prepare(`SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND created_at >= ?`).get(userId, oneWeekAgo) as any)?.count || 0;
    const scansThisMonth = (this.db.prepare(`SELECT COUNT(*) as count FROM scans WHERE user_id = ? AND created_at >= ?`).get(userId, startOfMonth) as any)?.count || 0;

    return {
      totalScans,
      completedScans,
      failedScans,
      scansToday,
      scansThisWeek,
      scansThisMonth,
      averageScore: Math.round(avgScore),
      highestScore: highestScore > 0 ? highestScore : 0,
      lowestScore: lowestScore > 0 ? lowestScore : 0,
      uniqueDomains,
      projectsCount,
      monitorsCount,
      apiKeysCount,
      savedReportsCount
    };
  }

  getUserRecentActivity(userId: string, limit: number = 15): any[] {
    const activities: any[] = [];

    // 1. Scans run by user
    const scansStmt = this.db.prepare(`
      SELECT id, domain, status, overall_score as overallScore, created_at as timestamp
      FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
    `);
    const userScans = scansStmt.all(userId) as any[];
    userScans.forEach((s) => {
      activities.push({
        id: `act_scan_${s.id}`,
        type: 'scan',
        title: `Audited website ${s.domain}`,
        detail: s.status === 'completed' && s.overallScore !== null ? `Completed with health score ${s.overallScore}/100` : `Status: ${s.status}`,
        timestamp: s.timestamp,
        link: `/report/${s.id}`
      });
    });

    // 2. Projects created by user
    const projStmt = this.db.prepare(`
      SELECT id, name, domain, created_at as timestamp
      FROM projects WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    `);
    const userProjs = projStmt.all(userId) as any[];
    userProjs.forEach((p) => {
      activities.push({
        id: `act_proj_${p.id}`,
        type: 'project',
        title: `Created Project Workspace "${p.name}"`,
        detail: `Target domain: ${p.domain}`,
        timestamp: p.timestamp,
        link: `/projects`
      });
    });

    // 3. Monitored sites
    const monStmt = this.db.prepare(`
      SELECT id, domain, frequency, created_at as timestamp
      FROM monitored_sites WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    `);
    const userMons = monStmt.all(userId) as any[];
    userMons.forEach((m) => {
      activities.push({
        id: `act_mon_${m.id}`,
        type: 'monitor',
        title: `Configured Continuous Monitoring for ${m.domain}`,
        detail: `Scheduled frequency: ${m.frequency}`,
        timestamp: m.timestamp,
        link: `/monitoring`
      });
    });

    // Sort chronologically descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, limit);
  }

  updateUserProfile(userId: string, data: { name?: string; email?: string }): void {
    if (data.name && data.email) {
      this.db.prepare(`UPDATE users SET name = ?, email = ? WHERE id = ?`).run(data.name, data.email.toLowerCase(), userId);
    } else if (data.name) {
      this.db.prepare(`UPDATE users SET name = ? WHERE id = ?`).run(data.name, userId);
    } else if (data.email) {
      this.db.prepare(`UPDATE users SET email = ? WHERE id = ?`).run(data.email.toLowerCase(), userId);
    }
  }

  updateUserTier(userId: string, tier: UserTier): void {
    this.db.prepare(`UPDATE users SET tier = ? WHERE id = ?`).run(tier, userId);
  }

  deleteUserAccount(userId: string): void {
    // Delete in sequence respecting dependencies
    this.db.prepare(`DELETE FROM project_scans WHERE project_id IN (SELECT id FROM projects WHERE user_id = ?)`).run(userId);
    this.db.prepare(`DELETE FROM projects WHERE user_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM monitored_sites WHERE user_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM alerts WHERE user_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM webhook_destinations WHERE user_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM api_keys WHERE user_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM team_members WHERE user_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM teams WHERE owner_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM clients WHERE user_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM agency_settings WHERE user_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM audit_results WHERE scan_id IN (SELECT id FROM scans WHERE user_id = ?)`).run(userId);
    this.db.prepare(`DELETE FROM category_scores WHERE scan_id IN (SELECT id FROM scans WHERE user_id = ?)`).run(userId);
    this.db.prepare(`DELETE FROM resources WHERE scan_id IN (SELECT id FROM scans WHERE user_id = ?)`).run(userId);
    this.db.prepare(`DELETE FROM reports WHERE scan_id IN (SELECT id FROM scans WHERE user_id = ?)`).run(userId);
    this.db.prepare(`DELETE FROM scans WHERE user_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM password_reset_tokens WHERE user_id = ?`).run(userId);
    this.db.prepare(`DELETE FROM usage_records WHERE identifier = ?`).run(userId);
    this.db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
  }
}

