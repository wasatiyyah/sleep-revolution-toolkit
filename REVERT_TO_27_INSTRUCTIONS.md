# 🔄 Instructions to Revert Back to $27 Production Price

## Current Status: TEMPORARY $1 TEST PRICING ACTIVE

⚠️ **IMPORTANT:** The website is currently set to $1 for testing purposes only.

## Original Production Values:

### **$27 Payment Link (Original):**
```
https://buy.stripe.com/bJe3cufK35fC1RT5yN73G02
```

### **$27 Price Details:**
- **Product ID:** prod_Sy3rkAgnvLu8ZU
- **$27 Price ID:** price_1S27jgBW0J6epKS6JmSXThvX
- **$27 Payment Link ID:** plink_1S27l2BW0J6epKS6u0P33FUX

### **Current Test Values (TO BE REMOVED):**
- **$1 Price ID:** price_1S28CWBW0J6epKS6twOeqoxb
- **$1 Payment Link:** https://buy.stripe.com/28E5kC8hBfUgdAB6CR73G03
- **$1 Payment Link ID:** plink_1S28CjBW0J6epKS6XiiT3r43

## How to Revert to $27:

### 1. Update index.html:
```javascript
// Change this line:
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/28E5kC8hBfUgdAB6CR73G03'; // TEST $1

// Back to this:
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/bJe3cufK35fC1RT5yN73G02'; // LIVE $27
```

### 2. Update Price Displays:
- Change "Just $1 (TEST PRICE - Save $852)" → "Just $27 (Save $826)"
- Change "$1 (TEST)" → "$27" 
- Change final-price "$1" → "$27"

### 3. Deploy:
```bash
git add index.html
git commit -m "🔄 REVERT: Back to $27 production pricing"  
git push
vercel --prod
```

## Quick Revert Command:
The assistant can run: "revert to $27" and it will make these changes automatically.

---

**Test completed?** Time to revert to production pricing!