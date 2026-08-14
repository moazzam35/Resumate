import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

// Estimated revenue uses the public plan prices from lib/constants.js.
// There is no payment provider wired up yet, so this is an estimate, not
// actual billing data.
const PLAN_PRICES = { FREE: 0, PRO: 12, ENTERPRISE: 29 };

/**
 * GET /api/admin
 * Admin dashboard stats. Returns comprehensive overview data.
 */
export async function GET(request) {
  try {
    await requireAdmin(request);

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const NOT_TEST = { isTest: false };

    const [
      totalUsers,
      activeUsers,
      premiumUsers,
      newUsersToday,
      totalResumes,
      resumesCreatedToday,
      resumesCreatedThisMonth,
      totalCoverLetters,
      aiRequestsTotal,
      aiRequestsThisMonth,
      premiumSubscriptions,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count({ where: NOT_TEST }),
      // "Active" = logged in within the last 30 days, or registered within the last 30 days.
      prisma.user.count({
        where: {
          ...NOT_TEST,
          OR: [{ lastLoginAt: { gte: thirtyDaysAgo } }, { createdAt: { gte: thirtyDaysAgo } }],
        },
      }),
      prisma.subscription.count({ where: { plan: { in: ["PRO", "ENTERPRISE"] }, isActive: true, user: NOT_TEST } }),
      prisma.user.count({ where: { ...NOT_TEST, createdAt: { gte: todayStart } } }),
      prisma.resume.count({ where: { user: NOT_TEST } }),
      prisma.resume.count({ where: { createdAt: { gte: todayStart }, user: NOT_TEST } }),
      prisma.resume.count({ where: { createdAt: { gte: monthStart }, user: NOT_TEST } }),
      prisma.coverLetter.count({ where: { user: NOT_TEST } }),
      prisma.aIHistory.count({ where: { user: NOT_TEST } }),
      prisma.aIHistory.count({ where: { createdAt: { gte: monthStart }, user: NOT_TEST } }),
      prisma.subscription.findMany({
        where: { plan: { in: ["PRO", "ENTERPRISE"] }, isActive: true, user: NOT_TEST },
        select: { plan: true },
      }),
      prisma.user.findMany({
        where: NOT_TEST,
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    // Estimated revenue from active premium subscriptions, not real payments.
    const totalRevenue = premiumSubscriptions.reduce(
      (sum, sub) => sum + (PLAN_PRICES[sub.plan] || 0),
      0
    );

    const conversionRate = totalUsers > 0
      ? Math.round((premiumUsers / totalUsers) * 10000) / 100
      : 0;

    return apiSuccess({
      totalUsers,
      activeUsers,
      premiumUsers,
      newUsersToday,
      totalResumes,
      resumesCreatedToday,
      resumesCreatedThisMonth,
      totalCoverLetters,
      aiRequestsTotal,
      aiRequestsThisMonth,
      totalRevenue,
      conversionRate,
      recentUsers,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin dashboard error:", error);
    return apiError("Internal server error");
  }
}
