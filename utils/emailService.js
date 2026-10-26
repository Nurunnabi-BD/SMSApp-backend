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
      from: process.env.EMAIL_FROM || '"Smart Medical Platform" <no-reply@smartmedical.com>',
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
  const subject = '🎉 অভিনন্দন! আপনার Smart Medical ডাক্তার অ্যাকাউন্ট অনুমোদিত হয়েছে';
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
        .badge { display: inline-block; background: #e0f2fe; color: #0284c7; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
        .info-box { background: #f8fafc; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Smart Medical Services</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Doctor Account Verification & Approval</p>
        </div>
        <div class="content">
          <div class="badge">অ্যাকাউন্ট ভেরিফাইড ও সক্রিয়</div>
          <h2>প্রিয় ডক্টর ${doctorName},</h2>
          <p>আপনার Smart Medical ডাক্তার অ্যাকাউন্টটি অ্যাডমিন টিম কর্তৃক সফলভাবে যাচাই ও অনুমোদিত হয়েছে।</p>
          <div class="info-box">
            <p style="margin: 4px 0;"><strong>বিএমডিসি লাইসেন্স:</strong> ${licenseNumber || 'Verified'}</p>
            <p style="margin: 4px 0;"><strong>হাসপাতাল / চেম্বার:</strong> ${hospital || 'Smart Medical Central'}</p>
            <p style="margin: 4px 0;"><strong>স্ট্যাটাস:</strong> <span style="color: #10b981; font-weight: 700;">Active & Approved</span></p>
          </div>
          <p>এখন থেকে আপনি অ্যাপের মাধ্যমে:</p>
          <ul>
            <li>রোগীদের অ্যাপয়েন্টমেন্ট রিকোয়েস্ট গ্রহণ করতে পারবেন।</li>
            <li>ডিজিটাল প্রেসক্রিপশন প্রদান করতে পারবেন।</li>
            <li>অনলাইন অডিও ও ভিডিও কনসাল্টেশন পরিচালনা করতে পারবেন।</li>
          </ul>
          <p>রোগী সেবায় আপনার সার্বিক সাফল্য কামনা করছি।</p>
        </div>
        <div class="footer">
          <p>© 2026 Smart Medical App Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: toEmail,
    subject,
    html,
    text: `প্রিয় Dr. ${doctorName}, আপনার Smart Medical ডাক্তার অ্যাকাউন্ট অনুমোদিত হয়েছে। আপনি এখন লগইন করে রোগী দেখতে পারেন।`,
  });
};

module.exports = {
  sendEmail,
  sendDoctorApprovalEmail,
};
