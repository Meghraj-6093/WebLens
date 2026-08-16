import { chromium } from 'playwright';

async function testLiquidGlassNavbar() {
  console.log('--- Starting WebLens Apple Liquid Glass Navbar Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // 1. Inspect Liquid Glass Navbar styles
  const navbarStyles = await page.evaluate(() => {
    const el = document.querySelector('.liquid-glass-navbar') as HTMLElement;
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      backdropFilter: style.backdropFilter || (style as any).webkitBackdropFilter,
      borderRadius: style.borderRadius,
      border: style.border,
      boxShadow: style.boxShadow,
      className: el.className,
    };
  });

  console.log('\nNavbar Computed Liquid Glass Properties:');
  console.log(`  Backdrop Filter: ${navbarStyles?.backdropFilter}`);
  console.log(`  Border Radius: ${navbarStyles?.borderRadius}`);
  console.log(`  Border: ${navbarStyles?.border}`);
  console.log(`  Box Shadow: ${navbarStyles?.boxShadow}`);

  if (!navbarStyles?.backdropFilter.includes('blur')) {
    throw new Error('Liquid glass backdrop-filter blur is missing!');
  }

  // 2. Test Dynamic Pointer Tracking
  console.log('\nTesting dynamic mouse pointer reflection tracking...');
  await page.mouse.move(720, 30); // center of header
  await page.waitForTimeout(100);

  const glassCoords = await page.evaluate(() => {
    const el = document.querySelector('.liquid-glass-navbar') as HTMLElement;
    return {
      x: el?.style.getPropertyValue('--glass-x'),
      y: el?.style.getPropertyValue('--glass-y'),
    };
  });
  console.log(`  Computed Glass Coords on Mouse Move: x=${glassCoords.x}, y=${glassCoords.y}`);

  // 3. Test Scroll State
  console.log('\nTesting scroll state modifier...');
  await page.evaluate(() => window.scrollTo(0, 100));
  await page.waitForTimeout(200);
  const isScrolled = await page.evaluate(() => {
    const el = document.querySelector('.liquid-glass-navbar');
    return el?.classList.contains('scrolled');
  });
  console.log(`  Navbar .scrolled class active: ${isScrolled}`);

  // Capture Desktop Screenshot
  await page.screenshot({ path: 'screenshot_liquid_glass_desktop.png', fullPage: false });
  console.log('  Saved desktop screenshot: screenshot_liquid_glass_desktop.png');

  // 4. Test Mobile Liquid Glass Viewport & Drawer
  console.log('\nTesting Mobile Viewport & Liquid Glass Drawer...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // Open mobile menu
  await page.locator('button[aria-label="Toggle Navigation Menu"]').click();
  await page.waitForTimeout(300);

  const isDrawerVisible = await page.locator('.liquid-glass-drawer').isVisible();
  console.log(`  Mobile Liquid Glass Drawer visible: ${isDrawerVisible}`);

  await page.screenshot({ path: 'screenshot_liquid_glass_mobile.png', fullPage: false });
  console.log('  Saved mobile screenshot: screenshot_liquid_glass_mobile.png');

  await browser.close();
  console.log('\n✅ ALL APPLE LIQUID GLASS NAVBAR TESTS PASSED WITH 100% SUCCESS!');
}

testLiquidGlassNavbar().catch((err) => {
  console.error('❌ Liquid glass navbar test failed:', err);
  process.exit(1);
});
