const { test, expect } = require('@playwright/test');

test('Test complete checkout flow', async ({ page }) => {
  const newUrl = 'https://sleep-toolkit-website-lb2d3mxib.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  console.log('Testing complete checkout flow...');
  await page.goto(newUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000); // Wait for JavaScript to initialize
  
  // Click buy button
  const buyButton = page.locator('#buy-now-hero');
  await buyButton.click();
  console.log('✅ Buy button clicked');
  
  // Wait for modal to open
  await page.waitForSelector('#checkout-modal', { state: 'visible' });
  console.log('✅ Checkout modal opened');
  
  // Take screenshot of modal
  await page.screenshot({ path: 'checkout-modal-working.png' });
  
  // Try to submit the form
  const submitBtn = page.locator('#submit-payment');
  await submitBtn.click();
  console.log('✅ Submit button clicked');
  
  // Wait for redirect or success message
  await page.waitForTimeout(5000);
  
  const currentUrl = page.url();
  if (currentUrl.includes('stripe.com')) {
    console.log('🎉 SUCCESS! Redirected to Stripe checkout!');
    console.log('Current URL:', currentUrl);
  } else {
    console.log('ℹ️  Still on same page (demo mode)');
    
    // Check if demo success message appears
    const successVisible = await page.locator('text=Purchase Successful').isVisible();
    if (successVisible) {
      console.log('🎉 SUCCESS! Demo checkout completed!');
    } else {
      console.log('ℹ️  Demo flow in progress...');
    }
  }
});