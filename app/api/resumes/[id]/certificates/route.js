import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateToken } from "@/lib/middleware";
import { createCertificateSchema, updateCertificateSchema, parseWithSchema } from "@/validators";

export async function GET(request, { params }) {
  try {
    const auth = await authenticateToken(request);
    if (auth.error) return auth.error;
    const { id } = await params;
    const resume = await prisma.resume.findFirst({ where: { id, userId: auth.userId } });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const items = await prisma.certificate.findMany({ where: { resumeId: id }, orderBy: { order: "asc" } });
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
    const parsed = parseWithSchema(body, createCertificateSchema);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: parsed.response.error, errors: parsed.response.errors },
        { status: parsed.response.status }
      );
    }
    const data = parsed.data;
    const maxOrder = await prisma.certificate.aggregate({ where: { resumeId: id }, _max: { order: true } });
    const item = await prisma.certificate.create({
      data: {
        resumeId: id,
        name: data.name,
        issuer: data.issuer,
        url: data.url,
        date: data.date,
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
    const parsed = parseWithSchema(body, updateCertificateSchema);
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
    if (data.issuer !== undefined) updateData.issuer = data.issuer;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.order !== undefined) updateData.order = data.order;
    const updated = await prisma.certificate.updateMany({
      where: { id: data.itemId, resumeId: id },
      data: updateData,
    });
    if (updated.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const item = await prisma.certificate.findUnique({ where: { id: data.itemId } });
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
    const result = await prisma.certificate.deleteMany({
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
