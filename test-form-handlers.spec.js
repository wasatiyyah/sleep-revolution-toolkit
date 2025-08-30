const { test, expect } = require('@playwright/test');

test('Test form event handlers', async ({ page }) => {
  const debugUrl = 'https://sleep-toolkit-website-1bpochm3v.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  // Capture all console messages
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`[ERROR] ${error.message}`);
  });
  
  console.log('Testing form event handlers...');
  await page.goto(debugUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  // Open modal
  await page.locator('#buy-now-hero').click();
  await page.waitForSelector('#checkout-modal', { state: 'visible' });
  
  // Check if form elements exist and are properly set up
  const formCheck = await page.evaluate(() => {
    const form = document.getElementById('payment-form');
    const submitBtn = document.getElementById('submit-payment');
    const cardElement = document.getElementById('card-element');
    
    return {
      formExists: !!form,
      submitBtnExists: !!submitBtn,
      cardElementExists: !!cardElement,
      formHasEventListener: !!form && form.onsubmit !== null,
      submitBtnDisabled: submitBtn ? submitBtn.disabled : null,
      setupElementsFunction: typeof setupStripeElements === 'function',
      stripeInstance: !!window.stripe,
      elementsInstance: !!window.elements || !!elements
    };
  });
  
  console.log('Form check results:', JSON.stringify(formCheck, null, 2));
  
  // Try to manually trigger the form submit event
  console.log('Trying to manually trigger form submission...');
  const manualSubmitResult = await page.evaluate(() => {
    const form = document.getElementById('payment-form');
    if (form) {
      try {
        // Create a synthetic submit event
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
        return 'Submit event dispatched';
      } catch (error) {
        return 'Error dispatching submit event: ' + error.message;
      }
    }
    return 'Form not found';
  });
  
  console.log('Manual submit result:', manualSubmitResult);
  await page.waitForTimeout(3000);
  
  // Now try clicking the actual submit button
  console.log('Clicking submit button...');
  await page.locator('#submit-payment').click();
  await page.waitForTimeout(5000);
  
  console.log('Test completed');
});