import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";
import { apiError } from "@/lib/api-response";

export async function GET(request) {
  try {
    const auth = await authenticate(request);
    const rows = await prisma.templateFavorite.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, favorites: rows.map((r) => r.templateId) });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("List template favorites error:", error);
    return apiError("Failed to load template favorites", 500);
  }
}

export async function POST(request) {
  try {
    const auth = await authenticate(request);
    const body = await request.json();
    const { templateId } = body;

    if (!templateId || typeof templateId !== "string") {
      return NextResponse.json({ success: false, error: "templateId is required" }, { status: 400 });
    }

    const favorite = await prisma.templateFavorite.upsert({
      where: { userId_templateId: { userId: auth.userId, templateId } },
      update: {},
      create: { userId: auth.userId, templateId },
    });

    return NextResponse.json({ success: true, favorited: true, favorite });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Add template favorite error:", error);
    return apiError("Failed to add template favorite", 500);
  }
}

export async function DELETE(request) {
  try {
    const auth = await authenticate(request);
    const url = new URL(request.url);
    const templateId = url.searchParams.get("templateId");

    if (!templateId) {
      return NextResponse.json({ success: false, error: "templateId is required" }, { status: 400 });
    }

    await prisma.templateFavorite.deleteMany({
      where: { userId: auth.userId, templateId },
    });

    return NextResponse.json({ success: true, favorited: false });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error("Remove template favorite error:", error);
    return apiError("Failed to remove template favorite", 500);
  }
}
