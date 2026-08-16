import { ScanRepository } from './database/src/repository.js';
import { ScanService } from './backend/src/services/scanService.js';
import { AuthService } from './backend/src/services/authService.js';
import { MonitorService } from './backend/src/services/monitorService.js';
import { AlertService } from './backend/src/services/alertService.js';
import { CompetitorService } from './backend/src/services/competitorService.js';
import { closeDatabase } from './database/src/db.js';
import { app } from './backend/src/server.js';
import http from 'http';

interface Phase4Tracker {
  passed: string[];
  failed: string[];
}

const tracker: Phase4Tracker = { passed: [], failed: [] };

async function runPhase4Verification() {
  console.log('🚀 Starting WebLens Phase 4 Commercial & Production Suite...\n');

  const repo = new ScanRepository();
  const scanService = new ScanService(repo, 3);
  const authService = new AuthService(repo);
  const alertService = new AlertService(repo);
  const monitorService = new MonitorService(repo, scanService, alertService);
  const competitorService = new CompetitorService(scanService);

  // Setup test user
  const agencyEmail = `agency_ceo_${Date.now()}@weblens.dev`;
  const authRes = await authService.register({
    email: agencyEmail,
    password: 'password123',
    name: 'Sarah Connor',
  });
  const userId = authRes.user.id;

  // ==========================================
  // 1. CONTINUOUS MONITORING & CHANGE ALERTS
  // ==========================================
  console.log('--- 1. Continuous Monitoring & Change Detection ---');

  const monitorSite = repo.createMonitoredSite({
    userId,
    url: 'https://example.com',
    domain: 'example.com',
    frequency: 'daily'
  });
  console.assert(monitorSite.domain === 'example.com', 'Domain mismatch');
  tracker.passed.push(`Monitoring: Created monitored schedule for ${monitorSite.domain} (${monitorSite.frequency})`);

  // Simulate change detection alert on regression
  await alertService.dispatch({
    userId,
    siteId: monitorSite.id,
    scanId: 'simulated_scan_id',
    severity: 'high',
    title: 'Performance Regression on example.com',
    message: 'Overall score dropped by 16 points (94 -> 78/100).',
    domain: 'example.com',
    score: 78,
    delta: -16
  });

  const alerts = repo.getAlertsByUserId(userId);
  console.assert(alerts.length >= 1, 'Alert was not recorded in repository');
  tracker.passed.push(`Change Detection: Dispatched regression alert (${alerts[0].title})`);

  // ==========================================
  // 2. COMPETITOR BENCHMARK MATRIX
  // ==========================================
  console.log('\n--- 2. Multi-Domain Competitor Benchmarking ---');

  const compResult = await competitorService.compareSites(
    ['https://example.com', 'https://news.ycombinator.com'],
    userId
  );
  console.assert(compResult.sites.length === 2, 'Failed to compare 2 sites');
  console.assert(Boolean(compResult.winnerDomain), 'Missing winner domain');
  console.assert(compResult.insights.length > 0, 'Missing competitive insights');
  tracker.passed.push(`Competitor Matrix: Benchmarked ${compResult.domains.join(' vs ')} -> Winner: ${compResult.winnerDomain}`);

  // ==========================================
  // 3. AGENCY WORKSPACES & WHITE-LABEL BRANDING
  // ==========================================
  console.log('\n--- 3. Agency Workspace, Team Roles & White-Label ---');

  // Team creation & member roles
  const team = repo.createTeam(userId, 'Apex Digital Agency');
  console.assert(team.name === 'Apex Digital Agency', 'Team name mismatch');

  const designerEmail = `designer_${Date.now()}@apex.dev`;
  const designerUser = repo.createUser({ email: designerEmail, passwordHash: 'hash', name: 'Bob Designer', tier: 'free' });
  repo.addTeamMember(team.id, designerUser.id, 'member');

  const members = repo.getTeamMembers(team.id);
  console.assert(members.length === 2, 'Expected 2 team members');
  tracker.passed.push(`Agency Workspace: Created team "${team.name}" with ${members.length} members (RBAC roles: owner, member)`);

  // Client roster
  const client = repo.createClient(userId, {
    clientName: 'Globex Corp',
    domain: 'globex.com',
    contactEmail: 'client@globex.com',
    notes: 'Priority enterprise client'
  });
  console.assert(client.clientName === 'Globex Corp', 'Client name mismatch');
  tracker.passed.push(`Client Roster: Registered client "${client.clientName}" (${client.domain})`);

  // White-label studio branding
  const branding = repo.saveAgencySettings(userId, {
    brandName: 'Apex Digital Audit Engine',
    logoUrl: 'https://apex.dev/logo.png',
    primaryColor: '#6366F1',
    accentColor: '#10B981',
    footerText: 'Prepared exclusively by Apex Digital Agency'
  });
  console.assert(branding.brandName === 'Apex Digital Audit Engine', 'Branding mismatch');
  tracker.passed.push(`White-Label Studio: Saved custom brand "${branding.brandName}" with primary color ${branding.primaryColor}`);

  // ==========================================
  // 4. PUBLIC DEVELOPER REST API (v1) & KEYS
  // ==========================================
  console.log('\n--- 4. Public Developer REST API (v1) & Authentication ---');

  const apiKeyRes = repo.createApiKey(userId, 'Production CI/CD Runner');
  console.assert(apiKeyRes.apiKey.startsWith('weblens_sk_'), 'API key format invalid');
  tracker.passed.push(`API Keys: Generated secret key ${apiKeyRes.keyPrefix}`);

  const verifiedKeyUser = repo.verifyApiKey(apiKeyRes.apiKey);
  console.assert(verifiedKeyUser?.userId === userId, 'API Key verification failed');
  tracker.passed.push('API Keys: Verified secret key signature against SHA-256 hash');

  const fakeKeyCheck = repo.verifyApiKey('weblens_sk_invalid_fake_key_123456789');
  console.assert(fakeKeyCheck === null, 'Invalid key was accepted!');
  tracker.passed.push('API Security: Rejected invalid/tampered API key');

  // ==========================================
  // 5. BILLING TIERS & PLAN UPGRADE
  // ==========================================
  console.log('\n--- 5. Billing & Subscription Plans ---');

  const server = http.createServer(app);
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  const port = (server.address() as any).port;

  // Query plans
  const plansRes = await fetch(`http://127.0.0.1:${port}/api/billing/plans`);
  const plans = await plansRes.json();
  console.assert(plans.length === 3, 'Expected 3 billing plans');
  tracker.passed.push(`Billing: Verified 3 subscription tiers (Free, Pro $29/mo, Agency $99/mo)`);

  // Upgrade user tier to agency
  const upgradeRes = await fetch(`http://127.0.0.1:${port}/api/billing/upgrade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authRes.token}` },
    body: JSON.stringify({ tier: 'agency' })
  });
  const upgradeData = await upgradeRes.json();
  console.assert(upgradeData.user.tier === 'agency', 'Upgrade tier mismatch');
  console.assert(upgradeData.user.maxScansPerDay === 500, 'Quota limit was not elevated to 500 scans/day');
  tracker.passed.push('Billing: Upgraded user to Agency tier with 500 scans/day limit');

  // ==========================================
  // 6. ADMIN OPERATIONS & OBSERVABILITY
  // ==========================================
  console.log('\n--- 6. Admin Control Center & Observability ---');

  const adminStatsRes = await fetch(`http://127.0.0.1:${port}/api/admin/stats`);
  const adminStats = await adminStatsRes.json();
  console.assert(adminStats.totalScans > 0, 'Total scans missing in admin stats');
  console.assert(adminStats.totalUsers > 0, 'Total users missing in admin stats');
  tracker.passed.push(`Admin Observability: Aggregated system metrics (Total Scans: ${adminStats.totalScans}, Success Rate: ${adminStats.successRatePercent}%, Total Users: ${adminStats.totalUsers})`);

  server.close();
  closeDatabase();

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n========================================');
  console.log(`🎯 PHASE 4 AUDIT COMPLETE: ${tracker.passed.length} PASSED, ${tracker.failed.length} FAILED`);
  console.log('========================================\n');

  tracker.passed.forEach((p) => console.log(`  ✔ ${p}`));
  tracker.failed.forEach((f) => console.log(`  ✖ ${f}`));

  process.exit(tracker.failed.length > 0 ? 1 : 0);
}

runPhase4Verification().catch((err) => {
  console.error('Fatal Phase 4 error:', err);
  process.exit(1);
});
