import { NextResponse } from "next/server";
import { authenticate, requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiError, apiCreated, apiPaginated, safeBody, validateRequired, parsePagination } from "@/lib/api-response";

/**
 * GET /api/notifications
 * List current user's notifications with pagination.
 * Supports ?unread=true to filter unread only.
 * Returns { notifications, unreadCount }.
 */
export async function GET(request) {
  try {
    const { userId } = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, { limit: 20 });
    const unreadOnly = searchParams.get("unread") === "true";

    const where = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    const paginatedResponse = apiPaginated(notifications, { total, page, limit });
    const body = await paginatedResponse.json();
    body.unreadCount = unreadCount;
    return NextResponse.json(body);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Get notifications error:", error);
    return apiError("Internal server error");
  }
}

/**
 * POST /api/notifications
 * Create a notification for a user (admin only).
 * Body: { userId, title, message, type?, link? }
 */
export async function POST(request) {
  try {
    await requireAdmin(request);

    const body = await safeBody(request);
    const { valid, missing } = validateRequired(body, ["userId", "title", "message"]);
    if (!valid) {
      return apiError(`Missing required fields: ${missing.join(", ")}`, 400);
    }

    const userExists = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!userExists) {
      return apiError("User not found", 404);
    }

    const validTypes = ["INFO", "SUCCESS", "WARNING", "ERROR"];
    const type = validTypes.includes(body.type) ? body.type : "INFO";

    const notification = await prisma.notification.create({
      data: {
        userId: body.userId,
        title: body.title,
        message: body.message,
        type,
        link: body.link || null,
      },
    });

    return apiCreated(notification, "Notification created");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Create notification error:", error);
    return apiError("Internal server error");
  }
}
