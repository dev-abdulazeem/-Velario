import { sendEmail } from '../config/email.js';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || (
  process.env.NODE_ENV === 'production' 
    ? 'https://velario.vercel.app' 
    : 'http://localhost:5173'
);

// ─── EMAIL LOGGING ───
const logEmail = async (recipient, subject, type, status) => {
  try {
    await pool.query(
      'INSERT INTO email_logs (recipient, subject, type, status) VALUES ($1, $2, $3, $4)',
      [recipient, subject, type, status]
    );
  } catch (error) {
    console.error('Email log error:', error);
  }
};

// ═══════════════════════════════════════════════════════════════
//  COLOR SYSTEM
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: '#0C0A09',
  surface: '#1C1917',
  surfaceLight: '#292524',
  text: '#FAFAF9',
  textMuted: '#A8A29E',
  textSubtle: '#78716C',
  border: '#44403C',
  accent: '#F59E0B',
  accentLight: '#78350F',
  accentDark: '#FBBF24',
  success: '#34D399',
  white: '#FFFFFF',
  black: '#0F0F0F',
};

const s = (styles) => Object.entries(styles).map(([k, v]) => `${k}:${v}`).join(';');

// ═══════════════════════════════════════════════════════════════
//  IMAGE HELPERS
// ═══════════════════════════════════════════════════════════════

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const base = (process.env.BACKEND_URL || FRONTEND_URL).replace(/\/$/, '');
  return imagePath.startsWith('/') ? `${base}${imagePath}` : `${base}/${imagePath}`;
};

// ═══════════════════════════════════════════════════════════════
//  IMAGE COMPONENTS
// ═══════════════════════════════════════════════════════════════

const productImageCell = (imageUrl, productName, height = '360') => {
  const resolvedUrl = resolveImageUrl(imageUrl);
  
  if (!resolvedUrl) {
    return `
    <td style="background:linear-gradient(135deg,${C.surfaceLight} 0%,${C.surface} 100%);text-align:center;vertical-align:middle;height:${height}px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="text-align:center;padding:40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:16px;">
              <tr>
                <td width="80" height="80" style="background:linear-gradient(135deg,${C.accent} 0%,${C.accentDark} 100%);border-radius:50%;text-align:center;vertical-align:middle;">
                  <span style="font-size:36px;line-height:80px;display:block;">👟</span>
                </td>
              </tr>
            </table>
            <p style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '20px', 'font-weight': '700', 'color': C.text, 'margin': '0 0 8px', 'text-align': 'center' })}">${productName}</p>
            <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'font-weight': '600', 'color': C.textMuted, 'letter-spacing': '0.1em', 'text-transform': 'uppercase', 'margin': '0', 'text-align': 'center' })}">Velario Exclusive</p>
          </td>
        </tr>
      </table>
    </td>
    `;
  }
  
  return `
  <td style="background:${C.surfaceLight};">
    <img src="${resolvedUrl}" alt="${productName}" width="100%" height="${height}" style="display:block;width:100%;height:${height}px;object-fit:cover;border:0;outline:none;" onerror="this.parentElement.innerHTML='<table role=\\'presentation\\' cellpadding=\\'0\\' cellspacing=\\'0\\' border=\\'0\\' align=\\'center\\'><tr><td style=\\'text-align:center;padding:40px;\\'><table role=\\'presentation\\' cellpadding=\\'0\\' cellspacing=\\'0\\' border=\\'0\\' align=\\'center\\' style=\\'margin-bottom:16px;\\'><tr><td width=\\'80\\' height=\\'80\\' style=\\'background:linear-gradient(135deg,${C.accent} 0%,${C.accentDark} 100%);border-radius:50%;text-align:center;vertical-align:middle;\\'><span style=\\'font-size:36px;line-height:80px;display:block;\\'>👟</span></td></tr></table><p style=\\'font-family:Georgia,serif;font-size:20px;font-weight:700;color:${C.text};margin:0 0 8px;text-align:center;\\'>${productName}</p><p style=\\'font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:${C.textMuted};letter-spacing:0.1em;text-transform:uppercase;margin:0;text-align:center;\\'>Velario Exclusive</p></td></tr></table>';this.style.display='none';">
  </td>
  `;
};

const orderItemImage = (imageUrl, productName) => {
  const resolvedUrl = resolveImageUrl(imageUrl);
  
  if (!resolvedUrl) {
    return `
    <td width="64" style="padding-right:16px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="64" height="64" style="background:linear-gradient(135deg,${C.surfaceLight} 0%,${C.surface} 100%);border-radius:12px;border:1px solid ${C.border};text-align:center;vertical-align:middle;">
            <span style="font-size:24px;line-height:64px;display:block;">👟</span>
          </td>
        </tr>
      </table>
    </td>
    `;
  }
  
  return `
  <td width="64" style="padding-right:16px;">
    <img src="${resolvedUrl}" alt="${productName}" width="64" height="64" style="display:block;border-radius:12px;background:${C.surfaceLight};border:1px solid ${C.border};width:64px;height:64px;object-fit:cover;" onerror="this.parentElement.innerHTML='<td width=\\'64\\' style=\\'padding-right:16px;\\'><table role=\\'presentation\\' cellpadding=\\'0\\' cellspacing=\\'0\\' border=\\'0\\' style=\\'border-collapse:collapse;\\'><tr><td width=\\'64\\' height=\\'64\\' style=\\'background:linear-gradient(135deg,${C.surfaceLight} 0%,${C.surface} 100%);border-radius:12px;border:1px solid ${C.border};text-align:center;vertical-align:middle;\\'><span style=\\'font-size:24px;line-height:64px;display:block;\\'>👟</span></td></tr></table></td>';this.style.display='none';">
  </td>
  `;
};

