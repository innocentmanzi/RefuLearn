import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
  port: Number(process.env['SMTP_PORT']) || 587,
  secure: false,
  auth: {
    user: process.env['EMAIL_HOST_USER'],
    pass: process.env['EMAIL_HOST_PASSWORD']
  }
});

export const sendMail = async (to: string, subject: string, html: string) => {
  return transporter.sendMail({
    from: process.env['EMAIL_HOST_USER'],
    to,
    subject,
    html
  });
};

export const sendOTPEmail = async (to: string, otp: string) => {
  const subject = 'Your RefuLearn Verification Code';
  const html = `<p>Your verification code is: <b>${otp}</b></p><p>This code will expire in 10 minutes.</p>`;
  return sendMail(to, subject, html);
};

export const sendCourseCompletionEmail = async (to: string, userName: string, courseName: string, certificateNumber?: string) => {
  const subject = `Congratulations! You've completed ${courseName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #007BFF;">Congratulations, ${userName}! 🎉</h1>
      
      <p style="font-size: 16px; line-height: 1.6;">
        You have successfully completed the course <strong>"${courseName}"</strong> on RefuLearn.
      </p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">Your Achievement</h2>
        <p>✅ Course Completed: ${courseName}</p>
        <p>📅 Completion Date: ${new Date().toLocaleDateString()}</p>
        ${certificateNumber ? `<p>🏆 Certificate Number: ${certificateNumber}</p>` : ''}
      </div>
      
      <p style="font-size: 16px; line-height: 1.6;">
        Your certificate has been generated and is now available in your RefuLearn account.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env['FRONTEND_URL'] || 'http://localhost:3000'}/certificates" 
           style="background: #007BFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View Your Certificate
        </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 30px;">
        Keep learning and growing with RefuLearn!
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #999; text-align: center;">
        © ${new Date().getFullYear()} RefuLearn. All rights reserved.
      </p>
    </div>
  `;
  
  return sendMail(to, subject, html);
};