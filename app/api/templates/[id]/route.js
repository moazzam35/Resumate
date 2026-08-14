import prisma from "@/lib/prisma";
import { apiSuccess, apiNotFound, apiError } from "@/lib/api-response";

/**
 * GET /api/templates/[id]
 * Get a single template by id or slug (public).
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const template = await prisma.resumeTemplate.findFirst({
      where: {
        isActive: true,
        OR: [{ id }, { slug: id }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        thumbnail: true,
        isPremium: true,
        config: true,
        order: true,
      },
    });

    if (!template) {
      return apiNotFound("Template not found");
    }

    return apiSuccess(template);
  } catch (error) {
    console.error("Get template error:", error);
    return apiError("Internal server error");
  }
}
