import * as cheerio from 'cheerio';
import { AuditResult, MetricItem } from '@weblens/shared';
import { HttpProbeResult } from '../engine/fetcher.js';
import { BrowserScanData } from '../engine/browser.js';

export interface BestPracticesScanResult {
  issues: AuditResult[];
  metrics: MetricItem[];
}

export function runBestPracticesAudit(
  scanId: string,
  httpProbe: HttpProbeResult,
  browserData?: BrowserScanData
): BestPracticesScanResult {
  const issues: AuditResult[] = [];
  const metrics: MetricItem[] = [];

  const rawHtml = httpProbe.html;
  const $ = cheerio.load(rawHtml);

  // 1. HTML5 Doctype Check
  const hasDoctype = /<!doctype\s+html/i.test(rawHtml.substring(0, 200));
  metrics.push({
    id: 'bp.doctype',
    name: 'HTML5 Doctype',
    value: hasDoctype ? 'Valid HTML5' : 'Missing / Invalid',
    status: hasDoctype ? 'good' : 'poor',
    description: 'A proper doctype prevents browsers from rendering pages in quirks mode.'
  });

  if (!hasDoctype) {
    issues.push({
      scanId,
      category: 'best_practices',
      ruleId: 'bp.missing-doctype',
      severity: 'high',
      title: 'Missing or invalid HTML5 doctype',
      description: 'The document does not declare <!DOCTYPE html> at the very beginning of the source.',
      impact: 'Browsers may render the webpage in "quirks mode", causing erratic CSS styling, broken box models, and layout glitches.',
      recommendation: 'Add <!DOCTYPE html> as the very first line of your HTML document.',
      technicalDetails: '<!DOCTYPE html>\n<html lang="en">',
      location: 'Line 1',
      passed: false,
      scoreImpact: 15
    });
  } else {
    issues.push({
      scanId,
      category: 'best_practices',
      ruleId: 'bp.doctype-present',
      severity: 'passed',
      title: 'Valid HTML5 doctype declared',
      description: 'Document includes modern <!DOCTYPE html> declaration.',
      impact: 'Ensures standards-compliant rendering mode.',
      recommendation: 'Maintain standard HTML5 doctype.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 2. Charset Declaration Check
  const hasCharset = $('head meta[charset]').length > 0 || $('head meta[http-equiv="content-type"]').length > 0;
  if (!hasCharset) {
    issues.push({
      scanId,
      category: 'best_practices',
      ruleId: 'bp.missing-charset',
      severity: 'medium',
      title: 'Missing charset declaration',
      description: 'No <meta charset="utf-8"> tag was found in the <head>.',
      impact: 'May cause special characters, emojis, or international alphabets to render as garbled symbols (mojibake).',
      recommendation: 'Add <meta charset="utf-8"> as one of the first children of <head>.',
      technicalDetails: '<meta charset="utf-8">',
      location: '<head>',
      passed: false,
      scoreImpact: 6
    });
  } else {
    issues.push({
      scanId,
      category: 'best_practices',
      ruleId: 'bp.charset-valid',
      severity: 'passed',
      title: 'Character encoding is defined',
      description: 'Valid UTF-8 charset declaration found in <head>.',
      impact: 'Ensures text and special symbols render accurately across all devices.',
      recommendation: 'Keep charset tag at the top of <head>.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 3. Browser Console & JavaScript Errors Check
  const jsErrors = browserData?.jsErrors || [];
  const consoleErrors = browserData?.consoleLogs.filter(l => l.type === 'error') || [];
  const totalErrors = jsErrors.length + consoleErrors.length;

  metrics.push({
    id: 'bp.js_errors',
    name: 'JavaScript Errors',
    value: totalErrors === 0 ? 'None' : `${totalErrors} logged`,
    status: totalErrors === 0 ? 'good' : 'poor',
    description: 'Uncaught JavaScript exceptions or console errors during page initialization.'
  });

  if (totalErrors > 0) {
    const sampleError = jsErrors[0] || consoleErrors[0]?.text || 'Uncaught error';
    issues.push({
      scanId,
      category: 'best_practices',
      ruleId: 'bp.console-errors',
      severity: totalErrors > 3 ? 'critical' : 'high',
      title: `${totalErrors} uncaught JavaScript / Console error(s) logged`,
      description: `The browser encountered runtime errors while loading the page: "${sampleError.substring(0, 120)}...".`,
      impact: 'Can break user interactions, prevent script-based UI from rendering, and degrade overall reliability.',
      recommendation: 'Inspect browser developer console and fix uncaught exceptions or failed external script calls.',
      technicalDetails: `Errors: ${[...jsErrors, ...consoleErrors.map(c => c.text)].slice(0, 2).join('\n')}`,
      passed: false,
      scoreImpact: totalErrors > 3 ? 15 : 10
    });
  } else {
    issues.push({
      scanId,
      category: 'best_practices',
      ruleId: 'bp.no-console-errors',
      severity: 'passed',
      title: 'No browser console or runtime errors',
      description: 'Page initialized cleanly without uncaught JavaScript exceptions.',
      impact: 'Provides a stable, bug-free execution runtime for interactive features.',
      recommendation: 'Maintain continuous error monitoring.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 4. Insecure External Links (target="_blank" without rel="noopener")
  const insecureLinks: string[] = [];
  $('a[target="_blank"]').each((_, el) => {
    const rel = ($(el).attr('rel') || '').toLowerCase();
    const href = $(el).attr('href') || '';
    if (!rel.includes('noopener') && !rel.includes('noreferrer') && href.startsWith('http')) {
      insecureLinks.push(href);
    }
  });

  if (insecureLinks.length > 0) {
    issues.push({
      scanId,
      category: 'best_practices',
      ruleId: 'bp.insecure-blank-links',
      severity: 'medium',
      title: `${insecureLinks.length} external link(s) use target="_blank" without rel="noopener"`,
      description: 'Opening external links in new tabs without rel="noopener" or rel="noreferrer" exposes the page to reverse tabnabbing vulnerability.',
      impact: 'The destination page can access window.opener and redirect the original page to a phishing URL.',
      recommendation: 'Add rel="noopener noreferrer" to all links that have target="_blank".',
      technicalDetails: '<a href="https://external.com" target="_blank" rel="noopener noreferrer">Visit</a>',
      passed: false,
      scoreImpact: 6
    });
  } else {
    issues.push({
      scanId,
      category: 'best_practices',
      ruleId: 'bp.external-links-safe',
      severity: 'passed',
      title: 'External links use secure rel attributes',
      description: 'All target="_blank" links safely protect the window.opener reference.',
      impact: 'Protects visitors from reverse tabnabbing attacks.',
      recommendation: 'Keep rel="noopener" on new outbound links.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 5. Deprecated HTML Tags Check
  const deprecatedTags = ['font', 'center', 'marquee', 'blink', 'big', 'strike', 'tt', 'applet'];
  const foundDeprecated: string[] = [];
  deprecatedTags.forEach((tag) => {
    if ($(tag).length > 0) {
      foundDeprecated.push(`<${tag}>`);
    }
  });

  if (foundDeprecated.length > 0) {
    issues.push({
      scanId,
      category: 'best_practices',
      ruleId: 'bp.deprecated-html-tags',
      severity: 'medium',
      title: `Deprecated HTML element(s) detected: ${foundDeprecated.join(', ')}`,
      description: 'Legacy styling tags from HTML4/XHTML are obsolete in HTML5.',
      impact: 'Inconsistent rendering across modern browsers and poor maintainability.',
      recommendation: 'Replace legacy presentational tags with modern CSS styling (e.g., flexbox, text-align, animations).',
      passed: false,
      scoreImpact: 6
    });
  } else {
    issues.push({
      scanId,
      category: 'best_practices',
      ruleId: 'bp.modern-html-tags',
      severity: 'passed',
      title: 'Uses modern, standards-compliant HTML elements',
      description: 'No deprecated presentational tags found in the DOM.',
      impact: 'Ensures future-proof rendering consistency.',
      recommendation: 'Maintain separation of semantics (HTML) and styling (CSS).',
      passed: true,
      scoreImpact: 0
    });
  }

  return { issues, metrics };
}
