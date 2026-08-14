export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { authenticateOptional } from "@/lib/middleware";
import { generateResumePDF } from "@/lib/pdf";
import { checkResumeCompletion } from "@/lib/utils";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const auth = await authenticateOptional(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { userId } = auth;
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
      },
    });

    if (!resume) {
      return NextResponse.json(
        { success: false, error: "Resume not found" },
        { status: 404 }
      );
    }

    // Never export a resume that isn't complete — this guarantees the PDF
    // always contains real data (no "Your Name" placeholders or blank pages)
    // regardless of which client triggers the download.
    const { complete, missing } = checkResumeCompletion(resume);
    if (!complete) {
      return NextResponse.json(
        {
          success: false,
          error: "Complete all required sections before downloading your PDF",
          missing,
        },
        { status: 422 }
      );
    }

    const pdfBuffer = await generateResumePDF(resume, {
      template: resume.template,
      colorTheme: resume.colorTheme,
      design: resume.design,
    });

    const safeName = (resume.title || "resume")
      .replace(/[^a-zA-Z0-9\s\-]/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 50);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("PDF download error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
