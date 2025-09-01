# 🚀 Google Cloud Console & Tag Manager API Setup Steps

## 📋 Prerequisites
- Google Cloud project: `gen-lang-client-0334047914`
- Service account: `kingsmen@gen-lang-client-0334047914.iam.gserviceaccount.com`
- Service account key file: `gen-lang-client-0334047914-48fc2b352f1f.json`

## 🔧 Step 1: Enable Service Usage API (Required First)

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select project: `gen-lang-client-0334047914`

2. **Enable Service Usage API:**
   - Go to **APIs & Services** > **Library**
   - Search for "Service Usage API"
   - Click **Service Usage API**
   - Click **Enable**
   - Wait 2-3 minutes for activation

## 🏷️ Step 2: Enable Tag Manager API

1. **Go to APIs & Services Library:**
   - Navigate to **APIs & Services** > **Library**

2. **Search and Enable Tag Manager API:**
   - Search for "Tag Manager API"
   - Click **Tag Manager API**
   - Click **Enable**

## 🔐 Step 3: Configure Service Account Permissions

1. **Go to IAM & Admin:**
   - Navigate to **IAM & Admin** > **IAM**

2. **Find Your Service Account:**
   - Look for: `kingsmen@gen-lang-client-0334047914.iam.gserviceaccount.com`

3. **Add Required Roles:**
   - Click the pencil (edit) icon
   - Click **Add another role**
   - Add these roles one by one:
     - **Tag Manager Account User**
     - **Tag Manager Container User**
     - **Tag Manager Container Developer**
     - **Tag Manager Container Admin**
     - **Service Usage Admin** (temporary, for API management)

4. **Save Changes**

## 🎯 Step 4: Get GTM Account Information

1. **Go to Google Tag Manager:**
   - Visit: https://tagmanager.google.com/

2. **Get Account ID:**
   - Look at the URL: `https://tagmanager.google.com/#/admin/accounts/ACCOUNT_ID`
   - Copy the `ACCOUNT_ID` number

3. **Get Container ID:**
   - In your container, look for the ID starting with `GTM-`
   - Copy this ID (e.g., `GTM-ABC123`)

4. **Get Workspace ID:**
   - Go to your container
   - Look at the URL: `https://tagmanager.google.com/#/admin/accounts/ACCOUNT_ID/containers/CONTAINER_ID/workspaces/WORKSPACE_ID`
   - Copy the `WORKSPACE_ID` number

## ⚙️ Step 5: Set Environment Variables

Once you have the IDs, set these environment variables:

```bash
# Google Tag Manager API Configuration
export GTM_API_ENABLED=true
export GTM_ACCOUNT_ID=6310758133
export GTM_CONTAINER_ID=GTM-TPZ2XNWV
export GTM_WORKSPACE_ID=2
```

## 🧪 Step 6: Test the Setup

After setting the environment variables, test with:

```bash
# Test basic setup
node scripts/setup-gtm-api.js

# Run examples
node examples/gtm-api-example.js
```

## 🔍 Troubleshooting

### "Service Usage API not enabled"
- Complete Step 1 above
- Wait 2-3 minutes after enabling

### "Permission denied"
- Check service account has required roles
- Ensure roles are properly assigned

### "Account not found"
- Verify account ID is correct
- Check if you have access to the account

### "Container not found"
- Verify container ID is correct
- Ensure container exists and is accessible

## 📱 Alternative: Use Web Console

If you prefer to do everything through the web console:

1. **Go to Google Cloud Console**
2. **Enable APIs manually:**
   - Service Usage API
   - Tag Manager API
3. **Set up IAM permissions**
4. **Get GTM information from tagmanager.google.com**

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Service Usage API is enabled
- ✅ Tag Manager API is enabled
- ✅ Service account has proper permissions
- ✅ Environment variables are set
- ✅ Setup script runs without errors
- ✅ You can list GTM accounts/containers

---

**Need help?** Run the setup script and check the error messages for specific guidance.
