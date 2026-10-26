const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`[EMAIL DISPATCH - SIMULATION] To: ${to} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Smart Medical Services Platform" <no-reply@smartmedical.com>',
      to,
      subject,
      text: text || '',
      html: html || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL DISPATCH] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

const sendDoctorApprovalEmail = async ({ toEmail, doctorName, licenseNumber, hospital }) => {
  const subject = 'Your Doctor Account Has Been Approved';
  const text = `Dear Dr. ${doctorName},

Congratulations! Your doctor account on Smart Medical Services Platform has been approved by our administration.

You can now log in to your account and access the authorized doctor features of our platform.

Thank you for joining Smart Medical Services Platform.

Best regards,
Smart Medical Services Platform Team`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #0C8CE9, #10B981); color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px 28px; color: #152A4A; line-height: 1.6; }
        .badge { display: inline-block; background: #d1fae5; color: #047857; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
        .info-box { background: #f8fafc; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Smart Medical Services Platform</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Doctor Account Verification & Approval</p>
        </div>
        <div class="content">
          <div class="badge">Account Approved & Active</div>
          <h2>Dear Dr. ${doctorName},</h2>
          <p>Congratulations! Your doctor account on Smart Medical Services Platform has been approved by our administration.</p>
          <div class="info-box">
            <p style="margin: 4px 0;"><strong>BMDC License:</strong> ${licenseNumber || 'Verified'}</p>
            <p style="margin: 4px 0;"><strong>Hospital / Chamber:</strong> ${hospital || 'Smart Medical Central'}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 700;">Approved</span></p>
          </div>
          <p>You can now log in to your account and access the authorized doctor features of our platform.</p>
          <p>Thank you for joining Smart Medical Services Platform.</p>
          <p>Best regards,<br><strong>Smart Medical Services Platform Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 Smart Medical Services Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: toEmail, subject, html, text });
};

const sendDoctorRejectionEmail = async ({ toEmail, doctorName, reason }) => {
  const subject = 'Your Doctor Application Status - Smart Medical Services Platform';
  const rejectionReason = reason || 'Incomplete credential verification or unverified BMDC license.';
  const text = `Dear Dr. ${doctorName},

Thank you for applying to join Smart Medical Services Platform.

After reviewing your application, our administration team was unable to approve your doctor profile at this time.

Reason: ${rejectionReason}

You may review and update your credentials or contact administration support for assistance.

Best regards,
Smart Medical Services Platform Team`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
        .header { background: linear-gradient(135deg, #EF4444, #B91C1C); color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 32px 28px; color: #152A4A; line-height: 1.6; }
        .badge { display: inline-block; background: #fee2e2; color: #b91c1c; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
        .info-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Smart Medical Services Platform</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Doctor Application Review</p>
        </div>
        <div class="content">
          <div class="badge">Application Update</div>
          <h2>Dear Dr. ${doctorName},</h2>
          <p>Thank you for applying to join Smart Medical Services Platform.</p>
          <p>After reviewing your application, our administration team was unable to approve your doctor profile at this time.</p>
          <div class="info-box">
            <p style="margin: 4px 0; color: #b91c1c;"><strong>Reason for Rejection:</strong></p>
            <p style="margin: 4px 0; color: #7f1d1d;">${rejectionReason}</p>
          </div>
          <p>You may correct your registration information and re-apply from the app, or contact support if you believe this was an error.</p>
          <p>Best regards,<br><strong>Smart Medical Services Platform Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 Smart Medical Services Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({ to: toEmail, subject, html, text });
};

module.exports = {
  sendEmail,
  sendDoctorApprovalEmail,
  sendDoctorRejectionEmail,
};
