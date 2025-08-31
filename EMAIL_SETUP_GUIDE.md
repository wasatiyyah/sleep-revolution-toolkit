# 📧 Email Setup Guide - Resend Integration

## Step 1: Create Resend Account

1. Go to **https://resend.com**
2. Sign up with your email
3. Verify your email address
4. Login to your Resend dashboard

## Step 2: Add Your Domain

1. In Resend dashboard, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter: `sleeprevolutiontoolkit.com`
4. Add the DNS records to your domain provider:
   - **TXT record** for verification
   - **MX records** for email delivery
   - **DKIM records** for authentication

## Step 3: Get Your API Key

1. Go to **"API Keys"** in Resend
2. Click **"Create API Key"**
3. Name it: `Sleep Toolkit Production`
4. Copy the API key (starts with `re_`)

## Step 4: Add API Key to Vercel

Run this command with your actual API key:

```bash
echo "re_your_actual_resend_api_key" | vercel env add RESEND_API_KEY production
```

## Step 5: Deploy Updated Code

```bash
git add -A
git commit -m "Add email delivery system with Resend integration"
git push
vercel --prod
```

## Step 6: Test Email Flow

After deployment, make a test purchase to verify emails are sent automatically.

---

## 🎯 What Happens After Setup:

✅ **Customer purchases** → Gets Stripe receipt + Your custom download email  
✅ **Professional email** with all download links  
✅ **Immediate delivery** (no manual work required)  
✅ **Branded experience** from orders@sleeprevolutiontoolkit.com

## Alternative: Gmail SMTP (Quick Setup)

If you want to use Gmail instead:

1. Enable 2-factor authentication in Gmail
2. Generate an App Password
3. Add these environment variables:
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_USER=your-gmail@gmail.com`
   - `EMAIL_PASSWORD=your-app-password`

Let me know which option you prefer!