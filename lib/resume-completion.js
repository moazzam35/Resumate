/**
 * Single source of truth for resume section completion.
 *
 * Used by the resume editor sidebar, the completion card, export readiness,
 * the dashboard, and every server route that recomputes resume status.
 * Everything derives from the actual resume data — never from temporary UI
 * state (e.g. "this step was visited") and never from the mere existence of
 * a row/object/array.
 *
 * A section only counts as complete when it contains real, user-entered,
 * meaningful content. Empty strings, whitespace-only strings, empty arrays,
 * `[{}]`, `[""]`, `[null]`, `{}` and placeholder objects are never complete.
 */

export const PHONE_PATTERN = /^\+?[\d\s\-()]{7,18}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return EMAIL_PATTERN.test(email.trim());
}

function isValidPhone(phone) {
  if (typeof phone !== "string") return false;
  const value = phone.trim();
  return value.length > 0 && PHONE_PATTERN.test(value);
}

function toTrimmed(value) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Robust meaningful-content detection.
 *
 * Returns true only when a value contains actual content. Handles:
 *   null, undefined, "", "   ", [], [{}], [""], [null], {}
 * All of those return false. Nested objects/arrays are inspected recursively.
 */
export function hasMeaningfulValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulValue(item));
  if (typeof value === "object") {
    return Object.values(value).some((item) => hasMeaningfulValue(item));
  }
  return false;
}

/**
 * True when an array item carries meaningful user-entered data in every one
 * of its identity/anchor fields. Items like { company: "", position: "" } or
 * { name: "" } never count, regardless of how many rows exist.
 */
function itemHasMeaningfulAnchor(item, anchorFields) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return false;
  return anchorFields.every((field) => hasMeaningfulValue(item[field]));
}

// Identity fields per section. These mirror the product's required fields
// (see validators/index.js and prisma/schema.prisma).
const ITEM_ANCHOR_FIELDS = {
  experiences: ["company", "position"],
  educations: ["institution", "degree"],
  skills: ["name"],
  projects: ["name"],
  certificates: ["name"],
  languages: ["name"],
  achievements: ["title"],
};

function hasMeaningfulItem(resume, arrayKey) {
  const items = Array.isArray(resume?.[arrayKey]) ? resume[arrayKey] : [];
  const anchors = ITEM_ANCHOR_FIELDS[arrayKey] || [];
  return items.some((item) => itemHasMeaningfulAnchor(item, anchors));
}

/**
 * The eight tracked resume-content sections, in sidebar order.
 *
 * `required` drives export readiness (isReady). ATS Score and Live Preview are
 * NOT content sections and are intentionally absent from this list — an ATS
 * result is analysis output, never proof that a resume section was filled in.
 */
export const RESUME_CONTENT_SECTIONS = [
  { id: "personal", label: "Personal Info", required: true },
  { id: "experience", label: "Work Experience", required: true },
  { id: "education", label: "Education", required: true },
  { id: "skills", label: "Skills & Keywords", required: true },
  { id: "projects", label: "Projects", required: false },
  { id: "certificates", label: "Certifications", required: false },
  { id: "languages", label: "Languages", required: false },
  { id: "achievements", label: "Achievements", required: false },
];

const REQUIRED_MISSING_LABELS = [
  "Personal Information",
  "Professional Summary",
  "Work Experience or Projects",
  "Education",
  "Skills",
];

/**
 * Compute the completion status of a resume from its real content.
 *
 * Returns:
 *   status      { personalInfo, summary, personal, experience, education,
 *                 skills, projects, certificates, languages, achievements }
 *               Per-section booleans. `personal` is the combined Personal Info
 *               step (personalInfo AND summary); the granular keys let callers
 *               show exactly which part is missing.
 *   completed   Number of the 8 tracked content sections that are complete.
 *   total       8 (ATS Score / Live Preview are not content sections).
 *   percentage  Math.round((completed / total) * 100), clamped to [0, 100].
 *   isReady     True when every REQUIRED core area is complete. Work
 *               Experience OR Projects satisfies the "experience" requirement.
 *   missing     Human-readable labels of the missing required areas.
 */
