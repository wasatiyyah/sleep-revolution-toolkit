const { test, expect } = require('@playwright/test');

test('Test production site - sleeprevolutiontoolkit.com', async ({ page }) => {
  const productionUrl = 'https://sleeprevolutiontoolkit.com';
  
  console.log('🧪 Testing production website...');
  
  // Enable console and error logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Browser error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`❌ Page error: ${error.message}`);
  });
  
  // Test main page load
  console.log('🌐 Loading homepage...');
  await page.goto(productionUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Verify page title
  const title = await page.title();
  console.log(`📄 Page title: ${title}`);
  expect(title).toContain('Sleep Revolution Toolkit');
  
  // Check if main content is visible
  const heroVisible = await page.locator('.hero').isVisible();
  console.log(`🎯 Hero section visible: ${heroVisible}`);
  
  // Check if buy buttons exist and are visible
  const buyButton = page.locator('#buy-now-hero');
  const buyButtonVisible = await buyButton.isVisible();
  console.log(`🔘 Buy button visible: ${buyButtonVisible}`);
  
  if (buyButtonVisible) {
    console.log('🔘 Testing buy button click...');
    
    // Click buy button
    await buyButton.click();
    
    // Wait for redirect to Stripe
    console.log('⏳ Waiting for redirect to Stripe...');
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`🌐 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('buy.stripe.com')) {
      console.log('✅ SUCCESS: Redirected to Stripe Payment Link!');
      
      // Check if correct product info is displayed
      const pageContent = await page.textContent('body');
      if (pageContent.includes('Sleep Revolution Toolkit') && pageContent.includes('$27')) {
        console.log('✅ Correct product information displayed');
      }
      
      // Take screenshot of Stripe page
      await page.screenshot({ path: 'production-stripe-checkout.png' });
      console.log('📸 Screenshot saved: production-stripe-checkout.png');
      
    } else {
      console.log('❌ Did not redirect to Stripe');
    }
  }
  
  console.log('🎉 Production test completed!');
});

test('Test thank you page accessibility', async ({ page }) => {
  const thankYouUrl = 'https://sleeprevolutiontoolkit.com/thank-you.html';
  
  console.log('🧪 Testing thank you page...');
  
  try {
    await page.goto(thankYouUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    console.log(`📄 Thank you page title: ${title}`);
    
    // Check if thank you content is visible
    const thankYouVisible = await page.locator('text=Thank').isVisible();
    console.log(`✅ Thank you page loaded: ${thankYouVisible}`);
    
    // Take screenshot
    await page.screenshot({ path: 'production-thank-you-page.png' });
    console.log('📸 Screenshot saved: production-thank-you-page.png');
    
  } catch (error) {
    console.log(`❌ Thank you page error: ${error.message}`);
  }
});

test('Test website performance', async ({ page }) => {
  console.log('⚡ Testing website performance...');
  
  const startTime = Date.now();
  
  await page.goto('https://sleeprevolutiontoolkit.com');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  console.log(`⏱️  Page load time: ${loadTime}ms`);
  
  if (loadTime < 3000) {
    console.log('✅ Good load time (< 3 seconds)');
  } else {
    console.log('⚠️  Slow load time (> 3 seconds)');
  }
  
  // Check if critical elements are visible
  const criticalElements = [
    '.hero',
    '#buy-now-hero',
    '.cta-button'
  ];
  
  for (const selector of criticalElements) {
    const visible = await page.locator(selector).isVisible();
    console.log(`${visible ? '✅' : '❌'} ${selector} visible: ${visible}`);
  }
});