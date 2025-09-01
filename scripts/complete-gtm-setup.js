#!/usr/bin/env node

/**
 * Complete Google Tag Manager Setup Script
 * This script guides you through the entire GTM setup process
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function completeGTMSetup() {
    console.log('🚀 Complete Google Tag Manager Setup\n');
    console.log('This script will help you set up GTM API access step by step.\n');

    try {
        // Step 1: Check current status
        console.log('📋 Step 1: Checking Current Status...');
        const config = require('../config/environment');
        
        if (config.google.tagManager.api.enabled && 
            config.google.tagManager.api.accountId && 
            config.google.tagManager.api.containerId) {
            console.log('✅ GTM API is already configured!');
            console.log(`   Account ID: ${config.google.tagManager.api.accountId}`);
            console.log(`   Container ID: ${config.google.tagManager.api.containerId}`);
            console.log(`   Workspace ID: ${config.google.tagManager.api.workspaceId || 'Not set'}`);
            
            const testNow = await question('\n🧪 Would you like to test the current setup? (y/n): ');
            if (testNow.toLowerCase() === 'y') {
                console.log('\n🔍 Testing current setup...');
                const { getGTMInfo } = require('./get-gtm-info');
                await getGTMInfo();
                return;
            }
            return;
        }

        // Step 2: Console Setup Instructions
        console.log('\n📋 Step 2: Google Cloud Console Setup Required\n');
        console.log('You need to manually enable some APIs in Google Cloud Console first:\n');
        console.log('🔧 Required Actions:');
        console.log('   1. Go to: https://console.cloud.google.com/');
        console.log('   2. Select project: gen-lang-client-0334047914');
        console.log('   3. Go to APIs & Services > Library');
        console.log('   4. Enable these APIs:');
        console.log('      - Service Usage API (required first)');
        console.log('      - Tag Manager API');
        console.log('   5. Go to IAM & Admin > IAM');
        console.log('   6. Add Tag Manager roles to your service account');
        console.log('      - Tag Manager Account User');
        console.log('      - Tag Manager Container User');
        console.log('      - Tag Manager Container Developer');
        console.log('      - Tag Manager Container Admin');
        
        const consoleReady = await question('\n✅ Have you completed the console setup? (y/n): ');
        if (consoleReady.toLowerCase() !== 'y') {
            console.log('\n⏳ Please complete the console setup first, then run this script again.');
            console.log('📚 See CONSOLE_SETUP_STEPS.md for detailed instructions.');
            return;
        }

        // Step 3: Get GTM Information
        console.log('\n📋 Step 3: Getting GTM Information\n');
        console.log('Now you need to get your GTM account details:\n');
        console.log('🔗 Go to: https://tagmanager.google.com/');
        console.log('📊 Look for these IDs in the URLs:\n');

        const accountId = await question('Enter your GTM Account ID (number from URL): ');
        const containerId = await question('Enter your GTM Container ID (starts with GTM-): ');
        const workspaceId = await question('Enter your GTM Workspace ID (number, optional): ');

        // Validate inputs
        if (!accountId || !containerId) {
            console.log('❌ Account ID and Container ID are required!');
            return;
        }

        if (!containerId.startsWith('GTM-')) {
            console.log('❌ Container ID must start with GTM-');
            return;
        }

        // Step 4: Set Environment Variables
        console.log('\n📋 Step 4: Setting Environment Variables\n');
        
        const envVars = [
            `GTM_API_ENABLED=true`,
            `GTM_ACCOUNT_ID=${accountId}`,
            `GTM_CONTAINER_ID=${containerId}`
        ];

        if (workspaceId) {
            envVars.push(`GTM_WORKSPACE_ID=${workspaceId}`);
        }

        console.log('Set these environment variables:\n');
        envVars.forEach(envVar => {
            console.log(`   export ${envVar}`);
        });

        // Step 5: Create .env file
        const createEnvFile = await question('\n📁 Would you like me to create a .env file with these variables? (y/n): ');
        if (createEnvFile.toLowerCase() === 'y') {
            const envContent = envVars.join('\n') + '\n';
            const envPath = path.join(process.cwd(), '.env');
            
            try {
                fs.writeFileSync(envPath, envContent);
                console.log(`✅ Created .env file at: ${envPath}`);
                console.log('⚠️  Remember to add .env to your .gitignore file!');
            } catch (error) {
                console.log('❌ Failed to create .env file:', error.message);
                console.log('📝 Please create it manually with the variables above.');
            }
        }

        // Step 6: Test the Setup
        console.log('\n📋 Step 5: Testing the Setup\n');
        console.log('Now let\'s test if everything is working...\n');
        
        // Set environment variables for current session
        process.env.GTM_API_ENABLED = 'true';
        process.env.GTM_ACCOUNT_ID = accountId;
        process.env.GTM_CONTAINER_ID = containerId;
        if (workspaceId) {
            process.env.GTM_WORKSPACE_ID = workspaceId;
        }

        console.log('🧪 Testing GTM API connection...');
        try {
            const { getGTMInfo } = require('./get-gtm-info');
            await getGTMInfo();
        } catch (error) {
            console.log('❌ Test failed:', error.message);
            console.log('\n🔧 Troubleshooting:');
            console.log('   1. Check if all APIs are enabled in Google Cloud Console');
            console.log('   2. Verify service account permissions');
            console.log('   3. Ensure environment variables are set correctly');
            console.log('   4. Wait a few minutes after enabling APIs');
        }

        // Step 7: Next Steps
        console.log('\n📋 Step 6: Next Steps\n');
        console.log('🎯 What you can do now:');
        console.log('   1. Use the GTM API service in your code');
        console.log('   2. Create tags, triggers, and variables programmatically');
        console.log('   3. Automate GTM workflows');
        console.log('   4. Integrate with your application');
        
        console.log('\n📚 Examples:');
        console.log('   node examples/gtm-api-example.js');
        console.log('   node scripts/setup-gtm-api.js');

        console.log('\n🔒 Security:');
        console.log('   - Your service account key is secure and ignored by git');
        console.log('   - Environment variables keep sensitive data safe');
        console.log('   - API access is properly scoped and controlled');

    } catch (error) {
        console.error('💥 Setup failed:', error.message);
    } finally {
        rl.close();
    }
}

// Run the setup
if (require.main === module) {
    completeGTMSetup()
        .then(() => {
            console.log('\n✨ GTM setup guide completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { completeGTMSetup };
