/**
 * Email abstraction for transactional mail (password reset, etc.).
 *
 * Providers (checked in order):
 *   1. Resend — requires RESEND_API_KEY (uses REST API, no extra deps)
 *   2. SMTP   — requires SMTP_HOST + SMTP_USER + SMTP_PASS (uses nodemailer)
 *   3. Dev    — NODE_ENV !== "production" logs the message to the console so the
 *               full flow can be exercised locally without a provider.
 *
 * If none are configured in production, sending throws so callers surface a
 * generic error (never reveal whether an account exists).
 */

import { SITE_CONFIG, getSiteUrl } from "@/lib/constants";

const APP_URL = getSiteUrl();

/**
 * Resolve the Resend API key. The canonical name is RESEND_API_KEY; we also
 * tolerate the previously-shipped mixed-case variant so deployments that
 * copied the old .env still work (the key is read server-side only and is
 * never logged or exposed to the client).
 */
function getResendApiKey() {
  return process.env.RESEND_API_KEY || process.env.Resend_Api_key || "";
}

function getFromAddress() {
  return (
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    `Resumate <no-reply@resumate.app>`
  );
}

/**
 * Resend's built-in sender. It needs no domain verification but only delivers
 * to the email address that owns the Resend account (for testing). Once a
 * domain is verified at https://resend.com/domains, EMAIL_FROM can use it and
 * email goes to any recipient.
 */
const RESEND_ONBOARDING_FROM = "Resumate <onboarding@resend.dev>";

/**
 * Detect Resend's "domain is not verified" error so we can transparently
 * retry with onboarding@resend.dev instead of failing the whole send.
 */
function isDomainNotVerifiedError(status, bodyText) {
  return (
    status === 403 &&
    /domain(?:s)? (?:is|are)? not verified/i.test(bodyText)
  );
}

async function sendViaResend({ to, subject, text, html, replyTo }) {
  const from = getFromAddress();
  const key = getResendApiKey();

  const attempt = async (fromAddress) => {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to,
        subject,
        text,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    const bodyText = await res.text().catch(() => "");
    return { res, bodyText };
  };

  const { res, bodyText } = await attempt(from);

  // Unverified domain: retry once with Resend's testing sender so the flow
  // still works out of the box. Log clearly so the developer knows to verify
  // the domain and set EMAIL_FROM for production delivery to any recipient.
  if (isDomainNotVerifiedError(res.status, bodyText)) {
    console.warn(
      `[mailer] Resend rejected sender "${from}" (domain not verified). ` +
        `Retrying with ${RESEND_ONBOARDING_FROM}. To send to any recipient, ` +
        `verify a domain at https://resend.com/domains and set EMAIL_FROM.`
    );
    const fallback = await attempt(RESEND_ONBOARDING_FROM);
    if (!fallback.res.ok) {
      throw new Error(
        `Resend failed (${fallback.res.status}): ${fallback.bodyText}`
      );
    }
    return;
  }

  if (!res.ok) {
    throw new Error(`Resend failed (${res.status}): ${bodyText}`);
  }
}

async function sendViaSMTP({ to, subject, text, html, replyTo }) {
  const { default: nodemailer } = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
}

function devLogEmail({ to, subject, text, replyTo }) {
  console.log("\n=======================================================");
  console.log("[dev-mailer] Email would be sent (no provider configured)");
  console.log(`[dev-mailer] To: ${to}`);
  if (replyTo) console.log(`[dev-mailer] Reply-To: ${replyTo}`);
  console.log(`[dev-mailer] Subject: ${subject}`);
  console.log("[dev-mailer] --------------------------------------------");
  console.log(text);
  console.log("========================================================\n");
}

/**
 * True when a real email provider is configured (Resend or SMTP). When this
 * is false in development, emails are logged to the console instead.
 */
export function hasEmailProvider() {
  if (getResendApiKey()) return true;
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return true;
  }
  return false;
}

/**
 * Send an email through the first configured provider.
 * @param {{to: string, subject: string, text: string, html?: string, replyTo?: string}} params
 */
