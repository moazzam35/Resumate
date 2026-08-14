import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiSuccess, apiError, apiNotFound } from "@/lib/api-response";

export async function GET(request, { params }) {
  try {
    const { userId } = await authenticate(request);

    const { id } = await params;

    const result = await prisma.atsResult.findFirst({
      where: { id, userId },
    });

    if (!result) {
      return apiNotFound("ATS result not found");
    }

    return apiSuccess({
      id: result.id,
      resumeId: result.resumeId,
      resumeContent: result.resumeContent,
      jobDescription: result.jobDescription,
      score: result.score,
      createdAt: result.createdAt,
      ...(result.data || {}),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Get ATS result error:", error);
    return apiError("Failed to load ATS result", 500);
  }
}
