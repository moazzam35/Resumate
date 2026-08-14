import { PLANS } from "@/lib/constants";

/**
 * Client-side subscription usage helpers. These mirror the server-side limits
 * in `lib/usage.js`. The server is always the source of truth for enforcement;
 * these only drive UI badges, counters, and disabled states.
 */

const PLAN_IDS = { FREE: "free", PRO: "pro", ENTERPRISE: "enterprise" };

function getPlan(user) {
  if (!user) return "FREE";
  if (user.role === "ADMIN") return "ENTERPRISE";
  const sub = user.subscription;
  if (sub && sub.isActive && sub.plan && sub.plan !== "FREE") {
    return sub.plan;
  }
  return "FREE";
}

export function getPlanLimits(plan) {
  const def = { resumes: null, ai: null };
  const entry = PLANS.find((p) => p.id === PLAN_IDS[plan]);
  if (!entry || !entry.limits) return def;

  const l = entry.limits;
  return {
    resumes: typeof l.maxResumes === "number" ? l.maxResumes : null,
    ai: typeof l.aiRequestsPerMonth === "number" ? l.aiRequestsPerMonth : null,
  };
}

/**
 * Derive a usage snapshot from the auth user object. Uses `user.usage` when the
 * server already computed it, otherwise falls back to local computation.
 * @param {object|null} user
 */
export function computeUsage(user) {
  if (user?.usage) return user.usage;

  const plan = getPlan(user);
  const limits = getPlanLimits(plan);
  const now = new Date();

  const sub = user?.subscription;
  const resetAt = sub?.aiCreditResetAt ? new Date(sub.aiCreditResetAt) : null;
  let used = sub?.aiCreditsUsed || 0;
  if (resetAt && resetAt <= now) used = 0;

  const resumeCount = user?._count?.resumes ?? 0;

  return {
    plan,
    role: user?.role,
    isPremium: plan !== "FREE",
    resumeCount,
    resumeLimit: limits.resumes,
    resumeRemaining:
      limits.resumes === null ? null : Math.max(0, limits.resumes - resumeCount),
    aiCreditsUsed: used,
    aiCreditsTotal: limits.ai,
    aiCreditsRemaining: limits.ai === null ? null : Math.max(0, limits.ai - used),
    aiResetDate:
      resetAt && resetAt > now
        ? resetAt
        : new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}

function isEnterprisePlan(user) {
  return getPlan(user) === "ENTERPRISE";
}
