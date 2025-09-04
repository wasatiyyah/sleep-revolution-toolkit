const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory storage (in production, use a database like Supabase, PostgreSQL, or MongoDB)
let emailSequenceStorage = [];

const emailTemplates = {
  0: {
    subject: (firstName) => `${firstName}, Your Emergency Sleep Kit is Here! 🎯`,
    html: (firstName, email) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1>🎯 Your Emergency Sleep Kit Has Arrived!</h1>
        <p>Hi ${firstName}, ready to transform your sleep tonight?</p>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
        <div style="background: white; padding: 20px; border-left: 4px solid #ff6b6b; margin: 20px 0;">
            <h3>📋 Your FREE Emergency Sleep Kit</h3>
            <p>Inside you'll find the <strong>Quick Reference Emergency Cards</strong> - your go-to guide when sleep problems strike at 2 AM.</p>
            <a href="https://sleeprevolutiontoolkit.com/toolkit/final-pdfs/Quick_Reference_Emergency_Cards.pdf" style="display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">📥 Download Your Emergency Kit</a>
        </div>
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email=${encodeURIComponent(email)}" style="display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">🔥 Get Complete Toolkit for $27</a>
    </div>
</body>
</html>`
  },
  
  1: {
    subject: (firstName) => `${firstName}, why your brain fights sleep (and how to win) 🧠`,
    html: (firstName, email) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1>🧠 The Sleep Saboteur Living in Your Head</h1>
        <p>Hi ${firstName}, did you try the emergency kit last night?</p>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
        <div style="background: white; padding: 25px; border-radius: 10px; margin: 20px 0;">
            <h3>Your Brain is Hardwired to Keep You Awake</h3>
            <p>Every night at bedtime, your brain runs a "safety check" - scanning for problems, threats, and unfinished business.</p>
            <p><strong>The result?</strong> Your mind races with tomorrow's deadlines, financial worries, and that crushing pressure to "just fall asleep already".</p>
        </div>
        <p>You're not broken. Your brain is doing what it's supposed to do. The problem is nobody taught you how to <strong>override the system.</strong></p>
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email=${encodeURIComponent(email)}" style="display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">🧠 Get the Complete Brain Override System ($27)</a>
    </div>
</body>
</html>`
  },

  2: {
    subject: (firstName) => `${firstName}, 847 people bought this yesterday... 📈`,
    html: (firstName, email) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1>📈 This is Getting Crazy...</h1>
        <p>Hi ${firstName}, the results keep pouring in</p>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
        <p>847 people purchased the complete Sleep Revolution Toolkit yesterday alone.</p>
        <div style="background: white; padding: 20px; border-left: 4px solid #10b981; margin: 15px 0; border-radius: 5px;">
            <p><strong>"I was skeptical, but this changed everything. First night: 8 minutes to fall asleep. I haven't slept this well since college."</strong> - Sarah M.</p>
        </div>
        <div style="background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h3>⏰ Price Increase Coming</h3>
            <p><strong>Last chance to get it for $27.</strong></p>
        </div>
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email=${encodeURIComponent(email)}" style="display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">🚀 Join 847+ People Who Slept Better Last Night ($27)</a>
    </div>
</body>
</html>`
  }
  // Add more templates as needed...
};

// Add contact to email sequence
async function startSimpleEmailSequence(firstName, email) {
  console.log(`🚀 Starting simple email sequence for ${firstName} (${email})`);
  
  const signupDate = new Date();
  const sequenceEntry = {
    email: email,
    firstName: firstName,
    signupDate: signupDate,
    lastEmailSent: 0,
    active: true,
    id: Date.now() // Simple ID generation
  };
  
  emailSequenceStorage.push(sequenceEntry);
  
  // Send immediate welcome email
  await sendEmailFromTemplate(0, firstName, email);
  
  console.log(`✅ Email sequence started for ${email}`);
  return sequenceEntry;
}

// Send email from template
async function sendEmailFromTemplate(day, firstName, email) {
  const template = emailTemplates[day];
  if (!template) {
    throw new Error(`Email template for day ${day} not found`);
  }
  
  const subject = template.subject(firstName);
  const html = template.html(firstName, email);
  
  const { data, error } = await resend.emails.send({
    from: 'Sleep Revolution Toolkit <no-reply@sleeprevolutiontoolkit.com>',
    to: [email],
    subject: subject,
    html: html,
  });
  
  if (error) {
    throw new Error(`Failed to send day ${day} email: ${error.message}`);
  }
  
  console.log(`✅ Day ${day} email sent to ${email}: ${data.id}`);
  return data;
}

// Process email sequence (this would be called by a cron job)
async function processEmailSequence() {
  console.log('🔄 Processing email sequence...');
  
  const now = new Date();
  
  for (const entry of emailSequenceStorage) {
    if (!entry.active) continue;
    
    const daysSinceSignup = Math.floor((now - entry.signupDate) / (1000 * 60 * 60 * 24));
    const nextEmailDay = entry.lastEmailSent + 1;
    
    // Check if it's time to send the next email
    if (daysSinceSignup >= nextEmailDay && nextEmailDay <= 6) {
      try {
        await sendEmailFromTemplate(nextEmailDay, entry.firstName, entry.email);
        entry.lastEmailSent = nextEmailDay;
        console.log(`✅ Sent day ${nextEmailDay} email to ${entry.email}`);
      } catch (error) {
        console.error(`❌ Failed to send day ${nextEmailDay} email to ${entry.email}:`, error);
      }
    }
    
    // Mark as complete after day 6
    if (entry.lastEmailSent >= 6) {
      entry.active = false;
    }
  }
}

// Stop sequence (when customer purchases)
function stopEmailSequence(email) {
  const entry = emailSequenceStorage.find(e => e.email === email);
  if (entry) {
    entry.active = false;
    console.log(`✅ Email sequence stopped for ${email}`);
  }
}

// API handler
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { action, firstName, email } = req.body;
  
  try {
    if (action === 'start_sequence') {
      const result = await startSimpleEmailSequence(firstName, email);
      res.status(200).json({ message: 'Email sequence started', id: result.id });
      
    } else if (action === 'stop_sequence') {
      stopEmailSequence(email);
      res.status(200).json({ message: 'Email sequence stopped' });
      
    } else if (action === 'process_sequence') {
      await processEmailSequence();
      res.status(200).json({ message: 'Email sequence processed' });
      
    } else if (action === 'get_status') {
      const activeSequences = emailSequenceStorage.filter(e => e.active);
      res.status(200).json({ 
        total: emailSequenceStorage.length, 
        active: activeSequences.length,
        sequences: activeSequences 
      });
      
    } else {
      res.status(400).json({ message: 'Invalid action' });
    }
    
  } catch (error) {
    console.error('Simple automation error:', error);
    res.status(500).json({ message: 'Automation failed', error: error.message });
  }
};

// Export functions
module.exports.startSimpleEmailSequence = startSimpleEmailSequence;
module.exports.stopEmailSequence = stopEmailSequence;
module.exports.processEmailSequence = processEmailSequence;