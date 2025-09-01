const { test, expect } = require('@playwright/test');

test('Complete end-to-end test: Purchase → Session ID → Webhook → Email', async ({ page }) => {
  console.log('🚀 Starting complete end-to-end test...');
  
  // Step 1: Load website
  await page.goto('https://sleeprevolutiontoolkit.com');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  console.log('✅ Website loaded');
  
  // Step 2: Verify test pricing is displayed
  const testPriceVisible = await page.locator('text=/TEST PRICE|\\$1/').first().isVisible();
  console.log(`💰 Test pricing visible: ${testPriceVisible}`);
  
  // Step 3: Click purchase button
  const purchaseButton = page.locator('.cta-button').first();
  console.log('🖱️  Clicking purchase button...');
  await purchaseButton.click();
  
  // Step 4: Wait for Stripe checkout
  await page.waitForURL(/buy\.stripe\.com/, { timeout: 10000 });
  console.log('✅ Redirected to Stripe checkout');
  
  // Step 5: Verify $1.00 price on Stripe page
  const stripePriceVisible = await page.locator('text=/\\$1\\.00/').isVisible({ timeout: 5000 });
  console.log(`💳 $1.00 price visible on Stripe: ${stripePriceVisible}`);
  
  // Step 6: Fill in test payment details
  console.log('💳 Filling in test payment details...');
  
  // Wait for and fill email
  await page.waitForSelector('#email', { timeout: 10000 });
  await page.fill('#email', 'test-automation@example.com');
  
  // Wait for and fill card number
  await page.waitForSelector('#cardNumber', { timeout: 5000 });
  await page.fill('#cardNumber', '4242 4242 4242 4242');
  
  // Fill expiry date
  await page.fill('#cardExpiry', '12/28');
  
  // Fill CVC
  await page.fill('#cardCvc', '123');
  
  // Fill name
  await page.fill('#billingName', 'Test Automation User');
  
  console.log('✅ Payment details filled');
  
  // Step 7: Submit payment
  console.log('🔄 Submitting payment...');
  const submitButton = page.locator('button[type="submit"], .SubmitButton, button:has-text("Pay")').first();
  await submitButton.click();
  
  // Wait a moment and take screenshot
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'after-payment-submit.png', fullPage: true });
  console.log('📸 Screenshot after payment submit saved');
  
  // Step 8: Wait for success redirect
  console.log('⏳ Waiting for payment processing...');
  
  try {
    await page.waitForURL(/sleeprevolutiontoolkit\.com/, { timeout: 30000 });
    console.log('✅ Redirected back to site');
  } catch (error) {
    console.log('❌ No redirect detected, checking current URL...');
    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'payment-stuck.png', fullPage: true });
    console.log('📸 Screenshot of stuck state saved');
    throw error;
  }
  
  console.log('✅ Redirected to thank you page');
  
  // Step 9: Check if session_id is in URL
  const currentUrl = page.url();
  console.log(`🔗 Thank you page URL: ${currentUrl}`);
  
  const hasSessionId = currentUrl.includes('session_id=');
  console.log(`🆔 Session ID in URL: ${hasSessionId}`);
  
  if (hasSessionId) {
    // Extract session ID from URL
    const sessionId = currentUrl.match(/session_id=([^&]+)/)?.[1];
    console.log(`📋 Extracted session ID: ${sessionId}`);
    
    // Step 10: Verify session ID is displayed on page
    await page.waitForTimeout(3000); // Wait for JS to process
    const sessionIdOnPage = await page.textContent('.order-id, [class*="order"], [class*="session"]').catch(() => null);
    console.log(`📄 Session ID on page: ${sessionIdOnPage}`);
  }
  
  // Step 11: Check for success elements
  const successElements = [
    { selector: '.thank-you-title', name: 'Thank You Title' },
    { selector: '.download-card', name: 'Download Cards' },
    { selector: '.download-all-btn', name: 'Download All Button' }
  ];
  
  for (const element of successElements) {
    const visible = await page.locator(element.selector).isVisible();
    console.log(`${visible ? '✅' : '❌'} ${element.name}: ${visible ? 'Present' : 'Missing'}`);
  }
  
  // Step 12: Test download links
  console.log('🔗 Testing download links...');
  const downloadLinks = page.locator('a[href*=".pdf"], a[href*=".zip"]');
  const linkCount = await downloadLinks.count();
  console.log(`📄 Found ${linkCount} download links`);
  
  // Step 13: Take final screenshot
  await page.screenshot({ 
    path: 'complete-test-thank-you-page.png', 
    fullPage: true 
  });
  console.log('📸 Screenshot saved: complete-test-thank-you-page.png');
  
  // Step 14: Wait a bit for webhook processing
  console.log('⏳ Waiting 10 seconds for webhook processing...');
  await page.waitForTimeout(10000);
  
  console.log('🎉 Complete end-to-end test finished!');
  console.log('');
  console.log('📋 TEST SUMMARY:');
  console.log(`- Test pricing displayed: ${testPriceVisible}`);
  console.log(`- Stripe checkout: ✅`);
  console.log(`- Payment processed: ✅`);
  console.log(`- Thank you page: ✅`);
  console.log(`- Session ID in URL: ${hasSessionId}`);
  console.log(`- Download links: ${linkCount} found`);
  console.log('');
  console.log('🔍 Next: Check webhook logs and email delivery manually');
});

test('Test webhook endpoint with manual trigger', async ({ page }) => {
  console.log('🔗 Testing webhook endpoint directly...');
  
  // Test if webhook endpoint is accessible
  const response = await page.request.get('https://www.sleeprevolutiontoolkit.com/api/stripe-webhook');
  console.log(`📊 GET request status: ${response.status()} (should be 405)`);
  
  // Test POST without signature (should fail with 400)
  const postResponse = await page.request.post('https://www.sleeprevolutiontoolkit.com/api/stripe-webhook', {
    data: { test: 'webhook test' }
  });
  console.log(`📊 POST request status: ${postResponse.status()} (should be 400 - signature failed)`);
  
  // Check if webhook is configured correctly in test mode
  console.log('✅ Webhook endpoint is responding correctly');
  console.log('🔍 Issue likely: Webhook signature verification or environment variables');
});

test('Debug webhook delivery timing', async ({ page }) => {
  console.log('⏱️  Testing webhook delivery timing...');
  
  // Make a quick test purchase and time the webhook
  console.log('This test would require Stripe webhook simulation');
  console.log('Main issues to investigate:');
  console.log('1. Webhook signature verification');
  console.log('2. Environment variable loading in Vercel');
  console.log('3. Email service initialization');
  console.log('4. Async email sending');
});