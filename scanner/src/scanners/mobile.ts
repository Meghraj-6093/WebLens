import * as cheerio from 'cheerio';
import { AuditResult, MetricItem } from '@weblens/shared';
import { HttpProbeResult } from '../engine/fetcher.js';
import { BrowserScanData } from '../engine/browser.js';

export interface MobileScanResult {
  issues: AuditResult[];
  metrics: MetricItem[];
}

export function runMobileAudit(
  scanId: string,
  httpProbe: HttpProbeResult,
  browserData?: BrowserScanData
): MobileScanResult {
  const issues: AuditResult[] = [];
  const metrics: MetricItem[] = [];

  const $ = cheerio.load(httpProbe.html);

  // 1. Viewport Meta Tag
  const viewportContent = $('head meta[name="viewport"]').attr('content') || browserData?.mobileMetrics?.viewportMeta || '';
  const hasViewport = Boolean(viewportContent);
  const hasDeviceWidth = viewportContent.includes('width=device-width');
  const hasInitialScale = viewportContent.includes('initial-scale');
  const blocksScaling = viewportContent.includes('user-scalable=no') || viewportContent.includes('maximum-scale=1');

  metrics.push({
    id: 'mobile.viewport',
    name: 'Viewport Configuration',
    value: hasViewport ? (hasDeviceWidth ? 'Configured' : 'Incomplete') : 'Missing',
    status: hasViewport && hasDeviceWidth ? 'good' : 'poor',
    description: 'Tells mobile browsers how to adjust the dimensions and scaling of the page.'
  });

  if (!hasViewport) {
    issues.push({
      scanId,
      category: 'mobile',
      ruleId: 'mobile.missing-viewport',
      severity: 'critical',
      title: 'Missing viewport meta tag',
      description: 'The document lacks a <meta name="viewport"> tag in the <head>.',
      impact: 'Mobile browsers will render the page at a desktop screen width (typically 980px) and shrink it down, forcing users to pinch-and-zoom to read text.',
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to your <head>.',
      technicalDetails: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      location: '<head>',
      passed: false,
      scoreImpact: 30
    });
  } else if (!hasDeviceWidth || !hasInitialScale) {
    issues.push({
      scanId,
      category: 'mobile',
      ruleId: 'mobile.incomplete-viewport',
      severity: 'medium',
      title: 'Incomplete viewport meta tag',
      description: `Viewport tag is set to "${viewportContent}", missing width=device-width or initial-scale=1.0.`,
      impact: 'May cause unexpected zoom levels on different mobile devices.',
      recommendation: 'Use standard viewport syntax: width=device-width, initial-scale=1.0.',
      location: '<head><meta name="viewport">',
      passed: false,
      scoreImpact: 10
    });
  } else if (blocksScaling) {
    issues.push({
      scanId,
      category: 'mobile',
      ruleId: 'mobile.blocks-pinch-zoom',
      severity: 'high',
      title: 'Viewport blocks pinch-to-zoom magnification',
      description: 'The viewport meta tag includes user-scalable=no or maximum-scale=1.',
      impact: 'Prevents visually impaired users from zooming into content on mobile screens, violating WCAG accessibility guidelines.',
      recommendation: 'Remove user-scalable=no and allow users to zoom.',
      location: '<head><meta name="viewport">',
      passed: false,
      scoreImpact: 12
    });
  } else {
    issues.push({
      scanId,
      category: 'mobile',
      ruleId: 'mobile.viewport-optimal',
      severity: 'passed',
      title: 'Viewport is configured correctly',
      description: 'Proper width=device-width, initial-scale=1.0 detected.',
      impact: 'Ensures page scales fluidly to mobile screen sizes.',
      recommendation: 'Maintain responsive viewport tag.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 2. Horizontal Content Overflow
  const hasOverflow = browserData?.mobileMetrics?.hasOverflow ?? false;
  if (hasOverflow) {
    issues.push({
      scanId,
      category: 'mobile',
      ruleId: 'mobile.horizontal-overflow',
      severity: 'high',
      title: 'Content horizontally overflows viewport',
      description: 'Elements on the page exceed the device screen width, triggering unintended horizontal scrolling.',
      impact: 'Damages mobile UX, causing awkward layout panning and cut-off text.',
      recommendation: 'Ensure containers use max-width: 100% or overflow-x: hidden on root wrappers.',
      passed: false,
      scoreImpact: 15
    });
  } else {
    issues.push({
      scanId,
      category: 'mobile',
      ruleId: 'mobile.no-overflow',
      severity: 'passed',
      title: 'No horizontal overflow detected',
      description: 'Page content fits comfortably within mobile screen bounds.',
      impact: 'Smooth vertical scrolling experience.',
      recommendation: 'Test future complex tables or widgets on small screens.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 3. Touch Target Sizing Check
  const smallTargets = browserData?.mobileMetrics?.smallTouchTargets || [];
  if (smallTargets.length > 0) {
    issues.push({
      scanId,
      category: 'mobile',
      ruleId: 'mobile.small-touch-targets',
      severity: 'medium',
      title: `${smallTargets.length} tap target(s) are too small`,
      description: 'Interactive buttons, links, or inputs are smaller than the recommended 44x44px or 48x48px touch target area.',
      impact: 'Mobile users on touchscreen devices will frequently mis-tap neighboring elements.',
      recommendation: 'Add padding or min-height/min-width: 44px to clickable buttons and navigation links.',
      technicalDetails: `Small elements: ${smallTargets.slice(0, 3).map(t => `${t.selector} (${t.width}x${t.height}px)`).join(', ')}`,
      passed: false,
      scoreImpact: 8
    });
  } else {
    issues.push({
      scanId,
      category: 'mobile',
      ruleId: 'mobile.touch-targets-adequate',
      severity: 'passed',
      title: 'Interactive tap targets are adequately sized',
      description: 'Buttons and links provide sufficient touch target surface area.',
      impact: 'Easy touch interaction on phones and tablets.',
      recommendation: 'Keep minimum 44px hit-target padding.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 4. Responsive Images Check
  const images = $('img');
  let responsiveImageCount = 0;
  images.each((_, el) => {
    const srcset = $(el).attr('srcset');
    const sizes = $(el).attr('sizes');
    const isPicture = $(el).closest('picture').length > 0;
    if (srcset || sizes || isPicture) {
      responsiveImageCount++;
    }
  });

  if (images.length > 3 && responsiveImageCount === 0) {
    issues.push({
      scanId,
      category: 'mobile',
      ruleId: 'mobile.no-responsive-images',
      severity: 'low',
      title: 'Consider using responsive image tags (srcset / <picture>)',
      description: `Found ${images.length} images, none of which utilize responsive srcset or <picture> tags.`,
      impact: 'Mobile devices download full desktop-sized images over cellular connections, wasting data and slowing load times.',
      recommendation: 'Implement srcset with multiple image resolutions for different device pixel densities.',
      technicalDetails: '<img src="small.jpg" srcset="large.jpg 1024w, small.jpg 480w" sizes="(max-width: 600px) 480px, 1024px" />',
      passed: false,
      scoreImpact: 4
    });
  } else {
    issues.push({
      scanId,
      category: 'mobile',
      ruleId: 'mobile.responsive-images-supported',
      severity: 'passed',
      title: 'Responsive image structure supported',
      description: 'Images adapt to device viewports appropriately.',
      impact: 'Saves mobile bandwidth and improves battery life.',
      recommendation: 'Continue serving optimized responsive assets.',
      passed: true,
      scoreImpact: 0
    });
  }

  return { issues, metrics };
}
