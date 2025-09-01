#!/usr/bin/env node

/**
 * Create Google Ads Tag in GTM (Simplified)
 * This script creates Google Ads tags step by step
 */

// Load environment variables
require('dotenv').config();

const GTMApiService = require('../lib/gtm-api-service');

async function createGoogleAdsTagSimple() {
    console.log('🎯 Creating Google Ads Tags in GTM (Step by Step)...\n');

    try {
        const gtmService = new GTMApiService();
        
        // Step 1: Create All Pages trigger first
        console.log('🔫 Step 1: Creating All Pages Trigger...');
        
        const allPagesTrigger = await gtmService.createTrigger({
            name: 'All Pages',
            type: 'pageview'
        });
        
        console.log('✅ Created All Pages Trigger:', allPagesTrigger.name);
        console.log('   Trigger ID:', allPagesTrigger.path.split('/').pop());
        
        // Step 2: Create Google Ads Configuration Tag
        console.log('\n📊 Step 2: Creating Google Ads Configuration Tag...');
        
        const googleAdsConfigTag = await gtmService.createTag({
            name: 'Google Ads - Configuration',
            type: 'gtag',
            parameter: [
                {
                    type: 'template',
                    key: 'trackingId',
                    value: 'AW-17520411408'
                },
                {
                    type: 'template',
                    key: 'sendPageView',
                    value: 'true'
                }
            ],
            firingTriggerId: [allPagesTrigger.path.split('/').pop()]
        });
        
        console.log('✅ Created Google Ads Configuration Tag:', googleAdsConfigTag.name);
        
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
        console.log('   Trigger ID:', purchaseTrigger.path.split('/').pop());
        
        // Step 4: Create Google Ads Conversion Tag
        console.log('\n💰 Step 4: Creating Google Ads Conversion Tag...');
        
        const conversionTag = await gtmService.createTag({
            name: 'Google Ads - Conversion Tracking',
            type: 'gtag',
            parameter: [
                {
                    type: 'template',
                    key: 'trackingId',
                    value: 'AW-17520411408'
                },
                {
                    type: 'template',
                    key: 'eventAction',
                    value: 'conversion'
                },
                {
                    type: 'template',
                    key: 'eventCategory',
                    value: 'purchase'
                },
                {
                    type: 'template',
                    key: 'eventLabel',
                    value: 'sleep-toolkit-purchase'
                },
                {
                    type: 'template',
                    key: 'value',
                    value: '27.0'
                },
                {
                    type: 'template',
                    key: 'currency',
                    value: 'USD'
                }
            ],
            firingTriggerId: [purchaseTrigger.path.split('/').pop()]
        });
        
        console.log('✅ Created Google Ads Conversion Tag:', conversionTag.name);
        
        // Step 5: Create a simple conversion tag for the thank you page
        console.log('\n🎯 Step 5: Creating Thank You Page Conversion Tag...');
        
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
        
        const thankYouConversionTag = await gtmService.createTag({
            name: 'Google Ads - Thank You Conversion',
            type: 'gtag',
            parameter: [
                {
                    type: 'template',
                    key: 'trackingId',
                    value: 'AW-17520411408'
                },
                {
                    type: 'template',
                    key: 'eventAction',
                    value: 'conversion'
                },
                {
                    type: 'template',
                    key: 'eventCategory',
                    value: 'purchase'
                },
                {
                    type: 'template',
                    key: 'eventLabel',
                    value: 'sleep-toolkit-thank-you'
                },
                {
                    type: 'template',
                    key: 'value',
                    value: '27.0'
                },
                {
                    type: 'template',
                    key: 'currency',
                    value: 'USD'
                }
            ],
            firingTriggerId: [thankYouTrigger.path.split('/').pop()]
        });
        
        console.log('✅ Created Thank You Conversion Tag:', thankYouConversionTag.name);
        
        console.log('\n🎉 Google Ads Tags Created Successfully!');
        console.log('\n📋 Summary of what was created:');
        console.log('   1. All Pages Trigger - Fires on every page view');
        console.log('   2. Google Ads Configuration Tag - Sets up tracking on all pages');
        console.log('   3. Purchase Event Trigger - Fires when purchase event occurs');
        console.log('   4. Google Ads Conversion Tag - Tracks conversions on purchase events');
        console.log('   5. Thank You Page Trigger - Fires on thank you page');
        console.log('   6. Thank You Conversion Tag - Tracks conversions on thank you page');
        
        console.log('\n🚀 Next Steps:');
        console.log('   1. Go to GTM and review the created tags');
        console.log('   2. Test the tags in Preview mode');
        console.log('   3. Publish the container when ready');
        console.log('   4. Monitor conversions in Google Ads');
        
        console.log('\n💡 This replaces the need for the Google Ads snippet on every page!');
        console.log('   All Google Ads tracking is now managed through GTM.');
        
    } catch (error) {
        console.error('❌ Failed to create Google Ads tags:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check if GTM API is working');
        console.log('   2. Verify service account permissions');
        console.log('   3. Check if workspace exists');
    }
}

// Run the script
if (require.main === module) {
    createGoogleAdsTagSimple()
        .then(() => {
            console.log('\n✨ Google Ads tag creation completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Failed:', error);
            process.exit(1);
        });
}

module.exports = { createGoogleAdsTagSimple };
