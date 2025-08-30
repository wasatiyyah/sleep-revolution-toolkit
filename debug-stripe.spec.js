const { test, expect } = require('@playwright/test');

test('Debug Stripe initialization', async ({ page }) => {
  const newUrl = 'https://sleep-toolkit-website-pmkpudvf1.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  // Enable console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.type(), msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  console.log('Debugging Stripe initialization...');
  await page.goto(newUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Check Stripe configuration
  const stripeCheck = await page.evaluate(() => {
    return {
      stripeLoaded: typeof Stripe !== 'undefined',
      publicKey: window.STRIPE_PUBLIC_KEY || 'not found',
      priceId: window.STRIPE_PRICE_ID || 'not found',
      stripeInstance: !!window.stripe,
      constants: {
        STRIPE_PUBLIC_KEY: typeof STRIPE_PUBLIC_KEY !== 'undefined' ? STRIPE_PUBLIC_KEY : 'not defined',
        STRIPE_PRICE_ID: typeof STRIPE_PRICE_ID !== 'undefined' ? STRIPE_PRICE_ID : 'not defined',
        STRIPE_PRODUCT_ID: typeof STRIPE_PRODUCT_ID !== 'undefined' ? STRIPE_PRODUCT_ID : 'not defined'
      }
    };
  });
  
  console.log('Stripe configuration:', JSON.stringify(stripeCheck, null, 2));
  
  // Try clicking buy button and see what happens
  const buyButton = page.locator('#buy-now-hero');
  await buyButton.click();
  await page.waitForSelector('#checkout-modal', { state: 'visible' });
  
  // Check what happens when we try to submit
  const submitBtn = page.locator('#submit-payment');
  console.log('Clicking submit button...');
  await submitBtn.click();
  
  // Wait and check for any changes or errors
  await page.waitForTimeout(5000);
  
  const errorMessage = await page.locator('#card-errors').textContent();
  console.log('Error message from form:', errorMessage || 'no error message');
  
  const modalStillVisible = await page.locator('#checkout-modal').isVisible();
  console.log('Modal still visible after submit:', modalStillVisible);
});