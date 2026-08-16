import https from 'https';
import http from 'http';
import { ResourceRecord, ResourceType } from '@weblens/shared';
import { validateUrlAgainstSSRF } from './ssrf.js';

export interface HttpProbeResult {
  statusCode: number;
  finalUrl: string;
  redirectCount: number;
  headers: Record<string, string>;
  html: string;
  isHttps: boolean;
  ttfbMs: number;
  totalTimeMs: number;
  contentLengthBytes: number;
  robotsTxt?: { exists: boolean; content?: string };
  sitemapXml?: { exists: boolean; url?: string };
  ssl?: {
    valid: boolean;
    issuer?: string;
    validTo?: string;
    daysRemaining?: number;
    protocol?: string;
  };
}

export async function probeHttpAndTls(targetUrl: string, timeoutMs: number = 15000): Promise<HttpProbeResult> {
  const startTime = Date.now();
  let currentUrl = targetUrl;
  let redirectCount = 0;
  const maxRedirects = 5;
  let finalResponse: Response | null = null;
  let ttfbMs = 0;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Manual redirect following loop with strict SSRF re-validation on each hop
    while (redirectCount <= maxRedirects) {
      // Validate current URL against SSRF before fetching
      const ssrfCheck = await validateUrlAgainstSSRF(currentUrl);
      if (!ssrfCheck.isValid) {
        throw new Error(`Blocked restricted destination on redirect hop (${currentUrl}): ${ssrfCheck.error}`);
      }

      const hopStartTime = Date.now();
      const response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 WebLens/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        signal: controller.signal,
        redirect: 'manual' // Do not follow redirects automatically
      });

      if (redirectCount === 0) {
        ttfbMs = Date.now() - hopStartTime;
      }

      // Check if redirect status
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          finalResponse = response;
          break;
        }

        // Resolve relative redirects
        const nextUrl = new URL(location, currentUrl).toString();
        currentUrl = nextUrl;
        redirectCount++;
        continue;
      }

      finalResponse = response;
      break;
    }

    if (!finalResponse) {
      throw new Error(`Too many redirects (exceeded ${maxRedirects} hops)`);
    }

    const html = await finalResponse.text();
    const totalTimeMs = Date.now() - startTime;
    clearTimeout(timeoutId);

    const headers: Record<string, string> = {};
    finalResponse.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    const isHttps = currentUrl.startsWith('https://');
    const contentLength = html.length;

    // Check SSL metadata if HTTPS
    let sslInfo: HttpProbeResult['ssl'] = undefined;
    if (isHttps) {
      sslInfo = await getSslCertificateInfo(currentUrl);
    }

    // Check robots.txt & sitemap.xml
    const parsedUrl = new URL(currentUrl);
    const origin = parsedUrl.origin;
    const robotsTxt = await checkRobotsTxt(origin);
    const sitemapXml = await checkSitemap(origin, robotsTxt.content);

    return {
      statusCode: finalResponse.status,
      finalUrl: currentUrl,
      redirectCount,
      headers,
      html,
      isHttps,
      ttfbMs: ttfbMs || 250,
      totalTimeMs,
      contentLengthBytes: contentLength,
      robotsTxt,
      sitemapXml,
      ssl: sslInfo
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw new Error(`Failed to probe target URL (${targetUrl}): ${err.message || 'Connection timeout or network error'}`);
  }
}

async function getSslCertificateInfo(urlStr: string): Promise<HttpProbeResult['ssl']> {
  try {
    const urlObj = new URL(urlStr);
    return new Promise((resolve) => {
      const req = https.request(
        {
          hostname: urlObj.hostname,
          port: urlObj.port || 443,
          method: 'HEAD',
          agent: false,
          rejectUnauthorized: false,
          timeout: 5000,
        },
        (res) => {
          const socket = res.socket as any;
          if (socket && socket.getPeerCertificate) {
            const cert = socket.getPeerCertificate();
            if (cert && cert.valid_to) {
              const validTo = new Date(cert.valid_to);
              const daysRemaining = Math.round((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              resolve({
                valid: daysRemaining > 0,
                issuer: typeof cert.issuer === 'object' ? cert.issuer.O || cert.issuer.CN : String(cert.issuer),
                validTo: cert.valid_to,
                daysRemaining,
                protocol: socket.getProtocol ? socket.getProtocol() : 'TLS'
              });
              return;
            }
          }
          resolve({ valid: true });
        }
      );

      req.on('error', () => resolve({ valid: false }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ valid: false });
      });
      req.end();
    });
  } catch {
    return { valid: false };
  }
}

async function checkRobotsTxt(origin: string): Promise<{ exists: boolean; content?: string }> {
  try {
    const ssrf = await validateUrlAgainstSSRF(`${origin}/robots.txt`);
    if (!ssrf.isValid) return { exists: false };

    const res = await fetch(`${origin}/robots.txt`, {
      method: 'GET',
      headers: { 'User-Agent': 'WebLens/1.0' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const text = await res.text();
      return { exists: true, content: text };
    }
    return { exists: false };
  } catch {
    return { exists: false };
  }
}

async function checkSitemap(origin: string, robotsContent?: string): Promise<{ exists: boolean; url?: string }> {
  if (robotsContent) {
    const match = robotsContent.match(/Sitemap:\s*(https?:\/\/[^\s]+)/i);
    if (match && match[1]) {
      const ssrf = await validateUrlAgainstSSRF(match[1]);
      if (ssrf.isValid) {
        return { exists: true, url: match[1] };
      }
    }
  }

  try {
    const sitemapUrl = `${origin}/sitemap.xml`;
    const ssrf = await validateUrlAgainstSSRF(sitemapUrl);
    if (!ssrf.isValid) return { exists: false };

    const res = await fetch(sitemapUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': 'WebLens/1.0' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      return { exists: true, url: sitemapUrl };
    }
    return { exists: false };
  } catch {
    return { exists: false };
  }
}
