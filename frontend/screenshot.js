const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.toString()));
  
  await page.goto('http://localhost', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'screenshot.png' });
  
  const content = await page.content();
  console.log('HTML CONTENT:', content.substring(0, 500));
  
  await browser.close();
})();
