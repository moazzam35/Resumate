import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashResetToken } from "@/lib/password";
import { z } from "zod";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const verifySchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

/**
 * POST /api/auth/verify-email
 * Verify a user's email address using the one-time token emailed at signup.
 * @param {Request} request - { token: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Verification token is required" },
        { status: 400 }
      );
    }

    const hashed = hashResetToken(parsed.data.token);
    const session = await prisma.session.findUnique({
      where: { token: `verify:${hashed}` },
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "This verification link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Single-use: remove the token, then mark the email as verified.
    await prisma.$transaction([
      prisma.session.deleteMany({
        where: { userId: session.userId, token: { startsWith: "verify:" } },
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: { emailVerified: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
