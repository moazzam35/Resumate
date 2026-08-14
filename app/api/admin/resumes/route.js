import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiError, apiPaginated, parsePagination } from "@/lib/api-response";

/**
 * GET /api/admin/resumes
 * List all resumes across all users (admin only).
 * Query params: ?page, ?limit, ?search, ?status, ?template
 */
export async function GET(request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, { limit: 20 });
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const template = searchParams.get("template") || "";

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) {
      const validStatuses = ["DRAFT", "COMPLETED", "PUBLISHED"];
      if (validStatuses.includes(status.toUpperCase())) {
        where.status = status.toUpperCase();
      }
    }

    if (template) {
      where.template = { equals: template, mode: "insensitive" };
    }

    const [resumes, total, byStatus, byTemplate] = await Promise.all([
      prisma.resume.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          template: true,
          status: true,
          isPublic: true,
          aiScore: true,
          atsScore: true,
          version: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          _count: {
            select: {
              experiences: true,
              educations: true,
              skills: true,
              projects: true,
              certificates: true,
              languages: true,
              achievements: true,
            },
          },
        },
      }),
      prisma.resume.count({ where }),
      prisma.resume.groupBy({ by: ["status"], where, _count: { _all: true } }),
      prisma.resume.groupBy({ by: ["template"], where, _count: { _all: true } }),
    ]);

    const countForStatus = (status) =>
      byStatus.find((s) => s.status === status)?._count._all ?? 0;

    // Real totals across the whole filtered dataset (not just the current page),
    // so the summary cards on the page match what the table is showing.
    const summary = {
      total,
      drafts: countForStatus("DRAFT"),
      completed: countForStatus("COMPLETED"),
      published: countForStatus("PUBLISHED"),
      templatesUsed: byTemplate.length,
    };

    return apiPaginated(resumes, { total, page, limit }, { summary });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin list resumes error:", error);
    return apiError("Internal server error");
  }
}
