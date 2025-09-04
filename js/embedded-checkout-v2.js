// Embedded Stripe Checkout v2 - Inline checkout without redirect
class EmbeddedCheckoutV2 {
  constructor() {
    this.stripe = null;
    this.isInitialized = false;
    this.checkoutElement = null;
    this.isCheckoutMounted = false;
    this.products = {
      basic: {
        priceId: 'price_1S1pzWBW0J6epKS6wNsiBukQ', // Live $27 price ID in TEST mode
        name: 'Sleep Revolution Toolkit',
        amount: 2700, // $27 in cents
        description: 'Complete sleep optimization system with emergency cards, main guide, and 30-day tracker'
      }
    };
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Load Stripe.js if not already loaded
      if (!window.Stripe) {
        await this.loadStripeJS();
      }

      // Get the correct publishable key based on mode
      const publishableKey = await this.getPublishableKey();
      this.stripe = Stripe(publishableKey);
      this.isInitialized = true;
      console.log('✅ Embedded checkout v2 initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Stripe:', error);
      throw error;
    }
  }

  async loadStripeJS() {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="stripe.com"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async getPublishableKey() {
    // Get the publishable key from the server config
    try {
      const response = await fetch('/api/stripe-utils?action=config');
      if (response.ok) {
        const config = await response.json();
        return config.publishableKey;
      }
    } catch (error) {
      console.log('Using fallback publishable key');
    }
    
    // Fallback to hardcoded test key if API fails
    // This should match the mode of your secret key (TEST)
    return 'pk_test_51QfxP7F5kJSM3mxUSUKxUSbjMWA6aSI9TxCTdLhNGKCVKwhZ5UMajpwJgGsQs2eKuqJQMLlPjN4oTKbPqJ97AQQY00i29dCgsn';
  }

  async showInlineCheckout(containerId = 'checkout-container', productType = 'basic', options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    // Prevent multiple instances
    if (this.isCheckoutMounted) {
      console.log('Checkout already mounted, skipping...');
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Checkout container not found:', containerId);
      return;
    }

    const product = this.products[productType];
    if (!product) {
      throw new Error(`Product type '${productType}' not found`);
    }

    // Get customer info from localStorage if available
    const leadData = this.getLeadData();
    
    // Ensure we have a valid email
    const customerEmail = leadData?.email || options.customerEmail || 'guest@example.com';
    const customerName = leadData?.firstName || options.customerName || 'Guest';
    
    // Show loading state
    container.innerHTML = '<div class="checkout-loading">Setting up secure checkout...</div>';

    try {
      // Create checkout session via API
      const response = await fetch('/api/create-embedded-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: product.priceId,
          customerEmail: customerEmail,
          customerName: customerName,
          mode: 'embedded', // Tell API we want embedded mode
          returnUrl: `${window.location.origin}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
          metadata: {
            source: 'embedded_checkout_v2',
            page: window.location.pathname,
            productType: productType,
            ...options.metadata
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { clientSecret } = data;

      // Clear container completely (Stripe requires empty container)
      container.innerHTML = '';

      // Mount the embedded checkout
      const checkout = await this.stripe.initEmbeddedCheckout({
        clientSecret: clientSecret,
      });

      // Mount checkout to the container
      checkout.mount(`#${containerId}`);
      
      this.checkoutElement = checkout;
      this.isCheckoutMounted = true;
      
      // Track checkout initiation
      this.trackEvent('embedded_checkout_shown', {
        product: productType,
        amount: product.amount / 100,
        currency: 'usd'
      });

    } catch (error) {
      console.error('❌ Embedded checkout failed:', error);
      container.innerHTML = `
        <div class="checkout-error">
          <p>Unable to load checkout. Please try again.</p>
          <button onclick="location.reload()">Refresh Page</button>
        </div>
      `;
      throw error;
    }
  }

  // Alternative simple payment form using Payment Element
  async showPaymentForm(containerId = 'payment-form', productType = 'basic', options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Payment form container not found:', containerId);
      return;
    }

    const product = this.products[productType];
    const leadData = this.getLeadData();

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: product.amount,
          currency: 'usd',
          customerEmail: leadData?.email || options.customerEmail,
          metadata: {
            productType: productType,
            productName: product.name
          }
        }),
      });

      const { clientSecret } = await response.json();

      // Create payment form HTML
      container.innerHTML = `
        <form id="stripe-payment-form">
          <div class="payment-header">
            <h3>${product.name}</h3>
            <p class="price">$${(product.amount / 100).toFixed(2)}</p>
          </div>
          <div id="payment-element"></div>
          <button type="submit" id="submit-payment" class="checkout-button">
            Complete Purchase - $${(product.amount / 100).toFixed(2)}
          </button>
          <div id="payment-message" class="hidden"></div>
        </form>
      `;

      // Create Payment Element
      const elements = this.stripe.elements({ clientSecret });
      const paymentElement = elements.create('payment');
      paymentElement.mount('#payment-element');

      // Handle form submission
      const form = document.getElementById('stripe-payment-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = document.getElementById('submit-payment');
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        const { error } = await this.stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/thank-you.html`,
          },
        });

        if (error) {
          const messageContainer = document.getElementById('payment-message');
          messageContainer.textContent = error.message;
          messageContainer.classList.remove('hidden');
          submitButton.disabled = false;
          submitButton.textContent = `Complete Purchase - $${(product.amount / 100).toFixed(2)}`;
        }
      });

    } catch (error) {
      console.error('❌ Payment form failed:', error);
      container.innerHTML = `
        <div class="checkout-error">
          <p>Unable to load payment form. Please try again.</p>
          <button onclick="location.reload()">Refresh Page</button>
        </div>
      `;
    }
  }

  getLeadData() {
    try {
      const stored = localStorage.getItem('leadData');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  trackEvent(eventName, data) {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, data);
    }
    console.log(`📊 Event tracked: ${eventName}`, data);
  }

  destroy() {
    if (this.checkoutElement) {
      this.checkoutElement.destroy();
      this.checkoutElement = null;
      this.isCheckoutMounted = false;
    }
  }
}

// Singleton instance
let globalCheckoutInstance = null;

// Initialize on page load
window.EmbeddedCheckoutV2 = EmbeddedCheckoutV2;

// Singleton getter
window.getCheckoutInstance = function() {
  if (!globalCheckoutInstance) {
    globalCheckoutInstance = new EmbeddedCheckoutV2();
  }
  return globalCheckoutInstance;
};

// Auto-initialize if checkout container exists (but only once)
document.addEventListener('DOMContentLoaded', () => {
  const checkoutContainer = document.getElementById('inline-checkout-container');
  if (checkoutContainer && !globalCheckoutInstance) {
    console.log('Auto-initializing checkout from DOMContentLoaded...');
    globalCheckoutInstance = new EmbeddedCheckoutV2();
    const productType = checkoutContainer.dataset.product || 'basic';
    globalCheckoutInstance.showInlineCheckout('inline-checkout-container', productType);
  }
});