import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/mailer";
import { z } from "zod";

const SUPPORT_LIMIT = 5;
const SUPPORT_WINDOW_MS = 15 * 60 * 1000;
const DEDUPE_WINDOW_MS = 30 * 1000;

const supportSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254),
  subject: z.string().trim().min(2, "Subject is required").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be 5000 characters or fewer"),
});

// Small in-memory dedupe so a double-click / double-submit of the exact same
// message only produces one email. Keyed by IP + normalized body hash.
const recentSubmissions = new Map();

function escapeHtml(value) {
  return String(value).replace(/[<>&]/g, (ch) => {
    if (ch === "<") return "&lt;";
    if (ch === ">") return "&gt;";
    return "&amp;";
  });
}

/**
 * POST /api/support
 * Forward a support-form message to the support inbox via the project mailer
 * (Resend when RESEND_API_KEY is set). Rate-limited and de-duplicated per IP.
 * The Resend API key is only ever read server-side — never returned to the client.
 *
 * Body: { name, email, subject, message }
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = supportSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Please fill out the form correctly." },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;
    const clientIp = getClientIp(request);

    // Rate limit — prevent spam / abuse.
    const limit = checkRateLimit(
      `support:ip:${clientIp}`,
      SUPPORT_LIMIT,
      SUPPORT_WINDOW_MS
    );
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many messages. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    // Prevent accidental duplicate submissions of the exact same message.
    const dedupeKey = `support:dedupe:${clientIp}:${JSON.stringify({
      name,
      email,
      subject,
      message,
    })}`;
    const now = Date.now();
    const lastSentAt = recentSubmissions.get(dedupeKey) || 0;
    if (now - lastSentAt < DEDUPE_WINDOW_MS) {
      return NextResponse.json(
        { success: false, error: "This message was already sent. Please wait a moment and try again." },
        { status: 429 }
      );
    }
    recentSubmissions.set(dedupeKey, now);
    if (recentSubmissions.size > 10000) {
      for (const [key, ts] of recentSubmissions) {
        if (now - ts > DEDUPE_WINDOW_MS) recentSubmissions.delete(key);
      }
    }

    // The support inbox must come from env vars — never invent or hardcode one.
    const to =
      process.env.SUPPORT_EMAIL ||
      process.env.CONTACT_TO ||
      process.env.EMAIL_FROM;
    if (!to) {
      return NextResponse.json(
        { success: false, error: "Support is not configured yet. Please try again later." },
        { status: 503 }
      );
    }

    const subjectLine = `[Support] ${subject}`;
    const text = [
      `New message from the Resumate support form`,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      message,
    ].join("\n");

    const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#F5F6F1;font-family:Arial,Helvetica,sans-serif;color:#1C2430;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #D8D3C7;border-radius:8px;">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#7A7566;">Resumate Support</p>
          <h1 style="margin:0 0 16px;font-size:18px;font-weight:600;">New support message</h1>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="margin:0 0 16px;font-size:14px;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</p>
          <p style="margin:0;font-size:12px;color:#7A7566;">Sent via the Resumate support form. Reply directly to this email to reach the sender.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    await sendEmail({
      to,
      subject: subjectLine,
      text,
      html,
      replyTo: email,
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    console.error("Support form error:", error);
    const undeliverable =
      error?.message?.includes("No email provider") ||
      error?.message?.includes("failed");
    return NextResponse.json(
      {
        success: false,
        error: undeliverable
          ? "Could not deliver your message right now. Please try again later."
          : "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
