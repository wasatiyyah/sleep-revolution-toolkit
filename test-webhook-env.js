// Test webhook environment variables
console.log('🔧 Testing webhook environment configuration...');
console.log('');

// Test if we can access environment variables like the webhook would
console.log('Environment variables that webhook function would see:');
console.log('STRIPE_SECRET_KEY_TEST:', !!process.env.STRIPE_SECRET_KEY_TEST);
console.log('STRIPE_SECRET_KEY:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_WEBHOOK_SECRET_TEST:', !!process.env.STRIPE_WEBHOOK_SECRET_TEST);
console.log('STRIPE_WEBHOOK_SECRET:', !!process.env.STRIPE_WEBHOOK_SECRET);
console.log('RESEND_API_KEY:', !!process.env.RESEND_API_KEY);
console.log('FROM_EMAIL:', !!process.env.FROM_EMAIL);
console.log('FROM_NAME:', !!process.env.FROM_NAME);

console.log('');
console.log('Testing webhook logic simulation...');

// Simulate the webhook function logic
try {
  // Use test mode if test keys are available
  const stripeKey = process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET;
  
  console.log('🔧 Using Stripe mode:', stripeKey?.includes('test') ? 'TEST' : 'LIVE');
  console.log('🔑 Stripe key found:', !!stripeKey);
  console.log('🔐 Webhook secret found:', !!webhookSecret);
  
  // Test email service initialization
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_resend_api_key_here') {
    console.log('📧 Would use Resend email service');
    console.log('📧 Resend API key found:', !!process.env.RESEND_API_KEY);
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    console.log('📧 Would use Gmail SMTP service');
  } else {
    console.log('❌ No email service configured');
  }
  
} catch (error) {
  console.error('❌ Webhook simulation failed:', error.message);
}

console.log('');
console.log('🎯 The issue is likely that the webhook function in Vercel');
console.log('   cannot access the environment variables correctly.');
console.log('   In local testing, env vars work fine.');
console.log('   In Vercel serverless function, they might not be loaded.');
console.log('');
console.log('💡 Solution: Check Vercel environment variable configuration');