import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiPaginated, safeBody } from "@/lib/api-response";
import { logAuditAction } from "@/lib/audit";

const VALID_ROLES = ["USER", "CLIENT", "MODERATOR", "ADMIN"];
const VALID_PLANS = ["FREE", "PRO", "ENTERPRISE"];

export async function GET(request) {
  try {
    await requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const verified = searchParams.get("verified") || "";
    const sort = searchParams.get("sort") || "newest";
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

    if (role) {
      where.role = role.toUpperCase();
    }

    if (status === "suspended") {
      where.suspended = true;
    } else if (status === "active") {
      where.suspended = false;
    }

    if (verified === "verified") {
      where.emailVerified = { not: null };
    } else if (verified === "unverified") {
      where.emailVerified = null;
    }

    let orderBy;
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "lastLogin":
        orderBy = { lastLoginAt: { sort: "desc", nulls: "last" } };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "subscription":
        orderBy = { subscription: { plan: "asc" } };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

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
          avatar: true,
          role: true,
          suspended: true,
          disableLogin: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            select: { plan: true, isActive: true, startDate: true, endDate: true, renewalDate: true, aiCreditsUsed: true, aiCreditResetAt: true },
          },
          _count: {
            select: { resumes: true, coverLetters: true, aiHistories: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const data = users.map((u) => ({
      ...u,
      aiActions: u._count.aiHistories,
      resumesCount: u._count.resumes,
      coverLettersCount: u._count.coverLetters,
    }));

    return apiPaginated(data, { total, page, limit });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin list users error:", error);
    return apiError("Internal server error");
  }
}

export async function PUT(request) {
  try {
    const admin = await requireAdmin(request);
    const body = await safeBody(request);
    if (!body?.userId) {
      return apiError("userId is required", 400);
    }

    const { userId, role, plan, isActive } = body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return apiError("User not found", 404);
    }

    if (role) {
      if (!VALID_ROLES.includes(role.toUpperCase())) {
        return apiError("Invalid role. Valid roles: " + VALID_ROLES.join(", "), 400);
      }
      const newRole = role.toUpperCase();
      if (newRole !== "ADMIN" && user.role === "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
          return apiError("Cannot remove the last admin", 400);
        }
      }
      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });
      await logAuditAction({
        adminId: admin.userId,
        action: "CHANGE_ROLE",
        targetUser: userId,
        targetEmail: user.email,
        details: { from: user.role, to: newRole },
        ipAddress: request.headers.get("x-forwarded-for"),
      });
    }

    if (plan) {
      if (!VALID_PLANS.includes(plan.toUpperCase())) {
        return apiError("Invalid plan. Valid plans: " + VALID_PLANS.join(", "), 400);
      }
      const newPlan = plan.toUpperCase();
      const oldSub = await prisma.subscription.findUnique({ where: { userId } });
      await prisma.subscription.upsert({
        where: { userId },
        update: { plan: newPlan, isActive: isActive !== false },
        create: { userId, plan: newPlan, isActive: isActive !== false },
      });
      await logAuditAction({
        adminId: admin.userId,
        action: "CHANGE_PLAN",
        targetUser: userId,
        targetEmail: user.email,
        details: { from: oldSub?.plan || "NONE", to: newPlan },
        ipAddress: request.headers.get("x-forwarded-for"),
      });
    }

    if (isActive !== undefined && !plan) {
      await prisma.subscription.updateMany({
        where: { userId },
        data: { isActive },
      });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true,
        subscription: { select: { plan: true, isActive: true } },
      },
    });

    return apiSuccess(updatedUser, "User updated");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin update user error:", error);
    return apiError("Internal server error");
  }
}
