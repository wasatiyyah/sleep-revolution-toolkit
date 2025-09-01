#!/usr/bin/env node

/**
 * Google Tag Manager API Setup Script
 * This script helps you set up and test GTM API access
 */

// Load environment variables
require('dotenv').config();

const GTMApiService = require('../lib/gtm-api-service');
const config = require('../config/environment');

async function setupGTM() {
    console.log('🚀 Setting up Google Tag Manager API...\n');

    try {
        // Check if GTM API is enabled
        if (!config.google.tagManager.api.enabled) {
            console.log('⚠️  GTM API is not enabled. Please set GTM_API_ENABLED=true in your environment variables.');
            console.log('\n📋 Required environment variables:');
            console.log('   GTM_API_ENABLED=true');
            console.log('   GTM_ACCOUNT_ID=your_account_id');
            console.log('   GTM_CONTAINER_ID=GTM-XXXXXXX');
            console.log('   GTM_WORKSPACE_ID=your_workspace_id (optional)');
            console.log('   GTM_API_KEY=your_api_key (optional)');
            return;
        }

        // Test the connection
        console.log('🔍 Testing GTM API connection...');
        const gtmService = new GTMApiService();
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
        }

    } catch (error) {
        console.error('💥 Setup failed:', error.message);
        console.log('\n🔧 Common issues:');
        console.log('   1. Missing or incorrect environment variables');
        console.log('   2. Service account key file not found');
        console.log('   3. Insufficient permissions for GTM API');
        console.log('   4. GTM API not enabled in Google Cloud Console');
    }
}

// Run the setup
if (require.main === module) {
    setupGTM()
        .then(() => {
            console.log('\n✨ GTM API setup complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupGTM };
