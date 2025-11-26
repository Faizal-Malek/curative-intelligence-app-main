const { chromium } = require('playwright');

const pages = [
  '/', '/sign-in', '/sign-up',
  '/dashboard', '/calendar', '/vault',
  '/analytics', '/settings', '/onboarding',
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  for (const path of pages) {
    const url = `http://localhost:3000${path}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // let layout settle
    const safe = path === '/' ? 'home' : path.replace(/\//g, '_');
    await page.pdf({
      path: `pdf_${safe}.pdf`,
      format: 'A4',
      printBackground: true,
    });
  }

  await browser.close();
})();
