import prisma from "@/lib/prisma";

/**
 * Server-side subscription usage helpers.
 *
 * Plan limits are enforced here (and only here). Every AI-capable endpoint
 * and resume-creation endpoint must go through these helpers so the limits
 * cannot be bypassed with direct API calls.
 */

const PLAN_LIMITS = {
  FREE: { resumes: 3, ai: 7 },
  PRO: { resumes: 10, ai: 20 },
  ENTERPRISE: { resumes: null, ai: null },
};

const PLAN_LABELS = { FREE: "Free", PRO: "Pro", ENTERPRISE: "Enterprise" };

/**
 * Resolve the effective plan for a user. Admins are treated as ENTERPRISE.
 * @param {{ role?: string, subscription?: { plan?: string, isActive?: boolean } }|null} user
 * @returns {"FREE"|"PRO"|"ENTERPRISE"}
 */
export function getEffectivePlan(user) {
  if (!user) return "FREE";
  if (user.role === "ADMIN") return "ENTERPRISE";
  const sub = user.subscription;
  if (sub && sub.isActive && sub.plan && sub.plan !== "FREE") {
    return sub.plan;
  }
  return "FREE";
}

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
}

/**
 * First day of the next calendar month (when AI credits reset).
 */
export function startOfNextMonth(from = new Date()) {
  return new Date(from.getFullYear(), from.getMonth() + 1, 1);
}

/**
 * Build a full usage snapshot from a user row.
 * @param {object} user - user with `id`, `role`, `subscription`, `_count.resumes`
 */
function buildUsage(user) {
  const plan = getEffectivePlan(user);
  const limits = getPlanLimits(plan);
  const now = new Date();

  const sub = user.subscription;
  const resetDate = sub?.aiCreditResetAt ? new Date(sub.aiCreditResetAt) : null;
  const aiResetDate = resetDate && resetDate > now ? resetDate : startOfNextMonth(now);

  let aiCreditsUsed = sub?.aiCreditsUsed || 0;
  if (resetDate && resetDate <= now) aiCreditsUsed = 0;

  const resumeCount = user._count?.resumes ?? 0;

  const aiCreditsTotal = limits.ai;
  const resumeLimit = limits.resumes;

  return {
    plan,
    role: user.role,
    isPremium: plan !== "FREE",
    resumeCount,
    resumeLimit,
    resumeRemaining: resumeLimit === null ? null : Math.max(0, resumeLimit - resumeCount),
    aiCreditsUsed,
    aiCreditsTotal,
    aiCreditsRemaining:
      aiCreditsTotal === null ? null : Math.max(0, aiCreditsTotal - aiCreditsUsed),
    aiResetDate,
  };
}

/**
 * Load a user with subscription and resume count, then return their usage snapshot.
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
export async function getUsage(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      subscription: true,
      _count: { select: { resumes: true } },
    },
  });

  if (!user) return null;
  return buildUsage(user);
}

/**
 * Enforce the resume-creation cap before creating/duplicating a resume.
 * @param {string} userId
 * @returns {Promise<{allowed: boolean, usage: object|null}>}
 */
export async function enforceResumeLimit(userId) {
  const usage = await getUsage(userId);
  if (!usage) return { allowed: false, usage: null };

  if (usage.resumeLimit !== null && usage.resumeCount >= usage.resumeLimit) {
    return { allowed: false, usage };
  }

  return { allowed: true, usage };
}

/**
 * Atomically check-and-consume one AI credit for a user. Rolls the credit
 * window over to the next month when the stored reset date has passed.
 *
 * @param {string} userId
 * @returns {Promise<{ok: boolean, used?: number, resetDate?: Date, message?: string}>}
 */
export async function consumeCredit(userId) {
  const result = await prisma.$transaction(async (tx) => {
    const sub = await tx.subscription.findUnique({ where: { userId } });
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const now = new Date();
    const effectivePlan =
      user?.role === "ADMIN"
        ? "ENTERPRISE"
        : sub && sub.isActive && sub.plan && sub.plan !== "FREE"
          ? sub.plan
          : "FREE";
    const aiLimit = getPlanLimits(effectivePlan).ai;

    // No subscription row yet (fresh FREE user): create one and start the window.
    if (!sub) {
      const resetDate = startOfNextMonth(now);
      await tx.subscription.create({
        data: { userId, plan: "FREE", aiCreditsUsed: 1, aiCreditResetAt: resetDate },
      });
      return { ok: true, used: 1, resetDate };
    }

    const resetDate = sub.aiCreditResetAt ? new Date(sub.aiCreditResetAt) : null;

    // Window has passed (or was never set): reset usage and take the first credit.
    if (!resetDate || resetDate <= now) {
      const nextReset = startOfNextMonth(now);
      await tx.subscription.update({
        where: { userId },
        data: { aiCreditsUsed: 1, aiCreditResetAt: nextReset },
      });
      return { ok: true, used: 1, resetDate: nextReset };
    }

    if (aiLimit !== null && sub.aiCreditsUsed >= aiLimit) {
      return { ok: false, used: sub.aiCreditsUsed, resetDate };
    }

    await tx.subscription.update({
      where: { userId },
      data: { aiCreditsUsed: { increment: 1 } },
    });

    return { ok: true, used: sub.aiCreditsUsed + 1, resetDate };
  });

  if (!result.ok) {
    return {
      ...result,
      message: "AI usage limit reached. Upgrade your plan to continue.",
    };
  }

  return result;
}

/**
 * Refund a reserved AI credit when the AI call fails so users are not charged
 * for failed requests. Best effort: never throws.
 * @param {string} userId
 */
export async function refundCredit(userId) {
  try {
    await prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.findUnique({ where: { userId } });
      if (!sub || sub.aiCreditsUsed <= 0) return;
      await tx.subscription.update({
        where: { userId },
        data: { aiCreditsUsed: { decrement: 1 } },
      });
    });
  } catch (error) {
    console.error("Failed to refund AI credit:", error);
  }
}
