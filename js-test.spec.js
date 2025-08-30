const { test, expect } = require('@playwright/test');

test('Test JavaScript execution', async ({ page }) => {
  const finalUrl = 'https://sleep-toolkit-website-40tfr4xwe.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  // Enable console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.type(), msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  await page.goto(finalUrl);
  await page.waitForLoadState('networkidle');
  
  // Check if basic JavaScript is working
  const jsTest = await page.evaluate(() => {
    console.log('JavaScript evaluation test');
    return {
      domReady: document.readyState,
      hasStripe: typeof Stripe !== 'undefined',
      hasCountdown: typeof startCountdown === 'function',
      hasSetupBuyButtons: typeof setupBuyButtons === 'function',
      scriptTags: Array.from(document.querySelectorAll('script')).map(s => ({
        src: s.src || 'inline',
        hasContent: s.innerHTML.length > 0
      }))
    };
  });
  
  console.log('JS Test Result:', JSON.stringify(jsTest, null, 2));
  
  // Try to manually trigger the setup
  const manualSetup = await page.evaluate(() => {
    try {
      if (typeof setupBuyButtons === 'function') {
        setupBuyButtons();
        return 'Setup completed';
      } else {
        return 'setupBuyButtons not found';
      }
    } catch (error) {
      return 'Error: ' + error.message;
    }
  });
  
  console.log('Manual setup result:', manualSetup);
});