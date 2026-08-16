import { chromium } from 'playwright';

async function testNavbarScrollUnderneath() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  // Scroll down so the "See what's wrong with your website" headline passes directly behind the floating navbar!
  await page.evaluate(() => window.scrollTo(0, 160));
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'screenshot_navbar_scrolled_content_underneath.png', fullPage: false });
  console.log('Saved screenshot of content passing underneath floating glass navbar: screenshot_navbar_scrolled_content_underneath.png');

  await browser.close();
}

testNavbarScrollUnderneath().catch(console.error);
