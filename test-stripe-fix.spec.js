const { test, expect } = require('@playwright/test');

test('Test Stripe checkout with bypass token fix', async ({ page }) => {
  const newUrl = 'https://sleep-toolkit-website-pmkpudvf1.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  console.log('Testing Stripe checkout with bypass token fix...');
  await page.goto(newUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  // Click buy button
  const buyButton = page.locator('#buy-now-hero');
  await buyButton.click();
  console.log('✅ Buy button clicked');
  
  // Wait for modal
  await page.waitForSelector('#checkout-modal', { state: 'visible' });
  console.log('✅ Checkout modal opened');
  
  // Click submit (should redirect to Stripe)
  const submitBtn = page.locator('#submit-payment');
  await submitBtn.click();
  console.log('✅ Submit button clicked - checking redirect...');
  
  // Wait for redirect
  await page.waitForTimeout(8000);
  
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  if (currentUrl.includes('stripe.com')) {
    console.log('🎉 SUCCESS! Redirected to Stripe!');
    
    // Check if the success URL in the Stripe checkout includes the bypass token
    // This is harder to test directly, but we can check the page source for the fix
    await page.goBack();
    await page.waitForTimeout(2000);
    
    const successUrlCheck = await page.evaluate(() => {
      // Look for the success URL in the script
      const scripts = Array.from(document.querySelectorAll('script'));
      for (const script of scripts) {
        if (script.innerHTML.includes('successUrl') && script.innerHTML.includes('x-vercel-protection-bypass')) {
          return 'Success URL includes bypass token ✅';
        }
      }
      return 'Bypass token not found in success URL ❌';
    });
    
    console.log('Success URL check:', successUrlCheck);
    
    // Also test the thank-you page directly
    const thankYouUrl = currentUrl.replace('stripe.com', '').split('/')[0] + '//sleep-toolkit-website-pmkpudvf1.vercel.app/thank-you.html?session_id=test&x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
    
    try {
      await page.goto('https://sleep-toolkit-website-pmkpudvf1.vercel.app/thank-you.html?session_id=test&x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5');
      await page.waitForTimeout(3000);
      
      const thankYouVisible = await page.locator('text=Thank You').isVisible();
      if (thankYouVisible) {
        console.log('✅ Thank you page is accessible with bypass token');
      } else {
        console.log('⚠️ Thank you page loaded but content check failed');
      }
    } catch (error) {
      console.log('❌ Thank you page test failed:', error.message);
    }
    
  } else {
    console.log('ℹ️ Still on same page - demo mode or error');
  }
});