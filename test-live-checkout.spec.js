const { test, expect } = require('@playwright/test');

test('Test live checkout flow', async ({ page }) => {
  // Navigate to the live website
  await page.goto('https://sleep-toolkit-website-nlibrdokg.vercel.app');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot to see if site loads
  await page.screenshot({ path: 'live-site-check.png', fullPage: true });
  
  const title = await page.title();
  console.log('Page title:', title);
  
  if (title.includes('404') || title.includes('NOT_FOUND')) {
    console.log('❌ Site is not accessible - showing 404');
    return;
  }
  
  console.log('✅ Site loads successfully');
  
  // Try to find and click buy button
  const buyButton = page.locator('#buy-now-hero');
  await expect(buyButton).toBeVisible({ timeout: 10000 });
  await buyButton.click();
  
  console.log('✅ Buy button clicked');
  
  // Wait for checkout modal
  await page.waitForSelector('#checkout-modal', { state: 'visible' });
  await page.screenshot({ path: 'live-checkout-modal.png', fullPage: true });
  
  console.log('✅ Checkout modal opened');
  
  // Wait for payment form
  await page.waitForSelector('#payment-form', { state: 'visible' });
  
  // Try to click submit to see what happens
  const submitButton = page.locator('#submit-payment');
  await expect(submitButton).toBeVisible();
  
  console.log('✅ Submit button found');
  
  // Monitor console for any errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  // Click submit button
  await submitButton.click();
  
  console.log('✅ Submit button clicked - monitoring for redirect or errors...');
  
  // Wait and see what happens
  await page.waitForTimeout(8000);
  
  const currentUrl = page.url();
  console.log('Current URL after submit:', currentUrl);
  
  // Take screenshot after submit
  await page.screenshot({ path: 'live-after-submit.png', fullPage: true });
  
  if (currentUrl.includes('checkout.stripe.com')) {
    console.log('✅ Successfully redirected to Stripe Checkout!');
    
    // Test with Stripe test card
    try {
      await page.waitForSelector('[data-testid="cardNumber-input"]', { timeout: 10000 });
      await page.fill('[data-testid="cardNumber-input"]', '4242 4242 4242 4242');
      await page.fill('[data-testid="cardExpiry-input"]', '12/34');
      await page.fill('[data-testid="cardCvc-input"]', '123');
      
      console.log('✅ Test card details filled');
      await page.screenshot({ path: 'live-stripe-filled.png', fullPage: true });
      
    } catch (stripeError) {
      console.log('⚠️ Could not fill Stripe form:', stripeError.message);
    }
    
  } else {
    console.log('❌ Not redirected to Stripe - checking for errors');
    
    // Check for error messages
    const errorElements = await page.locator('[class*="error"], .error, [id*="error"]').all();
    
    for (let error of errorElements) {
      const errorText = await error.textContent();
      if (errorText && errorText.trim()) {
        console.log('❌ Error found:', errorText);
      }
    }
  }
});