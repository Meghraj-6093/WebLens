import dns from 'dns/promises';
import ipaddr from 'ipaddr.js';

export interface SSRFValidationResult {
  isValid: boolean;
  error?: string;
  resolvedIp?: string;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.internal',
  'instance-data',
  'kubernetes.default',
]);

export async function validateUrlAgainstSSRF(inputUrl: string): Promise<SSRFValidationResult> {
  try {
    let parsed: URL;
    try {
      parsed = new URL(inputUrl);
    } catch {
      return { isValid: false, error: 'Invalid URL format.' };
    }

    // Protocol check: Only allow HTTP and HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { 
        isValid: false, 
        error: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.` 
      };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check blocked hostnames
    if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { isValid: false, error: 'Target hostname is not permitted.' };
    }

    // Direct IP or DNS resolution
    let ipToCheck = hostname;
    let isDirectIp = false;

    try {
      if (ipaddr.isValid(hostname)) {
        isDirectIp = true;
        ipToCheck = hostname;
      }
    } catch {
      // not a direct IP
    }

    if (!isDirectIp) {
      try {
        const lookupResult = await dns.lookup(hostname, { all: true });
        if (!lookupResult || lookupResult.length === 0) {
          return { isValid: false, error: `Could not resolve hostname "${hostname}".` };
        }
        // Verify all resolved IPs
        for (const addressEntry of lookupResult) {
          const check = isIpRestricted(addressEntry.address);
          if (check.isRestricted) {
            return { 
              isValid: false, 
              error: `Access to restricted/internal IP (${addressEntry.address}) is blocked.`,
              resolvedIp: addressEntry.address
            };
          }
        }
        ipToCheck = lookupResult[0].address;
      } catch (err: any) {
        return { isValid: false, error: `DNS lookup failed for "${hostname}": ${err.message || 'Host not found'}` };
      }
    } else {
      const check = isIpRestricted(ipToCheck);
      if (check.isRestricted) {
        return { 
          isValid: false, 
          error: `Access to restricted/internal IP (${ipToCheck}) is blocked.`,
          resolvedIp: ipToCheck
        };
      }
    }

    return { isValid: true, resolvedIp: ipToCheck };
  } catch (err: any) {
    return { isValid: false, error: `SSRF validation error: ${err.message || 'Unknown error'}` };
  }
}

function isIpRestricted(ipString: string): { isRestricted: boolean; range?: string } {
  try {
    const addr = ipaddr.parse(ipString);
    const range = addr.range();

    // Restricted ranges for IPv4 & IPv6
    const restrictedRanges = [
      'loopback',         // 127.0.0.0/8, ::1
      'private',          // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
      'linkLocal',        // 169.254.0.0/16, fe80::/10
      'carrierGradeNat',  // 100.64.0.0/10
      'uniqueLocal',      // fc00::/7
      'multicast',        // 224.0.0.0/4, ff00::/8
      'broadcast',        // 255.255.255.255
      'unspecified',      // 0.0.0.0, ::
      'reserved',
    ];

    if (restrictedRanges.includes(range)) {
      return { isRestricted: true, range };
    }

    // Special check for AWS/GCP cloud metadata IP: 169.254.169.254
    if (ipString === '169.254.169.254' || ipString === '127.0.0.1') {
      return { isRestricted: true, range: 'metadata/loopback' };
    }

    return { isRestricted: false };
  } catch {
    // If it cannot be parsed, treat as restricted for safety
    return { isRestricted: true, range: 'invalid_parse' };
  }
}
