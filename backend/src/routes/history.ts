import { Router, Request, Response } from 'express';
import { ScanRepository } from '@weblens/database';
import { ScanService } from '../services/scanService.js';
import { 
  ComparisonReport, 
  AuditCategory, 
  ScoreTrendPoint, 
  CategoryComparisonDelta 
} from '@weblens/shared';

export function createHistoryRouter(repo: ScanRepository, scanService: ScanService): Router {
  const router = Router();

  // GET /api/history - Return recent scan history
  router.get('/', (req: Request, res: Response) => {
    try {
      const userId = req.user ? req.user.id : null;
      const history = repo.getRecentScans(30, userId);
      return res.json(history);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch scan history.' });
    }
  });

  // GET /api/history/trends/:domain - Return score trend timeline for charts
  router.get('/trends/:domain', (req: Request, res: Response) => {
    try {
      const { domain } = req.params;
      const scans = repo.getScansByDomain(domain, 15);

      const points: ScoreTrendPoint[] = [];
      for (const s of scans.reverse()) {
        const catScores = repo.getCategoryScoresByScanId(s.id);
        const catMap: Record<string, number> = {};
        for (const c of catScores) {
          catMap[c.category] = c.score;
        }

        points.push({
          scanId: s.id,
          date: s.completedAt || s.startedAt,
          overallScore: s.overallScore || 0,
          performanceScore: catMap.performance,
          seoScore: catMap.seo,
          accessibilityScore: catMap.accessibility,
          securityScore: catMap.security,
          mobileScore: catMap.mobile,
          bestPracticesScore: catMap.best_practices,
        });
      }

      return res.json(points);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to generate trend points.' });
    }
  });

  // GET /api/history/compare/:id1/:id2 - Compare two audits
  router.get('/compare/:id1/:id2', (req: Request, res: Response) => {
    try {
      const { id1, id2 } = req.params;
      const scan1 = repo.getScanById(id1);
      const scan2 = repo.getScanById(id2);

      if (!scan1 || !scan2) {
        return res.status(404).json({ error: 'One or both scans could not be found.' });
      }

      // Order chronologically: beforeScan (older) and afterScan (newer)
      const isScan1Older = new Date(scan1.createdAt).getTime() <= new Date(scan2.createdAt).getTime();
      const beforeScan = isScan1Older ? scan1 : scan2;
      const afterScan = isScan1Older ? scan2 : scan1;

      const beforeScores = repo.getCategoryScoresByScanId(beforeScan.id);
      const afterScores = repo.getCategoryScoresByScanId(afterScan.id);

      const beforeResults = repo.getAuditResultsByScanId(beforeScan.id);
      const afterResults = repo.getAuditResultsByScanId(afterScan.id);

      const categories: AuditCategory[] = ['performance', 'seo', 'accessibility', 'security', 'mobile', 'best_practices'];
      const categoryDeltas: Record<AuditCategory, CategoryComparisonDelta> = {} as any;

      for (const cat of categories) {
        const b = beforeScores.find(s => s.category === cat)?.score || 0;
        const a = afterScores.find(s => s.category === cat)?.score || 0;
        categoryDeltas[cat] = {
          category: cat,
          beforeScore: b,
          afterScore: a,
          delta: a - b
        };
      }

      const overallDelta = (afterScan.overallScore || 0) - (beforeScan.overallScore || 0);

      // Analyze issues resolved vs newly introduced
      const fixedIssues = beforeResults.filter(
        b => !b.passed && afterResults.some(a => a.ruleId === b.ruleId && a.passed)
      );

      const newIssues = afterResults.filter(
        a => !a.passed && beforeResults.some(b => b.ruleId === a.ruleId && b.passed)
      );

      const unresolvedIssues = afterResults.filter(
        a => !a.passed && beforeResults.some(b => b.ruleId === a.ruleId && !b.passed)
      );

      let summaryExplanation = '';
      if (overallDelta > 0) {
        summaryExplanation = `Website health improved by +${overallDelta} points! ${fixedIssues.length} previously detected issues were resolved.`;
      } else if (overallDelta < 0) {
        summaryExplanation = `Website health decreased by ${overallDelta} points. ${newIssues.length} new regression issues were introduced.`;
      } else {
        summaryExplanation = `Overall website health score remained steady at ${afterScan.overallScore}/100.`;
      }

      const comparison: ComparisonReport = {
        beforeScan,
        afterScan,
        overallDelta,
        categoryDeltas,
        issuesDelta: {
          fixedIssues,
          newIssues,
          unresolvedIssues
        },
        summaryExplanation
      };

      return res.json(comparison);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Comparison failed.' });
    }
  });

  return router;
}
