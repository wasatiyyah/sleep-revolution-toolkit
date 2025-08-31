const { test, expect } = require('@playwright/test');

test('Test live production payment flow', async ({ page }) => {
  console.log('🧪 Testing LIVE production payment flow...');
  
  // Test the production domain
  await page.goto('https://sleeprevolutiontoolkit.com');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  console.log('🌐 Production website loaded');
  
  // Check if the main CTA button exists
  const mainCta = page.locator('.hero-cta, .cta-button, [class*="cta"]').first();
  const ctaVisible = await mainCta.isVisible();
  console.log(`🔘 Main CTA button visible: ${ctaVisible}`);
  
  if (ctaVisible) {
    console.log('🖱️  Clicking main CTA to test payment flow...');
    
    // Click the CTA button
    await mainCta.click();
    
    // Wait for redirect to Stripe payment page
    await page.waitForTimeout(5000);
    
    // Check if we're on Stripe checkout page
    const currentUrl = page.url();
    console.log(`🌐 Current URL after click: ${currentUrl}`);
    
    if (currentUrl.includes('buy.stripe.com')) {
      console.log('✅ Successfully redirected to Stripe payment page!');
      
      // Check if the page loaded properly
      const stripeElement = page.locator('[data-testid="checkout-root"], .App, body').first();
      const stripeLoaded = await stripeElement.isVisible();
      console.log(`💳 Stripe checkout page loaded: ${stripeLoaded}`);
      
      // Take screenshot of Stripe page
      await page.screenshot({ 
        path: 'live-stripe-checkout.png', 
        fullPage: true 
      });
      console.log('📸 Screenshot saved: live-stripe-checkout.png');
      
    } else {
      console.log('❌ Did not redirect to Stripe - check payment link configuration');
    }
  }
  
  console.log('🎉 Live production test completed!');
});

test('Verify production domain and SSL', async ({ page }) => {
  console.log('🔐 Testing production domain and SSL...');
  
  await page.goto('https://sleeprevolutiontoolkit.com');
  await page.waitForLoadState('domcontentloaded');
  
  // Check SSL certificate
  const response = await page.request.get('https://sleeprevolutiontoolkit.com');
  console.log(`🔒 SSL Response Status: ${response.status()}`);
  
  // Check if main elements are present
  const title = await page.title();
  console.log(`📄 Page title: "${title}"`);
  
  const elements = [
    { selector: 'h1', name: 'Main Heading' },
    { selector: '.hero', name: 'Hero Section' },
    { selector: '[class*="cta"]', name: 'CTA Buttons' }
  ];
  
  for (const element of elements) {
    const visible = await page.locator(element.selector).first().isVisible();
    console.log(`${visible ? '✅' : '❌'} ${element.name}: ${visible ? 'Present' : 'Missing'}`);
  }
  
  console.log('🎉 Production domain verification completed!');
});