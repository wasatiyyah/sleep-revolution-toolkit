// This runs daily at 9 AM UTC via Vercel Cron
// Add to vercel.json: { "crons": [{ "path": "/api/cron-email-sender", "schedule": "0 9 * * *" }] }

const { processDailyEmails } = require('./supabase-email-automation');

module.exports = async function handler(req, res) {
  // Verify this is from Vercel Cron (for security)
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('⏰ Cron job started:', new Date().toISOString());
    
    // Process daily emails
    await processDailyEmails();
    
    console.log('✅ Cron job completed successfully');
    res.status(200).json({ 
      success: true, 
      message: 'Daily emails processed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Cron job failed:', error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};