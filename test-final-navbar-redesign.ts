import { chromium } from 'playwright';

async function testFinalNavbarRedesign() {
  console.log('--- Starting WebLens Final Navbar Redesign Verification ---');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Check initial homepage load
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // Inspect nav items in DOM
  const navItems = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.gooey-nav-container nav a'));
    return links.map(l => ({ label: l.textContent?.trim(), href: l.getAttribute('href') }));
  });

  console.log('\nNavbar Item Inspection:');
  console.log('  Items found:', navItems);

  const labels = navItems.map(i => i.label);
  if (labels.includes('Scanner')) {
    throw new Error('Scanner should NOT be in the secondary navigation items!');
  }
  if (labels.includes('Profile')) {
    throw new Error('Profile should NOT be in the secondary navigation items!');
  }
  if (labels.length !== 5) {
    throw new Error(`Expected exactly 5 navigation items, found ${labels.length}`);
  }

  // 2. Test logo navigation to /
  console.log('\nTesting logo navigation to /...');
  const logoLink = page.locator('header a[aria-label="WebLens Home"]');
  await logoLink.click();
  await page.waitForURL('http://localhost:5173/');

  // 3. Test navigation to each secondary route
  const routesToTest = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Monitoring', path: '/monitoring' },
    { label: 'Competitors', path: '/competitors' },
    { label: 'Agency', path: '/agency' },
    { label: 'API', path: '/developers' },
  ];

  for (const r of routesToTest) {
    console.log(`\nNavigating to ${r.label} (${r.path})...`);
    await page.locator(`.gooey-nav-container nav a:has-text("${r.label}")`).click();
    await page.waitForURL(`**${r.path}`);
    await page.waitForTimeout(200);

    const activeText = await page.evaluate(() => {
      const activeLi = document.querySelector('.gooey-nav-container nav ul li.active a');
      return activeLi?.textContent?.trim();
    });
    console.log(`  Active item text in DOM: ${activeText} (expected: ${r.label})`);
    if (activeText !== r.label) {
      throw new Error(`Active item mismatch! Expected ${r.label}, found ${activeText}`);
    }
  }

  // 4. Test Local Workspace navigation to /profile
  console.log('\nTesting Local Workspace capsule navigation to /profile...');
  await page.locator('header a:has-text("Local Workspace")').click();
  await page.waitForURL('**/profile');
  console.log('  Successfully navigated to /profile via Local Workspace capsule');

  // 5. Test Logo navigation back to Home /
  console.log('\nTesting Logo navigation back to Home /...');
  await logoLink.click();
  await page.waitForURL('http://localhost:5173/');
  console.log('  Successfully returned to Home / via Logo click');

  // Capture Desktop Screenshot
  await page.screenshot({ path: 'screenshot_final_navbar_desktop.png', fullPage: false });
  console.log('  Saved desktop screenshot: screenshot_final_navbar_desktop.png');

  // 6. Test Mobile Viewport (375px)
  console.log('\nTesting Mobile Viewport & Drawer...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // Open mobile menu
  await page.locator('button[aria-label="Toggle Navigation Menu"]').click();
  await page.waitForTimeout(300);

  const drawerLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('.liquid-glass-drawer a'));
    return links.map(l => l.textContent?.trim());
  });
  console.log('  Mobile drawer items:', drawerLinks);

  await page.screenshot({ path: 'screenshot_final_navbar_mobile.png', fullPage: false });
  console.log('  Saved mobile screenshot: screenshot_final_navbar_mobile.png');

  await browser.close();
  console.log('\n✅ ALL FINAL NAVBAR REDESIGN TESTS PASSED WITH 100% SUCCESS!');
}

testFinalNavbarRedesign().catch((err) => {
  console.error('❌ Final navbar test failed:', err);
  process.exit(1);
});
