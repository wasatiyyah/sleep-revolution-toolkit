const { test, expect } = require('@playwright/test');

test('Debug button click issue', async ({ page }) => {
  const finalUrl = 'https://sleep-toolkit-website-40tfr4xwe.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  // Enable console logging
  page.on('console', msg => {
    console.log('Browser console:', msg.type(), msg.text());
  });
  
  // Enable error logging
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  console.log('Loading page...');
  await page.goto(finalUrl);
  await page.waitForLoadState('networkidle');
  
  // Check if JavaScript file is loaded
  const jsLoaded = await page.evaluate(() => {
    return typeof startCountdown === 'function';
  });
  console.log('JavaScript loaded:', jsLoaded);
  
  // Check if buy button exists and has event listeners
  const buyButtonInfo = await page.evaluate(() => {
    const button = document.querySelector('#buy-now-hero');
    if (!button) return { found: false };
    
    return {
      found: true,
      id: button.id,
      classes: button.className,
      onclick: button.onclick ? 'has onclick' : 'no onclick',
      eventListeners: button.getEventListeners ? 'can check listeners' : 'cannot check listeners'
    };
  });
  console.log('Buy button info:', buyButtonInfo);
  
  // Try to click the button and see what happens
  if (buyButtonInfo.found) {
    console.log('Attempting to click buy button...');
    
    // Wait for any animations to complete
    await page.waitForTimeout(2000);
    
    const buyButton = page.locator('#buy-now-hero');
    await buyButton.click();
    
    console.log('Button clicked, waiting...');
    await page.waitForTimeout(3000);
    
    // Check modal state
    const modalInfo = await page.evaluate(() => {
      const modal = document.querySelector('#checkout-modal');
      if (!modal) return { found: false };
      
      const styles = window.getComputedStyle(modal);
      return {
        found: true,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        classes: modal.className
      };
    });
    console.log('Modal info after click:', modalInfo);
    
    // Check if any JavaScript errors occurred
    const jsErrors = await page.evaluate(() => {
      return window.jsErrors || [];
    });
    console.log('JavaScript errors:', jsErrors);
    
    // Try manual modal opening
    console.log('Trying to open modal manually...');
    const manualModalResult = await page.evaluate(() => {
      const modal = document.querySelector('#checkout-modal');
      if (modal) {
        modal.style.display = 'block';
        return 'Modal display set to block';
      }
      return 'Modal not found';
    });
    console.log('Manual modal result:', manualModalResult);
    
    // Take screenshot after manual modal opening
    await page.screenshot({ path: 'debug-modal-manual.png' });
    
    // Check if setupBuyButtons function exists
    const setupFunctionExists = await page.evaluate(() => {
      return typeof setupBuyButtons === 'function';
    });
    console.log('setupBuyButtons function exists:', setupFunctionExists);
  }
});