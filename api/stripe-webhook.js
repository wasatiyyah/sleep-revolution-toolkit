// Use test key if available, fallback to production key
const stripeKey = (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '').trim();
const stripe = require('stripe')(stripeKey);
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Use test webhook secret if available, fallback to production
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('🔗 Webhook received:', {
    method: req.method,
    headers: Object.keys(req.headers),
    hasSignature: !!req.headers['stripe-signature']
  });

  // Debug environment variables
  console.log('🔧 Environment debug:', {
    hasStripeTestKey: !!process.env.STRIPE_SECRET_KEY_TEST,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookTestSecret: !!process.env.STRIPE_WEBHOOK_SECRET_TEST,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    webhookSecretPreview: process.env.STRIPE_WEBHOOK_SECRET ? process.env.STRIPE_WEBHOOK_SECRET.substring(0, 15) + '...' : 'none',
    hasResendKey: !!process.env.RESEND_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });

  try {
    // Auto-detect test vs live mode based on available keys
    const stripeKey = (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '').trim();
    // Use the main webhook secret since we're using live payment links even in test mode
    let webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET_TEST || '').trim();
    
    // Validate required environment variables
    if (!stripeKey) {
      console.error('❌ No Stripe secret key found');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
      return res.status(500).json({ error: 'Stripe secret key not configured' });
    }
    
    if (!webhookSecret) {
      console.error('❌ No webhook secret found');
      console.error('Need to set STRIPE_WEBHOOK_SECRET in Vercel environment');
      // Use the current active webhook secret as fallback
      webhookSecret = 'whsec_vP4zEjvete8V5lHAy7OVnOkWPnbfRcZX';
      console.log('🔧 Using fallback webhook secret for active endpoint');
    }
    
    console.log('🔧 Using Stripe mode:', stripeKey?.includes('test') ? 'TEST' : 'LIVE');
    console.log('🔑 Keys loaded successfully');
    
    const stripe = require('stripe')(stripeKey);
    const endpointSecret = webhookSecret;

    const sig = req.headers['stripe-signature'];
    let event;

    // Handle raw body for signature verification
    let body = req.body;
    if (typeof body !== 'string') {
      body = JSON.stringify(body);
    }

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
      console.log('✅ Webhook signature verified, event type:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      console.error('Body type:', typeof req.body);
      console.error('Endpoint secret exists:', !!endpointSecret);
      console.error('Signature header:', sig);
      console.error('Using webhook secret:', endpointSecret?.substring(0, 15) + '...');
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Payment successful:', session.id);
        console.log('📧 Customer email:', session.customer_details?.email);
        
        // Respond to Stripe immediately
        res.status(200).json({ received: true, event_id: event.id });
        
        // Send download links asynchronously (don't await)
        handleSuccessfulPayment(session).catch(err => {
          console.error('❌ Email sending failed:', err);
        });
        return;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('💰 Payment captured:', paymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
}

async function handleSuccessfulPayment(session) {
  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name;
  
  console.log('Processing successful payment:', {
    sessionId: session.id,
    customerEmail: customerEmail,
    customerName: customerName,
    amount: session.amount_total,
    currency: session.currency
  });

  if (!customerEmail) {
    console.error('❌ No customer email found in session');
    return;
  }

  try {
    // Explicitly set environment variables for webhook context
    const resendApiKey = process.env.RESEND_API_KEY || 're_fFkKMRJh_2jeX5vmeYKBFYj1rNKS5vETF';
    
    console.log('🔧 Webhook processing session:', {
      sessionId: session.id,
      customerEmail: session.customer_details?.email,
      paymentStatus: session.payment_status,
      amount: session.amount_total
    });
    
    // Debug email service environment variables
    console.log('📧 Email service debug:', {
      hasResendKey: !!resendApiKey,
      resendKeyPreview: resendApiKey ? resendApiKey.substring(0, 10) + '...' : 'none',
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPassword: !!process.env.EMAIL_PASSWORD,
      envVarCount: Object.keys(process.env).length
    });
    
    // Auto-detect which email service to use based on available API keys
    let emailService;
    
    if (resendApiKey && resendApiKey !== 're_your_resend_api_key_here') {
      // Create Resend service with explicit API key
      const { Resend } = require('resend');
      const resend = new Resend(resendApiKey);
      
      // Create a custom email service object
      emailService = {
        async sendDownloadLinks(customerEmail, customerName, sessionId) {
          const baseUrl = 'https://sleeprevolutiontoolkit.com';
          
          const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Your Sleep Revolution!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .download-section { background: #f8fafc; border-radius: 8px; padding: 30px; margin: 30px 0; }
        .download-link { display: block; background: #6366f1; color: white; text-decoration: none; padding: 15px 25px; border-radius: 8px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s; }
        .download-link:hover { background: #4f46e5; }
        .main-download { background: #10b981; font-size: 18px; padding: 20px 30px; }
        .main-download:hover { background: #059669; }
        .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">🌙</div>
            <h1>Welcome to Your Sleep Revolution!</h1>
            <p>Thank you ${customerName ? customerName : ''} for your purchase. Your transformation starts now!</p>
        </div>
        
        <div class="content">
            <h2>🎉 Your Order is Complete!</h2>
            <p>Your payment has been processed successfully. Below are your instant download links for the complete Sleep Revolution Toolkit.</p>
            
            <div class="download-section">
                <h3>📦 Download Your Complete Toolkit</h3>
                <p><strong>Get everything in one click:</strong></p>
                <a href="${baseUrl}/toolkit/final-pdfs/sleeprevolutiontoolkit.zip" class="download-link main-download" download>
                    ⬇️ Download Complete Toolkit (ZIP - All Files)
                </a>
                
                <h3>📚 Individual Downloads</h3>
                <a href="${baseUrl}/toolkit/final-pdfs/Sleep_Revolution_Toolkit_Main_Guide.pdf" class="download-link" download>
                    📖 Main Guide (78 pages) - The Complete System
                </a>
                <a href="${baseUrl}/toolkit/final-pdfs/Quick_Reference_Emergency_Cards.pdf" class="download-link" download>
                    🆘 Emergency Sleep Cards - Instant Relief
                </a>
                <a href="${baseUrl}/toolkit/final-pdfs/30_Day_Sleep_Revolution_Tracker.pdf" class="download-link" download>
                    📊 30-Day Tracker - Monitor Your Progress
                </a>
                <a href="${baseUrl}/toolkit/final-pdfs/Sleep_Revolution_Bonus_Materials.pdf" class="download-link" download>
                    🎁 Bonus Materials - 7 Extra Guides
                </a>
                <a href="${baseUrl}/toolkit/final-pdfs/Sleep_Soundscapes_Instructions.pdf" class="download-link" download>
                    🎵 Audio Soundscapes Guide
                </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0;">⚡ Quick Start Tips:</h3>
                <ol style="color: #92400e; margin: 0; padding-left: 20px;">
                    <li><strong>Start with the Main Guide</strong> - Read the first 3 chapters today</li>
                    <li><strong>Print the Emergency Cards</strong> - Keep them by your bedside</li>
                    <li><strong>Begin tracking tonight</strong> - Use the 30-Day Tracker</li>
                </ol>
            </div>
            
            <p><strong>Questions?</strong> Reply to this email and we'll help you get the most out of your toolkit.</p>
            
            <p>To your better sleep,<br>
            <strong>The Sleep Revolution Team</strong></p>
        </div>
        
        <div class="footer">
            <p>Order ID: ${sessionId}</p>
            <p>This email was sent because you purchased the Sleep Revolution Toolkit.</p>
            <p>© 2025 Sleep Revolution Toolkit. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
          `.trim();

          const result = await resend.emails.send({
            from: 'Sleep Revolution Toolkit <orders@sleeprevolutiontoolkit.com>',
            to: [customerEmail],
            subject: '🌙 Your Sleep Revolution Toolkit is Ready - Download Now!',
            html: emailTemplate,
          });

          console.log('✅ Email sent successfully:', result);
          return result;
        }
      };
      
      console.log('📧 Using Resend email service with explicit API key');
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      // Use Gmail SMTP fallback
      emailService = new SimpleEmailService();
      console.log('📧 Using Gmail SMTP service');
    } else {
      console.error('❌ No email service configured. Please set RESEND_API_KEY or EMAIL_USER/EMAIL_PASSWORD');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('EMAIL') || key.includes('RESEND')));
      return;
    }
    
    // Send download links email immediately
    await emailService.sendDownloadLinks(customerEmail, customerName, session.id);
    
    console.log(`✅ Download email sent to ${customerEmail}`);
    
    // Stop email automation sequence for purchaser
    try {
      const stopResponse = await fetch('/api/resend-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop_sequence',
          firstName: customerName,
          email: customerEmail,
          customerId: session.customer
        })
      });
      
      if (stopResponse.ok) {
        console.log('✅ Email automation sequence stopped for purchaser');
      } else {
        console.error('⚠️ Failed to stop automation sequence');
      }
    } catch (automationError) {
      console.error('Stop automation error:', automationError);
    }
    
    // Optional: Add to analytics, CRM, etc.
    await trackPurchase(session);
    
  } catch (error) {
    console.error('❌ Failed to send download email:', error);
    // You might want to add this to a retry queue
  }
}

async function trackPurchase(session) {
  // Add analytics tracking, CRM integration, etc.
  console.log('📊 Tracking purchase analytics:', {
    revenue: session.amount_total / 100,
    customer: session.customer_details?.email,
    timestamp: new Date().toISOString()
  });
}