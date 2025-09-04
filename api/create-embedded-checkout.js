// Create Stripe checkout session for embedded checkout (returns client_secret)
const stripeKey = (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || '').trim();
const stripe = require('stripe')(stripeKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { 
    priceId, 
    customerEmail, 
    customerName, 
    returnUrl,
    mode = 'embedded',
    metadata = {} 
  } = req.body;

  if (!priceId) {
    return res.status(400).json({ message: 'Price ID is required' });
  }

  // Validate email - provide default if empty or invalid
  let validEmail = customerEmail;
  if (!validEmail || validEmail.trim() === '' || !validEmail.includes('@')) {
    validEmail = 'guest@example.com';
  }

  try {
    console.log('Creating embedded checkout session for:', { priceId, customerEmail, mode });
    
    // Create checkout session configured for embedded mode
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded', // This makes it embeddable
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      return_url: returnUrl || `${req.headers.origin || 'https://www.sleeprevolutiontoolkit.com'}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: validEmail,
      metadata: {
        customerName: customerName || '',
        source: 'embedded_checkout',
        ...metadata
      },
      automatic_tax: {
        enabled: false,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      phone_number_collection: {
        enabled: false
      }
    });

    console.log('✅ Embedded checkout session created:', session.id);

    // Return client_secret for embedded checkout
    res.status(200).json({ 
      clientSecret: session.client_secret,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Stripe embedded checkout error:', error);
    res.status(500).json({ 
      message: 'Failed to create embedded checkout session', 
      error: error.message 
    });
  }
}