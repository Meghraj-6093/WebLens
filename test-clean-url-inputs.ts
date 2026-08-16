import { chromium } from 'playwright';

async function testCleanUrlInputs() {
  console.log('--- Starting WebLens Clean URL Inputs & Zero Pre-filled Values Verification ---');
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Check Homepage Scanner URL
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const homeInputVal = await page.locator('input[placeholder*="Enter URL"]').inputValue();
  console.log(`[Home Scanner] Input value: "${homeInputVal}" (Expected: "")`);
  if (homeInputVal !== '') throw new Error(`Home scanner is not empty: ${homeInputVal}`);
  await page.screenshot({ path: 'screenshot_clean_home.png', fullPage: false });

  // 2. Check Competitor Benchmark URLs
  await page.goto('http://localhost:5173/competitors', { waitUntil: 'networkidle' });
  const compInputs = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(i => (i as HTMLInputElement).value));
  console.log(`[Competitor Benchmark] Input values:`, compInputs);
  for (const val of compInputs) {
    if (val !== '') throw new Error(`Competitor input is not empty: ${val}`);
  }
  await page.screenshot({ path: 'screenshot_clean_competitors.png', fullPage: false });

  // 3. Check Dashboard Quick Scan URL
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
  const dashInputVal = await page.locator('input[placeholder*="quick audit"]').inputValue();
  console.log(`[Dashboard] Quick scan input value: "${dashInputVal}" (Expected: "")`);
  if (dashInputVal !== '') throw new Error(`Dashboard quick scan input is not empty: ${dashInputVal}`);
  await page.screenshot({ path: 'screenshot_clean_dashboard.png', fullPage: false });

  // 4. Check Monitoring Add Site URL
  await page.goto('http://localhost:5173/monitoring', { waitUntil: 'networkidle' });
  await page.locator('button:has-text("Add Website")').click();
  await page.waitForTimeout(200);
  const monitorInputVal = await page.locator('input[placeholder*="Enter website URL"]').inputValue();
  console.log(`[Monitoring] Add site input value: "${monitorInputVal}" (Expected: "")`);
  if (monitorInputVal !== '') throw new Error(`Monitoring input is not empty: ${monitorInputVal}`);
  await page.screenshot({ path: 'screenshot_clean_monitoring.png', fullPage: false });

  // 5. Check Projects Add Workspace Domain
  await page.goto('http://localhost:5173/projects', { waitUntil: 'networkidle' });
  await page.locator('button:has-text("Workspace")').first().click();
  await page.waitForTimeout(200);
  const projectDomainVal = await page.locator('input[placeholder*="yourwebsite.com"]').inputValue();
  console.log(`[Projects] Target domain input value: "${projectDomainVal}" (Expected: "")`);
  if (projectDomainVal !== '') throw new Error(`Project domain input is not empty: ${projectDomainVal}`);
  await page.screenshot({ path: 'screenshot_clean_projects.png', fullPage: false });

  await browser.close();
  console.log('\n✅ ALL URL INPUTS VERIFIED 100% CLEAN AND EMPTY ACROSS ALL ROUTES!');
}

testCleanUrlInputs().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
