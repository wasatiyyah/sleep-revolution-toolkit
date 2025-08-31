// Simple email service using nodemailer + Gmail
// Fallback option for quick setup

const nodemailer = require('nodemailer');

class SimpleEmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendDownloadLinks(customerEmail, customerName, sessionId) {
    const baseUrl = 'https://sleeprevolutiontoolkit.com';
    
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
        <h1>🌙 Welcome to Your Sleep Revolution!</h1>
        <p>Thank you ${customerName || ''} for your purchase!</p>
      </div>
      
      <div style="padding: 30px;">
        <h2>🎉 Download Your Complete Toolkit</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📦 Complete Toolkit (All Files)</h3>
          <a href="${baseUrl}/toolkit/final-pdfs/sleeprevolutiontoolkit.zip" 
             style="display: block; background: #10b981; color: white; text-decoration: none; 
                    padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; margin: 10px 0;">
            ⬇️ Download ZIP File (All PDFs)
          </a>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
          <h3>📚 Individual Downloads</h3>
          <a href="${baseUrl}/toolkit/final-pdfs/Sleep_Revolution_Toolkit_Main_Guide.pdf" 
             style="display: block; background: #6366f1; color: white; text-decoration: none; 
                    padding: 12px; border-radius: 6px; text-align: center; margin: 8px 0;">
            📖 Main Guide (78 pages)
          </a>
          <a href="${baseUrl}/toolkit/final-pdfs/Quick_Reference_Emergency_Cards.pdf" 
             style="display: block; background: #6366f1; color: white; text-decoration: none; 
                    padding: 12px; border-radius: 6px; text-align: center; margin: 8px 0;">
            🆘 Emergency Sleep Cards
          </a>
          <a href="${baseUrl}/toolkit/final-pdfs/30_Day_Sleep_Revolution_Tracker.pdf" 
             style="display: block; background: #6366f1; color: white; text-decoration: none; 
                    padding: 12px; border-radius: 6px; text-align: center; margin: 8px 0;">
            📊 30-Day Sleep Tracker
          </a>
          <a href="${baseUrl}/toolkit/final-pdfs/Sleep_Revolution_Bonus_Materials.pdf" 
             style="display: block; background: #6366f1; color: white; text-decoration: none; 
                    padding: 12px; border-radius: 6px; text-align: center; margin: 8px 0;">
            🎁 Bonus Materials (7 Guides)
          </a>
          <a href="${baseUrl}/toolkit/final-pdfs/Sleep_Soundscapes_Instructions.pdf" 
             style="display: block; background: #6366f1; color: white; text-decoration: none; 
                    padding: 12px; border-radius: 6px; text-align: center; margin: 8px 0;">
            🎵 Audio Soundscapes Guide
          </a>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e;">⚡ Quick Start:</h3>
          <p style="color: #92400e; margin: 0;">
            1. Download the ZIP file for everything<br>
            2. Start with the Main Guide (first 3 chapters)<br>
            3. Print the Emergency Cards for your bedside
          </p>
        </div>
        
        <p><strong>Questions?</strong> Reply to this email for support.</p>
        
        <p style="margin-top: 30px;">
          To your better sleep,<br>
          <strong>The Sleep Revolution Team</strong>
        </p>
      </div>
      
      <div style="background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px;">
        <p>Order ID: ${sessionId}</p>
        <p>© 2025 Sleep Revolution Toolkit</p>
      </div>
    </div>`;

    const mailOptions = {
      from: `"Sleep Revolution Toolkit" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: '🌙 Your Sleep Revolution Toolkit is Ready - Download Now!',
      html: htmlContent,
      text: `Welcome to your Sleep Revolution!

Thank you ${customerName || ''} for your purchase. 

Download your complete toolkit:
${baseUrl}/toolkit/final-pdfs/sleeprevolutiontoolkit.zip

Individual downloads:
- Main Guide: ${baseUrl}/toolkit/final-pdfs/Sleep_Revolution_Toolkit_Main_Guide.pdf
- Emergency Cards: ${baseUrl}/toolkit/final-pdfs/Quick_Reference_Emergency_Cards.pdf  
- Sleep Tracker: ${baseUrl}/toolkit/final-pdfs/30_Day_Sleep_Revolution_Tracker.pdf
- Bonus Materials: ${baseUrl}/toolkit/final-pdfs/Sleep_Revolution_Bonus_Materials.pdf
- Audio Guide: ${baseUrl}/toolkit/final-pdfs/Sleep_Soundscapes_Instructions.pdf

Order ID: ${sessionId}

Questions? Reply to this email.

To your better sleep,
The Sleep Revolution Team`
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }
}

module.exports = SimpleEmailService;