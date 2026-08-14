import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateOptional } from "@/lib/middleware";
import { generateAIContent } from "@/lib/ai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { consumeCredit, refundCredit } from "@/lib/usage";

// Anonymous (unauthenticated) requests share an IP-based window so the
// endpoint can't be farmed for free AI calls. Each call costs 2 units,
// giving ~20 calls per 15-minute window.
const ANONYMOUS_IP_RATE_LIMIT = { max: 40, windowMs: 15 * 60 * 1000 };

// Interview-prep actions are stored under the existing INTERVIEW_QUESTIONS
// history type so no schema migration is required for the enum.
const AI_TYPE_ALIASES = {
  REGENERATE_ANSWER: "INTERVIEW_QUESTIONS",
  SHORTER_ANSWER: "INTERVIEW_QUESTIONS",
  PROFESSIONAL_ANSWER: "INTERVIEW_QUESTIONS",
  EXPLAIN_ANSWER: "INTERVIEW_QUESTIONS",
  PRACTICE_INTERVIEW: "INTERVIEW_QUESTIONS",
};

// Must match the keys of AI_PROMPTS in lib/ai.js. Anything else is rejected
// before a credit is consumed so invalid input can't corrupt AIHistory.type.
const VALID_AI_TYPES = new Set([
  "SUMMARY",
  "IMPROVE_EXPERIENCE",
  "REWRITE_BULLETS",
  "GENERATE_SKILLS",
  "GENERATE_PROJECTS",
  "GENERATE_ACHIEVEMENTS",
  "COVER_LETTER",
  "GRAMMAR_CHECK",
  "ATS_KEYWORDS",
  "RESUME_ANALYSIS",
  "ATS_ANALYSIS",
  "ATS_IMPROVE_SUMMARY",
  "ATS_IMPROVE_BULLETS",
  "ATS_IMPROVE_PROJECTS",
  "ATS_IMPROVE_SKILLS",
  "ATS_ADD_KEYWORDS",
  "ATS_REWRITE_ACHIEVEMENTS",
  "ATS_IMPROVE_GRAMMAR",
  "ATS_BETTER_TITLE",
  "ATS_OPTIMIZE_RESUME",
  "INTERVIEW_QUESTIONS",
  "REGENERATE_ANSWER",
  "SHORTER_ANSWER",
  "PROFESSIONAL_ANSWER",
  "EXPLAIN_ANSWER",
  "PRACTICE_INTERVIEW",
  "CAREER_SUGGESTIONS",
]);

export async function POST(request) {
  let userId = null;
  try {
    const auth = await authenticateOptional(request);
    userId = auth?.userId;

    if (userId) {
      const credit = await consumeCredit(userId);
      if (!credit.ok) {
        return NextResponse.json(
          { success: false, message: credit.message },
          { status: 429 }
        );
      }
    } else {
      // Anonymous callers are rate limited by IP.
      const ip = getClientIp(request);
      const result = checkRateLimit(
        `ai:anon:${ip}`,
        ANONYMOUS_IP_RATE_LIMIT.max,
        ANONYMOUS_IP_RATE_LIMIT.windowMs
      );
      if (!result.allowed) {
        return NextResponse.json(
          { success: false, message: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const { type, data, resumeId } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, message: "AI type is required" },
        { status: 400 }
      );
    }

    if (!VALID_AI_TYPES.has(type)) {
      return NextResponse.json(
        { success: false, message: `Unsupported AI type: ${type}` },
        { status: 422 }
      );
    }

    // Verify ownership BEFORE spending the AI call so a non-owner can't burn
    // tokens or get another user's data shape probed.
    if (resumeId) {
      if (!userId) {
        return NextResponse.json(
          { success: false, message: "Not authenticated" },
          { status: 401 }
        );
      }
      const resume = await prisma.resume.findFirst({
        where: { id: resumeId, userId },
        select: { id: true },
      });
      if (!resume) {
        return NextResponse.json(
          { success: false, message: "Resume not found" },
          { status: 404 }
        );
      }
    }

    const result = await generateAIContent(type, data);

    if (userId) {
      await prisma.aIHistory.create({
        data: {
          userId,
          resumeId: resumeId || null,
          type: AI_TYPE_ALIASES[type] || type,
          input: JSON.stringify(data),
          output: typeof result === "string" ? result : JSON.stringify(result),
          model: "llama-3.3-70b-versatile",
        },
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    if (userId) {
      await refundCredit(userId);
    }
    console.error("AI generation error:", error);
    return NextResponse.json(
      { success: false, message: "AI generation failed" },
      { status: 500 }
    );
  }
}
