import { ScanService } from './scanService.js';
import { CompetitorComparisonResult, CompetitorSiteScore, AuditCategory } from '@weblens/shared';

export class CompetitorService {
  private scanService: ScanService;

  constructor(scanService: ScanService) {
    this.scanService = scanService;
  }

  async compareSites(urls: string[], userId?: string | null): Promise<CompetitorComparisonResult> {
    if (!urls || urls.length < 2) {
      throw new Error('At least two website URLs are required for competitor comparison.');
    }

    const targetUrls = urls.slice(0, 3); // Maximum 3 competitors at a time
    const scanPromises = targetUrls.map(url => this.scanService.startScan(url, userId));
    const scanResponses = await Promise.all(scanPromises);

    // Poll for all scans to complete
    const siteScores: CompetitorSiteScore[] = [];

    for (const res of scanResponses) {
      let report = null;
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((r) => setTimeout(r, 1000));
        const st = this.scanService.getScanStatus(res.scanId);
        if (st?.status === 'completed' || st?.status === 'failed') {
          report = this.scanService.getFullReport(res.scanId);
          break;
        }
      }

      if (report && report.scan.status === 'completed') {
        const catMap: Record<AuditCategory, number> = {
          performance: report.categories.performance.score,
          seo: report.categories.seo.score,
          accessibility: report.categories.accessibility.score,
          security: report.categories.security.score,
          mobile: report.categories.mobile.score,
          best_practices: report.categories.best_practices.score,
        };

        const totalIssuesCount = Object.values(report.categories).reduce((acc, c) => acc + c.issues.filter(i => !i.passed).length, 0);
        const criticalIssuesCount = Object.values(report.categories).reduce((acc, c) => acc + c.issues.filter(i => !i.passed && i.severity === 'critical').length, 0);

        siteScores.push({
          domain: report.scan.domain,
          url: report.scan.url,
          scanId: report.scan.id,
          overallScore: report.overall.score,
          rating: report.overall.rating,
          categoryScores: catMap,
          totalIssuesCount,
          criticalIssuesCount,
          screenshotUrl: report.scan.screenshotUrl
        });
      }
    }

    if (siteScores.length < 2) {
      throw new Error('Competitor comparison could not complete for multiple sites within the timeout window.');
    }

    // Determine category leaders
    const categories: AuditCategory[] = ['performance', 'seo', 'accessibility', 'security', 'mobile', 'best_practices'];
    const categoryLeaders: any = {};

    for (const cat of categories) {
      let bestDomain = siteScores[0].domain;
      let bestScore = siteScores[0].categoryScores[cat];

      for (const site of siteScores) {
        if (site.categoryScores[cat] > bestScore) {
          bestScore = site.categoryScores[cat];
          bestDomain = site.domain;
        }
      }
      categoryLeaders[cat] = { domain: bestDomain, score: bestScore };
    }

    // Winner domain
    const sortedOverall = [...siteScores].sort((a, b) => b.overallScore - a.overallScore);
    const winnerDomain = sortedOverall[0].domain;

    // Generate competitive insights
    const insights: string[] = [];
    insights.push(`🏆 **${winnerDomain}** ranks highest overall with an aggregate score of ${sortedOverall[0].overallScore}/100.`);

    if (categoryLeaders.performance.domain !== winnerDomain) {
      insights.push(`⚡ **${categoryLeaders.performance.domain}** holds the fastest loading performance (${categoryLeaders.performance.score}/100).`);
    }
    if (categoryLeaders.seo.domain !== winnerDomain) {
      insights.push(`🔍 **${categoryLeaders.seo.domain}** has superior search engine optimization structure (${categoryLeaders.seo.score}/100).`);
    }
    if (categoryLeaders.security.domain !== winnerDomain) {
      insights.push(`🔒 **${categoryLeaders.security.domain}** exhibits stronger security headers & TLS configuration.`);
    }

    return {
      primaryDomain: siteScores[0].domain,
      domains: siteScores.map(s => s.domain),
      sites: siteScores,
      winnerDomain,
      categoryLeaders,
      insights,
      comparedAt: new Date().toISOString()
    };
  }
}
