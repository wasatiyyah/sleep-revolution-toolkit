const { test, expect } = require('@playwright/test');

test('Simple CSS check on deployed site', async ({ page }) => {
  // Navigate with bypass token
  const bypassUrl = 'https://sleep-toolkit-website-nlibrdokg.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  console.log('Loading site...');
  await page.goto(bypassUrl);
  await page.waitForLoadState('networkidle');
  
  // Take screenshot to visually check styling
  await page.screenshot({ path: 'visual-css-check.png', fullPage: false });
  
  // Check if the CSS link exists in the head
  const cssLink = await page.evaluate(() => {
    const link = document.querySelector('link[href*="styles.css"]');
    return link ? link.href : null;
  });
  
  console.log('CSS link found:', cssLink);
  
  // Check computed styles on key elements
  const heroStyles = await page.evaluate(() => {
    const hero = document.querySelector('.hero');
    if (!hero) return { found: false };
    
    const styles = window.getComputedStyle(hero);
    return {
      found: true,
      hasBackground: styles.backgroundImage !== 'none' || styles.backgroundColor !== 'rgba(0, 0, 0, 0)',
      minHeight: styles.minHeight,
      padding: styles.padding
    };
  });
  
  console.log('Hero section styles:', heroStyles);
  
  // Check if button has proper styling (not default)
  const buttonCheck = await page.evaluate(() => {
    const button = document.querySelector('.cta-button');
    if (!button) return { found: false };
    
    const styles = window.getComputedStyle(button);
    return {
      found: true,
      hasBackground: styles.backgroundColor !== 'rgba(0, 0, 0, 0)',
      hasPadding: styles.padding !== '0px',
      hasBorderRadius: styles.borderRadius !== '0px',
      backgroundColor: styles.backgroundColor,
      padding: styles.padding
    };
  });
  
  console.log('Button styles:', buttonCheck);
  
  // Check if text has custom fonts
  const fontCheck = await page.evaluate(() => {
    const title = document.querySelector('.hero-title');
    if (!title) return { found: false };
    
    const styles = window.getComputedStyle(title);
    return {
      found: true,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      isCustomFont: !styles.fontFamily.includes('Times New Roman') && !styles.fontFamily.includes('serif')
    };
  });
  
  console.log('Font check:', fontCheck);
  
  // Get all stylesheets count
  const stylesheetCount = await page.evaluate(() => {
    return document.styleSheets.length;
  });
  
  console.log('Number of stylesheets loaded:', stylesheetCount);
  
  // Final verdict
  if (!cssLink) {
    console.log('❌ CSS file link not found in HTML!');
  } else if (!heroStyles.hasBackground || !buttonCheck.hasBackground) {
    console.log('⚠️ CSS link exists but styles not applying properly');
  } else {
    console.log('✅ CSS is loading and applying correctly!');
  }
  
  // Check for 404 on CSS file
  const response = await page.goto(cssLink || 'https://sleep-toolkit-website-nlibrdokg.vercel.app/css/styles.css');
  console.log('CSS file status:', response.status());
  
  if (response.status() === 404) {
    console.log('❌ CSS file returns 404 - file not found on server!');
  }
});