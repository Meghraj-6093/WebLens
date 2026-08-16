import { AuditResult, AIExplanation } from '@weblens/shared';
import { generateFrameworkFixes } from './fixGenerator.js';

export function generateAIExplanation(issue: AuditResult): AIExplanation {
  const ruleId = issue.ruleId;
  const title = issue.title;

  let whatHappened = issue.description;
  let whyItMatters = issue.impact;
  let howToFix = issue.recommendation;
  let priority: AIExplanation['priority'] = 'Medium';
  let priorityRationale = 'General optimization opportunity for website performance and standards.';
  let estimatedEffort: AIExplanation['estimatedEffort'] = '15 mins';

  switch (issue.severity) {
    case 'critical':
      priority = 'Critical';
      priorityRationale = 'Immediate blocker affecting basic security, privacy, or indexability.';
      estimatedEffort = '30 mins';
      break;
    case 'high':
      priority = 'High';
      priorityRationale = 'Significant defect directly harming user conversion rates, SERP ranking, or WCAG compliance.';
      estimatedEffort = '15 mins';
      break;
    case 'medium':
      priority = 'Medium';
      priorityRationale = 'Important technical optimization to prevent user drop-off and improve load stability.';
      estimatedEffort = '15 mins';
      break;
    case 'low':
      priority = 'Low';
      priorityRationale = 'Minor enhancement for polish and consistency.';
      estimatedEffort = '5 mins';
      break;
  }

  // Custom refined narratives for key rules
  if (ruleId.startsWith('perf.lcp')) {
    whatHappened = 'Your main visual content takes too long to become interactive and visible for visitors.';
    whyItMatters = 'Google Core Web Vitals prioritize fast LCP. Users on slower mobile connections will perceive the site as broken or unresponsive.';
    howToFix = 'Compress the hero image into modern WebP/AVIF format, add fetchpriority="high", and inline critical CSS styles.';
  } else if (ruleId === 'seo.missing-meta-description') {
    whatHappened = 'Search engines could not find a defined summary snippet for this URL.';
    whyItMatters = 'Search engines will automatically extract arbitrary page sentences, leading to confusing search snippet previews and lower click-through rates (CTR).';
    howToFix = 'Add a concise 120-155 character meta description highlighting the product value and a clear call to action.';
  } else if (ruleId === 'sec.missing-csp') {
    whatHappened = 'The server does not specify a Content-Security-Policy (CSP) header.';
    whyItMatters = 'Leaves the website vulnerable to Cross-Site Scripting (XSS) and malicious iframe injection if user data is ever reflected.';
    howToFix = 'Implement a Content-Security-Policy header restricting script and stylesheet domains to trusted CDNs.';
  } else if (ruleId.startsWith('a11y.missing-alt')) {
    whatHappened = 'One or more images on this page lack alternative descriptive text.';
    whyItMatters = 'Screen readers and assistive technologies cannot describe the visual to visually impaired users, violating WCAG 2.1 Level A compliance.';
    howToFix = 'Add descriptive alt text to informative illustrations, or empty alt="" for decorative graphics.';
  }

  const codeSnippets = generateFrameworkFixes(ruleId, title, issue.technicalDetails);

  return {
    issueId: issue.id || `${ruleId}-${issue.category}`,
    ruleId,
    title,
    whatHappened,
    whyItMatters,
    howToFix,
    priority,
    priorityRationale,
    estimatedEffort,
    codeSnippets,
  };
}
