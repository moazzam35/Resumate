import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(request) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(token);

    if (!payload) {
      const response = NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
      response.cookies.delete("token");
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
        bio: true,
        phone: true,
        location: true,
        github: true,
        linkedin: true,
        portfolio: true,
        provider: true,
        emailVerified: true,
        suspended: true,
        disableLogin: true,
        createdAt: true,
        subscription: {
          select: {
            plan: true,
            isActive: true,
            aiCreditsUsed: true,
            aiCreditResetAt: true,
          },
        },
        _count: {
          select: {
            resumes: true,
            coverLetters: true,
          },
        },
      },
    });

    if (!user) {
      const response = NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
      response.cookies.delete("token");
      return response;
    }

    if (user.suspended) {
      const response = NextResponse.json(
        { error: "Account is suspended. Contact support." },
        { status: 403 }
      );
      response.cookies.delete("token");
      return response;
    }

    if (user.disableLogin) {
      const response = NextResponse.json(
        { error: "Login is disabled for this account." },
        { status: 403 }
      );
      response.cookies.delete("token");
      return response;
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
