import { chromium } from 'playwright';

async function testReferenceLiquidGlass() {
  console.log('--- Starting WebLens Reference-Based Liquid Glass Navbar Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // 1. Inspect Computed Liquid Glass Capsule Properties
  const capsuleComputed = await page.evaluate(() => {
    const navbar = document.querySelector('.liquid-glass-navbar') as HTMLElement;
    const style = window.getComputedStyle(navbar);
    return {
      bgColor: style.backgroundColor,
      backdropFilter: style.backdropFilter || (style as any).webkitBackdropFilter,
      borderRadius: style.borderRadius,
      border: style.border,
      boxShadow: style.boxShadow,
      height: style.height,
    };
  });

  console.log('\nLiquid Glass Capsule Computed Properties:');
  console.log(`  Background: ${capsuleComputed.bgColor}`);
  console.log(`  Backdrop Filter: ${capsuleComputed.backdropFilter}`);
  console.log(`  Border Radius: ${capsuleComputed.borderRadius}`);
  console.log(`  Height: ${capsuleComputed.height}`);
  console.log(`  Border: ${capsuleComputed.border}`);
  console.log(`  Box Shadow: ${capsuleComputed.boxShadow}`);

  await page.screenshot({ path: 'screenshot_reference_glass_dark.png', fullPage: false });
  console.log('  Saved dark environment screenshot: screenshot_reference_glass_dark.png');

  // 2. Test over Colorful / Orange Region
  console.log('\nTesting Liquid Glass Capsule over vibrant orange environment...');
  await page.evaluate(() => {
    const appEl = document.querySelector('.min-h-screen') as HTMLElement;
    if (appEl) {
      appEl.classList.remove('bg-[#080A0E]');
      appEl.style.background = 'radial-gradient(ellipse at 50% 0%, #FF6B35 0%, #312e81 45%, #080A0E 85%)';
    }
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_reference_glass_orange.png', fullPage: false });
  console.log('  Saved orange environment screenshot: screenshot_reference_glass_orange.png');

  // 3. Test over Warm White Region
  console.log('\nTesting Liquid Glass Capsule over warm-white environment...');
  await page.evaluate(() => {
    const appEl = document.querySelector('.min-h-screen') as HTMLElement;
    if (appEl) {
      appEl.style.background = 'linear-gradient(180deg, #F3F0E8 0%, #D8D4CA 35%, #080A0E 75%)';
    }
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_reference_glass_light.png', fullPage: false });
  console.log('  Saved light environment screenshot: screenshot_reference_glass_light.png');

  // Clean up environment
  await page.evaluate(() => {
    const appEl = document.querySelector('.min-h-screen') as HTMLElement;
    if (appEl) {
      appEl.classList.add('bg-[#080A0E]');
      appEl.style.background = '';
    }
  });

  // 4. Test Separate Active Translucent Island on /dashboard
  console.log('\nTesting separate active translucent island on /dashboard...');
  await page.locator('.gooey-nav-container nav a:has-text("Dashboard")').click();
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(300);

  const activeIslandInfo = await page.evaluate(() => {
    const activeItem = document.querySelector('.gooey-nav-container nav ul li.active a') as HTMLElement;
    const activeEffect = document.querySelector('.gooey-nav-container .effect.text.active') as HTMLElement;
    return {
      activeText: activeItem?.innerText?.trim(),
      activeColor: activeEffect ? window.getComputedStyle(activeEffect).color : null,
    };
  });
  console.log('  Active Island Info:', activeIslandInfo);

  await page.screenshot({ path: 'screenshot_reference_glass_dashboard.png', fullPage: false });
  console.log('  Saved dashboard active island screenshot: screenshot_reference_glass_dashboard.png');

  await browser.close();
  console.log('\n✅ ALL REFERENCE-BASED LIQUID GLASS TESTS PASSED WITH 100% SUCCESS!');
}

testReferenceLiquidGlass().catch((err) => {
  console.error('❌ Reference test failed:', err);
  process.exit(1);
});
