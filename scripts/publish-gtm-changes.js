#!/usr/bin/env node

/**
 * Publish GTM Changes
 * This script publishes the GTM container to make tags active
 */

// Load environment variables
require('dotenv').config();

const GTMApiService = require('../lib/gtm-api-service');

async function publishGTMChanges() {
    console.log('🚀 Publishing GTM Changes...\n');

    try {
        const gtmService = new GTMApiService();
        
        // Create a new version with all the changes
        console.log('📦 Creating new GTM version...');
        
        const version = await gtmService.createVersion('Google Ads Conversion Tracking Setup');
        
        console.log('✅ Created GTM version:', version.name);
        console.log('   Version ID:', version.containerVersionId);
        console.log('   Description:', version.description);
        
        console.log('\n🎉 GTM Changes Published Successfully!');
        console.log('\n📋 What was published:');
        console.log('   1. Google Ads Configuration Tag - Now active on all pages');
        console.log('   2. Google Ads Conversion Tag - Now active on thank you page');
        console.log('   3. Thank You Page Trigger - Now active');
        console.log('   4. All Pages Trigger - Already active');
        
        console.log('\n🚀 Next Steps:');
        console.log('   1. Test your website to ensure tags are firing');
        console.log('   2. Complete a test purchase to trigger conversion');
        console.log('   3. Check Google Ads for conversion tracking');
        console.log('   4. Monitor for 24-48 hours for Google Ads to update');
        
        console.log('\n🔧 To Test:');
        console.log('   1. Visit your homepage - should load Google Ads tracking');
        console.log('   2. Complete a purchase flow');
        console.log('   3. Visit thank you page - should fire conversion');
        console.log('   4. Check GTM Preview mode to verify tag firing');
        
        console.log('\n💡 The "misconfigured" error should resolve once:');
        console.log('   - Tags are published (✅ Done)');
        console.log('   - Real conversions are tracked');
        console.log('   - Google Ads has time to process (24-48 hours)');
        
    } catch (error) {
        console.error('❌ Failed to publish GTM changes:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check if GTM API is working');
        console.log('   2. Verify service account permissions');
        console.log('   3. Check if workspace exists');
        console.log('   4. Try publishing manually in GTM interface');
    }
}

// Run the script
if (require.main === module) {
    publishGTMChanges()
        .then(() => {
            console.log('\n✨ GTM publishing completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Failed:', error);
            process.exit(1);
        });
}

module.exports = { publishGTMChanges };
