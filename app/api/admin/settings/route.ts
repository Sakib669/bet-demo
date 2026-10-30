import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const settings = await prisma.siteSetting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      settings: settingsMap,
    });
  } catch (error) {
    console.error("Admin settings fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { bkash_number, bkash_type } = body;

    if (typeof bkash_number !== "string" || !/^01\d{9}$/.test(bkash_number.replace(/[-\s]/g, "")) || bkash_number.replace(/[-\s]/g, "") === "01798234567") {
      return NextResponse.json({ success: false, message: "Enter a real 11-digit bKash receiving number." }, { status: 400 });
    }
    if (!["Personal (Send Money)", "Merchant (Payment)", "Agent (Cash In)"].includes(bkash_type)) {
      return NextResponse.json({ success: false, message: "Choose a valid bKash account type." }, { status: 400 });
    }

    if (bkash_number) {
      await prisma.siteSetting.upsert({
        where: { key: "bkash_number" },
        update: { value: bkash_number.trim() },
        create: { key: "bkash_number", value: bkash_number.trim() },
      });
    }

    if (bkash_type) {
      await prisma.siteSetting.upsert({
        where: { key: "bkash_type" },
        update: { value: bkash_type.trim() },
        create: { key: "bkash_type", value: bkash_type.trim() },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully.",
    });
  } catch (error) {
    console.error("Admin settings update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
