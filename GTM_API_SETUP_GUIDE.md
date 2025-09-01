# Google Tag Manager API Setup Guide

This guide will help you set up Google Tag Manager API access for your website using the Google Cloud service account.

## 🚀 Quick Start

### 1. Enable Google Tag Manager API

First, enable the Tag Manager API in your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `gen-lang-client-0334047914`
3. Go to **APIs & Services** > **Library**
4. Search for "Tag Manager API"
5. Click on **Tag Manager API** and click **Enable**

### 2. Set Environment Variables

Add these environment variables to your `.env` file:

```bash
# Google Tag Manager API Configuration
GTM_API_ENABLED=true
GTM_ACCOUNT_ID=your_account_id_here
GTM_CONTAINER_ID=GTM-XXXXXXX
GTM_WORKSPACE_ID=your_workspace_id_here
GTM_API_KEY=your_api_key_here
```

### 3. Get Your GTM Account ID

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Look at the URL: `https://tagmanager.google.com/#/admin/accounts/ACCOUNT_ID`
3. Copy the `ACCOUNT_ID` number

### 4. Get Your Container ID

1. In GTM, look for your container
2. The container ID starts with `GTM-` (e.g., `GTM-ABC123`)
3. Copy this ID

### 5. Get Your Workspace ID

1. In GTM, go to your container
2. Look at the URL: `https://tagmanager.google.com/#/admin/accounts/ACCOUNT_ID/containers/CONTAINER_ID/workspaces/WORKSPACE_ID`
3. Copy the `WORKSPACE_ID` number

## 🔧 Service Account Permissions

Your service account needs these permissions for GTM API access:

- **Tag Manager Account User** - Read access to accounts
- **Tag Manager Container User** - Read access to containers
- **Tag Manager Container Developer** - Edit access to containers
- **Tag Manager Container Admin** - Full access to containers

## 📋 Testing the Setup

Run the setup script to test your configuration:

```bash
node scripts/setup-gtm-api.js
```

## 🎯 What You Can Do

Once set up, you can:

### Create Tags
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
await gtmService.createVersion('My Custom Version');
```

## 🔍 Troubleshooting

### Common Issues

1. **"GTM API is not enabled"**
   - Enable Tag Manager API in Google Cloud Console

2. **"Permission denied"**
   - Check service account permissions
   - Ensure service account has GTM access

3. **"Account ID not found"**
   - Verify your GTM account ID
   - Check if you have access to the account

4. **"Container not found"**
   - Verify your container ID
   - Ensure container exists and is accessible

### Debug Steps

1. Check environment variables are set correctly
2. Verify service account key file exists
3. Test Google Cloud authentication
4. Check GTM API is enabled
5. Verify account/container permissions

## 📚 API Reference

### GTMApiService Methods

- `initialize()` - Initialize the service
- `testConnection()` - Test API connectivity
- `getAccount()` - Get account information
- `getContainer()` - Get container information
- `listWorkspaces()` - List all workspaces
- `listTags()` - List all tags
- `listTriggers()` - List all triggers
- `listVariables()` - List all variables
- `createTag(tagData)` - Create a new tag
- `createTrigger(triggerData)` - Create a new trigger
- `createVariable(variableData)` - Create a new variable
- `createVersion(name)` - Create a new version
- `getContainerSnippet()` - Get embedding code

## 🔒 Security Notes

- Never commit service account keys to version control
- Use environment variables for sensitive configuration
- Regularly rotate service account keys
- Monitor API usage and permissions

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your Google Cloud Console settings
3. Check GTM account permissions
4. Review service account permissions

---

**Need help?** Check the console output from the setup script for detailed error messages.
