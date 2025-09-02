// Embedded Stripe Checkout for Sleep Toolkit
class EmbeddedCheckout {
  constructor() {
    this.stripe = null;
    this.isInitialized = false;
    this.products = {
      basic: {
        priceId: 'price_1QgD9LF5kJSM3mxUYvwqnwJU', // Your $27 price ID
        name: 'Sleep Revolution Toolkit',
        amount: 2700, // $27 in cents
        description: 'Complete sleep optimization system with emergency cards, main guide, and 30-day tracker'
      },
      deluxe: {
        priceId: 'price_deluxe_placeholder', // Your $97 price ID
        name: 'Deluxe Sleep Transformation System',
        amount: 9700, // $97 in cents
        description: 'Everything in basic plus personalized sleep assessment, coaching session, and advanced modules'
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

      this.stripe = Stripe(this.getStripePublishableKey());
      this.isInitialized = true;
      console.log('✅ Embedded checkout initialized');
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

  getStripePublishableKey() {
    // Using your live Stripe keys for sandbox testing
    return 'pk_test_51QfxP7F5kJSM3mxU1m4YVMw4eQWiLLRl0l0ztDWoAhbBTw5qoKUWoEMBqUjDGZGOBgPvGWVWFXqxoOuTULjqLBgH00d8CZFrBz';
  }

  async createCheckout(productType = 'basic', options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    const product = this.products[productType];
    if (!product) {
      throw new Error(`Product type '${productType}' not found`);
    }

    // Get customer info from localStorage if available
    const leadData = this.getLeadData();

    // Show loading state
    this.showLoadingState();

    try {
      // Create checkout session via API
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: product.priceId,
          customerEmail: leadData?.email || options.customerEmail,
          customerName: leadData?.firstName || options.customerName,
          successUrl: options.successUrl || `${window.location.origin}/thank-you.html`,
          cancelUrl: options.cancelUrl || window.location.href,
          metadata: {
            source: 'embedded_checkout',
            page: window.location.pathname,
            productType: productType,
            ...options.metadata
          }
        }),
      });

      const { sessionId, url } = await response.json();

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      // Track checkout initiation
      this.trackEvent('checkout_initiated', {
        product: productType,
        amount: product.amount / 100,
        currency: 'usd'
      });

      // Redirect to Stripe Checkout
      window.location.href = url;

    } catch (error) {
      console.error('❌ Checkout creation failed:', error);
      this.hideLoadingState();
      this.showError('Failed to start checkout. Please try again.');
      throw error;
    }
  }

  // Alternative: Embedded Checkout (newer Stripe feature)
  async createEmbeddedCheckout(containerId, productType = 'basic', options = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    const product = this.products[productType];
    const leadData = this.getLeadData();

    try {
      // Create checkout session for embedded checkout
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: product.priceId,
          customerEmail: leadData?.email || options.customerEmail,
          customerName: leadData?.firstName || options.customerName,
          mode: 'embedded',
          metadata: {
            source: 'embedded_checkout',
            page: window.location.pathname,
            productType: productType
          }
        }),
      });

      const { clientSecret } = await response.json();

      // Mount embedded checkout
      const checkout = await this.stripe.initEmbeddedCheckout({
        clientSecret,
      });

      checkout.mount(containerId);

      // Track checkout view
      this.trackEvent('embedded_checkout_viewed', {
        product: productType,
        amount: product.amount / 100
      });

      return checkout;

    } catch (error) {
      console.error('❌ Embedded checkout failed:', error);
      this.showError('Failed to load checkout. Please try again.');
      throw error;
    }
  }

  getLeadData() {
    try {
      const stored = localStorage.getItem('leadData');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  showLoadingState() {
    // Find all checkout buttons and show loading
    const buttons = document.querySelectorAll('[data-checkout-button]');
    buttons.forEach(button => {
      button.disabled = true;
      button.innerHTML = button.innerHTML.replace(/🚀|⚡|🔥/, '⏳');
      if (button.textContent.includes('Get')) {
        button.textContent = button.textContent.replace('Get', 'Loading');
      }
    });
  }

  hideLoadingState() {
    const buttons = document.querySelectorAll('[data-checkout-button]');
    buttons.forEach(button => {
      button.disabled = false;
      // Restore original text (you might want to store original text)
      window.location.reload(); // Simple approach for now
    });
  }

  showError(message) {
    // Create or update error message element
    let errorEl = document.getElementById('checkout-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.id = 'checkout-error';
      errorEl.style.cssText = `
        background: #fee2e2;
        border: 2px solid #ef4444;
        color: #dc2626;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        text-align: center;
        font-weight: 600;
      `;
      
      // Insert before the first checkout button
      const button = document.querySelector('[data-checkout-button]');
      if (button) {
        button.parentNode.insertBefore(errorEl, button);
      }
    }
    
    errorEl.textContent = `⚠️ ${message}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorEl && errorEl.parentNode) {
        errorEl.parentNode.removeChild(errorEl);
      }
    }, 5000);
  }

  trackEvent(eventName, properties = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'Checkout',
        ...properties
      });
    }

    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', eventName, properties);
    }

    console.log(`📊 Event tracked: ${eventName}`, properties);
  }

  // Utility method to set up checkout buttons on page load
  static setupCheckoutButtons() {
    document.addEventListener('DOMContentLoaded', () => {
      const checkout = new EmbeddedCheckout();
      
      // Setup basic product buttons
      document.querySelectorAll('[data-checkout="basic"]').forEach(button => {
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          button.setAttribute('data-checkout-button', 'true');
          
          try {
            await checkout.createCheckout('basic');
          } catch (error) {
            console.error('Checkout failed:', error);
          }
        });
      });

      // Setup deluxe product buttons  
      document.querySelectorAll('[data-checkout="deluxe"]').forEach(button => {
        button.addEventListener('click', async (e) => {
          e.preventDefault();
          button.setAttribute('data-checkout-button', 'true');
          
          try {
            await checkout.createCheckout('deluxe');
          } catch (error) {
            console.error('Checkout failed:', error);
          }
        });
      });

      console.log('✅ Checkout buttons initialized');
    });
  }
}

// Auto-initialize when script is loaded
EmbeddedCheckout.setupCheckoutButtons();

// Export for manual usage
window.EmbeddedCheckout = EmbeddedCheckout;