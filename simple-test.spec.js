const { test, expect } = require('@playwright/test');

test.describe('Sleep Toolkit Website', () => {
  test('should load homepage and open checkout modal', async ({ page }) => {
    // Navigate to the website
    await page.goto('http://localhost:8000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'test-results/homepage-loaded.png', fullPage: true });
    
    // Verify homepage elements
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('#countdown')).toBeVisible();
    
    console.log('✅ Homepage loaded successfully');
    
    // Find and click the buy button
    const buyButton = page.locator('#buy-now-hero');
    await expect(buyButton).toBeVisible();
    await buyButton.click();
    
    // Wait for checkout modal to appear
    await page.waitForSelector('#checkout-modal', { state: 'visible' });
    
    // Take screenshot of checkout modal
    await page.screenshot({ path: 'test-results/checkout-modal-open.png', fullPage: true });
    
    // Verify checkout modal is visible
    await expect(page.locator('#checkout-modal')).toBeVisible();
    await expect(page.locator('.checkout-container')).toBeVisible();
    
    console.log('✅ Checkout modal opened successfully');
    
    // Check for Stripe integration elements
    const stripeForm = page.locator('#payment-form');
    await expect(stripeForm).toBeVisible();
    
    console.log('✅ Stripe payment form is present');
    
    // Check for submit button
    const submitBtn = page.locator('#submit-payment');
    await expect(submitBtn).toBeVisible();
    
    console.log('✅ Submit button is ready');
    
    // Try clicking submit to see if it redirects to Stripe
    await submitBtn.click();
    
    // Wait to see what happens
    await page.waitForTimeout(5000);
    
    // Take screenshot after submit
    await page.screenshot({ path: 'test-results/after-submit-click.png', fullPage: true });
    
    const currentUrl = page.url();
    console.log('Current URL after submit:', currentUrl);
    
    if (currentUrl.includes('stripe.com')) {
      console.log('✅ Successfully redirected to Stripe!');
      
      // If we're at Stripe, try to fill the test card
      try {
        await page.waitForSelector('[data-testid="card-number-input"]', { timeout: 10000 });
        await page.fill('[data-testid="card-number-input"]', '4242424242424242');
        await page.fill('[data-testid="expiry-input"]', '12/34');
        await page.fill('[data-testid="cvc-input"]', '123');
        
        console.log('✅ Filled in test card details');
        
        // Take screenshot of filled form
        await page.screenshot({ path: 'test-results/stripe-filled.png', fullPage: true });
        
        // Click pay button
        await page.click('[data-testid="submit"]');
        
        // Wait for redirect to success page
        await page.waitForTimeout(10000);
        
        const finalUrl = page.url();
        console.log('Final URL:', finalUrl);
        
        if (finalUrl.includes('thank-you')) {
          console.log('✅ Payment completed successfully!');
          await page.screenshot({ path: 'test-results/success-page.png', fullPage: true });
        }
        
      } catch (stripeError) {
        console.log('Stripe interaction error:', stripeError.message);
        await page.screenshot({ path: 'test-results/stripe-error.png', fullPage: true });
      }
    } else {
      console.log('ℹ️ Not redirected to Stripe - may be demo mode or local testing');
    }
    
    console.log('✅ Checkout flow test completed');
  });
  
  test('should validate all homepage elements', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    
    // Test core elements
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('#countdown')).toBeVisible();
    await expect(page.locator('.card-logos')).toBeVisible();
    
    // Test navigation and pricing (be more specific)
    await expect(page.locator('.price-value').first()).toBeVisible();
    
    // Check that buy buttons exist
    const buyButtons = page.locator('[id^="buy-now"]');
    await expect(buyButtons.first()).toBeVisible();
    
    console.log('✅ All homepage elements validated');
  });
});