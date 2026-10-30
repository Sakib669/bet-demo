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

    if (!Number.isInteger(numAmount) || numAmount < 100 || numAmount > 5000) {
      return NextResponse.json(
        { success: false, message: "Choose an amount from 100 to 5,000 BDT." },
        { status: 400 }
      );
    }

    if (typeof bkashTrxId !== "string" || !/^[a-zA-Z0-9]{8,20}$/.test(bkashTrxId.trim())) {
      return NextResponse.json(
        { success: false, message: "Valid bKash Transaction ID (TrxID) is required" },
        { status: 400 }
      );
    }

    if (typeof senderNumber !== "string" || !/^01\d{9}$/.test(senderNumber.trim().replace(/[-\s]/g, ""))) {
      return NextResponse.json(
        { success: false, message: "Sender bKash mobile number is required" },
        { status: 400 }
      );
    }

    const cleanTrxId = bkashTrxId.trim().toUpperCase();
    const cleanSender = senderNumber.trim().replace(/[-\s]/g, "");

    const recipient = await prisma.siteSetting.findUnique({ where: { key: "bkash_number" } });
    if (!recipient?.value || recipient.value.replace(/\D/g, "") === "01798234567") {
      return NextResponse.json({ success: false, message: "Credit purchases are not available until the receiving account is configured." }, { status: 503 });
    }

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
      message: "Payment details submitted. Credits will be added after the operator verifies the transaction.",
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
