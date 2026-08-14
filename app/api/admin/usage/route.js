import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiError, apiPaginated } from "@/lib/api-response";
import { getEffectivePlan, getPlanLimits } from "@/lib/usage";

/**
 * GET /api/admin/usage
 * Per-user usage breakdown (admin only). Shows how much each user has consumed:
 * resumes created, cover letters, ATS checks, and the monthly AI credit pool
 * (used / total per plan, with the next reset date).
 *
 * Query params: page, limit, search, plan, sort (ai|resumes|coverLetters|name|newest)
 */
export async function GET(request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "";
    const sort = searchParams.get("sort") || "ai";
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (plan) {
      where.subscription = { plan: plan.toUpperCase() };
    }

    const orderBy =
      sort === "resumes"
        ? { resumes: { _count: "desc" } }
        : sort === "coverLetters"
          ? { coverLetters: { _count: "desc" } }
          : sort === "name"
            ? { name: "asc" }
            : { createdAt: "desc" };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          subscription: {
            select: {
              plan: true,
              isActive: true,
              startDate: true,
              endDate: true,
              renewalDate: true,
              aiCreditsUsed: true,
              aiCreditResetAt: true,
            },
          },
          _count: { select: { resumes: true, coverLetters: true, aiHistories: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const rows = users.map((u) => {
      const plan = getEffectivePlan(u);
      const limits = getPlanLimits(plan);
      const now = new Date();
      const resetAt = u.subscription?.aiCreditResetAt ? new Date(u.subscription.aiCreditResetAt) : null;
      const aiCreditsUsed =
        resetAt && resetAt <= now ? 0 : u.subscription?.aiCreditsUsed || 0;

      return {
        userId: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        plan,
        isActive: u.subscription?.isActive ?? true,
        resumesCreated: u._count.resumes,
        coverLetters: u._count.coverLetters,
        aiActions: u._count.aiHistories,
        aiCreditsUsed,
        aiCreditsTotal: limits.ai,
        aiCreditsRemaining: limits.ai === null ? null : Math.max(0, limits.ai - aiCreditsUsed),
        aiResetDate: resetAt && resetAt > now ? resetAt : null,
        renewalDate: u.subscription?.renewalDate || null,
        createdAt: u.createdAt,
      };
    });

    return apiPaginated(rows, { total, page, limit });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin usage error:", error);
    return apiError("Internal server error");
  }
}
