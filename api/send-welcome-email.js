const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { firstName, email } = req.body;

  if (!firstName || !email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Send immediate welcome email with emergency kit
    const { data, error } = await resend.emails.send({
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
                <li>✅ Quick Reference Cards for bedside use</li>
            </ul>
        </div>
        
        <p><strong>Tonight's Challenge:</strong> Try the 3-2-1 Knockout Protocol. Most people fall asleep within 12 minutes on their first try.</p>
        
        <h3>🚀 Ready for the Complete Sleep Transformation?</h3>
        <p>Your emergency kit is powerful, but it's just the beginning. The complete Sleep Revolution Toolkit contains advanced techniques that have helped over 47,000 people achieve consistent, restorative sleep.</p>
        
        <p><strong>What you get with the complete toolkit:</strong></p>
        <ul>
            <li>🎯 Complete Sleep Optimization Guide (127 pages)</li>
            <li>📊 Advanced Sleep Tracking Templates</li>
            <li>🧘 Guided Sleep Meditations & Audio Content</li>
            <li>📈 30-Day Sleep Challenge Workbook</li>
            <li>🛏️ Bedroom Optimization Checklist</li>
            <li>⏰ Circadian Rhythm Reset Protocol</li>
        </ul>
        
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email=${encodeURIComponent(email)}" class="cta-button">
            🔥 Get Complete Toolkit for $27 (Limited Time)
        </a>
        
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

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Add subscriber to Supabase database for automation
    try {
      console.log('🚀 Adding subscriber to database for automation:', firstName, email);
      
      const { addSubscriber } = require('./supabase-email-automation.js');
      await addSubscriber(email, firstName);
      
      console.log('✅ Subscriber added to 7-day email sequence:', email);
    } catch (automationError) {
      console.error('❌ Database automation error:', automationError);
      // Continue without failing the main request
    }
    
    console.log('✅ Welcome email sent successfully to:', email);
    
    res.status(200).json({ 
      message: 'Welcome email sent and sequence scheduled', 
      emailId: data.id,
      sequenceScheduled: true
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      message: 'Failed to send email', 
      error: error.message 
    });
  }
}