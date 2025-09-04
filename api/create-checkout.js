// Determine which Stripe key to use based on what's available
// Use TEST key for now since products exist in test mode
const stripeKey = (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '').trim();
if (!stripeKey) {
  console.error('❌ No Stripe secret key found. Need STRIPE_SECRET_KEY or STRIPE_SECRET_KEY_TEST');
}
console.log('🔑 Using Stripe mode:', stripeKey?.includes('sk_live') ? 'LIVE' : 'TEST');
const stripe = require('stripe')(stripeKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { 
    priceId, 
    customerEmail, 
    customerName, 
    successUrl, 
    cancelUrl,
    metadata = {} 
  } = req.body;

  if (!priceId) {
    return res.status(400).json({ message: 'Price ID is required' });
  }

  try {
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.headers.origin || 'https://www.sleeprevolutiontoolkit.com'}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'https://www.sleeprevolutiontoolkit.com'}/upsell-toolkit.html`,
      customer_email: customerEmail,
      metadata: {
        customerName: customerName || '',
        source: 'sleep_toolkit_website',
        ...metadata
      },
      // Enable tax calculation if needed
      automatic_tax: {
        enabled: false,
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: 'auto',
      // Shipping for physical products (if needed)
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE'],
      },
      // Custom fields for additional data
      custom_fields: [
        {
          key: 'sleep_challenge',
          label: {
            type: 'custom',
            custom: 'What\'s your biggest sleep challenge?'
          },
          type: 'dropdown',
          dropdown: {
            options: [
              { label: 'Falling asleep (racing mind)', value: 'fallingasleep' },
              { label: 'Staying asleep (frequent wake-ups)', value: 'stayingasleep' },
              { label: 'Early morning wake-ups', value: 'earlywaking' },
              { label: 'Poor sleep quality', value: 'sleepquality' },
              { label: 'Stress and anxiety', value: 'stressanxiety' }
            ]
          },
          optional: true
        }
      ],
      // Phone number collection
      phone_number_collection: {
        enabled: false
      }
    });

    res.status(200).json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ 
      message: 'Failed to create checkout session', 
      error: error.message 
    });
  }
}