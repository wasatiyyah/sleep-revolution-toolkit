const { test, expect } = require('@playwright/test');

test('Check if CSS is loading on deployed site', async ({ page }) => {
  // Navigate with bypass token
  const bypassUrl = 'https://sleep-toolkit-website-nlibrdokg.vercel.app?x-vercel-protection-bypass=bc001427eda196c70638cfa086ba31e5';
  
  console.log('Checking CSS loading...');
  await page.goto(bypassUrl);
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  await page.screenshot({ path: 'css-check-screenshot.png', fullPage: false });
  
  // Check if CSS file is loaded
  const stylesheets = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    return sheets.map(sheet => ({
      href: sheet.href,
      rules: sheet.cssRules ? sheet.cssRules.length : 0
    }));
  });
  
  console.log('Stylesheets found:', stylesheets);
  
  // Check specific CSS properties to verify styling
  const heroBackground = await page.evaluate(() => {
    const hero = document.querySelector('.hero');
    if (hero) {
      const styles = window.getComputedStyle(hero);
      return {
        background: styles.background,
        backgroundImage: styles.backgroundImage,
        padding: styles.padding,
        display: styles.display
      };
    }
    return null;
  });
  
  console.log('Hero section styles:', heroBackground);
  
  // Check if buttons have styling
  const buttonStyles = await page.evaluate(() => {
    const button = document.querySelector('.cta-button');
    if (button) {
      const styles = window.getComputedStyle(button);
      return {
        background: styles.background,
        color: styles.color,
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        fontSize: styles.fontSize
      };
    }
    return null;
  });
  
  console.log('Button styles:', buttonStyles);
  
  // Check if fonts are loaded
  const fonts = await page.evaluate(() => {
    const title = document.querySelector('.hero-title');
    if (title) {
      const styles = window.getComputedStyle(title);
      return {
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight
      };
    }
    return null;
  });
  
  console.log('Font styles:', fonts);
  
  // Check body background
  const bodyStyles = await page.evaluate(() => {
    const styles = window.getComputedStyle(document.body);
    return {
      backgroundColor: styles.backgroundColor,
      margin: styles.margin,
      fontFamily: styles.fontFamily
    };
  });
  
  console.log('Body styles:', bodyStyles);
  
  // Final verdict
  if (stylesheets.length === 0 || !stylesheets.some(s => s.href && s.href.includes('styles.css'))) {
    console.log('❌ CSS file not loading properly!');
  } else {
    console.log('✅ CSS is loading correctly!');
  }
});