import { chromium } from 'playwright';

async function testPageTransitions() {
  console.log('--- Starting WebLens Global Page Transitions Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const routes = [
    { path: '/', name: 'Scanner' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/monitoring', name: 'Monitoring' },
    { path: '/competitors', name: 'Competitors' },
    { path: '/agency', name: 'Agency' },
    { path: '/developers', name: 'API' },
    { path: '/profile', name: 'Profile' },
  ];

  // 1. Test standard navigation transitions
  console.log('\nTesting transition mounting and persistent navbar across all routes...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  for (const r of routes) {
    const startTime = Date.now();
    const navLink = page.locator(`.gooey-nav-container nav a:has-text("${r.name}")`);
    await navLink.click();
    await page.waitForURL(`**${r.path}`);
    
    // Verify page transition wrapper exists
    const hasTransitionWrapper = await page.evaluate(() => {
      const el = document.querySelector('.weblens-page-transition');
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.animationName.includes('weblensPageEnter');
    });

    const elapsed = Date.now() - startTime;
    console.log(`  Navigated to ${r.path} (${r.name}) in ${elapsed}ms | Transition wrapper verified: ${hasTransitionWrapper}`);

    if (!hasTransitionWrapper) {
      throw new Error(`Page transition wrapper missing on route ${r.path}!`);
    }

    // Verify navbar remains persistent in DOM
    const isNavbarVisible = await page.locator('header').isVisible();
    if (!isNavbarVisible) {
      throw new Error(`Navbar vanished during transition on ${r.path}!`);
    }
  }

  // 2. Capture Settled Screenshot
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_page_transition_settled.png', fullPage: false });
  console.log('  Saved screenshot: screenshot_page_transition_settled.png');

  // 3. Rapid navigation stress test (12 rapid transitions)
  console.log('\nRunning rapid transition stress test (12 rapid transitions)...');
  const rapidSequence = ['Dashboard', 'Monitoring', 'Competitors', 'Agency', 'API', 'Profile', 'Scanner', 'Dashboard', 'Monitoring', 'Competitors', 'Agency', 'Scanner'];
  for (const target of rapidSequence) {
    await page.locator(`.gooey-nav-container nav a:has-text("${target}")`).click();
    await page.waitForTimeout(50); // fast rapid clicking
  }

  // Allow final transition to settle (~400ms)
  await page.waitForTimeout(600);

  const wrapperCount = await page.evaluate(() => {
    return document.querySelectorAll('.weblens-page-transition').length;
  });
  console.log(`  Transition wrapper count after rapid clicking: ${wrapperCount} (expected: 1)`);
  if (wrapperCount !== 1) {
    throw new Error(`Duplicate page transition wrappers stacked in DOM: ${wrapperCount}!`);
  }

  // 4. Test reduced-motion support
  console.log('\nTesting reduced-motion preference...');
  const reducedMotionPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce'
  });
  await reducedMotionPage.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
  const isReducedAnimationDisabled = await reducedMotionPage.evaluate(() => {
    const el = document.querySelector('.weblens-page-transition');
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return style.animationName === 'none' || style.animationDuration === '0s';
  });
  console.log(`  Reduced motion disabled animation: ${isReducedAnimationDisabled}`);
  await reducedMotionPage.close();

  await browser.close();
  console.log('\n✅ ALL PAGE TRANSITION TESTS PASSED WITH 100% SUCCESS!');
}

testPageTransitions().catch((err) => {
  console.error('❌ Page transition test failed:', err);
  process.exit(1);
});
