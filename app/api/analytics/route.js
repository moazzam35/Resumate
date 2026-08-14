import { authenticate } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };

// Short-lived per-user cache so repeat dashboard loads don't re-run the
// aggregation queries against the remote database on every request.
const CACHE_TTL_MS = 60 * 1000;
const analyticsCache = new Map();

/**
 * Aggregate resume creations into daily buckets (or monthly for year-long
 * ranges so charts don't render hundreds of points).
 */
function aggregateTimeline(records, days) {
  if (days > 90) {
    const map = new Map();
    const now = new Date();
    const cursor = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    while (cursor <= now) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, 0);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const r of records) {
      const d = r.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (map.has(key)) map.set(key, map.get(key) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, views]) => ({ date: month, views }));
  }

  const map = new Map();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().split("T")[0], 0);
  }
  for (const r of records) {
    const key = r.createdAt.toISOString().split("T")[0];
    if (map.has(key)) map.set(key, map.get(key) + 1);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }));
}

export async function GET(request) {
  try {
    const { userId } = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const days = RANGE_DAYS[range] || 30;

    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const cacheKey = `analytics:${userId}:${range}`;
    const now = Date.now();
    const cached = analyticsCache.get(cacheKey);
    if (cached && now - cached.at < CACHE_TTL_MS) {
      return apiSuccess(cached.data);
    }

    const [resumes, aiHistories] = await Promise.all([
      prisma.resume.findMany({
        where: { userId, createdAt: { gte: start } },
        select: {
          id: true,
          createdAt: true,
          template: true,
          atsScore: true,
          status: true,
        },
      }),
      prisma.aIHistory.findMany({
        where: { userId, createdAt: { gte: start } },
        select: {
          type: true,
          createdAt: true,
        },
      }),
    ]);

    const resumeCount = resumes.length;

    const resumeViews = aggregateTimeline(resumes, days);

    const downloads = 0;

    const atsScores = resumes
      .map((r) => r.atsScore)
      .filter((s) => s !== null && s !== undefined);
    const avgAtsScore =
      atsScores.length > 0
        ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length)
        : 0;

    const atsScoreTrend = resumes
      .filter((r) => r.atsScore !== null && r.atsScore !== undefined)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((r) => ({
        date: r.createdAt.toISOString().split("T")[0],
        score: r.atsScore,
      }));

    const aiRequestCount = aiHistories.length;

    const aiUsageByType = Object.entries(
      aiHistories.reduce((acc, h) => {
        acc[h.type] = (acc[h.type] || 0) + 1;
        return acc;
      }, {})
    ).map(([type, count]) => ({ type, count }));

    const templateUsage = Object.entries(
      resumes.reduce((acc, r) => {
        const name = r.template || "Unknown";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const data = {
      resumeCount,
      resumeViews,
      downloads,
      avgAtsScore,
      atsScoreTrend,
      aiRequestCount,
      aiUsageByType,
      templateUsage,
    };
    analyticsCache.set(cacheKey, { at: now, data });
    return apiSuccess(data);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Analytics error:", error);
    return apiError("Internal server error");
  }
}
