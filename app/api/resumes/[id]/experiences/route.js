import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/middleware";
import {
  createExperienceSchema,
  updateExperienceSchema,
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
    const items = await prisma.experience.findMany({ where: { resumeId: id }, orderBy: { order: "asc" } });
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
    const parsed = parseWithSchema(body, createExperienceSchema);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.response.error, errors: parsed.response.errors },
        { status: parsed.response.status }
      );
    }
    const data = parsed.data;
    const maxOrder = await prisma.experience.aggregate({ where: { resumeId: id }, _max: { order: true } });
    const item = await prisma.experience.create({
      data: {
        resumeId: id,
        company: data.company,
        position: data.position,
        location: data.location,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: data.isCurrent,
        description: data.description,
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
    const parsed = parseWithSchema(body, updateExperienceSchema);
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
    if (data.company !== undefined) updateData.company = data.company;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.isCurrent !== undefined) updateData.isCurrent = data.isCurrent;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.highlights !== undefined) updateData.highlights = data.highlights;
    if (data.order !== undefined) updateData.order = data.order;
    const updated = await prisma.experience.updateMany({
      where: { id: data.itemId, resumeId: id },
      data: updateData,
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const item = await prisma.experience.findUnique({ where: { id: data.itemId } });
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
    const result = await prisma.experience.deleteMany({
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
