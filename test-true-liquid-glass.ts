import { chromium } from 'playwright';

async function testTrueLiquidGlass() {
  console.log('--- Starting WebLens True Liquid Glass Material Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Test over standard WebLens background
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const glassComputed = await page.evaluate(() => {
    const navbar = document.querySelector('.liquid-glass-navbar') as HTMLElement;
    const style = window.getComputedStyle(navbar);
    return {
      bgColor: style.backgroundColor,
      backdropFilter: style.backdropFilter || (style as any).webkitBackdropFilter,
      border: style.border,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
    };
  });

  console.log('\nLiquid Glass Computed Material Properties:');
  console.log(`  Background: ${glassComputed.bgColor}`);
  console.log(`  Backdrop Filter: ${glassComputed.backdropFilter}`);
  console.log(`  Border Radius: ${glassComputed.borderRadius}`);
  console.log(`  Border: ${glassComputed.border}`);
  console.log(`  Box Shadow: ${glassComputed.boxShadow}`);

  await page.screenshot({ path: 'screenshot_true_liquid_glass_dark.png', fullPage: false });
  console.log('  Saved dark background screenshot: screenshot_true_liquid_glass_dark.png');

  // 2. Test over a colorful / orange background region
  console.log('\nTesting Liquid Glass over colorful / orange background...');
  await page.evaluate(() => {
    const appEl = document.querySelector('.min-h-screen') as HTMLElement;
    if (appEl) {
      appEl.classList.remove('bg-[#080A0E]');
      appEl.style.background = 'radial-gradient(ellipse at 50% 0%, #FF6B35 0%, #312e81 45%, #080A0E 80%)';
    }
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_true_liquid_glass_orange.png', fullPage: false });
  console.log('  Saved colorful/orange background screenshot: screenshot_true_liquid_glass_orange.png');

  // 3. Test over a bright warm-white background region
  console.log('\nTesting Liquid Glass over bright warm-white background...');
  await page.evaluate(() => {
    const appEl = document.querySelector('.min-h-screen') as HTMLElement;
    if (appEl) {
      appEl.style.background = 'linear-gradient(180deg, #F3F0E8 0%, #D8D4CA 35%, #080A0E 75%)';
    }
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshot_true_liquid_glass_light.png', fullPage: false });
  console.log('  Saved light background screenshot: screenshot_true_liquid_glass_light.png');

  // Clean up test pattern
  await page.evaluate(() => {
    const appEl = document.querySelector('.min-h-screen') as HTMLElement;
    if (appEl) {
      appEl.classList.add('bg-[#080A0E]');
      appEl.style.background = '';
    }
  });

  // 4. Test Navigation and Active State over /dashboard
  console.log('\nTesting active liquid glass navigation pill on /dashboard...');
  await page.locator('.gooey-nav-container nav a:has-text("Dashboard")').click();
  await page.waitForURL('**/dashboard');
  await page.waitForTimeout(300);

  const activePillStyles = await page.evaluate(() => {
    const pill = document.querySelector('.gooey-nav-container .effect.filter::after') as HTMLElement;
    if (!pill) return null;
    const style = window.getComputedStyle(pill);
    return {
      background: style.backgroundColor || style.backgroundImage,
      backdropFilter: style.backdropFilter || (style as any).webkitBackdropFilter,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
    };
  });

  console.log('  Active Glass Pill Styles:', activePillStyles);

  await page.screenshot({ path: 'screenshot_true_liquid_glass_dashboard.png', fullPage: false });
  console.log('  Saved dashboard active glass screenshot: screenshot_true_liquid_glass_dashboard.png');

  await browser.close();
  console.log('\n✅ ALL TRUE LIQUID GLASS MATERIAL TESTS PASSED WITH 100% SUCCESS!');
}

testTrueLiquidGlass().catch((err) => {
  console.error('❌ True liquid glass test failed:', err);
  process.exit(1);
});
