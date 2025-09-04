#!/usr/bin/env node

const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY environment variable is required');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function listAudiences() {
  console.log('📋 Listing your Resend audiences...\n');

  try {
    const { data: audiences, error } = await resend.audiences.list();
    
    if (error) {
      console.error('❌ Failed to list audiences:', error);
      return;
    }
    
    console.log('📊 Raw audience data:', JSON.stringify(audiences, null, 2));
    
    // Handle different response formats
    const audienceArray = Array.isArray(audiences) ? audiences : (audiences?.data || []);
    
    if (!audienceArray || audienceArray.length === 0) {
      console.log('📭 No audiences found. You can create one manually in the Resend dashboard.');
      console.log('\n📋 Instructions:');
      console.log('1. Go to https://resend.com/audiences');
      console.log('2. Click "Create Audience"');
      console.log('3. Name it: "Sleep Toolkit - Leads"');
      console.log('4. Copy the audience ID and add to .env as RESEND_LEADS_AUDIENCE_ID');
      return;
    }
    
    console.log(`✅ Found ${audienceArray.length} audience(s):\n`);
    
    audienceArray.forEach((audience, index) => {
      console.log(`${index + 1}. ${audience.name}`);
      console.log(`   ID: ${audience.id}`);
      console.log(`   Created: ${audience.created_at}`);
      console.log('');
    });
    
    console.log('📋 To use with Sleep Toolkit automation:');
    console.log('Add this to your .env file:');
    console.log(`RESEND_LEADS_AUDIENCE_ID=${audienceArray[0].id}`);
    
    if (audienceArray.length > 1) {
      console.log(`RESEND_CUSTOMERS_AUDIENCE_ID=${audienceArray[1].id}`);
    } else {
      console.log('\n⚠️ You only have 1 audience. For now, we\'ll use the same audience for both leads and customers.');
      console.log('Consider upgrading your Resend plan to separate leads and customers.');
    }
    
  } catch (error) {
    console.error('❌ Failed to list audiences:', error);
    process.exit(1);
  }
}

listAudiences();