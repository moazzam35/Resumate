import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, hashSessionToken } from "@/lib/password";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { loginSchema } from "@/validators";
import { checkRateLimit } from "@/lib/rate-limit";

const ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60; // 1h
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7d (standard policy)
const REMEMBER_ME_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30d

const IP_LIMIT = 10;
const IP_WINDOW_MS = 15 * 60 * 1000; // 10 attempts per 15 min per IP
const EMAIL_LIMIT = 20;
const EMAIL_WINDOW_MS = 15 * 60 * 1000; // per-account brute-force protection

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0] || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    const { email, password, rememberMe = false } = parsed.data;

    const clientIp = getClientIp(request);
    const ipLimit = checkRateLimit(`login:ip:${clientIp}`, IP_LIMIT, IP_WINDOW_MS);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
      );
    }

    const emailLimit = checkRateLimit(`login:email:${email.toLowerCase()}`, EMAIL_LIMIT, EMAIL_WINDOW_MS);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts for this account. Please try again later." },
        { status: 429, headers: { "Retry-After": String(emailLimit.retryAfter) } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        subscription: { select: { plan: true, isActive: true, aiCreditsUsed: true, aiCreditResetAt: true } },
        _count: { select: { resumes: true, coverLetters: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.provider === "google" && !user.password) {
      // Deliberately identical to the generic failure message so we don't
      // reveal that an account exists for this email.
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.suspended) {
      return NextResponse.json(
        { error: "Account is suspended. Contact support." },
        { status: 403 }
      );
    }

    if (user.disableLogin) {
      return NextResponse.json(
        { error: "Login is disabled for this account." },
        { status: 403 }
      );
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await signRefreshToken({
      userId: user.id,
      rememberMe,
    });

    const sessionTtlMs = rememberMe
      ? REMEMBER_ME_COOKIE_MAX_AGE * 1000
      : SESSION_COOKIE_MAX_AGE * 1000;

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null;
    const ua = request.headers.get("user-agent") || null;

    // Create the session and update tracking state in parallel. The tracking
    // writes are best-effort — a failure there must not fail the login.
    const trackingOps = [
      prisma.user
        .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
        .catch(() => {}),
    ];
    if (ip || ua) {
      trackingOps.push(
        prisma.loginHistory
          .create({ data: { userId: user.id, ipAddress: ip, userAgent: ua } })
          .catch(() => {})
      );
    }

    await Promise.all([
      prisma.session.create({
        data: {
          userId: user.id,
          token: hashSessionToken(refreshToken),
          expiresAt: new Date(Date.now() + sessionTtlMs),
        },
      }),
      ...trackingOps,
    ]);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        subscription: user.subscription
          ? {
              plan: user.subscription.plan,
              isActive: user.subscription.isActive,
              aiCreditsUsed: user.subscription.aiCreditsUsed,
              aiCreditResetAt: user.subscription.aiCreditResetAt,
            }
          : null,
        _count: {
          resumes: user._count?.resumes ?? 0,
          coverLetters: user._count?.coverLetters ?? 0,
        },
      },
      accessToken,
      rememberMe,
    });

    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // Session-scoped when "remember me" is off so the cookie is cleared on
      // browser close; otherwise the token itself expires after 1h regardless.
      ...(rememberMe ? { maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE } : {}),
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // Persistent 30d cookie only when the user opted in to "remember me".
      // Without it the cookie is session-scoped (cleared when the browser closes)
      // while the server-side session still respects the standard 7d policy.
      ...(rememberMe ? { maxAge: REMEMBER_ME_COOKIE_MAX_AGE } : {}),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
