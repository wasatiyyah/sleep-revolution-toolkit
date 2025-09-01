#!/usr/bin/env node

/**
 * Create Google Ads Tags Only
 * This script creates Google Ads tags using existing triggers
 */

// Load environment variables
require('dotenv').config();

const GTMApiService = require('../lib/gtm-api-service');

async function createGoogleAdsTagsOnly() {
    console.log('🎯 Creating Google Ads Tags in GTM...\n');

    try {
        const gtmService = new GTMApiService();
        
        // Get existing triggers
        console.log('📋 Getting existing triggers...');
        const triggers = await gtmService.listTriggers();
        
        let allPagesTriggerId = null;
        let thankYouTriggerId = null;
        
        // Find existing triggers
        triggers.forEach(trigger => {
            console.log(`   - ${trigger.name} (${trigger.type})`);
            if (trigger.name === 'All Pages') {
                allPagesTriggerId = trigger.path.split('/').pop();
            }
        });
        
        if (!allPagesTriggerId) {
            console.log('❌ All Pages trigger not found. Creating it...');
            const allPagesTrigger = await gtmService.createTrigger({
                name: 'All Pages',
                type: 'pageview'
            });
            allPagesTriggerId = allPagesTrigger.path.split('/').pop();
            console.log('✅ Created All Pages Trigger');
        } else {
            console.log('✅ Found existing All Pages Trigger');
        }
        
        // Create Thank You Page trigger if it doesn't exist
        const thankYouTriggerExists = triggers.find(t => t.name === 'Thank You Page');
        if (!thankYouTriggerExists) {
            console.log('\n🔫 Creating Thank You Page Trigger...');
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
            thankYouTriggerId = thankYouTrigger.path.split('/').pop();
            console.log('✅ Created Thank You Page Trigger');
        } else {
            thankYouTriggerId = thankYouTriggerExists.path.split('/').pop();
            console.log('✅ Found existing Thank You Page Trigger');
        }
        
        // Create Google Ads Configuration Tag
        console.log('\n📊 Creating Google Ads Configuration Tag...');
        
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
        
        // Create Google Ads Conversion Tag
        console.log('\n💰 Creating Google Ads Conversion Tag...');
        
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
        
        // Create Transaction ID variable
        console.log('\n📊 Creating Transaction ID Variable...');
        
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
        
        // Create a simple conversion tag for immediate testing
        console.log('\n🎯 Creating Simple Conversion Tag...');
        
        const simpleConversionTag = await gtmService.createTag({
            name: 'Google Ads - Simple Conversion',
            type: 'html',
            parameter: [
                {
                    type: 'template',
                    key: 'html',
                    value: `<script>
  gtag('event', 'conversion', {
    'send_to': 'AW-17520411408',
    'value': 27.0,
    'currency': 'USD'
  });
</script>`
                }
            ],
            firingTriggerId: [thankYouTriggerId]
        });
        
        console.log('✅ Created Simple Conversion Tag:', simpleConversionTag.name);
        
        console.log('\n🎉 Google Ads Tags Created Successfully!');
        console.log('\n📋 Summary:');
        console.log('   1. Google Ads Configuration Tag - Fires on all pages');
        console.log('   2. Google Ads Conversion Tag - Fires on thank you page');
        console.log('   3. Simple Conversion Tag - Fires on thank you page (backup)');
        console.log('   4. Transaction ID Variable - For dynamic transaction IDs');
        
        console.log('\n🚀 Next Steps:');
        console.log('   1. Go to GTM and review the created tags');
        console.log('   2. Click "Preview" to test your setup');
        console.log('   3. Visit your website and complete a test purchase');
        console.log('   4. Check GTM Preview mode to see if tags fire');
        console.log('   5. Click "Submit" to publish your changes');
        console.log('   6. Check Google Ads for conversion tracking');
        
        console.log('\n🔧 To Fix "Misconfigured" Error:');
        console.log('   1. Make sure tags are published in GTM');
        console.log('   2. Test with a real purchase flow');
        console.log('   3. Check Google Ads conversion settings');
        console.log('   4. Verify conversion ID: AW-17520411408');
        console.log('   5. Wait 24-48 hours for Google Ads to update');
        
    } catch (error) {
        console.error('❌ Failed to create Google Ads tags:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check if GTM API is working');
        console.log('   2. Verify service account permissions');
        console.log('   3. Check if workspace exists');
        console.log('   4. Try creating tags manually in GTM interface');
    }
}

// Run the script
if (require.main === module) {
    createGoogleAdsTagsOnly()
        .then(() => {
            console.log('\n✨ Google Ads tag creation completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Failed:', error);
            process.exit(1);
        });
}

module.exports = { createGoogleAdsTagsOnly };
