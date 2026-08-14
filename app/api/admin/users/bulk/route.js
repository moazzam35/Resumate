import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, safeBody } from "@/lib/api-response";
import { logAuditAction } from "@/lib/audit";

const VALID_PLANS = ["FREE", "PRO", "ENTERPRISE"];

export async function POST(request) {
  try {
    const admin = await requireAdmin(request);
    const body = await safeBody(request);

    if (!body || !body.action || !body.userIds || !Array.isArray(body.userIds) || body.userIds.length === 0) {
      return apiError("action and userIds array are required", 400);
    }

    const { action, userIds, plan } = body;
    const results = { success: [], failed: [] };

    for (const userId of userIds) {
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          results.failed.push({ userId, reason: "User not found" });
          continue;
        }

        switch (action) {
          case "upgrade":
          case "downgrade": {
            if (!plan || !VALID_PLANS.includes(plan.toUpperCase())) {
              results.failed.push({ userId, reason: "Invalid plan" });
              continue;
            }
            const oldSub = await prisma.subscription.findUnique({ where: { userId } });
            await prisma.subscription.upsert({
              where: { userId },
              update: { plan: plan.toUpperCase(), isActive: true },
              create: { userId, plan: plan.toUpperCase(), isActive: true },
            });
            await logAuditAction({
              adminId: admin.userId, action: "CHANGE_PLAN",
              targetUser: userId, targetEmail: user.email,
              details: { from: oldSub?.plan || "NONE", to: plan.toUpperCase(), bulk: true },
            });
            results.success.push({ userId, email: user.email });
            break;
          }

          case "suspend":
            if (user.role === "ADMIN") {
              results.failed.push({ userId, reason: "Cannot suspend admin" });
              continue;
            }
            await prisma.user.update({ where: { id: userId }, data: { suspended: true } });
            await logAuditAction({
              adminId: admin.userId, action: "SUSPEND_ACCOUNT",
              targetUser: userId, targetEmail: user.email,
              details: { bulk: true },
            });
            results.success.push({ userId, email: user.email });
            break;

          case "verify":
            await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
            await logAuditAction({
              adminId: admin.userId, action: "VERIFY_EMAIL",
              targetUser: userId, targetEmail: user.email,
              details: { bulk: true },
            });
            results.success.push({ userId, email: user.email });
            break;

          case "delete":
            if (user.role === "ADMIN") {
              results.failed.push({ userId, reason: "Cannot delete admin" });
              continue;
            }
            await prisma.user.delete({ where: { id: userId } });
            await logAuditAction({
              adminId: admin.userId, action: "DELETE_USER",
              targetUser: userId, targetEmail: user.email,
              details: { bulk: true },
            });
            results.success.push({ userId, email: user.email });
            break;

          default:
            results.failed.push({ userId, reason: "Invalid action: " + action });
        }
      } catch (err) {
        console.error(`Bulk action "${action}" failed for user ${userId}:`, err);
        results.failed.push({ userId, reason: "Operation failed" });
      }
    }

    return apiSuccess(results, `Bulk ${action} completed`);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin bulk action error:", error);
    return apiError("Internal server error");
  }
}
