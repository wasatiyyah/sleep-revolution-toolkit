const { test, expect } = require('@playwright/test');

test('Test final deployment with inlined CSS', async ({ page }) => {
  // Navigate with bypass token
  const finalUrl = 'https://sleep-toolkit-website-40tfr4xwe.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  console.log('Testing final deployment with inlined CSS...');
  await page.goto(finalUrl);
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  await page.screenshot({ path: 'final-deployment-test.png', fullPage: false });
  
  // Check if CSS is now working properly
  const heroStyles = await page.evaluate(() => {
    const hero = document.querySelector('.hero');
    if (!hero) return { found: false };
    
    const styles = window.getComputedStyle(hero);
    return {
      found: true,
      hasBackground: styles.backgroundImage !== 'none' || styles.backgroundColor !== 'rgba(0, 0, 0, 0)',
      backgroundColor: styles.backgroundColor,
      backgroundImage: styles.backgroundImage,
      padding: styles.padding,
      color: styles.color
    };
  });
  
  console.log('Hero section styles:', heroStyles);
  
  // Check button styling
  const buttonStyles = await page.evaluate(() => {
    const button = document.querySelector('.cta-button');
    if (!button) return { found: false };
    
    const styles = window.getComputedStyle(button);
    return {
      found: true,
      hasGradient: styles.backgroundImage !== 'none',
      backgroundImage: styles.backgroundImage,
      borderRadius: styles.borderRadius,
      padding: styles.padding,
      color: styles.color,
      boxShadow: styles.boxShadow
    };
  });
  
  console.log('Button styles:', buttonStyles);
  
  // Check fonts
  const fontStyles = await page.evaluate(() => {
    const title = document.querySelector('.hero-title');
    if (!title) return { found: false };
    
    const styles = window.getComputedStyle(title);
    return {
      found: true,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      color: styles.color,
      isPlayfairDisplay: styles.fontFamily.includes('Playfair')
    };
  });
  
  console.log('Font styles:', fontStyles);
  
  // Test checkout functionality
  const buyButton = page.locator('#buy-now-hero');
  if (await buyButton.isVisible()) {
    console.log('✅ Buy button is visible');
    await buyButton.click();
    
    // Check if modal opens
    await page.waitForSelector('#checkout-modal', { state: 'visible', timeout: 5000 });
    console.log('✅ Checkout modal opens');
    
    // Take screenshot of modal
    await page.screenshot({ path: 'final-checkout-modal.png', fullPage: false });
    
    // Test submit button
    const submitBtn = page.locator('#submit-payment');
    if (await submitBtn.isVisible()) {
      console.log('✅ Submit button is ready');
      await submitBtn.click();
      
      // Wait to see if it redirects to Stripe
      await page.waitForTimeout(5000);
      
      const currentUrl = page.url();
      if (currentUrl.includes('stripe.com')) {
        console.log('✅ Successfully redirects to Stripe!');
      } else {
        console.log('⚠️ Still on same page - URL:', currentUrl);
      }
    }
  }
  
  // Final verdict
  if (heroStyles.hasBackground && buttonStyles.hasGradient && fontStyles.isPlayfairDisplay) {
    console.log('🎉 SUCCESS! Website is fully styled and functional!');
  } else {
    console.log('❌ Some styling issues remain');
  }
});