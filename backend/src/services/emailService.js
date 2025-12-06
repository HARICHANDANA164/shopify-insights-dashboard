import nodemailer from 'nodemailer';

// Create transporter - configure based on your email provider
// For development, you can use Gmail, SendGrid, Mailgun, etc.
const createTransporter = () => {
  // Using SMTP configuration from environment variables
  // For Gmail, you'll need an App Password
  // For production, use a service like SendGrid, Mailgun, or AWS SES
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP configuration is missing. Please set SMTP_USER and SMTP_PASSWORD in your .env file.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetToken) {
  try {
    const transporter = createTransporter();
    
    // Build reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset Request - Shopify Multi-Tenant',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password for your Shopify Multi-Tenant account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #667eea; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
      text: `
        Password Reset Request
        
        You requested to reset your password for your Shopify Multi-Tenant account.
        
        Click this link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour. If you didn't request this, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

