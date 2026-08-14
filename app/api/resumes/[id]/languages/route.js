import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/middleware";
import { createLanguageSchema, updateLanguageSchema, parseWithSchema } from "@/validators";

export async function GET(request, { params }) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) return auth.error;
    const { id } = await params;
    const resume = await prisma.resume.findFirst({ where: { id, userId: auth.userId } });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const items = await prisma.language.findMany({ where: { resumeId: id }, orderBy: { order: "asc" } });
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
    const parsed = parseWithSchema(body, createLanguageSchema);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.response.error, errors: parsed.response.errors },
        { status: parsed.response.status }
      );
    }
    const data = parsed.data;
    const maxOrder = await prisma.language.aggregate({ where: { resumeId: id }, _max: { order: true } });
    const item = await prisma.language.create({
      data: {
        resumeId: id,
        name: data.name,
        proficiency: data.proficiency || "CONVERSATIONAL",
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
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
    const parsed = parseWithSchema(body, updateLanguageSchema);
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
    if (data.name !== undefined) updateData.name = data.name;
    if (data.proficiency !== undefined) updateData.proficiency = data.proficiency;
    if (data.order !== undefined) updateData.order = data.order;
    const updated = await prisma.language.updateMany({
      where: { id: data.itemId, resumeId: id },
      data: updateData,
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const item = await prisma.language.findUnique({ where: { id: data.itemId } });
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
    const result = await prisma.language.deleteMany({
      where: { id: itemId, resumeId: id },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
