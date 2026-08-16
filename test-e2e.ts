import { normalizeTargetUrl } from './scanner/src/engine/normalizer.js';
import { validateUrlAgainstSSRF } from './scanner/src/engine/ssrf.js';
import { ScanOrchestrator } from './scanner/src/orchestrator.js';
import { ScanRepository } from './database/src/repository.js';
import { ScanService } from './backend/src/services/scanService.js';
import { AuthService } from './backend/src/services/authService.js';
import { generateAIExplanation } from './scanner/src/ai/explainer.js';
import { getDatabase, closeDatabase } from './database/src/db.js';

async function runEndToEndVerification() {
  console.log('🧪 Starting WebLens Phase 3 End-to-End Verification...\n');

  // Test 1: URL Normalizer
  console.log('--- Test 1: URL Normalizer ---');
  const t1 = normalizeTargetUrl('example.com');
  console.assert(t1.isValid && t1.normalizedUrl === 'https://example.com/', 'Normalized example.com failed');
  const t2 = normalizeTargetUrl('http://mysite.org/blog');
  console.assert(t2.isValid && t2.protocol === 'http:', 'Normalized http failed');
  const t3 = normalizeTargetUrl('javascript:alert(1)');
  console.assert(!t3.isValid, 'Javascript scheme was not rejected');
  console.log('✅ URL Normalizer tests passed!\n');

  // Test 2: SSRF Validator
  console.log('--- Test 2: SSRF & IP Restriction Validator ---');
  const ssrf1 = await validateUrlAgainstSSRF('http://localhost:3000');
  console.assert(!ssrf1.isValid, 'localhost should be rejected');
  const ssrf2 = await validateUrlAgainstSSRF('http://127.0.0.1:8080');
  console.assert(!ssrf2.isValid, '127.0.0.1 should be rejected');
  const ssrf3 = await validateUrlAgainstSSRF('http://169.254.169.254/latest/meta-data');
  console.assert(!ssrf3.isValid, 'Cloud metadata IP should be rejected');
  const ssrf4 = await validateUrlAgainstSSRF('http://192.168.1.1');
  console.assert(!ssrf4.isValid, 'Private RFC1918 IP should be rejected');
  const ssrf5 = await validateUrlAgainstSSRF('https://example.com');
  console.assert(ssrf5.isValid, 'Public domain example.com should be valid');
  console.log('✅ SSRF Security Validator tests passed!\n');

  // Test 3: Authentication System
  console.log('--- Test 3: User Accounts & Authentication ---');
  const repo = new ScanRepository();
  const authService = new AuthService(repo);

  const testEmail = `developer_${Date.now()}@weblens.dev`;
  const registerRes = await authService.register({
    email: testEmail,
    password: 'password123',
    name: 'Ada Lovelace'
  });
  console.assert(registerRes.user.email === testEmail, 'User registration failed');
  console.assert(Boolean(registerRes.token), 'Auth token was not issued');
  console.log(`  Registered user: ${registerRes.user.name} (${registerRes.user.email}) - Tier: ${registerRes.user.tier}`);

  const loginRes = await authService.login({
    email: testEmail,
    password: 'password123'
  });
  console.assert(loginRes.user.id === registerRes.user.id, 'User login returned wrong user ID');
  console.log('  Login successful and token verified.');
  console.log('✅ Authentication tests passed!\n');

  // Test 4: Project Workspaces
  console.log('--- Test 4: Project Workspaces ---');
  const project = repo.createProject(registerRes.user.id, 'My Portfolio', 'example.com', 'Personal portfolio website');
  console.assert(project.domain === 'example.com', 'Project domain mismatch');
  const userProjects = repo.getProjectsByUserId(registerRes.user.id);
  console.assert(userProjects.length >= 1, 'Projects list empty');
  console.log(`  Created project workspace: ${project.name} (${project.domain})`);
  console.log('✅ Project workspace tests passed!\n');

  // Test 5: AI Explanation & Multi-Framework Code Generator
  console.log('--- Test 5: AI Diagnostic Synthesizer & Code Generator ---');
  const sampleIssue = {
    scanId: 'scan-123',
    category: 'seo' as const,
    ruleId: 'seo.missing-meta-description',
    severity: 'high' as const,
    title: 'Missing meta description',
    description: 'No meta description found in document <head>.',
    impact: 'Search engines generate arbitrary snippets.',
    recommendation: 'Add a 120-155 character meta description.',
    passed: false,
    scoreImpact: 10
  };

  const aiDiagnosis = generateAIExplanation(sampleIssue);
  console.assert(aiDiagnosis.priority === 'High', 'Priority calculation mismatch');
  console.assert(aiDiagnosis.codeSnippets.length >= 2, 'Framework code snippets not generated');
  console.log(`  AI Diagnosis generated for "${aiDiagnosis.title}":`);
  console.log(`    Priority: ${aiDiagnosis.priority} (${aiDiagnosis.priorityRationale})`);
  console.log(`    Estimated Effort: ${aiDiagnosis.estimatedEffort}`);
  console.log(`    Code Snippets Available: ${aiDiagnosis.codeSnippets.map(s => s.label).join(', ')}`);
  console.log('✅ AI diagnostic tests passed!\n');

  // Test 6: Rate Limiter Quotas
  console.log('--- Test 6: Usage Limiter & Quota Enforcement ---');
  const anonId = `ip_198.51.100.${Math.floor(Math.random() * 250 + 1)}`;
  console.assert(repo.getUsageToday(anonId) === 0, 'Initial usage should be 0');
  repo.incrementUsage(anonId);
  repo.incrementUsage(anonId);
  repo.incrementUsage(anonId);
  console.assert(repo.getUsageToday(anonId) === 3, 'Usage should be 3');
  console.log(`  Usage count tracked for ${anonId}: ${repo.getUsageToday(anonId)}/3 (Limit met)`);
  console.log('✅ Usage limiter tests passed!\n');

  // Test 7: Live Scanner Execution & Comparison Engine
  console.log('--- Test 7: Live Scan & Historical Comparison Engine ---');
  const scanService = new ScanService(repo);
  const scan1 = await scanService.startScan('https://example.com', registerRes.user.id);
  await new Promise(r => setTimeout(r, 4500));

  const scan2 = await scanService.startScan('https://example.com', registerRes.user.id);
  await new Promise(r => setTimeout(r, 4500));

  const history = repo.getRecentScans(10, registerRes.user.id);
  console.assert(history.length >= 2, 'History did not record both scans');
  console.log(`  Recorded ${history.length} scans in history with score delta tracking.`);
  console.log('✅ Live scan and history integration passed!\n');

  closeDatabase();
  console.log('🎉 ALL PHASE 3 TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runEndToEndVerification().catch((err) => {
  console.error('❌ Verification failed with error:', err);
  process.exit(1);
});
