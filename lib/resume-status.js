import prisma from "@/lib/prisma";
import { checkResumeCompletion } from "@/lib/utils";

const COMPLETION_INCLUDES = {
  experiences: true,
  educations: true,
  skills: true,
  projects: true,
};

export async function recomputeResumeStatus(resumeId) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: COMPLETION_INCLUDES,
  });

  if (!resume) return null;

  const { complete } = checkResumeCompletion(resume);

  return prisma.resume.update({
    where: { id: resumeId },
    data: { status: complete ? "COMPLETED" : "DRAFT" },
  });
}

export async function recomputeResumeStatusSafe(resumeId) {
  try {
    await recomputeResumeStatus(resumeId);
  } catch (error) {
    console.error("recomputeResumeStatus error:", error);
  }
}
