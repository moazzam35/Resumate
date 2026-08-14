import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiNotFound, safeBody } from "@/lib/api-response";
import { logAuditAction } from "@/lib/audit";

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await params;
    const body = await safeBody(request);

    if (!body || !body.action) {
      return apiError("action is required", 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return apiNotFound("User not found");
    }

    const { action } = body;
    let updateData = {};
    let logAction = "";
    let logDetails = {};

    switch (action) {
      case "suspend":
        if (user.role === "ADMIN") {
          return apiError("Cannot suspend an admin", 400);
        }
        updateData = { suspended: true };
        logAction = "SUSPEND_ACCOUNT";
        logDetails = { suspended: true };
        break;

      case "reactivate":
        updateData = { suspended: false };
        logAction = "REACTIVATE_ACCOUNT";
        logDetails = { suspended: false };
        break;

      case "verify_email":
        updateData = { emailVerified: new Date() };
        logAction = "VERIFY_EMAIL";
        logDetails = { emailVerified: true };
        break;

      case "disable_login":
        updateData = { disableLogin: true };
        logAction = "DISABLE_LOGIN";
        logDetails = { disableLogin: true };
        break;

      case "enable_login":
        updateData = { disableLogin: false };
        logAction = "ENABLE_LOGIN";
        logDetails = { disableLogin: false };
        break;

      case "force_password_reset":
        logAction = "FORCE_PASSWORD_RESET";
        logDetails = { forced: true };
        // Invalidate every session so the user is signed out on all devices
        // and must re-authenticate (forcing a fresh password flow).
        await prisma.session.deleteMany({ where: { userId: id } });
        break;

      default:
        return apiError("Invalid action", 400);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id },
        data: updateData,
      });
    }

    await logAuditAction({
      adminId: admin.userId,
      action: logAction,
      targetUser: id,
      targetEmail: user.email,
      details: logDetails,
      ipAddress: request.headers.get("x-forwarded-for"),
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true,
        suspended: true, disableLogin: true, emailVerified: true,
      },
    });

    return apiSuccess(updatedUser, `Account ${action.replace("_", " ")} successful`);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin account action error:", error);
    return apiError("Internal server error");
  }
}
