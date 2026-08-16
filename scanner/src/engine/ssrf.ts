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
  'kubernetes.default.svc',
]);

const ALLOWED_PORTS = new Set([80, 443, 8080, 8443, 3000, 5173]);

export async function validateUrlAgainstSSRF(inputUrl: string): Promise<SSRFValidationResult> {
  try {
    let parsed: URL;
    try {
      parsed = new URL(inputUrl);
    } catch {
      return { isValid: false, error: 'Invalid URL format.' };
    }

    // 1. Protocol check: Only allow HTTP and HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { 
        isValid: false, 
        error: `Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.` 
      };
    }

    // 2. Port check: Prevent connecting to arbitrary internal ports (e.g. 22, 6379, 5432, 27017)
    if (parsed.port) {
      const portNum = parseInt(parsed.port, 10);
      if (isNaN(portNum) || !ALLOWED_PORTS.has(portNum)) {
        return {
          isValid: false,
          error: `Port ${parsed.port} is restricted. Only standard web ports (80, 443, 8080, 8443) are allowed.`
        };
      }
    }

    const hostname = parsed.hostname.toLowerCase();

    // 3. Blocked hostnames & special suffixes
    if (
      BLOCKED_HOSTNAMES.has(hostname) ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.localhost')
    ) {
      return { isValid: false, error: 'Target hostname is not permitted.' };
    }

    // 4. Direct IP or DNS resolution
    let ipToCheck = hostname;
    // Strip IPv6 enclosing brackets e.g. [::1] -> ::1
    if (ipToCheck.startsWith('[') && ipToCheck.endsWith(']')) {
      ipToCheck = ipToCheck.slice(1, -1);
    }

    let isDirectIp = false;
    try {
      if (ipaddr.isValid(ipToCheck)) {
        isDirectIp = true;
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

export function isIpRestricted(ipString: string): { isRestricted: boolean; range?: string } {
  try {
    let addr = ipaddr.parse(ipString);

    // Unmap IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1 -> 127.0.0.1)
    if (addr.kind() === 'ipv6' && (addr as ipaddr.IPv6).isIPv4MappedAddress()) {
      addr = (addr as ipaddr.IPv6).toIPv4Address();
    }

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

    const normalizedIp = addr.toString();

    // Special metadata endpoints across cloud providers:
    // 169.254.169.254 (AWS, GCP, Azure, DO)
    // 100.100.100.200 (Alibaba Cloud)
    // fd00:ec2::254 (AWS IPv6 metadata)
    if (
      normalizedIp === '169.254.169.254' ||
      normalizedIp === '100.100.100.200' ||
      normalizedIp === '127.0.0.1' ||
      normalizedIp === '0.0.0.0' ||
      normalizedIp === '::1' ||
      normalizedIp.startsWith('fd00:ec2:')
    ) {
      return { isRestricted: true, range: 'cloud_metadata' };
    }

    return { isRestricted: false };
  } catch {
    // If it cannot be parsed, treat as restricted for safety
    return { isRestricted: true, range: 'invalid_parse' };
  }
}
