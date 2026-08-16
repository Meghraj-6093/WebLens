import * as cheerio from 'cheerio';
import { AuditResult, MetricItem } from '@weblens/shared';
import { HttpProbeResult } from '../engine/fetcher.js';

export interface SeoScanResult {
  issues: AuditResult[];
  metrics: MetricItem[];
}

export function runSeoAudit(scanId: string, httpProbe: HttpProbeResult): SeoScanResult {
  const issues: AuditResult[] = [];
  const metrics: MetricItem[] = [];

  const $ = cheerio.load(httpProbe.html);

  // 1. Page Title Check
  const titleText = $('head title').text().trim();
  metrics.push({
    id: 'seo.title',
    name: 'Title Length',
    value: titleText ? `${titleText.length} characters` : 'Missing',
    status: titleText && titleText.length >= 25 && titleText.length <= 65 ? 'good' : 'needs_improvement',
    description: 'The title element defines the title of the document in search engines and browser tabs.'
  });

  if (!titleText) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.missing-title',
      severity: 'critical',
      title: 'Missing <title> tag',
      description: 'The document does not contain a <title> element in the <head>.',
      impact: 'Search engines cannot display an accurate title in search results, devastating click-through rates and SEO ranking.',
      recommendation: 'Add a concise, descriptive <title> tag to the <head> of the document (between 30 and 60 characters).',
      technicalDetails: '<title>Your Page Title - Brand</title>',
      location: '<head>',
      passed: false,
      scoreImpact: 20
    });
  } else if (titleText.length < 20) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.title-too-short',
      severity: 'medium',
      title: 'Page title is too short',
      description: `The page title is only ${titleText.length} characters long: "${titleText}".`,
      impact: 'Short titles miss out on valuable keywords and clarity for search engine users.',
      recommendation: 'Expand your title to between 30 and 65 characters including relevant keywords and brand identity.',
      technicalDetails: `Current title: "${titleText}" (${titleText.length} chars). Target: 30-65 chars.`,
      location: '<head><title>',
      passed: false,
      scoreImpact: 6
    });
  } else if (titleText.length > 70) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.title-too-long',
      severity: 'low',
      title: 'Page title may be truncated in search results',
      description: `The page title is ${titleText.length} characters long: "${titleText.substring(0, 50)}...".`,
      impact: 'Google typically truncates titles longer than 60-70 characters on search result pages.',
      recommendation: 'Keep your title under 65 characters to prevent awkward mid-phrase truncation in SERPs.',
      technicalDetails: `Current length: ${titleText.length} chars.`,
      location: '<head><title>',
      passed: false,
      scoreImpact: 3
    });
  } else {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.title-optimal',
      severity: 'passed',
      title: 'Page title is well-crafted',
      description: `Title length is optimal (${titleText.length} characters): "${titleText}".`,
      impact: 'Title displays cleanly in search engine results.',
      recommendation: 'Maintain relevant keyword focus.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 2. Meta Description Check
  const metaDescription = $('head meta[name="description"]').attr('content')?.trim() || '';
  metrics.push({
    id: 'seo.meta_description',
    name: 'Meta Description Length',
    value: metaDescription ? `${metaDescription.length} characters` : 'Missing',
    status: metaDescription && metaDescription.length >= 70 && metaDescription.length <= 160 ? 'good' : 'needs_improvement',
    description: 'Summary snippet shown below the title in search engine results.'
  });

  if (!metaDescription) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.missing-meta-description',
      severity: 'high',
      title: 'Missing meta description',
      description: 'No <meta name="description"> tag was found in the <head>.',
      impact: 'Search engines will automatically generate arbitrary snippets from page text, often resulting in suboptimal snippets.',
      recommendation: 'Add a compelling meta description between 80 and 160 characters summarizing the page value.',
      technicalDetails: '<meta name="description" content="Discover instant website diagnostics...">',
      location: '<head>',
      passed: false,
      scoreImpact: 10
    });
  } else if (metaDescription.length < 50) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.meta-description-too-short',
      severity: 'medium',
      title: 'Meta description is too brief',
      description: `Meta description is only ${metaDescription.length} characters.`,
      impact: 'Brief descriptions underutilize available snippet real estate on search engine result pages.',
      recommendation: 'Expand description to 100-155 characters with a clear call to action.',
      technicalDetails: `Content: "${metaDescription}"`,
      location: '<head><meta name="description">',
      passed: false,
      scoreImpact: 5
    });
  } else if (metaDescription.length > 165) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.meta-description-too-long',
      severity: 'low',
      title: 'Meta description exceeds recommended limit',
      description: `Meta description is ${metaDescription.length} characters long and may be truncated.`,
      impact: 'Search engines will cut off description with ellipses ("...") past ~160 characters.',
      recommendation: 'Shorten description to under 160 characters.',
      location: '<head><meta name="description">',
      passed: false,
      scoreImpact: 3
    });
  } else {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.meta-description-optimal',
      severity: 'passed',
      title: 'Meta description is optimal',
      description: `Meta description is present with ${metaDescription.length} characters.`,
      impact: 'Provides clean snippet preview for search engines.',
      recommendation: 'Keep copy enticing to maximize click-through rate.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 3. H1 Heading Check
  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  metrics.push({
    id: 'seo.h1_count',
    name: 'H1 Headings',
    value: `${h1Count} found`,
    status: h1Count === 1 ? 'good' : 'needs_improvement',
    description: 'The primary headline representing the main subject of the webpage.'
  });

  if (h1Count === 0) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.missing-h1',
      severity: 'high',
      title: 'Missing <h1> headline',
      description: 'The page does not contain any <h1> heading elements.',
      impact: 'H1 is a key signal used by search engines to understand the primary topic of the page.',
      recommendation: 'Add a single, prominent <h1> element containing your primary topic keyword.',
      technicalDetails: '<h1>Your Main Topic</h1>',
      passed: false,
      scoreImpact: 10
    });
  } else if (h1Count > 1) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.multiple-h1',
      severity: 'low',
      title: 'Multiple <h1> headlines detected',
      description: `Page contains ${h1Count} <h1> elements. While HTML5 technically permits multiple H1s, best practice recommends a single primary H1.`,
      impact: 'Can dilute topic clarity for search engines and assistive technology.',
      recommendation: 'Use a single <h1> for the main page title, and use <h2> and <h3> for secondary sections.',
      technicalDetails: `Found ${h1Count} H1 tags.`,
      passed: false,
      scoreImpact: 3
    });
  } else {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.h1-optimal',
      severity: 'passed',
      title: 'Proper <h1> headline structure',
      description: `Page contains exactly 1 <h1> headline: "${h1Elements.first().text().trim().substring(0, 40)}...".`,
      impact: 'Clear hierarchical semantic signal for search crawlers.',
      recommendation: 'Ensure H1 matches page intent.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 4. Canonical Tag Check
  const canonicalHref = $('head link[rel="canonical"]').attr('href')?.trim();
  if (!canonicalHref) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.missing-canonical',
      severity: 'medium',
      title: 'Missing canonical link tag',
      description: 'No <link rel="canonical"> tag was found in the <head>.',
      impact: 'Duplicate URL parameters or HTTP/HTTPS variants can lead to duplicate content penalties in search engines.',
      recommendation: 'Add a self-referencing canonical URL in the <head>.',
      technicalDetails: `<link rel="canonical" href="${httpProbe.finalUrl}" />`,
      location: '<head>',
      passed: false,
      scoreImpact: 5
    });
  } else {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.canonical-present',
      severity: 'passed',
      title: 'Canonical URL specified',
      description: `Canonical link found: "${canonicalHref}".`,
      impact: 'Prevents duplicate content issues across URL variations.',
      recommendation: 'Ensure canonical target matches absolute published URL.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 5. Language Attribute Check
  const htmlLang = $('html').attr('lang')?.trim();
  if (!htmlLang) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.missing-html-lang',
      severity: 'medium',
      title: 'Missing "lang" attribute on <html> tag',
      description: 'The root <html> tag does not define a language code.',
      impact: 'Search engines and translation tools struggle to determine target regional audience.',
      recommendation: 'Add the appropriate language code to the <html> tag (e.g. <html lang="en">).',
      technicalDetails: '<html lang="en">',
      location: '<html>',
      passed: false,
      scoreImpact: 5
    });
  } else {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.html-lang-valid',
      severity: 'passed',
      title: 'HTML language attribute is defined',
      description: `Document language set to "${htmlLang}".`,
      impact: 'Search engines and screen readers correctly identify document locale.',
      recommendation: 'Keep language code synchronized with actual content.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 6. Open Graph & Social Sharing Metadata
  const ogTitle = $('head meta[property="og:title"]').attr('content');
  const ogImage = $('head meta[property="og:image"]').attr('content');
  const ogDesc = $('head meta[property="og:description"]').attr('content');
  const twitterCard = $('head meta[name="twitter:card"], head meta[property="twitter:card"]').attr('content');

  if (!ogTitle || !ogImage) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.incomplete-open-graph',
      severity: 'medium',
      title: 'Incomplete Open Graph / Social sharing tags',
      description: 'Missing essential Open Graph tags (such as og:title or og:image) for rich social card previews.',
      impact: 'When shared on Slack, Twitter/X, LinkedIn, or Facebook, the link will render with a plain text link or blank thumbnail.',
      recommendation: 'Add og:title, og:description, og:image, and og:url in <head>.',
      technicalDetails: '<meta property="og:title" content="..." />\n<meta property="og:image" content="https://.../og.jpg" />',
      location: '<head>',
      passed: false,
      scoreImpact: 6
    });
  } else {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.open-graph-present',
      severity: 'passed',
      title: 'Open Graph social metadata configured',
      description: 'Valid Open Graph title and image tags found.',
      impact: 'Produces rich link preview cards across messaging platforms and social networks.',
      recommendation: 'Ensure preview image is 1200x630px for optimal clarity.',
      passed: true,
      scoreImpact: 0
    });
  }

  // 7. Robots.txt and Sitemap.xml
  if (httpProbe.robotsTxt?.exists) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.robots-txt-found',
      severity: 'passed',
      title: 'robots.txt file is accessible',
      description: 'Valid robots.txt file was detected at root domain.',
      impact: 'Guides search engine crawler indexing rules.',
      recommendation: 'Ensure disallow directives do not accidentally block important public landing pages.',
      passed: true,
      scoreImpact: 0
    });
  } else {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.robots-txt-missing',
      severity: 'low',
      title: 'robots.txt file not found',
      description: 'No robots.txt file was found at /robots.txt.',
      impact: 'Crawlers will assume all URLs are permitted, but having an explicit robots.txt is standard best practice.',
      recommendation: 'Create a robots.txt file at the root of your domain.',
      technicalDetails: 'User-agent: *\nAllow: /\nSitemap: https://yourdomain.com/sitemap.xml',
      passed: false,
      scoreImpact: 2
    });
  }

  if (httpProbe.sitemapXml?.exists) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.sitemap-found',
      severity: 'passed',
      title: 'XML Sitemap detected',
      description: `Sitemap found at: ${httpProbe.sitemapXml.url || '/sitemap.xml'}.`,
      impact: 'Accelerates indexing of new and updated pages in Google and Bing.',
      recommendation: 'Keep sitemap automatically updated on content publishing.',
      passed: true,
      scoreImpact: 0
    });
  } else {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.sitemap-missing',
      severity: 'low',
      title: 'XML Sitemap not detected',
      description: 'Could not locate /sitemap.xml or a sitemap reference in robots.txt.',
      impact: 'Search engines may take longer to discover deep pages.',
      recommendation: 'Generate an XML sitemap and reference it in robots.txt.',
      passed: false,
      scoreImpact: 2
    });
  }

  // 8. Image Alt Text Check (SEO perspective)
  const images = $('img');
  let missingAltCount = 0;
  images.each((_, img) => {
    const alt = $(img).attr('alt');
    if (alt === undefined || alt === null) {
      missingAltCount++;
    }
  });

  if (missingAltCount > 0) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.images-missing-alt',
      severity: missingAltCount > 5 ? 'high' : 'medium',
      title: `${missingAltCount} image(s) missing alt attributes`,
      description: `Found ${missingAltCount} out of ${images.length} image(s) lacking an alt attribute.`,
      impact: 'Search engines use image alt text for image search indexing and contextual page understanding.',
      recommendation: 'Add descriptive alt text to all informational images, or empty alt="" for purely decorative graphics.',
      technicalDetails: `<img src="..." alt="Descriptive caption" />`,
      passed: false,
      scoreImpact: missingAltCount > 5 ? 8 : 4
    });
  } else if (images.length > 0) {
    issues.push({
      scanId,
      category: 'seo',
      ruleId: 'seo.all-images-have-alt',
      severity: 'passed',
      title: 'All images have alt attributes',
      description: `All ${images.length} images on page have valid alt attributes.`,
      impact: 'Enhances image SEO and accessibility.',
      recommendation: 'Maintain descriptive alt text on future uploads.',
      passed: true,
      scoreImpact: 0
    });
  }

  return { issues, metrics };
}
