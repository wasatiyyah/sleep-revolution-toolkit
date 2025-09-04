#!/usr/bin/env node

const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY environment variable is required');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function checkContacts() {
  const audienceId = '7e02ec50-e9a5-42b2-bafb-4f0df2c58453';
  
  console.log('📋 Checking contacts in your Resend audience...\n');

  try {
    // List all contacts in the audience
    const { data: contacts, error } = await resend.contacts.list({
      audienceId: audienceId
    });
    
    if (error) {
      console.error('❌ Failed to list contacts:', error);
      return;
    }
    
    const contactArray = Array.isArray(contacts) ? contacts : (contacts?.data || []);
    
    console.log(`✅ Found ${contactArray.length} contacts in your audience:\n`);
    
    if (contactArray.length === 0) {
      console.log('📭 No contacts found yet.');
      console.log('\n💡 To test the integration:');
      console.log('1. Go to https://www.sleeprevolutiontoolkit.com/free-emergency-kit.html');
      console.log('2. Submit the form with a test email');
      console.log('3. Run this script again to see the contact appear');
      return;
    }
    
    // Show recent contacts first (most recent signups)
    contactArray
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .forEach((contact, index) => {
        const createdDate = new Date(contact.created_at).toLocaleDateString();
        const createdTime = new Date(contact.created_at).toLocaleTimeString();
        
        console.log(`${index + 1}. ${contact.email}`);
        console.log(`   Name: ${contact.first_name || 'Not provided'}`);
        console.log(`   Added: ${createdDate} at ${createdTime}`);
        console.log(`   Status: ${contact.unsubscribed ? '❌ Unsubscribed' : '✅ Subscribed'}`);
        console.log('');
      });
    
    console.log('🎉 Your Resend audience integration is working!');
    console.log('📧 These contacts will receive the 7-day email sequence automatically');
    
    // Show recent signups (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentContacts = contactArray.filter(contact => 
      new Date(contact.created_at) > yesterday
    );
    
    if (recentContacts.length > 0) {
      console.log(`\n🆕 ${recentContacts.length} new signups in the last 24 hours:`);
      recentContacts.forEach(contact => {
        console.log(`   • ${contact.email} (${contact.first_name || 'No name'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to check contacts:', error);
    process.exit(1);
  }
}

checkContacts();