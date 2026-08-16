import { EventEmitter } from 'events';
import { 
  ScanRecord, 
  ScanStatus, 
  ScanStage, 
  FullScanReport, 
  AuditCategory,
  CreateScanResponse,
  ScanStatusResponse
} from '@weblens/shared';
import { ScanRepository } from '@weblens/database';
import { 
  ScanOrchestrator, 
  normalizeTargetUrl, 
  validateUrlAgainstSSRF,
  ScanStageUpdate 
} from '@weblens/scanner';

export class ScanService extends EventEmitter {
  private repo: ScanRepository;
  private orchestrator: ScanOrchestrator;
  private activeStreams: Map<string, Set<(data: any) => void>>;

  constructor(repo?: ScanRepository) {
    super();
    this.repo = repo || new ScanRepository();
    this.orchestrator = new ScanOrchestrator();
    this.activeStreams = new Map();
  }

  async startScan(rawUrl: string, userId?: string | null): Promise<CreateScanResponse> {
    // 1. URL Normalization
    const norm = normalizeTargetUrl(rawUrl);
    if (!norm.isValid) {
      throw new Error(norm.error || 'Invalid URL provided.');
    }

    // 2. SSRF Pre-validation
    const ssrf = await validateUrlAgainstSSRF(norm.normalizedUrl);
    if (!ssrf.isValid) {
      throw new Error(ssrf.error || 'The requested URL is not accessible.');
    }

    // 3. Create Scan Record in DB (queued status)
    const scan = this.repo.createScan({
      userId,
      url: rawUrl,
      normalizedUrl: norm.normalizedUrl,
      domain: norm.domain,
    });

    // 4. Kick off async scan in background worker
    this.runScanJob(scan).catch((err) => {
      console.error(`[ScanWorker Error] ${scan.id}:`, err);
    });

    return {
      scanId: scan.id,
      url: scan.normalizedUrl,
      domain: scan.domain,
      status: 'queued',
      message: 'Scan has been queued and processing started.'
    };
  }

