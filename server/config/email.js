import dotenv from 'dotenv';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

console.log('RESEND_API_KEY:', RESEND_API_KEY ? 'Set' : 'NOT SET');

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not set. Emails will not send.');
}

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!RESEND_API_KEY) {
      return { success: false, error: 'Resend API key not configured' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Velario <${EMAIL_FROM}>`,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    console.log('✅ Email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default { sendEmail };