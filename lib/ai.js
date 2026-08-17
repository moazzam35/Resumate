const AI_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// `meta-llama/llama-3.3-70b-instruct` is the current OpenRouter ID for this
// model family (the older `-versatile` ID was retired and now returns
// "not a valid model ID"). Overridable via AI_MODEL env var.
const AI_MODEL = process.env.AI_MODEL || "meta-llama/llama-3.3-70b-instruct";

function inferExperienceLevel(jobTitle) {
  const t = String(jobTitle || "").toLowerCase();
  if (/(intern|trainee|entry|junior|graduate|fresher|associate|level 1|i\b)/.test(t)) return "junior";
  if (/(senior|lead|staff|principal|architect|head|director|manager|vp|vice president|chief|cto|principal)/.test(t)) return "senior";
  return "mid";
}

const EXPERIENCE_LABELS = {
  junior: "Junior / entry-level",
  mid: "Mid-level",
  senior: "Senior / lead",
};

function buildRoleGuidance(jobTitle) {
  const t = String(jobTitle || "").toLowerCase();

  if (/(full[- ]*stack|fullstack|mern|mevn)/.test(t)) {
    return `This is a FULL-STACK role. The technical questions must cover: React (hooks, state management, rendering/performance), Next.js (App Router, SSR/SSG/ISR, server vs client components), JavaScript & TypeScript (typing, async patterns, modern ES features), Node.js & Express (middleware, async/error handling, streams), databases — SQL (modeling, indexes, transactions, joins) and NoSQL (document modeling, trade-offs), REST APIs (design, status codes, versioning, pagination), authentication & authorization (JWT, sessions, OAuth), performance optimization, web security (XSS, CSRF, injection, secure headers), Git workflows, deployment & CI/CD, plus common coding interview problems (arrays, strings, hashing, trees, recursion, time/space complexity).`;
  }

  if (/(front[- ]*end|react|next\.?js|ui engineer|web developer)/.test(t)) {
    return `This is a FRONT-END role. Focus on HTML/CSS, JavaScript/TypeScript, a modern framework (React, Vue, or Angular), rendering and performance, state management, accessibility, responsive design, web APIs, build tooling/bundlers, and front-end testing.`;
  }

  if (/(back[- ]*end|node\.?js|express|java developer|python developer|\.net|golang|go developer|ruby|spring)/.test(t)) {
    return `This is a BACK-END role. Focus on server-side languages and frameworks, API design and versioning, databases (SQL/NoSQL), caching, message queues, concurrency, error handling, security, scaling, and writing reliable tests.`;
  }

  if (/(devops|sre|site reliability|platform|infrastructure|cloud|aws|azure|gcp|kubernetes|docker)/.test(t)) {
    return `This is a DevOps/SRE/Platform role. Focus on CI/CD pipelines, containers and orchestration (Docker, Kubernetes), infrastructure as code (Terraform/CloudFormation), observability (metrics, logs, tracing), reliability engineering, incident response, and cloud cost/scale trade-offs.`;
  }

  if (/(data engineer|data scientist|machine learning|ml engineer|\bai\b|analyst|analytics|data \w+)/.test(t)) {
    return `This is a DATA/AI role. Focus on SQL and data modeling, Python and data libraries, ETL/ELT pipelines, statistical and ML concepts, model evaluation and drift, A/B testing, and shipping reliable data products.`;
  }

  if (/(mobile|ios|android|react native|flutter|swift|kotlin)/.test(t)) {
    return `This is a MOBILE role. Focus on platform-specific languages and SDKs (iOS/Android), app architecture, lifecycle management, networking and offline storage, performance and battery, app distribution, and device security.`;
  }

  if (/(security|cyber|penetration|pentest|infosec)/.test(t)) {
    return `This is a SECURITY role. Focus on application security (OWASP Top 10), authentication and authorization, threat modeling, cryptography, secure network design, and security testing methodology.`;
  }

  if (/(qa|quality|test|sdets?|automation)/.test(t)) {
    return `This is a QUALITY/QA role. Focus on test strategy, unit/integration/E2E testing, test automation frameworks, CI integration, test data management, and reporting quality metrics.`;
  }

  if (/(product|program manager|project manager)/.test(t)) {
    return `This is a PRODUCT role. Focus on product discovery, prioritization frameworks, metrics and analytics, roadmapping, stakeholder management, and leading technical teams.`;
  }

  if (/(design|ux|ui|creative|art director)/.test(t)) {
    return `This is a DESIGN role. Focus on UX research, information architecture, interaction design, prototyping, design systems, accessibility, and usability testing.`;
  }

  if (/(market|growth|seo|content|brand)/.test(t)) {
    return `This is a MARKETING/GROWTH role. Focus on channel strategy, funnel and unit economics, analytics and experimentation, content and SEO, and brand messaging.`;
  }

  if (/(sales|account executive|business development|sdr|bdr)/.test(t)) {
    return `This is a SALES role. Focus on pipeline management, discovery and qualification, objection handling, forecasting, CRM hygiene, and closing techniques.`;
  }

  if (/(finance|accountant|accounting|fp&a)/.test(t)) {
    return `This is a FINANCE role. Focus on financial modeling, forecasting and budgeting, variance analysis, reporting, and relevant accounting standards or compliance.`;
  }

  return `Produce questions about the real, current tools, frameworks, languages, and hard skills most commonly required for the exact title "${jobTitle}". If the role is non-engineering, ask domain-expert questions about that profession instead of generic ones. Always prefer specific, job-relevant questions.`;
}

