import { NextResponse } from "next/server";
import { authenticateOptional } from "@/lib/middleware";
import { callGroq } from "@/lib/ai";
import prisma from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiRateLimited,
  safeBody,
} from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { consumeCredit, refundCredit } from "@/lib/usage";

// Anonymous requests share an IP window (2 units per call, ~20 calls/15min).
const ANONYMOUS_IP_RATE_LIMIT = { max: 40, windowMs: 15 * 60 * 1000 };

/**
 * Compile all resume sections into a single text block for AI analysis.
 * @param {object} resume - Full resume object with all relations
 * @returns {string}
 */
function compileResumeContent(resume) {
  const parts = [];

  if (resume.title) parts.push(`Resume Title: ${resume.title}`);
  if (resume.summary) parts.push(`\nProfessional Summary:\n${resume.summary}`);

  if (resume.experiences?.length > 0) {
    parts.push("\nWork Experience:");
    resume.experiences.forEach((exp) => {
      parts.push(`- ${exp.position} at ${exp.company}${exp.location ? ` (${exp.location})` : ""}`);
      if (exp.description) parts.push(`  ${exp.description}`);
      if (exp.highlights?.length > 0) {
        exp.highlights.forEach((h) => parts.push(`  • ${h}`));
      }
    });
  }

  if (resume.educations?.length > 0) {
    parts.push("\nEducation:");
    resume.educations.forEach((edu) => {
      parts.push(`- ${edu.degree}${edu.field ? ` in ${edu.field}` : ""} from ${edu.institution}`);
      if (edu.gpa) parts.push(`  GPA: ${edu.gpa}`);
    });
  }

  if (resume.skills?.length > 0) {
    parts.push(`\nSkills: ${resume.skills.map((s) => s.name).join(", ")}`);
  }

  if (resume.projects?.length > 0) {
    parts.push("\nProjects:");
    resume.projects.forEach((proj) => {
      parts.push(`- ${proj.name}: ${proj.description || "No description"}`);
      if (proj.technologies?.length > 0) {
        parts.push(`  Technologies: ${proj.technologies.join(", ")}`);
      }
      if (proj.highlights?.length > 0) {
        proj.highlights.forEach((h) => parts.push(`  • ${h}`));
      }
    });
  }

  if (resume.certificates?.length > 0) {
    parts.push("\nCertificates:");
    resume.certificates.forEach((cert) => {
      parts.push(`- ${cert.name} from ${cert.issuer}`);
    });
  }

  if (resume.languages?.length > 0) {
    parts.push(`\nLanguages: ${resume.languages.map((l) => `${l.name} (${l.proficiency})`).join(", ")}`);
  }

  if (resume.achievements?.length > 0) {
    parts.push("\nAchievements:");
    resume.achievements.forEach((a) => {
      parts.push(`- ${a.title}${a.description ? `: ${a.description}` : ""}`);
    });
  }

  return parts.join("\n");
}

/**
 * Build a Gemini prompt for job-resume matching analysis.
 * @param {string} resumeContent
 * @param {string} jobDescription
 * @returns {string}
 */
function buildJobMatchPrompt(resumeContent, jobDescription) {
  return `You are an expert career advisor and ATS specialist. Analyze how well the following resume matches the given job description.

Resume Content:
${resumeContent}

Job Description:
${jobDescription}

Provide a detailed analysis in JSON format with the following fields:
- matchPercentage (number 0-100): Overall match score between resume and job
- matchedSkills (array of strings): Skills from the job description that are present in the resume
- missingSkills (array of strings): Skills required by the job but missing from the resume
- recommendedKeywords (array of strings): Keywords from the job description that should be added to the resume
- recommendations (array of strings): Specific actionable recommendations to improve the match (5-8 items)

Be thorough and precise. Only include skills that are actually mentioned or clearly implied. Return valid JSON only.`;
}

/**
 * POST /api/job-match
 * Analyze how well a resume matches a specific job description.
 * Accepts { resumeId, jobDescription } or { resumeContent, jobDescription }.
 */
export async function POST(request) {
  let userId = null;
  try {
    const auth = await authenticateOptional(request);
    userId = auth?.userId;

    // Check AI rate limit only if authenticated
    if (userId) {
      const credit = await consumeCredit(userId);
      if (!credit.ok) {
        return apiRateLimited(credit.message);
      }
    } else {
      const ip = getClientIp(request);
      const limited = checkRateLimit(
        `job-match:anon:${ip}`,
        ANONYMOUS_IP_RATE_LIMIT.max,
        ANONYMOUS_IP_RATE_LIMIT.windowMs
      );
      if (!limited.allowed) {
        return apiRateLimited();
      }
    }

    const body = await safeBody(request);
    if (!body) {
      return apiError("Invalid request body", 400);
    }

    const { resumeId, resumeContent, jobDescription } = body;

    if (!jobDescription || jobDescription.trim().length === 0) {
      return apiValidationError(
        ["jobDescription is required"],
        "Validation failed"
      );
    }

    if (!resumeId && !resumeContent) {
      return apiValidationError(
        ["resumeId or resumeContent is required"],
        "Validation failed"
      );
    }

    let content = resumeContent;
    let fetchedResumeId = resumeId || null;

    // If resumeId is provided, fetch the full resume from DB
    if (resumeId && !resumeContent) {
      if (!userId) {
        return apiValidationError(
          ["Authentication required to use resumeId"],
          "Validation failed"
        );
      }
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
        include: {
          experiences: { orderBy: { order: "asc" } },
          educations: { orderBy: { order: "asc" } },
          skills: { orderBy: { order: "asc" } },
          projects: { orderBy: { order: "asc" } },
          certificates: { orderBy: { order: "asc" } },
          languages: { orderBy: { order: "asc" } },
          achievements: { orderBy: { order: "asc" } },
        },
      });

      if (!resume) {
        return apiError("Resume not found", 404);
      }

      content = compileResumeContent(resume);
    }

    if (!content || content.trim().length === 0) {
      return apiError("Resume content is empty. Please add content to your resume first.", 400);
    }

    const prompt = buildJobMatchPrompt(content, jobDescription);
    const text = await callGroq(prompt);

    // Parse JSON from AI response
    let result;
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch {
        if (userId) {
          await refundCredit(userId);
        }
        result = {
          matchPercentage: 0,
          matchedSkills: [],
          missingSkills: [],
          recommendedKeywords: [],
          recommendations: ["Failed to parse AI response. Please try again."],
        };
      }
    } else {
      if (userId) {
        await refundCredit(userId);
      }
      result = {
        matchPercentage: 0,
        matchedSkills: [],
        missingSkills: [],
        recommendedKeywords: [],
        recommendations: ["Failed to parse AI response. Please try again."],
      };
    }

    // Save to AI history (only if authenticated)
    if (userId) {
      await prisma.aIHistory.create({
        data: {
          userId,
          resumeId: fetchedResumeId,
          type: "ATS_KEYWORDS",
          input: JSON.stringify({ resumeContent: content.substring(0, 2000), jobDescription: jobDescription.substring(0, 2000) }),
          output: JSON.stringify(result),
          model: "llama-3.3-70b-versatile",
        },
      });
    }

    return apiSuccess(result);
  } catch (error) {
    if (error instanceof Response || error instanceof NextResponse) return error;
    if (userId) {
      await refundCredit(userId);
    }
    console.error("Job match error:", error);
    return apiError("Failed to analyze job match", 500);
  }
}