// ═══════════════════════════════════════════════════════════════
//  EMAIL WRAPPER & COMPONENTS
// ═══════════════════════════════════════════════════════════════

const emailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Velario</title>
  <style>
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; display: block; }
    @media screen and (max-width: 600px) {
      .mobile-full { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding: 24px 20px !important; }
      .mobile-hide { display: none !important; }
      .mobile-center { text-align: center !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-stack td { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${C.bg};-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
  <center>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.bg};border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" class="mobile-full" style="max-width:640px;width:100%;background-color:${C.bg};border-collapse:collapse;mso-table-lspace:0;mso-table-rspace:0;">
            ${content}
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
`;

const getHeader = () => `
<tr>
  <td style="padding:0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr>
        <td height="3" style="background:linear-gradient(90deg,${C.bg},${C.accent},${C.accentDark},${C.accent},${C.bg});font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:48px 40px 32px;text-align:center;background:linear-gradient(180deg,${C.surfaceLight} 0%,${C.bg} 100%);" class="mobile-padding">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:16px;text-align:center;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;">
            <tr>
              <td width="56" height="56" style="text-align:center;">
                <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
                  <path d="M15 20 L50 85 L85 20" stroke="${C.accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M28 20 L50 60 L72 20" stroke="rgba(255,255,255,0.15)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="${s({ 'font-family': "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", 'font-size': '24px', 'font-weight': '800', 'color': C.text, 'letter-spacing': '0.2em', 'text-transform': 'uppercase', 'text-align': 'center' })}">
          VELARIO
        </td>
      </tr>
      <tr>
        <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '10px', 'font-weight': '600', 'color': C.accent, 'letter-spacing': '0.4em', 'text-transform': 'uppercase', 'padding-top': '6px', 'text-align': 'center' })}">
          Movement With Style
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

const getFooter = (showUnsubscribe = false) => `
<tr>
  <td style="padding:0 40px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr>
        <td height="1" style="background:${C.border};font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding:40px;background-color:${C.surfaceLight};text-align:center;" class="mobile-padding">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:24px;border-collapse:collapse;">
      <tr>
        ${['IG', 'FB', 'TW', 'YT'].map(label => `
        <td style="padding:0 6px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tr>
              <td width="44" height="44" style="${s({ 'text-align': 'center', 'vertical-align': 'middle', 'background-color': C.surface, 'border': `1px solid ${C.border}`, 'border-radius': '50%' })}">
                <span style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '700', 'color': C.textMuted, 'display': 'block', 'line-height': '44px' })}">${label}</span>
              </td>
            </tr>
          </table>
        </td>
        `).join('')}
      </tr>
    </table>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textSubtle, 'line-height': '1.8', 'margin': '0 0 8px', 'text-align': 'center' })}">
      <strong style="color:${C.textMuted};">© 2026 Velario. All Rights Reserved.</strong>
    </p>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textSubtle, 'line-height': '1.8', 'margin': '0 0 16px', 'text-align': 'center' })}">
      Velario is more than footwear. It's a statement of who you are.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;">
      <tr>
        ${['Privacy', 'Terms', 'Support', 'Contact', ...(showUnsubscribe ? ['Unsubscribe'] : [])].map(link => `
        <td style="padding:0 12px;">
          <a href="${FRONTEND_URL}/${link.toLowerCase()}" style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.textMuted, 'text-decoration': 'none', 'letter-spacing': '0.05em', 'text-transform': 'uppercase' })}">${link}</a>
        </td>
        `).join('')}
      </tr>
    </table>
  </td>
</tr>
`;

const btnPrimary = (href, text) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:32px auto;border-collapse:collapse;">
  <tr>
    <td style="${s({ 'background': `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`, 'border-radius': '14px', 'text-align': 'center' })}">
      <a href="${href}" style="${s({ 'display': 'inline-block', 'padding': '18px 48px', 'color': C.black, 'font-family': "Inter, sans-serif", 'font-size': '12px', 'font-weight': '800', 'letter-spacing': '0.15em', 'text-transform': 'uppercase', 'text-decoration': 'none', 'border-radius': '14px' })}">
        ${text}
      </a>
    </td>
  </tr>
