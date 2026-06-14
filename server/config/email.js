import dotenv from 'dotenv';

dotenv.config();

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'velario@trial.mailersend.net';

console.log('MAILERSEND_API_KEY:', MAILERSEND_API_KEY ? 'Set' : 'NOT SET');

if (!MAILERSEND_API_KEY) {
  console.error('❌ MAILERSEND_API_KEY not set. Emails will not send.');
}

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!MAILERSEND_API_KEY) {
      return { success: false, error: 'Mailersend API key not configured' };
    }

    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: {
          email: EMAIL_FROM,
          name: 'Velario',
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Mailersend API error:', data);
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    console.log('✅ Email sent:', data.message_id);
    return { success: true, messageId: data.message_id };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default { sendEmail };