import { authenticate } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, safeBody } from "@/lib/api-response";
import { logAuditAction } from "@/lib/audit";

const VALID_PLANS = ["PRO", "ENTERPRISE"];
const PLAN_TIER = { FREE: 0, PRO: 1, ENTERPRISE: 2 };

/**
 * POST /api/billing/upgrade
 * Self-serve plan upgrade for the authenticated user (mock purchase).
 *
 * @param {Request} request - { plan: "PRO" | "ENTERPRISE" }
 */
export async function POST(request) {
  try {
    const { user } = await authenticate(request);
    const body = await safeBody(request);

    if (!body || !body.plan) {
      return apiError("Plan is required", 400);
    }

    const targetPlan = String(body.plan).toUpperCase();
    if (!VALID_PLANS.includes(targetPlan)) {
      return apiError("Invalid plan. Choose PRO or ENTERPRISE.", 400);
    }

    const existing = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    const currentPlan = existing?.plan || "FREE";

    if (PLAN_TIER[targetPlan] <= PLAN_TIER[currentPlan]) {
      return apiError(
        targetPlan === currentPlan
          ? `You are already on the ${targetPlan} plan`
          : "Downgrades are not supported",
        400
      );
    }

    const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, plan: targetPlan, isActive: true, renewalDate },
      update: { plan: targetPlan, isActive: true, renewalDate },
    });

    await logAuditAction({
      adminId: user.id,
      action: "SELF_UPGRADE",
      targetUser: user.id,
      targetEmail: user.email,
      details: { from: currentPlan, to: targetPlan },
      ipAddress: request.headers.get("x-forwarded-for"),
    });

    return apiSuccess(subscription, "Plan upgraded");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Billing upgrade error:", error);
    return apiError("Internal server error");
  }
}
