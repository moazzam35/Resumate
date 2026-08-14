import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-response";

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
 * Build a full snapshot of the resume's current state for safety-net version.
 */
async function captureSnapshot(resumeId, client = prisma) {
  const resume = await client.resume.findUnique({
    where: { id: resumeId },
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

  if (!resume) return null;

  const { id, createdAt, updatedAt, userId, ...snapshot } = resume;
  return snapshot;
}

/**
 * POST /api/resumes/:id/version/:versionId
 * Restore a resume to a previous version.
 * Saves the current state as a safety-net version before restoring.
 */
export async function POST(request, { params }) {
  try {
    const { userId } = await authenticate(request);
    const { id, versionId } = await params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      return apiNotFound("Resume not found");
    }

    const versionRecord = await prisma.versionHistory.findFirst({
      where: { id: versionId, resumeId: id },
    });

    if (!versionRecord) {
      return apiNotFound("Version not found");
    }

    const snapshot = await captureSnapshot(id);
    if (!snapshot) {
      return apiError("Failed to capture current state", 500);
    }

    const safetyNetVersion = resume.version + 1;
    const versionData = versionRecord.data;
    const restoredVersion = safetyNetVersion + 1;

    const stripRowMeta = (r) => {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = r;
      return { ...rest, resumeId: id };
    };

    // Restore everything atomically: safety-net snapshot, child deletes and
    // recreates, resume scalar update, and the restored-state snapshot. If any
    // step fails, the whole operation rolls back so the resume is never left
    // in a half-deleted state.
    const updatedResume = await prisma.$transaction(async (tx) => {
      await tx.versionHistory.create({
        data: {
          resumeId: id,
          version: safetyNetVersion,
          data: snapshot,
        },
      });

      await tx.experience.deleteMany({ where: { resumeId: id } });
      await tx.education.deleteMany({ where: { resumeId: id } });
      await tx.skill.deleteMany({ where: { resumeId: id } });
      await tx.project.deleteMany({ where: { resumeId: id } });
      await tx.certificate.deleteMany({ where: { resumeId: id } });
      await tx.language.deleteMany({ where: { resumeId: id } });
      await tx.achievement.deleteMany({ where: { resumeId: id } });
      await tx.sectionOrder.deleteMany({ where: { resumeId: id } });

      if (versionData.experiences?.length) {
        await tx.experience.createMany({
          data: versionData.experiences.map(stripRowMeta),
        });
      }

      if (versionData.educations?.length) {
        await tx.education.createMany({
          data: versionData.educations.map(stripRowMeta),
        });
      }

      if (versionData.skills?.length) {
        await tx.skill.createMany({
          data: versionData.skills.map(stripRowMeta),
        });
      }

      if (versionData.projects?.length) {
        await tx.project.createMany({
          data: versionData.projects.map(stripRowMeta),
        });
      }

      if (versionData.certificates?.length) {
        await tx.certificate.createMany({
          data: versionData.certificates.map(stripRowMeta),
        });
      }

      if (versionData.languages?.length) {
        await tx.language.createMany({
          data: versionData.languages.map(stripRowMeta),
        });
      }

      if (versionData.achievements?.length) {
        await tx.achievement.createMany({
          data: versionData.achievements.map(stripRowMeta),
        });
      }

      if (versionData.sectionOrder?.length) {
        await tx.sectionOrder.createMany({
          data: versionData.sectionOrder.map(stripRowMeta),
        });
      }

      const updated = await tx.resume.update({
        where: { id },
        data: {
          title: versionData.title || resume.title,
          template: versionData.template || resume.template,
          colorTheme: versionData.colorTheme || resume.colorTheme,
          status: versionData.status || resume.status,
          personalInfo:
            versionData.personalInfo !== undefined
              ? versionData.personalInfo
              : resume.personalInfo,
          summary:
            versionData.summary !== undefined ? versionData.summary : resume.summary,
          design:
            versionData.design !== undefined ? versionData.design : resume.design,
          isPublic:
            versionData.isPublic !== undefined ? versionData.isPublic : resume.isPublic,
          aiScore:
            versionData.aiScore !== undefined ? versionData.aiScore : resume.aiScore,
          atsScore:
            versionData.atsScore !== undefined ? versionData.atsScore : resume.atsScore,
          version: restoredVersion,
        },
      });

      // Record the restored state as a version so resume.version stays in sync
      // with the newest snapshot (keeps isCurrent consistent in the list).
      const restoredSnapshot = await captureSnapshot(id, tx);
      if (restoredSnapshot) {
        await tx.versionHistory.create({
          data: {
            resumeId: id,
            version: restoredVersion,
            data: restoredSnapshot,
          },
        });
      }

      return tx.resume.findUnique({
        where: { id },
        include: RESUME_INCLUDES,
      });
    });

    return apiSuccess(updatedResume, "Resume restored to version successfully");
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Restore version error:", error);
    return apiError("Internal server error");
  }
}
