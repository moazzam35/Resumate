import { authenticateOptional } from "@/lib/middleware";
import { generateAIContent } from "@/lib/ai";
import { analyzeATS, getSectionContent } from "@/lib/ats";
import prisma from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  apiValidationError,
  apiRateLimited,
  safeBody,
  validateRequired,
} from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { consumeCredit, refundCredit } from "@/lib/usage";

// Anonymous requests share an IP window (2 units per call, ~20 calls/15min).
const ANONYMOUS_IP_RATE_LIMIT = { max: 40, windowMs: 15 * 60 * 1000 };

const IMPROVEMENT_CONFIG = {
  summary: { ai: "ATS_IMPROVE_SUMMARY", section: "summary", appliesTo: "summary" },
  bullets: { ai: "ATS_IMPROVE_BULLETS", section: "experience", appliesTo: "experience" },
  projects: { ai: "ATS_IMPROVE_PROJECTS", section: "projects", appliesTo: "projects" },
  skills: { ai: "ATS_IMPROVE_SKILLS", section: "skills", appliesTo: "skills" },
  achievements: { ai: "ATS_REWRITE_ACHIEVEMENTS", section: "achievements", appliesTo: "achievements" },
  keywords: { ai: "ATS_ADD_KEYWORDS", section: null, appliesTo: "full" },
  grammar: { ai: "ATS_IMPROVE_GRAMMAR", section: null, appliesTo: "full" },
  title: { ai: "ATS_BETTER_TITLE", section: null, appliesTo: "title" },
  optimize: { ai: "ATS_OPTIMIZE_RESUME", section: null, appliesTo: "full" },
};

const HISTORY_TYPE = {
  summary: "SUMMARY",
  bullets: "IMPROVE_EXPERIENCE",
  projects: "GENERATE_PROJECTS",
  skills: "GENERATE_SKILLS",
  achievements: "GENERATE_ACHIEVEMENTS",
  keywords: "ATS_KEYWORDS",
  grammar: "GRAMMAR_CHECK",
  title: "SUMMARY",
  optimize: "RESUME_ANALYSIS",
};

/**
 * POST /api/ats-improve
 * Generate a personalized resume improvement for one improvement type.
 * Accepts { type, resumeContent, jobDescription, currentScore }.
 */
export async function POST(request) {
  let userId = null;
  try {
    const auth = await authenticateOptional(request);
    userId = auth?.userId;

    if (userId) {
      const credit = await consumeCredit(userId);
      if (!credit.ok) {
        return apiRateLimited(credit.message);
      }
    } else {
      const ip = getClientIp(request);
      const limited = checkRateLimit(
        `ats-improve:anon:${ip}`,
        ANONYMOUS_IP_RATE_LIMIT.max,
        ANONYMOUS_IP_RATE_LIMIT.windowMs
      );
      if (!limited.allowed) {
        return apiRateLimited();
      }
    }

    const body = await safeBody(request);
    if (!body) return apiError("Invalid request body", 400);

    const { type, resumeContent, jobDescription, currentScore } = body;
    const validation = validateRequired(body, ["type", "resumeContent"]);
    if (!validation.valid) {
      return apiValidationError(validation.missing, "Validation failed");
    }

    const config = IMPROVEMENT_CONFIG[type];
    if (!config) {
      return apiValidationError([`Unknown improvement type: ${type}`], "Validation failed");
    }

    const content = String(resumeContent);
    if (!content.trim()) {
      return apiError("Resume content is empty. Please add content to your resume first.", 400);
    }

    const jd = String(jobDescription || "");
    const ats = analyzeATS(content, jd);

    // Resolve the "original" content and where the improvement will be applied.
    let original;
    let appliesTo = config.appliesTo;
    if (config.section) {
      original = getSectionContent(content, config.section);
      if (type === "achievements" && !original) {
        original = getSectionContent(content, "experience");
        appliesTo = original ? "experience" : "achievements";
      }
      if (!original) original = "(no content found for this section)";
    } else if (type === "title") {
      const firstLine = content.split(/\r?\n/).find((l) => l.trim()) || "";
      const isHeading = /^(professional summary|work experience|education|skills|projects|achievements|certifications|summary)/i.test(
        firstLine.trim()
      );
      original = !isHeading && firstLine.trim().length <= 80 ? firstLine.trim() : "(no title found)";
    } else {
      original = content;
    }

    const aiResult = await generateAIContent(config.ai, {
      type,
      original,
      resumeContent: content.substring(0, 6000),
      jobDescription: jd.substring(0, 3000),
      missingKeywords: ats.keywords.missing,
      missingSkills: ats.missingSkills,
      currentScore: Number(currentScore) || ats.score,
    });

    const raw = aiResult && typeof aiResult === "object" ? aiResult : {};
    const improved = String(raw.improved || "").trim();
    if (!improved) {
      if (userId) {
        await refundCredit(userId);
      }
      return apiError("The AI did not return an improved version. Please try again.", 502);
    }

    const result = {
      type,
      title: String(raw.title || config.appliesTo),
      original: String(raw.original !== undefined && raw.original !== null ? raw.original : original),
      improved,
      explanation: String(raw.explanation || ""),
      scoreIncrease: Math.max(0, Math.min(20, Math.round(Number(raw.scoreIncrease) || 3))),
      appliesTo,
    };

    if (userId) {
      try {
        await prisma.aIHistory.create({
          data: {
            userId,
            resumeId: null,
            type: HISTORY_TYPE[type] || "ATS_KEYWORDS",
            input: JSON.stringify({
              type,
              resumeContent: content.substring(0, 1500),
              jobDescription: jd.substring(0, 1500),
            }),
            output: JSON.stringify({
              original: result.original.substring(0, 1000),
              improved: result.improved.substring(0, 1500),
              scoreIncrease: result.scoreIncrease,
              appliesTo,
            }),
            model: process.env.AI_MODEL || "meta-llama/llama-3.3-70b-instruct",
          },
        });
      } catch (err) {
        console.error("Failed to record ATS improvement history:", err);
      }
    }

    return apiSuccess(result);
  } catch (error) {
    if (error instanceof Response) return error;
    if (userId) {
      await refundCredit(userId);
    }
    console.error("ATS improve error:", error);
    return apiError("Failed to improve resume", 500);
  }
}
