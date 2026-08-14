import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRefreshToken } from "@/lib/auth";
import { hashSessionToken } from "@/lib/password";

const ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60; // 1h
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7d (standard policy)
const REMEMBER_ME_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30d

export async function POST(request) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token" },
        { status: 401 }
      );
    }

    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      const response = NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
      response.cookies.delete("token");
      response.cookies.delete("refreshToken");
      return response;
    }

    const session = await prisma.session.findUnique({
      where: { token: hashSessionToken(refreshToken) },
    });

    if (!session || session.expiresAt < new Date()) {
      const response = NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
      response.cookies.delete("token");
      response.cookies.delete("refreshToken");
      return response;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        suspended: true,
        disableLogin: true,
        subscription: {
          select: { plan: true, isActive: true, aiCreditsUsed: true, aiCreditResetAt: true },
        },
        _count: { select: { resumes: true, coverLetters: true } },
      },
    });

    if (!user) {
      const response = NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
      response.cookies.delete("token");
      response.cookies.delete("refreshToken");
      return response;
    }

    if (user.suspended) {
      const response = NextResponse.json(
        { error: "Account is suspended. Contact support." },
        { status: 403 }
      );
      response.cookies.delete("token");
      response.cookies.delete("refreshToken");
      return response;
    }

    if (user.disableLogin) {
      const response = NextResponse.json(
        { error: "Login is disabled for this account." },
        { status: 403 }
      );
      response.cookies.delete("token");
      response.cookies.delete("refreshToken");
      return response;
    }

    const { signAccessToken, signRefreshToken } = await import("@/lib/auth");

    // Preserve the remember-me preference that was stamped on the original
    // login, so rotating the refresh token never upgrades a browser-session
    // cookie into a persistent one (or vice versa).
    const rememberMe = payload.rememberMe === true;

    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await signRefreshToken({
      userId: user.id,
      rememberMe,
    });

    const sessionTtlMs = rememberMe
      ? REMEMBER_ME_COOKIE_MAX_AGE * 1000
      : SESSION_COOKIE_MAX_AGE * 1000;

    await prisma.session.updateMany({
      where: { token: hashSessionToken(refreshToken) },
      data: {
        token: hashSessionToken(newRefreshToken),
        expiresAt: new Date(Date.now() + sessionTtlMs),
      },
    });

    const response = NextResponse.json({
      user,
      accessToken: newAccessToken,
    });

    response.cookies.set("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      ...(rememberMe ? { maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE } : {}),
      path: "/",
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      ...(rememberMe ? { maxAge: REMEMBER_ME_COOKIE_MAX_AGE } : {}),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
