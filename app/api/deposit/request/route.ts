import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required to submit deposit request" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, bkashTrxId, senderNumber } = body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount < 10) {
      return NextResponse.json(
        { success: false, message: "Minimum deposit amount is 10 BDT" },
        { status: 400 }
      );
    }

    if (!bkashTrxId || typeof bkashTrxId !== "string" || bkashTrxId.trim().length < 4) {
      return NextResponse.json(
        { success: false, message: "Valid bKash Transaction ID (TrxID) is required" },
        { status: 400 }
      );
    }

    if (!senderNumber || typeof senderNumber !== "string") {
      return NextResponse.json(
        { success: false, message: "Sender bKash mobile number is required" },
        { status: 400 }
      );
    }

    const cleanTrxId = bkashTrxId.trim().toUpperCase();
    const cleanSender = senderNumber.trim().replace(/[-\s]/g, "");

    // Check for duplicate TrxID
    const existing = await prisma.depositRequest.findUnique({
      where: { bkashTrxId: cleanTrxId },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `This bKash Transaction ID (${cleanTrxId}) has already been submitted.`,
        },
        { status: 400 }
      );
    }

    const depositRequest = await prisma.depositRequest.create({
      data: {
        userId: userId as string,
        amount: numAmount,
        bkashTrxId: cleanTrxId,
        senderNumber: cleanSender,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment request submitted successfully. Admin will verify and credit your wallet shortly.",
      deposit: depositRequest,
    });
  } catch (error) {
    console.error("Deposit request error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit deposit request. Please try again." },
      { status: 500 }
    );
  }
}
