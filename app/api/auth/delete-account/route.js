import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { verifyPassword, hashSessionToken } from "@/lib/password";

/**
 * POST /api/auth/delete-account
 * Permanently delete the authenticated user's account and all associated
 * data. Requires the current password as confirmation.
 * @param {Request} request - { password: string }
 */
export async function POST(request) {
  try {
    const { userId } = await authenticate(request);
    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Please enter your password to confirm account deletion." },
        { status: 400 }
      );
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, provider: true },
    });

    if (!fullUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Credentials accounts must supply the correct password. Accounts without
    // a password (OAuth) skip the check since none are in use today.
    if (fullUser.password) {
      const ok = await verifyPassword(password, fullUser.password);
      if (!ok) {
        return NextResponse.json(
          { success: false, error: "Incorrect password" },
          { status: 401 }
        );
      }
    }

    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      await prisma.session.deleteMany({ where: { token: hashSessionToken(refreshToken) } });
    }

    await prisma.user.delete({ where: { id: userId } });

    const response = NextResponse.json({ success: true });
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
    return response;
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Delete account error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
