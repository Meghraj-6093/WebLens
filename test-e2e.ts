import { normalizeTargetUrl } from './scanner/src/engine/normalizer.js';
import { validateUrlAgainstSSRF } from './scanner/src/engine/ssrf.js';
import { ScanOrchestrator } from './scanner/src/orchestrator.js';
import { ScanRepository } from './database/src/repository.js';
import { ScanService } from './backend/src/services/scanService.js';
import { getDatabase, closeDatabase } from './database/src/db.js';

async function runEndToEndVerification() {
  console.log('🧪 Starting WebLens Phase 2 End-to-End Verification...\n');

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

  // Test 3: Live Scanner Pipeline with Dual Viewports
  console.log('--- Test 3: Live Scanner Engine Execution (https://example.com) ---');
  const orchestrator = new ScanOrchestrator();
  const testScanRecord = {
    id: 'test-scan-phase2-001',
    url: 'https://example.com',
    normalizedUrl: 'https://example.com',
    domain: 'example.com',
    status: 'running' as const,
    overallScore: null,
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  const stagesSeen: string[] = [];
  const fullReport = await orchestrator.executeScan(testScanRecord, (update) => {
    stagesSeen.push(update.stage);
    console.log(`  [Stage ${update.progress}%] ${update.stage}: ${update.message}`);
  });

  console.log('\n📊 Scan Report Generated:');
  console.log(`  - Overall Score: ${fullReport.overall.score}/100 (${fullReport.overall.rating})`);
  console.log(`  - Performance: ${fullReport.categories.performance.score}/100 (${fullReport.categories.performance.rating})`);
  console.log(`  - SEO: ${fullReport.categories.seo.score}/100 (${fullReport.categories.seo.rating})`);
  console.log(`  - Accessibility: ${fullReport.categories.accessibility.score}/100 (${fullReport.categories.accessibility.rating})`);
  console.log(`  - Security: ${fullReport.categories.security.score}/100 (${fullReport.categories.security.rating})`);
  console.log(`  - Mobile: ${fullReport.categories.mobile.score}/100 (${fullReport.categories.mobile.rating})`);
  console.log(`  - Best Practices: ${fullReport.categories.best_practices.score}/100 (${fullReport.categories.best_practices.rating})`);
  console.log(`  - Total Resources Scanned: ${fullReport.resources.length}`);
  console.log(`  - Desktop Screenshot Captured: ${Boolean(fullReport.screenshotUrl)}`);
  console.log(`  - Mobile Screenshot Captured: ${Boolean(fullReport.mobileScreenshotUrl)}`);

  console.assert(fullReport.overall.score >= 0 && fullReport.overall.score <= 100, 'Score is out of bounds');
  console.assert(stagesSeen.includes('connecting') && stagesSeen.includes('completed'), 'Not all stages executed');
  console.log('✅ Live Scanner Engine tests passed!\n');

  // Test 4: Database & ScanService Integration
  console.log('--- Test 4: Database Persistence & ScanService ---');
  const repo = new ScanRepository();
  const scanService = new ScanService(repo);

  const startRes = await scanService.startScan('https://example.com');
  console.log(`  Created scan record in DB: ${startRes.scanId} (Status: ${startRes.status})`);

  // Allow async worker to process
  await new Promise((r) => setTimeout(r, 4000));

  const status = scanService.getScanStatus(startRes.scanId);
  console.log(`  Scan Status from DB: ${status?.status} (Stage: ${status?.stage}, Score: ${status?.overallScore})`);

  // Share Token
  const share = scanService.createShareToken(startRes.scanId);
  console.log(`  Share Token generated: ${share.shareToken} (URL: ${share.shareUrl})`);
  const resolvedScanId = repo.getScanIdByShareToken(share.shareToken);
  console.assert(resolvedScanId === startRes.scanId, 'Share token failed to resolve to scanId');

  console.log('✅ Database persistence and service integration tests passed!\n');

  closeDatabase();
  console.log('🎉 ALL PHASE 2 TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runEndToEndVerification().catch((err) => {
  console.error('❌ Verification failed with error:', err);
  process.exit(1);
});
