import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { profileSchema } from "@/validators";

/**
 * GET /api/auth/profile
 * Return the full profile of the authenticated user.
 *
 * @param {Request} request
 */
export async function GET(request) {
  try {
    const { user } = await authenticate(request);

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        github: true,
        linkedin: true,
        portfolio: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        subscription: {
          select: {
            plan: true,
            isActive: true,
            startDate: true,
            endDate: true,
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

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile.
 *
 * @param {Request} request - { name, email, bio, phone, location, github, linkedin, portfolio }
 */
export async function PUT(request) {
  try {
    const { user } = await authenticate(request);
    const body = await request.json();

    const result = profileSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", errors },
        { status: 422 }
      );
    }

    const { name, email, bio, phone, location, github, linkedin, portfolio, avatar } =
      result.data;

    const emailChanged = email.toLowerCase() !== user.email.toLowerCase();

    // Check if email is taken by another user
    if (emailChanged) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email is already in use" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email: email.toLowerCase(),
        // A new address is unverified until the user confirms it again.
        ...(emailChanged ? { emailVerified: false } : {}),
        bio: bio || null,
        phone: phone || null,
        location: location || null,
        github: github || null,
        linkedin: linkedin || null,
        portfolio: portfolio || null,
        avatar: avatar || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        phone: true,
        location: true,
        github: true,
        linkedin: true,
        portfolio: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
