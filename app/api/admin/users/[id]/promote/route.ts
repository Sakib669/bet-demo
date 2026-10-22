import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const newRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";

    const updated = await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });

    return NextResponse.json({
      success: true,
      message: `User ${updated.name} role changed to ${newRole}`,
      user: {
        id: updated.id,
        name: updated.name,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("Admin promote user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update role" },
      { status: 500 }
    );
  }
}
