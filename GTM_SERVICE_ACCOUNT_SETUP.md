# 🔐 Adding Service Account to Google Tag Manager

## 📋 Current Status
- ✅ Google Cloud APIs enabled
- ✅ Environment variables configured
- ✅ Service account authenticated
- ❌ Service account needs GTM access

## 🎯 Final Step: Add Service Account to GTM

Your service account needs to be explicitly added to your Google Tag Manager account with proper permissions.

### Step-by-Step Instructions:

#### 1. Access Google Tag Manager
1. Go to: https://tagmanager.google.com/
2. Sign in with your Google account
3. Select your account: **Account ID: 6310758133**

#### 2. Navigate to User Management
1. Click on the **"Admin"** tab at the top
2. In the left sidebar, click **"User Management"**
3. You should see a list of current users

#### 3. Add Service Account
1. Click **"Add user"** button
2. In the email field, enter: `kingsmen@gen-lang-client-0334047914.iam.gserviceaccount.com`
3. Set permissions as follows:

#### 4. Set Permissions
**Account Permissions:**
- ✅ **Read**
- ✅ **Write**

**Container Permissions:**
- ✅ **Read**
- ✅ **Write**
- ✅ **Delete**

**Container Version Permissions:**
- ✅ **Read**
- ✅ **Write**
- ✅ **Delete**

#### 5. Complete Setup
1. Click **"Invite"** button
2. Wait 2-3 minutes for permissions to propagate
3. The service account will appear in your user list

## 🧪 Test the Setup

After adding the service account, test it with:

```bash
# Test service account access
node scripts/add-service-account-to-gtm.js

# Test full GTM API functionality
node scripts/get-gtm-info.js

# Run examples
node examples/gtm-api-example.js
```

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Service account appears in GTM User Management
- ✅ No "permission denied" errors
- ✅ Can access account and container information
- ✅ Can list workspaces, tags, triggers, and variables

## 🔧 Troubleshooting

### "User not found" error
- Double-check the email address
- Ensure you're in the correct GTM account
- Try refreshing the page

### "Permission denied" after adding user
- Wait 2-3 minutes for permissions to propagate
- Check that all permissions are set correctly
- Try logging out and back in

### "Account not found" error
- Verify you're in the correct GTM account (ID: 6310758133)
- Check that the service account has the right permissions

## 📚 What You Can Do After Setup

Once the service account is properly configured, you can:

### Create Tags Programmatically
```javascript
const gtmService = new GTMApiService();
await gtmService.createTag({
    name: 'GA4 Page View',
    type: 'gtag',
    parameter: [
        {
            type: 'template',
            key: 'trackingId',
            value: '{{GA4_MEASUREMENT_ID}}'
        }
    ],
    firingTriggerId: ['page_view_trigger']
});
```

### Create Triggers
```javascript
await gtmService.createTrigger({
    name: 'Page View',
    type: 'pageview'
});
```

### Create Variables
```javascript
await gtmService.createVariable({
    name: 'GA4 Measurement ID',
    type: 'c',
    parameter: [
        {
            type: 'template',
            key: 'value',
            value: 'G-XXXXXXXXXX'
        }
    ]
});
```

### Publish Changes
```javascript
await gtmService.createVersion('API Generated Version');
```

## 🔒 Security Notes

- The service account has minimal required permissions
- All API access is logged and auditable
- Credentials are stored securely and not committed to git
- Access can be revoked at any time through GTM User Management

---

**Need help?** Run the test scripts and check the error messages for specific guidance.
