// Consolidated Stripe utilities - debug, config, validation, products
const stripeKey = (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '').trim();

export default async function handler(req, res) {
  const { action } = req.query;
  
  switch (action) {
    case 'debug':
      return await handleDebug(req, res);
    case 'config':
      return await handleConfig(req, res);
    case 'validate':
      return await handleValidate(req, res);
    case 'products':
      return await handleProducts(req, res);
    default:
      return res.status(400).json({ error: 'Invalid action. Use: debug, config, validate, or products' });
  }
}

// Debug Stripe connection
async function handleDebug(req, res) {
  const envCheck = {
    hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasStripeSecretKeyTest: !!process.env.STRIPE_SECRET_KEY_TEST,
    hasStripePublishableKey: !!process.env.STRIPE_PUBLISHABLE_KEY,
    hasResendApiKey: !!process.env.RESEND_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };
  
  let liveKeyTest = { error: null, mode: 'LIVE' };
  let testKeyTest = { error: null, mode: 'TEST' };
  
  // Test LIVE key
  const liveKeyRaw = process.env.STRIPE_SECRET_KEY || '';
  const liveKeyTrimmed = liveKeyRaw.trim();
  if (liveKeyTrimmed) {
    try {
      liveKeyTest.keyLength = liveKeyRaw.length;
      liveKeyTest.trimmedLength = liveKeyTrimmed.length;
      liveKeyTest.hadWhitespace = liveKeyRaw !== liveKeyTrimmed;
      const stripe = require('stripe')(liveKeyTrimmed);
      const products = await stripe.products.list({ limit: 1 });
      liveKeyTest.connected = true;
      liveKeyTest.productCount = products.data.length;
    } catch (error) {
      liveKeyTest.error = error.message;
      liveKeyTest.errorType = error.type;
    }
  } else {
    liveKeyTest.error = 'No STRIPE_SECRET_KEY found';
  }
  
  // Test TEST key  
  const testKeyRaw = process.env.STRIPE_SECRET_KEY_TEST || '';
  const testKeyTrimmed = testKeyRaw.trim();
  if (testKeyTrimmed) {
    try {
      testKeyTest.keyLength = testKeyRaw.length;
      testKeyTest.trimmedLength = testKeyTrimmed.length;
      testKeyTest.hadWhitespace = testKeyRaw !== testKeyTrimmed;
      const stripe = require('stripe')(testKeyTrimmed);
      const products = await stripe.products.list({ limit: 1 });
      testKeyTest.connected = true;
      testKeyTest.productCount = products.data.length;
    } catch (error) {
      testKeyTest.error = error.message;
      testKeyTest.errorType = error.type;
    }
  } else {
    testKeyTest.error = 'No STRIPE_SECRET_KEY_TEST found';
  }
  
  res.status(200).json({
    environment: envCheck,
    liveKey: liveKeyTest,
    testKey: testKeyTest,
    timestamp: new Date().toISOString()
  });
}

// Get Stripe config
async function handleConfig(req, res) {
  const secretKey = (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '').trim();
  const isTestMode = secretKey.startsWith('sk_test');
  
  const publishableKey = isTestMode ? 
    'pk_test_51QfxP7F5kJSM3mxUSUKxUSbjMWA6aSI9TxCTdLhNGKCVKwhZ5UMajpwJgGsQs2eKuqJQMLlPjN4oTKbPqJ97AQQY00i29dCgsn' : 
    (process.env.STRIPE_PUBLISHABLE_KEY || 'pk_live_zKkKhZMf8HuNCE8GDGIaNPwQ').trim();
  
  res.status(200).json({
    publishableKey: publishableKey,
    mode: isTestMode ? 'test' : 'live'
  });
}

// Validate key format
async function handleValidate(req, res) {
  const liveKey = process.env.STRIPE_SECRET_KEY || '';
  const testKey = process.env.STRIPE_SECRET_KEY_TEST || '';
  
  const validation = {
    liveKey: {
      exists: !!liveKey,
      startsWithSkLive: liveKey.startsWith('sk_live_'),
      length: liveKey.length,
      format: liveKey.match(/^sk_live_[a-zA-Z0-9]{24,}$/) ? 'valid format' : 'invalid format',
      preview: liveKey ? liveKey.substring(0, 15) + '...' + liveKey.substring(liveKey.length - 5) : 'not set'
    },
    testKey: {
      exists: !!testKey,
      startsWithSkTest: testKey.startsWith('sk_test_'),
      length: testKey.length,
      format: testKey.match(/^sk_test_[a-zA-Z0-9]{24,}$/) ? 'valid format' : 'invalid format',
      preview: testKey ? testKey.substring(0, 15) + '...' + testKey.substring(testKey.length - 5) : 'not set'
    }
  };
  
  res.status(200).json({
    validation,
    recommendation: validation.testKey.format === 'valid format' ? 
      'Test key format looks valid. If still failing, the key may be revoked or incorrect.' :
      'Test key format is invalid. Please check the key in Vercel dashboard.'
  });
}

// List products and prices
async function handleProducts(req, res) {
  try {
    const testKey = (process.env.STRIPE_SECRET_KEY_TEST || '').trim();
    const liveKey = (process.env.STRIPE_SECRET_KEY || '').trim();
    
    let testProducts = null;
    let liveProducts = null;
    
    // Get test products
    if (testKey) {
      try {
        const stripe = require('stripe')(testKey);
        const products = await stripe.products.list({ limit: 10, expand: ['data.default_price'] });
        const prices = await stripe.prices.list({ limit: 10 });
        testProducts = {
          products: products.data.map(p => ({
            id: p.id,
            name: p.name,
            active: p.active,
            defaultPrice: p.default_price?.id || p.default_price
          })),
          prices: prices.data.map(p => ({
            id: p.id,
            product: p.product,
            amount: p.unit_amount,
            currency: p.currency,
            active: p.active
          }))
        };
      } catch (error) {
        testProducts = { error: error.message };
      }
    }
    
    // Get live products
    if (liveKey) {
      try {
        const stripe = require('stripe')(liveKey);
        const products = await stripe.products.list({ limit: 10, expand: ['data.default_price'] });
        const prices = await stripe.prices.list({ limit: 10 });
        liveProducts = {
          products: products.data.map(p => ({
            id: p.id,
            name: p.name,
            active: p.active,
            defaultPrice: p.default_price?.id || p.default_price
          })),
          prices: prices.data.map(p => ({
            id: p.id,
            product: p.product,
            amount: p.unit_amount,
            currency: p.currency,
            active: p.active
          }))
        };
      } catch (error) {
        liveProducts = { error: error.message };
      }
    }
    
    res.status(200).json({
      test: testProducts,
      live: liveProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}