import { chromium } from 'playwright';

async function testGooeyNav() {
  console.log('--- Starting WebLens GooeyNav Interactive Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Test direct route landing & active pill synchronization
  const routesToTest = [
    { path: '/', expectedLabel: 'Scanner', index: 0 },
    { path: '/dashboard', expectedLabel: 'Dashboard', index: 1 },
    { path: '/monitoring', expectedLabel: 'Monitoring', index: 2 },
    { path: '/competitors', expectedLabel: 'Competitors', index: 3 },
    { path: '/agency', expectedLabel: 'Agency', index: 4 },
    { path: '/developers', expectedLabel: 'API', index: 5 },
    { path: '/profile', expectedLabel: 'Profile', index: 6 },
  ];

  for (const r of routesToTest) {
    console.log(`\nTesting direct landing on ${r.path}...`);
    await page.goto(`http://localhost:5173${r.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);

    const activeText = await page.evaluate(() => {
      const textEl = document.querySelector('.gooey-nav-container .effect.text') as HTMLElement;
      const activeLi = document.querySelector('.gooey-nav-container nav ul li.active a') as HTMLElement;
      return {
        effectText: textEl ? textEl.innerText.trim() : '',
        activeLiText: activeLi ? activeLi.innerText.trim() : ''
      };
    });

    console.log(`  Expected: ${r.expectedLabel}, Active effect: ${activeText.effectText}, Active link: ${activeText.activeLiText}`);
    if (activeText.activeLiText !== r.expectedLabel) {
      throw new Error(`Route mismatch on ${r.path}! Expected ${r.expectedLabel}, got ${activeText.activeLiText}`);
    }
  }

  // 2. Test interactive clicking & gooey transition
  console.log('\nTesting interactive click transitions...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  const navClicks = ['Dashboard', 'Monitoring', 'Competitors', 'Agency', 'API', 'Profile', 'Scanner'];
  for (const target of navClicks) {
    console.log(`  Clicking nav item: "${target}"...`);
    const link = page.locator(`.gooey-nav-container nav a:has-text("${target}")`);
    await link.click();
    await page.waitForTimeout(100);

    // Check if particles spawned during transition
    const particleCountDuring = await page.evaluate(() => {
      return document.querySelectorAll('.gooey-particle').length;
    });
    console.log(`    Particles spawned during transition: ${particleCountDuring}`);

    await page.waitForTimeout(600);

    // Verify final active state
    const currentActive = await page.evaluate(() => {
      const activeLi = document.querySelector('.gooey-nav-container nav ul li.active a') as HTMLElement;
      return activeLi ? activeLi.innerText.trim() : '';
    });
    console.log(`    Settled active link: "${currentActive}"`);
    if (currentActive !== target) {
      throw new Error(`Click navigation failed for "${target}"! Current active is "${currentActive}"`);
    }
  }

  // Take screenshot of navbar in settled state
  const header = page.locator('header');
  await header.screenshot({ path: 'screenshot_header_gooey_nav.png' });
  console.log('  Saved screenshot: screenshot_header_gooey_nav.png');

  // 3. Rapid click stress test
  console.log('\nRunning rapid click stress test (10 rapid clicks)...');
  for (let i = 0; i < 10; i++) {
    const target = navClicks[i % navClicks.length];
    await page.locator(`.gooey-nav-container nav a:has-text("${target}")`).click();
    await page.waitForTimeout(50); // fast rapid clicking
  }

  // Wait for all particle timers to expire (animationTime * 2 + timeVariance = ~1.2s)
  await page.waitForTimeout(1500);

  // Verify that all particle DOM elements were completely cleaned up
  const residualParticles = await page.evaluate(() => {
    return document.querySelectorAll('.gooey-particle').length;
  });
  console.log(`  Residual particles in DOM after rapid clicking: ${residualParticles}`);
  if (residualParticles > 0) {
    throw new Error(`Memory leak: ${residualParticles} orphaned particles remaining in DOM!`);
  }

  // 4. Keyboard interaction test
  console.log('\nTesting keyboard navigation (Tab & Enter)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  // Focus first link
  await page.focus('.gooey-nav-container nav a:has-text("Scanner")');
  await page.keyboard.press('Tab'); // Focus Dashboard
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  await page.waitForURL(/\/dashboard/);
  console.log('  Successfully navigated to /dashboard using keyboard Tab + Enter!');

  // 5. Mobile responsive check
  console.log('\nTesting mobile viewport (375px)...');
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  // Open hamburger menu
  const menuButton = mobilePage.locator('header button[aria-label="Toggle Navigation Menu"]');
  await menuButton.click();
  await mobilePage.waitForTimeout(300);
  const mobileDashboardLink = mobilePage.locator('.animate-fade-in a:has-text("Dashboard")');
  const isMobileVisible = await mobileDashboardLink.isVisible();
  console.log(`  Mobile drawer open and links visible: ${isMobileVisible}`);
  await mobileDashboardLink.click();
  await mobilePage.waitForURL(/\/dashboard/);
  console.log('  Mobile navigation to /dashboard successful!');
  await mobilePage.close();

  await browser.close();
  console.log('\n✅ ALL GOOEYNAV TESTS PASSED WITH 100% SUCCESS!');
}

testGooeyNav().catch((err) => {
  console.error('❌ GooeyNav test failed:', err);
  process.exit(1);
});
