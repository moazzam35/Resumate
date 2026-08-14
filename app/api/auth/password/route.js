import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { verifyPassword, hashPassword } from "@/lib/password";
import { passwordChangeSchema } from "@/validators";

/**
 * POST /api/auth/password
 * Change the authenticated user's password.
 * Requires the current password for verification, then sets the new one.
 *
 * @param {Request} request - { currentPassword: string, newPassword: string, confirmPassword: string }
 */
export async function POST(request) {
  try {
    const { user } = await authenticate(request);
    const body = await request.json();

    const result = passwordChangeSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
        { status: 422 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Fetch user with password to verify current password
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true },
    });

    if (!fullUser || !fullUser.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to change password for this account",
        },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(currentPassword, fullUser.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Invalidate all sessions except current one (force re-login elsewhere)
    // We don't have access to the current session token here, so we delete all
    // and let the client refresh its token
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
