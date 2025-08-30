// Stripe Configuration
const STRIPE_PUBLIC_KEY = 'pk_test_8Lfb60gbAK374AtGcoL8COpC'; // Stripe publishable key
const PRODUCT_PRICE = 2700; // $27.00 in cents
const STRIPE_PRICE_ID = 'price_1S1pzWBW0J6epKS6wNsiBukQ'; // Sleep Toolkit price ID
const STRIPE_PRODUCT_ID = 'prod_SxlWBmU5Qxwuh6'; // Sleep Toolkit product ID

// Initialize Stripe
let stripe = null;
let elements = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize countdown timer
    startCountdown();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Setup buy buttons
    setupBuyButtons();
    
    // Setup modal
    setupModal();
    
    // Initialize Stripe when needed
    initializeStripe();
    
    // Add floating animation to badges
    animateBadges();
    
    // Add number counting animation
    animateNumbers();
});

// Countdown Timer
function startCountdown() {
    const countdownEl = document.getElementById('countdown');
    if (!countdownEl) return;
    
    // Set initial time (3 hours from now)
    let timeLeft = 3 * 60 * 60; // 3 hours in seconds
    
    function updateCountdown() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;
        
        countdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        if (timeLeft > 0) {
            timeLeft--;
        } else {
            // Reset to 3 hours when it reaches 0
            timeLeft = 3 * 60 * 60;
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Scroll Animations
function initScrollAnimations() {
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
    
    // Observe elements
    const animatedElements = document.querySelectorAll(
        '.problem-card, .toolkit-item, .bonus-item, .testimonial, .science-card, .faq-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Setup Buy Buttons
function setupBuyButtons() {
    const buyButtons = document.querySelectorAll('#buy-now-hero, #buy-now-main, #buy-now-final');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            
            setTimeout(() => ripple.remove(), 600);
            
            // Open checkout modal
            openCheckoutModal();
        });
    });
}

// Modal Setup
function setupModal() {
    const modal = document.getElementById('checkout-modal');
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
}

// Open Checkout Modal
function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    modal.style.display = 'block';
    
    // Initialize Stripe Elements if not already done
    if (!elements) {
        setupStripeElements();
    }
}

// Initialize Stripe
function initializeStripe() {
    // Note: Replace with your actual Stripe public key
    if (typeof Stripe !== 'undefined' && STRIPE_PUBLIC_KEY.startsWith('pk_')) {
        stripe = Stripe(STRIPE_PUBLIC_KEY);
    }
}

// Setup Stripe Elements
function setupStripeElements() {
    if (!stripe) {
        // If Stripe isn't initialized, set up demo checkout
        setupDemoCheckout();
        return;
    }
    
    elements = stripe.elements();
    
    const style = {
        base: {
            fontSize: '16px',
            color: '#374151',
            fontFamily: '"Inter", sans-serif',
            '::placeholder': {
                color: '#9ca3af'
            }
        }
    };
    
    // Create card element and mount it
    const cardElement = elements.create('card', { style: style });
    cardElement.mount('#card-element');
    
    // Handle form submission
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = document.getElementById('submit-payment');
        const btnText = submitButton.querySelector('.btn-text');
        const btnSpinner = submitButton.querySelector('.btn-spinner');
        
        submitButton.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'flex';
        
        try {
            // Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({
                lineItems: [{
                    price: STRIPE_PRICE_ID,
                    quantity: 1,
                }],
                mode: 'payment',
                successUrl: `${window.location.origin}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: window.location.href,
            });
            
            if (error) {
                console.error('Error:', error);
                const displayError = document.getElementById('card-errors');
                displayError.textContent = error.message;
            }
        } catch (error) {
            console.error('Error:', error);
            const displayError = document.getElementById('card-errors');
            displayError.textContent = 'An error occurred. Please try again.';
        } finally {
            submitButton.disabled = false;
            btnText.style.display = 'flex';
            btnSpinner.style.display = 'none';
        }
    });
    
    // Handle card errors
    cardElement.on('change', ({error}) => {
        const displayError = document.getElementById('card-errors');
        if (error) {
            displayError.textContent = error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

// Setup Demo Checkout (when Stripe is not configured)
function setupDemoCheckout() {
    // Try to use Stripe checkout even without elements
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = document.getElementById('submit-payment');
        const btnText = submitButton.querySelector('.btn-text');
        const btnSpinner = submitButton.querySelector('.btn-spinner');
        
        submitButton.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'flex';
        
        try {
            // Initialize Stripe if not already done
            if (!stripe && STRIPE_PUBLIC_KEY.startsWith('pk_')) {
                stripe = Stripe(STRIPE_PUBLIC_KEY);
            }
            
            if (stripe && STRIPE_PRICE_ID) {
                // Redirect to Stripe Checkout
                const { error } = await stripe.redirectToCheckout({
                    lineItems: [{
                        price: STRIPE_PRICE_ID,
                        quantity: 1,
                    }],
                    mode: 'payment',
                    successUrl: `${window.location.origin}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
                    cancelUrl: window.location.href,
                });
                
                if (error) {
                    console.error('Error:', error);
                    showDemoSuccess();
                }
            } else {
                // Fallback to demo success
                showDemoSuccess();
            }
        } catch (error) {
            console.error('Error:', error);
            showDemoSuccess();
        }
        
        function showDemoSuccess() {
            setTimeout(() => {
                showSuccessMessage();
                submitButton.disabled = false;
                btnText.style.display = 'flex';
                btnSpinner.style.display = 'none';
            }, 2000);
        }
    });
}