export function getResumeSectionStatus(resume) {
  const emptyStatus = {
    personalInfo: false,
    summary: false,
    personal: false,
    experience: false,
    education: false,
    skills: false,
    projects: false,
    certificates: false,
    languages: false,
    achievements: false,
  };

  if (!resume || typeof resume !== "object") {
    return {
      status: emptyStatus,
      completed: 0,
      total: RESUME_CONTENT_SECTIONS.length,
      percentage: 0,
      isReady: false,
      missing: [...REQUIRED_MISSING_LABELS],
    };
  }

  const pi = resume.personalInfo || {};
  const personalInfo =
    toTrimmed(pi.name).length >= 2 &&
    isValidEmail(pi.email) &&
    isValidPhone(pi.phone) &&
    toTrimmed(pi.title).length >= 2;

  const summary = toTrimmed(resume.summary || pi.summary);
  const summaryOk = summary.length >= 50;

  const experience = hasMeaningfulItem(resume, "experiences");
  const education = hasMeaningfulItem(resume, "educations");

  const meaningfulSkills = (Array.isArray(resume.skills) ? resume.skills : []).filter(
    (skill) => itemHasMeaningfulAnchor(skill, ITEM_ANCHOR_FIELDS.skills)
  );
  const skills = meaningfulSkills.length >= 3;

  const projects = hasMeaningfulItem(resume, "projects");
  const certificates = hasMeaningfulItem(resume, "certificates");
  const languages = hasMeaningfulItem(resume, "languages");
  const achievements = hasMeaningfulItem(resume, "achievements");

  const personal = personalInfo && summaryOk;

  const status = {
    personalInfo,
    summary: summaryOk,
    personal,
    experience,
    education,
    skills,
    projects,
    certificates,
    languages,
    achievements,
  };

  const tracked = [
    personal,
    experience,
    education,
    skills,
    projects,
    certificates,
    languages,
    achievements,
  ];

  const completed = tracked.filter(Boolean).length;
  const total = RESUME_CONTENT_SECTIONS.length;
  const rawPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const percentage = Math.min(100, Math.max(0, rawPercentage));

  const missing = [];
  if (!personalInfo) missing.push(REQUIRED_MISSING_LABELS[0]);
  if (!summaryOk) missing.push(REQUIRED_MISSING_LABELS[1]);
  if (!experience && !projects) missing.push(REQUIRED_MISSING_LABELS[2]);
  if (!education) missing.push(REQUIRED_MISSING_LABELS[3]);
  if (!skills) missing.push(REQUIRED_MISSING_LABELS[4]);

  return {
    status,
    completed,
    total,
    percentage,
    isReady: missing.length === 0,
    missing,
  };
}

/**
 * Backward-compatible readiness check used by export gating and persisted
 * resume status. Complete == every required core area is filled.
 */
export function checkResumeCompletion(resume) {
  const { isReady, missing } = getResumeSectionStatus(resume);
  return { complete: isReady, missing };
}

/**
 * Wizard navigation check for the editor. Decides whether the current step's
 * minimum requirements are met so the user can unlock the next step.
 *
 * Optional sections (Certifications, Languages, Achievements), ATS Score and
 * Live Preview are always navigable (valid: true) — they may be skipped and
 * must not block progress. Completion display is a separate concern handled by
 * getResumeSectionStatus.
 */
export function getStepStatus(resume, stepId) {
  if (!resume) return { valid: false, missing: [] };

  const status = getResumeSectionStatus(resume).status;

  switch (stepId) {
    case "personal": {
      const pi = resume.personalInfo || {};
      const summary = toTrimmed(resume.summary || pi.summary);
      const checks = [
        ["Full Name", toTrimmed(pi.name).length >= 2],
        ["Valid Email", isValidEmail(pi.email)],
        ["Phone Number", isValidPhone(pi.phone)],
        ["Job Title", toTrimmed(pi.title).length >= 2],
        ["Professional Summary (50+ characters)", summary.length >= 50],
      ];
      const missing = checks.filter(([, ok]) => !ok).map(([label]) => label);
      return { valid: missing.length === 0, missing };
    }
    case "experience":
      if (status.experience || status.projects) return { valid: true, missing: [] };
      return { valid: false, missing: ["Add at least one work experience or project"] };
    case "education":
      return status.education
        ? { valid: true, missing: [] }
        : { valid: false, missing: ["Add at least one education entry"] };
    case "skills": {
      const meaningfulSkills = (Array.isArray(resume.skills) ? resume.skills : []).filter(
        (skill) => itemHasMeaningfulAnchor(skill, ITEM_ANCHOR_FIELDS.skills)
      );
      if (meaningfulSkills.length >= 3) return { valid: true, missing: [] };
      const remaining = 3 - meaningfulSkills.length;
      return {
        valid: false,
        missing: [`Add at least ${remaining} more skill${remaining === 1 ? "" : "s"}`],
      };
    }
    case "projects":
      if (status.projects || status.experience) return { valid: true, missing: [] };
      return { valid: false, missing: ["Add at least one project"] };
    default:
      return { valid: true, missing: [] };
  }
}
