import https from 'https';
import http from 'http';
import { ResourceRecord, ResourceType } from '@weblens/shared';

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
  let ttfbMs = 0;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 WebLens/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    ttfbMs = Date.now() - startTime;
    const html = await response.text();
    const totalTimeMs = Date.now() - startTime;

    clearTimeout(timeoutId);

    const headers: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    const isHttps = response.url.startsWith('https://');
    const contentLength = html.length;

    // Check SSL metadata if HTTPS
    let sslInfo: HttpProbeResult['ssl'] = undefined;
    if (isHttps) {
      sslInfo = await getSslCertificateInfo(response.url);
    }

    // Check robots.txt & sitemap.xml
    const parsedUrl = new URL(response.url);
    const origin = parsedUrl.origin;
    const robotsTxt = await checkRobotsTxt(origin);
    const sitemapXml = await checkSitemap(origin, robotsTxt.content);

    return {
      statusCode: response.status,
      finalUrl: response.url,
      redirectCount: (response as any).redirected ? 1 : 0,
      headers,
      html,
      isHttps,
      ttfbMs,
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
  // Check if sitemap is referenced in robots.txt
  if (robotsContent) {
    const match = robotsContent.match(/Sitemap:\s*(https?:\/\/[^\s]+)/i);
    if (match && match[1]) {
      return { exists: true, url: match[1] };
    }
  }

  // Check default location /sitemap.xml
  try {
    const res = await fetch(`${origin}/sitemap.xml`, {
      method: 'HEAD',
      headers: { 'User-Agent': 'WebLens/1.0' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      return { exists: true, url: `${origin}/sitemap.xml` };
    }
    return { exists: false };
  } catch {
    return { exists: false };
  }
}
