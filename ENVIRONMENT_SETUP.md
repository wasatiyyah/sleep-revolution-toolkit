# 🔐 Environment Setup Guide
**Sleep Toolkit Website - API Keys & Configuration**

## 📋 Overview
This document explains how to configure all API keys, secrets, and environment variables for the Sleep Toolkit website.

## 🚨 **SECURITY WARNING**
- **NEVER commit `.env` files to version control**
- **Keep all API keys and secrets private**
- **Use different keys for development and production**
- **Rotate keys regularly for security**

---

## 🔧 Quick Setup

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Fill in Your API Keys
Edit the `.env` file with your actual API keys and secrets.

### 3. Secure the File
```bash
chmod 600 .env  # Restrict file permissions
```

---

## 🎯 Required API Keys & Setup Instructions

### 🟢 **STRIPE** (Required for payments)
```env
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_your_key_here
STRIPE_SECRET_KEY_TEST=sk_test_your_key_here
```

**Setup Steps:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy your **Test** keys for development
4. For production, get your **Live** keys
5. Enable **Client-only integration** in Dashboard settings

### 🟡 **GOOGLE ANALYTICS** (Recommended)
```env
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Setup Steps:**
1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new **GA4 Property**
3. Get your **Measurement ID** (starts with G-)
4. Add your website domain

### 🟡 **GOOGLE TAG MANAGER** (Recommended)
```env
GTM_CONTAINER_ID=GTM-XXXXXXX
```

**Setup Steps:**
1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Create a new **Container**
3. Copy the **Container ID** (starts with GTM-)
4. Install the GTM code on your website

### 🟡 **GOOGLE ADS** (For conversion tracking)
```env
GOOGLE_ADS_CUSTOMER_ID=123-456-7890
GOOGLE_ADS_CONVERSION_ID=AW-123456789
GOOGLE_ADS_CONVERSION_LABEL=abcdef123456
```

**Setup Steps:**
1. Go to [Google Ads](https://ads.google.com)
2. Create **Conversion Actions**
3. Get your **Customer ID** and **Conversion details**
4. Set up conversion tracking on purchase completion

### 🟡 **FACEBOOK PIXEL** (For Facebook Ads)
```env
FACEBOOK_PIXEL_ID=123456789012345
```

**Setup Steps:**
1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Create a new **Pixel**
3. Copy the **Pixel ID**
4. Add to your website for tracking

### 🟡 **GOOGLE SEARCH CONSOLE** (For SEO)
```env
SEARCH_CONSOLE_SITE_URL=https://yourdomain.com
```

**Setup Steps:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your **website property**
3. Verify ownership via HTML meta tag
4. Submit your sitemap

---

## 📧 Email Configuration (Optional)

### **SMTP Settings** (for order confirmations)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Sleep Toolkit Support
```

**Gmail App Password Setup:**
1. Enable **2-Factor Authentication** on your Google account
2. Go to **Google Account Settings > Security**
3. Generate an **App Password** for "Mail"
4. Use this password (not your regular password)

---

## 🌍 Environment-Specific Configuration

### **Development (.env)**
- Use **test/sandbox** keys
- Enable **debug mode**
- Use **localhost** URLs

### **Production (.env.production)**
- Use **live/production** keys
- Disable **debug mode**
- Use **production** URLs

---

## 🔒 Security Best Practices

### 1. **File Permissions**
```bash
chmod 600 .env                    # Owner read/write only
chmod 600 .env.production         # Owner read/write only
```

### 2. **Git Security**
```bash
# Verify .env is ignored
git status
# Should NOT show .env files

# Check what's being tracked
git ls-files | grep -E '\.env'
# Should return nothing
```

### 3. **Key Rotation Schedule**
- **Monthly:** Rotate API keys for critical services
- **Quarterly:** Update webhook secrets
- **Immediately:** If any key is compromised

### 4. **Access Control**
- Only give team members access to keys they need
- Use separate keys for different environments
- Monitor key usage in service dashboards

---

## 📊 Analytics & Tracking Setup

### **Google Analytics 4 Events to Track:**
- `page_view` - Automatic
- `add_to_cart` - Button clicks
- `begin_checkout` - Checkout initiation
- `purchase` - Successful payment
- `scroll` - Page engagement

### **Facebook Pixel Events to Track:**
- `PageView` - Automatic
- `ViewContent` - Product page views
- `AddToCart` - Buy button clicks
- `InitiateCheckout` - Checkout start
- `Purchase` - Successful payment

### **Google Ads Conversion Events:**
- **Purchase Conversion** - When payment is completed
- **Add to Cart** - When user clicks buy button
- **Page View** - For remarketing audiences

---

## 🚀 Deployment Instructions

### **Vercel Deployment**
```bash
# Set environment variables in Vercel dashboard
vercel env add STRIPE_PUBLISHABLE_KEY_LIVE
vercel env add GA4_MEASUREMENT_ID
vercel env add FACEBOOK_PIXEL_ID

# Or via CLI
vercel env add production
```

### **Other Platforms**
- **Netlify:** Use Netlify dashboard or `netlify.toml`
- **AWS:** Use Parameter Store or Secrets Manager
- **DigitalOcean:** Use App Platform environment variables

---

## 🧪 Testing Your Setup

### 1. **Test Stripe Integration**
```javascript
// Check if Stripe is loaded
console.log('Stripe loaded:', typeof Stripe !== 'undefined');

// Test payment link
window.open(CONFIG.stripe.paymentLink);
```

### 2. **Test Analytics**
```javascript
// Check if GA4 is loaded
console.log('GA4 loaded:', typeof gtag !== 'undefined');

// Check if Facebook Pixel is loaded  
console.log('FB Pixel loaded:', typeof fbq !== 'undefined');
```

### 3. **Test Configuration**
```javascript
// Check configuration
console.log('Config loaded:', window.CONFIG);
console.log('Environment:', window.CONFIG.environment);
```

---

## 🆘 Troubleshooting

### **Common Issues:**

#### Stripe Errors
- ❌ "Invalid API Key" → Check key format (pk_test_ or pk_live_)
- ❌ "Client-only integration not enabled" → Enable in Stripe Dashboard
- ❌ "Invalid request" → Check product/price IDs

#### Analytics Not Working
- ❌ No data in GA4 → Check Measurement ID format
- ❌ GTM not loading → Verify Container ID
- ❌ Facebook Pixel errors → Check Pixel ID format

#### Environment Issues
- ❌ Config not loading → Check .env file exists
- ❌ Values undefined → Check spelling in .env
- ❌ CORS errors → Check domain whitelist

---

## 📞 Support Resources

### **API Documentation:**
- [Stripe API Docs](https://stripe.com/docs/api)
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Facebook Pixel](https://developers.facebook.com/docs/facebook-pixel)

### **Dashboard Links:**
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Google Analytics](https://analytics.google.com)
- [Facebook Events Manager](https://business.facebook.com/events_manager)
- [Google Tag Manager](https://tagmanager.google.com)

---

## ✅ Environment Checklist

**Before going live, verify:**

- [ ] All API keys are valid and active
- [ ] Production keys are different from test keys  
- [ ] .env files are not committed to git
- [ ] File permissions are restricted (chmod 600)
- [ ] Analytics tracking is working
- [ ] Payment flow is tested end-to-end
- [ ] Conversion tracking is set up
- [ ] Email notifications are configured
- [ ] Error monitoring is active
- [ ] Performance monitoring is enabled

---

**🔐 Remember: Security is paramount. When in doubt, generate new keys!**