export async function sendEmail({ to, subject, text, html, replyTo }) {
  if (getResendApiKey()) {
    return sendViaResend({ to, subject, text, html, replyTo });
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return sendViaSMTP({ to, subject, text, html, replyTo });
  }
  if (process.env.NODE_ENV !== "production") {
    devLogEmail({ to, subject, text, replyTo });
    return;
  }
  throw new Error("No email provider configured (set RESEND_API_KEY or SMTP_* vars)");
}

/**
 * Send a password reset email.
 * @param {{to: string, name: string, resetLink: string}} params
 */
export async function sendPasswordResetEmail({ to, name, resetLink }) {
  const subject = `Reset your ${SITE_CONFIG.name} password`;
  const text = [
    `Hi ${name || "there"},`,
    "",
    `We received a request to reset your ${SITE_CONFIG.name} password.`,
    `Click the link below to choose a new one. This link is valid for 1 hour:`,
    "",
    resetLink,
    "",
    `If you didn't request this, you can safely ignore this email — your password won't change.`,
    "",
    `— ${SITE_CONFIG.name}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#F5F6F1;font-family:Arial,Helvetica,sans-serif;color:#1C2430;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #D8D3C7;border-radius:8px;">
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">Reset your ${SITE_CONFIG.name} password</h1>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
            Hi ${name || "there"}, we received a request to reset your ${SITE_CONFIG.name} password.
            Click the button below to choose a new one. This link is valid for <strong>1 hour</strong>.
          </p>
          <p style="margin:0 0 16px;text-align:center;">
            <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#2E4374;color:#FFFFFF;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">Reset password</a>
          </p>
          <p style="margin:0 0 16px;font-size:13px;line-height:1.6;">
            Or copy and paste this link into your browser:<br />
            <a href="${resetLink}" style="color:#2E4374;word-break:break-all;">${resetLink}</a>
          </p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#7A7566;">
            If you didn't request this, you can safely ignore this email — your password won't change.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;border-top:1px solid #ECEDE6;font-size:12px;color:#7A7566;text-align:center;">
          &copy; ${new Date().getFullYear()} ${SITE_CONFIG.name} &middot; ${APP_URL}
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendEmail({ to, subject, text, html });
}

/**
 * Send an email verification email.
 * @param {{to: string, name: string, verifyLink: string}} params
 */
export async function sendVerificationEmail({ to, name, verifyLink }) {
  const subject = `Verify your ${SITE_CONFIG.name} email`;
  const text = [
    `Hi ${name || "there"},`,
    "",
    `Welcome to ${SITE_CONFIG.name}! Please confirm your email address to unlock all features.`,
    `Click the link below to verify your email. This link is valid for 24 hours:`,
    "",
    verifyLink,
    "",
    `If you didn't create an account, you can safely ignore this email.`,
    "",
    `— ${SITE_CONFIG.name}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#F5F6F1;font-family:Arial,Helvetica,sans-serif;color:#1C2430;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #D8D3C7;border-radius:8px;">
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">Verify your ${SITE_CONFIG.name} email</h1>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
            Hi ${name || "there"}, welcome to ${SITE_CONFIG.name}! Please confirm your email address
            by clicking the button below. This link is valid for <strong>24 hours</strong>.
          </p>
          <p style="margin:0 0 16px;text-align:center;">
            <a href="${verifyLink}" style="display:inline-block;padding:12px 24px;background:#2E4374;color:#FFFFFF;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">Verify email</a>
          </p>
          <p style="margin:0 0 16px;font-size:13px;line-height:1.6;">
            Or copy and paste this link into your browser:<br />
            <a href="${verifyLink}" style="color:#2E4374;word-break:break-all;">${verifyLink}</a>
          </p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#7A7566;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;border-top:1px solid #ECEDE6;font-size:12px;color:#7A7566;text-align:center;">
          &copy; ${new Date().getFullYear()} ${SITE_CONFIG.name} &middot; ${APP_URL}
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return sendEmail({ to, subject, text, html });
}
