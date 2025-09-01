// Manual webhook debugging - simulate the webhook call
const EmailService = require('./lib/email-service');
const SimpleEmailService = require('./lib/email-service-simple');

async function debugWebhook() {
  console.log('🔧 Manual webhook debugging...');
  
  // Simulate the session data from your recent test purchase
  const mockSession = {
    id: 'cs_test_a1UDt2uBcvlkbJzp5Jr0pX6MTOg4g2hrcmKYq6ki2ciMQWcdbf4BBXcj3A',
    customer_details: {
      email: 'ibrahimhaleeth@gmail.com',
      name: 'Mohamed Ibrahim Maricar'
    },
    payment_status: 'paid',
    status: 'complete',
    amount_total: 100
  };
  
  console.log('📧 Testing webhook email logic...');
  
  try {
    // Test the same logic as in the webhook
    const customerEmail = mockSession.customer_details?.email;
    const customerName = mockSession.customer_details?.name;
    
    console.log(`👤 Customer: ${customerName} (${customerEmail})`);
    
    if (!customerEmail) {
      console.error('❌ No customer email found in session');
      return;
    }

    // Auto-detect which email service to use based on available API keys
    let emailService;
    
    const resendKey = 're_fFkKMRJh_2jeX5vmeYKBFYj1rNKS5vETF';
    
    if (resendKey && resendKey !== 're_your_resend_api_key_here') {
      // Use Resend (professional email service)
      emailService = new EmailService();
      console.log('📧 Using Resend email service');
    } else {
      console.log('❌ No valid email service configured');
      return;
    }
    
    // Send download links email
    console.log('📤 Sending email...');
    await emailService.sendDownloadLinks(customerEmail, customerName, mockSession.id);
    
    console.log(`✅ Download email sent to ${customerEmail}`);
    
  } catch (error) {
    console.error('❌ Failed to send download email:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Test the email service configuration
async function testEmailConfig() {
  console.log('🔧 Testing email service configuration...');
  
  try {
    const { Resend } = require('resend');
    const resend = new Resend('re_fFkKMRJh_2jeX5vmeYKBFYj1rNKS5vETF');
    
    console.log('✅ Resend service initialized successfully');
    
    // Test a simple email
    const result = await resend.emails.send({
      from: 'Sleep Revolution Toolkit <orders@sleeprevolutiontoolkit.com>',
      to: ['ibrahimhaleeth@gmail.com'],
      subject: '🧪 Webhook Debug Test',
      html: '<h1>Webhook Debug Test</h1><p>This email was sent from webhook debugging script.</p>',
    });

    console.log('✅ Debug email sent:', result);
    return true;
  } catch (error) {
    console.error('❌ Email service test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting webhook debugging...\n');
  
  // Test 1: Email service configuration
  console.log('=== TEST 1: Email Service ===');
  const emailWorks = await testEmailConfig();
  console.log('');
  
  if (emailWorks) {
    // Test 2: Webhook email logic
    console.log('=== TEST 2: Webhook Email Logic ===');
    await debugWebhook();
  }
  
  console.log('\n🎉 Webhook debugging completed!');
}

main().catch(console.error);