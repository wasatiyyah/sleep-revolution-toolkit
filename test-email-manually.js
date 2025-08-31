// Quick test to send email manually using Resend API
const { Resend } = require('resend');

async function testEmailSend() {
  const resend = new Resend('re_fFkKMRJh_2jeX5vmeYKBFYj1rNKS5vETF');
  
  const baseUrl = 'https://sleeprevolutiontoolkit.com';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1>🌙 Test Email - Sleep Revolution Toolkit</h1>
        <p>This is a test email to verify the system is working</p>
      </div>
      
      <div style="padding: 30px;">
        <h2>📦 Your Download Links:</h2>
        <a href="${baseUrl}/toolkit/final-pdfs/sleeprevolutiontoolkit.zip" 
           style="display: block; background: #10b981; color: white; text-decoration: none; 
                  padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; margin: 10px 0;">
          ⬇️ Download Complete ZIP
        </a>
        
        <p>This is a manual test of the email system.</p>
        
        <p>If you receive this, the email integration is working!</p>
      </div>
    </div>`;

  try {
    const result = await resend.emails.send({
      from: 'Sleep Revolution Toolkit <orders@sleeprevolutiontoolkit.com>',
      to: ['ibrahimhaleeth@gmail.com'],
      subject: '🧪 Test Email - Download Links Working!',
      html: htmlContent,
    });

    console.log('✅ Test email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

testEmailSend()
  .then(() => {
    console.log('🎉 Email test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Email test failed:', error.message);
    process.exit(1);
  });