import { authenticate } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * POST /api/notifications/read-all
 * Mark all of the current user's notifications as read.
 */
export async function POST(request) {
  try {
    const { userId } = await authenticate(request);

    const { count } = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return apiSuccess({ updatedCount: count }, "All notifications marked as read");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Mark all notifications read error:", error);
    return apiError("Internal server error");
  }
}
