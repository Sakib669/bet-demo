import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const numberSetting = await prisma.siteSetting.findUnique({
      where: { key: "bkash_number" },
    });
    const typeSetting = await prisma.siteSetting.findUnique({
      where: { key: "bkash_type" },
    });

    const bkashNumber = numberSetting?.value || "01798-234567";
    const cleanNumber = bkashNumber.replace(/[-\s]/g, "");

    return NextResponse.json({
      success: true,
      data: {
        number: bkashNumber,
        rawNumber: cleanNumber,
        type: typeSetting?.value || "Personal (Send Money)",
        ussd: "*247#",
      },
    });
  } catch (error) {
    console.error("Fetch bKash settings error:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          number: "01798-234567",
          rawNumber: "01798234567",
          type: "Personal (Send Money)",
          ussd: "*247#",
        },
      },
      { status: 200 }
    );
  }
}
