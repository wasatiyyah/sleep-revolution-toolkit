const { test, expect } = require('@playwright/test');

test('Test Vercel deployment with bypass token', async ({ page }) => {
  // Navigate with bypass token
  const bypassUrl = 'https://sleep-toolkit-website-nlibrdokg.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  console.log('Testing URL with bypass token...');
  await page.goto(bypassUrl);
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  await page.screenshot({ path: 'vercel-bypass-test.png', fullPage: true });
  
  // Check page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check if we're on the actual site or still on login
  if (title.includes('Sleep Revolution') || title.includes('Toolkit')) {
    console.log('✅ Successfully bypassed protection!');
    
    // Test hero section
    const heroTitle = await page.locator('.hero-title').isVisible().catch(() => false);
    console.log('Hero title visible:', heroTitle);
    
    // Test buy button
    const buyButton = await page.locator('#buy-now-hero').isVisible().catch(() => false);
    console.log('Buy button visible:', buyButton);
    
    if (buyButton) {
      // Click buy button to test checkout
      await page.click('#buy-now-hero');
      await page.waitForTimeout(2000);
      
      // Check if modal opened
      const modalVisible = await page.locator('#checkout-modal').isVisible().catch(() => false);
      console.log('Checkout modal visible:', modalVisible);
      
      if (modalVisible) {
        console.log('✅ Checkout modal works!');
        
        // Try to click submit to test Stripe redirect
        const submitBtn = page.locator('#submit-payment');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(5000);
          
          const currentUrl = page.url();
          if (currentUrl.includes('stripe.com')) {
            console.log('✅ Successfully redirects to Stripe!');
          } else {
            console.log('⚠️ Stripe redirect not working, URL:', currentUrl);
          }
        }
      }
    }
    
  } else if (title.includes('Login') || title.includes('Authentication')) {
    console.log('❌ Still showing login page - bypass token may not be configured');
    console.log('Please add the token to your Vercel project settings');
  } else {
    console.log('❓ Unexpected page title:', title);
  }
});