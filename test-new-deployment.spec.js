const { test, expect } = require('@playwright/test');

test('Test new deployment functionality', async ({ page }) => {
  // Try the new deployment with bypass
  const newUrl = 'https://sleep-toolkit-website-lb2d3mxib.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  // Enable console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.type(), msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  console.log('Testing new deployment...');
  await page.goto(newUrl);
  await page.waitForLoadState('networkidle');
  
  // Check if JavaScript functions exist now
  const jsCheck = await page.evaluate(() => {
    return {
      hasStartCountdown: typeof startCountdown === 'function',
      hasSetupBuyButtons: typeof setupBuyButtons === 'function',
      hasStripe: typeof Stripe !== 'undefined'
    };
  });
  
  console.log('JavaScript check:', jsCheck);
  
  // Test button functionality
  const buyButton = page.locator('#buy-now-hero');
  if (await buyButton.isVisible()) {
    console.log('✅ Buy button is visible');
    
    await buyButton.click();
    console.log('Button clicked');
    
    // Check if modal opens
    const modalVisible = await page.locator('#checkout-modal').isVisible({ timeout: 3000 });
    console.log('Modal visible:', modalVisible);
    
    if (modalVisible) {
      console.log('🎉 SUCCESS! Buttons are working and modal opens!');
      await page.screenshot({ path: 'working-modal.png' });
    } else {
      console.log('❌ Modal did not open');
    }
  } else {
    console.log('❌ Buy button not visible');
  }
});