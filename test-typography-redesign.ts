import { chromium } from 'playwright';

async function testTypography() {
  console.log('--- Starting WebLens Typography Redesign Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Check Homepage Typography
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const heroTypography = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const p = document.querySelector('p');
    const btn = document.querySelector('button[type="submit"]');
    const navLink = document.querySelector('.gooey-nav-container nav a');
    return {
      h1Font: h1 ? window.getComputedStyle(h1).fontFamily : '',
      h1Weight: h1 ? window.getComputedStyle(h1).fontWeight : '',
      pFont: p ? window.getComputedStyle(p).fontFamily : '',
      pWeight: p ? window.getComputedStyle(p).fontWeight : '',
      btnFont: btn ? window.getComputedStyle(btn).fontFamily : '',
      navFont: navLink ? window.getComputedStyle(navLink).fontFamily : '',
    };
  });

  console.log('\nHomepage Computed Typography:');
  console.log(`  H1 Display Font: ${heroTypography.h1Font} (weight: ${heroTypography.h1Weight})`);
  console.log(`  Body Reading Font: ${heroTypography.pFont} (weight: ${heroTypography.pWeight})`);
  console.log(`  Button Display Font: ${heroTypography.btnFont}`);
  console.log(`  Navigation Display Font: ${heroTypography.navFont}`);

  if (!heroTypography.h1Font.toLowerCase().includes('space grotesk')) {
    throw new Error(`H1 does not use Space Grotesk: ${heroTypography.h1Font}`);
  }
  if (!heroTypography.pFont.toLowerCase().includes('inter')) {
    throw new Error(`Body does not use Inter: ${heroTypography.pFont}`);
  }

  // Capture Hero Section screenshot
  await page.screenshot({ path: 'screenshot_typography_hero.png', fullPage: false });
  console.log('  Saved Hero screenshot: screenshot_typography_hero.png');

  // 2. Check Dashboard Typography
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_typography_dashboard.png', fullPage: false });
  console.log('  Saved Dashboard screenshot: screenshot_typography_dashboard.png');

  // 3. Multi-viewport check
  const viewports = [1920, 1440, 1024, 768, 375];
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp, height: 800 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`  Viewport ${vp}px horizontal overflow: ${overflow}`);
    if (overflow) {
      throw new Error(`Horizontal overflow detected at ${vp}px!`);
    }
  }

  await browser.close();
  console.log('\n✅ ALL TYPOGRAPHY REDESIGN TESTS PASSED WITH 100% SUCCESS!');
}

testTypography().catch((err) => {
  console.error('❌ Typography test failed:', err);
  process.exit(1);
});
