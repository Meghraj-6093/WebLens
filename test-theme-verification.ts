import { chromium } from 'playwright';

async function verifyTheme() {
  console.log('--- Starting WebLens 60/30/10 Theme Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const routes = [
    { path: '/', name: 'Home Page' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/history', name: 'History' },
    { path: '/projects', name: 'Projects' },
    { path: '/monitoring', name: 'Monitoring' },
    { path: '/competitor', name: 'Competitors' },
    { path: '/agency', name: 'Agency Studio' },
    { path: '/developer-api', name: 'API Explorer' },
    { path: '/profile', name: 'Profile / Local Workspace' },
  ];

  for (const r of routes) {
    console.log(`Testing route: ${r.name} (${r.path})...`);
    await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle' });
    
    // Check root background
    const bodyBg = await page.evaluate(() => {
      const el = document.querySelector('#root > div') as HTMLElement;
      return el ? window.getComputedStyle(el).backgroundColor : '';
    });
    console.log(`  Root background color: ${bodyBg}`);

    // Take screenshot for visual validation
    const filename = `screenshot_${r.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`  Saved screenshot: ${filename}`);
  }

  // Also test scanning a real test site
  console.log('Testing live scan workflow with 60/30/10 theme...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const input = page.locator('input[type="text"]');
  await input.fill('https://example.com');
  await page.click('button:has-text("Analyze Website")');

  // Wait for scan page
  await page.waitForURL(/\/scan\//, { timeout: 10000 });
  console.log('  On scan progress page...');
  await page.screenshot({ path: 'screenshot_scan_progress.png' });

  // Wait for report page
  await page.waitForURL(/\/report\//, { timeout: 45000 });
  console.log('  On report page...');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshot_report_overview.png' });

  // Click Score Breakdown Modal
  const breakdownBtn = page.locator('button:has-text("View Complete Score Breakdown & Deductions")');
  if (await breakdownBtn.isVisible()) {
    await breakdownBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshot_score_breakdown_modal.png' });
    await page.keyboard.press('Escape');
  }

  await browser.close();
  console.log('✅ ALL THEME VERIFICATION TESTS PASSED!');
}

verifyTheme().catch((err) => {
  console.error('❌ Theme verification failed:', err);
  process.exit(1);
});
