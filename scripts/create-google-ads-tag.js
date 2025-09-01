#!/usr/bin/env node

/**
 * Create Google Ads Tag in GTM
 * This script creates a Google Ads gtag configuration tag in GTM
 */

// Load environment variables
require('dotenv').config();

const GTMApiService = require('../lib/gtm-api-service');

async function createGoogleAdsTag() {
    console.log('🎯 Creating Google Ads Tag in GTM...\n');

    try {
        const gtmService = new GTMApiService();
        
        // First, let's create a Google Ads configuration tag
        console.log('📊 Creating Google Ads Configuration Tag...');
        
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
            firingTriggerId: ['All Pages'] // This will fire on all pages
        });
        
        console.log('✅ Created Google Ads Configuration Tag:', googleAdsConfigTag.name);
        
        // Now let's create a trigger for all pages if it doesn't exist
        console.log('\n🔫 Creating All Pages Trigger...');
        
        try {
            const allPagesTrigger = await gtmService.createTrigger({
                name: 'All Pages',
                type: 'pageview'
            });
            console.log('✅ Created All Pages Trigger:', allPagesTrigger.name);
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️  All Pages trigger already exists');
            } else {
                throw error;
            }
        }
        
        // Create a conversion tracking tag for the thank you page
        console.log('\n💰 Creating Google Ads Conversion Tag...');
        
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
                    value: '{{Event Value}}'
                },
                {
                    type: 'template',
                    key: 'currency',
                    value: 'USD'
                },
                {
                    type: 'template',
                    key: 'transaction_id',
                    value: '{{Transaction ID}}'
                }
            ],
            firingTriggerId: ['Purchase Event'] // This will fire when purchase event occurs
        });
        
        console.log('✅ Created Google Ads Conversion Tag:', conversionTag.name);
        
        // Create a trigger for purchase events
        console.log('\n🔫 Creating Purchase Event Trigger...');
        
        try {
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
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('ℹ️  Purchase Event trigger already exists');
            } else {
                throw error;
            }
        }
        
        // Create variables for dynamic values
        console.log('\n📊 Creating Variables...');
        
        try {
            const eventValueVariable = await gtmService.createVariable({
                name: 'Event Value',
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
                        value: 'ecommerce.value'
                    }
                ]
            });
            console.log('✅ Created Event Value Variable:', eventValueVariable.name);
            
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
        } catch (error) {
            console.log('ℹ️  Variables may already exist:', error.message);
        }
        
        console.log('\n🎉 Google Ads Tags Created Successfully!');
        console.log('\n📋 What was created:');
        console.log('   1. Google Ads Configuration Tag - Fires on all pages');
        console.log('   2. Google Ads Conversion Tag - Fires on purchase events');
        console.log('   3. All Pages Trigger - Triggers on page views');
        console.log('   4. Purchase Event Trigger - Triggers on purchase events');
        console.log('   5. Event Value Variable - Gets purchase value from dataLayer');
        console.log('   6. Transaction ID Variable - Gets transaction ID from dataLayer');
        
        console.log('\n🚀 Next Steps:');
        console.log('   1. Go to GTM and review the created tags');
        console.log('   2. Test the tags in Preview mode');
        console.log('   3. Publish the container when ready');
        console.log('   4. Monitor conversions in Google Ads');
        
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
    createGoogleAdsTag()
        .then(() => {
            console.log('\n✨ Google Ads tag creation completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Failed:', error);
            process.exit(1);
        });
}

module.exports = { createGoogleAdsTag };
