// Improved AWS Lambda function to forward emails with clean formatting
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const ses = new SESClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });

export const handler = async (event) => {
    console.log('📧 Email forwarding triggered:', JSON.stringify(event, null, 2));
    
    try {
        for (const record of event.Records) {
            if (record.eventSource === 'aws:ses') {
                await processEmailRecord(record);
            }
        }
        
        return { statusCode: 200, body: 'Email forwarded successfully' };
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
};

async function processEmailRecord(record) {
    const sesEvent = record.ses;
    const messageId = sesEvent.mail.messageId;
    const bucketName = 'sleeprevolutiontoolkit-emails';
    const objectKey = `emails/${messageId}`;
    
    console.log(`📨 Processing email: ${messageId}`);
    
    try {
        // Get the email from S3
        const getObjectCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey
        });
        
        const emailObject = await s3.send(getObjectCommand);
        const rawEmail = await streamToString(emailObject.Body);
        
        // Parse email more intelligently
        const emailData = parseEmail(rawEmail, sesEvent);
        
        // Always prefer SES headers for reliability (they're already parsed by AWS)
        emailData.from = sesEvent.mail.commonHeaders.from?.[0] || emailData.from;
        emailData.subject = sesEvent.mail.commonHeaders.subject || emailData.subject;
        emailData.date = sesEvent.mail.commonHeaders.date || emailData.date;
        emailData.to = sesEvent.mail.commonHeaders.to?.[0] || emailData.to;
        
        // Use SES mail headers if parsing fails for body
        if (!emailData.body || emailData.body.trim() === '') {
            console.log('⚠️ Email body is empty, using fallback extraction');
            // Try to extract body from raw email more aggressively
            const bodyMatch = rawEmail.match(/\n\n([\s\S]+)$/);
            if (bodyMatch) {
                emailData.body = bodyMatch[1].trim();
            }
        }
        
        console.log('📧 Email data:', {
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            bodyLength: emailData.body?.length || 0
        });
        
        // Create clean forwarded email
        const forwardedSubject = `[Customer Email] ${emailData.subject}`;
        
        // Create clean HTML and text versions
        const htmlBody = createHtmlForwardedEmail(emailData, messageId);
        const textBody = createTextForwardedEmail(emailData, messageId);
        
        // Validate and clean the reply-to email - extract just the email address
        const getValidReplyTo = (fromEmail) => {
            if (!fromEmail) return null;
            
            // Extract email from formats like "Name <email@domain.com>" or just "email@domain.com"
            let emailMatch = fromEmail.match(/<([^>]+)>/);  // Extract from angle brackets
            let email = emailMatch ? emailMatch[1] : fromEmail;
            
            // Clean the extracted email
            email = email.replace(/[<>"'\r\n\t\f\v\u0000-\u001F\u007F-\u009F]/g, '').trim();
            email = email.replace(/\s/g, ''); // Remove any remaining whitespace
            
            // Validate email format
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (emailRegex.test(email) && email.length < 100) {
                return email;
            }
            return null;
        };
        
        const replyToEmail = getValidReplyTo(emailData.from);
        console.log('🔍 Reply-To processing:', {
            originalFrom: JSON.stringify(emailData.from),
            cleanedReplyTo: replyToEmail
        });
        
        // Send clean forwarded email
        const sendEmailCommand = new SendEmailCommand({
            Source: 'orders@sleeprevolutiontoolkit.com',
            Destination: {
                ToAddresses: ['ibrahimhaleeth@gmail.com']
            },
            ReplyToAddresses: replyToEmail && replyToEmail !== 'orders@sleeprevolutiontoolkit.com' ? [replyToEmail] : [],
            Message: {
                Subject: {
                    Data: forwardedSubject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Text: {
                        Data: textBody,
                        Charset: 'UTF-8'
                    },
                    Html: {
                        Data: htmlBody,
                        Charset: 'UTF-8'
                    }
                }
            },
            Tags: [
                {
                    Name: 'Type',
                    Value: 'CustomerForward'
                },
                {
                    Name: 'MessageId',
                    Value: messageId.substring(0, 50)  // Use message ID instead which is always valid
                }
            ]
        });
        
        const result = await ses.send(sendEmailCommand);
        console.log(`✅ Email forwarded successfully: ${result.MessageId}`);
        
        return result;
        
    } catch (error) {
        console.error(`❌ Error processing email ${messageId}:`, error);
        throw error;
    }
}

function parseEmail(rawEmail, sesEvent) {
    // Split headers and body - look for double newline
    let headerSection = '';
    let bodySection = '';
    
    // Try different newline patterns
    const doubleNewlineIndex = rawEmail.indexOf('\n\n');
    const crlfIndex = rawEmail.indexOf('\r\n\r\n');
    
    if (crlfIndex > -1 && (doubleNewlineIndex === -1 || crlfIndex < doubleNewlineIndex)) {
        headerSection = rawEmail.substring(0, crlfIndex);
        bodySection = rawEmail.substring(crlfIndex + 4);
    } else if (doubleNewlineIndex > -1) {
        headerSection = rawEmail.substring(0, doubleNewlineIndex);
        bodySection = rawEmail.substring(doubleNewlineIndex + 2);
    } else {
        headerSection = rawEmail;
        bodySection = '';
    }
    
    // Parse headers
    const headers = {};
    const headerLines = headerSection.split(/\r?\n/);
    let currentHeader = '';
    
    for (const line of headerLines) {
        if (line.match(/^[A-Za-z-]+:/)) {
            const match = line.match(/^([^:]+):\\s*(.*)$/);
            if (match) {
                currentHeader = match[1].toLowerCase();
                headers[currentHeader] = match[2].trim();
            }
        } else if (currentHeader && line.match(/^\s+/)) {
            // Continuation of previous header
            headers[currentHeader] += ' ' + line.trim();
        }
    }
    
    // Extract clean body content
    let cleanBody = bodySection;
    
    // Handle multipart content
    if (headers['content-type'] && headers['content-type'].includes('multipart')) {
        cleanBody = extractPlainTextFromMultipart(bodySection);
    }
    
    // Remove MIME boundaries and technical headers VERY aggressively
    cleanBody = cleanBody
        // Remove ALL MIME boundaries (hex patterns)
        .replace(/^--[0-9a-f]{10,}[0-9a-f]*--?\s*$/gm, '') // Remove complete boundary lines
        .replace(/--[0-9a-f]{10,}[0-9a-f]*--?/gi, '') // Remove inline boundaries
        .replace(/--[\w\d-]+--?\s*$/gm, '') // Remove standard boundaries on their own lines
        .replace(/--[\w\d-]+--?/g, '') // Remove any remaining boundaries
        
        // Remove ALL HTML tags and content
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&nbsp;/g, ' ') // Convert HTML spaces
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') // Convert HTML entities
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'") // More HTML entities
        
        // Remove technical headers
        .replace(/Content-[^:]*: [^\n]+\n?/gi, '') // Remove ALL content headers
        .replace(/MIME-Version: [^\n]+\n?/gi, '') // Remove MIME version
        
        // Clean up whitespace and formatting
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n{3,}/g, '\n\n') // Reduce excessive line breaks
        .replace(/^\s*\n/gm, '') // Remove empty lines at start
        .replace(/\s+$/gm, '') // Remove trailing spaces
        .replace(/^\s+/gm, '') // Remove leading spaces (but preserve structure)
        .trim();
    
    // Clean email addresses and text fields - more comprehensive cleaning
    const cleanEmail = (email) => {
        if (!email) return null;
        return email.trim()
            .replace(/[\r\n\t\f\v]/g, '') // Remove all control characters
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .trim();
    };
    const cleanText = (text) => {
        if (!text) return null;
        return text.trim()
            .replace(/[\r\n\t\f\v]/g, ' ') // Replace control chars with space
            .replace(/\s+/g, ' ') // Collapse multiple spaces
            .trim();
    };

    return {
        from: cleanEmail(headers.from) || 'orders@sleeprevolutiontoolkit.com',  // Use valid email as fallback
        to: cleanEmail(headers.to) || 'orders@sleeprevolutiontoolkit.com',
        replyTo: cleanEmail(headers['reply-to']),
        subject: cleanText(headers.subject) || 'No Subject',
        date: cleanText(headers.date) || new Date().toISOString(),
        messageId: cleanText(headers['message-id']),
        body: cleanBody,
        originalHeaders: headerSection
    };
}

