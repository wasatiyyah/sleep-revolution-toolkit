const { test, expect } = require('@playwright/test');

test('Debug website loading', async ({ page }) => {
  // Navigate to the website
  await page.goto('https://sleep-toolkit-website-gkcpd9nso.vercel.app');
  
  // Wait longer for page load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  // Take a screenshot to see what's actually there
  await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
  
  // Get the page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Get the page HTML
  const content = await page.content();
  console.log('Page loaded, content length:', content.length);
  
  // Try to find any h1 elements
  const h1Elements = await page.locator('h1').all();
  console.log('Found h1 elements:', h1Elements.length);
  
  // Try to find hero-title
  const heroTitle = await page.locator('.hero-title');
  const heroTitleVisible = await heroTitle.isVisible().catch(() => false);
  console.log('Hero title visible:', heroTitleVisible);
  
  if (heroTitleVisible) {
    const heroText = await heroTitle.textContent();
    console.log('Hero title text:', heroText);
  }
  
  // Check if there are any error messages
  const errors = await page.locator('.error, [class*="error"]').all();
  console.log('Error elements found:', errors.length);
  
  // Check the network requests
  console.log('Current URL:', page.url());
  
  // Log all visible text on the page
  const bodyText = await page.locator('body').textContent();
  console.log('Body text preview:', bodyText.substring(0, 200));
});