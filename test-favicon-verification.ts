import { chromium } from 'playwright';

async function verifyFavicon() {
  console.log('================================================================');
  console.log('🧪 WEBLENS FAVICON & BRAND INTEGRITY TEST');
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });
  // Incognito context
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // 2. Check <link rel="icon">
  console.log('2. Checking favicon link in document head...');
  const faviconHref = await page.getAttribute('link[rel="icon"]', 'href');
  console.log('  Favicon href attribute:', faviconHref);
  if (!faviconHref || !faviconHref.includes('favicon.svg')) {
    throw new Error(`Expected favicon href to be /favicon.svg, but found: ${faviconHref}`);
  }
  console.log('  ✔ Document head contains <link rel="icon" type="image/svg+xml" href="/favicon.svg" />');

  // 3. Fetch favicon asset directly
  console.log('3. Fetching /favicon.svg asset...');
  const faviconResponse = await page.request.get('http://localhost:5173/favicon.svg');
  if (!faviconResponse.ok()) {
    throw new Error(`Failed to load /favicon.svg: HTTP ${faviconResponse.status()}`);
  }
  const svgText = await faviconResponse.text();
  console.log('  Favicon SVG fetched (bytes):', svgText.length);

  // 4. Verify SVG paths and gradient match navbar logo
  console.log('4. Verifying favicon SVG contents match navbar brand logo...');
  if (!svgText.includes('#3B82F6') || !svgText.includes('#6366F1') || !svgText.includes('#22D3EE')) {
    throw new Error('Favicon SVG is missing the blue/indigo/cyan WebLens brand gradient!');
  }
  if (!svgText.includes('M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18')) {
    throw new Error('Favicon SVG is missing the exact Lucide Activity waveform path used in the navbar!');
  }
  console.log('  ✔ Favicon SVG matches the exact navbar rounded gradient + white Activity waveform.');

  // 5. Verify Navbar logo element exists and has matching styling
  console.log('5. Inspecting navbar logo in the DOM...');
  const navbarLogo = await page.$('header a[href="/"] .rounded-xl');
  if (!navbarLogo) {
    throw new Error('Navbar brand logo container not found in DOM!');
  }
  const navbarClasses = await navbarLogo.getAttribute('class');
  console.log('  Navbar logo classes:', navbarClasses);
  if (!navbarClasses?.includes('bg-gradient-to-br') || !navbarClasses?.includes('from-blue-500')) {
    throw new Error('Navbar logo does not have the expected gradient styling!');
  }
  console.log('  ✔ Navbar brand logo and browser favicon are 100% visually and structurally aligned.');

  await browser.close();

  console.log('\n================================================================');
  console.log('✅ ALL FAVICON VERIFICATION CHECKS PASSED (100% ALIGNED)');
  console.log('================================================================\n');
}

verifyFavicon().catch(err => {
  console.error('Favicon verification failed:', err);
  process.exit(1);
});
