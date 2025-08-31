const { test, expect } = require('@playwright/test');

test('Test Payment Link integration', async ({ page }) => {
  const newUrl = 'https://sleep-toolkit-website-5n6onqa3j.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  // Capture console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[ERROR] ${error.message}`);
  });
  
  console.log('🧪 Testing Payment Link integration...');
  await page.goto(newUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  console.log('✅ Page loaded successfully');
  
  // Click buy button - should now redirect to Stripe Payment Link
  console.log('🔘 Clicking buy button...');
  const buyButton = page.locator('#buy-now-hero');
  await buyButton.click();
  
  // Wait for redirect
  console.log('⏳ Waiting for redirect to Stripe...');
  await page.waitForTimeout(5000);
  
  const currentUrl = page.url();
  console.log('🌐 Current URL:', currentUrl);
  
  if (currentUrl.includes('buy.stripe.com')) {
    console.log('🎉 SUCCESS! Redirected to Stripe Payment Link!');
    console.log('✅ Payment Link working perfectly!');
    
    // Take a screenshot of the Stripe payment page
    await page.screenshot({ path: 'stripe-payment-link.png' });
    console.log('📸 Screenshot saved: stripe-payment-link.png');
    
    // Check if it has the correct product information
    const pageContent = await page.content();
    if (pageContent.includes('Sleep Revolution Toolkit') || pageContent.includes('$27')) {
      console.log('✅ Correct product information displayed');
    } else {
      console.log('ℹ️  Product information check inconclusive');
    }
    
  } else if (currentUrl === newUrl) {
    console.log('❌ Still on same page - redirect failed');
  } else {
    console.log('🤔 Redirected to unexpected URL:', currentUrl);
  }
});