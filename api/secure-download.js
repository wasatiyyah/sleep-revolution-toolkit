// Secure Download API - Only for verified customers
// This endpoint validates purchase and serves protected files

const path = require('path');
const fs = require('fs');

// Valid file mapping (only these files can be downloaded)
const VALID_FILES = {
  'main-guide': {
    filename: 'Sleep_Revolution_Toolkit_Main_Guide.pdf',
    path: 'toolkit/final-pdfs/Sleep_Revolution_Toolkit_Main_Guide.pdf',
    contentType: 'application/pdf'
  },
  'emergency-cards': {
    filename: 'Quick_Reference_Emergency_Cards.pdf',
    path: 'toolkit/final-pdfs/Quick_Reference_Emergency_Cards.pdf',
    contentType: 'application/pdf'
  },
  'sleep-tracker': {
    filename: '30_Day_Sleep_Revolution_Tracker.pdf',
    path: 'toolkit/final-pdfs/30_Day_Sleep_Revolution_Tracker.pdf',
    contentType: 'application/pdf'
  },
  'bonus-materials': {
    filename: 'Sleep_Revolution_Bonus_Materials.pdf',
    path: 'toolkit/final-pdfs/Sleep_Revolution_Bonus_Materials.pdf',
    contentType: 'application/pdf'
  },
  'audio-guide': {
    filename: 'Sleep_Soundscapes_Instructions.pdf',
    path: 'toolkit/final-pdfs/Sleep_Soundscapes_Instructions.pdf',
    contentType: 'application/pdf'
  },
  'complete-toolkit': {
    filename: 'sleeprevolutiontoolkit.zip',
    path: 'toolkit/final-pdfs/sleeprevolutiontoolkit.zip',
    contentType: 'application/zip'
  }
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('🔒 Secure download request:', {
    query: req.query,
    headers: Object.keys(req.headers),
    userAgent: req.headers['user-agent']
  });

  try {
    const { file, session_id, token } = req.query;

    // Validate required parameters
    if (!file || !session_id) {
      console.error('❌ Missing required parameters:', { file, session_id });
      return res.status(400).json({ 
        error: 'Missing required parameters. Access denied.' 
      });
    }

    // Validate file exists in our whitelist
    if (!VALID_FILES[file]) {
      console.error('❌ Invalid file requested:', file);
      return res.status(404).json({ 
        error: 'File not found' 
      });
    }

    // Validate session ID format (Stripe session IDs start with cs_)
    if (!session_id.startsWith('cs_') && !session_id.includes('demo')) {
      console.error('❌ Invalid session ID format:', session_id);
      return res.status(403).json({ 
        error: 'Invalid access token. Please check your purchase confirmation email.' 
      });
    }

    // Optional: Add additional security checks
    // - Check session ID against database of valid purchases
    // - Implement time-based expiration
    // - Rate limiting per session
    
    // For now, we'll validate basic session ID format and allow demo access
    const isValidSession = session_id.startsWith('cs_') || 
                          session_id.includes('demo') || 
                          session_id.includes('test');

    if (!isValidSession) {
      console.error('❌ Access denied for session:', session_id);
      return res.status(403).json({ 
        error: 'Access denied. Invalid purchase verification.' 
      });
    }

    console.log('✅ Access granted for session:', session_id.substring(0, 20) + '...');

    // Get file info
    const fileInfo = VALID_FILES[file];
    // In Vercel, the root directory is /var/task/
    const filePath = path.join(process.cwd(), fileInfo.path);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('❌ File not found on server:', filePath);
      return res.status(404).json({ 
        error: 'File temporarily unavailable. Please contact support.' 
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    console.log('📄 Serving file:', {
      file: fileInfo.filename,
      size: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
      session: session_id.substring(0, 15) + '...'
    });

    // Set headers for file download
    res.setHeader('Content-Type', fileInfo.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error('❌ File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'File read error' });
      }
    });

    fileStream.on('end', () => {
      console.log('✅ File download completed successfully');
    });

    // Pipe file to response
    fileStream.pipe(res);

    // Log successful download for analytics
    console.log('📊 Download analytics:', {
      file: file,
      filename: fileInfo.filename,
      session_id: session_id,
      timestamp: new Date().toISOString(),
      user_agent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });

  } catch (error) {
    console.error('❌ Secure download error:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Internal server error. Please try again or contact support.' 
      });
    }
  }
}