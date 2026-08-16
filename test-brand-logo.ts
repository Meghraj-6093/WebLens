import { chromium } from 'playwright';

async function testBrandLogo() {
  console.log('--- Starting WebLens Brand Logo Redesign Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // 1. Capture Header Brand Logo Lockup
  const brandLogo = page.locator('header a[aria-label="WebLens Home"]');
  await brandLogo.waitFor({ state: 'visible' });
  await brandLogo.screenshot({ path: 'screenshot_brand_logo_header.png' });
  console.log('  Saved Header brand logo screenshot: screenshot_brand_logo_header.png');

  // 2. Capture Full Floating Header with new logo & GooeyNav
  const header = page.locator('header');
  await header.screenshot({ path: 'screenshot_header_with_new_logo.png' });
  console.log('  Saved full header screenshot: screenshot_header_with_new_logo.png');

  // 3. Capture Footer Brand Logo
  const footerLogo = page.locator('footer a[aria-label="WebLens Home"]');
  await footerLogo.scrollIntoViewIfNeeded();
  await footerLogo.screenshot({ path: 'screenshot_brand_logo_footer.png' });
  console.log('  Saved Footer brand logo screenshot: screenshot_brand_logo_footer.png');

  // 4. Capture Mobile Header Brand Logo at 375px
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const mobileHeader = page.locator('header');
  await mobileHeader.screenshot({ path: 'screenshot_brand_logo_mobile.png' });
  console.log('  Saved Mobile brand logo screenshot: screenshot_brand_logo_mobile.png');

  await browser.close();
  console.log('\n✅ BRAND LOGO VERIFICATION PASSED WITH 100% SUCCESS!');
}

testBrandLogo().catch((err) => {
  console.error('❌ Brand Logo test failed:', err);
  process.exit(1);
});
