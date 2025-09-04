const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bvlnzawphkjmrtvjkyyh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('⚠️ SUPABASE_SERVICE_ROLE_KEY not found. Add it to Vercel environment variables.');
}

const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates (using the emotional versions)
const emailTemplates = {
  0: {
    subject: (firstName) => `${firstName}, I know why you downloaded this...`,
    getHtml: (firstName, email) => `[Day 0 emotional email content here]`
  },
  1: {
    subject: (firstName) => `${firstName}, why you woke up at 3 AM last night`,
    getHtml: (firstName, email) => `[Day 1 emotional email content here]`
  },
  // ... more templates
};

// Add new subscriber to database
async function addSubscriber(email, firstName) {
  if (!supabase) {
    console.error('❌ Supabase not initialized. Check your environment variables.');
    return null;
  }

  try {
    // Check if subscriber already exists
    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      console.log('✅ Subscriber already exists:', email);
      return existing;
    }

    // Add new subscriber
    const { data, error } = await supabase
      .from('email_subscribers')
      .insert([
        {
          email: email,
          first_name: firstName,
          signup_date: new Date().toISOString(),
          last_email_sent: 0,
          sequence_active: true,
          purchased: false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding subscriber:', error);
      return null;
    }

    console.log('✅ New subscriber added:', email);
    return data;
  } catch (error) {
    console.error('❌ Database error:', error);
    return null;
  }
}

// Process daily email sequence
async function processDailyEmails() {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return;
  }

  console.log('🔄 Processing daily email sequence...');
  
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

    console.log(`📧 Found ${subscribers.length} active subscribers`);

    for (const subscriber of subscribers) {
      const daysSinceSignup = Math.floor(
        (new Date() - new Date(subscriber.signup_date)) / (1000 * 60 * 60 * 24)
      );
      
      const nextEmailDay = subscriber.last_email_sent + 1;

      // Check if it's time to send the next email (and we haven't finished the sequence)
      if (daysSinceSignup >= nextEmailDay && nextEmailDay <= 6) {
        try {
          // Send the email
          await sendSequenceEmail(
            nextEmailDay,
            subscriber.first_name || 'Friend',
            subscriber.email
          );

          // Update the database
          await supabase
            .from('email_subscribers')
            .update({ 
              last_email_sent: nextEmailDay,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscriber.id);

          console.log(`✅ Sent day ${nextEmailDay} email to ${subscriber.email}`);
        } catch (error) {
          console.error(`❌ Failed to send email to ${subscriber.email}:`, error);
        }
      }

      // Mark sequence as complete after day 6
      if (subscriber.last_email_sent >= 6) {
        await supabase
          .from('email_subscribers')
          .update({ 
            sequence_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscriber.id);
        
        console.log(`✅ Completed sequence for ${subscriber.email}`);
      }
    }

    console.log('✅ Daily email processing complete');
  } catch (error) {
    console.error('❌ Error processing daily emails:', error);
  }
}

// Send email from template
async function sendSequenceEmail(day, firstName, email) {
  const template = emailTemplates[day];
  if (!template) {
    throw new Error(`Email template for day ${day} not found`);
  }

  const { data, error } = await resend.emails.send({
    from: 'Sleep Revolution Toolkit <no-reply@sleeprevolutiontoolkit.com>',
    to: [email],
    subject: template.subject(firstName),
    html: template.getHtml(firstName, email),
  });

  if (error) {
    throw new Error(`Failed to send day ${day} email: ${error.message}`);
  }

  return data;
}

// Mark subscriber as purchased (stops emails)
async function markAsPurchased(email) {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('email_subscribers')
      .update({ 
        purchased: true,
        sequence_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (!error) {
      console.log(`✅ Marked ${email} as purchased - stopping email sequence`);
    }
  } catch (error) {
    console.error(`❌ Error marking as purchased:`, error);
  }
}

// API Handler
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { action, email, firstName } = req.body;

  try {
    switch (action) {
      case 'add_subscriber':
        const subscriber = await addSubscriber(email, firstName);
        res.status(200).json({ success: true, subscriber });
        break;

      case 'process_daily':
        await processDailyEmails();
        res.status(200).json({ success: true, message: 'Daily emails processed' });
        break;

      case 'mark_purchased':
        await markAsPurchased(email);
        res.status(200).json({ success: true, message: 'Marked as purchased' });
        break;

      case 'get_status':
        if (!supabase) {
          res.status(500).json({ error: 'Database not configured' });
          break;
        }
        
        const { data: stats } = await supabase
          .from('email_subscribers')
          .select('sequence_active, purchased');
        
        const active = stats?.filter(s => s.sequence_active && !s.purchased).length || 0;
        const purchased = stats?.filter(s => s.purchased).length || 0;
        const total = stats?.length || 0;
        
        res.status(200).json({ total, active, purchased });
        break;

      default:
        res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Export functions for use in other files
module.exports.addSubscriber = addSubscriber;
module.exports.processDailyEmails = processDailyEmails;
module.exports.markAsPurchased = markAsPurchased;