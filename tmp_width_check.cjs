const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const checks = [
    {label:'about', url:'http://localhost:3003/de/ueber-mich'},
    {label:'contact', url:'http://localhost:3003/de/kontakt'}
  ];
  for (const c of checks) {
    await page.goto(c.url, {waitUntil:'networkidle', timeout:45000});
    await page.waitForTimeout(700);
    const data = await page.evaluate(() => {
      const article = document.querySelector('article.max-w-6xl');
      const max6 = Array.from(document.querySelectorAll('.max-w-6xl'));
      const widths = max6.slice(0,5).map(el => Math.round(el.getBoundingClientRect().width));
      const h1 = document.querySelector('h1');
      const h1w = h1 ? Math.round(h1.getBoundingClientRect().width) : null;
      return { articleWidth: article ? Math.round(article.getBoundingClientRect().width) : null, sampleMax6Widths: widths, h1w };
    });
    console.log('\n'+c.label+': '+JSON.stringify(data));
  }
  await browser.close();
})();
