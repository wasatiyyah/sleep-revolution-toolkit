const { test, expect } = require('@playwright/test');

test('Test debug version with full console output', async ({ page }) => {
  const debugUrl = 'https://sleep-toolkit-website-1bpochm3v.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const message = `[${msg.type()}] ${msg.text()}`;
    console.log(message);
    consoleMessages.push(message);
  });
  
  // Capture all errors
  page.on('pageerror', error => {
    const message = `[ERROR] ${error.message}`;
    console.log(message);
    consoleMessages.push(message);
  });
  
  console.log('=== Testing debug version with full console output ===');
  await page.goto(debugUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  console.log('\n=== Clicking buy button ===');
  const buyButton = page.locator('#buy-now-hero');
  await buyButton.click();
  
  await page.waitForSelector('#checkout-modal', { state: 'visible' });
  console.log('Modal opened successfully');
  
  console.log('\n=== Clicking submit button ===');
  const submitBtn = page.locator('#submit-payment');
  await submitBtn.click();
  
  // Wait longer to see all console output
  console.log('\n=== Waiting for Stripe response ===');
  await page.waitForTimeout(10000);
  
  const currentUrl = page.url();
  console.log('\nFinal URL:', currentUrl);
  
  if (currentUrl.includes('stripe.com')) {
    console.log('✅ SUCCESS: Redirected to Stripe!');
  } else {
    console.log('❌ Still on same page - checking for errors...');
    
    // Check for error messages
    const errorElement = page.locator('#card-errors');
    const errorText = await errorElement.textContent();
    console.log('Error message on page:', errorText || 'none');
    
    // Check modal state
    const modalVisible = await page.locator('#checkout-modal').isVisible();
    console.log('Modal still visible:', modalVisible);
  }
  
  console.log('\n=== All console messages ===');
  consoleMessages.forEach(msg => console.log(msg));
});