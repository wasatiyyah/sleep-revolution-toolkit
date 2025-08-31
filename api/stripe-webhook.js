// Vercel Serverless Function for Stripe Webhooks
// This handles successful payments and order fulfillment

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
        
        // Here you can add email notifications, analytics tracking, etc.
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
  console.log('Processing successful payment:', {
    sessionId: session.id,
    customerEmail: session.customer_details?.email,
    amount: session.amount_total,
    currency: session.currency
  });

  // Add your post-purchase logic here:
  // - Send confirmation email
  // - Add to analytics
  // - Update database
  // - Send to CRM
}