import { EventEmitter } from 'events';
import { 
  ScanRecord, 
  ScanStage, 
  AuditCategory, 
  AuditResult, 
  CategoryScore, 
  FullScanReport, 
  ResourceBreakdown,
  ResourceRecord 
} from '@weblens/shared';
import { validateUrlAgainstSSRF } from './engine/ssrf.js';
import { probeHttpAndTls, HttpProbeResult } from './engine/fetcher.js';
import { runBrowserScan, BrowserScanData } from './engine/browser.js';
import { runPerformanceAudit } from './scanners/performance.js';
import { runSeoAudit } from './scanners/seo.js';
import { runAccessibilityAudit } from './scanners/accessibility.js';
import { runSecurityAudit } from './scanners/security.js';
import { runMobileAudit } from './scanners/mobile.js';
import { runBestPracticesAudit } from './scanners/bestPractices.js';
import { calculateCategoryScore, calculateOverallScore } from './scoring/calculator.js';

export interface ScanStageUpdate {
  stage: ScanStage;
  progress: number;
  message: string;
}

export type ScanStageListener = (update: ScanStageUpdate) => void;

export class ScanOrchestrator extends EventEmitter {
  async executeScan(
    scanRecord: ScanRecord,
    onStageUpdate?: ScanStageListener
  ): Promise<FullScanReport> {
    const scanId = scanRecord.id;
    const targetUrl = scanRecord.normalizedUrl;

    const notify = (stage: ScanStage, progress: number, message: string) => {
      const update: ScanStageUpdate = { stage, progress, message };
      this.emit('stage', update);
      if (onStageUpdate) {
        onStageUpdate(update);
      }
    };

    try {
      // 1. Connecting & SSRF Check
      notify('connecting', 10, `Validating connection to ${scanRecord.domain}...`);
      const ssrfCheck = await validateUrlAgainstSSRF(targetUrl);
      if (!ssrfCheck.isValid) {
        throw new Error(ssrfCheck.error || 'Access to target URL is restricted for security.');
      }

      // 2. Fetching HTTP & Headers
      notify('fetching', 25, `Connecting and retrieving response headers...`);
      const httpProbe = await probeHttpAndTls(targetUrl, 12000);

      // 3. Browser Performance & Layout Scan
      notify('performance', 45, `Launching browser engine & measuring Core Web Vitals...`);
      let browserData: BrowserScanData | undefined;
      try {
        browserData = await runBrowserScan(targetUrl, scanId, { timeoutMs: 18000, captureScreenshot: true });
      } catch (browserErr: any) {
        console.warn(`Browser scan fallback for ${targetUrl}:`, browserErr.message);
      }

      // 4. SEO Analysis
      notify('seo', 60, `Analyzing title, meta tags, and indexing structure...`);
      const seoAudit = runSeoAudit(scanId, httpProbe);

      // 5. Accessibility Analysis
      notify('accessibility', 75, `Auditing WCAG compliance, labels, and landmarks...`);
      const a11yAudit = runAccessibilityAudit(scanId, httpProbe, browserData);

      // 6. Security Analysis
      notify('security', 85, `Inspecting TLS, CSP, HSTS, and protection headers...`);
      const securityAudit = runSecurityAudit(scanId, httpProbe);

      // 7. Mobile Readiness Analysis
      notify('mobile', 90, `Testing responsive viewport, overflow, and touch targets...`);
      const mobileAudit = runMobileAudit(scanId, httpProbe, browserData);

      // 8. Best Practices Analysis
      notify('best_practices', 95, `Checking console diagnostics, doctype, and HTML standards...`);
      const bpAudit = runBestPracticesAudit(scanId, httpProbe, browserData);

      // Performance Audit
      const perfAudit = runPerformanceAudit(scanId, httpProbe, browserData);

      // 9. Scoring Calculation
      notify('scoring', 98, `Synthesizing audit findings and calculating scores...`);
      
      const allResults: Record<AuditCategory, { issues: AuditResult[]; metrics: any[] }> = {
        performance: perfAudit,
        seo: seoAudit,
        accessibility: a11yAudit,
        security: securityAudit,
        mobile: mobileAudit,
        best_practices: bpAudit
      };

      const categoryScores: Record<AuditCategory, CategoryScore> = {
        performance: calculateCategoryScore(scanId, 'performance', perfAudit.issues),
        seo: calculateCategoryScore(scanId, 'seo', seoAudit.issues),
        accessibility: calculateCategoryScore(scanId, 'accessibility', a11yAudit.issues),
        security: calculateCategoryScore(scanId, 'security', securityAudit.issues),
        mobile: calculateCategoryScore(scanId, 'mobile', mobileAudit.issues),
        best_practices: calculateCategoryScore(scanId, 'best_practices', bpAudit.issues),
      };

      const overall = calculateOverallScore(categoryScores);

      // Resource Breakdown
      const resources: ResourceRecord[] = browserData?.resources || [
        {
          scanId,
          url: targetUrl,
          resourceType: 'document',
          sizeBytes: httpProbe.contentLengthBytes,
          loadTimeMs: httpProbe.ttfbMs,
          statusCode: httpProbe.statusCode,
          isCompressed: Boolean(httpProbe.headers['content-encoding']),
          isCached: false,
        }
      ];

      const resourceBreakdown = computeResourceBreakdown(resources);

      // 10. Completed
      notify('completed', 100, `Audit completed successfully.`);

      const fullReport: FullScanReport = {
        scan: {
          ...scanRecord,
          status: 'completed',
          overallScore: overall.score,
          stage: 'completed',
          progress: 100,
          screenshotUrl: browserData?.screenshotBase64 || null,
          completedAt: new Date().toISOString()
        },
        overall,
        categories: {
          performance: {
            score: categoryScores.performance.score,
            rating: categoryScores.performance.rating,
            metrics: perfAudit.metrics,
            issues: perfAudit.issues
          },
          seo: {
            score: categoryScores.seo.score,
            rating: categoryScores.seo.rating,
            metrics: seoAudit.metrics,
            issues: seoAudit.issues
          },
          accessibility: {
            score: categoryScores.accessibility.score,
            rating: categoryScores.accessibility.rating,
            metrics: a11yAudit.metrics,
            issues: a11yAudit.issues
          },
          security: {
            score: categoryScores.security.score,
            rating: categoryScores.security.rating,
            metrics: securityAudit.metrics,
            issues: securityAudit.issues
          },
          mobile: {
            score: categoryScores.mobile.score,
            rating: categoryScores.mobile.rating,
            metrics: mobileAudit.metrics,
            issues: mobileAudit.issues
          },
          best_practices: {
            score: categoryScores.best_practices.score,
            rating: categoryScores.best_practices.rating,
            metrics: bpAudit.metrics,
            issues: bpAudit.issues
          }
        },
        resources,
        resourceBreakdown,
        screenshotUrl: browserData?.screenshotBase64 || null
      };

      return fullReport;
    } catch (err: any) {
      notify('completed', 100, `Scan failed: ${err.message || 'Unknown error'}`);
      throw err;
    }
  }
}

function computeResourceBreakdown(resources: ResourceRecord[]): ResourceBreakdown {
  const breakdown: ResourceBreakdown = {
    totalCount: resources.length,
    totalSizeBytes: 0,
    totalLoadTimeMs: 0,
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
    }
  };

  for (const r of resources) {
    breakdown.totalSizeBytes += r.sizeBytes || 0;
    breakdown.totalLoadTimeMs = Math.max(breakdown.totalLoadTimeMs, r.loadTimeMs || 0);

    const typeKey = r.resourceType in breakdown.byType ? r.resourceType : 'other';
    breakdown.byType[typeKey].count++;
    breakdown.byType[typeKey].sizeBytes += r.sizeBytes || 0;
  }

  return breakdown;
}
