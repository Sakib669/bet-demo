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

    // 1. Income Ledger: Confirmed Real Money Payments via bKash
    const incomeLedger = await prisma.depositRequest.findMany({
      where: { status: "APPROVED" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { reviewedAt: "desc" },
      take: 100,
    });

    // 2. Game Credit Ledger: All Credit Allocations & Deductions
    const creditLedger = await prisma.creditTransfer.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            mobile: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
        depositRequest: {
          select: {
            bkashTrxId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Aggregates
    const totalIncome = await prisma.depositRequest.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    });

    const totalCreditsIssued = await prisma.creditTransfer.aggregate({
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      incomeLedger,
      creditLedger,
      totals: {
        totalIncomeBDT: totalIncome._sum.amount || 0,
        totalCreditsIssuedPTS: totalCreditsIssued._sum.amount || 0,
        incomeCount: incomeLedger.length,
        creditCount: creditLedger.length,
      },
    });
  } catch (error) {
    console.error("Admin transactions audit error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
