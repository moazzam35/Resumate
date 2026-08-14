import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, hashResetToken } from "@/lib/password";
import { z } from "zod";

const resetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

/**
 * POST /api/auth/reset-password
 * Reset a user's password using a valid reset token.
 * Tokens are stored hashed (sha256) with a "reset:" prefix in the Session table,
 * are single-use, and expire after 1 hour.
 *
 * @param {Request} request - { token: string, password: string }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0] || "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }
    const { token, password } = parsed.data;

    const session = await prisma.session.findFirst({
      where: {
        token: `reset:${hashResetToken(token)}`,
        expiresAt: { gte: new Date() },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Single-use: delete the reset token, then invalidate every other session
    // (including any "remember me" refresh tokens) so a password change logs
    // the user out everywhere.
    await prisma.session.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
