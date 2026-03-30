const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
  const checks = [
    { url: 'http://localhost:3003/de/ueber-mich', label: 'DE' },
    { url: 'http://localhost:3003/en/about', label: 'EN' }
  ];
  for (const c of checks) {
    await page.goto(c.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(700);
    const data = await page.evaluate(() => ({
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.trim() || ''
    }));
    console.log(`\n=== ${c.label} ${c.url} ===`);
    console.log(`title: ${data.title}`);
    console.log(`h1: ${data.h1}`);
  }
  await browser.close();
})();
