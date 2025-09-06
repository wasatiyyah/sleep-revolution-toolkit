#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bvlnzawphkjmrtvjkyyh.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bG56YXdwaGtqbXJ0dmpreXloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxMzc4NywiZXhwIjoyMDcyNTg5Nzg3fQ.SkL4KjKJsJ0NTxZoi9mseBZY8j1cbqKbt67-1WsbUvw';

const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);

async function addRealSubscriber() {
  console.log('🎯 Adding your email to the database...\n');
  
  const subscribers = [
    {
      email: 'ibrahimhaleeth@gmail.com',
      first_name: 'Ibrahim',
      signup_date: new Date().toISOString(),
      last_email_sent: 0,
      sequence_active: true,
      purchased: false
    }
  ];
  
  for (const subscriber of subscribers) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('email_subscribers')
        .select('*')
        .eq('email', subscriber.email)
        .single();
      
      if (existing) {
        console.log(`✅ ${subscriber.email} already exists in database`);
        console.log(`   Last email sent: Day ${existing.last_email_sent}`);
        console.log(`   Active: ${existing.sequence_active ? 'Yes' : 'No'}\n`);
      } else {
        // Add new subscriber
        const { data: newSub, error } = await supabase
          .from('email_subscribers')
          .insert([subscriber])
          .select()
          .single();
        
        if (error) {
          console.log(`❌ Error adding ${subscriber.email}:`, error.message);
        } else {
          console.log(`✅ Successfully added ${subscriber.email}!`);
          console.log(`   ID: ${newSub.id}`);
          console.log(`   Ready for 7-day email sequence\n`);
        }
      }
    } catch (err) {
      console.error('Error:', err.message);
    }
  }
  
  // Show all subscribers
  console.log('\n📊 Current subscribers in database:');
  const { data: all } = await supabase
    .from('email_subscribers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (all && all.length > 0) {
    all.forEach((sub, i) => {
      const daysSinceSignup = Math.floor((Date.now() - new Date(sub.signup_date)) / (1000 * 60 * 60 * 24));
      console.log(`\n${i + 1}. ${sub.email}`);
      console.log(`   Name: ${sub.first_name || 'Not provided'}`);
      console.log(`   Signed up: ${daysSinceSignup} days ago`);
      console.log(`   Next email: Day ${sub.last_email_sent + 1}`);
      console.log(`   Status: ${sub.sequence_active ? '✅ Active' : '❌ Inactive'}`);
    });
  }
  
  console.log('\n✅ Database is ready for automation!');
  console.log('📧 The cron job will run daily at 9 AM UTC to send emails.');
}

addRealSubscriber();