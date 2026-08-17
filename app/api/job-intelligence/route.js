import { NextResponse } from "next/server";
import { lookupJobLocally, getGenericFallback } from "@/lib/job-data";
import { callGroq, parseJSONResponse } from "@/lib/ai";

// In-memory cache for AI-generated job data (survives across requests in same process)
const aiCache = new Map();
const CACHE_MAX_SIZE = 500;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCachedResult(key) {
  const entry = aiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    aiCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedResult(key, data) {
  if (aiCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = aiCache.keys().next().value;
    aiCache.delete(oldestKey);
  }
  aiCache.set(key, { data, timestamp: Date.now() });
}

const JOB_INTELLIGENCE_PROMPT = (jobTitle) => `You are a professional resume-writing assistant.

The user entered the job title: ${jobTitle}

Generate professional resume guidance for this role.

Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{
  "title": "${jobTitle}",
  "category": "most appropriate professional category",
  "summary": "professional, concise, ATS-friendly summary suitable for a resume (2-3 sentences)",
  "skills": ["realistic skill 1", "realistic skill 2", "...at least 8-12 skills"],
  "responsibilities": ["typical responsibility 1", "typical responsibility 2", "...at least 5-6 responsibilities"],
  "keywords": ["relevant ATS keyword 1", "relevant ATS keyword 2", "...at least 8-10 keywords"]
}

RULES:
- The summary must be professional, concise, ATS-friendly, and suitable for a resume.
- Skills must be realistic and relevant for this specific role.
- Responsibilities must describe typical day-to-day duties of this position.
- Keywords should contain relevant ATS (Applicant Tracking System) keywords for this job title.
- Do NOT invent the user's personal experience, education, company names, achievements, years of experience, certifications, or qualifications.
- If the title is unusual or unclear, infer its likely professional meaning carefully and create a reasonable generic role description.
- Do not include markdown formatting, code fences, or any text outside the JSON object.`;

export async function POST(request) {
  try {
    const { title } = await request.json();

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Job title is required" },
        { status: 400 }
      );
    }

    const trimmedTitle = title.trim();

    // 1. Check local database first (FREE, instant)
    const localResult = lookupJobLocally(trimmedTitle);
    if (localResult && localResult.matchType === "exact") {
      return NextResponse.json({
        success: true,
        source: "local",
        result: {
          title: trimmedTitle,
          category: localResult.category,
          summary: localResult.summary,
          skills: localResult.skills,
          responsibilities: localResult.responsibilities,
          keywords: localResult.keywords,
        },
      });
    }

    // 2. Check in-memory AI cache
    const cacheKey = trimmedTitle.toLowerCase().trim();
    const cached = getCachedResult(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        source: "cache",
        result: { ...cached, title: trimmedTitle },
      });
    }

    // 3. If we have a good fuzzy local match, use it without calling AI
    if (localResult) {
      return NextResponse.json({
        success: true,
        source: "local_fuzzy",
        result: {
          title: trimmedTitle,
          category: localResult.category,
          summary: localResult.summary,
          skills: localResult.skills,
          responsibilities: localResult.responsibilities,
          keywords: localResult.keywords,
        },
      });
    }

    // 4. No local match → Call AI (with graceful failure)
    try {
      const prompt = JOB_INTELLIGENCE_PROMPT(trimmedTitle);
      const rawResponse = await callGroq(prompt);
      const parsed = parseJSONResponse(rawResponse);

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const aiResult = {
          title: trimmedTitle,
          category: parsed.category || "General",
          summary: parsed.summary || `Professional ${trimmedTitle} with relevant experience and skills.`,
          skills: Array.isArray(parsed.skills) ? parsed.skills : ["Communication", "Problem Solving", "Teamwork", "Time Management"],
          responsibilities: Array.isArray(parsed.responsibilities)
            ? parsed.responsibilities
            : ["Perform core duties and responsibilities associated with the role"],
          keywords: Array.isArray(parsed.keywords)
            ? parsed.keywords
            : [trimmedTitle.toLowerCase(), "professional", "teamwork"],
        };

        setCachedResult(cacheKey, aiResult);

        return NextResponse.json({
          success: true,
          source: "ai",
          result: aiResult,
        });
      }

      // AI returned unparseable response → use generic fallback
      const fallback = getGenericFallback(trimmedTitle);
      return NextResponse.json({
        success: true,
        source: "fallback",
        result: fallback,
      });
    } catch (aiError) {
      // AI failed completely → use generic fallback (NEVER crash)
      console.error("Job intelligence AI call failed:", aiError?.message || aiError);
      const fallback = getGenericFallback(trimmedTitle);
      return NextResponse.json({
        success: true,
        source: "fallback",
        result: fallback,
      });
    }
  } catch (error) {
    console.error("Job intelligence route error:", error);
    // Even on catastrophic failure, return a usable fallback
    try {
      const { title } = await request.json().catch(() => ({}));
      if (title) {
        const fallback = getGenericFallback(title);
        return NextResponse.json({ success: true, source: "fallback", result: fallback });
      }
    } catch {
      // ignore
    }
    return NextResponse.json(
      { success: false, message: "Job intelligence request failed" },
      { status: 500 }
    );
  }
}
