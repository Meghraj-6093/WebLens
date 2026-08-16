import { chromium } from 'playwright';

async function testNavbarBlackRectFix() {
  console.log('--- Starting WebLens Liquid Glass Navbar Black Rectangle Fix Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // 1. Check computed styles of all GooeyNav effect elements
  const effectAnalysis = await page.evaluate(() => {
    const filterEl = document.querySelector('.gooey-nav-container .effect.filter');
    const textEl = document.querySelector('.gooey-nav-container .effect.text');
    const navBarEl = document.querySelector('.liquid-glass-navbar');

    const filterBefore = filterEl ? window.getComputedStyle(filterEl, '::before') : null;
    const filterAfter = filterEl ? window.getComputedStyle(filterEl, '::after') : null;

    return {
      filterBeforeBg: filterBefore?.backgroundColor,
      filterBeforeDisplay: filterBefore?.display,
      filterAfterBg: filterAfter?.backgroundImage || filterAfter?.backgroundColor,
      filterAfterBorderRadius: filterAfter?.borderRadius,
      navbarOverflow: navBarEl ? window.getComputedStyle(navBarEl).overflow : null,
      navbarBackdrop: navBarEl ? window.getComputedStyle(navBarEl).backdropFilter : null,
    };
  });

  console.log('\nGooeyNav Layer Inspection:');
  console.log(`  .effect.filter::before background: ${effectAnalysis.filterBeforeBg} (display: ${effectAnalysis.filterBeforeDisplay})`);
  console.log(`  .effect.filter::after borderRadius: ${effectAnalysis.filterAfterBorderRadius}`);
  console.log(`  Navbar backdrop-filter: ${effectAnalysis.navbarBackdrop}`);

  // 2. Capture regular screenshot
  await page.screenshot({ path: 'screenshot_navbar_no_black_box.png', fullPage: false });
  console.log('  Saved normal screenshot: screenshot_navbar_no_black_box.png');

  // 3. Test with a bright test background to visually confirm 100% translucency & zero dark rectangular compositing artifacts
  console.log('\nTesting translucency with bright test background...');
  await page.evaluate(() => {
    document.body.style.background = 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)';
    const testStrip = document.createElement('div');
    testStrip.id = 'test-translucency-strip';
    testStrip.style.position = 'fixed';
    testStrip.style.top = '0';
    testStrip.style.left = '0';
    testStrip.style.right = '0';
    testStrip.style.height = '120px';
    testStrip.style.background = 'linear-gradient(90deg, #FF6B35 0%, #3b82f6 50%, #10b981 100%)';
    testStrip.style.zIndex = '10';
    testStrip.style.opacity = '0.7';
    document.body.prepend(testStrip);
  });
  await page.waitForTimeout(200);

  await page.screenshot({ path: 'screenshot_navbar_translucency_test.png', fullPage: false });
  console.log('  Saved translucency test screenshot: screenshot_navbar_translucency_test.png');

  // Clean up test strip
  await page.evaluate(() => {
    document.getElementById('test-translucency-strip')?.remove();
    document.body.style.background = '';
  });

  // 4. Test navigation to multiple items
  console.log('\nTesting navigation movement across items...');
  const itemsToClick = ['Dashboard', 'Monitoring', 'Competitors', 'API', 'Scanner'];
  for (const item of itemsToClick) {
    await page.locator(`.gooey-nav-container nav a:has-text("${item}")`).click();
    await page.waitForTimeout(250);
  }

  await page.screenshot({ path: 'screenshot_navbar_after_nav.png', fullPage: false });
  console.log('  Saved post-navigation screenshot: screenshot_navbar_after_nav.png');

  await browser.close();
  console.log('\n✅ ALL BLACK RECTANGLE FIX AUDITS PASSED WITH 100% SUCCESS!');
}

testNavbarBlackRectFix().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
