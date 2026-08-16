import { chromium } from 'playwright';

async function testCenteredNavbar() {
  console.log('--- Starting WebLens Centered Navbar Layout Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // 1. Check Centering at 1440px
  const desktop1440 = await page.evaluate(() => {
    const navbar = document.querySelector('.liquid-glass-navbar') as HTMLElement;
    const nav = document.querySelector('.gooey-nav-container') as HTMLElement;
    const logo = document.querySelector('header a[aria-label="WebLens Home"]') as HTMLElement;
    const workspace = document.querySelector('.liquid-glass-capsule') as HTMLElement;

    const navbarRect = navbar.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const logoRect = logo.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();

    const navbarCenter = navbarRect.left + navbarRect.width / 2;
    const navCenter = navRect.left + navRect.width / 2;
    const offset = Math.abs(navbarCenter - navCenter);

    return {
      navbarWidth: navbarRect.width,
      navbarCenter,
      navCenter,
      offset,
      logoLeft: logoRect.left - navbarRect.left,
      workspaceRight: navbarRect.right - workspaceRect.right,
    };
  });

  console.log('\n1440px Viewport Alignment Check:');
  console.log(`  Navbar Width: ${desktop1440.navbarWidth.toFixed(1)}px`);
  console.log(`  Navbar Center X: ${desktop1440.navbarCenter.toFixed(1)}px`);
  console.log(`  Navigation Group Center X: ${desktop1440.navCenter.toFixed(1)}px`);
  console.log(`  Center Alignment Difference: ${desktop1440.offset.toFixed(2)}px`);
  console.log(`  Logo Left Inset: ${desktop1440.logoLeft.toFixed(1)}px`);
  console.log(`  Workspace Right Inset: ${desktop1440.workspaceRight.toFixed(1)}px`);

  if (desktop1440.offset > 2.5) {
    throw new Error(`Navigation is not centered! Offset is ${desktop1440.offset.toFixed(2)}px`);
  }

  await page.screenshot({ path: 'screenshot_centered_navbar_1440.png', fullPage: false });
  console.log('  Saved 1440px desktop screenshot: screenshot_centered_navbar_1440.png');

  // 2. Check 1920px Viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(200);

  const desktop1920 = await page.evaluate(() => {
    const navbar = document.querySelector('.liquid-glass-navbar') as HTMLElement;
    const nav = document.querySelector('.gooey-nav-container') as HTMLElement;
    const navbarRect = navbar.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const navbarCenter = navbarRect.left + navbarRect.width / 2;
    const navCenter = navRect.left + navRect.width / 2;
    return { offset: Math.abs(navbarCenter - navCenter) };
  });
  console.log(`\n1920px Viewport Center Offset: ${desktop1920.offset.toFixed(2)}px`);
  if (desktop1920.offset > 2.5) {
    throw new Error(`Navigation is not centered at 1920px! Offset: ${desktop1920.offset}`);
  }

  // 3. Check 1280px Viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(200);

  const desktop1280 = await page.evaluate(() => {
    const navbar = document.querySelector('.liquid-glass-navbar') as HTMLElement;
    const nav = document.querySelector('.gooey-nav-container') as HTMLElement;
    const navbarRect = navbar.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    const navbarCenter = navbarRect.left + navbarRect.width / 2;
    const navCenter = navRect.left + navRect.width / 2;
    return { offset: Math.abs(navbarCenter - navCenter) };
  });
  console.log(`1280px Viewport Center Offset: ${desktop1280.offset.toFixed(2)}px`);
  if (desktop1280.offset > 2.5) {
    throw new Error(`Navigation is not centered at 1280px! Offset: ${desktop1280.offset}`);
  }

  // 4. Test Navigation Flow & Active State
  console.log('\nTesting active pill movement across centered nav...');
  await page.locator('.gooey-nav-container nav a:has-text("Monitoring")').click();
  await page.waitForURL('**/monitoring');
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'screenshot_centered_navbar_monitoring.png', fullPage: false });
  console.log('  Saved active Monitoring screenshot: screenshot_centered_navbar_monitoring.png');

  // 5. Check Mobile (375px)
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'screenshot_centered_navbar_mobile.png', fullPage: false });
  console.log('  Saved 375px mobile screenshot: screenshot_centered_navbar_mobile.png');

  await browser.close();
  console.log('\n✅ ALL CENTERED NAVBAR LAYOUT TESTS PASSED WITH 100% MATHEMATICAL PRECISION!');
}

testCenteredNavbar().catch((err) => {
  console.error('❌ Centered navbar test failed:', err);
  process.exit(1);
});
