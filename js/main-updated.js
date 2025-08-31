/**
 * Main JavaScript - Updated to use Configuration
 * This version uses the CONFIG object for all settings
 */

// Wait for config to load
document.addEventListener('DOMContentLoaded', function() {
    // Ensure config is loaded
    if (typeof window.CONFIG === 'undefined') {
        console.error('CONFIG not loaded! Make sure config.js is included before main.js');
        return;
    }

    console.log('Initializing Sleep Toolkit website...');

    // Initialize all components
    initializeCountdown();
    initializeScrollAnimations();
    setupBuyButtons();
    setupModal();
    initializeStripe();
    animateBadges();
    animateNumbers();

    console.log('Website initialization complete');
});

// ===========================================
// STRIPE INTEGRATION
// ===========================================
let stripe = null;
let elements = null;

function initializeStripe() {
    const config = window.CONFIG.stripe;
    
    if (typeof Stripe !== 'undefined' && config.publishableKey) {
        stripe = Stripe(config.publishableKey);
        window.stripe = stripe; // For debugging
        console.log('Stripe initialized successfully');
    } else {
        console.warn('Stripe not initialized - check publishable key');
    }
}

function openCheckoutModal() {
    const paymentLink = window.CONFIG.stripe.paymentLink;
    
    console.log('Redirecting to Stripe Payment Link:', paymentLink);
    
    // Track the conversion event
    window.CONFIG.utils.trackConversion('InitiateCheckout', window.CONFIG.product.price);
    
    // Redirect to payment link
    window.location.href = paymentLink;
}

// ===========================================
// UI COMPONENTS
// ===========================================

// Countdown Timer
function initializeCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;
    
    let timeLeft = 3 * 60 * 60; // 3 hours in seconds
    
    function updateCountdown() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        countdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeLeft > 0) {
            timeLeft--;
        } else {
            timeLeft = 3 * 60 * 60; // Reset to 3 hours
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
    console.log('Countdown timer initialized');
}

// Scroll Animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Add stagger effect for grid items
                if (entry.target.parentElement.classList.contains('problem-grid') ||
                    entry.target.parentElement.classList.contains('bonus-grid') ||
                    entry.target.parentElement.classList.contains('science-grid')) {
                    const siblings = Array.from(entry.target.parentElement.children);
                    const index = siblings.indexOf(entry.target);
                    entry.target.style.transitionDelay = `${index * 0.1}s`;
                }
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll(
        '.problem-card, .toolkit-item, .bonus-item, .testimonial, .science-card, .faq-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    console.log('Scroll animations initialized for', animatedElements.length, 'elements');
}

// Buy Button Setup
function setupBuyButtons() {
    const buyButtons = document.querySelectorAll('#buy-now-hero, #buy-now-main, #buy-now-final');
    
    buyButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            console.log(`Buy button ${index + 1} clicked`);
            
            // Add ripple effect
            addRippleEffect(this, e);
            
            // Track button click
            window.CONFIG.utils.trackConversion('AddToCart', window.CONFIG.product.price);
            
            // Open checkout (redirect to payment link)
            setTimeout(() => {
                openCheckoutModal();
            }, 300); // Small delay for ripple effect
        });
    });
    
    console.log('Buy buttons initialized:', buyButtons.length, 'buttons');
}

// Add ripple effect to buttons
function addRippleEffect(button, event) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    button.appendChild(ripple);
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    
    setTimeout(() => ripple.remove(), 600);
}

// Modal Setup (for future use)
function setupModal() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;
    
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    console.log('Modal handlers set up');
}

// Badge Animation
function animateBadges() {
    const badges = document.querySelectorAll('.badge');
    badges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.2}s`;
    });
    console.log('Badge animations initialized');
}

// Number Animation
function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                
                const text = entry.target.textContent;
                const number = parseInt(text.replace(/\\D/g, ''));
                
                if (!isNaN(number)) {
                    animateValue(entry.target, 0, number, 2000);
                }
            }
        });
    }, observerOptions);
    
    numbers.forEach(number => observer.observe(number));
    console.log('Number animations initialized');
}

// Animate number values
function animateValue(element, start, end, duration) {
    const startTimestamp = Date.now();
    const originalText = element.textContent;
    
    const step = () => {
        const timestamp = Date.now();
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * (end - start) + start);
        
        const formattedNumber = current.toLocaleString();
        element.textContent = originalText.replace(/[\\d,]+/, formattedNumber);
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    
    requestAnimationFrame(step);
}

// ===========================================
// ANALYTICS & TRACKING
// ===========================================

// Track page view
function trackPageView() {
    if (window.CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
        gtag('config', window.CONFIG.google.analytics.measurementId, {
            page_title: document.title,
            page_location: window.location.href
        });
    }
    
    if (window.CONFIG.features.enableAdsTracking && typeof fbq !== 'undefined') {
        fbq('track', 'PageView');
    }
}

// Track user engagement
function trackEngagement(action, element) {
    if (window.CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: 'engagement',
            event_label: element
        });
    }
    
    console.log('Engagement tracked:', action, element);
}

// ===========================================
// ERROR HANDLING
// ===========================================

// Global error handler
window.addEventListener('error', function(event) {
    console.error('JavaScript Error:', event.error);
    
    if (window.CONFIG.features.debugMode) {
        // In debug mode, show more details
        console.log('Error details:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
        });
    }
    
    // Track error in analytics (optional)
    if (window.CONFIG.features.enableAnalytics && typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.message,
            fatal: false
        });
    }
});

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// ===========================================
// INITIALIZATION CHECK
// ===========================================

// Ensure everything is loaded properly
window.addEventListener('load', function() {
    console.log('Page fully loaded');
    
    // Track page view
    trackPageView();
    
    // Add any final initialization code here
    if (window.CONFIG.features.debugMode) {
        console.log('Debug mode enabled');
        console.log('Current configuration:', window.CONFIG);
    }
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCountdown,
        setupBuyButtons,
        trackEngagement
    };
}

console.log('Main JavaScript loaded successfully');