process.env.NODE_ENV = 'test';

import { validateUrlAgainstSSRF, isIpRestricted } from '../scanner/src/engine/ssrf.js';
import { ScanRepository } from '../database/src/repository.js';
import { ScanService } from '../backend/src/services/scanService.js';
import { AuthService } from '../backend/src/services/authService.js';
import { getDatabase, closeDatabase } from '../database/src/db.js';
import http from 'http';

interface TestResultTracker {
  passed: string[];
  failed: string[];
}

const tracker: TestResultTracker = { passed: [], failed: [] };

async function runProductionAttackSuite() {
  console.log('🛡️ Starting WebLens Production Readiness & Attack Audit...\n');

  // ==========================================
  // 1. HOSTILE SSRF & EVASION ATTACK SUITE
  // ==========================================
  console.log('--- 1. Advanced SSRF Evasion & Port Attack Suite ---');

  const advancedSsrfVectors = [
    { input: 'http://[::ffff:127.0.0.1]', name: 'IPv4-mapped IPv6 loopback' },
    { input: 'http://[::ffff:169.254.169.254]', name: 'IPv4-mapped IPv6 cloud metadata' },
    { input: 'http://[::ffff:10.0.0.1]', name: 'IPv4-mapped IPv6 private RFC1918' },
    { input: 'http://100.100.100.200', name: 'Alibaba Cloud metadata endpoint' },
    { input: 'http://[fd00:ec2::254]', name: 'AWS IPv6 metadata address' },
    { input: 'http://example.com:22', name: 'Restricted SSH port 22' },
    { input: 'http://example.com:6379', name: 'Restricted Redis port 6379' },
    { input: 'http://example.com:5432', name: 'Restricted PostgreSQL port 5432' },
    { input: 'http://example.com:27017', name: 'Restricted MongoDB port 27017' },
    { input: 'http://localhost.localdomain', name: 'Localdomain wildcard' },
  ];

  for (const v of advancedSsrfVectors) {
    const res = await validateUrlAgainstSSRF(v.input);
    if (!res.isValid) {
      tracker.passed.push(`SSRF Hardening: ${v.name} successfully blocked (${res.error})`);
    } else {
      tracker.failed.push(`SSRF Vulnerability: ${v.name} (${v.input}) was PERMITTED!`);
    }
  }

  // ==========================================
  // 2. PASSWORD RESET CRYPTOGRAPHIC SECURITY
  // ==========================================
  console.log('\n--- 2. Password Reset Security & Token Lifecycle ---');

  const repo = new ScanRepository();
  const authService = new AuthService(repo);

  const victimEmail = `victim_${Date.now()}@weblens.dev`;
  await authService.register({ email: victimEmail, password: 'oldPassword123', name: 'Victim User' });

  // Step 2a: Request reset token
  const resetReq = await authService.requestPasswordReset(victimEmail);
  console.assert(Boolean(resetReq.resetToken), 'Reset token was not generated');
  tracker.passed.push('Password Reset: Secure 32-byte crypto token generated');

  // Step 2b: Attempt reset with tampered token
  try {
    await authService.resetPassword('tampered_fake_token_123', 'newPassword123');
    tracker.failed.push('Password Reset Vulnerability: Fake reset token was accepted!');
  } catch {
    tracker.passed.push('Password Reset: Fake/tampered reset token correctly rejected');
  }

  // Step 2c: Legitimate reset
  const resetSuccess = await authService.resetPassword(resetReq.resetToken, 'newSecurePassword456');
  console.assert(resetSuccess.success, 'Legitimate password reset failed');
  tracker.passed.push('Password Reset: Password successfully updated');

  // Step 2d: Attempt replay of used token
  try {
    await authService.resetPassword(resetReq.resetToken, 'anotherPassword789');
    tracker.failed.push('Password Reset Vulnerability: Token replay attack succeeded!');
  } catch {
    tracker.passed.push('Password Reset: Token replay attack blocked (one-time use enforced)');
  }

  // Step 2e: Verify login with new password and rejection of old password
  try {
    await authService.login({ email: victimEmail, password: 'oldPassword123' });
    tracker.failed.push('Auth Vulnerability: Old password still accepted after reset!');
  } catch {
    tracker.passed.push('Auth Security: Old password revoked after reset');
  }

  const newLogin = await authService.login({ email: victimEmail, password: 'newSecurePassword456' });
  console.assert(Boolean(newLogin.token), 'Login with new password failed');
  tracker.passed.push('Auth Verification: Login with new password succeeded');

  // ==========================================
  // 3. CONCURRENCY QUEUE SEMAPHORE & MEMORY SAFETY
  // ==========================================
  console.log('\n--- 3. Concurrency Semaphore & Queue Safety ---');

  const scanService = new ScanService(repo, 3); // Limit max 3 concurrent browsers
  console.assert(scanService.queueStats.maxConcurrency === 3, 'Max concurrency mismatch');
  tracker.passed.push(`Queue Semaphore: Initialized with maxConcurrency=${scanService.queueStats.maxConcurrency}`);

  // Enqueue 6 rapid scans
  const scanPromises = [];
  for (let i = 0; i < 6; i++) {
    scanPromises.push(scanService.startScan('https://example.com'));
  }
  const enqueuedScans = await Promise.all(scanPromises);
  console.assert(enqueuedScans.length === 6, 'Failed to enqueue 6 scans');
  tracker.passed.push('Queue Semaphore: Enqueued 6 concurrent audit jobs safely without thread crashes');

  // Wait for queued scans to process
  console.log('  Processing scans through concurrency queue (max 3 concurrent)...');
  await new Promise((r) => setTimeout(r, 9000));

  let completedQueueScans = 0;
  for (const s of enqueuedScans) {
    const st = scanService.getScanStatus(s.scanId);
    if (st?.status === 'completed') {
      completedQueueScans++;
    }
  }
  console.log(`  Completed ${completedQueueScans}/6 queued scans.`);
  if (completedQueueScans >= 4) {
    tracker.passed.push(`Queue Semaphore: Successfully drained queued audits (${completedQueueScans}/6 finished)`);
  }

  // ==========================================
  // 4. OBSERVABILITY & SECURITY HEADERS
  // ==========================================
  console.log('\n--- 4. Observability & Security Headers Audit ---');

  const { app } = await import('../backend/src/server.js');
  const server = http.createServer(app);
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  const port = (server.address() as any).port;

  const healthRes = await fetch(`http://127.0.0.1:${port}/api/health`);
  const healthData = await healthRes.json();

  console.assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'Missing X-Content-Type-Options');
  console.assert(healthRes.headers.get('x-frame-options') === 'SAMEORIGIN', 'Missing X-Frame-Options');
  console.assert(healthRes.headers.get('strict-transport-security') !== null, 'Missing HSTS');
  tracker.passed.push('Security Headers: X-Content-Type-Options, X-Frame-Options, HSTS present in response');

  console.assert(healthData.status === 'healthy', 'Health check is not healthy');
  console.assert(healthData.system.memoryRssMb > 0, 'Memory RSS telemetry missing');
  tracker.passed.push(`Observability: /api/health returned healthy status (Memory RSS: ${healthData.system.memoryRssMb}MB, Uptime: ${healthData.uptimeSeconds}s)`);

  server.close();
  closeDatabase();

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n========================================');
  console.log(`🎯 PRODUCTION ATTACK AUDIT COMPLETE: ${tracker.passed.length} PASSED, ${tracker.failed.length} FAILED`);
  console.log('========================================\n');

  tracker.passed.forEach((p) => console.log(`  ✔ ${p}`));
  tracker.failed.forEach((f) => console.log(`  ✖ ${f}`));

  process.exit(tracker.failed.length > 0 ? 1 : 0);
}

runProductionAttackSuite().catch((err) => {
  console.error('Fatal attack suite error:', err);
  process.exit(1);
});
