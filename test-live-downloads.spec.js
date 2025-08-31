const { test, expect } = require('@playwright/test');

test('Test live ZIP download on production site', async ({ page }) => {
  const thankYouUrl = 'https://sleeprevolutiontoolkit.com/thank-you.html';
  
  console.log('🧪 Testing live ZIP download...');
  
  await page.goto(thankYouUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  
  console.log('📄 Thank you page loaded');
  
  // Check if ZIP download button exists
  const zipButton = page.locator('a[href*="sleeprevolutiontoolkit.zip"]');
  const zipButtonVisible = await zipButton.isVisible();
  console.log(`📦 ZIP download button visible: ${zipButtonVisible}`);
  
  if (zipButtonVisible) {
    // Get the ZIP file URL
    const zipHref = await zipButton.getAttribute('href');
    console.log(`🔗 ZIP file URL: ${zipHref}`);
    
    // Test if ZIP file is accessible by making a HEAD request
    const response = await page.request.head(`https://sleeprevolutiontoolkit.com/${zipHref}`);
    console.log(`📊 ZIP file response: ${response.status()}`);
    
    if (response.status() === 200) {
      const contentLength = response.headers()['content-length'];
      const fileSizeMB = (parseInt(contentLength) / (1024 * 1024)).toFixed(2);
      console.log(`✅ ZIP file accessible! Size: ${fileSizeMB} MB`);
    } else if (response.status() === 307) {
      // Follow redirect
      const location = response.headers()['location'];
      console.log(`🔄 Redirected to: ${location}`);
      const redirectResponse = await page.request.head(location);
      console.log(`📊 Redirect response: ${redirectResponse.status()}`);
      
      if (redirectResponse.status() === 200) {
        const contentLength = redirectResponse.headers()['content-length'];
        const fileSizeMB = (parseInt(contentLength) / (1024 * 1024)).toFixed(2);
        console.log(`✅ ZIP file accessible after redirect! Size: ${fileSizeMB} MB`);
      }
    } else {
      console.log(`❌ ZIP file not accessible: ${response.status()}`);
    }
  }
  
  // Test all individual PDF downloads
  const pdfLinks = [
    'Sleep_Revolution_Toolkit_Main_Guide.pdf',
    'Quick_Reference_Emergency_Cards.pdf',
    '30_Day_Sleep_Revolution_Tracker.pdf',
    'Sleep_Revolution_Bonus_Materials.pdf',
    'Sleep_Soundscapes_Instructions.pdf'
  ];
  
  console.log('\n📚 Testing PDF downloads...');
  
  for (const pdfFile of pdfLinks) {
    const pdfButton = page.locator(`a[href*="${pdfFile}"]`);
    const pdfVisible = await pdfButton.isVisible();
    
    if (pdfVisible) {
      const pdfHref = await pdfButton.getAttribute('href');
      const response = await page.request.head(`https://sleeprevolutiontoolkit.com/${pdfHref}`);
      
      if (response.status() === 200 || (response.status() === 307 && response.headers()['location'])) {
        console.log(`✅ ${pdfFile}: Accessible`);
      } else {
        console.log(`❌ ${pdfFile}: Not accessible (${response.status()})`);
      }
    } else {
      console.log(`❌ ${pdfFile}: Button not found`);
    }
  }
  
  console.log('\n🎉 Live download test completed!');
});

test('Test thank you page download interaction', async ({ page }) => {
  const thankYouUrl = 'https://sleeprevolutiontoolkit.com/thank-you.html';
  
  console.log('🧪 Testing download button interactions...');
  
  await page.goto(thankYouUrl);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  // Test clicking the ZIP download button
  const zipButton = page.locator('a[href*="sleeprevolutiontoolkit.zip"]');
  
  if (await zipButton.isVisible()) {
    console.log('🖱️  Clicking ZIP download button...');
    
    // Click the button
    await zipButton.click();
    
    // Wait for visual feedback
    await page.waitForTimeout(3000);
    
    // Check if button text changed to "Download Started!"
    const buttonText = await zipButton.textContent();
    console.log(`📝 Button text after click: "${buttonText.trim()}"`);
    
    if (buttonText.includes('Download Started')) {
      console.log('✅ Visual feedback working correctly');
    } else {
      console.log('⚠️  Visual feedback may not be working');
    }
  }
  
  // Take screenshot of the page
  await page.screenshot({ path: 'live-thank-you-page.png', fullPage: true });
  console.log('📸 Screenshot saved: live-thank-you-page.png');
});