import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, safeBody } from "@/lib/api-response";

/**
 * GET /api/admin/templates
 * List ALL resume templates (including inactive) for management.
 */
export async function GET(request) {
  try {
    await requireAdmin(request);

    const templates = await prisma.resumeTemplate.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        thumbnail: true,
        isPremium: true,
        isActive: true,
        order: true,
      },
    });

    return apiSuccess(templates);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin list templates error:", error);
    return apiError("Internal server error");
  }
}

/**
 * PATCH /api/admin/templates
 * Toggle template visibility. Body: { id, isActive }.
 */
export async function PATCH(request) {
  try {
    await requireAdmin(request);

    const body = await safeBody(request);
    const id = body?.id;
    const isActive = body?.isActive;

    if (!id || typeof isActive !== "boolean") {
      return apiError("Template id and isActive boolean are required", 400);
    }

    const existing = await prisma.resumeTemplate.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Template not found", 404);
    }

    const template = await prisma.resumeTemplate.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return apiSuccess(template, "Template updated");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin update template error:", error);
    return apiError("Internal server error");
  }
}
