import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateRandomToken, hashResetToken } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasEmailProvider, sendVerificationEmail } from "@/lib/mailer";
import { z } from "zod";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const EMAIL_LIMIT = 3;
const EMAIL_WINDOW_MS = 60 * 60 * 1000; // 3 resends per hour per email
const IP_LIMIT = 10;
const IP_WINDOW_MS = 15 * 60 * 1000;

const resendSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * POST /api/auth/resend-verification
 * Re-send the email verification link. Rate-limited per email and per IP.
 * Never reveals whether the account exists (same response either way).
 * @param {Request} request - { email: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = resendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const clientIp = getClientIp(request);

    const ipLimit = checkRateLimit(`verify:ip:${clientIp}`, IP_LIMIT, IP_WINDOW_MS);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
      );
    }

    const emailLimit = checkRateLimit(`verify:email:${email}`, EMAIL_LIMIT, EMAIL_WINDOW_MS);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfter) } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, emailVerified: true, provider: true },
    });

    if (!user || user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, a verification link has been sent.",
      });
    }

    const token = generateRandomToken(64);
    const expiresAt = new Date(Date.now() + VERIFY_TTL_MS);

    await prisma.session.deleteMany({
      where: { userId: user.id, token: { startsWith: "verify:" } },
    });

    await prisma.session.create({
      data: { userId: user.id, token: `verify:${hashResetToken(token)}`, expiresAt },
    });

    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${encodeURIComponent(token)}`;

    await sendVerificationEmail({ to: user.email, name: user.name, verifyLink });

    // No email provider configured in dev: surface the link directly in the
    // response so the flow can be completed locally. Never in production.
    const devVerifyLink =
      !hasEmailProvider() && process.env.NODE_ENV !== "production"
        ? verifyLink
        : undefined;

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, a verification link has been sent.",
      ...(devVerifyLink ? { devVerifyLink } : {}),
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
