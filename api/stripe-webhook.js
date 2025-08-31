// Vercel Serverless Function for Stripe Webhooks
// This handles successful payments and order fulfillment

const EmailService = require('../lib/email-service');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('✅ Payment successful:', session.id);
        
        // Send download links immediately
        await handleSuccessfulPayment(session);
        break;

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
    // Send download links email immediately
    const emailService = new EmailService();
    await emailService.sendDownloadLinks(customerEmail, customerName, session.id);
    
    console.log(`✅ Download email sent to ${customerEmail}`);
    
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