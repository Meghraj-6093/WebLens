import { ScanRepository } from '@weblens/database';
import { ScanService } from './scanService.js';
import { AlertService } from './alertService.js';
import { Logger } from '../utils/logger.js';

export class MonitorService {
  private repo: ScanRepository;
  private scanService: ScanService;
  private alertService: AlertService;
  private intervalHandle: NodeJS.Timeout | null = null;

  constructor(repo: ScanRepository, scanService: ScanService, alertService?: AlertService) {
    this.repo = repo;
    this.scanService = scanService;
    this.alertService = alertService || new AlertService(repo);
  }

  startScheduler(intervalMs: number = 60000): void {
    if (this.intervalHandle) return;
    Logger.info(`⏱️ Continuous monitoring scheduler started (check interval: ${intervalMs / 1000}s)`);

    this.intervalHandle = setInterval(() => {
      this.runScheduledChecks().catch((err) => {
        Logger.error('Error during scheduled monitor run', {}, err);
      });
    }, intervalMs);
  }

  stopScheduler(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async runScheduledChecks(): Promise<number> {
    const dueSites = this.repo.getDueMonitoredSites();
    if (dueSites.length === 0) return 0;

    Logger.info(`Running scheduled audits for ${dueSites.length} monitored target(s)...`);

    for (const site of dueSites) {
      try {
        const scanRes = await this.scanService.startScan(site.url, site.userId);
        
        // Link scan to project if applicable
        if (site.projectId) {
          this.repo.linkScanToProject(site.projectId, scanRes.scanId);
        }

        // Wait for scan completion (or check in next cycle)
        setTimeout(async () => {
          const report = this.scanService.getFullReport(scanRes.scanId);
          if (report && report.scan.status === 'completed') {
            const currentScore = report.overall.score;
            const previousScore = site.lastScore;

            // Update monitored site stats in DB
            this.repo.updateMonitoredSiteScan(site.id, scanRes.scanId, currentScore, site.frequency);

            // Change & Regression Detection
            if (previousScore !== null && previousScore !== undefined) {
              const delta = currentScore - previousScore;
              
              // 1. Significant Score Drop Alert (drop >= 5 points)
              if (delta <= -5) {
                await this.alertService.dispatch({
                  userId: site.userId,
                  siteId: site.id,
                  scanId: scanRes.scanId,
                  severity: delta <= -15 ? 'critical' : 'high',
                  title: `Performance Regression on ${site.domain}`,
                  message: `Overall health score dropped by ${Math.abs(delta)} points (${previousScore} → ${currentScore}/100).`,
                  domain: site.domain,
                  score: currentScore,
                  delta
                });
              }
            }

            // 2. Critical Security Alert
            const criticalSecIssues = report.categories.security.issues.filter(i => !i.passed && i.severity === 'critical');
            if (criticalSecIssues.length > 0) {
              await this.alertService.dispatch({
                userId: site.userId,
                siteId: site.id,
                scanId: scanRes.scanId,
                severity: 'critical',
                title: `Critical Security Issue on ${site.domain}`,
                message: `${criticalSecIssues.length} critical vulnerability detected: ${criticalSecIssues[0].title}.`,
                domain: site.domain,
                score: currentScore
              });
            }
          }
        }, 8000);
      } catch (err: any) {
        Logger.warn(`Failed to execute scheduled scan for ${site.url}`, { siteId: site.id }, err);
      }
    }

    return dueSites.length;
  }
}
