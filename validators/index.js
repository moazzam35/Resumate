import { z } from "zod";
import { PHONE_PATTERN } from "@/lib/utils";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const personalInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .min(7, "Phone number is required")
    .regex(PHONE_PATTERN, "Enter a valid phone number"),
  location: z.string().optional(),
  title: z.string().min(2, "Job title is required"),
  summary: z.string().min(50, "Professional summary must be at least 50 characters"),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  portfolio: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export const experienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  gpa: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  technologies: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const certificateSchema = z.object({
  name: z.string().min(1, "Certificate name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  date: z.string().optional(),
});

export const languageSchema = z.object({
  name: z.string().min(1, "Language name is required"),
  proficiency: z
    .enum(["BASIC", "CONVERSATIONAL", "FLUENT", "NATIVE", "PROFESSIONAL"])
    .optional(),
});

export const achievementSchema = z.object({
  title: z.string().min(1, "Achievement title is required"),
  description: z.string().optional(),
  date: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const coverLetterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().optional(),
  position: z.string().optional(),
  content: z.string().min(50, "Content must be at least 50 characters"),
  template: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  portfolio: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ---------------------------------------------------------------------------
// Resume sub-resource schemas.
//
// These run on the server side of /api/resumes/:id/{section} POST/PUT routes.
// Dates are coerced to real Date objects (invalid dates are rejected), empty
// strings map to null for optional fields, and boolean-looking strings are
// coerced so a client that serializes `isCurrent` as "true" still stores a
// real boolean.
// ---------------------------------------------------------------------------

const dateOrNull = z.preprocess((v) => {
  if (v === "" || v === null || v === undefined) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}, z.date().nullable());

const requiredDate = z.preprocess((v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
}, z.date());

const boolish = z.preprocess((v) => {
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return v;
}, z.boolean());

const urlField = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.string().url("Must be a valid URL").nullable().optional()
);

const nullableString = z.string().nullable().optional();

export const createExperienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: nullableString,
  type: nullableString,
  startDate: requiredDate,
  endDate: dateOrNull,
  isCurrent: boolish.optional().default(false),
  description: nullableString,
  highlights: z.array(z.string()).optional().default([]),
});

export const updateExperienceSchema = z.object({
  itemId: z.string().min(1).optional(),
  company: z.string().min(1, "Company name is required").optional(),
  position: z.string().min(1, "Position is required").optional(),
  location: nullableString,
  type: nullableString,
  startDate: requiredDate.optional(),
  endDate: dateOrNull,
  isCurrent: boolish.optional(),
  description: nullableString,
  highlights: z.array(z.string()).optional(),
  order: z.number().int().optional(),
});

export const createEducationSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: nullableString,
  location: nullableString,
  startDate: requiredDate,
  endDate: dateOrNull,
  isCurrent: boolish.optional().default(false),
  gpa: nullableString,
  highlights: z.array(z.string()).optional().default([]),
});

export const updateEducationSchema = z.object({
  itemId: z.string().min(1).optional(),
  institution: z.string().min(1, "Institution name is required").optional(),
  degree: z.string().min(1, "Degree is required").optional(),
  field: nullableString,
  location: nullableString,
  startDate: requiredDate.optional(),
  endDate: dateOrNull,
  isCurrent: boolish.optional(),
  gpa: nullableString,
  highlights: z.array(z.string()).optional(),
  order: z.number().int().optional(),
});

export const createSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: nullableString,
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
});

export const updateSkillSchema = z.object({
  itemId: z.string().min(1).optional(),
  name: z.string().min(1, "Skill name is required").optional(),
  category: nullableString,
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
  order: z.number().int().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: nullableString,
  url: urlField,
  github: urlField,
  technologies: z.array(z.string()).optional().default([]),
  highlights: z.array(z.string()).optional().default([]),
  startDate: dateOrNull,
  endDate: dateOrNull,
});

export const updateProjectSchema = z.object({
  itemId: z.string().min(1).optional(),
  name: z.string().min(1, "Project name is required").optional(),
  description: nullableString,
  url: urlField,
  github: urlField,
  technologies: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  startDate: dateOrNull,
  endDate: dateOrNull,
  order: z.number().int().optional(),
});

export const createCertificateSchema = z.object({
  name: z.string().min(1, "Certificate name is required"),
  issuer: z.string().min(1, "Issuer is required"),
  url: urlField,
  date: dateOrNull,
});

export const updateCertificateSchema = z.object({
  itemId: z.string().min(1).optional(),
  name: z.string().min(1, "Certificate name is required").optional(),
  issuer: z.string().min(1, "Issuer is required").optional(),
  url: urlField,
  date: dateOrNull,
  order: z.number().int().optional(),
});

export const createLanguageSchema = z.object({
  name: z.string().min(1, "Language name is required"),
  proficiency: z
    .enum(["BASIC", "CONVERSATIONAL", "FLUENT", "NATIVE", "PROFESSIONAL"])
    .optional(),
});

export const updateLanguageSchema = z.object({
  itemId: z.string().min(1).optional(),
  name: z.string().min(1, "Language name is required").optional(),
  proficiency: z
    .enum(["BASIC", "CONVERSATIONAL", "FLUENT", "NATIVE", "PROFESSIONAL"])
    .optional(),
  order: z.number().int().optional(),
});

export const createAchievementSchema = z.object({
  title: z.string().min(1, "Achievement title is required"),
  description: nullableString,
  date: dateOrNull,
  url: urlField,
});

export const updateAchievementSchema = z.object({
  itemId: z.string().min(1).optional(),
  title: z.string().min(1, "Achievement title is required").optional(),
  description: nullableString,
  date: dateOrNull,
  url: urlField,
  order: z.number().int().optional(),
});

/** Parse a request body against a schema and return a 422 on failure. */
export function parseWithSchema(body, schema) {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      ok: false,
      response: {
        error: "Validation failed",
        errors: result.error.flatten().fieldErrors,
        status: 422,
      },
    };
  }
  return { ok: true, data: result.data };
}
