/**
 * Transactional email helpers — server-side only.
 * Uses Gmail SMTP via nodemailer.
 *
 * Required env vars:
 *   EMAIL_USER   – your Gmail address, e.g. yourname@gmail.com
 *   EMAIL_PASS   – Gmail App Password (16 chars, no spaces)
 *                  https://myaccount.google.com/apppasswords
 */

import nodemailer from 'nodemailer';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://felixseeger.de').replace(/\s+/g, '');

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in .env.local');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass },
  });
}

// ---------------------------------------------------------------------------
// Email template
// ---------------------------------------------------------------------------

function courseEnrollmentHtml(opts: { courseName: string; orderId: string }): string {
  const { courseName, orderId } = opts;
  const shortRef = orderId.slice(-8).toUpperCase();
  const coursesUrl = `${SITE_URL}/courses`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Enrollment Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#18181b;padding:32px 40px;text-align:center;">
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Felix Seeger</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Zahlungsbestätigung</p>
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#18181b;line-height:1.2;">Du bist dabei! 🎉</h1>

              <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">
                Vielen Dank für deine Anmeldung zu <strong style="color:#18181b;">${courseName}</strong>.<br/>
                Deine Zahlung wurde erfolgreich verarbeitet.
              </p>

              <!-- Order reference box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:0.6px;">Referenznummer</p>
                    <p style="margin:0;font-size:16px;color:#18181b;font-weight:700;font-family:monospace;letter-spacing:1px;">${shortRef}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#18181b;border-radius:8px;">
                    <a href="${coursesUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                      Zu meinen Kursen →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#71717a;line-height:1.6;">
                Bei Fragen erreichst du mich jederzeit unter
                <a href="mailto:hello@felixseeger.de" style="color:#18181b;font-weight:600;text-decoration:none;">hello@felixseeger.de</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #f4f4f5;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
                © ${new Date().getFullYear()} Felix Seeger ·
                <a href="${SITE_URL}" style="color:#a1a1aa;text-decoration:underline;">${SITE_URL.replace(/https?:\/\//, '')}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Contact form templates
// ---------------------------------------------------------------------------

function contactNotificationHtml(opts: {
  fullName: string;
  email: string;
  subject: string;
  service: string;
  message: string;
  heardFrom: string;
}): string {
  const { fullName, email, subject, service, message, heardFrom } = opts;
  const row = (label: string, value: string) =>
    value
      ? `<tr>
          <td style="padding:8px 0;font-size:13px;color:#71717a;font-weight:600;width:130px;vertical-align:top;">${label}</td>
          <td style="padding:8px 0;font-size:14px;color:#18181b;">${value}</td>
        </tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="background:#18181b;padding:24px 40px;">
          <span style="color:#fff;font-size:18px;font-weight:700;">📬 Neue Kontaktanfrage</span>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${row('Name', fullName)}
            ${row('E-Mail', `<a href="mailto:${email}" style="color:#18181b;">${email}</a>`)}
            ${row('Betreff', subject)}
            ${row('Service', service)}
            ${row('Gefunden über', heardFrom)}
          </table>
          <hr style="border:none;border-top:1px solid #f4f4f5;margin:20px 0;"/>
          <p style="margin:0 0 8px;font-size:13px;color:#71717a;font-weight:600;">NACHRICHT</p>
          <p style="margin:0;font-size:15px;color:#18181b;line-height:1.7;white-space:pre-wrap;">${message}</p>
        </td></tr>
        <tr><td style="padding:16px 40px 28px;border-top:1px solid #f4f4f5;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
            Gesendet über das Kontaktformular auf felixseeger.de
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function contactConfirmationHtml(opts: { fullName: string }): string {
  const { fullName } = opts;
  const firstName = fullName.split(' ')[0];

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="background:#18181b;padding:32px 40px;text-align:center;">
          <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Felix Seeger</span>
        </td></tr>
        <tr><td style="padding:40px 40px 32px;">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#18181b;">Danke, ${firstName}! 👋</h1>
          <p style="margin:0 0 20px;font-size:15px;color:#3f3f46;line-height:1.7;">
            Ich habe deine Nachricht erhalten und melde mich so schnell wie möglich bei dir — in der Regel innerhalb von 1–2 Werktagen.
          </p>
          <p style="margin:0;font-size:15px;color:#3f3f46;line-height:1.7;">
            Bis bald,<br/>
            <strong style="color:#18181b;">Felix Seeger</strong>
          </p>
        </td></tr>
        <tr><td style="padding:16px 40px 28px;border-top:1px solid #f4f4f5;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
            © ${new Date().getFullYear()} Felix Seeger ·
            <a href="${SITE_URL}" style="color:#a1a1aa;text-decoration:underline;">${SITE_URL.replace(/https?:\/\//, '')}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Send functions
// ---------------------------------------------------------------------------

export interface ContactEmailData {
  fullName: string;
  email: string;
  subject: string;
  service: string;
  message: string;
  heardFrom: string;
}

export async function sendContactEmails(data: ContactEmailData): Promise<void> {
  const transporter = createTransporter();
  const owner = process.env.EMAIL_USER!;

  await Promise.all([
    // Notification to site owner
    transporter.sendMail({
      from: `"Felix Seeger Website" <${owner}>`,
      to: owner,
      replyTo: `"${data.fullName}" <${data.email}>`,
      subject: `[Kontakt] ${data.subject || data.fullName}`,
      html: contactNotificationHtml(data),
    }),
    // Auto-reply to sender
    transporter.sendMail({
      from: `"Felix Seeger" <${owner}>`,
      to: `"${data.fullName}" <${data.email}>`,
      subject: 'Deine Nachricht ist angekommen ✓',
      html: contactConfirmationHtml({ fullName: data.fullName }),
    }),
  ]);
}

export interface EnrollmentEmailData {
  to: string;
  courseName: string;
  orderId: string;
}

export async function sendEnrollmentEmail(data: EnrollmentEmailData): Promise<void> {
  const { to, courseName, orderId } = data;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Felix Seeger" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Deine Anmeldung: ${courseName}`,
      html: courseEnrollmentHtml({ courseName, orderId }),
    });
  } catch (err) {
    // Log but don't throw — payment is already captured, don't fail the redirect
    console.error('[email] Failed to send enrollment email:', err);
  }
}
