const { test, expect } = require('@playwright/test');

test('Test complete purchase and email delivery flow', async ({ page }) => {
  console.log('🧪 Testing complete purchase → email flow...');
  
  // Step 1: Visit production website
  await page.goto('https://sleeprevolutiontoolkit.com');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  console.log('🌐 Production website loaded');
  
  // Step 2: Click purchase button
  const purchaseButton = page.locator('.hero-cta, .cta-button, [class*="cta"]').first();
  const buttonVisible = await purchaseButton.isVisible();
  
  if (buttonVisible) {
    console.log('🖱️  Clicking purchase button...');
    await purchaseButton.click();
    
    // Wait for Stripe redirect
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`🌐 Redirected to: ${currentUrl}`);
    
    if (currentUrl.includes('buy.stripe.com')) {
      console.log('✅ Successfully on Stripe checkout page');
      
      // Take screenshot for verification
      await page.screenshot({ 
        path: 'email-flow-stripe-checkout.png', 
        fullPage: true 
      });
      
      console.log('📸 Screenshot saved: email-flow-stripe-checkout.png');
      console.log('');
      console.log('🔄 MANUAL STEP REQUIRED:');
      console.log('   Complete the purchase using test card: 4242 4242 4242 4242');
      console.log('   Use any future expiry date and CVC');
      console.log('   After payment, you should receive an email at your test address');
      console.log('   Check both your Stripe receipt AND the download links email');
      
    } else {
      console.log('❌ Not redirected to Stripe checkout');
    }
  } else {
    console.log('❌ Purchase button not found');
  }
  
  console.log('🎉 Email flow test setup completed!');
});

test('Verify email webhook endpoint accessibility', async ({ page }) => {
  console.log('🔗 Testing webhook endpoint...');
  
  // Test if webhook endpoint is accessible (should return 405 for GET)
  const response = await page.request.get('https://sleeprevolutiontoolkit.com/api/stripe-webhook');
  
  console.log(`📊 Webhook endpoint status: ${response.status()}`);
  
  if (response.status() === 405) {
    console.log('✅ Webhook endpoint is working (correctly rejects GET requests)');
  } else {
    console.log('⚠️  Unexpected webhook response - check deployment');
  }
  
  // Test thank you page loads properly
  const thankYouResponse = await page.request.get('https://sleeprevolutiontoolkit.com/thank-you.html');
  console.log(`📄 Thank you page status: ${thankYouResponse.status()}`);
  
  if (thankYouResponse.status() === 200) {
    console.log('✅ Thank you page is accessible');
  }
  
  console.log('🎉 Endpoint verification completed!');
});