</table>
`;

const glassCard = (content) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;border-collapse:collapse;">
  <tr>
    <td style="${s({ 'background': `linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.02) 100%)`, 'border': `1px solid rgba(245,158,11,0.15)`, 'border-radius': '20px', 'padding': '32px' })}">
      ${content}
    </td>
  </tr>
</table>
`;

const highlightBox = (text, code = '') => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;border-collapse:collapse;">
  <tr>
    <td style="${s({ 'border-left': `3px solid ${C.accent}`, 'background': `linear-gradient(90deg, rgba(245,158,11,0.08) 0%, transparent 100%)`, 'border-radius': '0 16px 16px 0', 'padding': '20px 24px' })}">
      <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '14px', 'color': C.textMuted, 'line-height': '1.7', 'margin': '0' })}">${text}</p>
      ${code ? `<p style="${s({ 'font-family': "SF Mono, Courier New, monospace", 'font-size': '12px', 'color': C.accent, 'margin-top': '8px', 'word-break': 'break-all' })}">${code}</p>` : ''}
    </td>
  </tr>
</table>
`;

const statusBadge = (text, color = C.accent) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:16px auto;border-collapse:collapse;">
  <tr>
    <td style="${s({ 'background': `rgba(245,158,11,0.1)`, 'border': `1px solid rgba(245,158,11,0.2)`, 'border-radius': '100px', 'padding': '10px 24px' })}">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td width="8" height="8" style="${s({ 'background-color': color, 'border-radius': '50%', 'padding-right': '8px', 'font-size': '0', 'line-height': '0' })}">&nbsp;</td>
          <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '700', 'color': color, 'letter-spacing': '0.1em', 'text-transform': 'uppercase' })}">${text}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;

// ═══════════════════════════════════════════════════════════════
//  EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════

const getVerificationTemplate = (name, token) => {
  const body = `
<tr>
  <td style="padding:48px 40px;" class="mobile-padding">
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.accent, 'letter-spacing': '0.15em', 'text-transform': 'uppercase', 'margin': '0 0 16px' })}">Account Verification</p>
    <h1 style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '42px', 'font-weight': '700', 'color': C.text, 'line-height': '1.1', 'margin': '0 0 20px', 'letter-spacing': '-0.02em' })}">
      Welcome to<br><span style="color:${C.accent};font-style:italic;">Velario</span>
    </h1>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '16px', 'color': C.textMuted, 'line-height': '1.7', 'margin': '0 0 32px', 'max-width': '480px' })}">
      Hi ${name}, you're one step away from joining an exclusive community. Verify your email to unlock premium access to our curated footwear collection.
    </p>
    ${btnPrimary(`${FRONTEND_URL}/verify-email?token=${token}`, 'Verify My Email')}
    ${highlightBox('Or copy this link into your browser:', `${FRONTEND_URL}/verify-email?token=${token}`)}
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textSubtle, 'text-align': 'center', 'margin-top': '24px' })}">
      This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
    </p>
  </td>
</tr>
  `;
  return emailWrapper(getHeader() + body + getFooter());
};

const getWelcomeTemplate = (name) => {
  const body = `
<tr>
  <td style="padding:48px 40px;" class="mobile-padding">
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.accent, 'letter-spacing': '0.15em', 'text-transform': 'uppercase', 'margin': '0 0 16px' })}">You're In</p>
    <h1 style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '42px', 'font-weight': '700', 'color': C.text, 'line-height': '1.1', 'margin': '0 0 20px', 'letter-spacing': '-0.02em' })}">
      Welcome,<br><span style="color:${C.accent};font-style:italic;">${name.split(' ')[0]}</span>
    </h1>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '16px', 'color': C.textMuted, 'line-height': '1.7', 'margin': '0 0 40px', 'max-width': '480px' })}">
      Your account is verified and you're now part of the Velario family — an exclusive community that moves with purpose, style, and uncompromising quality.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr>
        ${[
          { icon: '✦', title: 'Premium Craft', desc: 'Materials sourced from the finest artisans worldwide' },
          { icon: '◈', title: 'Swift Delivery', desc: 'Express shipping to your door within 48 hours' },
          { icon: '◉', title: 'Exclusive Access', desc: 'First access to limited drops and collaborations' }
        ].map(f => `
        <td class="mobile-stack" style="padding:0 8px 16px;width:33.33%;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.surface};border:1px solid ${C.border};border-radius:16px;padding:24px;text-align:center;border-collapse:collapse;">
            <tr>
              <td style="font-size:28px;padding-bottom:12px;text-align:center;">${f.icon}</td>
            </tr>
            <tr>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '700', 'color': C.text, 'letter-spacing': '0.1em', 'text-transform': 'uppercase', 'padding-bottom': '6px', 'text-align': 'center' })}">${f.title}</td>
            </tr>
            <tr>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textSubtle, 'line-height': '1.5', 'text-align': 'center' })}">${f.desc}</td>
            </tr>
          </table>
        </td>
        `).join('')}
      </tr>
    </table>
    ${btnPrimary(`${FRONTEND_URL}/shop`, 'Explore Collection')}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0;border-collapse:collapse;">
      <tr>
        <td style="${s({ 'background': `linear-gradient(135deg, rgba(245,158,11,0.1) 0%, transparent 100%)`, 'border': `2px dashed ${C.accent}`, 'border-radius': '16px', 'padding': '32px', 'text-align': 'center' })}">
          <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.textSubtle, 'letter-spacing': '0.1em', 'text-transform': 'uppercase', 'margin': '0 0 12px', 'text-align': 'center' })}">Welcome Gift — 20% Off Your First Order</p>
          <p style="${s({ 'font-family': "SF Mono, Courier New, monospace", 'font-size': '28px', 'font-weight': '800', 'color': C.accent, 'letter-spacing': '0.15em', 'margin': '0', 'text-align': 'center' })}">WELCOME20</p>
        </td>
      </tr>
    </table>
  </td>
