import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";

const DEFAULT_PREFS = {
  email: true,
  marketing: false,
  updates: true,
};

function normalizePrefs(prefs) {
  const raw = prefs && typeof prefs === "object" ? prefs : {};
  return {
    email: typeof raw.email === "boolean" ? raw.email : DEFAULT_PREFS.email,
    marketing: typeof raw.marketing === "boolean" ? raw.marketing : DEFAULT_PREFS.marketing,
    updates: typeof raw.updates === "boolean" ? raw.updates : DEFAULT_PREFS.updates,
  };
}

/**
 * GET /api/user/preferences
 * Return the authenticated user's notification preferences.
 */
export async function GET(request) {
  try {
    const { userId } = await authenticate(request);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true },
    });

    return NextResponse.json({
      success: true,
      preferences: normalizePrefs(user?.notificationPrefs),
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Get preferences error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 * Persist the authenticated user's notification preferences.
 * @param {Request} request - { email?, marketing?, updates? }
 */
export async function PUT(request) {
  try {
    const { userId } = await authenticate(request);

    const body = await request.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { success: false, error: "Invalid preferences payload" },
        { status: 400 }
      );
    }

    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true },
    });

    const prefs = normalizePrefs({ ...(current?.notificationPrefs || {}), ...body });

    await prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: prefs },
    });

    return NextResponse.json({ success: true, preferences: prefs });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Update preferences error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
