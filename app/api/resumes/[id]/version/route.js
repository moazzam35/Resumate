import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-response";

/**
 * Build a full snapshot of the resume's current state.
 */
async function captureSnapshot(resumeId) {
  const resume = await prisma.resume.findUnique({
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
 * GET /api/resumes/:id/version
 * List all versions of a resume, ordered by version descending.
 */
export async function GET(request, { params }) {
  try {
    const { userId } = await authenticate(request);
    const { id } = await params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      return apiNotFound("Resume not found");
    }

    const versions = await prisma.versionHistory.findMany({
      where: { resumeId: id },
      orderBy: { version: "desc" },
      select: {
        id: true,
        version: true,
        createdAt: true,
        data: true,
      },
    });

    const list = versions.map((v) => ({
      id: v.id,
      version: v.version,
      createdAt: v.createdAt,
      title: (v.data && v.data.title) || resume.title || "Resume",
      isCurrent: v.version === resume.version,
    }));

    return apiSuccess(list);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("List versions error:", error);
    return apiError("Internal server error");
  }
}

/**
 * POST /api/resumes/:id/version
 * Save the current resume state as a new version snapshot.
 */
export async function POST(request, { params }) {
  try {
    const { userId } = await authenticate(request);
    const { id } = await params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      return apiNotFound("Resume not found");
    }

    const snapshot = await captureSnapshot(id);
    if (!snapshot) {
      return apiError("Failed to capture resume snapshot", 500);
    }

    const newVersion = resume.version + 1;

    const versionRecord = await prisma.versionHistory.create({
      data: {
        resumeId: id,
        version: newVersion,
        data: snapshot,
      },
    });

    await prisma.resume.update({
      where: { id },
      data: { version: newVersion },
    });

    return apiSuccess(versionRecord, "Version saved successfully", 201);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Save version error:", error);
    return apiError("Internal server error");
  }
}