</tr>
  `;
  return emailWrapper(getHeader() + body + getFooter());
};

const getOrderConfirmationTemplate = (name, orderId, total, items) => {
  const body = `
<tr>
  <td style="padding:48px 40px;" class="mobile-padding">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:24px;border-collapse:collapse;">
      <tr>
        <td width="80" height="80" style="${s({ 'background': `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`, 'border-radius': '50%', 'text-align': 'center', 'vertical-align': 'middle' })}">
          <span style="font-size:36px;line-height:80px;display:block;">✓</span>
        </td>
      </tr>
    </table>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.accent, 'letter-spacing': '0.15em', 'text-transform': 'uppercase', 'margin': '0 0 16px', 'text-align': 'center' })}">Order Confirmed</p>
    <h1 style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '36px', 'font-weight': '700', 'color': C.text, 'line-height': '1.1', 'margin': '0 0 16px', 'text-align': 'center' })}">
      Thank You,<br><span style="color:${C.accent};font-style:italic;">${name.split(' ')[0]}</span>
    </h1>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '16px', 'color': C.textMuted, 'line-height': '1.7', 'margin': '0 auto 32px', 'text-align': 'center', 'max-width': '420px' })}">
      We've received your order and our craftsmen are already preparing your selection with meticulous care.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.surface};border:1px solid ${C.border};border-radius:20px;margin:24px 0;border-collapse:collapse;">
      <tr>
        <td style="padding:32px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid ${C.border};border-collapse:collapse;">
            <tr>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.textSubtle, 'letter-spacing': '0.1em', 'text-transform': 'uppercase' })}">Order Number</td>
              <td style="${s({ 'font-family': "SF Mono, Courier New, monospace", 'font-size': '15px', 'font-weight': '700', 'color': C.accent, 'text-align': 'right' })}">#${orderId}</td>
            </tr>
          </table>
          ${items.map(item => `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid ${C.border};border-collapse:collapse;">
            <tr>
              ${orderItemImage(item.image, item.name)}
              <td>
                <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '15px', 'font-weight': '600', 'color': C.text, 'margin': '0 0 4px' })}">${item.name}</p>
                <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textSubtle, 'margin': '0' })}">Size ${item.size} · Qty ${item.quantity}</p>
              </td>
              <td style="text-align:right;">
                <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '16px', 'font-weight': '700', 'color': C.accent, 'margin': '0' })}">$${(item.price * item.quantity).toFixed(2)}</p>
              </td>
            </tr>
          </table>
          `).join('')}
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding-top:16px;border-top:2px solid ${C.accent};border-collapse:collapse;">
            <tr>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'font-weight': '600', 'color': C.textMuted, 'letter-spacing': '0.1em', 'text-transform': 'uppercase' })}">Order Total</td>
              <td style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '28px', 'font-weight': '700', 'color': C.accent, 'text-align': 'right' })}">$${total}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${btnPrimary(`${FRONTEND_URL}/orders/${orderId}`, 'Track My Order')}
    ${glassCard(`
      <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '14px', 'color': C.textMuted, 'line-height': '1.7', 'margin': '0', 'text-align': 'center' })}">
        You'll receive a shipping notification once your order leaves our atelier.<br>
        <strong style="color:${C.text};">Estimated delivery: 3-5 business days</strong>
      </p>
    `)}
  </td>
</tr>
  `;
  return emailWrapper(getHeader() + body + getFooter());
};

const getOrderShippedTemplate = (name, orderId, trackingNumber) => {
  const body = `
