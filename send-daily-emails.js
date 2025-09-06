#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabaseUrl = 'https://bvlnzawphkjmrtvjkyyh.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bG56YXdwaGtqbXJ0dmpreXloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzAxMzc4NywiZXhwIjoyMDcyNTg5Nzg3fQ.SkL4KjKJsJ0NTxZoi9mseBZY8j1cbqKbt67-1WsbUvw';

const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend('re_fFkKMRJh_2jeX5vmeYKBFYj1rNKS5vETF');

// Email template for Day 1
const day1Email = {
  subject: (firstName) => `${firstName}, why you woke up at 3 AM last night`,
  html: (firstName, email) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1>🧠 The Sleep Saboteur Living in Your Head</h1>
        <p>Hi ${firstName}, did you try the emergency kit last night?</p>
    </div>
    
    <div style="padding: 30px; background: #f9f9f9;">
        <p>Did you wake up between 2-4 AM last night?</p>
        
        <p>Let me guess what happened next...</p>
        
        <p>You checked your phone (3:17 AM). You calculated how many hours until your alarm (3 hours, 43 minutes). Your brain started its favorite late-night show: "Everything That Could Go Wrong Tomorrow."</p>
        
        <div style="background: white; padding: 25px; border-radius: 10px; margin: 20px 0;">
            <h3>Your Brain is Hardwired to Keep You Awake</h3>
            <p>Every night at bedtime, your brain runs a "safety check" - scanning for problems, threats, and unfinished business.</p>
            
            <p><strong>Your brain literally thinks you're about to be eaten.</strong></p>
            
            <p>The problem? Your brain can't tell the difference between a deadline and a tiger.</p>
        </div>
        
        <h3>The Tiger Trick (Try This Tonight):</h3>
        <p>When your brain starts its threat scan, whisper: "Thank you brain, but there are no tigers here." Then breathe in for 4, hold for 7, out for 8. Repeat 3 times. Your ancient brain can't panic and count at the same time.</p>
        
        <p>The complete Sleep Revolution Toolkit contains the full Neural Override System plus 6 other breakthrough techniques.</p>
        
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email=${encodeURIComponent(email)}" 
           style="display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
            🧠 Override Your Brain's Sabotage System ($27)
        </a>
        
        <p><em>P.S. - 2,847 people got the complete toolkit yesterday. They're probably sleeping right now while you're reading this.</em></p>
    </div>
    
    <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
        <p>Sleep Revolution Toolkit | Questions? Reply to this email</p>
        <p>Orders: orders@sleeprevolutiontoolkit.com</p>
    </div>
</body>
</html>`
};

async function sendDailyEmails() {
  console.log('📧 Processing daily email sequence...\n');
  
  try {
    // Get all active subscribers
    const { data: subscribers, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .eq('sequence_active', true)
      .eq('purchased', false);
    
    if (error) {
      console.error('❌ Error fetching subscribers:', error);
      return;
    }
    
    console.log(`Found ${subscribers.length} active subscribers\n`);
    
    for (const subscriber of subscribers) {
      const daysSinceSignup = Math.floor(
        (new Date() - new Date(subscriber.signup_date)) / (1000 * 60 * 60 * 24)
      );
      
      const nextEmailDay = subscriber.last_email_sent + 1;
      
      console.log(`📊 ${subscriber.email}:`);
      console.log(`   Days since signup: ${daysSinceSignup}`);
      console.log(`   Last email sent: Day ${subscriber.last_email_sent}`);
      console.log(`   Next email: Day ${nextEmailDay}`);
      
      // For testing, let's send Day 1 email if they haven't received it
      if (subscriber.last_email_sent === 0 && nextEmailDay === 1) {
        console.log(`   📤 Sending Day 1 email...`);
        
        try {
          const { data, error } = await resend.emails.send({
            from: 'Sleep Revolution Toolkit <no-reply@sleeprevolutiontoolkit.com>',
            to: [subscriber.email],
            subject: day1Email.subject(subscriber.first_name || 'Friend'),
            html: day1Email.html(subscriber.first_name || 'Friend', subscriber.email),
          });
          
          if (error) {
            console.error(`   ❌ Failed to send:`, error);
          } else {
            console.log(`   ✅ Email sent successfully! ID: ${data.id}`);
            
            // Update database
            await supabase
              .from('email_subscribers')
              .update({ 
                last_email_sent: 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', subscriber.id);
            
            console.log(`   ✅ Database updated\n`);
          }
        } catch (err) {
          console.error(`   ❌ Error:`, err.message);
        }
      } else if (subscriber.last_email_sent >= 6) {
        console.log(`   ✅ Sequence complete\n`);
      } else {
        console.log(`   ⏰ Not time for next email yet\n`);
      }
    }
    
    console.log('✅ Daily email processing complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

sendDailyEmails();