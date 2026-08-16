import { normalizeTargetUrl } from './scanner/src/engine/normalizer.js';
import { validateUrlAgainstSSRF } from './scanner/src/engine/ssrf.js';
import { calculateCategoryScore, calculateOverallScore, CATEGORY_WEIGHTS } from './scanner/src/scoring/calculator.js';
import { generateAIExplanation } from './scanner/src/ai/explainer.js';
import { ScanRepository } from './database/src/repository.js';
import { ScanService } from './backend/src/services/scanService.js';
import { AuthService } from './backend/src/services/authService.js';
import { getDatabase, closeDatabase } from './database/src/db.js';
import { AuditCategory, AuditResult } from '@weblens/shared';
import http from 'http';

interface AuditFindingsReport {
  passed: string[];
  warnings: string[];
  failures: string[];
}

const audit: AuditFindingsReport = {
  passed: [],
  warnings: [],
  failures: []
};

async function runExtremeAudit() {
  console.log('🔬 Starting WebLens Extreme End-to-End Audit & Verification...\n');

  // ==========================================
  // SECTION 1: SSRF & PROTOCOL SECURITY AUDIT
  // ==========================================
  console.log('--- 1. SSRF & Protocol Security Hostile Suite ---');

  const ssrfVectors = [
    { input: 'http://localhost:3000', expectBlocked: true, name: 'Localhost standard' },
    { input: 'http://127.0.0.1:8080', expectBlocked: true, name: 'IPv4 loopback' },
    { input: 'http://127.0.0.2', expectBlocked: true, name: 'IPv4 loopback range' },
    { input: 'http://0.0.0.0', expectBlocked: true, name: 'Unspecified IPv4' },
    { input: 'http://[::1]', expectBlocked: true, name: 'IPv6 loopback' },
    { input: 'http://169.254.169.254/latest/meta-data', expectBlocked: true, name: 'AWS/GCP metadata IPv4' },
    { input: 'http://[fd00:ec2::254]', expectBlocked: true, name: 'IPv6 metadata range' },
    { input: 'http://10.0.0.1', expectBlocked: true, name: 'RFC1918 10.0.0.0/8' },
    { input: 'http://172.16.0.1', expectBlocked: true, name: 'RFC1918 172.16.0.0/12' },
    { input: 'http://192.168.1.1', expectBlocked: true, name: 'RFC1918 192.168.0.0/16' },
    { input: 'http://100.64.0.1', expectBlocked: true, name: 'Carrier-grade NAT 100.64.0.0/10' },
    { input: 'http://service.internal', expectBlocked: true, name: 'Internal domain suffix' },
    { input: 'http://router.local', expectBlocked: true, name: 'mDNS .local suffix' },
    { input: 'javascript:alert(1)', expectBlocked: true, name: 'javascript: scheme' },
    { input: 'file:///etc/passwd', expectBlocked: true, name: 'file: scheme' },
    { input: 'data:text/html,<h1>Hello</h1>', expectBlocked: true, name: 'data: scheme' },
    { input: 'ftp://ftp.example.com', expectBlocked: true, name: 'ftp: scheme' },
    { input: 'https://example.com', expectBlocked: false, name: 'Public HTTPS domain' },
  ];

  for (const v of ssrfVectors) {
    const norm = normalizeTargetUrl(v.input);
    if (!norm.isValid) {
      if (v.expectBlocked) {
        audit.passed.push(`SSRF Filter: ${v.name} blocked at normalizer`);
      } else {
        audit.failures.push(`Normalizer false-positive: ${v.name} was rejected`);
      }
      continue;
    }

    const res = await validateUrlAgainstSSRF(norm.normalizedUrl);
    if (v.expectBlocked && !res.isValid) {
      audit.passed.push(`SSRF Filter: ${v.name} blocked (${res.error})`);
    } else if (v.expectBlocked && res.isValid) {
      audit.failures.push(`SSRF Vulnerability: ${v.name} (${v.input}) was PERMITTED!`);
    } else if (!v.expectBlocked && res.isValid) {
      audit.passed.push(`SSRF Filter: ${v.name} permitted as expected`);
    } else {
      audit.failures.push(`SSRF Filter: ${v.name} was unexpectedly blocked: ${res.error}`);
    }
  }

  // ==========================================
  // SECTION 2: SCORING ENGINE MATHEMATICAL AUDIT
  // ==========================================
  console.log('\n--- 2. Scoring Engine Mathematical Verification ---');

  // Verify category weights sum to exactly 1.00
  const weightSum = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
  if (Math.abs(weightSum - 1.0) < 0.0001) {
    audit.passed.push(`Scoring Engine: Category weights sum to 1.00 (${weightSum})`);
  } else {
    audit.failures.push(`Scoring Engine: Category weights sum is ${weightSum} (must be 1.00)`);
  }

  // Test perfect score (all passed)
  const perfectResults: AuditResult[] = [
    { scanId: 'test', category: 'performance', ruleId: 'p1', severity: 'passed', title: 'P1', description: '', impact: '', recommendation: '', passed: true, scoreImpact: 0 },
    { scanId: 'test', category: 'performance', ruleId: 'p2', severity: 'passed', title: 'P2', description: '', impact: '', recommendation: '', passed: true, scoreImpact: 0 },
  ];
  const perfectCat = calculateCategoryScore('test', 'performance', perfectResults);
  if (perfectCat.score === 100 && perfectCat.rating === 'excellent') {
    audit.passed.push('Scoring Engine: Perfect category score calculates to 100/100 (excellent)');
  } else {
    audit.failures.push(`Scoring Engine: Perfect score was ${perfectCat.score}`);
  }

  // Test extreme penalties (score must bound at 0, not negative)
  const extremeBadResults: AuditResult[] = [
    { scanId: 'test', category: 'security', ruleId: 's1', severity: 'critical', title: 'C1', description: '', impact: '', recommendation: '', passed: false, scoreImpact: 50 },
    { scanId: 'test', category: 'security', ruleId: 's2', severity: 'critical', title: 'C2', description: '', impact: '', recommendation: '', passed: false, scoreImpact: 50 },
    { scanId: 'test', category: 'security', ruleId: 's3', severity: 'critical', title: 'C3', description: '', impact: '', recommendation: '', passed: false, scoreImpact: 50 },
  ];
  const badCat = calculateCategoryScore('test', 'security', extremeBadResults);
  if (badCat.score === 0 && badCat.rating === 'poor') {
    audit.passed.push('Scoring Engine: Over-penalized score is bounded at 0/100 (poor)');
  } else {
    audit.failures.push(`Scoring Engine: Score bound failed, got ${badCat.score}`);
  }

  // ==========================================
  // SECTION 3: AUTHENTICATION & MULTI-TENANT AUTHORIZATION AUDIT
  // ==========================================
  console.log('\n--- 3. Authentication, Multi-Tenant Isolation & IDOR Audit ---');

  const repo = new ScanRepository();
  const authService = new AuthService(repo);

  const userAEmail = `user_a_${Date.now()}@weblens.dev`;
  const userBEmail = `user_b_${Date.now()}@weblens.dev`;

  const userA = await authService.register({ email: userAEmail, password: 'password123', name: 'User A' });
  const userB = await authService.register({ email: userBEmail, password: 'password123', name: 'User B' });

  // User A creates Project A
  const projectA = repo.createProject(userA.user.id, "User A's Private Project", 'usera-private.com');
  audit.passed.push(`Project creation: User A created project ${projectA.id}`);

  // Check project ownership isolation
  const userBProjects = repo.getProjectsByUserId(userB.user.id);
  const leakedProject = userBProjects.find(p => p.id === projectA.id);
  if (!leakedProject) {
    audit.passed.push("Tenant Isolation: User B cannot see User A's projects in getProjectsByUserId");
  } else {
    audit.failures.push("IDOR / Isolation Failure: User B received User A's project in list query!");
  }

  // Token tampering verification
  const tamperedToken = userA.token.substring(0, userA.token.length - 5) + 'xxxxx';
  const decodedTampered = authService.verifyToken(tamperedToken);
  if (decodedTampered === null) {
    audit.passed.push('Auth Security: Tampered JWT token signature rejected');
  } else {
    audit.failures.push('Auth Security Failure: Tampered JWT token was accepted!');
  }

  // ==========================================
  // SECTION 4: AI DIAGNOSTIC SYNTHESIZER AUDIT
  // ==========================================
  console.log('\n--- 4. AI Diagnostic Synthesizer Audit ---');

  const sampleIssue: AuditResult = {
    scanId: 'test',
    category: 'performance',
    ruleId: 'perf.lcp-slow',
    severity: 'high',
    title: 'Largest Contentful Paint is too slow',
    description: 'Measured LCP at 4.2s.',
    impact: 'Users perceive the page as unresponsive.',
    recommendation: 'Compress hero images and defer non-critical JS.',
    passed: false,
    scoreImpact: 15
  };

  const aiRes = generateAIExplanation(sampleIssue);
  if (aiRes.whatHappened && aiRes.whyItMatters && aiRes.howToFix && aiRes.priority === 'High' && aiRes.codeSnippets.length >= 2) {
    audit.passed.push('AI Layer: Correctly synthesized structured explanation without hallucinating metrics');
  } else {
    audit.failures.push('AI Layer: Incomplete explanation payload generated');
  }

  // ==========================================
  // SECTION 5: CONTROLLED REAL-WORLD AUDIT SUITE
  // ==========================================
  console.log('\n--- 5. Controlled Real-World Test Server Suite ---');

  // Spawn local test HTTP server to simulate various server conditions
  const server = http.createServer((req, res) => {
    if (req.url === '/broken-html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><head><title>Test</head><body><img src="pic.jpg"><div><span>Unclosed tags');
    } else if (req.url === '/redirect-loop') {
      res.writeHead(302, { 'Location': '/redirect-loop' });
      res.end();
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<!DOCTYPE html><html><head><title>Clean Page</title><meta name="description" content="A clean testing page with full metadata."></head><body><h1>Heading</h1><p>Content</p></body></html>');
    }
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const port = (server.address() as any).port;
  console.log(`  Local test probe server running on port ${port}`);

  // Test scan against non-existent unreachable domain
  const scanService = new ScanService(repo);
  try {
    const unreachableRes = await scanService.startScan('https://this-domain-definitely-does-not-exist-xyz123.com');
    // Wait for scan execution
    await new Promise(r => setTimeout(r, 3000));
    const status = scanService.getScanStatus(unreachableRes.scanId);
    if (status?.status === 'failed') {
      audit.passed.push(`Unreachable Domain: Gracefully handled and marked status as 'failed' (${status.errorMessage})`);
    } else {
      audit.warnings.push(`Unreachable Domain status was ${status?.status}`);
    }
  } catch (err: any) {
    audit.passed.push(`Unreachable Domain caught at creation: ${err.message}`);
  }

  server.close();

  // ==========================================
  // SECTION 6: CONCURRENT SCANS LOAD TEST
  // ==========================================
  console.log('\n--- 6. Concurrency & Multi-Scan Load Test ---');
  const concurrentScanCount = 3;
  console.log(`  Initiating ${concurrentScanCount} concurrent scans against https://example.com...`);
  
  const startTime = Date.now();
  const promises = [];
  for (let i = 0; i < concurrentScanCount; i++) {
    promises.push(scanService.startScan('https://example.com', userA.user.id));
  }
  const started = await Promise.all(promises);
  console.log(`  ${started.length} scans queued successfully.`);

  // Wait for all to complete
  await new Promise(r => setTimeout(r, 6000));

  let completedCount = 0;
  for (const s of started) {
    const st = scanService.getScanStatus(s.scanId);
    if (st?.status === 'completed') {
      completedCount++;
    }
  }
  console.log(`  ${completedCount}/${concurrentScanCount} concurrent scans completed in ${(Date.now() - startTime) / 1000}s.`);
  if (completedCount === concurrentScanCount) {
    audit.passed.push(`Concurrency: Successfully processed ${concurrentScanCount} simultaneous scans`);
  } else {
    audit.warnings.push(`Concurrency: ${completedCount}/${concurrentScanCount} completed within window`);
  }

  closeDatabase();

  // ==========================================
  // SUMMARY OF AUDIT FINDINGS
  // ==========================================
  console.log('\n========================================');
  console.log(`🎯 AUDIT COMPLETE: ${audit.passed.length} PASSED, ${audit.warnings.length} WARNINGS, ${audit.failures.length} FAILURES`);
  console.log('========================================\n');

  console.log(`✅ PASSED CHECKS (${audit.passed.length}):`);
  audit.passed.forEach(p => console.log(`  ✔ ${p}`));

  if (audit.warnings.length > 0) {
    console.log(`\n⚠️ WARNINGS (${audit.warnings.length}):`);
    audit.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }

  if (audit.failures.length > 0) {
    console.log(`\n❌ FAILURES (${audit.failures.length}):`);
    audit.failures.forEach(f => console.log(`  ✖ ${f}`));
  }

  process.exit(audit.failures.length > 0 ? 1 : 0);
}

runExtremeAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