<tr>
  <td style="padding:48px 40px;" class="mobile-padding">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:24px;border-collapse:collapse;">
      <tr>
        <td width="80" height="80" style="${s({ 'background': `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`, 'border-radius': '50%', 'text-align': 'center', 'vertical-align': 'middle' })}">
          <span style="font-size:36px;line-height:80px;display:block;">🚚</span>
        </td>
      </tr>
    </table>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.accent, 'letter-spacing': '0.15em', 'text-transform': 'uppercase', 'margin': '0 0 16px', 'text-align': 'center' })}">On Its Way</p>
    <h1 style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '36px', 'font-weight': '700', 'color': C.text, 'line-height': '1.1', 'margin': '0 0 16px', 'text-align': 'center' })}">
      It's Moving,<br><span style="color:${C.accent};font-style:italic;">${name.split(' ')[0]}</span>
    </h1>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '16px', 'color': C.textMuted, 'line-height': '1.7', 'margin': '0 auto 24px', 'text-align': 'center', 'max-width': '420px' })}">
      Great news! Your Velario order has shipped and is now en route to you. Prepare to step into something extraordinary.
    </p>
    ${statusBadge('In Transit')}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.surface};border:1px solid ${C.border};border-radius:20px;margin:24px 0;border-collapse:collapse;">
      <tr>
        <td style="padding:32px;text-align:center;">
          <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.textSubtle, 'letter-spacing': '0.1em', 'text-transform': 'uppercase', 'margin': '0 0 12px', 'text-align': 'center' })}">Tracking Number</p>
          <p style="${s({ 'font-family': "SF Mono, Courier New, monospace", 'font-size': '22px', 'font-weight': '700', 'color': C.accent, 'letter-spacing': '0.1em', 'padding': '16px', 'background': C.surfaceLight, 'border-radius': '12px', 'border': `1px dashed ${C.border}`, 'display': 'inline-block', 'margin': '8px 0', 'text-align': 'center' })}">
            ${trackingNumber || 'VEL-' + String(orderId).padStart(6, '0')}
          </p>
          <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textSubtle, 'margin': '12px 0 0', 'text-align': 'center' })}">Estimated delivery: 3-5 business days</p>
        </td>
      </tr>
    </table>
    ${btnPrimary(`${FRONTEND_URL}/orders/${orderId}`, 'Track Package')}
  </td>
</tr>
  `;
  return emailWrapper(getHeader() + body + getFooter());
};

const getOrderDeliveredTemplate = (name, orderId) => {
  const body = `
<tr>
  <td style="padding:48px 40px;" class="mobile-padding">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:24px;border-collapse:collapse;">
      <tr>
        <td width="80" height="80" style="${s({ 'background': `linear-gradient(135deg, ${C.success} 0%, #059669 100%)`, 'border-radius': '50%', 'text-align': 'center', 'vertical-align': 'middle' })}">
          <span style="font-size:36px;line-height:80px;display:block;">✓</span>
        </td>
      </tr>
    </table>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.success, 'letter-spacing': '0.15em', 'text-transform': 'uppercase', 'margin': '0 0 16px', 'text-align': 'center' })}">Delivered</p>
    <h1 style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '36px', 'font-weight': '700', 'color': C.text, 'line-height': '1.1', 'margin': '0 0 16px', 'text-align': 'center' })}">
      It's Here,<br><span style="color:${C.success};font-style:italic;">${name.split(' ')[0]}</span>
    </h1>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '16px', 'color': C.textMuted, 'line-height': '1.7', 'margin': '0 auto 32px', 'text-align': 'center', 'max-width': '420px' })}">
      Your Velario order #${orderId} has been delivered. Time to unbox and experience the craftsmanship firsthand.
    </p>
    ${glassCard(`
      <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '24px', 'color': C.accent, 'text-align': 'center', 'margin': '0 0 12px', 'letter-spacing': '4px' })}">★★★★★</p>
      <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '18px', 'font-weight': '600', 'color': C.text, 'text-align': 'center', 'margin': '0 0 8px' })}">How was your experience?</p>
      <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '14px', 'color': C.textMuted, 'text-align': 'center', 'margin': '0', 'line-height': '1.7' })}">Your feedback shapes our craft. Help us create even better footwear.</p>
    `)}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:32px auto;border-collapse:collapse;">
      <tr>
        <td style="padding:0 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;">
            <tr>
              <td style="${s({ 'background': `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`, 'border-radius': '14px', 'text-align': 'center' })}">
                <a href="${FRONTEND_URL}/shop" style="${s({ 'display': 'inline-block', 'padding': '18px 48px', 'color': C.black, 'font-family': "Inter, sans-serif", 'font-size': '12px', 'font-weight': '800', 'letter-spacing': '0.15em', 'text-transform': 'uppercase', 'text-decoration': 'none', 'border-radius': '14px' })}">Shop More</a>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding:0 8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;">
            <tr>
              <td style="${s({ 'border': `2px solid ${C.accent}`, 'border-radius': '14px', 'text-align': 'center' })}">
                <a href="${FRONTEND_URL}/orders/${orderId}" style="${s({ 'display': 'inline-block', 'padding': '16px 40px', 'color': C.accent, 'font-family': "Inter, sans-serif", 'font-size': '12px', 'font-weight': '700', 'letter-spacing': '0.1em', 'text-transform': 'uppercase', 'text-decoration': 'none' })}">View Order</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
  `;
  return emailWrapper(getHeader() + body + getFooter());
};

const getNewProductTemplate = (productName, price, category, imageUrl) => {
  const body = `
