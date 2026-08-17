import { authenticateOptional } from "@/lib/middleware";
import { generateAIContent } from "@/lib/ai";
import { analyzeATS } from "@/lib/ats";
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
 * POST /api/ats-score
 * Analyze a resume's ATS compatibility and overall quality.
 * Accepts { resumeId } or { resumeContent, jobDescription }.
 */
export async function POST(request) {
  let userId = null;
  try {
    const auth = await authenticateOptional(request);
    userId = auth?.userId;

    // If authenticated, check AI rate limit based on subscription plan
    if (userId) {
      const credit = await consumeCredit(userId);
      if (!credit.ok) {
        return apiRateLimited(credit.message);
      }
    } else {
      const ip = getClientIp(request);
      const limited = checkRateLimit(
        `ats:anon:${ip}`,
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

    // Must provide resumeContent (resumeId requires auth)
    if (!resumeContent && !resumeId) {
      return apiValidationError(
        ["resumeContent is required"],
        "Validation failed"
      );
    }

    let content = resumeContent;

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

    // Deterministic, strict multi-factor ATS analysis (fast, consistent, no AI cost)
    const ats = analyzeATS(content, jobDescription || "");

    // Personalized AI recommendations (structured, priority-grouped)
    let ai = null;
    try {
      ai = await generateAIContent("ATS_ANALYSIS", {
        resumeContent: content.substring(0, 6000),
        jobDescription: (jobDescription || "").substring(0, 3000),
        score: ats.score,
        missingKeywords: ats.keywords.missing,
        missingSkills: ats.missingSkills,
        weakSections: ats.weakSections,
      });
    } catch (err) {
      console.error("ATS AI analysis error (falling back to engine-only):", err);
      if (userId) {
        await refundCredit(userId);
      }
    }

    const aiSuggestions = Array.isArray(ai?.suggestions) ? ai.suggestions : [];
    const priorityImprovements = ats.priorityImprovements.map((p) => ({ ...p, source: "engine" }));
    const aiImprovements = aiSuggestions.map((s) => ({
      priority: s.priority || "medium",
      category: s.category || "content",
      problem: s.problem || "",
      reason: s.reason || "",
      example: s.exampleFix || s.example || "",
      expectedImprovement: s.expectedImprovement || "",
      source: "ai",
    }));
    const suggestions = [...priorityImprovements, ...aiImprovements];
    const recruiterTips = Array.isArray(ai?.recruiterTips) ? ai.recruiterTips : [];
    const strengths = Array.isArray(ai?.strengths) ? ai.strengths : ats.strength
      ? [`Overall ATS verdict: ${ats.verdict.label} (${ats.score}/100).`]
      : [];

    const resultData = {
      score: ats.score,
      baseScore: ats.baseScore,
      verdict: ats.verdict,
      strength: ats.strength,
      matchPercentage: ats.matchPercentage,
      components: ats.components,
      weights: ats.weights,
      modifiers: ats.modifiers,
      explanations: ats.explanations,
      keywords: ats.keywords,
      missingKeywords: ats.keywords.missing,
      missingSkills: ats.missingSkills,
      weakSections: ats.weakSections,
      priorityImprovements,
      suggestions,
      recruiterTips,
      strengths,
      overallFeedback: ai?.summary || `Analysis complete. Your resume scored ${ats.score}/100 (${ats.verdict.label}).`,
      metrics: ats.metrics,
      aiEnabled: !!ai,
    };

    // Persist the full result so the [/id] page can load it after a refresh,
    // direct URL access, or a fresh session. Only saved for authenticated users
    // (the ATS Checker page itself is behind the auth proxy).
    let resultId = null;
    if (userId) {
      try {
        const saved = await prisma.atsResult.create({
          data: {
            userId,
            resumeId: resumeId || null,
            resumeContent: content.substring(0, 100000),
            jobDescription: (jobDescription || "").substring(0, 50000),
            score: ats.score,
            data: resultData,
          },
        });
        resultId = saved.id;
      } catch (err) {
        console.error("Failed to persist ATS result (non-fatal):", err);
      }
    }

    // Save to AI history (only if authenticated)
    if (userId) {
      await prisma.aIHistory.create({
        data: {
          userId,
          resumeId: resumeId || null,
          type: "ATS_KEYWORDS",
          input: JSON.stringify({ resumeContent: content.substring(0, 2000), jobDescription }),
          output: JSON.stringify({
            score: ats.score,
            matchPercentage: ats.matchPercentage,
            missingKeywords: ats.keywords.missing,
            weakSections: ats.weakSections,
            suggestions,
            overallFeedback: ai?.summary || "Analysis complete.",
          }),
          model: process.env.AI_MODEL || "meta-llama/llama-3.3-70b-instruct",
        },
      });
    }

    return apiSuccess({ ...resultData, resultId });
  } catch (error) {
    if (error instanceof Response) return error;
    if (userId) {
      await refundCredit(userId);
    }
    console.error("ATS score error:", error);
    return apiError("Failed to analyze resume", 500);
  }
}
