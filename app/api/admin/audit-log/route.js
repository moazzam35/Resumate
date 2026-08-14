import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiError, apiPaginated } from "@/lib/api-response";

export async function GET(request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const action = searchParams.get("action") || "";
    const skip = (page - 1) * limit;

    const where = {};
    if (action) {
      where.action = action.toUpperCase();
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          admin: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return apiPaginated(logs, { total, page, limit });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin audit log error:", error);
    return apiError("Internal server error");
  }
}
