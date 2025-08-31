/**
 * Client-Side Configuration
 * Safe configuration that can be exposed to the browser
 * DO NOT include any secret keys here!
 */

// Environment detection
const isProduction = window.location.hostname !== 'localhost' && 
                    !window.location.hostname.includes('127.0.0.1') &&
                    !window.location.hostname.includes('.local');

const isDevelopment = !isProduction;

// Configuration object
window.CONFIG = {
    // ===========================================
    // ENVIRONMENT
    // ===========================================
    environment: {
        isProduction: isProduction,
        isDevelopment: isDevelopment,
        websiteUrl: isProduction 
            ? 'https://sleep-toolkit-website.vercel.app' 
            : window.location.origin
    },

    // ===========================================
    // STRIPE (PUBLIC KEYS ONLY)
    // ===========================================
    stripe: {
        publishableKey: isProduction 
            ? 'pk_live_zKkKhZMf8HuNCE8GDGIaNPwQ'  // Replace with your live key
            : 'pk_test_8Lfb60gbAK374AtGcoL8COpC',
        paymentLink: 'https://buy.stripe.com/test_8x23cuapJdM8gMN2mB73G00',
        priceId: 'price_1S1pzWBW0J6epKS6wNsiBukQ',
        productId: 'prod_SxlWBmU5Qxwuh6'
    },

    // ===========================================
    // GOOGLE SERVICES
    // ===========================================
    google: {
        analytics: {
            measurementId: 'G-XXXXXXXXXX' // Replace with your GA4 ID
        },
        tagManager: {
            containerId: 'GTM-XXXXXXX' // Replace with your GTM ID
        },
        ads: {
            conversionId: 'placeholder_conversion_id',
            conversionLabel: 'placeholder_conversion_label'
        }
    },

    // ===========================================
    // SOCIAL MEDIA TRACKING
    // ===========================================
    tracking: {
        facebook: {
            pixelId: 'placeholder_pixel_id' // Replace with your Pixel ID
        },
        hotjar: {
            id: 'placeholder_hotjar_id' // Replace with your Hotjar ID
        },
        clarity: {
            projectId: 'placeholder_clarity_id' // Replace with your Clarity ID
        },
        tiktok: {
            pixelId: 'placeholder_tiktok_pixel' // Replace with your TikTok Pixel
        }
    },

    // ===========================================
    // FEATURES
    // ===========================================
    features: {
        enableAnalytics: true,
        enableAdsTracking: true,
        enableHotjar: false, // Enable when you have valid IDs
        enableClarity: false, // Enable when you have valid IDs
        debugMode: isDevelopment
    },

    // ===========================================
    // URLS & ENDPOINTS
    // ===========================================
    urls: {
        api: isProduction ? 'https://api.yourdomain.com' : '/api',
        thankYou: '/thank-you.html',
        privacy: '/privacy.html',
        terms: '/terms.html'
    },

    // ===========================================
    // PRODUCT CONFIGURATION
    // ===========================================
    product: {
        name: 'Sleep Revolution Toolkit',
        price: 27.00,
        currency: 'USD',
        description: 'Complete 5-PDF sleep transformation system'
    }
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
window.CONFIG.utils = {
    // Get the correct redirect URL with bypass token
    getRedirectUrl: function(path) {
        const baseUrl = this.environment.websiteUrl;
        const bypassToken = 'bc001427eda196c70638cfa086ba31e5';
        const separator = path.includes('?') ? '&' : '?';
        return `${baseUrl}${path}${separator}x-vercel-protection-bypass=${bypassToken}`;
    },

    // Track conversion events
    trackConversion: function(eventName, value = null) {
        if (!this.features.enableAdsTracking) return;

        // Google Ads conversion tracking
        if (typeof gtag !== 'undefined' && this.google.ads.conversionId) {
            gtag('event', 'conversion', {
                'send_to': `${this.google.ads.conversionId}/${this.google.ads.conversionLabel}`,
                'value': value || this.product.price,
                'currency': this.product.currency
            });
        }

        // Facebook Pixel tracking
        if (typeof fbq !== 'undefined' && this.tracking.facebook.pixelId) {
            fbq('track', eventName, {
                value: value || this.product.price,
                currency: this.product.currency
            });
        }

        console.log(`Conversion tracked: ${eventName}`, { value, currency: this.product.currency });
    },

    // Initialize tracking scripts
    initializeTracking: function() {
        if (this.features.enableAnalytics && this.google.analytics.measurementId) {
            this.loadGoogleAnalytics();
        }

        if (this.features.enableAdsTracking && this.tracking.facebook.pixelId) {
            this.loadFacebookPixel();
        }

        if (this.features.enableHotjar && this.tracking.hotjar.id) {
            this.loadHotjar();
        }

        if (this.features.enableClarity && this.tracking.clarity.projectId) {
            this.loadClarity();
        }
    },

    // Load Google Analytics
    loadGoogleAnalytics: function() {
        if (typeof gtag !== 'undefined') return; // Already loaded

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.google.analytics.measurementId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', this.google.analytics.measurementId);
        
        console.log('Google Analytics initialized');
    },

    // Load Facebook Pixel
    loadFacebookPixel: function() {
        if (typeof fbq !== 'undefined') return; // Already loaded

        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        
        fbq('init', this.tracking.facebook.pixelId);
        fbq('track', 'PageView');
        
        console.log('Facebook Pixel initialized');
    },

    // Load other tracking scripts as needed...
    loadHotjar: function() {
        // Hotjar loading code here
        console.log('Hotjar would be loaded here');
    },

    loadClarity: function() {
        // Microsoft Clarity loading code here
        console.log('Clarity would be loaded here');
    }
};

// Auto-initialize if enabled
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (window.CONFIG.features.enableAnalytics || window.CONFIG.features.enableAdsTracking) {
            window.CONFIG.utils.initializeTracking();
        }
    });
} else {
    if (window.CONFIG.features.enableAnalytics || window.CONFIG.features.enableAdsTracking) {
        window.CONFIG.utils.initializeTracking();
    }
}

console.log('Configuration loaded:', window.CONFIG.environment);