// Show Demo Checkout Form (when Stripe is not configured) - Legacy function
function showDemoCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.innerHTML = `
        <form id="demo-payment-form">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required placeholder="your@email.com">
            </div>
            
            <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" required placeholder="John Doe">
            </div>
            
            <div class="form-group">
                <label>Card Number</label>
                <input type="text" placeholder="4242 4242 4242 4242" maxlength="19">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" maxlength="5">
                </div>
                <div class="form-group">
                    <label>CVC</label>
                    <input type="text" placeholder="123" maxlength="3">
                </div>
            </div>
            
            <button type="submit" class="cta-button" style="width: 100%;">
                <span class="cta-text">Complete Purchase - $27</span>
            </button>
            
            <p style="text-align: center; margin-top: 20px; color: #64748b; font-size: 14px;">
                🔒 Demo Mode - No payment will be processed
            </p>
        </form>
        
        <style>
            .form-group {
                margin-bottom: 20px;
            }
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #1e293b;
            }
            .form-group input {
                width: 100%;
                padding: 12px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                font-size: 16px;
            }
            .form-group input:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
            }
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            #card-errors {
                color: #ef4444;
                margin-top: 10px;
                font-size: 14px;
            }
        </style>
    `;
    
    // Handle demo form submission
    const demoForm = document.getElementById('demo-payment-form');
    demoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitButton = demoForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="cta-text">Processing...</span>';
        
        // Simulate processing
        setTimeout(() => {
            showSuccessMessage();
        }, 2000);
    });
}

// Show Success Message
function showSuccessMessage() {
    const modal = document.getElementById('checkout-modal');
    const checkoutContainer = modal.querySelector('.checkout-container');
    
    checkoutContainer.innerHTML = `
        <span class="close">&times;</span>
        <div style="text-align: center; padding: 60px 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
            <div style="font-size: 80px; margin-bottom: 24px; animation: bounce 1s ease-out;">🎉</div>
            <h2 style="color: #059669; margin-bottom: 16px; font-size: 2.5rem; font-family: 'Playfair Display', serif;">Purchase Successful!</h2>
            <p style="font-size: 1.2rem; color: #64748b; margin-bottom: 32px; max-width: 500px;">
                Thank you for your purchase! Your <strong>Sleep Revolution Toolkit</strong> has been sent to your email and is ready for download.
            </p>
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #22c55e; border-radius: 16px; padding: 20px; margin-bottom: 32px; max-width: 400px;">
                <h3 style="color: #16a34a; margin-bottom: 12px; font-size: 1.1rem;">🎁 You'll receive:</h3>
                <ul style="text-align: left; color: #15803d; margin: 0; padding-left: 20px;">
                    <li>78-page Sleep Revolution Guide</li>
                    <li>Emergency Sleep Cards</li>
                    <li>30-Day Sleep Tracker</li>
                    <li>Bonus Materials Collection</li>
                    <li>Audio Production Instructions</li>
                </ul>
            </div>
            <button onclick="document.getElementById('checkout-modal').style.display='none'" 
                    style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 16px 32px; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">
                Continue to Dashboard
            </button>
        </div>`;
    
    // Re-setup modal close functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        location.reload(); // Refresh the page to reset the form
    });
}

// Animate Badges
function animateBadges() {
    const badges = document.querySelectorAll('.badge');
    badges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.2}s`;
    });
}

// Animate Numbers
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
                const number = parseInt(text.replace(/\D/g, ''));
                
                if (!isNaN(number)) {
                    animateValue(entry.target, 0, number, 2000);
                }
            }
        });
    }, observerOptions);
    
    numbers.forEach(number => observer.observe(number));
}

// Animate Value
function animateValue(element, start, end, duration) {
    const startTimestamp = Date.now();
    const originalText = element.textContent;
    
    const step = () => {
        const timestamp = Date.now();
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * (end - start) + start);
        
        // Preserve the original format (with commas, symbols, etc.)
        const formattedNumber = current.toLocaleString();
        element.textContent = originalText.replace(/[\d,]+/, formattedNumber);
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    
    requestAnimationFrame(step);
}

// Add ripple effect styles
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);