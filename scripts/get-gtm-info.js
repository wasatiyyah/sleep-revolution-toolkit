#!/usr/bin/env node

/**
 * Get Google Tag Manager Information
 * This script helps you gather the necessary GTM IDs and test the setup
 */

// Load environment variables
require('dotenv').config();

const GTMApiService = require('../lib/gtm-api-service');

async function getGTMInfo() {
    console.log('🔍 Google Tag Manager Information Gathering\n');

    try {
        // Check current configuration
        const config = require('../config/environment');
        console.log('📋 Current Configuration:');
        console.log(`   GTM API Enabled: ${config.google.tagManager.api.enabled}`);
        console.log(`   Account ID: ${config.google.tagManager.api.accountId || 'Not set'}`);
        console.log(`   Container ID: ${config.google.tagManager.api.containerId || 'Not set'}`);
        console.log(`   Workspace ID: ${config.google.tagManager.api.workspaceId || 'Not set'}`);
        console.log('');

        // Check if we have the basic setup
        if (!config.google.tagManager.api.accountId || !config.google.tagManager.api.containerId) {
            console.log('⚠️  Missing required GTM information!');
            console.log('\n📋 You need to:');
            console.log('   1. Go to https://tagmanager.google.com/');
            console.log('   2. Get your Account ID from the URL');
            console.log('   3. Get your Container ID (starts with GTM-)');
            console.log('   4. Get your Workspace ID from the container URL');
            console.log('\n🔗 Example URLs:');
            console.log('   Account: https://tagmanager.google.com/#/admin/accounts/123456789');
            console.log('   Container: https://tagmanager.google.com/#/admin/accounts/123456789/containers/GTM-ABC123');
            console.log('   Workspace: https://tagmanager.google.com/#/admin/accounts/123456789/containers/GTM-ABC123/workspaces/987654321');
            console.log('\n💡 Set these environment variables:');
            console.log('   export GTM_API_ENABLED=true');
            console.log('   export GTM_ACCOUNT_ID=123456789');
            console.log('   export GTM_CONTAINER_ID=GTM-ABC123');
            console.log('   export GTM_WORKSPACE_ID=987654321');
            return;
        }

        // Try to test the connection
        console.log('🧪 Testing GTM API connection...');
        const gtmService = new GTMApiService();
        
        try {
            const testResult = await gtmService.testConnection();
            
            if (testResult.success) {
                console.log('✅ GTM API connection successful!\n');
                console.log('📊 Account Information:');
                console.log(`   Name: ${testResult.account.name}`);
                console.log(`   ID: ${testResult.account.accountId}`);
                console.log('\n📦 Container Information:');
                console.log(`   Name: ${testResult.container.name}`);
                console.log(`   Container ID: ${testResult.container.containerId}`);
                console.log(`   Public ID: ${testResult.container.publicId}`);
                console.log('\n🏢 Workspaces:');
                testResult.workspaces.forEach(workspace => {
                    console.log(`   - ${workspace.name} (ID: ${workspace.workspaceId})`);
                });

                // Get container snippet
                console.log('\n📋 Getting container snippet...');
                const snippet = await gtmService.getContainerSnippet();
                console.log('✅ Container snippet retrieved successfully!');
                console.log('\n📝 JavaScript Snippet (add to <head>):');
                console.log(snippet.snippet);
                console.log('\n📝 NoScript Snippet (add after <body>):');
                console.log(snippet.noscript);

            } else {
                console.log('❌ GTM API connection failed:');
                console.log(`   Error: ${testResult.error}`);
                console.log('\n🔧 Troubleshooting:');
                console.log('   1. Check if GTM API is enabled in Google Cloud Console');
                console.log('   2. Verify your service account has the correct permissions');
                console.log('   3. Ensure all required environment variables are set');
                console.log('   4. Check if Service Usage API is enabled');
            }

        } catch (error) {
            console.log('❌ GTM API test failed:');
            console.log(`   Error: ${error.message}`);
            
            if (error.message.includes('Service Usage API')) {
                console.log('\n🔧 Solution: Enable Service Usage API first');
                console.log('   1. Go to https://console.cloud.google.com/');
                console.log('   2. Select project: gen-lang-client-0334047914');
                console.log('   3. Go to APIs & Services > Library');
                console.log('   4. Search for "Service Usage API" and enable it');
                console.log('   5. Wait 2-3 minutes, then try again');
            } else if (error.message.includes('Permission denied')) {
                console.log('\n🔧 Solution: Check service account permissions');
                console.log('   1. Go to IAM & Admin > IAM');
                console.log('   2. Find your service account');
                console.log('   3. Add Tag Manager roles');
            }
        }

    } catch (error) {
        console.error('💥 Script failed:', error.message);
    }
}

// Run the script
if (require.main === module) {
    getGTMInfo()
        .then(() => {
            console.log('\n✨ GTM information gathering complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Failed:', error);
            process.exit(1);
        });
}

module.exports = { getGTMInfo };
