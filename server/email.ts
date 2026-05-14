// Email service. Uses SendGrid in production, logs to console in dev.
// To enable real emails, set SENDGRID_API_KEY and EMAIL_FROM in env.

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const hasSendGrid = !!process.env.SENDGRID_API_KEY;
const fromAddress = process.env.EMAIL_FROM || "noreply@soriahealth.com";

async function sendViaSendGrid({ to, subject, text, html }: SendEmailOptions): Promise<void> {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromAddress, name: "Soria Health" },
      subject,
      content: [
        { type: "text/plain", value: text },
        ...(html ? [{ type: "text/html", value: html }] : []),
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SendGrid error ${res.status}: ${body}`);
  }
}

export async function sendEmail(opts: SendEmailOptions): Promise<void> {
  if (hasSendGrid) {
    try {
      await sendViaSendGrid(opts);
      console.log(`[email] Sent "${opts.subject}" to ${opts.to}`);
    } catch (err) {
      console.error("[email] SendGrid failed, falling back to console:", err);
      console.log(`[email:fallback] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}`);
    }
  } else {
    console.log(`[email:dev] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}\n---`);
  }
}

// ── Pre-built templates ────────────────────────────────────────

export function sendVerificationEmail(to: string, code: string) {
  return sendEmail({
    to,
    subject: "Your Soria verification code",
    text: `Your Soria verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a;">Your verification code</h2>
        <p style="color: #555;">Enter this code in the Soria app to verify your email:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #3b82f6; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center; margin: 24px 0;">
          ${code}
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export function sendPasswordResetEmail(to: string, token: string) {
  return sendEmail({
    to,
    subject: "Reset your Soria password",
    text: `Use this token to reset your password: ${token}\n\nThis token expires in 1 hour.\n\nIf you didn't request a reset, ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a;">Reset your password</h2>
        <p style="color: #555;">Enter this token in the app to reset your password:</p>
        <div style="font-family: monospace; font-size: 18px; word-break: break-all; padding: 16px; background: #f3f4f6; border-radius: 8px; margin: 24px 0;">
          ${token}
        </div>
        <p style="color: #888; font-size: 13px;">This token expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
