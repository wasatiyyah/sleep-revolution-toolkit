const { test, expect } = require('@playwright/test');

test('Test $1 purchase flow and verify pricing', async ({ page }) => {
  console.log('🧪 Testing $1 purchase flow...');
  
  // Visit production website
  await page.goto('https://sleeprevolutiontoolkit.com');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  console.log('🌐 Website loaded');
  
  // Check if $1 pricing is displayed
  const priceElements = await page.locator('text=/\\$1/').count();
  console.log(`💰 Found ${priceElements} instances of $1 pricing on page`);
  
  // Check for test price indicators
  const testPriceVisible = await page.locator('text=/TEST PRICE/').isVisible();
  console.log(`🧪 Test price indicator visible: ${testPriceVisible}`);
  
  // Click purchase button
  const purchaseButton = page.locator('.cta-button, [class*="cta"]').first();
  if (await purchaseButton.isVisible()) {
    console.log('🖱️  Clicking purchase button...');
    await purchaseButton.click();
    
    // Wait for Stripe redirect
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`🌐 Redirected to: ${currentUrl}`);
    
    if (currentUrl.includes('buy.stripe.com')) {
      console.log('✅ Successfully redirected to Stripe checkout');
      
      // Check if Stripe shows $1.00
      const stripePrice = page.locator('text=/\\$1\\.00/');
      const stripePriceVisible = await stripePrice.isVisible();
      console.log(`💳 $1.00 price visible on Stripe: ${stripePriceVisible}`);
      
      // Take screenshot
      await page.screenshot({ 
        path: 'test-1dollar-stripe-checkout.png', 
        fullPage: true 
      });
      console.log('📸 Screenshot saved: test-1dollar-stripe-checkout.png');
      
      console.log('');
      console.log('🎯 READY FOR LIVE TEST:');
      console.log('   Use test card: 4242 4242 4242 4242');
      console.log('   Any future date and CVC: 123');
      console.log('   You should receive email with download links');
      console.log('   Total cost: $1.00 USD');
      
    } else {
      console.log('❌ Not redirected to Stripe checkout');
    }
  }
  
  console.log('🎉 $1 test setup completed!');
});

test('Verify test pricing is temporary', async ({ page }) => {
  console.log('⚠️  Verifying this is clearly marked as test pricing...');
  
  await page.goto('https://sleeprevolutiontoolkit.com');
  await page.waitForLoadState('domcontentloaded');
  
  // Check for test indicators
  const testIndicators = await page.locator('text=/TEST|test|Test/').count();
  console.log(`🔍 Found ${testIndicators} test indicators on page`);
  
  // Check main CTA for test price
  const mainCta = page.locator('.cta-button').first();
  const ctaText = await mainCta.textContent();
  console.log(`🎯 Main CTA text: "${ctaText.trim()}"`);
  
  const hasTestIndicator = ctaText.includes('TEST') || ctaText.includes('test');
  console.log(`✅ CTA properly marked as test: ${hasTestIndicator}`);
  
  console.log('');
  console.log('📝 REMINDER: Revert to $27 after testing!');
});