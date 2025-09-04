#!/usr/bin/env node

const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY environment variable is required');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function createAudiences() {
  console.log('🏗️ Creating Resend audiences for Sleep Toolkit...\n');

  try {
    // Create leads audience
    console.log('📝 Creating "Sleep Toolkit - Leads" audience...');
    const { data: leadsAudience, error: leadsError } = await resend.audiences.create({
      name: 'Sleep Toolkit - Leads (7-Day Sequence)'
    });
    
    if (leadsError) {
      console.error('❌ Failed to create leads audience:', leadsError);
    } else {
      console.log('✅ Leads audience created successfully!');
      console.log('   Audience ID:', leadsAudience.id);
      console.log('   Name:', leadsAudience.name);
      console.log('   Add to .env: RESEND_LEADS_AUDIENCE_ID=' + leadsAudience.id);
    }
    
    console.log('');
    
    // Create customers audience  
    console.log('📝 Creating "Sleep Toolkit - Customers" audience...');
    const { data: customersAudience, error: customersError } = await resend.audiences.create({
      name: 'Sleep Toolkit - Customers (Post-Purchase)'
    });
    
    if (customersError) {
      console.error('❌ Failed to create customers audience:', customersError);
    } else {
      console.log('✅ Customers audience created successfully!');
      console.log('   Audience ID:', customersAudience.id);
      console.log('   Name:', customersAudience.name);
      console.log('   Add to .env: RESEND_CUSTOMERS_AUDIENCE_ID=' + customersAudience.id);
    }
    
    console.log('\n🎉 Audiences created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Add the audience IDs to your environment variables');
    console.log('2. Deploy your updated automation system');
    console.log('3. Test the lead capture flow to see contacts appear in Resend');
    
  } catch (error) {
    console.error('❌ Failed to create audiences:', error);
    process.exit(1);
  }
}

createAudiences();