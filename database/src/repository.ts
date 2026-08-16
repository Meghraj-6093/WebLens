import { DatabaseSync } from 'node:sqlite';
import { getDatabase } from './db.js';
import { 
  ScanRecord, 
  ScanStatus, 
  ScanStage, 
  AuditResult, 
  CategoryScore, 
  ResourceRecord, 
  AuditCategory 
} from '@weblens/shared';
import crypto from 'crypto';

export class ScanRepository {
  private db: DatabaseSync;

  constructor(db?: DatabaseSync) {
    this.db = db || getDatabase();
  }

  // --- Scans ---
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

  updateScanCompleted(id: string, overallScore: number, screenshotUrl?: string | null): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE scans 
      SET status = 'completed', stage = 'completed', progress = 100, overall_score = ?, screenshot_url = ?, completed_at = ?
      WHERE id = ?
    `);
    stmt.run(overallScore, screenshotUrl || null, now, id);
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

  getRecentScans(limit: number = 10): ScanRecord[] {
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
        error_message as errorMessage, 
        started_at as startedAt, 
        completed_at as completedAt, 
        created_at as createdAt
      FROM scans 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(limit) as any;
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
  createShareReport(scanId: string, visibility: 'public' | 'private' = 'public'): { shareToken: string; id: string } {
    const existing = this.db.prepare(`SELECT id, share_token as shareToken FROM reports WHERE scan_id = ?`).get(scanId) as { id: string; shareToken: string } | undefined;
    if (existing) {
      return existing;
    }

    const id = crypto.randomUUID();
    const shareToken = crypto.randomBytes(6).toString('hex');
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO reports (id, scan_id, share_token, visibility, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, scanId, shareToken, visibility, now);

    return { id, shareToken };
  }

  getScanIdByShareToken(shareToken: string): string | null {
    const stmt = this.db.prepare(`SELECT scan_id as scanId FROM reports WHERE share_token = ?`);
    const row = stmt.get(shareToken) as { scanId: string } | undefined;
    return row ? row.scanId : null;
  }
}
