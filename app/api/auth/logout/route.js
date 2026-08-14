import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashSessionToken } from "@/lib/password";

export async function POST(request) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      await prisma.session.deleteMany({
        where: { token: hashSessionToken(refreshToken) },
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
    return response;
  }
}
