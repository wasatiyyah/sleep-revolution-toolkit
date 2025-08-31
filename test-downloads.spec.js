const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('Test all download links work on thank you page', async ({ page }) => {
  const thankYouPath = '/Users/ibrahim/Desktop/sleep/sleep-toolkit-website/thank-you.html';
  
  console.log('🧪 Testing download functionality...');
  
  // Open the thank you page locally
  await page.goto(`file://${thankYouPath}`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  console.log('📄 Thank you page loaded');
  
  // Define expected downloads
  const expectedDownloads = [
    {
      selector: 'a[href*="Sleep_Revolution_Toolkit_Main_Guide.pdf"]',
      fileName: 'Sleep_Revolution_Toolkit_Main_Guide.pdf',
      description: 'Main Guide'
    },
    {
      selector: 'a[href*="Quick_Reference_Emergency_Cards.pdf"]',
      fileName: 'Quick_Reference_Emergency_Cards.pdf', 
      description: 'Emergency Cards'
    },
    {
      selector: 'a[href*="30_Day_Sleep_Revolution_Tracker.pdf"]',
      fileName: '30_Day_Sleep_Revolution_Tracker.pdf',
      description: 'Sleep Tracker'
    },
    {
      selector: 'a[href*="Sleep_Revolution_Bonus_Materials.pdf"]',
      fileName: 'Sleep_Revolution_Bonus_Materials.pdf',
      description: 'Bonus Materials'
    },
    {
      selector: 'a[href*="Sleep_Soundscapes_Instructions.pdf"]',
      fileName: 'Sleep_Soundscapes_Instructions.pdf',
      description: 'Audio Guide'
    },
    {
      selector: 'a[href*="sleeprevolutiontoolkit.zip"]',
      fileName: 'sleeprevolutiontoolkit.zip',
      description: 'Complete Toolkit ZIP'
    }
  ];
  
  console.log('🔗 Checking download links...');
  
  for (const download of expectedDownloads) {
    // Check if link exists on page
    const linkExists = await page.locator(download.selector).isVisible();
    console.log(`${linkExists ? '✅' : '❌'} ${download.description}: ${linkExists ? 'Link found' : 'Link missing'}`);
    
    if (linkExists) {
      // Get the href attribute
      const href = await page.locator(download.selector).getAttribute('href');
      console.log(`  📁 Link path: ${href}`);
      
      // Check if the actual file exists
      const fullPath = path.join('/Users/ibrahim/Desktop/sleep/sleep-toolkit-website', href);
      const fileExists = fs.existsSync(fullPath);
      console.log(`  ${fileExists ? '✅' : '❌'} File exists: ${fileExists ? 'Yes' : 'No'} (${fullPath})`);
      
      if (fileExists) {
        // Check file size
        const stats = fs.statSync(fullPath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`  📊 File size: ${fileSizeMB} MB`);
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Test clicking a download button to see visual feedback
  console.log('🖱️  Testing download button click...');
  const firstDownload = page.locator(expectedDownloads[0].selector);
  if (await firstDownload.isVisible()) {
    await firstDownload.click();
    console.log('✅ Download button clicked - visual feedback should appear');
    
    // Wait to see the feedback
    await page.waitForTimeout(3000);
  }
  
  console.log('🎉 Download test completed!');
});

test('Verify thank you page loads correctly', async ({ page }) => {
  const thankYouPath = '/Users/ibrahim/Desktop/sleep/sleep-toolkit-website/thank-you.html';
  
  console.log('🧪 Testing thank you page layout...');
  
  await page.goto(`file://${thankYouPath}`);
  await page.waitForLoadState('domcontentloaded');
  
  // Check key elements
  const elements = [
    { selector: '.thank-you-title', name: 'Thank You Title' },
    { selector: '.download-card', name: 'Download Cards' },
    { selector: '.download-all-btn', name: 'Download All Button' },
    { selector: '.success-icon', name: 'Success Icon' }
  ];
  
  for (const element of elements) {
    const visible = await page.locator(element.selector).isVisible();
    console.log(`${visible ? '✅' : '❌'} ${element.name}: ${visible ? 'Visible' : 'Missing'}`);
  }
  
  // Count download cards
  const cardCount = await page.locator('.download-card').count();
  console.log(`📊 Download cards found: ${cardCount} (expected: 5)`);
  
  // Take screenshot
  await page.screenshot({ path: 'thank-you-page-test.png', fullPage: true });
  console.log('📸 Screenshot saved: thank-you-page-test.png');
});