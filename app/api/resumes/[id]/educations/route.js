import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/middleware";
import {
  createEducationSchema,
  updateEducationSchema,
  parseWithSchema,
} from "@/validators";
import { recomputeResumeStatusSafe } from "@/lib/resume-status";

export async function GET(request, { params }) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) return auth.error;
    const { id } = await params;
    const resume = await prisma.resume.findFirst({ where: { id, userId: auth.userId } });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const items = await prisma.education.findMany({ where: { resumeId: id }, orderBy: { order: "asc" } });
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) return auth.error;
    const { id } = await params;
    const resume = await prisma.resume.findFirst({ where: { id, userId: auth.userId } });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = await request.json();
    const parsed = parseWithSchema(body, createEducationSchema);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.response.error, errors: parsed.response.errors },
        { status: parsed.response.status }
      );
    }
    const data = parsed.data;
    const maxOrder = await prisma.education.aggregate({ where: { resumeId: id }, _max: { order: true } });
    const item = await prisma.education.create({
      data: {
        resumeId: id,
        institution: data.institution,
        degree: data.degree,
        field: data.field,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: data.isCurrent,
        gpa: data.gpa,
        highlights: data.highlights,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
    await recomputeResumeStatusSafe(id);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) return auth.error;
    const { id } = await params;
    const body = await request.json();
    const parsed = parseWithSchema(body, updateEducationSchema);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.response.error, errors: parsed.response.errors },
        { status: parsed.response.status }
      );
    }
    const data = parsed.data;
    if (!data.itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    const resume = await prisma.resume.findFirst({ where: { id, userId: auth.userId } });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updateData = {};
    if (data.institution !== undefined) updateData.institution = data.institution;
    if (data.degree !== undefined) updateData.degree = data.degree;
    if (data.field !== undefined) updateData.field = data.field;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.isCurrent !== undefined) updateData.isCurrent = data.isCurrent;
    if (data.gpa !== undefined) updateData.gpa = data.gpa;
    if (data.highlights !== undefined) updateData.highlights = data.highlights;
    const updated = await prisma.education.updateMany({
      where: { id: data.itemId, resumeId: id },
      data: updateData,
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const item = await prisma.education.findUnique({ where: { id: data.itemId } });
    await recomputeResumeStatusSafe(id);
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) return auth.error;
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    const resume = await prisma.resume.findFirst({ where: { id, userId: auth.userId } });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const result = await prisma.education.deleteMany({
      where: { id: itemId, resumeId: id },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await recomputeResumeStatusSafe(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
