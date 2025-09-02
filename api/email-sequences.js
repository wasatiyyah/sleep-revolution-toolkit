const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// Email sequence templates
const emailSequence = {
  // Day 1: Welcome + Emergency Kit
  day1: {
    subject: "{{firstName}}, Your Emergency Sleep Kit is Here! 🎯",
    template: `
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
        <p>Hi {{firstName}}, ready to transform your sleep tonight?</p>
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
        <p>Your emergency kit is powerful, but it's just the beginning. Tomorrow I'll show you the complete system that's helped over 47,000 people achieve consistent, restorative sleep.</p>
        
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email={{email}}" class="cta-button">
            🔥 Get the Complete Toolkit ($27 - Limited Time)
        </a>
    </div>
    
    <div class="footer">
        <p>Sleep Revolution Toolkit | Questions? Reply to this email</p>
        <p>Developed by <a href="https://kingsmenconsultancy.org">Kingsmen Consultancy</a></p>
    </div>
</body>
</html>
    `
  },

  // Day 2: Problem Agitation
  day2: {
    subject: "{{firstName}}, why your brain fights sleep (and how to win) 🧠",
    template: `
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
        .story-box { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 The Sleep Saboteur Living in Your Head</h1>
        <p>Hi {{firstName}}, did you try the emergency kit last night?</p>
    </div>
    
    <div class="content">
        <p>Here's something most people don't realize...</p>
        
        <div class="story-box">
            <h3>Your Brain is Hardwired to Keep You Awake</h3>
            <p>Every night at bedtime, your brain runs a "safety check" - scanning for problems, threats, and unfinished business. This evolutionary survival mechanism kicks into overdrive in our modern world.</p>
            
            <p><strong>The result?</strong> Your mind races with:</p>
            <ul>
                <li>❌ Tomorrow's deadlines and meetings</li>
                <li>❌ That awkward conversation from 3 years ago</li>
                <li>❌ Financial worries and "what if" scenarios</li>
                <li>❌ Physical tension you can't seem to release</li>
                <li>❌ The crushing pressure to "just fall asleep already"</li>
            </ul>
        </div>
        
        <p>Sound familiar? You're not broken. Your brain is doing exactly what it's supposed to do. The problem is nobody taught you how to <strong>override the system.</strong></p>
        
        <h3>The Solution Most People Miss</h3>
        <p>Quick fixes and sleep hygiene tips only scratch the surface. You need a complete system that:</p>
        <ul>
            <li>✅ Interrupts your brain's survival scanning</li>
            <li>✅ Redirects your nervous system into sleep mode</li>
            <li>✅ Creates new neural pathways for effortless sleep</li>
            <li>✅ Works even on your most stressful nights</li>
        </ul>
        
        <p>That's exactly what the complete Sleep Revolution Toolkit does.</p>
        
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email={{email}}" class="cta-button">
            🧠 Get the Complete Brain Override System ($27)
        </a>
        
        <p><em>P.S. This special pricing ends soon. After that, it returns to the full $97.</em></p>
    </div>
    
    <div class="footer">
        <p>Sleep Revolution Toolkit | Questions? Reply to this email</p>
        <p>Developed by <a href="https://kingsmenconsultancy.org">Kingsmen Consultancy</a></p>
    </div>
</body>
</html>
    `
  },

  // Day 3: Social Proof & Urgency
  day3: {
    subject: "{{firstName}}, 847 people bought this yesterday... 📈",
    template: `
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
        .testimonial { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 15px 0; border-radius: 5px; }
        .urgency-box { background: #fee2e2; border: 2px solid #ef4444; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📈 This is Getting Crazy...</h1>
        <p>Hi {{firstName}}, the results keep pouring in</p>
    </div>
    
    <div class="content">
        <p>847 people purchased the complete Sleep Revolution Toolkit yesterday alone.</p>
        
        <p>And the reviews? They're insane...</p>
        
        <div class="testimonial">
            <p><strong>"I was skeptical, but this changed everything. First night: 8 minutes to fall asleep. I haven't slept this well since college."</strong></p>
            <p>- Sarah M., Marketing Director</p>
        </div>
        
        <div class="testimonial">
            <p><strong>"The Circadian Reset Protocol is pure gold. My energy during the day has completely transformed. Worth 10x the price."</strong></p>
            <p>- David L., Software Engineer</p>
        </div>
        
        <div class="testimonial">
            <p><strong>"My 3 AM wake-ups are GONE. The bedroom optimization checklist alone saved my marriage."</strong></p>
            <p>- Jennifer K., Mother of 3</p>
        </div>
        
        <h3>Why the Rush?</h3>
        <p>People are finally realizing that quality sleep isn't a luxury - it's the foundation of everything:</p>
        <ul>
            <li>🧠 <strong>Cognitive Performance:</strong> Better decisions, sharper focus</li>
            <li>💪 <strong>Physical Health:</strong> Stronger immune system, weight management</li>
            <li>😊 <strong>Mental Resilience:</strong> Lower stress, better mood</li>
            <li>💰 <strong>Career Success:</strong> More energy for high-level work</li>
            <li>❤️ <strong>Relationships:</strong> More patience, presence, and connection</li>
        </ul>
        
        <div class="urgency-box">
            <h3>⏰ Price Increase Coming</h3>
            <p>Due to overwhelming demand, we're increasing the price to $97 on Friday.</p>
            <p><strong>Last chance to get it for $27.</strong></p>
        </div>
        
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email={{email}}" class="cta-button">
            🚀 Join 847+ People Who Slept Better Last Night ($27)
        </a>
        
        <p>Don't let another sleepless night steal your tomorrow.</p>
    </div>
    
    <div class="footer">
        <p>Sleep Revolution Toolkit | Questions? Reply to this email</p>
        <p>Developed by <a href="https://kingsmenconsultancy.org">Kingsmen Consultancy</a></p>
    </div>
</body>
</html>
    `
  },

  // Day 4: Value Stack & Authority
  day4: {
    subject: "{{firstName}}, the $853 toolkit for $27 (here's why) 💰",
    template: `
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
        .value-item { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981; border-radius: 5px; }
        .price-comparison { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>💰 Why I'm "Giving Away" $853 for $27</h1>
        <p>Hi {{firstName}}, let me be completely transparent...</p>
    </div>
    
    <div class="content">
        <p>You might be wondering why I'm practically giving away a toolkit that's worth $853.</p>
        
        <p>Here's the honest truth:</p>
        
        <p><strong>I spent 3 years and $47,000</strong> creating this system. I worked with sleep researchers, tested it with over 1,000 insomniacs, and refined every technique until it delivered consistent results.</p>
        
        <h3>What You're Actually Getting:</h3>
        
        <div class="value-item">
            <h4>🎯 Complete Sleep Optimization Guide (127 pages) - $197 value</h4>
            <p>The master playbook covering every aspect of sleep science, from circadian rhythms to sleep architecture.</p>
        </div>
        
        <div class="value-item">
            <h4>📊 Advanced Sleep Tracking Templates - $97 value</h4>
            <p>Identify your unique sleep patterns and optimize accordingly. No expensive devices needed.</p>
        </div>
        
        <div class="value-item">
            <h4>🧘 Guided Sleep Meditations & Audio Content - $147 value</h4>
            <p>Professional recordings designed to guide your nervous system into deep sleep states.</p>
        </div>
        
        <div class="value-item">
            <h4>📈 30-Day Sleep Challenge Workbook - $87 value</h4>
            <p>Day-by-day action plan to transform your sleep in 30 days. With progress tracking and troubleshooting.</p>
        </div>
        
        <div class="value-item">
            <h4>🛏️ Bedroom Optimization Checklist - $67 value</h4>
            <p>Turn your bedroom into a sleep sanctuary. Small changes, massive results.</p>
        </div>
        
        <div class="value-item">
            <h4>⏰ Circadian Rhythm Reset Protocol - $127 value</h4>
            <p>Reset your internal clock for natural, effortless sleep timing.</p>
        </div>
        
        <div class="value-item">
            <h4>🎁 Quick Reference Emergency Cards - $47 value</h4>
            <p>The emergency kit you already have, but now in the complete context.</p>
        </div>
        
        <div class="value-item">
            <h4>📞 Email Support Access - $87 value</h4>
            <p>Direct access to our sleep optimization team for questions and troubleshooting.</p>
        </div>
        
        <div class="price-comparison">
            <h3>Total Value: <span style="text-decoration: line-through; color: #999;">$853</span></h3>
            <h2 style="color: #10b981; font-size: 36px;">Your Price: $27</h2>
            <p><strong>That's 97% off</strong></p>
        </div>
        
        <h3>Why So Cheap?</h3>
        <p>Simple. I'd rather have 10,000 people sleeping better than 100 people paying full price. This is my way of making a real impact.</p>
        
        <p><strong>But this pricing won't last.</strong> On Friday, it returns to $97.</p>
        
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email={{email}}" class="cta-button">
            💰 Get $853 Worth of Sleep Tools for $27
        </a>
        
        <p>Your sleep transformation starts tonight.</p>
    </div>
    
    <div class="footer">
        <p>Sleep Revolution Toolkit | Questions? Reply to this email</p>
        <p>Developed by <a href="https://kingsmenconsultancy.org">Kingsmen Consultancy</a></p>
    </div>
</body>
</html>
    `
  },

  // Day 5: Final Urgency
  day5: {
    subject: "{{firstName}}, price goes up TOMORROW ⏰",
    template: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .cta-button { 
            display: inline-block; 
            background: #ef4444; 
            color: white; 
            padding: 18px 40px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold; 
            margin: 20px 0;
            font-size: 18px;
        }
        .countdown-box { background: #fee2e2; border: 3px solid #ef4444; padding: 30px; border-radius: 10px; margin: 20px 0; text-align: center; }
        .price-jump { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; border: 2px solid #ef4444; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⏰ FINAL NOTICE</h1>
        <p>Hi {{firstName}}, this is it...</p>
    </div>
    
    <div class="content">
        <div class="countdown-box">
            <h2>🚨 24 HOURS LEFT</h2>
            <p>Tomorrow at midnight, the Sleep Revolution Toolkit returns to its full price of $97.</p>
        </div>
        
        <p>I've been tracking the numbers, and here's what's happened since I launched this $27 special:</p>
        
        <ul>
            <li>✅ 2,847 people have transformed their sleep</li>
            <li>✅ Average time to fall asleep: 11.4 minutes</li>
            <li>✅ 94.7% report deeper, more restorative sleep</li>
            <li>✅ 89.3% say their energy levels improved dramatically</li>
        </ul>
        
        <div class="price-jump">
            <h3>Tomorrow's Reality:</h3>
            <p style="font-size: 24px;"><strong>$27 → $97</strong></p>
            <p>That's a $70 increase overnight.</p>
        </div>
        
        <p><strong>{{firstName}}, I have to ask...</strong></p>
        
        <p>How much is one more night of quality sleep worth to you?</p>
        
        <ul>
            <li>🌅 Waking up refreshed instead of groggy</li>
            <li>🧠 Sharp mental clarity all day long</li>
            <li>💪 Energy to tackle your biggest challenges</li>
            <li>😊 Patience and presence with your loved ones</li>
            <li>🎯 Peak performance in everything you do</li>
        </ul>
        
        <p>If it's worth more than $27, then this decision is easy.</p>
        
        <p>If you wait until tomorrow, you'll pay $97 for the exact same toolkit.</p>
        
        <a href="https://sleeprevolutiontoolkit.com/upsell-toolkit.html?email={{email}}" class="cta-button">
            🚨 Get the Toolkit for $27 (Last 24 Hours)
        </a>
        
        <p><em>After midnight tomorrow, this email will be the most expensive email you didn't act on.</em></p>
        
        <p>Don't let this opportunity slip away like another sleepless night.</p>
    </div>
    
    <div class="footer">
        <p>Sleep Revolution Toolkit | Questions? Reply to this email</p>
        <p>Developed by <a href="https://kingsmenconsultancy.org">Kingsmen Consultancy</a></p>
    </div>
</body>
</html>
    `
  }
};

// Function to send email sequence
async function sendSequenceEmail(day, email, firstName) {
  const emailTemplate = emailSequence[`day${day}`];
  if (!emailTemplate) {
    throw new Error(`Email template for day ${day} not found`);
  }

  // Replace placeholders
  let subject = emailTemplate.subject.replace(/{{firstName}}/g, firstName);
  let html = emailTemplate.template
    .replace(/{{firstName}}/g, firstName)
    .replace(/{{email}}/g, encodeURIComponent(email));

  const { data, error } = await resend.emails.send({
    from: 'Sleep Revolution Toolkit <no-reply@sleeprevolutiontoolkit.com>',
    to: [email],
    subject: subject,
    html: html,
  });

  if (error) {
    throw new Error(`Failed to send day ${day} email: ${error.message}`);
  }

  return data;
}

// API endpoint handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { day, email, firstName } = req.body;

  if (!day || !email || !firstName) {
    return res.status(400).json({ message: 'Missing required fields: day, email, firstName' });
  }

  try {
    const result = await sendSequenceEmail(day, email, firstName);
    
    res.status(200).json({ 
      message: `Day ${day} email sent successfully`, 
      emailId: result.id 
    });
    
  } catch (error) {
    console.error('Email sequence error:', error);
    res.status(500).json({ 
      message: 'Failed to send sequence email', 
      error: error.message 
    });
  }
}

module.exports = { sendSequenceEmail, emailSequence };