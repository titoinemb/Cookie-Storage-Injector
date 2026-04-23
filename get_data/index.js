const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: '/usr/bin/brave-browser'
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('', {
    waitUntil: 'load',
    timeout: 60000
  });

  console.log('⏳ Attente de 3 minutes...');
  await page.waitForTimeout(180000);

  await context.storageState({ path: 'data.json' });

  console.log('✅ Session sauvegardée');

  await browser.close();
})();