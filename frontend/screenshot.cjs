const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', err => console.log('ERROR:', err.stack));
  
  await page.goto('http://localhost', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
