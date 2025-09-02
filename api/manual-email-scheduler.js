// Manual Email Scheduler for Testing
// Use this to manually send sequence emails during testing

const { sendSequenceEmail } = require('./resend-automation');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { firstName, email, day, action } = req.body;

  if (!firstName || !email || day === undefined) {
    return res.status(400).json({ 
      message: 'Missing required fields: firstName, email, day',
      example: {
        firstName: "John",
        email: "john@example.com",
        day: 1,
        action: "send_test_email"
      }
    });
  }

  try {
    if (action === 'send_test_email') {
      const result = await sendSequenceEmail(day, firstName, email);
      
      res.status(200).json({
        message: `Day ${day} email sent successfully`,
        emailId: result.id,
        recipient: email,
        subject: getEmailSubject(day, firstName)
      });
      
    } else if (action === 'preview_sequence') {
      // Return all email subjects for preview
      const sequence = Array.from({ length: 7 }, (_, i) => ({
        day: i,
        subject: getEmailSubject(i, firstName),
        description: getEmailDescription(i)
      }));
      
      res.status(200).json({
        sequence,
        recipient: email,
        totalEmails: sequence.length
      });
      
    } else {
      res.status(400).json({ 
        message: 'Invalid action. Use "send_test_email" or "preview_sequence"' 
      });
    }

  } catch (error) {
    console.error('Manual scheduler error:', error);
    res.status(500).json({
      message: 'Failed to process request',
      error: error.message
    });
  }
}

function getEmailSubject(day, firstName) {
  const subjects = [
    `${firstName}, Your Emergency Sleep Kit is Here! 🎯`,
    `${firstName}, why your brain fights sleep (and how to win) 🧠`,
    `${firstName}, 847 people bought this yesterday... 📈`,
    `${firstName}, the $853 toolkit for $27 (here's why) 💰`,
    `${firstName}, what if tonight was different? 🌙`,
    `${firstName}, price increases tomorrow ⚠️`,
    `${firstName}, final call - this is it ⏰`
  ];
  
  return subjects[day] || `${firstName}, Sleep Revolution Update`;
}

function getEmailDescription(day) {
  const descriptions = [
    "Welcome email with emergency kit download link",
    "Problem agitation - why brain fights sleep",  
    "Social proof - 847 people bought yesterday",
    "Value stack - $853 toolkit for $27",
    "Visualization - what if tonight was different", 
    "Urgency - price increases tomorrow",
    "Final urgency - last chance"
  ];
  
  return descriptions[day] || "Follow-up email";
}

// Usage examples in response
function getUsageExamples() {
  return {
    "Send specific email": {
      "method": "POST",
      "url": "/api/manual-email-scheduler",
      "body": {
        "firstName": "John",
        "email": "john@example.com", 
        "day": 1,
        "action": "send_test_email"
      }
    },
    "Preview sequence": {
      "method": "POST", 
      "url": "/api/manual-email-scheduler",
      "body": {
        "firstName": "John",
        "email": "john@example.com",
        "action": "preview_sequence"
      }
    }
  };
}