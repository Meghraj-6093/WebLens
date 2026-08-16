import { chromium } from 'playwright';

async function verifyFloatingNavbar() {
  console.log('================================================================');
  console.log('🧪 WEBLENS FLOATING NAVBAR RESPONSIVE E2E TEST');
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'Full HD Desktop', width: 1920, height: 1080 },
    { name: 'Standard Desktop', width: 1440, height: 900 },
    { name: 'Compact Laptop', width: 1280, height: 800 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Mobile Large (iPhone 14)', width: 390, height: 844 },
    { name: 'Mobile Standard', width: 375, height: 667 },
    { name: 'Mobile Small', width: 320, height: 568 },
  ];

  for (const vp of viewports) {
    console.log(`--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // 1. Check Navbar Geometry
    const headerBox = await page.locator('header > div > div').first().boundingBox();
    if (!headerBox) {
      throw new Error(`Floating navbar pill not found at viewport ${vp.width}px!`);
    }

    console.log(`  Navbar Box: x=${headerBox.x}, y=${headerBox.y}, width=${headerBox.width}, height=${headerBox.height}`);

    // Verify top separation
    if (headerBox.y < 8) {
      throw new Error(`Navbar at ${vp.width}px touches the top edge of viewport (y=${headerBox.y})! Expected floating offset.`);
    }

    // Verify horizontal separation on desktop/tablet
    if (vp.width >= 768) {
      if (headerBox.x < 10 || headerBox.x + headerBox.width > vp.width - 10) {
        throw new Error(`Navbar at ${vp.width}px touches side edges! Expected floating padding.`);
      }
    }

    // Verify no horizontal overflow
    const overflowElements = await page.evaluate(() => {
      const elements: string[] = [];
      document.querySelectorAll('main *').forEach((el) => {
        if (el.scrollWidth > window.innerWidth) {
          elements.push(`${el.tagName}.${el.className} (scrollWidth=${el.scrollWidth})`);
        }
      });
      return elements;
    });

    if (overflowElements.length > 0) {
      console.log(`  Overflow elements in main at ${vp.width}px:`, overflowElements);
    }

    const hasHorizontalScrollbar = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    if (hasHorizontalScrollbar) {
      throw new Error(`Horizontal overflow detected at ${vp.width}px!`);
    }
    console.log(`  ✔ No horizontal overflow detected at ${vp.width}px.`);

    // 2. Test Mobile Menu on small screens
    if (vp.width < 1024) {
      const menuBtn = page.locator('header button[aria-label="Toggle Navigation Menu"]');
      await menuBtn.click();
      await page.waitForTimeout(200);

      const mobileMenu = page.locator('header .animate-fade-in');
      const isVisible = await mobileMenu.isVisible();
      if (!isVisible) {
        throw new Error(`Mobile dropdown menu failed to open on ${vp.width}px viewport!`);
      }
      console.log(`  ✔ Mobile drawer opened cleanly on ${vp.width}px.`);

      // Click Dashboard in mobile menu
      await mobileMenu.locator('a:has-text("Dashboard")').click();
      await page.waitForTimeout(300);
      const url = page.url();
      if (!url.includes('/dashboard')) {
        throw new Error(`Mobile navigation failed to navigate to /dashboard (current: ${url})`);
      }
      console.log(`  ✔ Mobile navigation link clicked and routed to /dashboard.`);
    }

    await context.close();
  }

  // 3. Test Scroll & Sticky Behavior
  console.log('\n--- Testing Scroll & Sticky Elevation Behavior ---');
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

  // Check initial state
  const initialBox = await desktopPage.locator('header > div > div').first().boundingBox();
  console.log('  Initial navbar position:', initialBox);

  // Scroll down 400px
  await desktopPage.evaluate(() => window.scrollTo(0, 400));
  await desktopPage.waitForTimeout(200);

  const scrolledBox = await desktopPage.locator('header > div > div').first().boundingBox();
  console.log('  Scrolled navbar position:', scrolledBox);

  if (!scrolledBox || scrolledBox.y < 8) {
    throw new Error('Floating navbar lost its sticky top position during scroll!');
  }
  console.log('  ✔ Floating navbar remains elevated and sticky during page scroll.');

  await browser.close();

  console.log('\n================================================================');
  console.log('✅ ALL FLOATING NAVBAR TESTS PASSED (100% RESPONSIVE)');
  console.log('================================================================\n');
}

verifyFloatingNavbar().catch(err => {
  console.error('Floating navbar test failed:', err);
  process.exit(1);
});
