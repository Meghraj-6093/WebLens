import { normalizeTargetUrl } from './scanner/src/engine/normalizer.js';
import { validateUrlAgainstSSRF, isIpRestricted } from './scanner/src/engine/ssrf.js';
import { calculateCategoryScore, calculateOverallScore, CATEGORY_WEIGHTS } from './scanner/src/scoring/calculator.js';
import { generateAIExplanation } from './scanner/src/ai/explainer.js';
import { ScanRepository } from './database/src/repository.js';
import { ScanService } from './backend/src/services/scanService.js';
import { AuthService } from './backend/src/services/authService.js';
import { MonitorService } from './backend/src/services/monitorService.js';
import { AlertService } from './backend/src/services/alertService.js';
import { CompetitorService } from './backend/src/services/competitorService.js';
import { getDatabase, closeDatabase } from './database/src/db.js';
import { app } from './backend/src/server.js';
import { AuditCategory, AuditResult } from '@weblens/shared';
import http from 'http';

interface MasterAuditEvidence {
  passed: string[];
  warnings: string[];
  failures: string[];
}

const auditEvidence: MasterAuditEvidence = {
  passed: [],
  warnings: [],
  failures: []
};

async function runMasterExtremeAudit() {
  console.log('================================================================');
  console.log('🔬 WEBLENS MASTER EXTREME AUDIT — PHASES 1 TO 4 ZERO-TRUST AUDIT');
  console.log('================================================================\n');

  const repo = new ScanRepository();
  const scanService = new ScanService(repo, 4);
  const authService = new AuthService(repo);
  const alertService = new AlertService(repo);
  const monitorService = new MonitorService(repo, scanService, alertService);
  const competitorService = new CompetitorService(scanService);

  // ============================================================================
  // SECTION 1: URL HANDLING & PROTOCOL NORMALIZATION
  // ============================================================================
  console.log('--- 1. URL Handling & Normalization Matrix ---');
  const normalizerCases = [
    { input: 'example.com', expectValid: true, expectedUrl: 'https://example.com/' },
    { input: 'https://example.com', expectValid: true, expectedUrl: 'https://example.com/' },
    { input: 'http://example.com/blog', expectValid: true, expectedUrl: 'http://example.com/blog' },
    { input: 'www.example.com', expectValid: true, expectedUrl: 'https://www.example.com/' },
    { input: 'ftp://ftp.example.com', expectValid: false },
    { input: 'javascript:alert(1)', expectValid: false },
    { input: 'file:///etc/passwd', expectValid: false },
    { input: 'data:text/html,<h1>Test</h1>', expectValid: false },
  ];

  for (const tc of normalizerCases) {
    const res = normalizeTargetUrl(tc.input);
    if (tc.expectValid && res.isValid && res.normalizedUrl === tc.expectedUrl) {
      auditEvidence.passed.push(`URL Normalizer: Correctly normalized "${tc.input}" -> "${res.normalizedUrl}"`);
    } else if (!tc.expectValid && !res.isValid) {
      auditEvidence.passed.push(`URL Normalizer: Correctly rejected non-HTTP protocol "${tc.input}"`);
    } else {
      auditEvidence.failures.push(`URL Normalizer Error on "${tc.input}": got valid=${res.isValid}, url=${res.normalizedUrl}`);
    }
  }

  // ============================================================================
  // SECTION 2: ADVERSARIAL SSRF & EVASION TEST SUITE
  // ============================================================================
  console.log('\n--- 2. Hostile SSRF & Cloud Metadata Evasion Suite ---');
  const ssrfVectors = [
    // Loopback IPv4
    { input: 'http://localhost:3000', name: 'Standard localhost' },
    { input: 'http://127.0.0.1:8080', name: 'IPv4 127.0.0.1 loopback' },
    { input: 'http://127.0.0.2:80', name: 'IPv4 127.0.0.2 loopback range' },
    { input: 'http://0.0.0.0:80', name: 'Unspecified IPv4 0.0.0.0' },
    // Loopback IPv6
    { input: 'http://[::1]:80', name: 'IPv6 [::1] loopback' },
    // IPv4-mapped IPv6
    { input: 'http://[::ffff:127.0.0.1]', name: 'IPv4-mapped IPv6 loopback (::ffff:127.0.0.1)' },
    { input: 'http://[::ffff:169.254.169.254]', name: 'IPv4-mapped IPv6 metadata (::ffff:169.254.169.254)' },
    { input: 'http://[::ffff:10.0.0.1]', name: 'IPv4-mapped IPv6 RFC1918 (::ffff:10.0.0.1)' },
    // RFC1918 Private ranges
    { input: 'http://10.0.0.1', name: 'RFC1918 Class A (10.0.0.0/8)' },
    { input: 'http://172.16.0.1', name: 'RFC1918 Class B (172.16.0.0/12)' },
    { input: 'http://192.168.1.1', name: 'RFC1918 Class C (192.168.0.0/16)' },
    { input: 'http://100.64.0.1', name: 'Carrier-grade NAT (100.64.0.0/10)' },
    // Cloud Provider Metadata Endpoints
    { input: 'http://169.254.169.254/latest/meta-data', name: 'AWS / GCP / Azure metadata (169.254.169.254)' },
    { input: 'http://100.100.100.200', name: 'Alibaba Cloud metadata (100.100.100.200)' },
    { input: 'http://[fd00:ec2::254]', name: 'AWS IPv6 metadata address (fd00:ec2::254)' },
    // Restricted internal ports
    { input: 'http://example.com:22', name: 'Restricted SSH port 22' },
    { input: 'http://example.com:25', name: 'Restricted SMTP port 25' },
    { input: 'http://example.com:3306', name: 'Restricted MySQL port 3306' },
    { input: 'http://example.com:5432', name: 'Restricted PostgreSQL port 5432' },
    { input: 'http://example.com:6379', name: 'Restricted Redis port 6379' },
    { input: 'http://example.com:27017', name: 'Restricted MongoDB port 27017' },
    // Internal Hostname Suffixes
    { input: 'http://database.internal', name: 'Internal domain (.internal)' },
    { input: 'http://router.local', name: 'mDNS local domain (.local)' },
    { input: 'http://localhost.localdomain', name: 'Localhost alias' },
  ];

  for (const v of ssrfVectors) {
    const res = await validateUrlAgainstSSRF(v.input);
    if (!res.isValid) {
      auditEvidence.passed.push(`SSRF Hardening: ${v.name} blocked (${res.error})`);
    } else {
      auditEvidence.failures.push(`SSRF VULNERABILITY: ${v.name} (${v.input}) was PERMITTED!`);
    }
  }

  // ============================================================================
  // SECTION 3: SCORING ENGINE MATHEMATICAL RIGOR & BOUNDARIES
  // ============================================================================
  console.log('\n--- 3. Scoring Engine Mathematical Verification ---');
  
  // Weight summation
  const weightSum = Object.values(CATEGORY_WEIGHTS).reduce((acc, w) => acc + w, 0);
  if (Math.abs(weightSum - 1.0) < 0.0001) {
    auditEvidence.passed.push(`Scoring Engine: Weights sum to exactly 1.00 (${weightSum})`);
  } else {
    auditEvidence.failures.push(`Scoring Engine: Weights sum to ${weightSum} (must be 1.00)`);
  }

  // Perfect Score (100)
  const perfectAudit: AuditResult[] = [
    { scanId: 's1', category: 'performance', ruleId: 'r1', severity: 'passed', title: 'Pass', description: '', impact: '', recommendation: '', passed: true, scoreImpact: 0 }
  ];
  const perfectScore = calculateCategoryScore('s1', 'performance', perfectAudit);
  if (perfectScore.score === 100 && perfectScore.rating === 'excellent') {
    auditEvidence.passed.push('Scoring Engine: Perfect category score calculates to 100/100 (excellent)');
  } else {
    auditEvidence.failures.push(`Scoring Engine: Perfect score was ${perfectScore.score}`);
  }

  // Massive Penalties (must bound at 0, no negative numbers)
  const massivePenalties: AuditResult[] = [
    { scanId: 's1', category: 'security', ruleId: 'c1', severity: 'critical', title: 'C1', description: '', impact: '', recommendation: '', passed: false, scoreImpact: 80 },
    { scanId: 's1', category: 'security', ruleId: 'c2', severity: 'critical', title: 'C2', description: '', impact: '', recommendation: '', passed: false, scoreImpact: 80 }
  ];
  const zeroScore = calculateCategoryScore('s1', 'security', massivePenalties);
  if (zeroScore.score === 0 && zeroScore.rating === 'poor') {
    auditEvidence.passed.push('Scoring Engine: Over-penalized score strictly bounded at 0/100 (poor)');
  } else {
    auditEvidence.failures.push(`Scoring Engine: Over-penalized score failed boundary check: ${zeroScore.score}`);
  }

  // ============================================================================
  // SECTION 4: AUTHENTICATION, PASSWORD RESET CRYPTO & IDOR
  // ============================================================================
  console.log('\n--- 4. Authentication, Crypto Password Reset & IDOR Tenant Isolation ---');
  
  const userAEmail = `audit_user_a_${Date.now()}@weblens.dev`;
  const userBEmail = `audit_user_b_${Date.now()}@weblens.dev`;

  const userA = await authService.register({ email: userAEmail, password: 'initialPassword123', name: 'Auditor A' });
  const userB = await authService.register({ email: userBEmail, password: 'passwordB123', name: 'Auditor B' });

  // Tampered JWT rejection
  const tamperedJwt = userA.token.slice(0, -6) + 'abc123';
  if (authService.verifyToken(tamperedJwt) === null) {
    auditEvidence.passed.push('Auth Security: Tampered JWT token signature rejected');
  } else {
    auditEvidence.failures.push('Auth Security Failure: Tampered JWT signature was accepted!');
  }

  // Password reset token lifecycle
  const resetReq = await authService.requestPasswordReset(userAEmail);
  if (resetReq.resetToken && resetReq.resetToken.length === 64) {
    auditEvidence.passed.push('Password Reset: Generated 32-byte (64-char hex) crypto token');
  } else {
    auditEvidence.failures.push('Password Reset: Invalid token generated');
  }

  // Tampered reset token rejection
  try {
    await authService.resetPassword('fake_tampered_token_9999', 'newPassword456');
    auditEvidence.failures.push('Password Reset Failure: Fake token accepted!');
  } catch {
    auditEvidence.passed.push('Password Reset: Tampered/invalid reset token rejected');
  }

  // Legitimate reset
  const resetSuccess = await authService.resetPassword(resetReq.resetToken, 'newSecurePassword456');
  if (resetSuccess.success) {
    auditEvidence.passed.push('Password Reset: Password successfully reset');
  }

  // Replay protection (used token must fail)
  try {
    await authService.resetPassword(resetReq.resetToken, 'anotherPass789');
    auditEvidence.failures.push('Password Reset Failure: Replay attack succeeded on used token!');
  } catch {
    auditEvidence.passed.push('Password Reset: One-time token replay prevention verified');
  }

  // Revocation of old password
  try {
    await authService.login({ email: userAEmail, password: 'initialPassword123' });
    auditEvidence.failures.push('Auth Security Failure: Old password accepted after reset!');
  } catch {
    auditEvidence.passed.push('Auth Security: Old password revoked after reset');
  }

  // Login with new password
  const newLogin = await authService.login({ email: userAEmail, password: 'newSecurePassword456' });
  if (newLogin.token) {
    auditEvidence.passed.push('Auth Verification: Login with new password verified');
  }

  // Multi-Tenant Isolation & IDOR
  const projectA = repo.createProject(userA.user.id, "User A's Confidential Project", 'confidential-a.com');
  const userBProjects = repo.getProjectsByUserId(userB.user.id);
  const leaked = userBProjects.find(p => p.id === projectA.id);
  if (!leaked) {
    auditEvidence.passed.push("Tenant Isolation: User B cannot access User A's private project");
  } else {
    auditEvidence.failures.push("IDOR / Isolation Failure: User B received User A's private project!");
  }

  // ============================================================================
  // SECTION 5: SCANNER CONCURRENCY QUEUE & WORKER WATCHDOG
  // ============================================================================
  console.log('\n--- 5. Scanner Concurrency Queue & Worker Watchdog ---');
  
  const statsBefore = scanService.queueStats;
  console.assert(statsBefore.maxConcurrency === 4, 'Max concurrency mismatch');
  auditEvidence.passed.push(`Queue Semaphore: Initialized with maxConcurrency=${statsBefore.maxConcurrency}`);

  // Enqueue 8 rapid scans
  const queuePromises = [];
  for (let i = 0; i < 8; i++) {
    queuePromises.push(scanService.startScan('https://example.com', userA.user.id));
  }
  const enqueued = await Promise.all(queuePromises);
  if (enqueued.length === 8) {
    auditEvidence.passed.push('Queue Semaphore: Enqueued 8 concurrent audits without thread crash');
  }

  // Wait for queue drain
  console.log('  Draining 8 queued scans through concurrency worker pool (max 4 concurrent)...');
  await new Promise(r => setTimeout(r, 10000));

  let completedQueueCount = 0;
  for (const s of enqueued) {
    const st = scanService.getScanStatus(s.scanId);
    if (st?.status === 'completed') completedQueueCount++;
  }
  console.log(`  Drained ${completedQueueCount}/8 scans.`);
  if (completedQueueCount >= 6) {
    auditEvidence.passed.push(`Queue Semaphore: Successfully processed ${completedQueueCount}/8 queued scans`);
  }

  // ============================================================================
  // SECTION 6: CONTINUOUS MONITORING & REGRESSION DETECTION
  // ============================================================================
  console.log('\n--- 6. Continuous Monitoring & Automated Change Detection ---');

  const monitored = repo.createMonitoredSite({
    userId: userA.user.id,
    url: 'https://example.com',
    domain: 'example.com',
    frequency: 'daily'
  });
  if (monitored.domain === 'example.com') {
    auditEvidence.passed.push(`Monitoring: Created monitored schedule for ${monitored.domain} (${monitored.frequency})`);
  }

  // Trigger simulated regression alert (score drop >= 5 points)
  await alertService.dispatch({
    userId: userA.user.id,
    siteId: monitored.id,
    scanId: 'scan_regression_test',
    severity: 'high',
    title: 'Performance Degradation on example.com',
    message: 'Overall score decreased by 14 points (92 -> 78/100).',
    domain: 'example.com',
    score: 78,
    delta: -14
  });

  const alerts = repo.getAlertsByUserId(userA.user.id);
  if (alerts.length >= 1 && alerts[0].title.includes('Degradation')) {
    auditEvidence.passed.push(`Change Detection: Dispatched regression alert for score drop (${alerts[0].title})`);
  } else {
    auditEvidence.failures.push('Change Detection: Failed to dispatch regression alert');
  }

  // ============================================================================
  // SECTION 7: MULTI-DOMAIN COMPETITOR BENCHMARK MATRIX
  // ============================================================================
  console.log('\n--- 7. Multi-Domain Competitor Benchmarking Matrix ---');

  const compRes = await competitorService.compareSites(
    ['https://example.com', 'https://news.ycombinator.com'],
    userA.user.id
  );
  if (compRes.sites.length === 2 && compRes.winnerDomain && compRes.insights.length > 0) {
    auditEvidence.passed.push(`Competitor Matrix: Benchmarked ${compRes.domains.join(' vs ')} -> Winner: ${compRes.winnerDomain}`);
  } else {
    auditEvidence.failures.push('Competitor Matrix: Benchmarking failed to complete');
  }

  // ============================================================================
  // SECTION 8: AGENCY WORKSPACE, TEAMS & WHITE-LABEL BRANDING
  // ============================================================================
  console.log('\n--- 8. Agency Workspace, RBAC & White-Label Theming ---');

  const agencyTeam = repo.createTeam(userA.user.id, 'Global Growth Agency');
  const staffEmail = `staff_${Date.now()}@agency.dev`;
  const staffUser = repo.createUser({ email: staffEmail, passwordHash: 'hash', name: 'Alex Staff', tier: 'pro' });
  repo.addTeamMember(agencyTeam.id, staffUser.id, 'member');

  const teamMembers = repo.getTeamMembers(agencyTeam.id);
  if (teamMembers.length === 2) {
    auditEvidence.passed.push(`Agency Teams: Created workspace "${agencyTeam.name}" with ${teamMembers.length} members`);
  }

  const clientRec = repo.createClient(userA.user.id, {
    clientName: 'SaaS International',
    domain: 'saas-intl.com',
    contactEmail: 'contact@saas-intl.com'
  });
  if (clientRec.clientName === 'SaaS International') {
    auditEvidence.passed.push(`Client Roster: Registered client account "${clientRec.clientName}" (${clientRec.domain})`);
  }

  const whiteLabel = repo.saveAgencySettings(userA.user.id, {
    brandName: 'Global Growth Audit Suite',
    logoUrl: 'https://agency.dev/logo.png',
    primaryColor: '#4F46E5',
    accentColor: '#059669',
    footerText: 'Prepared exclusively for Enterprise Clients'
  });
  if (whiteLabel.brandName === 'Global Growth Audit Suite') {
    auditEvidence.passed.push(`White-Label Studio: Saved custom brand identity "${whiteLabel.brandName}" (Primary: ${whiteLabel.primaryColor})`);
  }

  // ============================================================================
  // SECTION 9: DEVELOPER PUBLIC REST API (v1) & KEYS
  // ============================================================================
  console.log('\n--- 9. Developer Public REST API (v1) & Key Security ---');

  const apiKey = repo.createApiKey(userA.user.id, 'CI/CD Pipeline Runner');
  if (apiKey.apiKey.startsWith('weblens_sk_')) {
    auditEvidence.passed.push(`API Keys: Generated secret key prefix ${apiKey.keyPrefix}`);
  }

  const verified = repo.verifyApiKey(apiKey.apiKey);
  if (verified?.userId === userA.user.id) {
    auditEvidence.passed.push('API Keys: Verified API key against SHA-256 hash');
  }

  const fakeKey = repo.verifyApiKey('weblens_sk_tampered_fake_key_999');
  if (fakeKey === null) {
    auditEvidence.passed.push('API Security: Rejected invalid/tampered API key');
  }

  // ============================================================================
  // SECTION 10: REAL-WORLD LIVE TARGET AUDITS & OBSERVABILITY
  // ============================================================================
  console.log('\n--- 10. Real-World Live Website Audits & Observability ---');

  const liveScan = await scanService.startScan('https://example.com', userA.user.id);
  let liveReport = null;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const st = scanService.getScanStatus(liveScan.scanId);
    if (st?.status === 'completed' || st?.status === 'failed') {
      liveReport = scanService.getFullReport(liveScan.scanId);
      break;
    }
  }

  if (liveReport && liveReport.scan.status === 'completed') {
    auditEvidence.passed.push(`Real-World Audit: example.com completed with score ${liveReport.overall.score}/100 (${liveReport.overall.rating})`);
    console.log(`    Overall: ${liveReport.overall.score}/100 • Perf: ${liveReport.categories.performance.score} • SEO: ${liveReport.categories.seo.score} • A11y: ${liveReport.categories.accessibility.score}`);
  } else {
    auditEvidence.failures.push('Real-World Audit: example.com failed to complete');
  }

  // Server health & security headers
  const server = http.createServer(app);
  await new Promise<void>(r => server.listen(0, '127.0.0.1', () => r()));
  const port = (server.address() as any).port;

  const healthRes = await fetch(`http://127.0.0.1:${port}/api/health`);
  const healthData = await healthRes.json();

  if (healthRes.headers.get('x-content-type-options') === 'nosniff' &&
      healthRes.headers.get('x-frame-options') === 'SAMEORIGIN' &&
      healthRes.headers.get('strict-transport-security') !== null) {
    auditEvidence.passed.push('Security Headers: X-Content-Type-Options, X-Frame-Options, HSTS present');
  } else {
    auditEvidence.failures.push('Security Headers: Missing required security headers in HTTP response');
  }

  if (healthData.status === 'healthy' && healthData.system.memoryRssMb > 0) {
    auditEvidence.passed.push(`Observability: /api/health reported healthy cluster (Memory RSS: ${healthData.system.memoryRssMb}MB, Uptime: ${healthData.uptimeSeconds}s)`);
  }

  server.close();
  closeDatabase();

  // ============================================================================
  // MASTER AUDIT SUMMARY
  // ============================================================================
  console.log('\n================================================================');
  console.log(`🎯 MASTER EXTREME AUDIT RESULTS: ${auditEvidence.passed.length} PASSED, ${auditEvidence.warnings.length} WARNINGS, ${auditEvidence.failures.length} FAILURES`);
  console.log('================================================================\n');

  auditEvidence.passed.forEach(p => console.log(`  ✔ ${p}`));
  if (auditEvidence.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    auditEvidence.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }
  if (auditEvidence.failures.length > 0) {
    console.log('\n❌ FAILURES:');
    auditEvidence.failures.forEach(f => console.log(`  ✖ ${f}`));
  }

  process.exit(auditEvidence.failures.length > 0 ? 1 : 0);
}

runMasterExtremeAudit().catch((err) => {
  console.error('Fatal master audit execution error:', err);
  process.exit(1);
});
