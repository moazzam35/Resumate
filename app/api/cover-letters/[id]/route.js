import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiSuccess, apiError, apiNotFound, safeBody } from "@/lib/api-response";

/**
 * GET /api/cover-letters/:id
 * Get a single cover letter by ID (must belong to authenticated user).
 */
export async function GET(request, { params }) {
  try {
    const { userId } = await authenticate(request);
    const { id } = await params;

    const coverLetter = await prisma.coverLetter.findFirst({
      where: { id, userId },
    });

    if (!coverLetter) {
      return apiNotFound("Cover letter not found");
    }

    return apiSuccess(coverLetter);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Get cover letter error:", error);
    return apiError("Internal server error");
  }
}

/**
 * PUT /api/cover-letters/:id
 * Update a cover letter's fields.
 */
export async function PUT(request, { params }) {
  try {
    const { userId } = await authenticate(request);
    const { id } = await params;

    const existing = await prisma.coverLetter.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return apiNotFound("Cover letter not found");
    }

    const body = await safeBody(request);
    if (!body) {
      return apiError("Invalid request body", 400);
    }

    const allowedFields = [
      "title",
      "company",
      "position",
      "content",
      "template",
      "status",
    ];
    const updateData = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (updateData.title && updateData.title !== existing.title) {
      const slug = updateData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const existingSlug = await prisma.coverLetter.findFirst({
        where: { userId, slug, id: { not: id } },
      });

      updateData.slug = existingSlug
        ? `${slug}-${Date.now()}`
        : slug;
    }

    const coverLetter = await prisma.coverLetter.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess(coverLetter);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Update cover letter error:", error);
    return apiError("Internal server error");
  }
}

/**
 * DELETE /api/cover-letters/:id
 * Delete a cover letter.
 */
export async function DELETE(request, { params }) {
  try {
    const { userId } = await authenticate(request);
    const { id } = await params;

    const existing = await prisma.coverLetter.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return apiNotFound("Cover letter not found");
    }

    await prisma.coverLetter.delete({ where: { id } });

    return apiSuccess(null, "Cover letter deleted successfully");
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Delete cover letter error:", error);
    return apiError("Internal server error");
  }
}
