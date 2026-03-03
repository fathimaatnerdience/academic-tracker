import nodemailer from 'nodemailer';

let transporter;

async function initTransporter() {
  if (transporter) return transporter;

  // if SMTP config is present use it, otherwise fall back to test account
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // development fallback using ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('⚠️  No SMTP credentials provided, using Ethereal test account');
  }

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const transport = await initTransporter();
  const info = await transport.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    to,
    subject,
    text,
    html
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }

  return info;
}
