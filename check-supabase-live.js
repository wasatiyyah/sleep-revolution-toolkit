#!/usr/bin/env node

// This script checks if emails are being stored in Supabase
// You need to provide your Supabase service role key

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bvlnzawphkjmrtvjkyyh.supabase.co';

// IMPORTANT: Replace this with your actual service role key
// Get it from: https://app.supabase.com/project/bvlnzawphkjmrtvjkyyh/settings/api
const supabaseKey = 'YOUR_SERVICE_ROLE_KEY_HERE';

if (supabaseKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('❌ Please add your Supabase service role key to this script!');
  console.log('\n1. Go to: https://app.supabase.com/project/bvlnzawphkjmrtvjkyyh/settings/api');
  console.log('2. Copy the "service_role" key (starts with eyJ...)');
  console.log('3. Replace YOUR_SERVICE_ROLE_KEY_HERE in this script');
  console.log('4. Run the script again\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking your Supabase database...\n');

  try {
    // Check if table exists and get subscribers
    const { data: subscribers, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('❌ Table "email_subscribers" does not exist!');
        console.log('\nTo fix this:');
        console.log('1. Go to: https://app.supabase.com/project/bvlnzawphkjmrtvjkyyh/sql/new');
        console.log('2. Run the SQL from create-supabase-table.sql');
        return;
      }
      console.error('❌ Error:', error.message);
      return;
    }

    if (subscribers && subscribers.length > 0) {
      console.log(`✅ Found ${subscribers.length} subscribers in your database:\n`);
      
      subscribers.forEach((sub, index) => {
        const signupDate = new Date(sub.signup_date);
        const daysAgo = Math.floor((Date.now() - signupDate) / (1000 * 60 * 60 * 24));
        
        console.log(`${index + 1}. ${sub.email}`);
        console.log(`   Name: ${sub.first_name || 'Not provided'}`);
        console.log(`   Signed up: ${signupDate.toLocaleString()} (${daysAgo} days ago)`);
        console.log(`   Last email sent: Day ${sub.last_email_sent}`);
        console.log(`   Sequence active: ${sub.sequence_active ? '✅ Yes' : '❌ No'}`);
        console.log(`   Purchased: ${sub.purchased ? 'Yes' : 'No'}`);
        console.log('');
      });

      // Check who needs emails today
      const needsEmail = subscribers.filter(sub => {
        if (!sub.sequence_active || sub.purchased) return false;
        const daysSinceSignup = Math.floor((Date.now() - new Date(sub.signup_date)) / (1000 * 60 * 60 * 24));
        return daysSinceSignup > sub.last_email_sent && sub.last_email_sent < 6;
      });

      if (needsEmail.length > 0) {
        console.log(`📧 ${needsEmail.length} subscribers need their next email:`);
        needsEmail.forEach(sub => {
          const nextDay = sub.last_email_sent + 1;
          console.log(`   - ${sub.email} needs Day ${nextDay} email`);
        });
      }

    } else {
      console.log('📭 No subscribers found in the database.');
      console.log('\nPossible reasons:');
      console.log('1. The table was just created (empty)');
      console.log('2. The automation is not saving emails to the database');
      console.log('3. Environment variables are not set correctly in Vercel');
      
      console.log('\n🔧 To verify Vercel environment variables:');
      console.log('1. Go to your Vercel dashboard');
      console.log('2. Check Settings → Environment Variables');
      console.log('3. Ensure SUPABASE_SERVICE_ROLE_KEY is set');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabase();