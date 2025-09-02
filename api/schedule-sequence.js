const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Email sequence scheduler - for production use with a job queue system
// For now, this creates scheduled emails that need to be triggered externally

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { firstName, email } = req.body;

  if (!firstName || !email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Calculate schedule times
    const now = new Date();
    const schedule = {
      day1: now, // Immediate
      day2: new Date(now.getTime() + 24 * 60 * 60 * 1000), // +1 day
      day3: new Date(now.getTime() + 48 * 60 * 60 * 1000), // +2 days  
      day4: new Date(now.getTime() + 72 * 60 * 60 * 1000), // +3 days
      day5: new Date(now.getTime() + 96 * 60 * 60 * 1000), // +4 days
    };

    // In production, you would store this in a database and use a job queue
    // For demonstration, we'll log the schedule
    console.log(`Email sequence scheduled for ${email}:`, schedule);

    // Send immediate welcome email (Day 1)
    const welcomeEmail = await resend.emails.send({
      from: 'Sleep Revolution Toolkit <no-reply@sleeprevolutiontoolkit.com>',
      to: [email],
      subject: `${firstName}, Your Emergency Sleep Kit is Here! 🎯`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .cta-button { 
            display: inline-block; 
            background: #ff6b6b; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold; 
            margin: 20px 0;
        }
        .emergency-kit { background: white; padding: 20px; border-left: 4px solid #ff6b6b; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Your Emergency Sleep Kit Has Arrived!</h1>
        <p>Hi ${firstName}, ready to transform your sleep tonight?</p>
    </div>
    
    <div class="content">
        <div class="emergency-kit">
            <h3>📋 Your FREE Emergency Sleep Kit</h3>
            <p>Inside you'll find the <strong>Quick Reference Emergency Cards</strong> - your go-to guide when sleep problems strike at 2 AM.</p>
            
            <a href="https://sleeprevolutiontoolkit.com/toolkit/final-pdfs/Quick_Reference_Emergency_Cards.pdf" class="cta-button">
                📥 Download Your Emergency Kit
            </a>
            
            <p><strong>What's Inside:</strong></p>
            <ul>
                <li>✅ The 3-2-1 Knockout Protocol</li>
                <li>✅ Emergency Reset Button for 3 AM wake-ups</li>
                <li>✅ Instant Anxiety Neutralizer</li>
                <li>✅ Racing Mind Shutdown Sequence</li>
                <li>✅ Physical Tension Release Map</li>
            </ul>
        </div>
        
        <p><strong>Tonight's Challenge:</strong> Try the 3-2-1 Knockout Protocol. Most people fall asleep within 12 minutes on their first try.</p>
        
        <h3>🚀 Ready for the Complete Solution?</h3>
        <p>Your emergency kit is powerful, but it's just the beginning. The complete Sleep Revolution Toolkit contains advanced techniques that have helped over 47,000 people achieve consistent, restorative sleep.</p>
        
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email=${encodeURIComponent(email)}" class="cta-button">
            🔥 Get Complete Toolkit for $27 (Limited Time)
        </a>
        
        <p><strong>What you get with the complete toolkit:</strong></p>
        <ul>
            <li>🎯 Complete Sleep Optimization Guide (127 pages)</li>
            <li>📊 Advanced Sleep Tracking Templates</li>
            <li>🧘 Guided Sleep Meditations & Audio Content</li>
            <li>📈 30-Day Sleep Challenge Workbook</li>
            <li>🛏️ Bedroom Optimization Checklist</li>
            <li>⏰ Circadian Rhythm Reset Protocol</li>
        </ul>
        
        <p><em>P.S. This special $27 price is only available for a limited time. After that, it goes back to the full $97 price.</em></p>
    </div>
    
    <div class="footer">
        <p>Sleep Revolution Toolkit | Any questions? Reply to this email</p>
        <p>Orders: <a href="mailto:orders@sleeprevolutiontoolkit.com">orders@sleeprevolutiontoolkit.com</a></p>
        <p>Developed by <a href="https://kingsmenconsultancy.org">Kingsmen Consultancy</a></p>
    </div>
</body>
</html>
      `,
    });

    // For production, you would schedule the remaining emails using:
    // - Resend's scheduled sending feature (if available)
    // - A job queue system like Bull/BullMQ with Redis
    // - A cron job system
    // - AWS SES with Lambda and EventBridge
    // - Zapier/Make.com automation

    const sequenceData = {
      email,
      firstName,
      status: 'active',
      day1Sent: true,
      day1EmailId: welcomeEmail.data?.id,
      scheduledAt: now.toISOString(),
      schedule: {
        day2: schedule.day2.toISOString(),
        day3: schedule.day3.toISOString(),
        day4: schedule.day4.toISOString(),
        day5: schedule.day5.toISOString(),
      }
    };

    // In production, save this to your database
    console.log('Email sequence data:', sequenceData);

    res.status(200).json({ 
      message: 'Email sequence scheduled successfully',
      welcomeEmailId: welcomeEmail.data?.id,
      schedule: sequenceData.schedule
    });
    
  } catch (error) {
    console.error('Sequence scheduling error:', error);
    res.status(500).json({ 
      message: 'Failed to schedule email sequence', 
      error: error.message 
    });
  }
}