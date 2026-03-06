const nodemailer = require('nodemailer');

// Create Gmail transporter
const createGmailTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Create Ethereal (test) transporter
const createEtherealTransporter = async () => {
  // Create a test account on the fly
  const testAccount = await nodemailer.createTestAccount();
  
  console.log('📧 Using Ethereal test email:');
  console.log(`   User: ${testAccount.user}`);
  console.log(`   Pass: ${testAccount.pass}`);
  
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, req) => {
  let transporter;
  let useEthereal = process.env.USE_ETHEREAL === 'true' || !process.env.EMAIL_PASS;
  
  if (useEthereal) {
    transporter = await createEtherealTransporter();
  } else {
    transporter = createGmailTransporter();
  }
  
  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"Webmark" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - Webmark',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Logo -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; background-color: #eef2ff; padding: 12px; border-radius: 12px;">
                  <span style="font-size: 24px;">🔖</span>
                </div>
                <h1 style="color: #111827; font-size: 24px; margin: 16px 0 0 0;">Webmark</h1>
              </div>
              
              <!-- Content -->
              <h2 style="color: #111827; font-size: 20px; text-align: center; margin-bottom: 16px;">
                Reset Your Password
              </h2>
              
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
                We received a request to reset your password. Click the button below to create a new password. This link will expire in <strong>10 minutes</strong>.
              </p>
              
              <!-- Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <!-- Alternative Link -->
              <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-bottom: 24px;">
                Or copy and paste this link in your browser:<br>
                <a href="${resetUrl}" style="color: #6366f1; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              
              <!-- Footer -->
              <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 0;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
            
            <!-- Bottom Text -->
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
              © ${new Date().getFullYear()} Webmark. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Reset Your Password - Webmark
      
      We received a request to reset your password. 
      
      Click this link to reset your password (expires in 10 minutes):
      ${resetUrl}
      
      If you didn't request this, please ignore this email.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Password reset email sent to ${email}`);
    
    // If using Ethereal, show the preview URL
    if (useEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`📧 Preview URL: ${previewUrl}`);
      return { success: true, previewUrl };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // If Gmail fails, try Ethereal as fallback
    if (!useEthereal) {
      console.log('⚠️ Gmail failed, trying Ethereal test email...');
      try {
        const etherealTransporter = await createEtherealTransporter();
        mailOptions.from = '"Webmark" <test@webmark.com>';
        const info = await etherealTransporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`✓ Password reset email sent via Ethereal`);
        console.log(`📧 Preview URL: ${previewUrl}`);
        return { success: true, previewUrl };
      } catch (etherealError) {
        console.error('Ethereal also failed:', etherealError);
        throw new Error('Failed to send password reset email');
      }
    }
    
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetEmail,
};
