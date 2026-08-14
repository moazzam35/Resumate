import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { parsePagination } from "@/lib/api-response";
import { enforceResumeLimit } from "@/lib/usage";

export async function GET(request) {
  try {
    const { userId } = await authenticate(request);

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, { limit: 10 });

    const [resumes, total] = await Promise.all([
      prisma.resume.findMany({
        where: { userId },
        include: {
          experiences: true,
          educations: true,
          skills: true,
          projects: true,
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.resume.count({
        where: { userId },
      }),
    ]);

    return NextResponse.json({
      resumes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Get resumes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await authenticate(request);

    const limit = await enforceResumeLimit(userId);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: `You've reached the resume limit for your plan. Upgrade to Pro to create more.`,
          usage: limit.usage,
        },
        { status: 403 }
      );
    }

    const profile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        location: true,
        github: true,
        linkedin: true,
        portfolio: true,
      },
    });

    const body = await request.json();
    const { title, template } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingSlug = await prisma.resume.findFirst({
      where: { userId, slug },
    });

    const finalSlug = existingSlug
      ? `${slug}-${Date.now()}`
      : slug;

    const defaultSections = [
      { section: "personal", order: 0 },
      { section: "experience", order: 1 },
      { section: "education", order: 2 },
      { section: "skills", order: 3 },
      { section: "projects", order: 4 },
      { section: "certificates", order: 5 },
      { section: "languages", order: 6 },
      { section: "achievements", order: 7 },
    ];

    const resume = await prisma.$transaction(async (tx) => {
      const r = await tx.resume.create({
        data: {
          userId,
          title,
          slug: finalSlug,
          template: template || "modern",
          personalInfo: profile
            ? {
                name: profile.name || "",
                email: profile.email || "",
                phone: profile.phone || "",
                location: profile.location || "",
                github: profile.github || "",
                linkedin: profile.linkedin || "",
                portfolio: profile.portfolio || "",
              }
            : undefined,
        },
      });

      await tx.sectionOrder.createMany({
        data: defaultSections.map((s) => ({
          resumeId: r.id,
          ...s,
        })),
      });

      return r;
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Create resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
