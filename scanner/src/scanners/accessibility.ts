import * as cheerio from 'cheerio';
import { AuditResult, MetricItem } from '@weblens/shared';
import { HttpProbeResult } from '../engine/fetcher.js';
import { BrowserScanData } from '../engine/browser.js';

export interface AccessibilityScanResult {
  issues: AuditResult[];
  metrics: MetricItem[];
}

export function runAccessibilityAudit(
  scanId: string,
  httpProbe: HttpProbeResult,
  browserData?: BrowserScanData
): AccessibilityScanResult {
  const issues: AuditResult[] = [];
  const metrics: MetricItem[] = [];

  const $ = cheerio.load(httpProbe.html);

  // 1. Missing Image Alt Text
  const images = $('img');
  let missingAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt === null) {
      missingAlt++;
    }
  });

  metrics.push({
    id: 'a11y.image_alt',
    name: 'Image Alt Coverage',
    value: images.length > 0 ? `${images.length - missingAlt} / ${images.length}` : 'N/A',
    status: missingAlt === 0 ? 'good' : 'needs_improvement',
    description: 'Images must have an alt attribute to convey meaning to screen reader users.'
  });

  if (missingAlt > 0) {
    issues.push({
      scanId,
      category: 'accessibility',
      ruleId: 'a11y.missing-alt',
      severity: missingAlt > 3 ? 'critical' : 'high',
      title: `${missingAlt} image(s) missing alt text`,
      description: `Screen readers cannot describe images that lack an alt attribute to visually impaired users.`,
      impact: 'Severely damages accessibility compliance (WCAG 2.1 Level A) and degrades the experience for assistive technology users.',
      recommendation: 'Add descriptive alt text for meaningful images or alt="" for purely decorative elements.',
      technicalDetails: `<img src="..." alt="Description of image" />`,
      passed: false,
      scoreImpact: missingAlt > 3 ? 15 : 10
    });
  } else {
    issues.push({
      scanId,
      category: 'accessibility',
      ruleId: 'a11y.alt-text-present',
      severity: 'passed',
      title: 'All images have alt attributes',
      description: 'Every image tag contains an alt attribute.',
      impact: 'Ensures screen reader accessibility.',
      recommendation: 'Keep all future media labeled.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 2. Form Controls Missing Labels
  const formInputs = $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
  let unlabelledInputs = 0;
  formInputs.each((_, el) => {
    const id = $(el).attr('id');
    const ariaLabel = $(el).attr('aria-label');
    const ariaLabelledby = $(el).attr('aria-labelledby');
    const hasParentLabel = $(el).closest('label').length > 0;
    const hasAssociatedLabel = id ? $(`label[for="${id}"]`).length > 0 : false;

    if (!ariaLabel && !ariaLabelledby && !hasParentLabel && !hasAssociatedLabel) {
      unlabelledInputs++;
    }
  });

  if (unlabelledInputs > 0) {
    issues.push({
      scanId,
      category: 'accessibility',
      ruleId: 'a11y.unlabelled-form-inputs',
      severity: 'high',
      title: `${unlabelledInputs} form input(s) missing labels`,
      description: 'Form elements without associated <label> tags or aria-label attributes cannot be understood by screen readers.',
      impact: 'Visually impaired users cannot determine what information is requested in the form field.',
      recommendation: 'Add an explicit <label for="inputId"> or an aria-label attribute to every form input.',
      technicalDetails: '<label for="email">Email Address</label>\n<input id="email" type="email" />',
      passed: false,
      scoreImpact: 10
    });
  } else if (formInputs.length > 0) {
    issues.push({
      scanId,
      category: 'accessibility',
      ruleId: 'a11y.form-labels-valid',
      severity: 'passed',
      title: 'Form elements have accessible labels',
      description: 'All form inputs have proper labels or aria attributes.',
      impact: 'Assists screen reader navigation across form interactions.',
      recommendation: 'Maintain label bindings.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 3. Button Accessible Names
  const buttons = $('button, [role="button"]');
  let emptyButtons = 0;
  buttons.each((_, el) => {
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr('aria-label');
    const ariaLabelledby = $(el).attr('aria-labelledby');
    const title = $(el).attr('title');

    if (!text && !ariaLabel && !ariaLabelledby && !title) {
      emptyButtons++;
    }
  });

  if (emptyButtons > 0) {
    issues.push({
      scanId,
      category: 'accessibility',
      ruleId: 'a11y.empty-buttons',
      severity: 'high',
      title: `${emptyButtons} button(s) without accessible name`,
      description: 'Icon buttons or empty buttons lack text content or aria-label attributes.',
      impact: 'Screen readers will announce "Button" with no context as to what clicking it will do.',
      recommendation: 'Provide discernible text or add aria-label="Action description" to icon-only buttons.',
      technicalDetails: '<button aria-label="Close dialog"><svg>...</svg></button>',
      passed: false,
      scoreImpact: 10
    });
  } else if (buttons.length > 0) {
    issues.push({
      scanId,
      category: 'accessibility',
      ruleId: 'a11y.buttons-named',
      severity: 'passed',
      title: 'Buttons have discernible names',
      description: 'All buttons contain readable text or accessible aria labels.',
      impact: 'Enables smooth keyboard and voice navigation.',
      recommendation: 'Continue labeling icon-only actions.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 4. Duplicate IDs Check
  const idMap = new Map<string, number>();
  $('[id]').each((_, el) => {
    const id = $(el).attr('id')?.trim();
    if (id) {
      idMap.set(id, (idMap.get(id) || 0) + 1);
    }
  });

  let duplicateIdCount = 0;
  idMap.forEach((count) => {
    if (count > 1) duplicateIdCount++;
  });

  if (duplicateIdCount > 0) {
    issues.push({
      scanId,
      category: 'accessibility',
      ruleId: 'a11y.duplicate-ids',
      severity: 'medium',
      title: `${duplicateIdCount} duplicate element ID(s) found`,
      description: 'Multiple elements share the exact same ID attribute in the DOM.',
      impact: 'Breaks label associations, ARIA references, and scripts that target IDs.',
      recommendation: 'Ensure all id attributes on the page are globally unique.',
      passed: false,
      scoreImpact: 6
    });
  } else {
    issues.push({
      scanId,
      category: 'accessibility',
      ruleId: 'a11y.unique-ids',
      severity: 'passed',
      title: 'All element IDs are unique',
      description: 'No duplicate ID attributes were detected in the document.',
      impact: 'Ensures ARIA landmark references work predictably.',
      recommendation: 'Maintain unique ID scoping.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 5. Landmark Structure Check
  const hasMain = $('main, [role="main"]').length > 0;
  const hasNav = $('nav, [role="navigation"]').length > 0;
  metrics.push({
    id: 'a11y.landmarks',
    name: 'HTML5 Landmarks',
    value: hasMain && hasNav ? 'Complete' : hasMain ? 'Partial' : 'Missing',
    status: hasMain ? 'good' : 'needs_improvement',
    description: 'Landmark elements (<main>, <nav>, <header>) allow assistive technologies to jump directly to sections.'
  });

  if (!hasMain) {
    issues.push({
      scanId,
      category: 'accessibility',
      ruleId: 'a11y.missing-main-landmark',
      severity: 'medium',
      title: 'Missing <main> landmark element',
      description: 'The page lacks a <main> element or [role="main"] landmark.',
      impact: 'Screen reader users cannot use keyboard shortcuts to jump straight to the primary content.',
      recommendation: 'Wrap the primary content of your page inside a semantic <main> tag.',
      technicalDetails: '<main>\n  <!-- Primary content -->\n</main>',
      passed: false,
      scoreImpact: 6
    });
  } else {
    issues.push({
      scanId,
      category: 'accessibility',
      ruleId: 'a11y.main-landmark-present',
      severity: 'passed',
      title: 'Semantic <main> landmark defined',
      description: 'The primary content is correctly housed in a semantic landmark.',
      impact: 'Enables quick navigation bypass for assistive users.',
      recommendation: 'Keep one main landmark per document.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 6. Incorporate axe-core violations if browser scan captured them
  if (browserData?.axeResults?.violations && Array.isArray(browserData.axeResults.violations)) {
    for (const v of browserData.axeResults.violations) {
      // Avoid duplicate reports for rules already handled above
      if (['image-alt', 'label', 'button-name', 'duplicate-id'].includes(v.id)) {
        continue;
      }
      issues.push({
        scanId,
        category: 'accessibility',
        ruleId: `a11y.axe.${v.id}`,
        severity: v.impact === 'critical' ? 'critical' : v.impact === 'serious' ? 'high' : 'medium',
        title: v.help || v.id,
        description: v.description,
        impact: `Violates WCAG standard: ${v.tags?.join(', ') || 'Accessibility standard'}.`,
        recommendation: `Check ${v.helpUrl || 'WCAG guidelines for resolution'}.`,
        technicalDetails: v.nodes && v.nodes[0]?.html ? v.nodes[0].html.substring(0, 150) : null,
        passed: false,
        scoreImpact: v.impact === 'critical' ? 12 : v.impact === 'serious' ? 8 : 4
      });
    }
  }

  return { issues, metrics };
}
