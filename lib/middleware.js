/**
 * Reusable authentication and authorization middleware for API routes.
 *
 * Provides:
 * - authenticate(request) -> { userId, user } or throws NextResponse
 * - requireAdmin(request) -> { userId, user } or throws NextResponse
 * - authenticateOptional(request) -> { userId, user } or null
 */

import { NextResponse } from "next/server";
import { verifyAccessToken, getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Authenticate a request using JWT token.
 * @param {Request} request
 * @returns {Promise<{userId: string, user: object}>}
 * @throws {NextResponse} 401 if not authenticated
 */
export async function authenticate(request) {
  const token = getTokenFromRequest(request);

  if (!token) {
    throw NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const payload = await verifyAccessToken(token);

  if (!payload) {
    throw NextResponse.json(
      { success: false, error: "Invalid or expired token" },
      { status: 401 }
    );
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
    },
  });

  if (!user) {
    throw NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  if (user.suspended) {
    throw NextResponse.json(
      { success: false, error: "Account is suspended. Contact support." },
      { status: 403 }
    );
  }

  if (user.disableLogin) {
    throw NextResponse.json(
      { success: false, error: "Login is disabled for this account." },
      { status: 403 }
    );
  }

  return { userId: payload.userId, user };
}

/**
 * Lightweight token auth for sub-resource routes. Returns `{ userId }` or an
 * `{ error }` object containing a NextResponse (401 for bad/missing token,
 * 403 for suspended/disabled accounts). Callers return `auth.error` directly.
 * @param {Request} request
 * @returns {Promise<{userId: string}|{error: NextResponse}>}
 */
export async function authenticateToken(request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return {
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  const payload = await verifyAccessToken(token);
  if (!payload) {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, suspended: true, disableLogin: true },
  });

  if (!user) {
    return {
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  if (user.suspended) {
    return {
      error: NextResponse.json(
        { error: "Account is suspended. Contact support." },
        { status: 403 }
      ),
    };
  }

  if (user.disableLogin) {
    return {
      error: NextResponse.json(
        { error: "Login is disabled for this account." },
        { status: 403 }
      ),
    };
  }

  return { userId: payload.userId };
}

/**
 * Require admin role for a request.
 * @param {Request} request
 * @returns {Promise<{userId: string, user: object}>}
 * @throws {NextResponse} 401 or 403
 */
export async function requireAdmin(request) {
  const { userId, user } = await authenticate(request);

  if (user.role !== "ADMIN") {
    throw NextResponse.json(
      { success: false, error: "Admin access required" },
      { status: 403 }
    );
  }

  return { userId, user };
}

/**
 * Optional authentication - returns null if not authenticated instead of throwing.
 * @param {Request} request
 * @returns {Promise<{userId: string, user: object} | null>}
 */
export async function authenticateOptional(request) {
  try {
    return await authenticate(request);
  } catch {
    return null;
  }
}

/**
 * Verify that a resume belongs to the authenticated user.
 * @param {string} resumeId
 * @param {string} userId
 * @returns {Promise<object>}
 * @throws {NextResponse} 404 if not found or not owned
 */
export async function verifyResumeOwnership(resumeId, userId) {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!resume) {
    throw NextResponse.json(
      { success: false, error: "Resume not found" },
      { status: 404 }
    );
  }

  return resume;
}
