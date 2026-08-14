import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { checkResumeCompletion } from "@/lib/utils";

export async function GET(request, { params }) {
  try {
    const { userId } = await authenticate(request);

    const { id } = await params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        experiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
        certificates: { orderBy: { order: "asc" } },
        languages: { orderBy: { order: "asc" } },
        achievements: { orderBy: { order: "asc" } },
        sectionOrder: { orderBy: { order: "asc" } },
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    if (resume.personalInfo && typeof resume.personalInfo === "object") {
      const pi = resume.personalInfo;
      if (pi.jobTitle && pi.title === undefined) {
        resume.personalInfo = { ...pi, title: pi.jobTitle };
      }
    }

    return NextResponse.json({ resume });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Get resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = await authenticate(request);

    const { id } = await params;
    const body = await request.json();

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
      include: {
        experiences: true,
        educations: true,
        skills: true,
        projects: true,
        certificates: true,
        languages: true,
        achievements: true,
        sectionOrder: true,
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    const personalInfoFields = ["name", "email", "phone", "location", "linkedin", "github", "portfolio"];
    const allowedFields = ["title", "template", "colorTheme", "design", "isPublic", "atsScore"];
    const sanitized = {};

    // Object-style personalInfo (sent by the editor). The job title lives at
    // `personalInfo.title` on the client and in templates, so keep that key.
    if (body.personalInfo && typeof body.personalInfo === "object") {
      const pi = { ...(resume.personalInfo || {}) };
      for (const [key, value] of Object.entries(body.personalInfo)) {
        if (value === undefined) continue;
        pi[key] = value;
      }
      sanitized.personalInfo = pi;
    } else if (personalInfoFields.some((f) => f in body) || "title" in body || "summary" in body) {
      // Legacy flat format: top-level `title` is the job title.
      const pi = { ...(resume.personalInfo || {}) };
      for (const f of personalInfoFields) {
        if (f in body) pi[f] = body[f];
      }
      if ("title" in body) pi.title = body.title;
      if ("summary" in body) sanitized.summary = body.summary;
      if (Object.keys(pi).length > 0) {
        sanitized.personalInfo = pi;
      }
    }

    if (body.summary !== undefined && sanitized.summary === undefined) {
      sanitized.summary = body.summary;
    }

    for (const key of allowedFields) {
      if (key in body) sanitized[key] = body[key];
    }
    sanitized.lastAutosave = new Date();

    const mergedResume = {
      ...resume,
      ...sanitized,
      personalInfo: sanitized.personalInfo || resume.personalInfo || {},
      summary: sanitized.summary !== undefined ? sanitized.summary : resume.summary,
      experiences: body.experiences !== undefined ? body.experiences : resume.experiences,
      educations: body.educations !== undefined ? body.educations : resume.educations,
      skills: body.skills !== undefined ? body.skills : resume.skills,
      projects: body.projects !== undefined ? body.projects : resume.projects,
      certificates: body.certificates !== undefined ? body.certificates : resume.certificates,
      languages: body.languages !== undefined ? body.languages : resume.languages,
      achievements: body.achievements !== undefined ? body.achievements : resume.achievements,
    };

    const { complete } = checkResumeCompletion(mergedResume);
    sanitized.status = complete ? "COMPLETED" : "DRAFT";

    const ARRAY_MODELS = {
      experiences: {
        fields: ["company", "position", "location", "type", "startDate", "endDate", "isCurrent", "description", "highlights", "order"],
        dateFields: ["startDate", "endDate"],
      },
      educations: {
        fields: ["institution", "degree", "field", "location", "startDate", "endDate", "isCurrent", "gpa", "highlights", "order"],
        dateFields: ["startDate", "endDate"],
      },
      skills: {
        fields: ["name", "category", "level", "order"],
        dateFields: [],
      },
      projects: {
        fields: ["name", "description", "url", "github", "technologies", "highlights", "startDate", "endDate", "order"],
        dateFields: ["startDate", "endDate"],
      },
      certificates: {
        fields: ["name", "issuer", "url", "date", "order"],
        dateFields: ["date"],
      },
      languages: {
        fields: ["name", "proficiency", "order"],
        dateFields: [],
      },
      achievements: {
        fields: ["title", "description", "date", "url", "order"],
        dateFields: ["date"],
      },
      sectionOrder: {
        fields: ["section", "order", "isVisible"],
        dateFields: [],
      },
    };

    const deleteModelByResume = {
      experiences: () => prisma.experience.deleteMany({ where: { resumeId: id } }),
      educations: () => prisma.education.deleteMany({ where: { resumeId: id } }),
      skills: () => prisma.skill.deleteMany({ where: { resumeId: id } }),
      projects: () => prisma.project.deleteMany({ where: { resumeId: id } }),
      certificates: () => prisma.certificate.deleteMany({ where: { resumeId: id } }),
      languages: () => prisma.language.deleteMany({ where: { resumeId: id } }),
      achievements: () => prisma.achievement.deleteMany({ where: { resumeId: id } }),
      sectionOrder: () => prisma.sectionOrder.deleteMany({ where: { resumeId: id } }),
    };

    const createModelMany = {
      experiences: (data) => prisma.experience.createMany({ data }),
      educations: (data) => prisma.education.createMany({ data }),
      skills: (data) => prisma.skill.createMany({ data }),
      projects: (data) => prisma.project.createMany({ data }),
      certificates: (data) => prisma.certificate.createMany({ data }),
      languages: (data) => prisma.language.createMany({ data }),
      achievements: (data) => prisma.achievement.createMany({ data }),
      sectionOrder: (data) => prisma.sectionOrder.createMany({ data }),
    };

    // Reconcile any editable arrays that were included in the request.
    // Each array is fully replaced to match the editor's state.
    const ops = [];
    for (const [arrayKey, config] of Object.entries(ARRAY_MODELS)) {
      if (!Array.isArray(body[arrayKey])) continue;

      const rows = body[arrayKey].map((item, index) => {
        const row = { resumeId: id };
        if (item && typeof item.id === "string") row.id = item.id;
        for (const field of config.fields) {
          if (item && item[field] !== undefined) {
            if (config.dateFields.includes(field)) {
              row[field] = item[field] ? new Date(item[field]) : null;
            } else {
              row[field] = item[field];
            }
          }
        }
        if (!("order" in row)) row.order = index;
        return row;
      });

      ops.push(deleteModelByResume[arrayKey]());
      if (rows.length) ops.push(createModelMany[arrayKey](rows));
    }

    if (ops.length) {
      await prisma.$transaction(
        [
          prisma.resume.update({ where: { id }, data: sanitized }),
          ...ops,
        ],
        { timeout: 30000 }
      );
    } else {
      await prisma.resume.update({ where: { id }, data: sanitized });
    }

    const updated = await prisma.resume.findUnique({
      where: { id },
      include: {
        experiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
        certificates: { orderBy: { order: "asc" } },
        languages: { orderBy: { order: "asc" } },
        achievements: { orderBy: { order: "asc" } },
        sectionOrder: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ resume: updated });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Update resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = await authenticate(request);

    const { id } = await params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    await prisma.resume.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Delete resume error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
