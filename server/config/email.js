import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Velario <fxsol76@gmail.com>';

console.log('BREVO_API_KEY:', BREVO_API_KEY ? 'Set' : 'NOT SET');

if (!BREVO_API_KEY) {
  console.error('❌ BREVO_API_KEY not set. Emails will not send.');
}

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!BREVO_API_KEY) {
      return { success: false, error: 'Brevo API key not configured' };
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Velario', email: 'fxsol76@gmail.com' },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Email sent:', data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default { sendEmail };