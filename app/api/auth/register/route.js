import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateRandomToken, hashResetToken, hashSessionToken } from "@/lib/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasEmailProvider, sendVerificationEmail } from "@/lib/mailer";
import { getSiteUrl } from "@/lib/constants";
import { startOfNextMonth } from "@/lib/usage";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const IP_LIMIT = 5;
const IP_WINDOW_MS = 15 * 60 * 1000; // 5 registrations per 15 min per IP

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

const serverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = serverSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0] || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(`register:ip:${clientIp}`, IP_LIMIT, IP_WINDOW_MS);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many accounts created from this device. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        provider: "credentials",
      },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: "FREE",
        aiCreditsUsed: 0,
        aiCreditResetAt: startOfNextMonth(),
      },
    });

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await signRefreshToken({
      userId: user.id,
      rememberMe: true,
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token: hashSessionToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Send an email verification link (best-effort — never blocks signup).
    let emailVerificationSent = false;
    let devVerifyLink;
    try {
      const verifyToken = generateRandomToken(64);
      await prisma.session.create({
        data: {
          userId: user.id,
          token: `verify:${hashResetToken(verifyToken)}`,
          expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
        },
      });
      const verifyLink = `${getSiteUrl()}/verify-email?token=${encodeURIComponent(verifyToken)}`;
      await sendVerificationEmail({ to: user.email, name: user.name, verifyLink });
      emailVerificationSent = true;
      // No email provider configured in dev: surface the link directly in the
      // response so the flow can be completed locally. Never in production.
      if (!hasEmailProvider() && process.env.NODE_ENV !== "production") {
        devVerifyLink = verifyLink;
      }
    } catch {
      // Non-critical: verification can be re-requested from /verify-email.
    }

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          subscription: { plan: "FREE", isActive: true, aiCreditsUsed: 0 },
          _count: { resumes: 0, coverLetters: 0 },
        },
        accessToken,
        emailVerificationSent,
        ...(devVerifyLink ? { devVerifyLink } : {}),
      },
      { status: 201 }
    );

    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