function extractPlainTextFromMultipart(body) {
    // Try to find text/plain section first (handles hex boundaries better)
    let textMatch = body.match(/Content-Type: text\/plain[\s\S]*?\n\n([\s\S]*?)(?=\n--[0-9a-f]{10,}|--[\w\d-]+|\r?\n\r?\n|$)/i);
    if (textMatch && textMatch[1].trim()) {
        return textMatch[1].trim();
    }
    
    // Try alternative pattern for Gmail-style multipart
    textMatch = body.match(/\n\n([^\n-]+[\s\S]*?)(?=\n--[0-9a-f]{10,}|$)/i);
    if (textMatch && textMatch[1].trim()) {
        return textMatch[1].trim();
    }
    
    // Extract just text between boundaries, ignore HTML
    const htmlMatch = body.match(/Content-Type: text\/html[\s\S]*?\n\n([\s\S]*?)(?=\n--[0-9a-f]{10,}|--[\w\d-]+|$)/i);
    if (htmlMatch) {
        return htmlMatch[1]
            .replace(/<[^>]+>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    }
    
    // Last resort: extract any readable text and clean VERY aggressively
    let cleaned = body
        // Remove ALL boundary patterns
        .replace(/^--[0-9a-f]{10,}[0-9a-f]*--?\s*$/gm, '') // Complete boundary lines
        .replace(/--[0-9a-f]{10,}[0-9a-f]*--?/gi, '') // Any boundaries
        .replace(/--[\w\d-]+--?/g, '') // Standard boundaries
        
        // Remove ALL technical content
        .replace(/Content-[^:]*: [^\n]+\n?/gi, '') // All content headers
        .replace(/MIME-Version: [^\n]+\n?/gi, '') // MIME version
        .replace(/boundary=[^;\n]+/gi, '') // Boundary definitions
        
        // Remove ALL HTML completely
        .replace(/<[^>]*>/g, '') // All HTML tags
        .replace(/&[a-zA-Z0-9#]+;/g, ' ') // All HTML entities
        
        // Clean formatting
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\n{2,}/g, '\n') // Collapse multiple newlines
        .replace(/^\s*\n/gm, '') // Remove empty lines
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
    
    return cleaned || body;
}

function createTextForwardedEmail(emailData, messageId) {
    return `
📧 CUSTOMER EMAIL RECEIVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FROM: ${emailData.from}
TO: ${emailData.to}
DATE: ${emailData.date}
SUBJECT: ${emailData.subject}
${emailData.replyTo ? `REPLY-TO: ${emailData.replyTo}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MESSAGE CONTENT:

${emailData.body}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Email Details:
• Message ID: ${messageId}
• Received: ${new Date().toLocaleString()}
• Service: Sleep Revolution Toolkit

💡 Reply directly to this email to respond to the customer.
    `.trim();
}

function createHtmlForwardedEmail(emailData, messageId) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007bff; }
        .customer-info { background: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
        .message-content { background: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 6px; margin-bottom: 20px; }
        .footer { background: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 0.9em; color: #666; }
        .label { font-weight: bold; color: #495057; }
        .emoji { font-size: 1.2em; }
        .reply-note { background: #d4edda; border: 1px solid #c3e6cb; padding: 12px; border-radius: 4px; color: #155724; }
    </style>
</head>
<body>
    <div class="header">
        <h2><span class="emoji">📧</span> Customer Email Received</h2>
        <p>New message for Sleep Revolution Toolkit</p>
    </div>
    
    <div class="customer-info">
        <p><span class="label">From:</span> ${escapeHtml(emailData.from)}</p>
        <p><span class="label">To:</span> ${escapeHtml(emailData.to)}</p>
        <p><span class="label">Date:</span> ${escapeHtml(emailData.date)}</p>
        <p><span class="label">Subject:</span> ${escapeHtml(emailData.subject)}</p>
        ${emailData.replyTo ? `<p><span class="label">Reply-To:</span> ${escapeHtml(emailData.replyTo)}</p>` : ''}
    </div>
    
    <div class="message-content">
        <h3>Message Content:</h3>
        <div style="white-space: pre-wrap; font-family: 'Courier New', monospace; background: #f8f9fa; padding: 15px; border-radius: 4px;">
${escapeHtml(emailData.body)}
        </div>
    </div>
    
    <div class="reply-note">
        <strong>💡 Quick Reply:</strong> Reply directly to this email to respond to the customer.
    </div>
    
    <div class="footer">
        <p><strong>Email Details:</strong></p>
        <ul>
            <li>Message ID: ${messageId}</li>
            <li>Received: ${new Date().toLocaleString()}</li>
            <li>Service: Sleep Revolution Toolkit</li>
        </ul>
    </div>
</body>
</html>
    `.trim();
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function streamToString(stream) {
    // Handle AWS SDK v3 streams
    if (stream.transformToString) {
        return await stream.transformToString();
    }
    
    // Fallback for Node.js streams
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}