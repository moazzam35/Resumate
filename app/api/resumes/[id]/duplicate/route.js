import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-response";
import { enforceResumeLimit } from "@/lib/usage";
import { recomputeResumeStatusSafe } from "@/lib/resume-status";

const RESUME_INCLUDES = {
  experiences: { orderBy: { order: "asc" } },
  educations: { orderBy: { order: "asc" } },
  skills: { orderBy: { order: "asc" } },
  projects: { orderBy: { order: "asc" } },
  certificates: { orderBy: { order: "asc" } },
  languages: { orderBy: { order: "asc" } },
  achievements: { orderBy: { order: "asc" } },
  sectionOrder: { orderBy: { order: "asc" } },
};

/**
 * Helper to strip id/timestamps and set resumeId for a sub-resource record.
 */
function stripForCopy(record, newResumeId) {
  const { id, createdAt, updatedAt, resumeId, ...rest } = record;
  return { ...rest, resumeId: newResumeId };
}

/**
 * POST /api/resumes/:id/duplicate
 * Create a deep copy of a resume with all sub-resources.
 */
export async function POST(request, { params }) {
  try {
    const { userId } = await authenticate(request);
    const { id } = await params;

    const limit = await enforceResumeLimit(userId);
    if (!limit.allowed) {
      return apiError(
        "You've reached the resume limit for your plan. Upgrade to Pro to duplicate more.",
        403
      );
    }

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        experiences: true,
        educations: true,
        skills: true,
        projects: true,
        certificates: true,
        languages: true,
        achievements: true,
        sectionOrder: true,
      },
    });

    if (!resume) {
      return apiNotFound("Resume not found");
    }

    const copyTitle = `${resume.title} (Copy)`;
    const slug = `${resume.slug}-copy-${Date.now()}`;

    const newResume = await prisma.resume.create({
      data: {
        userId,
        title: copyTitle,
        slug,
        template: resume.template,
        colorTheme: resume.colorTheme,
        design: resume.design,
        personalInfo: resume.personalInfo,
        summary: resume.summary,
        status: "DRAFT",
        isPublic: false,
        version: 1,
      },
    });

    const batchOps = [];

    if (resume.experiences.length) {
      batchOps.push(
        prisma.experience.createMany({
          data: resume.experiences.map((r) => stripForCopy(r, newResume.id)),
        })
      );
    }

    if (resume.educations.length) {
      batchOps.push(
        prisma.education.createMany({
          data: resume.educations.map((r) => stripForCopy(r, newResume.id)),
        })
      );
    }

    if (resume.skills.length) {
      batchOps.push(
        prisma.skill.createMany({
          data: resume.skills.map((r) => stripForCopy(r, newResume.id)),
        })
      );
    }

    if (resume.projects.length) {
      batchOps.push(
        prisma.project.createMany({
          data: resume.projects.map((r) => stripForCopy(r, newResume.id)),
        })
      );
    }

    if (resume.certificates.length) {
      batchOps.push(
        prisma.certificate.createMany({
          data: resume.certificates.map((r) => stripForCopy(r, newResume.id)),
        })
      );
    }

    if (resume.languages.length) {
      batchOps.push(
        prisma.language.createMany({
          data: resume.languages.map((r) => stripForCopy(r, newResume.id)),
        })
      );
    }

    if (resume.achievements.length) {
      batchOps.push(
        prisma.achievement.createMany({
          data: resume.achievements.map((r) => stripForCopy(r, newResume.id)),
        })
      );
    }

    if (resume.sectionOrder.length) {
      batchOps.push(
        prisma.sectionOrder.createMany({
          data: resume.sectionOrder.map((r) => stripForCopy(r, newResume.id)),
        })
      );
    }

    if (batchOps.length) {
      await prisma.$transaction(batchOps);
    }

    await recomputeResumeStatusSafe(newResume.id);

    const duplicated = await prisma.resume.findUnique({
      where: { id: newResume.id },
      include: RESUME_INCLUDES,
    });

    return apiSuccess(duplicated, "Resume duplicated successfully", 201);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Duplicate resume error:", error);
    return apiError("Internal server error");
  }
}
