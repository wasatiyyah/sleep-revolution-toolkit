// Send email manually for your recent purchase
const { Resend } = require('resend');

async function sendManualEmail() {
  const resend = new Resend('re_fFkKMRJh_2jeX5vmeYKBFYj1rNKS5vETF');
  
  // Your most recent session ID from Stripe events
  const sessionId = 'cs_live_a1GXtuEd2jKb9qX4xt1BEE6RUkW5K8GOoIatERkgw8EkFxC5Echqh2SV58';
  const customerEmail = 'ukibrahim99@gmail.com';
  const customerName = 'Mohamed Ibrahim Maricar';
  
  const baseUrl = 'https://sleeprevolutiontoolkit.com';
  
  const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Your Sleep Revolution!</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .download-section { background: #f8fafc; border-radius: 8px; padding: 30px; margin: 30px 0; }
        .download-link { display: block; background: #6366f1; color: white; text-decoration: none; padding: 15px 25px; border-radius: 8px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s; }
        .download-link:hover { background: #4f46e5; }
        .main-download { background: #10b981; font-size: 18px; padding: 20px 30px; }
        .main-download:hover { background: #059669; }
        .footer { background: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">🌙</div>
            <h1>Welcome to Your Sleep Revolution!</h1>
            <p>Thank you ${customerName} for your purchase. Your transformation starts now!</p>
        </div>
        
        <div class="content">
            <h2>🎉 Your Order is Complete!</h2>
            <p>Your payment has been processed successfully. Below are your instant download links for the complete Sleep Revolution Toolkit.</p>
            
            <div class="download-section">
                <h3>📦 Download Your Complete Toolkit</h3>
                <p><strong>Get everything in one click:</strong></p>
                <a href="${baseUrl}/toolkit/final-pdfs/sleeprevolutiontoolkit.zip" class="download-link main-download" download>
                    ⬇️ Download Complete Toolkit (ZIP - All Files)
                </a>
                
                <h3>📚 Individual Downloads</h3>
                <a href="${baseUrl}/toolkit/final-pdfs/Sleep_Revolution_Toolkit_Main_Guide.pdf" class="download-link" download>
                    📖 Main Guide (78 pages) - The Complete System
                </a>
                <a href="${baseUrl}/toolkit/final-pdfs/Quick_Reference_Emergency_Cards.pdf" class="download-link" download>
                    🆘 Emergency Sleep Cards - Instant Relief
                </a>
                <a href="${baseUrl}/toolkit/final-pdfs/30_Day_Sleep_Revolution_Tracker.pdf" class="download-link" download>
                    📊 30-Day Tracker - Monitor Your Progress
                </a>
                <a href="${baseUrl}/toolkit/final-pdfs/Sleep_Revolution_Bonus_Materials.pdf" class="download-link" download>
                    🎁 Bonus Materials - 7 Extra Guides
                </a>
                <a href="${baseUrl}/toolkit/final-pdfs/Sleep_Soundscapes_Instructions.pdf" class="download-link" download>
                    🎵 Audio Soundscapes Guide
                </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #92400e; margin: 0 0 10px 0;">⚡ Quick Start Tips:</h3>
                <ol style="color: #92400e; margin: 0; padding-left: 20px;">
                    <li><strong>Start with the Main Guide</strong> - Read the first 3 chapters today</li>
                    <li><strong>Print the Emergency Cards</strong> - Keep them by your bedside</li>
                    <li><strong>Begin tracking tonight</strong> - Use the 30-Day Tracker</li>
                </ol>
            </div>
            
            <p><strong>Questions?</strong> Reply to this email and we'll help you get the most out of your toolkit.</p>
            
            <p>To your better sleep,<br>
            <strong>The Sleep Revolution Team</strong></p>
        </div>
        
        <div class="footer">
            <p>Order ID: ${sessionId}</p>
            <p>This email was sent because you purchased the Sleep Revolution Toolkit.</p>
            <p>© 2025 Sleep Revolution Toolkit. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: 'Sleep Revolution Toolkit <orders@sleeprevolutiontoolkit.com>',
      to: [customerEmail],
      subject: '🌙 Your Sleep Revolution Toolkit is Ready - Download Now!',
      html: emailTemplate,
    });

    console.log('✅ Manual email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Manual email sending failed:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

sendManualEmail()
  .then(() => {
    console.log('🎉 Manual email test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Manual email test failed:', error.message);
    process.exit(1);
  });