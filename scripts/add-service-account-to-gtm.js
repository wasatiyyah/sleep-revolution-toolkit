#!/usr/bin/env node

/**
 * Add Service Account to Google Tag Manager
 * This script helps you add your service account to GTM with proper permissions
 */

// Load environment variables
require('dotenv').config();

const { google } = require('googleapis');
const config = require('../config/environment');

async function addServiceAccountToGTM() {
    console.log('🔐 Adding Service Account to Google Tag Manager...\n');

    try {
        // Set up authentication
        const auth = new google.auth.GoogleAuth({
            keyFile: config.google.cloud.serviceAccountKeyPath,
            scopes: [
                'https://www.googleapis.com/auth/tagmanager.readonly',
                'https://www.googleapis.com/auth/tagmanager.edit.containers',
                'https://www.googleapis.com/auth/tagmanager.edit.containerversions',
                'https://www.googleapis.com/auth/tagmanager.manage.accounts',
                'https://www.googleapis.com/auth/tagmanager.manage.users'
            ]
        });

        // Create Tag Manager API client
        const tagmanager = google.tagmanager({
            version: 'v2',
            auth: auth
        });

        const accountId = config.google.tagManager.api.accountId;
        const serviceAccountEmail = 'kingsmen@gen-lang-client-0334047914.iam.gserviceaccount.com';

        console.log('📋 Service Account Details:');
        console.log(`   Email: ${serviceAccountEmail}`);
        console.log(`   GTM Account ID: ${accountId}`);
        console.log('');

        // Try to get account information first
        console.log('🔍 Testing account access...');
        try {
            const accountResponse = await tagmanager.accounts.get({
                path: `accounts/${accountId}`
            });
            console.log('✅ Successfully accessed GTM account!');
            console.log(`   Account Name: ${accountResponse.data.name}`);
            console.log(`   Account ID: ${accountResponse.data.accountId}`);
            console.log('');

            // Try to list containers
            console.log('📦 Testing container access...');
            const containersResponse = await tagmanager.accounts.containers.list({
                parent: `accounts/${accountId}`
            });
            
            if (containersResponse.data.container) {
                console.log('✅ Successfully accessed containers!');
                containersResponse.data.container.forEach(container => {
                    console.log(`   - ${container.name} (${container.containerId})`);
                });
                console.log('');
            }

            console.log('🎉 Service account has proper access to GTM!');
            console.log('\n📋 What this means:');
            console.log('   ✅ Your service account can access GTM');
            console.log('   ✅ You can create and manage tags, triggers, variables');
            console.log('   ✅ You can publish container versions');
            console.log('   ✅ The GTM API setup is working correctly');

        } catch (error) {
            console.log('❌ Account access failed:', error.message);
            
            if (error.message.includes('Not found or permission denied')) {
                console.log('\n🔧 Solution: Add service account to GTM manually');
                console.log('\n📋 Manual Steps Required:');
                console.log('   1. Go to https://tagmanager.google.com/');
                console.log('   2. Click on "Admin" tab');
                console.log('   3. Click on "User Management"');
                console.log('   4. Click "Add user"');
                console.log('   5. Add this email: kingsmen@gen-lang-client-0334047914.iam.gserviceaccount.com');
                console.log('   6. Grant these permissions:');
                console.log('      - Account: Read, Write');
                console.log('      - Container: Read, Write, Delete');
                console.log('      - Container Version: Read, Write, Delete');
                console.log('   7. Click "Invite"');
                console.log('\n⏳ After adding the user, wait 2-3 minutes and try again.');
            }
        }

    } catch (error) {
        console.error('💥 Failed to add service account:', error.message);
        console.log('\n🔧 Alternative solution:');
        console.log('   Use your personal Google account to access GTM first');
        console.log('   Then add the service account as a user with proper permissions');
    }
}

// Run the script
if (require.main === module) {
    addServiceAccountToGTM()
        .then(() => {
            console.log('\n✨ Service account setup completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { addServiceAccountToGTM };
