import { requireAdmin } from "@/lib/middleware";
import prisma from "@/lib/prisma";
import { apiSuccess, apiError, apiNotFound, safeBody } from "@/lib/api-response";
import { logAuditAction } from "@/lib/audit";

export async function GET(request, { params }) {
  try {
    await requireAdmin(request);
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        bio: true,
        phone: true,
        location: true,
        github: true,
        linkedin: true,
        portfolio: true,
        provider: true,
        emailVerified: true,
        suspended: true,
        disableLogin: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        subscription: true,
        loginHistory: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, ipAddress: true, userAgent: true, createdAt: true },
        },
        _count: {
          select: {
            resumes: true,
            coverLetters: true,
            aiHistories: true,
            notifications: true,
            sessions: true,
          },
        },
      },
    });

    if (!user) {
      return apiNotFound("User not found");
    }

    return apiSuccess(user);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin get user error:", error);
    return apiError("Internal server error");
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return apiNotFound("User not found");
    }

    const body = await safeBody(request);
    if (!body) {
      return apiError("Invalid request body", 400);
    }

    const allowedFields = ["name", "bio", "phone", "location", "github", "linkedin", "portfolio"];
    const updates = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (body.email && body.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: body.email },
      });
      if (emailTaken) {
        return apiError("Email already in use", 409);
      }
      updates.email = body.email;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true, name: true, email: true, role: true,
        bio: true, phone: true, location: true,
        github: true, linkedin: true, portfolio: true,
        updatedAt: true,
      },
    });

    return apiSuccess(updated, "User updated");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin update user error:", error);
    return apiError("Internal server error");
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return apiNotFound("User not found");
    }

    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return apiError("Cannot delete the last admin", 403);
      }
    }

    await prisma.user.delete({ where: { id } });

    await logAuditAction({
      adminId: admin.userId,
      action: "DELETE_USER",
      targetUser: id,
      targetEmail: user.email,
      details: { name: user.name, role: user.role },
      ipAddress: request.headers.get("x-forwarded-for"),
    });

    return apiSuccess(null, "User deleted");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Admin delete user error:", error);
    return apiError("Internal server error");
  }
}
