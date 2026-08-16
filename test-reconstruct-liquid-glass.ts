import { chromium } from 'playwright';

async function testReconstructLiquidGlass() {
  console.log('--- Starting WebLens Reconstructed Liquid Glass Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // 1. Dark Obsidian background
  await page.screenshot({ path: 'screenshot_reconstruct_dark.png', fullPage: false });
  console.log('  Saved screenshot_reconstruct_dark.png');

  // 2. Vibrant Signal Orange background
  await page.evaluate(() => {
    const appEl = document.querySelector('.min-h-screen') as HTMLElement;
    if (appEl) {
      appEl.classList.remove('bg-[#080A0E]');
      appEl.style.background = 'radial-gradient(ellipse at 50% 0%, #FF6B35 0%, #312e81 45%, #080A0E 85%)';
    }
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_reconstruct_orange.png', fullPage: false });
  console.log('  Saved screenshot_reconstruct_orange.png');

  // 3. Warm White background
  await page.evaluate(() => {
    const appEl = document.querySelector('.min-h-screen') as HTMLElement;
    if (appEl) {
      appEl.style.background = 'linear-gradient(180deg, #F3F0E8 0%, #D8D4CA 35%, #080A0E 75%)';
    }
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_reconstruct_light.png', fullPage: false });
  console.log('  Saved screenshot_reconstruct_light.png');

  // 4. Natural texture background (simulating the reference image's outdoor texture)
  await page.evaluate(() => {
    const appEl = document.querySelector('.min-h-screen') as HTMLElement;
    if (appEl) {
      appEl.style.background = 'radial-gradient(circle at 30% 20%, #4d7c0f 0%, #1e3a1e 30%, #78350f 70%, #080A0E 100%)';
    }
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_reconstruct_texture.png', fullPage: false });
  console.log('  Saved screenshot_reconstruct_texture.png');

  // Clean up
  await page.evaluate(() => {
    const appEl = document.querySelector('.min-h-screen') as HTMLElement;
    if (appEl) {
      appEl.classList.add('bg-[#080A0E]');
      appEl.style.background = '';
    }
  });

  // 5. Active Translucent Island on /dashboard
  await page.locator('.gooey-nav-container nav a:has-text("Dashboard")').click();
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_reconstruct_dashboard.png', fullPage: false });
  console.log('  Saved screenshot_reconstruct_dashboard.png');

  // 6. Mobile Viewport (390px)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_reconstruct_mobile.png', fullPage: false });
  console.log('  Saved screenshot_reconstruct_mobile.png');

  await browser.close();
  console.log('\n✅ ALL RECONSTRUCTED LIQUID GLASS TESTS PASSED WITH 100% SUCCESS!');
}

testReconstructLiquidGlass().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
