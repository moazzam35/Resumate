import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/mailer";
import { z } from "zod";

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 15 * 60 * 1000;

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address").max(254),
  subject: z.string().min(2, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * POST /api/contact
 * Forward a contact-form message to the support inbox. Rate-limited per IP.
 * @param {Request} request - { name, email, subject, message }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Please fill out the form correctly." },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;
    const clientIp = getClientIp(request);

    const limit = checkRateLimit(`contact:ip:${clientIp}`, CONTACT_LIMIT, CONTACT_WINDOW_MS);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many messages. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const to = process.env.CONTACT_TO || process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || "support@resumate.app";

    await sendEmail({
      to,
      subject: `[Contact] ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        message,
      ].join("\n"),
      html: `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#F5F6F1;font-family:Arial,Helvetica,sans-serif;color:#1C2430;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #D8D3C7;border-radius:8px;">
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 16px;font-size:18px;font-weight:600;">New contact form message</h1>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Name:</strong> ${name.replace(/[<>&]/g, "")}</p>
          <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> ${email.replace(/[<>&]/g, "")}</p>
          <p style="margin:0 0 16px;font-size:14px;"><strong>Subject:</strong> ${subject.replace(/[<>&]/g, "")}</p>
          <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message.replace(/[<>&]/g, "")}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    const undeliverable =
      error?.message?.includes("No email provider") ||
      error?.message?.includes("failed");
    return NextResponse.json(
      { success: false, error: undeliverable ? "Could not deliver your message right now. Please try again later." : "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
