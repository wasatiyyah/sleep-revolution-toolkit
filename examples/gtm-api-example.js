/**
 * Google Tag Manager API Usage Examples
 * This file shows common use cases for the GTM API service
 */

// Load environment variables
require('dotenv').config();

const GTMApiService = require('../lib/gtm-api-service');

async function gtmExamples() {
    console.log('🚀 Google Tag Manager API Examples\n');

    try {
        // Initialize the service
        const gtmService = new GTMApiService();
        
        // Test connection first
        console.log('🔍 Testing connection...');
        const connection = await gtmService.testConnection();
        
        if (!connection.success) {
            console.log('❌ Connection failed:', connection.error);
            return;
        }
        
        console.log('✅ Connected successfully!\n');

        // Example 1: Get container information
        console.log('📦 Getting container information...');
        const container = await gtmService.getContainer();
        console.log(`   Container: ${container.name} (${container.containerId})`);
        console.log(`   Public ID: ${container.publicId}\n`);

        // Example 2: List existing tags
        console.log('🏷️  Listing existing tags...');
        const tags = await gtmService.listTags();
        console.log(`   Found ${tags.length} tags:`);
        tags.forEach(tag => {
            console.log(`   - ${tag.name} (${tag.type})`);
        });
        console.log('');

        // Example 3: List existing triggers
        console.log('🔫 Listing existing triggers...');
        const triggers = await gtmService.listTriggers();
        console.log(`   Found ${triggers.length} triggers:`);
        triggers.forEach(trigger => {
            console.log(`   - ${trigger.name} (${trigger.type})`);
        });
        console.log('');

        // Example 4: List existing variables
        console.log('📊 Listing existing variables...');
        const variables = await gtmService.listVariables();
        console.log(`   Found ${variables.length} variables:`);
        variables.forEach(variable => {
            console.log(`   - ${variable.name} (${variable.type})`);
        });
        console.log('');

        // Example 5: Get container snippet
        console.log('📋 Getting container snippet...');
        const snippet = await gtmService.getContainerSnippet();
        console.log('✅ Snippet retrieved successfully!');
        console.log(`   Container ID: ${snippet.containerId}`);
        console.log('');

        // Example 6: Create a custom variable (commented out to prevent accidental creation)
        /*
        console.log('📊 Creating custom variable...');
        const customVariable = await gtmService.createVariable({
            name: 'Custom Event Name',
            type: 'c',
            parameter: [
                {
                    type: 'template',
                    key: 'value',
                    value: 'custom_event'
                }
            ]
        });
        console.log(`   Created variable: ${customVariable.name}`);
        */

        console.log('✨ Examples completed successfully!');

    } catch (error) {
        console.error('💥 Example failed:', error.message);
    }
}

// Example: Create a GA4 page view tag
async function createGA4Tag() {
    console.log('\n🎯 Creating GA4 Page View Tag...');
    
    try {
        const gtmService = new GTMApiService();
        
        // Create the tag
        const tag = await gtmService.createTag({
            name: 'GA4 Page View',
            type: 'gtag',
            parameter: [
                {
                    type: 'template',
                    key: 'trackingId',
                    value: '{{GA4_MEASUREMENT_ID}}'
                },
                {
                    type: 'template',
                    key: 'sendPageView',
                    value: 'true'
                }
            ],
            firingTriggerId: ['page_view_trigger']
        });
        
        console.log(`✅ Created tag: ${tag.name}`);
        return tag;
        
    } catch (error) {
        console.error('❌ Failed to create GA4 tag:', error.message);
        throw error;
    }
}

// Example: Create a page view trigger
async function createPageViewTrigger() {
    console.log('\n🔫 Creating Page View Trigger...');
    
    try {
        const gtmService = new GTMApiService();
        
        // Create the trigger
        const trigger = await gtmService.createTrigger({
            name: 'Page View',
            type: 'pageview'
        });
        
        console.log(`✅ Created trigger: ${trigger.name}`);
        return trigger;
        
    } catch (error) {
        console.error('❌ Failed to create page view trigger:', error.message);
        throw error;
    }
}

// Example: Create a GA4 measurement ID variable
async function createGA4Variable() {
    console.log('\n📊 Creating GA4 Measurement ID Variable...');
    
    try {
        const gtmService = new GTMApiService();
        
        // Create the variable
        const variable = await gtmService.createVariable({
            name: 'GA4 Measurement ID',
            type: 'c',
            parameter: [
                {
                    type: 'template',
                    key: 'value',
                    value: 'G-XXXXXXXXXX' // Replace with your actual GA4 ID
                }
            ]
        });
        
        console.log(`✅ Created variable: ${variable.name}`);
        return variable;
        
    } catch (error) {
        console.error('❌ Failed to create GA4 variable:', error.message);
        throw error;
    }
}

// Example: Publish changes
async function publishChanges() {
    console.log('\n🚀 Publishing changes...');
    
    try {
        const gtmService = new GTMApiService();
        
        // Create a new version
        const version = await gtmService.createVersion('API Generated Version');
        
        console.log(`✅ Published version: ${version.name}`);
        console.log(`   Version ID: ${version.containerVersionId}`);
        return version;
        
    } catch (error) {
        console.error('❌ Failed to publish changes:', error.message);
        throw error;
    }
}

// Run examples if this file is executed directly
if (require.main === module) {
    gtmExamples()
        .then(() => {
            console.log('\n🎉 All examples completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Examples failed:', error);
            process.exit(1);
        });
}

module.exports = {
    gtmExamples,
    createGA4Tag,
    createPageViewTrigger,
    createGA4Variable,
    publishChanges
};
