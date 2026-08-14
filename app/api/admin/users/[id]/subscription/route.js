import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiNotFound, safeBody } from "@/lib/api-response";
import { logAuditAction } from "@/lib/audit";
import { startOfNextMonth } from "@/lib/usage";

const VALID_PLANS = ["FREE", "PRO", "ENTERPRISE"];

export async function GET(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { userId: id },
    });

    if (!subscription) {
      return apiSuccess(null, "No subscription found");
    }

    return apiSuccess(subscription);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin get subscription error:", error);
    return apiError("Internal server error");
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await params;
    const body = await safeBody(request);

    if (!body) {
      return apiError("Invalid request body", 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return apiNotFound("User not found");
    }

    const { plan, isActive, endDate, removeEndDate, renewalDate, stripeId, renew, resetCredits } = body;
    const updateData = {};
    const details = {};

    const oldSub = await prisma.subscription.findUnique({ where: { userId: id } });

    if (plan) {
      if (!VALID_PLANS.includes(plan.toUpperCase())) {
        return apiError("Invalid plan. Valid plans: " + VALID_PLANS.join(", "), 400);
      }
      updateData.plan = plan.toUpperCase();
      details.from = oldSub?.plan || "NONE";
      details.to = plan.toUpperCase();
    }

    if (renew) {
      const now = new Date();
      updateData.renewalDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      updateData.isActive = true;
      updateData.aiCreditsUsed = 0;
      updateData.aiCreditResetAt = startOfNextMonth(now);
      details.renewed = true;
      details.renewalDate = updateData.renewalDate.toISOString();
    }

    if (resetCredits) {
      updateData.aiCreditsUsed = 0;
      updateData.aiCreditResetAt = startOfNextMonth(new Date());
      details.creditsReset = true;
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
      details.isActive = isActive;
    }

    if (endDate) {
      updateData.endDate = new Date(endDate);
      details.endDate = endDate;
    }

    if (removeEndDate) {
      updateData.endDate = null;
      details.endDate = null;
    }

    if (renewalDate) {
      updateData.renewalDate = new Date(renewalDate);
      details.renewalDate = renewalDate;
    }

    if (stripeId) {
      updateData.stripeId = stripeId;
    }

    const subscription = await prisma.subscription.upsert({
      where: { userId: id },
      update: updateData,
      create: { userId: id, plan: plan?.toUpperCase() || "FREE", isActive: isActive ?? true, aiCreditsUsed: 0, aiCreditResetAt: startOfNextMonth(new Date()) },
    });

    await logAuditAction({
      adminId: admin.userId,
      action: renew ? "RENEW_SUBSCRIPTION" : resetCredits ? "RESET_AI_CREDITS" : plan ? "CHANGE_PLAN" : "UPDATE_SUBSCRIPTION",
      targetUser: id,
      targetEmail: user.email,
      details: { ...details, newPlan: subscription.plan, newIsActive: subscription.isActive },
      ipAddress: request.headers.get("x-forwarded-for"),
    });

    return apiSuccess(subscription, "Subscription updated");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin update subscription error:", error);
    return apiError("Internal server error");
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return apiNotFound("User not found");
    }

    await prisma.subscription.delete({ where: { userId: id } }).catch(() => {});

    await logAuditAction({
      adminId: admin.userId,
      action: "CANCEL_SUBSCRIPTION",
      targetUser: id,
      targetEmail: user.email,
      details: { cancelled: true },
      ipAddress: request.headers.get("x-forwarded-for"),
    });

    return apiSuccess(null, "Subscription cancelled");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin cancel subscription error:", error);
    return apiError("Internal server error");
  }
}
