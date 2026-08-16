export interface NormalizedUrlResult {
  isValid: boolean;
  normalizedUrl: string;
  domain: string;
  protocol: string;
  error?: string;
}

export function normalizeTargetUrl(rawUrl: string): NormalizedUrlResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      normalizedUrl: '',
      domain: '',
      protocol: '',
      error: 'URL is required.'
    };
  }

  let trimmed = rawUrl.trim();

  // If no scheme provided, default to https://
  if (!/^https?:\/\//i.test(trimmed)) {
    // Check if user accidentally passed something like ftp:// or javascript:
    if (/^[a-zA-Z0-9_-]+:\/\//i.test(trimmed) || /^[a-zA-Z0-9_-]+:/i.test(trimmed)) {
      return {
        isValid: false,
        normalizedUrl: '',
        domain: '',
        protocol: '',
        error: 'Only HTTP and HTTPS protocols are supported.'
      };
    }
    trimmed = `https://${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        normalizedUrl: '',
        domain: '',
        protocol: parsed.protocol,
        error: `Protocol "${parsed.protocol}" is not supported. Use http:// or https://.`
      };
    }

    if (!parsed.hostname || parsed.hostname.length < 3 || !parsed.hostname.includes('.')) {
      // Check if it's a simple single-word hostname
      return {
        isValid: false,
        normalizedUrl: '',
        domain: parsed.hostname || '',
        protocol: parsed.protocol,
        error: 'Please provide a fully qualified domain name (e.g., example.com).'
      };
    }

    const domain = parsed.hostname.toLowerCase();
    const normalizedUrl = parsed.toString();

    return {
      isValid: true,
      normalizedUrl,
      domain,
      protocol: parsed.protocol
    };
  } catch (err: any) {
    return {
      isValid: false,
      normalizedUrl: '',
      domain: '',
      protocol: '',
      error: 'Invalid URL format.'
    };
  }
}
