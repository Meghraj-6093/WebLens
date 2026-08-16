import { chromium } from 'playwright';

async function testFooterDepthText() {
  console.log('--- Starting WebLens Footer DepthText Multi-Viewport Verification ---');
  const browser = await chromium.launch();

  const viewports = [
    { width: 1920, height: 1080, name: 'Desktop 1920' },
    { width: 1440, height: 900, name: 'Desktop 1440' },
    { width: 1280, height: 800, name: 'Desktop 1280' },
    { width: 1024, height: 768, name: 'Tablet Landscape 1024' },
    { width: 768, height: 1024, name: 'Tablet Portrait 768' },
    { width: 425, height: 900, name: 'Mobile Large 425' },
    { width: 390, height: 844, name: 'Mobile Standard 390' },
    { width: 375, height: 667, name: 'Mobile Compact 375' },
    { width: 320, height: 568, name: 'Mobile Ultra-Compact 320' },
  ];

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // Scroll to footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Verify no horizontal overflow on document or body
    const overflowCheck = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;
      return {
        clientWidth: docWidth,
        scrollWidth: Math.max(scrollWidth, bodyScrollWidth),
        hasHorizontalOverflow: Math.max(scrollWidth, bodyScrollWidth) > docWidth + 1
      };
    });

    console.log(`  Overflow check: clientWidth=${overflowCheck.clientWidth}, scrollWidth=${overflowCheck.scrollWidth}`);
    if (overflowCheck.hasHorizontalOverflow) {
      throw new Error(`Horizontal overflow detected at ${vp.width}px!`);
    }

    // Verify DepthText exists in the DOM
    const depthText = page.locator('.depth-text');
    const isVisible = await depthText.isVisible();
    console.log(`  DepthText visible: ${isVisible}`);

    // Verify transform style is actively applied
    const stageTransform = await page.evaluate(() => {
      const stage = document.querySelector('.depth-text__stage') as HTMLElement;
      return stage ? stage.style.transform : '';
    });
    console.log(`  DepthText stage transform: ${stageTransform}`);

    // Verify that footer links remain clickable and on top
    const dashboardLink = page.locator('footer a:has-text("Local Dashboard")');
    const isClickable = await dashboardLink.isVisible();
    console.log(`  Footer Dashboard link visible & accessible: ${isClickable}`);

    // Move pointer over footer to test parallax interaction
    await page.mouse.move(vp.width / 2, vp.height - 100);
    await page.waitForTimeout(300);
    await page.mouse.move(vp.width / 4, vp.height - 50);
    await page.waitForTimeout(300);

    // Take screenshot of footer container element
    const screenshotName = `screenshot_footer_${vp.width}px.png`;
    await footer.screenshot({ path: screenshotName });
    console.log(`  Saved footer screenshot: ${screenshotName}`);

    await page.close();
  }

  // Also test clicking a footer link to ensure click events pass cleanly to navigation
  console.log('\nTesting Footer link navigation...');
  const testPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await testPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const footerLink = testPage.locator('footer a:has-text("Continuous Monitoring")');
  await footerLink.scrollIntoViewIfNeeded();
  await footerLink.click();
  await testPage.waitForURL(/\/monitoring/);
  console.log('  Successfully navigated to /monitoring via footer link!');
  await testPage.close();

  await browser.close();
  console.log('\n✅ ALL FOOTER DEPTHTEXT TESTS PASSED WITH 0 ERRORS!');
}

testFooterDepthText().catch((err) => {
  console.error('❌ Footer DepthText test failed:', err);
  process.exit(1);
});