<tr>
  <td style="padding:0 40px 48px;" class="mobile-padding">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.surface};border:1px solid ${C.border};border-radius:24px;overflow:hidden;margin:24px 0;border-collapse:collapse;">
      <tr>
        ${productImageCell(imageUrl, productName, '360')}
      </tr>
      <tr>
        <td style="padding:32px;text-align:center;">
          <p style="${s({ 'display': 'inline-block', 'padding': '6px 16px', 'background': `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDark} 100%)`, 'color': C.black, 'font-family': "Inter, sans-serif", 'font-size': '10px', 'font-weight': '800', 'letter-spacing': '0.2em', 'text-transform': 'uppercase', 'border-radius': '100px', 'margin': '0 0 16px', 'text-align': 'center' })}">Just Dropped</p>
          <h2 style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '32px', 'font-weight': '700', 'color': C.text, 'margin': '0 0 8px', 'text-align': 'center' })}">${productName}</h2>
          <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'font-weight': '600', 'color': C.textSubtle, 'letter-spacing': '0.2em', 'text-transform': 'uppercase', 'margin': '0 0 16px', 'text-align': 'center' })}">${category}</p>
          <p style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '36px', 'font-weight': '700', 'color': C.accent, 'margin': '0 0 24px', 'text-align': 'center' })}">$${price}</p>
          ${btnPrimary(`${FRONTEND_URL}/shop`, 'Shop Now')}
        </td>
      </tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr>
        ${[
          { icon: '◆', title: 'Limited Edition', desc: 'Small batch production ensures exclusivity' },
          { icon: '◈', title: 'Artisan Made', desc: 'Hand-finished by master craftspeople' },
          { icon: '◇', title: 'Premium Materials', desc: 'Full-grain leather and performance textiles' }
        ].map(f => `
        <td class="mobile-stack" style="padding:0 8px 16px;width:33.33%;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.surface};border:1px solid ${C.border};border-radius:16px;padding:24px;text-align:center;border-collapse:collapse;">
            <tr>
              <td style="font-size:24px;padding-bottom:12px;text-align:center;">${f.icon}</td>
            </tr>
            <tr>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '700', 'color': C.text, 'letter-spacing': '0.1em', 'text-transform': 'uppercase', 'padding-bottom': '6px', 'text-align': 'center' })}">${f.title}</td>
            </tr>
            <tr>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textSubtle, 'line-height': '1.5', 'text-align': 'center' })}">${f.desc}</td>
            </tr>
          </table>
        </td>
        `).join('')}
      </tr>
    </table>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '13px', 'color': C.textSubtle, 'text-align': 'center', 'line-height': '1.7', 'margin-top': '32px' })}">
      You're receiving this because you subscribed to Velario updates. 
      <a href="${FRONTEND_URL}/unsubscribe" style="color:${C.accent};text-decoration:none;font-weight:600;">Unsubscribe</a>
    </p>
  </td>
</tr>
  `;
  return emailWrapper(getHeader() + body + getFooter(true));
};

const getPasswordResetTemplate = (name, token) => {
  const body = `
<tr>
  <td style="padding:48px 40px;" class="mobile-padding">
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.accent, 'letter-spacing': '0.15em', 'text-transform': 'uppercase', 'margin': '0 0 16px' })}">Security</p>
    <h1 style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '42px', 'font-weight': '700', 'color': C.text, 'line-height': '1.1', 'margin': '0 0 20px', 'letter-spacing': '-0.02em' })}">
      Reset Your<br><span style="color:${C.accent};font-style:italic;">Password</span>
    </h1>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '16px', 'color': C.textMuted, 'line-height': '1.7', 'margin': '0 0 32px', 'max-width': '480px' })}">
      Hi ${name}, we received a request to reset your Velario account password. Click below to create a new secure password.
    </p>
    ${btnPrimary(`${FRONTEND_URL}/reset-password?token=${token}`, 'Reset Password')}
    ${highlightBox('This link expires in 1 hour for your security. If you didn\'t request this reset, you can safely ignore this email — your account remains secure.')}
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textSubtle, 'text-align': 'center', 'margin-top': '24px' })}">
      Or copy this link:<br>
      <span style="${s({ 'font-family': "SF Mono, Courier New, monospace", 'font-size': '12px', 'color': C.accent, 'word-break': 'break-all' })}">${FRONTEND_URL}/reset-password?token=${token}</span>
    </p>
  </td>
