// Google Tag Manager Setup Script
// Run this locally after installing dependencies:
// npm install googleapis google-auth-library

const {google} = require('googleapis');
const tagmanager = google.tagmanager('v2');

async function setupGTM() {
  // You'll need to set up authentication first
  // 1. Go to Google Cloud Console
  // 2. Create a service account
  // 3. Download the JSON key file
  // 4. Set environment variable: GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json
  
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/tagmanager.edit.containers']
  });
  
  const authClient = await auth.getClient();
  google.options({auth: authClient});
  
  // Your Google Ads Account ID
  const GOOGLE_ADS_ID = 'AW-17520411408';
  
  try {
    // Step 1: Create GTM Account (if needed)
    const account = await tagmanager.accounts.create({
      requestBody: {
        name: 'Sleep Revolution Toolkit',
        shareData: false
      }
    });
    
    const accountId = account.data.accountId;
    console.log('Created GTM Account:', accountId);
    
    // Step 2: Create Container
    const container = await tagmanager.accounts.containers.create({
      parent: `accounts/${accountId}`,
      requestBody: {
        name: 'sleeprevolutiontoolkit.com',
        usageContext: ['web']
      }
    });
    
    const containerId = container.data.containerId;
    console.log('Created Container:', containerId);
    
    // Step 3: Create Google Ads Conversion Tag
    const conversionTag = await tagmanager.accounts.containers.workspaces.tags.create({
      parent: `accounts/${accountId}/containers/${containerId}/workspaces/1`,
      requestBody: {
        name: 'Google Ads Conversion - Purchase',
        type: 'awct',
        parameter: [
          {
            key: 'conversionId',
            type: 'template',
            value: GOOGLE_ADS_ID.replace('AW-', '')
          },
          {
            key: 'conversionLabel',
            type: 'template',
            value: 'purchase'
          },
          {
            key: 'conversionValue',
            type: 'template',
            value: '27.00'
          },
          {
            key: 'currencyCode',
            type: 'template',
            value: 'USD'
          },
          {
            key: 'orderId',
            type: 'template',
            value: '{{Session ID}}'
          }
        ],
        firingTriggerId: ['purchase_trigger']
      }
    });
    
    // Step 4: Create Purchase Trigger
    const purchaseTrigger = await tagmanager.accounts.containers.workspaces.triggers.create({
      parent: `accounts/${accountId}/containers/${containerId}/workspaces/1`,
      requestBody: {
        name: 'Purchase Confirmation Page',
        type: 'pageview',
        filter: [{
          type: 'contains',
          parameter: [{
            key: 'arg0',
            type: 'template',
            value: '{{Page URL}}'
          }, {
            key: 'arg1',
            type: 'template',
            value: 'thank-you.html'
          }]
        }]
      }
    });
    
    // Step 5: Create Google Ads Remarketing Tag
    const remarketingTag = await tagmanager.accounts.containers.workspaces.tags.create({
      parent: `accounts/${accountId}/containers/${containerId}/workspaces/1`,
      requestBody: {
        name: 'Google Ads Remarketing',
        type: 'sp',
        parameter: [
          {
            key: 'conversionId',
            type: 'template',
            value: GOOGLE_ADS_ID.replace('AW-', '')
          }
        ],
        firingTriggerId: ['all_pages']
      }
    });
    
    // Step 6: Publish the container
    const version = await tagmanager.accounts.containers.workspaces.createVersion({
      parent: `accounts/${accountId}/containers/${containerId}/workspaces/1`,
      requestBody: {
        name: 'Initial Setup',
        notes: 'Google Ads conversion tracking setup'
      }
    });
    
    await tagmanager.accounts.containers.versions.publish({
      path: version.data.containerVersion.path
    });
    
    console.log('\n✅ GTM Setup Complete!');
    console.log(`\nAdd this code to your website <head>:`);
    console.log(`
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-${containerId}');</script>
<!-- End Google Tag Manager -->
    `);
    
    console.log(`\nAdd this code immediately after <body>:`);
    console.log(`
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-${containerId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
    `);
    
  } catch (error) {
    console.error('Error setting up GTM:', error);
  }
}

// Run the setup
setupGTM();