import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import {
  apiCreated,
  apiError,
  apiPaginated,
  safeBody,
} from "@/lib/api-response";
import { coverLetterSchema } from "@/validators";

/**
 * GET /api/cover-letters
 * List cover letters for the authenticated user with pagination, search, and status filter.
 *
 * Query params:
 *   - page (number, default 1)
 *   - limit (number, default 10)
 *   - search (string, matches title, company, position)
 *   - status (CoverLetterStatus: DRAFT | COMPLETED)
 */
export async function GET(request) {
  try {
    const { userId } = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const where = { userId };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [coverLetters, total] = await Promise.all([
      prisma.coverLetter.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.coverLetter.count({ where }),
    ]);

    return apiPaginated(coverLetters, { total, page, limit });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("List cover letters error:", error);
    return apiError("Internal server error");
  }
}

/**
 * POST /api/cover-letters
 * Create a new cover letter.
 *
 * Body: { title, content, company?, position?, template? }
 */
export async function POST(request) {
  try {
    const { userId } = await authenticate(request);

    const body = await safeBody(request);
    if (!body) {
      return apiError("Invalid request body", 400);
    }

    const validation = coverLetterSchema.safeParse(body);
    if (!validation.success) {
      return apiError(
        validation.error.errors.map((e) => e.message).join(", "),
        422
      );
    }

    const { title, company, position, content, template } = validation.data;

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.coverLetter.findFirst({
      where: { userId, slug },
    });

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const coverLetter = await prisma.coverLetter.create({
      data: {
        userId,
        title,
        slug: finalSlug,
        company: company || null,
        position: position || null,
        content,
        template: template || "professional",
      },
    });

    return apiCreated(coverLetter);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Create cover letter error:", error);
    return apiError("Internal server error");
  }
}
