import dotenv from 'dotenv';

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'your-verified-sender@example.com';

console.log('SENDGRID_API_KEY:', SENDGRID_API_KEY ? 'Set' : 'NOT SET');

if (!SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY not set. Emails will not send.');
}

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!SENDGRID_API_KEY) {
      return { success: false, error: 'SendGrid API key not configured' };
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
          },
        ],
        from: {
          email: EMAIL_FROM,
          name: 'Velario',
        },
        subject,
        content: [
          { type: 'text/plain', value: text || '' },
          { type: 'text/html', value: html || '' },
        ],
      }),
    });

    // SendGrid returns 202 on success with no body
    if (response.status === 202) {
      console.log('✅ Email sent to:', to);
      return { success: true };
    }

    const data = await response.json().catch(() => ({}));
    console.error('SendGrid API error:', data);
    throw new Error(data.errors?.[0]?.message || `HTTP ${response.status}`);
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default { sendEmail };