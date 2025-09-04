// Create Stripe payment intent for inline payment form
const stripeKey = (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '').trim();
const stripe = require('stripe')(stripeKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { 
    amount, 
    currency = 'usd',
    customerEmail, 
    metadata = {} 
  } = req.body;

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

  try {
    console.log('Creating payment intent for amount:', amount);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customerEmail: customerEmail || '',
        ...metadata
      }
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    // Return client secret for Payment Element
    res.status(200).json({ 
      clientSecret: paymentIntent.client_secret
    });

  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ 
      message: 'Failed to create payment intent', 
      error: error.message 
    });
  }
}