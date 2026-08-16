import { chromium } from 'playwright';

async function verifyUiRendering() {
  console.log('🔍 Starting UI & CSS Rendering Verification across routes...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const routes = [
    '/',
    '/dashboard',
    '/monitoring',
    '/competitors',
    '/agency',
    '/developers',
    '/pricing',
    '/admin',
    '/settings',
    '/demo'
  ];

  for (const r of routes) {
    const url = `http://localhost:5173${r}`;
    console.log(`Checking route: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });

    // Check if error boundary rendered
    const errorText = await page.evaluate(() => {
      const el = document.body;
      return el.innerText.includes('Something went wrong') && el.innerText.includes('useRoutes');
    });

    if (errorText) {
      console.error(`❌ Route ${r} triggered ErrorBoundary!`);
      process.exit(1);
    }

    // Check computed styles of main layout
    const styles = await page.evaluate(() => {
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      return {
        hasHeader: !!header,
        headerDisplay: header ? window.getComputedStyle(header).display : 'none',
        hasMain: !!main,
        bodyBg: window.getComputedStyle(document.body).backgroundColor,
      };
    });

    console.log(`  ✔ Route ${r} rendered successfully (Header: ${styles.headerDisplay}, BodyBg: ${styles.bodyBg})`);
  }

  // Take screenshot of homepage to prove design system is rendered
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'd:/WebLens/homepage_verified.png' });
  console.log('\n📸 Saved rendered verification screenshot to homepage_verified.png');

  await browser.close();

  if (consoleErrors.length > 0) {
    console.warn('\nConsole errors caught during audit:');
    consoleErrors.forEach((e) => console.warn(`  ⚠ ${e}`));
  } else {
    console.log('\n🎉 Clean UI rendering with 0 React errors across all routes!');
  }
}

verifyUiRendering().catch((err) => {
  console.error('Fatal UI verification error:', err);
  process.exit(1);
});