  private async runScanJob(scan: ScanRecord): Promise<void> {
    const scanId = scan.id;

    try {
      this.repo.updateScanProgress(scanId, 'connecting', 5);
      this.broadcast(scanId, {
        scanId,
        stage: 'connecting',
        progress: 5,
        message: 'Initializing scan worker...'
      });

      // Run orchestrator with real-time stage updates
      const report: FullScanReport = await this.orchestrator.executeScan(scan, (update: ScanStageUpdate) => {
        this.repo.updateScanProgress(scanId, update.stage, update.progress);
        this.broadcast(scanId, {
          scanId,
          stage: update.stage,
          progress: update.progress,
          message: update.message
        });
      });

      // Persist results in DB
      const categoryScores = Object.values(report.overall.categoryScores);
      this.repo.saveCategoryScores(categoryScores);

      const allIssues = [
        ...report.categories.performance.issues,
        ...report.categories.seo.issues,
        ...report.categories.accessibility.issues,
        ...report.categories.security.issues,
        ...report.categories.mobile.issues,
        ...report.categories.best_practices.issues
      ];
      this.repo.saveAuditResults(allIssues);

      if (report.resources.length > 0) {
        this.repo.saveResources(report.resources);
      }

      this.repo.updateScanCompleted(scanId, report.overall.score, report.screenshotUrl);

      this.broadcast(scanId, {
        scanId,
        stage: 'completed',
        progress: 100,
        message: 'Audit complete!',
        completed: true,
        overallScore: report.overall.score
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Scan failed to complete.';
      this.repo.updateScanFailed(scanId, errorMsg);
      this.broadcast(scanId, {
        scanId,
        stage: 'completed',
        progress: 100,
        error: errorMsg,
        status: 'failed'
      });
    }
  }

  getScanStatus(scanId: string): ScanStatusResponse | null {
    const scan = this.repo.getScanById(scanId);
    if (!scan) return null;

    return {
      scanId: scan.id,
      status: scan.status,
      stage: scan.stage,
      progress: scan.progress,
      errorMessage: scan.errorMessage,
      overallScore: scan.overallScore,
      startedAt: scan.startedAt,
      completedAt: scan.completedAt
    };
  }

  getFullReport(scanId: string): FullScanReport | null {
    const scan = this.repo.getScanById(scanId);
    if (!scan) return null;

    const catScores = this.repo.getCategoryScoresByScanId(scanId);
    const auditResults = this.repo.getAuditResultsByScanId(scanId);
    const resources = this.repo.getResourcesByScanId(scanId);

    // Group issues by category
    const categorizedIssues: Record<AuditCategory, typeof auditResults> = {
      performance: [],
      seo: [],
      accessibility: [],
      security: [],
      mobile: [],
      best_practices: []
    };

    for (const res of auditResults) {
      if (categorizedIssues[res.category]) {
        categorizedIssues[res.category].push(res);
      }
    }

    const catScoreMap: any = {};
    for (const cs of catScores) {
      catScoreMap[cs.category] = cs;
    }

    // Compute resource breakdown
    const resourceBreakdown = {
      totalCount: resources.length,
      totalSizeBytes: resources.reduce((acc, r) => acc + (r.sizeBytes || 0), 0),
      totalLoadTimeMs: resources.reduce((acc, r) => Math.max(acc, r.loadTimeMs || 0), 0),
      byType: {
        document: { count: 0, sizeBytes: 0 },
        script: { count: 0, sizeBytes: 0 },
        stylesheet: { count: 0, sizeBytes: 0 },
        image: { count: 0, sizeBytes: 0 },
        font: { count: 0, sizeBytes: 0 },
        media: { count: 0, sizeBytes: 0 },
        fetch: { count: 0, sizeBytes: 0 },
        xhr: { count: 0, sizeBytes: 0 },
        other: { count: 0, sizeBytes: 0 }
      } as any
    };

    for (const r of resources) {
      const typeKey = r.resourceType in resourceBreakdown.byType ? r.resourceType : 'other';
      resourceBreakdown.byType[typeKey].count++;
      resourceBreakdown.byType[typeKey].sizeBytes += r.sizeBytes || 0;
    }

    // Build overall summary
    const overallScore = scan.overallScore || 0;
    let rating: 'excellent' | 'good' | 'needs_improvement' | 'poor' = 'poor';
    if (overallScore >= 90) rating = 'excellent';
    else if (overallScore >= 75) rating = 'good';
    else if (overallScore >= 50) rating = 'needs_improvement';

    const totalIssues = {
      critical: auditResults.filter(r => !r.passed && r.severity === 'critical').length,
      high: auditResults.filter(r => !r.passed && r.severity === 'high').length,
      medium: auditResults.filter(r => !r.passed && r.severity === 'medium').length,
      low: auditResults.filter(r => !r.passed && r.severity === 'low').length,
      passed: auditResults.filter(r => r.passed).length,
    };

    return {
      scan,
      overall: {
        score: overallScore,
        rating,
        summaryText: `Website audit completed with score ${overallScore}/100.`,
        categoryScores: catScoreMap,
        totalIssues
      },
      categories: {
        performance: {
          score: catScoreMap.performance?.score || 0,
          rating: catScoreMap.performance?.rating || 'poor',
          metrics: [],
          issues: categorizedIssues.performance
        },
        seo: {
          score: catScoreMap.seo?.score || 0,
          rating: catScoreMap.seo?.rating || 'poor',
          metrics: [],
          issues: categorizedIssues.seo
        },
        accessibility: {
          score: catScoreMap.accessibility?.score || 0,
          rating: catScoreMap.accessibility?.rating || 'poor',
          metrics: [],
          issues: categorizedIssues.accessibility
        },
        security: {
          score: catScoreMap.security?.score || 0,
          rating: catScoreMap.security?.rating || 'poor',
          metrics: [],
          issues: categorizedIssues.security
        },
        mobile: {
          score: catScoreMap.mobile?.score || 0,
          rating: catScoreMap.mobile?.rating || 'poor',
          metrics: [],
          issues: categorizedIssues.mobile
        },
        best_practices: {
          score: catScoreMap.best_practices?.score || 0,
          rating: catScoreMap.best_practices?.rating || 'poor',
          metrics: [],
          issues: categorizedIssues.best_practices
        }
      },
      resources,
      resourceBreakdown,
      screenshotUrl: scan.screenshotUrl
    };
  }

  // SSE Subscription
  subscribe(scanId: string, sendFn: (data: any) => void): () => void {
    if (!this.activeStreams.has(scanId)) {
      this.activeStreams.set(scanId, new Set());
    }
    this.activeStreams.get(scanId)!.add(sendFn);

    return () => {
      const set = this.activeStreams.get(scanId);
      if (set) {
        set.delete(sendFn);
        if (set.size === 0) {
          this.activeStreams.delete(scanId);
        }
      }
    };
  }

  private broadcast(scanId: string, data: any): void {
    const clients = this.activeStreams.get(scanId);
    if (clients) {
      for (const send of clients) {
        try {
          send(data);
        } catch {
          // ignore dead client
        }
      }
    }
  }

  createShareToken(scanId: string): { shareToken: string; shareUrl: string } {
    const { shareToken } = this.repo.createShareReport(scanId);
    return {
      shareToken,
      shareUrl: `/report/${scanId}?token=${shareToken}`
    };
  }
}
