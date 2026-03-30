const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } });

  const checks = [
    { url: 'http://localhost:3003/de/kontakt', label: 'DE' },
    { url: 'http://localhost:3003/en/contact', label: 'EN' }
  ];

  for (const c of checks) {
    await page.goto(c.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(900);
    const data = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.textContent?.trim() || '';
      const formHeading = document.querySelector('section h2')?.textContent?.trim() || '';
      const submit = document.querySelector('form button[type="submit"]')?.textContent?.trim() || '';
      const placeholders = Array.from(document.querySelectorAll('input, textarea, select'))
        .map(el => el.getAttribute('placeholder') || '')
        .filter(Boolean)
        .slice(0, 4);
      return { h1, formHeading, submit, placeholders };
    });

    console.log(`\n=== ${c.label} ${c.url} ===`);
    console.log(`h1: ${data.h1}`);
    console.log(`formHeading: ${data.formHeading}`);
    console.log(`submit: ${data.submit}`);
    console.log(`placeholders: ${data.placeholders.join(' | ')}`);
  }

  await browser.close();
})();
