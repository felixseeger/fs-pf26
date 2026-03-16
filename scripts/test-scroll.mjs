#!/usr/bin/env node
/**
 * Debug script: test homepage scroll in browser.
 * Run: node scripts/test-scroll.mjs
 * Requires: npx playwright install chromium (first time)
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:3003';
const LOCALE = 'de';
// Use /en if /de returns 500 (e.g. WP API down)
const TEST_PATH = process.env.TEST_PATH || `/${LOCALE}`;

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console and errors
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('error') || text.includes('Error')) {
      console.log('[CONSOLE]', text);
    }
  });
  page.on('pageerror', (err) => console.error('[PAGE ERROR]', err.message));
  page.on('requestfailed', (req) => console.error('[REQUEST FAILED]', req.url(), req.failure()?.errorText));

  console.log('Navigating to', `${BASE}${TEST_PATH}`);
  const res = await page.goto(`${BASE}${TEST_PATH}`, { waitUntil: 'load', timeout: 60000 });
  console.log('Response status:', res?.status(), 'URL:', page.url());

  // Wait for preloader (first visit ~7s) or content
  await page.waitForSelector('#about, #hero, [role="region"]', { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(4000);

  // Check scroll-related styles and layout
  const bodyOverflow = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    const main = document.getElementById('main-content');
    return {
      bodyOverflow: getComputedStyle(body).overflow,
      bodyHeight: getComputedStyle(body).height,
      bodyMinHeight: getComputedStyle(body).minHeight,
      htmlOverflow: getComputedStyle(html).overflow,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      scrollY: window.scrollY,
      bodyClasses: body.className,
      htmlClasses: html.className,
      mainHeight: main ? getComputedStyle(main).height : null,
      mainOverflow: main ? getComputedStyle(main).overflow : null,
      mainScrollHeight: main ? main.scrollHeight : null,
    };
  });
  console.log('Scroll state:', JSON.stringify(bodyOverflow, null, 2));
  console.log('Page title:', await page.title());
  const hasMain = await page.locator('#main-content').count() > 0;
  console.log('Has #main-content:', hasMain);

  // Try to scroll
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  const afterScroll = await page.evaluate(() => ({
    scrollY: window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
  }));
  console.log('After scroll to 500:', afterScroll);

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  const atBottom = await page.evaluate(() => ({
    scrollY: window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
    canScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
  }));
  console.log('At bottom:', atBottom);

  // Take screenshot
  await page.screenshot({ path: 'scripts/scroll-debug.png', fullPage: true });
  console.log('Screenshot saved to scripts/scroll-debug.png');

  // Test: navigate from subpage to homepage, then verify scroll works
  console.log('\n--- Testing nav from subpage to homepage ---');
  await page.goto(`${BASE}/${LOCALE}/about`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.goto(`${BASE}${TEST_PATH}`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(2000); // Allow preloader-complete + ScrollTrigger refresh
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);
  const navScroll = await page.evaluate(() => ({
    scrollY: window.scrollY,
    scrollHeight: document.documentElement.scrollHeight,
    canScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
  }));
  console.log('After subpage→home nav + scroll:', navScroll);
  if (navScroll.scrollY > 0 && navScroll.canScroll) {
    console.log('✓ Scroll works after navigating from subpage');
  } else {
    console.log('✗ Scroll may be blocked after subpage nav');
  }

  await page.waitForTimeout(2000);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
