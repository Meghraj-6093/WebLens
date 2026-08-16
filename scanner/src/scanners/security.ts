import * as cheerio from 'cheerio';
import { AuditResult, MetricItem } from '@weblens/shared';
import { HttpProbeResult } from '../engine/fetcher.js';

export interface SecurityScanResult {
  issues: AuditResult[];
  metrics: MetricItem[];
}

export function runSecurityAudit(scanId: string, httpProbe: HttpProbeResult): SecurityScanResult {
  const issues: AuditResult[] = [];
  const metrics: MetricItem[] = [];

  const headers = httpProbe.headers;
  const isHttps = httpProbe.isHttps;

  // 1. HTTPS / TLS Check
  metrics.push({
    id: 'sec.https',
    name: 'HTTPS Protocol',
    value: isHttps ? 'Active (HTTPS)' : 'Insecure (HTTP)',
    status: isHttps ? 'good' : 'poor',
    description: 'Enforces encrypted communication over TLS to safeguard user data in transit.'
  });

  if (!isHttps) {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.no-https',
      severity: 'critical',
      title: 'Website does not enforce HTTPS',
      description: 'Communication with this website is transmitted in clear text over HTTP.',
      impact: 'Sensitive data, session cookies, and login credentials can be intercepted or tampered with via Man-in-the-Middle (MitM) attacks.',
      recommendation: 'Obtain an SSL/TLS certificate (e.g., free via Let\'s Encrypt) and enforce 301 redirects to HTTPS.',
      passed: false,
      scoreImpact: 35
    });
  } else {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.https-active',
      severity: 'passed',
      title: 'HTTPS is active',
      description: `Target is served securely over HTTPS (${httpProbe.ssl?.protocol || 'TLS'}).`,
      impact: 'Protects user privacy and data integrity.',
      recommendation: 'Ensure automated SSL certificate renewal.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 2. Strict-Transport-Security (HSTS)
  const hsts = headers['strict-transport-security'];
  metrics.push({
    id: 'sec.hsts',
    name: 'HSTS Header',
    value: hsts ? 'Enabled' : 'Missing',
    status: hsts ? 'good' : 'needs_improvement',
    description: 'Instructs browsers to strictly load the site via HTTPS, preventing downgrade attacks.'
  });

  if (!hsts && isHttps) {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.missing-hsts',
      severity: 'high',
      title: 'Missing HTTP Strict-Transport-Security (HSTS) header',
      description: 'The response does not include a Strict-Transport-Security header.',
      impact: 'Allows potential SSL-stripping attacks during the initial unencrypted request.',
      recommendation: 'Add the Strict-Transport-Security header with a long max-age (e.g. max-age=31536000; includeSubDomains).',
      technicalDetails: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
      location: 'HTTP Response Headers',
      passed: false,
      scoreImpact: 12
    });
  } else if (hsts) {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.hsts-enabled',
      severity: 'passed',
      title: 'HSTS header configured',
      description: `HSTS is active: "${hsts}".`,
      impact: 'Protects against protocol downgrade and cookie hijacking.',
      recommendation: 'Consider adding "preload" after thorough testing.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 3. Content-Security-Policy (CSP)
  const csp = headers['content-security-policy'];
  metrics.push({
    id: 'sec.csp',
    name: 'Content-Security-Policy',
    value: csp ? 'Configured' : 'Missing',
    status: csp ? 'good' : 'needs_improvement',
    description: 'Restricts the resources that the browser is allowed to load, preventing XSS and data injection.'
  });

  if (!csp) {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.missing-csp',
      severity: 'high',
      title: 'Missing Content-Security-Policy (CSP) header',
      description: 'No Content-Security-Policy header was detected.',
      impact: 'Increases vulnerability to Cross-Site Scripting (XSS) and malicious code injection attacks.',
      recommendation: 'Define a Content-Security-Policy header restricting script, style, and object sources.',
      technicalDetails: "Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com;",
      location: 'HTTP Response Headers',
      passed: false,
      scoreImpact: 12
    });
  } else {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.csp-configured',
      severity: 'passed',
      title: 'Content-Security-Policy is active',
      description: 'CSP header detected on server response.',
      impact: 'Hardens site against malicious script injection.',
      recommendation: 'Regularly audit policy directives.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 4. X-Content-Type-Options
  const xContentType = headers['x-content-type-options'];
  if (!xContentType || !xContentType.toLowerCase().includes('nosniff')) {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.missing-content-type-options',
      severity: 'medium',
      title: 'Missing X-Content-Type-Options: nosniff header',
      description: 'The X-Content-Type-Options header is absent or not set to "nosniff".',
      impact: 'Allows older browsers to MIME-sniff responses away from the declared content-type, potentially executing malicious scripts disguised as images.',
      recommendation: 'Add "X-Content-Type-Options: nosniff" to all HTTP responses.',
      technicalDetails: 'X-Content-Type-Options: nosniff',
      location: 'HTTP Response Headers',
      passed: false,
      scoreImpact: 6
    });
  } else {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.content-type-options-valid',
      severity: 'passed',
      title: 'X-Content-Type-Options header configured',
      description: 'Header is properly set to "nosniff".',
      impact: 'Prevents MIME confusion attacks.',
      recommendation: 'Keep header on all static and dynamic endpoints.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 5. Frame Protection (Clickjacking defense)
  const xFrame = headers['x-frame-options'];
  const hasFrameAncestors = csp && csp.toLowerCase().includes('frame-ancestors');
  if (!xFrame && !hasFrameAncestors) {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.missing-frame-protection',
      severity: 'medium',
      title: 'Missing Clickjacking protection (X-Frame-Options / frame-ancestors)',
      description: 'The page does not prevent itself from being embedded in an iframe on other origins.',
      impact: 'Attackers can overlay invisible iframes to trick users into clicking sensitive buttons (Clickjacking).',
      recommendation: 'Add "X-Frame-Options: SAMEORIGIN" or "Content-Security-Policy: frame-ancestors \'self\'".',
      technicalDetails: 'X-Frame-Options: SAMEORIGIN',
      location: 'HTTP Response Headers',
      passed: false,
      scoreImpact: 6
    });
  } else {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.frame-protection-active',
      severity: 'passed',
      title: 'Clickjacking protection is active',
      description: `Protected via ${xFrame ? 'X-Frame-Options: ' + xFrame : 'CSP frame-ancestors'}.`,
      impact: 'Prevents unauthorized framing of page content.',
      recommendation: 'Keep protection active.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 6. Referrer-Policy
  const referrerPolicy = headers['referrer-policy'];
  if (!referrerPolicy) {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.missing-referrer-policy',
      severity: 'low',
      title: 'Missing Referrer-Policy header',
      description: 'No explicit Referrer-Policy header was configured on the server response.',
      impact: 'May leak sensitive URL query parameters to third-party domains when users click external links.',
      recommendation: 'Add "Referrer-Policy: strict-origin-when-cross-origin" or "no-referrer-when-downgrade".',
      technicalDetails: 'Referrer-Policy: strict-origin-when-cross-origin',
      location: 'HTTP Response Headers',
      passed: false,
      scoreImpact: 3
    });
  } else {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.referrer-policy-active',
      severity: 'passed',
      title: 'Referrer-Policy header configured',
      description: `Referrer policy set to "${referrerPolicy}".`,
      impact: 'Controls how much referrer information is sent with outbound requests.',
      recommendation: 'Maintain strict referrer policies.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 7. Permissions-Policy
  const permissionsPolicy = headers['permissions-policy'] || headers['feature-policy'];
  if (!permissionsPolicy) {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.missing-permissions-policy',
      severity: 'low',
      title: 'Missing Permissions-Policy header',
      description: 'Permissions-Policy is not declared.',
      impact: 'Does not explicitly disable browser features like camera, microphone, or geolocation for embedded frames.',
      recommendation: 'Add a Permissions-Policy header disabling unused browser hardware APIs.',
      technicalDetails: 'Permissions-Policy: camera=(), microphone=(), geolocation=()',
      location: 'HTTP Response Headers',
      passed: false,
      scoreImpact: 2
    });
  } else {
    issues.push({
      scanId,
      category: 'security',
      ruleId: 'sec.permissions-policy-active',
      severity: 'passed',
      title: 'Permissions-Policy configured',
      description: 'Permissions-Policy restricts sensitive hardware APIs.',
      impact: 'Limits attack surface from third-party scripts.',
      recommendation: 'Audit permissions periodically.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 8. Mixed Content Check
  if (isHttps) {
    const $ = cheerio.load(httpProbe.html);
    const mixedResources: string[] = [];
    $('script[src^="http://"], link[href^="http://"], img[src^="http://"], iframe[src^="http://"]').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('href') || '';
      mixedResources.push(src);
    });

    if (mixedResources.length > 0) {
      issues.push({
        scanId,
        category: 'security',
        ruleId: 'sec.mixed-content-detected',
        severity: 'high',
        title: `${mixedResources.length} insecure mixed-content resource(s) detected`,
        description: 'The page is served over HTTPS but loads assets (scripts, images, stylesheets) over insecure HTTP.',
        impact: 'Browsers may block these resources, or attackers could tamper with HTTP scripts to compromise the page.',
        recommendation: 'Update all asset URLs to use HTTPS or relative paths.',
        technicalDetails: `Insecure assets: ${mixedResources.slice(0, 3).join(', ')}`,
        passed: false,
        scoreImpact: 15
      });
    } else {
      issues.push({
        scanId,
        category: 'security',
        ruleId: 'sec.no-mixed-content',
        severity: 'passed',
        title: 'No mixed content detected',
        description: 'All static resources are loaded securely over HTTPS.',
        impact: 'Maintains end-to-end encryption integrity.',
        recommendation: 'Continue referencing assets over HTTPS.',
        passed: true,
        scoreImpact: 0
      });
    }
  }

  return { issues, metrics };
}
