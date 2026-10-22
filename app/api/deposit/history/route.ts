import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const deposits = await prisma.depositRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      deposits,
    });
  } catch (error) {
    console.error("Deposit history error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch deposit history" },
      { status: 500 }
    );
  }
}
