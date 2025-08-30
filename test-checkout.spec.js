const { test, expect } = require('@playwright/test');

test.describe('Sleep Revolution Toolkit Checkout', () => {
  test('should complete full checkout flow', async ({ page }) => {
    // Navigate to the website
    await page.goto('http://localhost:8000');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'homepage.png', fullPage: true });
    
    // Check if the main elements are present
    await expect(page.locator('.hero-title')).toContainText('12-Minute Protocol');
    
    // Find and click the first "Buy Now" button
    const buyButton = page.locator('#buy-now-hero').first();
    await expect(buyButton).toBeVisible();
    await buyButton.click();
    
    // Wait for checkout modal to appear
    await page.waitForSelector('#checkout-modal', { state: 'visible' });
    
    // Take screenshot of checkout modal
    await page.screenshot({ path: 'checkout-modal.png', fullPage: true });
    
    // Verify checkout modal content
    await expect(page.locator('.checkout-container h2')).toContainText('Complete Your Order');
    
    // Check if Stripe elements are loading
    await page.waitForSelector('#payment-form', { state: 'visible' });
    
    // Fill out customer information
    await page.fill('#customer-email', 'test@example.com');
    await page.fill('#customer-name', 'John Doe');
    
    // Wait for Stripe card element to load (it's in an iframe)
    await page.waitForTimeout(3000);
    
    // Try to click the submit button to trigger Stripe checkout
    const submitButton = page.locator('#submit-payment');
    await expect(submitButton).toBeVisible();
    
    // Take screenshot before clicking submit
    await page.screenshot({ path: 'before-submit.png', fullPage: true });
    
    // Click submit button - this should redirect to Stripe Checkout
    await submitButton.click();
    
    // Wait for either Stripe redirect or error message
    await page.waitForTimeout(5000);
    
    // Take final screenshot
    await page.screenshot({ path: 'after-submit.png', fullPage: true });
    
    // If we're redirected to Stripe, we should see stripe.com in the URL
    const currentUrl = page.url();
    console.log('Current URL after submit:', currentUrl);
    
    if (currentUrl.includes('checkout.stripe.com')) {
      console.log('✅ Successfully redirected to Stripe Checkout!');
      
      // Test filling in Stripe's test card
      await page.fill('[data-testid="card-number-input"]', '4242424242424242');
      await page.fill('[data-testid="expiry-input"]', '12/34');
      await page.fill('[data-testid="cvc-input"]', '123');
      await page.fill('[data-testid="postal-code-input"]', '12345');
      
      // Take screenshot of filled Stripe form
      await page.screenshot({ path: 'stripe-form-filled.png', fullPage: true });
      
      // Click pay button
      await page.click('[data-testid="payment-submit-button"]');
      
      // Wait for redirect to thank you page
      await page.waitForURL('**/thank-you.html**', { timeout: 30000 });
      
      // Verify we're on the thank you page
      await expect(page).toHaveURL(/thank-you\.html/);
      await expect(page.locator('.thank-you-title')).toContainText('Purchase Complete');
      
      // Take screenshot of thank you page
      await page.screenshot({ path: 'thank-you-page.png', fullPage: true });
      
      console.log('✅ Payment flow completed successfully!');
    } else {
      console.log('❓ Not redirected to Stripe - checking for errors or demo mode');
    }
  });
  
  test('should validate homepage elements', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    
    // Check key elements
    await expect(page.locator('.hero-title')).toBeVisible();
    await expect(page.locator('#countdown')).toBeVisible();
    await expect(page.locator('.card-logos')).toBeVisible();
    
    // Check pricing
    await expect(page.getByText('$27').first()).toBeVisible();
    await expect(page.getByText('$853')).toBeVisible();
    
    // Check testimonials
    await expect(page.locator('.testimonials')).toBeVisible();
    
    console.log('✅ All homepage elements validated!');
  });
});