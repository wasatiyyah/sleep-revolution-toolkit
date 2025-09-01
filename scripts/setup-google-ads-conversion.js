#!/usr/bin/env node

/**
 * Setup Google Ads Conversion Tracking in GTM
 * This script properly configures Google Ads conversion tracking
 */

// Load environment variables
require('dotenv').config();

const GTMApiService = require('../lib/gtm-api-service');

async function setupGoogleAdsConversion() {
    console.log('🎯 Setting up Google Ads Conversion Tracking in GTM...\n');

    try {
        const gtmService = new GTMApiService();
        
        // Step 1: Create All Pages trigger
        console.log('🔫 Step 1: Creating All Pages Trigger...');
        
        const allPagesTrigger = await gtmService.createTrigger({
            name: 'All Pages',
            type: 'pageview'
        });
        
        console.log('✅ Created All Pages Trigger:', allPagesTrigger.name);
        const allPagesTriggerId = allPagesTrigger.path.split('/').pop();
        
        // Step 2: Create Thank You Page trigger
        console.log('\n🔫 Step 2: Creating Thank You Page Trigger...');
        
        const thankYouTrigger = await gtmService.createTrigger({
            name: 'Thank You Page',
            type: 'pageview',
            filter: [
                {
                    type: 'contains',
                    parameter: [
                        {
                            type: 'template',
                            key: 'arg0',
                            value: '{{Page URL}}'
                        },
                        {
                            type: 'template',
                            key: 'arg1',
                            value: 'thank-you'
                        }
                    ]
                }
            ]
        });
        
        console.log('✅ Created Thank You Page Trigger:', thankYouTrigger.name);
        const thankYouTriggerId = thankYouTrigger.path.split('/').pop();
        
        // Step 3: Create Purchase Event trigger
        console.log('\n🔫 Step 3: Creating Purchase Event Trigger...');
        
        const purchaseTrigger = await gtmService.createTrigger({
            name: 'Purchase Event',
            type: 'custom',
            customEventFilter: [
                {
                    type: 'equals',
                    parameter: [
                        {
                            type: 'template',
                            key: 'arg0',
                            value: '{{_event}}'
                        },
                        {
                            type: 'template',
                            key: 'arg1',
                            value: 'purchase'
                        }
                    ]
                }
            ]
        });
        
        console.log('✅ Created Purchase Event Trigger:', purchaseTrigger.name);
        const purchaseTriggerId = purchaseTrigger.path.split('/').pop();
        
        // Step 4: Create Google Ads Configuration Tag (for all pages)
        console.log('\n📊 Step 4: Creating Google Ads Configuration Tag...');
        
        const googleAdsConfigTag = await gtmService.createTag({
            name: 'Google Ads - Configuration',
            type: 'html',
            parameter: [
                {
                    type: 'template',
                    key: 'html',
                    value: `<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17520411408"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-17520411408');
</script>`
                }
            ],
            firingTriggerId: [allPagesTriggerId]
        });
        
        console.log('✅ Created Google Ads Configuration Tag:', googleAdsConfigTag.name);
        
        // Step 5: Create Google Ads Conversion Tag (for thank you page)
        console.log('\n💰 Step 5: Creating Google Ads Conversion Tag...');
        
        const conversionTag = await gtmService.createTag({
            name: 'Google Ads - Conversion',
            type: 'html',
            parameter: [
                {
                    type: 'template',
                    key: 'html',
                    value: `<script>
  gtag('event', 'conversion', {
    'send_to': 'AW-17520411408',
    'value': 27.0,
    'currency': 'USD',
    'transaction_id': '{{Transaction ID}}'
  });
</script>`
                }
            ],
            firingTriggerId: [thankYouTriggerId]
        });
        
        console.log('✅ Created Google Ads Conversion Tag:', conversionTag.name);
        
        // Step 6: Create Transaction ID variable
        console.log('\n📊 Step 6: Creating Transaction ID Variable...');
        
        const transactionIdVariable = await gtmService.createVariable({
            name: 'Transaction ID',
            type: 'd',
            parameter: [
                {
                    type: 'template',
                    key: 'dataLayerVersion',
                    value: '2'
                },
                {
                    type: 'template',
                    key: 'name',
                    value: 'ecommerce.transaction_id'
                }
            ]
        });
        
        console.log('✅ Created Transaction ID Variable:', transactionIdVariable.name);
        
        // Step 7: Create a backup conversion tag using dataLayer event
        console.log('\n🔄 Step 7: Creating DataLayer Conversion Tag...');
        
        const dataLayerConversionTag = await gtmService.createTag({
            name: 'Google Ads - DataLayer Conversion',
            type: 'html',
            parameter: [
                {
                    type: 'template',
                    key: 'html',
                    value: `<script>
  gtag('event', 'conversion', {
    'send_to': 'AW-17520411408',
    'value': 27.0,
    'currency': 'USD',
    'transaction_id': '{{Transaction ID}}'
  });
</script>`
                }
            ],
            firingTriggerId: [purchaseTriggerId]
        });
        
        console.log('✅ Created DataLayer Conversion Tag:', dataLayerConversionTag.name);
        
        console.log('\n🎉 Google Ads Conversion Tracking Setup Complete!');
        console.log('\n📋 What was created:');
        console.log('   1. All Pages Trigger - Fires on every page');
        console.log('   2. Thank You Page Trigger - Fires on thank you page');
        console.log('   3. Purchase Event Trigger - Fires on purchase events');
        console.log('   4. Google Ads Configuration Tag - Sets up tracking on all pages');
        console.log('   5. Google Ads Conversion Tag - Tracks conversions on thank you page');
        console.log('   6. DataLayer Conversion Tag - Tracks conversions on purchase events');
        console.log('   7. Transaction ID Variable - Gets transaction ID from dataLayer');
        
        console.log('\n🚀 Next Steps:');
        console.log('   1. Go to GTM and review the created tags');
        console.log('   2. Click "Preview" to test your setup');
        console.log('   3. Visit your website and complete a test purchase');
        console.log('   4. Check GTM Preview mode to see if tags fire');
        console.log('   5. Click "Submit" to publish your changes');
        console.log('   6. Check Google Ads for conversion tracking');
        
        console.log('\n🔧 Troubleshooting:');
        console.log('   - Make sure your Google Ads conversion ID is correct: AW-17520411408');
        console.log('   - Check that the thank you page URL contains "thank-you"');
        console.log('   - Verify that purchase events are being pushed to dataLayer');
        console.log('   - Use GTM Preview mode to debug tag firing');
        
    } catch (error) {
        console.error('❌ Failed to setup Google Ads conversion:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check if GTM API is working');
        console.log('   2. Verify service account permissions');
        console.log('   3. Check if workspace exists');
        console.log('   4. Try creating tags manually in GTM interface');
    }
}

// Run the script
if (require.main === module) {
    setupGoogleAdsConversion()
        .then(() => {
            console.log('\n✨ Google Ads conversion setup completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Failed:', error);
            process.exit(1);
        });
}

module.exports = { setupGoogleAdsConversion };