</tr>
  `;
  return emailWrapper(getHeader() + body + getFooter());
};

// ═══════════════════════════════════════════════════════════════
//  NEW: PAYMENT CONFIRMATION TEMPLATE (integrated into design system)
// ═══════════════════════════════════════════════════════════════

const getPaymentConfirmationTemplate = (name, orderId, totalAmount, items, reference) => {
  const subtotal = (totalAmount / 1.08).toFixed(2);
  const tax = (totalAmount - totalAmount / 1.08).toFixed(2);

  const itemsHtml = items?.map(item => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid ${C.border};border-collapse:collapse;">
    <tr>
      ${orderItemImage(item.image || item.image_url, item.product_name || item.name)}
      <td>
        <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '15px', 'font-weight': '600', 'color': C.text, 'margin': '0 0 4px' })}">${item.product_name || item.name || 'Product'}</p>
        <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textSubtle, 'margin': '0' })}">Size ${item.size || 'N/A'} · Qty ${item.quantity}</p>
      </td>
      <td style="text-align:right;">
        <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '16px', 'font-weight': '700', 'color': C.accent, 'margin': '0' })}">$${((item.price_at_time || item.price) * item.quantity).toFixed(2)}</p>
      </td>
    </tr>
  </table>
  `).join('') || '';

  const body = `
<tr>
  <td style="padding:48px 40px;" class="mobile-padding">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:24px;border-collapse:collapse;">
      <tr>
        <td width="80" height="80" style="${s({ 'background': `linear-gradient(135deg, ${C.success} 0%, #059669 100%)`, 'border-radius': '50%', 'text-align': 'center', 'vertical-align': 'middle' })}">
          <span style="font-size:36px;line-height:80px;display:block;">💳</span>
        </td>
      </tr>
    </table>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.success, 'letter-spacing': '0.15em', 'text-transform': 'uppercase', 'margin': '0 0 16px', 'text-align': 'center' })}">Payment Confirmed</p>
    <h1 style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '36px', 'font-weight': '700', 'color': C.text, 'line-height': '1.1', 'margin': '0 0 16px', 'text-align': 'center' })}">
      Payment Received,<br><span style="color:${C.success};font-style:italic;">${name.split(' ')[0]}</span>
    </h1>
    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '16px', 'color': C.textMuted, 'line-height': '1.7', 'margin': '0 auto 32px', 'text-align': 'center', 'max-width': '420px' })}">
      Your payment has been received and your order is now being processed with meticulous care.
    </p>

    ${glassCard(`
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.textSubtle, 'letter-spacing': '0.1em', 'text-transform': 'uppercase', 'margin': '0 0 8px' })}">Order Number</td>
          <td style="${s({ 'font-family': "SF Mono, Courier New, monospace", 'font-size': '20px', 'font-weight': '700', 'color': C.accent, 'text-align': 'right' })}">#${orderId}</td>
        </tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px;padding-top:16px;border-top:1px solid ${C.border};border-collapse:collapse;">
        <tr>
          <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '600', 'color': C.textSubtle, 'letter-spacing': '0.1em', 'text-transform': 'uppercase', 'margin': '0 0 8px' })}">Payment Reference</td>
          <td style="${s({ 'font-family': "SF Mono, Courier New, monospace", 'font-size': '14px', 'font-weight': '600', 'color': C.textMuted, 'text-align': 'right', 'word-break': 'break-all' })}">${reference}</td>
        </tr>
      </table>
    `)}

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.surface};border:1px solid ${C.border};border-radius:20px;margin:24px 0;border-collapse:collapse;">
      <tr>
        <td style="padding:32px;">
          <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '11px', 'font-weight': '700', 'color': C.textSubtle, 'letter-spacing': '0.15em', 'text-transform': 'uppercase', 'margin': '0 0 20px' })}">Order Items</p>
          ${itemsHtml}
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding-top:16px;border-top:1px solid ${C.border};border-collapse:collapse;">
            <tr>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textMuted, 'padding': '6px 0' })}">Subtotal</td>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '14px', 'color': C.text, 'text-align': 'right' })}">$${subtotal}</td>
            </tr>
            <tr>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textMuted, 'padding': '6px 0' })}">Tax</td>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '14px', 'color': C.text, 'text-align': 'right' })}">$${tax}</td>
            </tr>
            <tr>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textMuted, 'padding': '6px 0' })}">Shipping</td>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '14px', 'font-weight': '700', 'color': C.accent, 'text-align': 'right' })}">FREE</td>
            </tr>
          </table>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding-top:16px;margin-top:16px;border-top:2px solid ${C.accent};border-collapse:collapse;">
            <tr>
              <td style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'font-weight': '600', 'color': C.textMuted, 'letter-spacing': '0.1em', 'text-transform': 'uppercase' })}">Total Paid</td>
              <td style="${s({ 'font-family': "Georgia, 'Times New Roman', serif", 'font-size': '28px', 'font-weight': '700', 'color': C.accent, 'text-align': 'right' })}">$${parseFloat(totalAmount).toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${btnPrimary(`${FRONTEND_URL}/orders/${orderId}`, 'Track My Order')}

    ${glassCard(`
      <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '14px', 'color': C.textMuted, 'line-height': '1.7', 'margin': '0', 'text-align': 'center' })}">
        You'll receive a shipping notification once your order leaves our atelier.<br>
        <strong style="color:${C.text};">Estimated delivery: 3-5 business days</strong>
      </p>
    `)}

    <p style="${s({ 'font-family': "Inter, sans-serif", 'font-size': '12px', 'color': C.textSubtle, 'text-align': 'center', 'margin-top': '24px', 'line-height': '1.7' })}">
      Thank you for shopping with Velario!<br>
      Questions? Contact us at <a href="mailto:support@velario.com" style="color:${C.accent};text-decoration:none;font-weight:600;">support@velario.com</a>
    </p>
  </td>
</tr>
  `;
  return emailWrapper(getHeader() + body + getFooter());
};

// ═══════════════════════════════════════════════════════════════
//  EMAIL SENDING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const sendVerificationEmail = async (email, name, token) => {
  const result = await sendEmail({
    to: email,
    subject: 'Verify Your Velario Account',
    html: getVerificationTemplate(name, token),
  });
  await logEmail(email, 'Verify Your Velario Account', 'verification', result.success ? 'sent' : 'failed');
  return result;
};

export const sendWelcomeEmail = async (email, name) => {
  const result = await sendEmail({
    to: email,
    subject: 'Welcome to the Velario Family',
    html: getWelcomeTemplate(name),
  });
  await logEmail(email, 'Welcome to the Velario Family', 'welcome', result.success ? 'sent' : 'failed');
  return result;
};

export const sendOrderConfirmation = async (email, name, orderId, total, items) => {
  const result = await sendEmail({
    to: email,
    subject: `Order Confirmed — #${orderId}`,
    html: getOrderConfirmationTemplate(name, orderId, total, items),
  });
  await logEmail(email, `Order Confirmed — #${orderId}`, 'order_confirmation', result.success ? 'sent' : 'failed');
  return result;
};

