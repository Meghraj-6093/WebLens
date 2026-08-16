import { AuditResult, CategoryScore, OverallScoreResult, AuditCategory, IssueSeverity } from '@weblens/shared';

export const CATEGORY_WEIGHTS: Record<AuditCategory, number> = {
  performance: 0.25,
  seo: 0.20,
  accessibility: 0.20,
  security: 0.15,
  mobile: 0.10,
  best_practices: 0.10
};

export function calculateCategoryScore(
  scanId: string,
  category: AuditCategory,
  results: AuditResult[]
): CategoryScore {
  let score = 100;
  const issuesCount = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    passed: 0
  };

  for (const r of results) {
    if (r.passed) {
      issuesCount.passed++;
    } else {
      const severity = r.severity as keyof typeof issuesCount;
      if (issuesCount[severity] !== undefined) {
        issuesCount[severity]++;
      }
      score -= r.scoreImpact || (
        r.severity === 'critical' ? 20 :
        r.severity === 'high' ? 10 :
        r.severity === 'medium' ? 5 : 2
      );
    }
  }

  // Bound score between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  let rating: 'excellent' | 'good' | 'needs_improvement' | 'poor' = 'poor';
  if (score >= 90) rating = 'excellent';
  else if (score >= 75) rating = 'good';
  else if (score >= 50) rating = 'needs_improvement';

  return {
    scanId,
    category,
    score,
    rating,
    issuesCount,
    weight: CATEGORY_WEIGHTS[category]
  };
}

export function calculateOverallScore(
  categoryScores: Record<AuditCategory, CategoryScore>
): OverallScoreResult {
  let weightedSum = 0;
  let totalWeight = 0;

  const totalIssues = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    passed: 0
  };

  const categories = Object.keys(categoryScores) as AuditCategory[];
  for (const cat of categories) {
    const catScore = categoryScores[cat];
    const weight = CATEGORY_WEIGHTS[cat] || 0.1;
    weightedSum += catScore.score * weight;
    totalWeight += weight;

    totalIssues.critical += catScore.issuesCount.critical;
    totalIssues.high += catScore.issuesCount.high;
    totalIssues.medium += catScore.issuesCount.medium;
    totalIssues.low += catScore.issuesCount.low;
    totalIssues.passed += catScore.issuesCount.passed;
  }

  const overallScore = Math.max(0, Math.min(100, Math.round(weightedSum / (totalWeight || 1))));

  let rating: 'excellent' | 'good' | 'needs_improvement' | 'poor' = 'poor';
  if (overallScore >= 90) rating = 'excellent';
  else if (overallScore >= 75) rating = 'good';
  else if (overallScore >= 50) rating = 'needs_improvement';

  const issueCount = totalIssues.critical + totalIssues.high + totalIssues.medium + totalIssues.low;
  let summaryText = '';
  if (rating === 'excellent') {
    summaryText = issueCount === 0 
      ? 'Outstanding! Your website meets top-tier standards across all categories.'
      : `Your website is in excellent health, with only ${issueCount} minor improvement${issueCount > 1 ? 's' : ''} suggested.`;
  } else if (rating === 'good') {
    summaryText = `Your website has solid fundamentals, but ${issueCount} issues should be addressed for optimal health.`;
  } else if (rating === 'needs_improvement') {
    summaryText = `Your website has notable bottlenecks (${totalIssues.critical} critical, ${totalIssues.high} high priority) affecting user experience and ranking.`;
  } else {
    summaryText = `Urgent fixes required: multiple critical flaws detected across security, performance, or accessibility.`;
  }

  return {
    score: overallScore,
    rating,
    summaryText,
    categoryScores,
    totalIssues
  };
}