const AI_PROMPTS = {
  SUMMARY: (data) => `You are a professional resume writer. Generate a compelling professional summary for a ${data.title || "professional"} with the following experience:
${data.experience || "No experience provided"}
Skills: ${data.skills || "Not specified"}
${data.targetRole ? `Target role: ${data.targetRole}` : ""}
${data.suggestedSkills ? `\nSuggested skills for this role: ${data.suggestedSkills}` : ""}
${data.suggestedResponsibilities ? `\nTypical responsibilities for this role: ${data.suggestedResponsibilities}` : ""}
${data.jobCategory ? `\nIndustry category: ${data.jobCategory}` : ""}

Write a 3-4 sentence professional summary that is impactful, specific, and tailored to their field. Use strong action verbs and quantifiable achievements where possible.`,

  IMPROVE_EXPERIENCE: (data) => `Improve the following work experience description to be more impactful and professional. Use strong action verbs, quantify achievements where possible, and follow best practices for resume writing.

Current description:
Position: ${data.position}
Company: ${data.company}
Description: ${data.description || "No description provided"}
Highlights: ${data.highlights?.join(", ") || "None"}

Return the improved version as JSON with fields: description (string), highlights (array of strings). Make each highlight start with a strong action verb and include metrics where possible.`,

  REWRITE_BULLETS: (data) => `Rewrite the following bullet points to be more impactful and professional. Each bullet should:
1. Start with a strong action verb
2. Include quantifiable results where possible
3. Be concise (1-2 lines max)
4. Focus on impact and results

Current bullets:
${data.bullets?.map((b, i) => `${i + 1}. ${b}`).join("\n") || "No bullets provided"}

Return the rewritten bullets as a JSON array of strings.`,

  GENERATE_SKILLS: (data) => `Based on the following role and experience, suggest relevant technical and soft skills.

Role: ${data.title || "Professional"}
Experience: ${data.experience || "Not specified"}
Industry: ${data.industry || "Technology"}
${data.suggestedSkills ? `\nSuggested baseline skills for this role: ${data.suggestedSkills}` : ""}
${data.suggestedKeywords ? `\nKey ATS keywords for this role: ${data.suggestedKeywords}` : ""}

Return a JSON array of skill objects with fields: name (string), category (string: "Technical", "Soft", "Tool", "Language"), level (one of: "BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT").

Suggest 15-20 relevant skills.`,

  GENERATE_PROJECTS: (data) => `Based on the following profile, suggest 2-3 project ideas that would be impressive on a resume.

Role: ${data.title || "Professional"}
Skills: ${data.skills || "Not specified"}
Experience level: ${data.level || "Mid-level"}
${data.suggestedSkills ? `\nRelevant technologies for this role: ${data.suggestedSkills}` : ""}

Return a JSON array of project objects with fields: name (string), description (string, 2-3 sentences), technologies (array of strings), highlights (array of 2-3 bullet points).`,

  GENERATE_ACHIEVEMENTS: (data) => `Based on the following profile, suggest notable achievements and awards that would strengthen a resume.

Role: ${data.title || "Professional"}
Experience: ${data.experience || "Not specified"}
Skills: ${data.skills || "Not specified"}
${data.suggestedResponsibilities ? `\nTypical responsibilities for this role: ${data.suggestedResponsibilities}` : ""}

Return a JSON array of achievement objects with fields: title (string), description (string, 1-2 sentences). Suggest 3-5 achievements.`,

  COVER_LETTER: (data) => `Write a professional cover letter for the following position.

Applicant name: ${data.name || "Applicant"}
Position: ${data.position}
Company: ${data.company}
Skills: ${data.skills || "Not specified"}
Experience: ${data.experience || "Not specified"}
${data.jobDescription ? `Job description: ${data.jobDescription}` : ""}

Write a compelling cover letter (3-4 paragraphs) that:
1. Opens with a strong hook
2. Highlights relevant experience and skills
3. Shows knowledge of the company
4. Ends with a clear call to action

Return the cover letter as plain text.`,

  GRAMMAR_CHECK: (data) => `Check the following text for grammar, spelling, and punctuation errors. Also suggest improvements for clarity and professionalism.

Text:
${data.text}

Return a JSON object with: correctedText (string), issues (array of objects with: original, corrected, explanation).`,

  ATS_KEYWORDS: (data) => `Analyze the following resume content and suggest ATS (Applicant Tracking System) keywords and phrases that should be included.

Resume content:
${data.resumeContent}

Target job description (if provided):
${data.jobDescription || "Not provided"}
${data.suggestedKeywords ? `\nBaseline ATS keywords for this role: ${data.suggestedKeywords}` : ""}
${data.jobCategory ? `\nIndustry category: ${data.jobCategory}` : ""}

Return a JSON object with: keywords (array of strings), suggestions (array of strings with specific recommendations).`,

  RESUME_ANALYSIS: (data) => `Analyze the following resume and provide detailed feedback on:
1. Overall strength (1-100 score)
2. Content quality
3. ATS compatibility
4. Areas for improvement
5. Strengths

Resume content:
${data.resumeContent}

Return a JSON object with: score (number 0-100), contentScore (number), atsScore (number), strengths (array of strings), improvements (array of strings), summary (string).`,

  ATS_ANALYSIS: (data) => `You are a senior ATS and career-expert consultant. Your job is to give a job candidate PERSONALIZED, actionable recommendations to maximize how often their resume passes Applicant Tracking Systems (ATS) for a specific job description.

RESUME CONTENT:
${data.resumeContent}

TARGET JOB DESCRIPTION:
${data.jobDescription || "Not provided"}

DETERMINISTIC ANALYSIS (computed by our engine — use it to stay specific):
- ATS score: ${data.score}/100
- Missing JD keywords: ${data.missingKeywords?.join(", ") || "none"}
- Missing in-demand skills: ${data.missingSkills?.join(", ") || "none"}
- Weak sections: ${data.weakSections?.join("; ") || "none"}

TASK: Produce personalized recommendations based ONLY on what is actually in this resume and this job description. Do NOT give generic advice that ignores the resume. For every suggestion, reference the actual resume section, bullet, or missing skill it concerns.

OUTPUT — return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{
  "summary": "1-2 sentence honest overall assessment.",
  "strengths": ["3-5 genuine strengths found in the resume"],
  "suggestions": [
    {
      "priority": "critical" | "high" | "medium" | "low",
      "category": "missing-skill" | "keyword-gap" | "weak-bullet" | "weak-summary" | "formatting" | "section" | "content" | "recruiter-tip",
      "problem": "The specific problem, referencing the actual resume text or the missing item.",
      "reason": "Why this matters for ATS screening and recruiters (short and specific).",
      "exampleFix": "A concrete, ready-to-paste rewrite or the exact keyword/phrase to add.",
      "expectedImprovement": "The realistic ATS impact, e.g. keyword-match percentage increase or which screening stage it helps with."
    }
  ],
  "recruiterTips": ["2-4 short recruiter-facing tips unique to this resume and JD"]
}

RULES:
- Return at most 10 suggestions. Order by priority: critical first (missing required skills or experience, broken layout, missing key sections), then high, then medium, then low.
- Every suggestion MUST be personalized: reference concrete resume content or concrete job-description requirements. Absolutely no generic filler such as "quantify your achievements" unless you point to a specific line that needs it.
- "exampleFix" must be a specific replacement text or the exact keyword/phrase to add.
- Keep every string concise and professional.`,

  ATS_IMPROVE_SUMMARY: (data) => `You are a senior resume writer. Rewrite the PROFESSIONAL SUMMARY of the resume below so it is stronger for the specific job description.

CURRENT SUMMARY:
${data.original || "(no summary found)"}

FULL RESUME CONTEXT:
${data.resumeContent}

TARGET JOB DESCRIPTION:
${data.jobDescription || "(not provided)"}

RULES:
- Write 2-3 punchy sentences: role, years of experience, top skills matched to the job description, and one measurable strength.
- Naturally weave in relevant keywords from the job description.
- No first person ("I"), no fluff, no invented credentials — only reflect the facts already in the resume.

OUTPUT: Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{"original":"<exact current summary you were given>","improved":"<new summary text>","explanation":"<2-3 sentences: what changed and why it helps>","scoreIncrease":<integer 0-15, realistic estimated ATS score gain>}`,

  ATS_IMPROVE_BULLETS: (data) => `You are a senior resume writer. Strengthen the WORK EXPERIENCE bullets of the resume below for the target role.

CURRENT WORK EXPERIENCE SECTION:
${data.original || "(no experience content found)"}

FULL RESUME CONTEXT:
${data.resumeContent}

TARGET JOB DESCRIPTION:
${data.jobDescription || "(not provided)"}

RULES:
- Keep the same job titles, employers, and dates EXACTLY as given.
- Rewrite each bullet to be achievement-oriented: start with a strong action verb (built, led, designed, reduced, shipped, automated...), add metrics/outcomes where the facts allow, and weave in relevant job-description keywords naturally.
- Keep the exact bullet markers (- or •). Each bullet should be roughly 1-1.5 lines.
- Do NOT invent facts that are not implied by the resume.

OUTPUT: Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{"original":"<exact section text you were given>","improved":"<the full improved experience section, headings and bullets included>","explanation":"<2-3 sentences: what changed and why>","scoreIncrease":<integer 0-15>}`,

  ATS_IMPROVE_PROJECTS: (data) => `You are a senior resume writer. Improve the PROJECT descriptions in the resume below so they show impact and technical depth for the target role.

CURRENT PROJECTS SECTION:
${data.original || "(no projects section found)"}

FULL RESUME CONTEXT:
${data.resumeContent}

TARGET JOB DESCRIPTION:
${data.jobDescription || "(not provided)"}

RULES:
- Keep the same project names. Rewrite each project to include: what it does, the technologies used (from the job description where applicable), and the outcome or scale (users, performance, revenue) where the facts allow.
- Use concise bullets or 1-2 short lines per project. Start bullets with strong action verbs.
- Do NOT invent facts that are not implied by the resume.

OUTPUT: Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{"original":"<exact section text you were given>","improved":"<the full improved projects section>","explanation":"<what changed and why>","scoreIncrease":<integer 0-15>}`,

  ATS_IMPROVE_SKILLS: (data) => `You are a senior resume writer. Improve the SKILLS section below so it is well-organized and matches the target role.

CURRENT SKILLS SECTION:
${data.original || "(no skills section found)"}

FULL RESUME CONTEXT:
${data.resumeContent}

TARGET JOB DESCRIPTION:
${data.jobDescription || "(not provided)"}

MISSING IN-DEMAND SKILLS FROM THE JOB DESCRIPTION:
${data.missingSkills?.join(", ") || "none"}

RULES:
- Reorganize skills into clear, grouped lines (e.g., "Languages:", "Frameworks & Libraries:", "Tools & Platforms:", "Soft Skills:"). Use comma-separated lists.
- Naturally add the missing in-demand skills from the job description that align with the candidate's background and experience. Do not add unrelated skills.
- Keep it scannable for ATS: include both acronym and full name where helpful (e.g., "CI/CD (Continuous Integration/Continuous Deployment)").

OUTPUT: Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{"original":"<exact section text you were given>","improved":"<full improved skills section>","explanation":"<what changed and why>","scoreIncrease":<integer 0-15>}`,

  ATS_ADD_KEYWORDS: (data) => `You are an ATS optimization expert. Update the resume below so it contains the job-description keywords naturally, without breaking its quality.

RESUME:
${data.resumeContent}

TARGET JOB DESCRIPTION:
${data.jobDescription || "(not provided)"}

MISSING KEYWORDS TO WEAVE IN:
${data.missingKeywords?.join(", ") || "none"}
MISSING SKILLS TO WEAVE IN:
${data.missingSkills?.join(", ") || "none"}

RULES:
- Rewrite the resume so every relevant missing keyword and skill appears naturally in the summary, experience bullets, skills, or projects.
- Keep the person's name, contact info, job titles, employers, and dates EXACTLY as given. Do not change facts.
- Do NOT stuff keywords — they must read naturally. Preserve all existing sections, bullets, and formatting.
- Return the complete resume text.

OUTPUT: Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{"original":"<full original resume>","improved":"<full improved resume>","explanation":"<what was added and where>","scoreIncrease":<integer 0-15>}`,

  ATS_REWRITE_ACHIEVEMENTS: (data) => `You are a senior resume writer. Rewrite the achievements and bullet points below using strong action verbs and measurable results.

CURRENT ACHIEVEMENTS / BULLETS:
${data.original || "(no achievements section found)"}

FULL RESUME CONTEXT:
${data.resumeContent}

TARGET JOB DESCRIPTION:
${data.jobDescription || "(not provided)"}

RULES:
- Every bullet must start with a strong action verb.
- Wherever the facts support it, add a metric, percentage, volume, or outcome (e.g., "reduced load time by 45%", "served 10M requests/day").
- Remove weak phrasing ("worked on", "helped", "responsible for", "participated").
- Keep the same section heading and bullet markers. Do not invent facts.

OUTPUT: Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{"original":"<exact content you were given>","improved":"<improved achievements content, heading included if present>","explanation":"<what changed and why>","scoreIncrease":<integer 0-15>}`,

  ATS_IMPROVE_GRAMMAR: (data) => `You are a meticulous editor. Fix the grammar, spelling, punctuation, capitalization, spacing, and readability of the resume below.

RESUME:
${data.resumeContent}

RULES:
- Fix typos, grammar, punctuation, inconsistent capitalization and double spaces.
- Improve readability: break up very long sentences, keep bullet punctuation consistent, and keep date formatting consistent.
- Do NOT change facts, job titles, employers, dates, skills, or the section structure.
- Return the complete corrected resume.

OUTPUT: Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{"original":"<full original resume>","improved":"<full corrected resume>","explanation":"<summary of the main corrections>","scoreIncrease":<integer 0-10>}`,

  ATS_BETTER_TITLE: (data) => `You are a resume expert. Suggest a compelling professional headline/title for the resume below that targets the job description.

CURRENT TITLE (first line):
${data.original || "(no title found)"}

FULL RESUME CONTEXT:
${data.resumeContent}

TARGET JOB DESCRIPTION:
${data.jobDescription || "(not provided)"}

RULES:
- Create one clear, ATS-friendly headline line that combines the role, seniority, top 1-3 skills, and optionally a domain (e.g., "Senior Software Engineer | React, Node.js & AWS").
- Use keywords from the job description. Maximum 12 words. Do NOT invent credentials.

OUTPUT: Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{"original":"<the current first line>","improved":"<the suggested headline, plain text>","explanation":"<why this headline helps>","scoreIncrease":<integer 0-5>}`,

  ATS_OPTIMIZE_RESUME: (data) => `You are a senior resume writer and ATS optimization expert. Rewrite the entire resume below to maximize its fit for the target job description while keeping it honest and high quality.

RESUME:
${data.resumeContent}

TARGET JOB DESCRIPTION:
${data.jobDescription || "(not provided)"}

CURRENT ATS SCORE: ${data.currentScore ?? "n/a"}/100
MISSING KEYWORDS: ${data.missingKeywords?.join(", ") || "none"}
MISSING SKILLS: ${data.missingSkills?.join(", ") || "none"}

RULES:
- Produce a polished, complete resume optimized for this job: a strong professional headline under the name, an excellent professional summary, achievement-oriented experience bullets with strong action verbs and metrics, improved project descriptions, and a well-organized skills section that naturally includes the relevant missing skills and keywords.
- Keep the person's name, contact info, job titles, employers, dates, and all real facts EXACTLY. Do not fabricate credentials.
- Use clear section headings and consistent formatting. Return the complete resume text.

OUTPUT: Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{"original":"<full original resume>","improved":"<full optimized resume>","explanation":"<summary of the biggest changes and expected impact>","scoreIncrease":<integer 0-20>}`,

  INTERVIEW_QUESTIONS: (data) => {
    const jobTitle = data.jobTitle || data.title || data.role || "Professional";
    const level = data.experienceLevel || inferExperienceLevel(jobTitle);
    const levelLabel = EXPERIENCE_LABELS[level] || "Mid-level";
    const roleGuidance = buildRoleGuidance(jobTitle);

    const technicalCount = level === "senior" ? 16 : level === "junior" ? 14 : 15;
    const split =
      level === "senior"
        ? "core concepts (3), practical coding problems (3), real-world scenarios (1), system design (3), debugging & optimization (2), best practices (2), framework/library-specific (2)"
        : level === "junior"
        ? "core concepts (3), practical coding problems (3), real-world scenarios (3), one lightweight system-design question (1), debugging & optimization (2), best practices (1), framework/library-specific (1)"
        : "core concepts (3), practical coding problems (3), real-world scenarios (2), system design (2), debugging & optimization (2), best practices (2), framework/library-specific (1)";

    return `You are a senior technical interviewer preparing a candidate for the role: "${jobTitle}".

Candidate experience level: ${levelLabel}. ${level === "senior" ? "Questions must be advanced and probe depth, architecture decisions, and trade-offs." : level === "junior" ? "Questions must be appropriate for this level — no trick questions, and the system-design question should be lightweight." : ""}

TASK: Generate a focused set of professional, role-specific interview questions with concise model answers.

ROLE FOCUS:
${roleGuidance}

QUESTION MIX — return ${technicalCount + 2} questions total:
- "technical": ${technicalCount} questions, allocated as: ${split}. Keep this balanced mix inside the technical array, in this order.
- "behavioral": 1 short, job-relevant behavioral question (a quick round — not a generic HR question).
- "situational": 1 short, job-relevant situational question (tied to the realities of this role).

RULES:
- Every question must be unique, specific, professional, and interview-ready — a clean, complete sentence (or a short coding directive). No generic filler such as "Tell me about yourself" or "What are your strengths and weaknesses?" in the technical array.
- Questions must read as natural plain text — never look like JSON, arrays, code blocks, or raw AI output.
- Reflect current, industry-standard technologies and practices (2025-2026).
- Coding problems must be realistic interview problems; include the expected approach and typical edge cases in the answer.
- Answers must be concise and useful: 2-4 sentences, or a short list of 2-4 key points. Plain text with optional "**" bold and "-" bullets is fine (the UI renders those).

OUTPUT: Return ONLY valid JSON with no markdown fences and no text before or after. Exact shape:
{"technical":[{"question":"...","answer":"..."}],"behavioral":[{"question":"...","answer":"..."}],"situational":[{"question":"...","answer":"..."}]}

Each array holds objects with exactly two keys: "question" and "answer".`;
  },

  REGENERATE_ANSWER: (data) => `You are a senior interview coach helping a candidate prepare for the role "${data.role || data.jobTitle || "Professional"}".

Interview question:
${data.question}

Current AI-suggested answer:
${data.answer || "No answer yet."}

TASK: Write a completely fresh, higher-quality answer to the SAME question. Improve clarity, structure, depth, and interview impact. Do NOT repeat the previous answer verbatim — make it noticeably better. Use 2-4 sentences, or a short list of 2-4 key points. Optional "**" for emphasis and "-" for bullets (the UI renders those).

Return ONLY the answer as plain text — no JSON, no arrays, no markdown fences, no headers.`,

  SHORTER_ANSWER: (data) => `You are a senior interview coach helping a candidate prepare for the role "${data.role || data.jobTitle || "Professional"}".

Interview question:
${data.question}

Original answer:
${data.answer || ""}

TASK: Rewrite the answer into a concise, interview-ready version — 2-3 sentences maximum. Keep every key point and the core meaning without losing substance; remove fluff, repetition, and filler. Optional "**" for emphasis.

Return ONLY the concise answer as plain text — no JSON, no arrays, no markdown fences, no headers.`,

  PROFESSIONAL_ANSWER: (data) => `You are a senior interview coach helping a candidate prepare for the role "${data.role || data.jobTitle || "Professional"}".

Interview question:
${data.question}

Current answer:
${data.answer || ""}

TASK: Rewrite the answer using polished, senior-level, professional language suitable for a real interview. Sound confident, well-structured, and precise. Keep it to 3-5 sentences or a short list of 3-5 key points. Optional "**" for emphasis and "-" for bullets.

Return ONLY the rewritten answer as plain text — no JSON, no arrays, no markdown fences, no headers.`,

  EXPLAIN_ANSWER: (data) => `You are a technical mentor explaining an interview answer in depth to a candidate preparing for the role "${data.role || data.jobTitle || "Professional"}".

Interview question:
${data.question}

Answer to explain:
${data.answer || ""}

TASK: Explain the answer step by step. Provide:
1. overview: what the core concept is and why it matters for this question.
2. steps: a step-by-step breakdown of how the answer works / how to approach the question.
3. example: one concrete, realistic example.
4. bestPractices: 2-4 practical best practices.
5. commonMistakes: 2-4 common mistakes candidates make.

Return ONLY valid JSON with no markdown fences:
{"overview":"...","steps":["...","..."],"example":"...","bestPractices":["...","..."],"commonMistakes":["...","..."]}

Steps, bestPractices, and commonMistakes must be arrays of short strings. Keep every string concise and genuinely useful.`,

  PRACTICE_INTERVIEW: (data) => `You are an expert interviewer evaluating a candidate's answer during a mock interview for the role "${data.role || data.jobTitle || "Professional"}".

Interview question:
${data.question}

Candidate's answer:
${data.candidateAnswer || "The candidate did not provide an answer."}

Evaluate the answer honestly and constructively. Score it on relevance, clarity, structure, depth, and confidence.

Return ONLY valid JSON with no markdown fences:
{
  "score": number from 0 to 100,
  "feedback": "1-2 sentence overall assessment",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "improvements": ["...", "..."],
  "idealAnswer": "a strong model answer to the question"
}

Guidance: strengths and weaknesses should each have 2-4 specific points; improvements should be 3-4 actionable steps; idealAnswer should be 3-6 sentences or a short bulleted list.`,

  CAREER_SUGGESTIONS: (data) => `Based on the following profile, provide career path suggestions and recommendations.

Current role: ${data.title}
Skills: ${data.skills || "Not specified"}
Experience: ${data.experience || "Not specified"}
Interests: ${data.interests || "Not specified"}
${data.jobCategory ? `\nIndustry category: ${data.jobCategory}` : ""}

Return a JSON object with: suggestedRoles (array of objects with title, description, requiredSkills), learningPath (array of objects with skill, resource, priority), growthTips (array of strings).`,
};

