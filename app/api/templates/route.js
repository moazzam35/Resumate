import prisma from "@/lib/prisma";
import { apiError, apiPaginated, parsePagination } from "@/lib/api-response";

/**
 * GET /api/templates
 * List active resume templates (public, no auth required).
 * Supports ?search, ?category, ?premium filters.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, { limit: 20 });
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    const where = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    const [templates, total] = await Promise.all([
      prisma.resumeTemplate.findMany({
        where,
        orderBy: { order: "asc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: true,
          thumbnail: true,
          isPremium: true,
          order: true,
        },
      }),
      prisma.resumeTemplate.count({ where }),
    ]);

    const response = apiPaginated(templates, { total, page, limit });
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=300, stale-while-revalidate=86400"
    );
    return response;
  } catch (error) {
    console.error("List templates error:", error);
    return apiError("Internal server error");
  }
}
