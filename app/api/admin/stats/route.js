import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

// Estimated revenue uses the public plan prices from lib/constants.js.
// There is no payment provider wired up yet, so this is an estimate, not
// actual billing data.
const PLAN_PRICES = { FREE: 0, PRO: 12, ENTERPRISE: 29 };

/**
 * GET /api/admin/stats
 * Return chart-ready analytics data (admin only).
 * - userGrowth: users per month (last 12 months)
 * - resumeCreation: resumes per day (last 30 days)
 * - aiUsage: AI requests per day (last 30 days)
 * - templateUsage: most used templates
 * - topSkills: most common skills
 * - revenueByMonth: premium revenue per month (last 12 months)
 */
export async function GET(request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "12m";

    const DAYS_BY_RANGE = { "7d": 7, "30d": 30, "90d": 90 };
    const isDaysRange = Object.prototype.hasOwnProperty.call(DAYS_BY_RANGE, range);
    const days = isDaysRange ? DAYS_BY_RANGE[range] : null;

    const now = new Date();

    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Windows used by each dataset depend on the selected range.
    const userStart = isDaysRange ? daysAgo(days) : twelveMonthsAgo;
    const activityStart = isDaysRange ? daysAgo(days) : thirtyDaysAgo;
    const revenueStart = isDaysRange ? daysAgo(days) : twelveMonthsAgo;

    const [
      userGrowthRaw,
      resumeCreationRaw,
      aiUsageRaw,
      templateUsage,
      topSkills,
      premiumSubscriptions,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: userStart }, isTest: false },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.resume.findMany({
        where: { createdAt: { gte: activityStart }, user: { isTest: false } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.aIHistory.findMany({
        where: { createdAt: { gte: activityStart }, user: { isTest: false } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.resume.groupBy({
        by: ["template"],
        where: { user: { isTest: false } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.skill.groupBy({
        by: ["name"],
        where: { resume: { user: { isTest: false } } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 15,
      }),
      prisma.subscription.findMany({
        where: {
          plan: { in: ["PRO", "ENTERPRISE"] },
          isActive: true,
          startDate: { gte: revenueStart },
          user: { isTest: false },
        },
        select: { plan: true, startDate: true },
      }),
    ]);

    const userGrowth = isDaysRange
      ? aggregateByDay(userGrowthRaw, daysAgo(days))
      : aggregateByMonth(userGrowthRaw, twelveMonthsAgo);
    const resumeCreation = aggregateByDay(resumeCreationRaw, activityStart);
    const aiUsage = aggregateByDay(aiUsageRaw, activityStart);

    const revenueByMonth = isDaysRange
      ? aggregateRevenueByDay(premiumSubscriptions, daysAgo(days))
      : aggregateRevenue(premiumSubscriptions, twelveMonthsAgo);

    return apiSuccess({
      range,
      userGrowth,
      resumeCreation,
      aiUsage,
      templateUsage: templateUsage.map((t) => ({
        name: t.template,
        count: t._count.id,
      })),
      topSkills: topSkills.map((s) => ({
        name: s.name,
        count: s._count.id,
      })),
      revenueByMonth,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin stats error:", error);
    return apiError("Internal server error");
  }
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Aggregate records into monthly buckets.
 * @param {Array<{createdAt: Date}>} records
 * @param {Date} startDate
 * @returns {Array<{month: string, count: number}>}
 */
function aggregateByMonth(records, startDate) {
  const map = new Map();
  const current = new Date(startDate);
  const now = new Date();

  while (current <= now) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, 0);
    current.setMonth(current.getMonth() + 1);
  }

  for (const record of records) {
    const d = new Date(record.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (map.has(key)) {
      map.set(key, map.get(key) + 1);
    }
  }

  return Array.from(map.entries()).map(([month, count]) => ({ month, count }));
}

/**
 * Aggregate records into daily buckets.
 * @param {Array<{createdAt: Date}>} records
 * @param {Date} startDate
 * @returns {Array<{date: string, count: number}>}
 */
function aggregateByDay(records, startDate) {
  const map = new Map();
  const current = new Date(startDate);
  const now = new Date();

  while (current <= now) {
    const key = current.toISOString().split("T")[0];
    map.set(key, 0);
    current.setDate(current.getDate() + 1);
  }

  for (const record of records) {
    const d = new Date(record.createdAt);
    const key = d.toISOString().split("T")[0];
    if (map.has(key)) {
      map.set(key, map.get(key) + 1);
    }
  }

  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

/**
 * Aggregate subscription revenue into daily buckets.
 * @param {Array<{plan: string, startDate: Date}>} subs
 * @param {Date} startDate
 * @returns {Array<{date: string, revenue: number}>}
 */
function aggregateRevenueByDay(subs, startDate) {
  const map = new Map();
  const current = new Date(startDate);
  const now = new Date();

  while (current <= now) {
    const key = current.toISOString().split("T")[0];
    map.set(key, 0);
    current.setDate(current.getDate() + 1);
  }

  for (const sub of subs) {
    const d = new Date(sub.startDate);
    const key = d.toISOString().split("T")[0];
    if (map.has(key)) {
      map.set(key, Math.round((map.get(key) + (PLAN_PRICES[sub.plan] || 0)) * 100) / 100);
    }
  }

  return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue }));
}

/**
 * Aggregate subscription revenue into monthly buckets.
 * @param {Array<{plan: string, startDate: Date}>} subs
 * @param {Date} startDate
 * @returns {Array<{month: string, revenue: number}>}
 */
function aggregateRevenue(subs, startDate) {
  const map = new Map();
  const current = new Date(startDate);
  const now = new Date();

  while (current <= now) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, 0);
    current.setMonth(current.getMonth() + 1);
  }

  for (const sub of subs) {
    const d = new Date(sub.startDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (map.has(key)) {
      map.set(key, Math.round((map.get(key) + (PLAN_PRICES[sub.plan] || 0)) * 100) / 100);
    }
  }

  return Array.from(map.entries()).map(([month, revenue]) => ({ month, revenue }));
}