export async function callGroq(prompt) {
  const apiKey = process.env.OpenRouter_Api_Key;
  if (!apiKey) {
    throw new Error("AI service not configured: missing OpenRouter API key");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Resumate",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const detail = error?.error?.message || error?.message || JSON.stringify(error);
      throw new Error(`AI request failed: ${detail}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("No response from AI");

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export function parseJSONResponse(text) {
  // If the model returned pure JSON (no fences, no surrounding prose), parse it directly.
  const direct = typeof text === "string" ? text.trim() : "";
  if ((direct.startsWith("{") && direct.endsWith("}")) || (direct.startsWith("[") && direct.endsWith("]"))) {
    try {
      return JSON.parse(direct);
    } catch { /* fall through to the fallbacks below */ }
  }

  // Try extracting from markdown code block first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch { /* fall through */ }
  }

  // Try finding the first complete JSON object
  const start = text.indexOf("{");
  if (start !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (escape) { escape = false; continue; }
      if (c === "\\") { escape = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (c === "{") depth++;
      if (c === "}") depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch { break; }
      }
    }
  }

  // Try finding a JSON array
  const arrStart = text.indexOf("[");
  if (arrStart !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = arrStart; i < text.length; i++) {
      const c = text[i];
      if (escape) { escape = false; continue; }
      if (c === "\\") { escape = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (c === "[") depth++;
      if (c === "]") depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(arrStart, i + 1));
        } catch { break; }
      }
    }
  }

  return text;
}

export async function generateAIContent(type, data) {
  const promptFn = AI_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown AI type: ${type}`);

  const prompt = promptFn(data);
  const response = await callGroq(prompt);

  try {
    return parseJSONResponse(response);
  } catch {
    return response;
  }
}
