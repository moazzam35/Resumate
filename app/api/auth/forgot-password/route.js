import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateRandomToken, hashResetToken } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasEmailProvider, sendPasswordResetEmail } from "@/lib/mailer";
import { getSiteUrl } from "@/lib/constants";
import { forgotPasswordSchema } from "@/validators";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_LIMIT = 3;
const EMAIL_WINDOW_MS = 60 * 60 * 1000; // per hour
const IP_LIMIT = 10;
const IP_WINDOW_MS = 15 * 60 * 1000; // 10 per 15 min — bursts are blocked, lockouts recover fast

const SUCCESS_MESSAGE =
  "If an account exists with that email, a reset link has been sent.";

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * POST /api/auth/forgot-password
 * Request a password reset link. Always returns the same response to prevent
 * email enumeration. Rate-limited per email and per IP.
 *
 * @param {Request} request - { email: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }
    const email = parsed.data.email.toLowerCase().trim();
    const clientIp = getClientIp(request);

    const ipLimit = checkRateLimit(`reset:ip:${clientIp}`, IP_LIMIT, IP_WINDOW_MS);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
      );
    }

    const emailLimit = checkRateLimit(`reset:email:${email}`, EMAIL_LIMIT, EMAIL_WINDOW_MS);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfter) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same message — never reveal whether the email exists.
    if (!user) {
      return NextResponse.json({ success: true, message: SUCCESS_MESSAGE });
    }

    const resetToken = generateRandomToken(64);
    const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    // Invalidate any previous (still-unused) reset tokens for this user.
    await prisma.session.deleteMany({
      where: { userId: user.id, token: { startsWith: "reset:" } },
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token: `reset:${hashResetToken(resetToken)}`,
        expiresAt: resetTokenExpiry,
      },
    });

    const resetLink = `${getSiteUrl()}/reset-password?token=${encodeURIComponent(resetToken)}`;

    // Sending the email is best-effort. A delivery failure must never turn
    // into a 500 — that would (a) break the UX and (b) leak which emails have
    // accounts. We always respond with the same generic success message and
    // log the real reason server-side only.
    let devResetLink;
    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetLink,
      });
      // No email provider configured in dev: surface the link directly in the
      // response so the flow can be completed locally. Never in production.
      if (!hasEmailProvider() && process.env.NODE_ENV !== "production") {
        devResetLink = resetLink;
      }
    } catch (error) {
      // Deliberately no token/secret/key in the log line.
      console.error(
        "[forgot-password] Failed to send reset email:",
        error && error.message ? error.message : "unknown send error"
      );
      // In development, still hand the link to the requester so the full flow
      // can be exercised even when the provider/domain rejects the send.
      if (process.env.NODE_ENV !== "production") {
        devResetLink = resetLink;
      }
    }

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGE,
      ...(devResetLink ? { devResetLink } : {}),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
