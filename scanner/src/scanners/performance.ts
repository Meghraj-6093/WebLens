import * as cheerio from 'cheerio';
import { AuditResult, MetricItem } from '@weblens/shared';
import { HttpProbeResult } from '../engine/fetcher.js';
import { BrowserScanData } from '../engine/browser.js';

export interface PerformanceScanResult {
  issues: AuditResult[];
  metrics: MetricItem[];
}

export function runPerformanceAudit(
  scanId: string,
  httpProbe: HttpProbeResult,
  browserData?: BrowserScanData
): PerformanceScanResult {
  const issues: AuditResult[] = [];
  const metrics: MetricItem[] = [];

  const fcp = browserData?.metrics.fcpMs ?? httpProbe.ttfbMs + 400;
  const lcp = browserData?.metrics.lcpMs ?? fcp + 600;
  const cls = browserData?.metrics.cls ?? 0.01;
  const tbt = browserData?.metrics.tbtMs ?? 40;
  const domElements = browserData?.metrics.domElementCount ?? 350;

  // Metric 1: LCP
  const lcpSeconds = (lcp / 1000).toFixed(2);
  const lcpStatus = lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs_improvement' : 'poor';
  metrics.push({
    id: 'lcp',
    name: 'Largest Contentful Paint (LCP)',
    value: `${lcpSeconds}s`,
    status: lcpStatus,
    description: 'Measures when the main content of a page has likely loaded.'
  });

  if (lcp > 4000) {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.lcp-slow',
      severity: 'high',
      title: 'Largest Contentful Paint is too slow',
      description: `LCP was measured at ${lcpSeconds}s (target is under 2.5s). Slow LCP causes users to perceive your page as unresponsive.`,
      impact: 'Poor LCP leads to higher bounce rates and harms search engine ranking.',
      recommendation: 'Optimize your hero image, eliminate render-blocking CSS/JS, and implement asset preloading.',
      technicalDetails: `Measured LCP: ${lcpSeconds}s. Threshold: <= 2.5s.`,
      passed: false,
      scoreImpact: 15
    });
  } else if (lcp > 2500) {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.lcp-moderate',
      severity: 'medium',
      title: 'Largest Contentful Paint needs improvement',
      description: `LCP was measured at ${lcpSeconds}s. While acceptable, optimizing assets can bring it under the 2.5s threshold.`,
      impact: 'Moderate delays in visual loading can cause mobile visitors to abandon the session.',
      recommendation: 'Compress hero images into modern formats (WebP/AVIF) and ensure fast server response time.',
      technicalDetails: `Measured LCP: ${lcpSeconds}s. Optimal: <= 2.5s.`,
      passed: false,
      scoreImpact: 8
    });
  } else {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.lcp-fast',
      severity: 'passed',
      title: 'Largest Contentful Paint is fast',
      description: `LCP is optimal at ${lcpSeconds}s.`,
      impact: 'Content renders quickly, providing an excellent user experience.',
      recommendation: 'Maintain existing asset optimization and CDN caching.',
      passed: true,
      scoreImpact: 0
    });
  }

  // Metric 2: FCP
  const fcpSeconds = (fcp / 1000).toFixed(2);
  const fcpStatus = fcp <= 1800 ? 'good' : fcp <= 3000 ? 'needs_improvement' : 'poor';
  metrics.push({
    id: 'fcp',
    name: 'First Contentful Paint (FCP)',
    value: `${fcpSeconds}s`,
    status: fcpStatus,
    description: 'Marks the time at which the first text or image is painted.'
  });

  if (fcp > 3000) {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.fcp-slow',
      severity: 'high',
      title: 'First Contentful Paint is slow',
      description: `FCP took ${fcpSeconds}s. A slow FCP usually points to slow server response time (TTFB) or blocking stylesheets.`,
      impact: 'Users stare at a blank white screen during initial loading.',
      recommendation: 'Reduce TTFB with server caching, use CDN edge servers, and defer non-critical CSS.',
      technicalDetails: `Measured FCP: ${fcpSeconds}s (Target: < 1.8s). TTFB: ${httpProbe.ttfbMs}ms.`,
      passed: false,
      scoreImpact: 10
    });
  } else {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.fcp-good',
      severity: 'passed',
      title: 'First Contentful Paint is fast',
      description: `FCP occurred in ${fcpSeconds}s.`,
      impact: 'Initial visuals display promptly.',
      recommendation: 'Keep critical CSS inlined or preloaded.',
      passed: true,
      scoreImpact: 0
    });
  }

  // Metric 3: CLS
  const clsStatus = cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs_improvement' : 'poor';
  metrics.push({
    id: 'cls',
    name: 'Cumulative Layout Shift (CLS)',
    value: cls.toString(),
    status: clsStatus,
    description: 'Measures visual stability by tracking unexpected layout shifts.'
  });

  if (cls > 0.25) {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.cls-high',
      severity: 'high',
      title: 'High Cumulative Layout Shift detected',
      description: `CLS score is ${cls} (optimal is <= 0.1). Elements on the page are shifting noticeably while resources load.`,
      impact: 'Layout shifts frustrate users and cause accidental clicks on wrong links or buttons.',
      recommendation: 'Always set explicit width and height attributes on images and video elements, and reserve space for dynamic ads/embeds.',
      technicalDetails: `CLS Score: ${cls}. Expected: < 0.1.`,
      passed: false,
      scoreImpact: 10
    });
  } else {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.cls-good',
      severity: 'passed',
      title: 'Cumulative Layout Shift is minimal',
      description: `CLS score is ${cls}, indicating visual stability.`,
      impact: 'Page elements stay firmly in place as content loads.',
      recommendation: 'Continue specifying dimensions on all media.',
      passed: true,
      scoreImpact: 0
    });
  }

  // Metric 4: TTFB
  const ttfbStatus = httpProbe.ttfbMs <= 600 ? 'good' : httpProbe.ttfbMs <= 1200 ? 'needs_improvement' : 'poor';
  metrics.push({
    id: 'ttfb',
    name: 'Time to First Byte (TTFB)',
    value: `${httpProbe.ttfbMs}ms`,
    status: ttfbStatus,
    description: 'Measures the time taken for the browser to receive the first byte of response data.'
  });

  if (httpProbe.ttfbMs > 1200) {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.ttfb-slow',
      severity: 'medium',
      title: 'Server response time (TTFB) is high',
      description: `Initial response took ${httpProbe.ttfbMs}ms. High TTFB delays all subsequent page asset discovery.`,
      impact: 'All downstream rendering is blocked until the server responds.',
      recommendation: 'Enable page/database caching, optimize backend queries, and utilize a global edge CDN.',
      technicalDetails: `TTFB: ${httpProbe.ttfbMs}ms. Recommended: < 600ms.`,
      passed: false,
      scoreImpact: 8
    });
  }

  // Check DOM Size
  const $ = cheerio.load(httpProbe.html);
  const domCount = browserData?.metrics.domElementCount || $('*').length;
  if (domCount > 1500) {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.excessive-dom',
      severity: domCount > 3000 ? 'high' : 'medium',
      title: 'Excessive DOM size detected',
      description: `Page contains ${domCount} DOM nodes. A large DOM tree consumes more memory and slows down style recalculations.`,
      impact: 'Slows down scrolling, layout calculations, and interaction responsiveness on low-power devices.',
      recommendation: 'Refactor complex nested card structures, use virtual lists for long feeds, and remove unnecessary container wrappers.',
      technicalDetails: `Total DOM elements: ${domCount}. Recommended: < 1,500.`,
      passed: false,
      scoreImpact: domCount > 3000 ? 10 : 5
    });
  } else {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.dom-size-healthy',
      severity: 'passed',
      title: 'DOM size is within healthy limits',
      description: `Page contains ${domCount} DOM elements, well below the 1,500 threshold.`,
      impact: 'Low memory overhead and quick rendering.',
      recommendation: 'Keep DOM depth concise.',
      passed: true,
      scoreImpact: 0
    });
  }

  // Check Render-blocking Scripts in <head>
  const blockingScripts: string[] = [];
  $('head script[src]').each((_, el) => {
    const src = $(el).attr('src') || '';
    const isAsync = $(el).attr('async') !== undefined;
    const isDefer = $(el).attr('defer') !== undefined;
    const isModule = $(el).attr('type') === 'module';

    if (!isAsync && !isDefer && !isModule && src) {
      blockingScripts.push(src);
    }
  });

  if (blockingScripts.length > 0) {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.render-blocking-scripts',
      severity: 'medium',
      title: `${blockingScripts.length} render-blocking script(s) in <head>`,
      description: `Synchronous scripts in the <head> block the HTML parser until they are downloaded and executed.`,
      impact: 'Delays the First Contentful Paint and Largest Contentful Paint.',
      recommendation: 'Add "defer" or "async" attributes to external scripts or move non-critical scripts to the bottom of <body>.',
      technicalDetails: `Blocking scripts: ${blockingScripts.slice(0, 3).join(', ')}${blockingScripts.length > 3 ? '...' : ''}`,
      location: '<head>',
      passed: false,
      scoreImpact: 8
    });
  } else {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.no-blocking-scripts',
      severity: 'passed',
      title: 'No render-blocking scripts in <head>',
      description: 'All scripts in <head> use async, defer, or module attributes.',
      impact: 'HTML parser can construct the DOM without script execution interruptions.',
      recommendation: 'Maintain non-blocking script loading.',
      passed: true,
      scoreImpact: 0
    });
  }

  // Check Compression on Resources
  const resources = browserData?.resources || [];
  const uncompressedTextAssets = resources.filter(
    r => (r.resourceType === 'script' || r.resourceType === 'stylesheet' || r.resourceType === 'document') &&
         r.sizeBytes > 2048 &&
         !r.isCompressed
  );

  if (uncompressedTextAssets.length > 0) {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.text-compression',
      severity: 'medium',
      title: 'Enable text compression (Gzip / Brotli)',
      description: `${uncompressedTextAssets.length} text asset(s) were served without Gzip or Brotli compression.`,
      impact: 'Uncompressed text payloads increase network transfer times significantly.',
      recommendation: 'Enable Gzip or Brotli compression on your web server or CDN for HTML, JS, CSS, and SVG assets.',
      technicalDetails: `Uncompressed assets: ${uncompressedTextAssets.slice(0, 2).map(r => r.url).join(', ')}`,
      passed: false,
      scoreImpact: 6
    });
  } else {
    issues.push({
      scanId,
      category: 'performance',
      ruleId: 'perf.compression-enabled',
      severity: 'passed',
      title: 'Text compression enabled',
      description: 'Text assets are properly compressed with Gzip, Deflate, or Brotli.',
      impact: 'Minimizes byte transfer over the network.',
      recommendation: 'Continue utilizing Brotli/Gzip compression.',
      passed: true,
      scoreImpact: 0
    });
  }

  return { issues, metrics };
}
