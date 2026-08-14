import { authenticate } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-response";

/**
 * PUT /api/notifications/[id]
 * Mark a notification as read. Only the owning user can do this.
 */
export async function PUT(request, { params }) {
  try {
    const { userId } = await authenticate(request);
    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return apiNotFound("Notification not found");
    }

    if (notification.userId !== userId) {
      return apiError("Access denied", 403);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return apiSuccess(updated, "Notification marked as read");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Mark notification read error:", error);
    return apiError("Internal server error");
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a notification. Only the owning user can do this.
 */
export async function DELETE(request, { params }) {
  try {
    const { userId } = await authenticate(request);
    const { id } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return apiNotFound("Notification not found");
    }

    if (notification.userId !== userId) {
      return apiError("Access denied", 403);
    }

    await prisma.notification.delete({ where: { id } });

    return apiSuccess(null, "Notification deleted");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Delete notification error:", error);
    return apiError("Internal server error");
  }
}