export const sendOrderShipped = async (email, name, orderId, trackingNumber) => {
  const result = await sendEmail({
    to: email,
    subject: `Your Order is On Its Way — #${orderId}`,
    html: getOrderShippedTemplate(name, orderId, trackingNumber),
  });
  await logEmail(email, `Order Shipped — #${orderId}`, 'order_shipped', result.success ? 'sent' : 'failed');
  return result;
};

export const sendOrderDelivered = async (email, name, orderId) => {
  const result = await sendEmail({
    to: email,
    subject: `Delivered! — Order #${orderId}`,
    html: getOrderDeliveredTemplate(name, orderId),
  });
  await logEmail(email, `Delivered — #${orderId}`, 'order_delivered', result.success ? 'sent' : 'failed');
  return result;
};

export const sendNewProductEmail = async (email, productName, price, category, imageUrl) => {
  const result = await sendEmail({
    to: email,
    subject: `New Arrival: ${productName}`,
    html: getNewProductTemplate(productName, price, category, imageUrl),
  });
  await logEmail(email, `New Arrival: ${productName}`, 'new_product', result.success ? 'sent' : 'failed');
  return result;
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const result = await sendEmail({
    to: email,
    subject: 'Reset Your Velario Password',
    html: getPasswordResetTemplate(name, token),
  });
  await logEmail(email, 'Reset Your Velario Password', 'password_reset', result.success ? 'sent' : 'failed');
  return result;
};

// ═══════════════════════════════════════════════════════════════
//  NEW: PAYMENT CONFIRMATION SENDER
// ═══════════════════════════════════════════════════════════════

export const sendPaymentConfirmation = async (email, name, orderId, totalAmount, items, reference) => {
  const result = await sendEmail({
    to: email,
    subject: `Payment Confirmed — Order #${orderId}`,
    html: getPaymentConfirmationTemplate(name, orderId, totalAmount, items, reference),
  });
  await logEmail(email, `Payment Confirmed — #${orderId}`, 'payment_confirmation', result.success ? 'sent' : 'failed');
  return result;
};

// ═══════════════════════════════════════════════════════════════
//  BULK NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export const notifySubscribersNewProduct = async (product) => {
  try {
    console.log('🔔 Starting product notification for:', product.name);
    
    const subscribers = await pool.query(
      'SELECT email FROM subscribers WHERE is_active = true'
    );
    
    console.log(`📧 Found ${subscribers.rows.length} active subscribers`);

    if (subscribers.rows.length === 0) {
      console.log('⚠️ No active subscribers found');
      return;
    }

    let imageUrl = null;
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      imageUrl = typeof firstImage === 'string' ? firstImage : null;
    } else if (product.image) {
      imageUrl = product.image;
    } else if (product.image_url) {
      imageUrl = product.image_url;
    }

    console.log('🖼️ Product image URL:', imageUrl || 'No image');

    let sentCount = 0;
    let failCount = 0;
    
    for (const sub of subscribers.rows) {
      try {
        const result = await sendNewProductEmail(
          sub.email,
          product.name,
          product.price,
          product.category,
          imageUrl
        );
        
        if (result.success) {
          sentCount++;
        } else {
          failCount++;
          console.error(`❌ Failed to send to ${sub.email}:`, result.error);
        }
      } catch (emailError) {
        failCount++;
        console.error(`❌ Error sending to ${sub.email}:`, emailError.message);
      }
    }

    console.log(`📧 Product notification complete: ${sentCount} sent, ${failCount} failed`);
    
  } catch (error) {
    console.error('❌ Notify subscribers error:', error);
  }
};

// ─── ADMIN: EMAIL LOGS ───
export const getEmailLogs = async (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;
    let query = 'SELECT * FROM email_logs WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY sent_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching email logs' });
  }
};