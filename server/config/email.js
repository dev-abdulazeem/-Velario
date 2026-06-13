import nodemailer from 'nodemailer';

console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000,
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error.message);
  } else {
    console.log('Email service ready');
  }
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error.message);
    // Return failure but don't throw — server keeps running
    return { success: false, error: error.message };
  }
};

export default transporter;