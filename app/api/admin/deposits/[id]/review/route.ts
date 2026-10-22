import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action, adminNote } = body;

    if (!["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { success: false, message: "Valid action must be APPROVE or REJECT" },
        { status: 400 }
      );
    }

    const adminId = (session.user as any).id;

    // Execute atomic review inside interactive transaction
    const result = await prisma.$transaction(async (tx) => {
      // Fetch request with lock
      const deposit = await tx.depositRequest.findUnique({
        where: { id },
        include: {
          user: {
            include: { wallet: true },
          },
        },
      });

      if (!deposit) {
        throw new Error("Deposit request not found");
      }

      if (deposit.status !== "PENDING") {
        throw new Error(`Deposit request is already ${deposit.status.toLowerCase()}`);
      }

      if (action === "REJECT") {
        const updatedDeposit = await tx.depositRequest.update({
          where: { id },
          data: {
            status: "REJECTED",
            adminNote: adminNote || "Payment verification failed or TrxID invalid",
            reviewedById: adminId,
            reviewedAt: new Date(),
          },
        });

        return { deposit: updatedDeposit, action: "REJECTED" };
      }

      // Action is APPROVE
      // 1. Ensure user has a wallet
      let wallet = deposit.user.wallet;
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: deposit.userId,
            balance: 0.0,
          },
        });
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + deposit.amount;

      // 2. Update wallet balance
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      // 3. Create double-entry transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "ADMIN_GRANT",
          amount: deposit.amount,
          balanceBefore,
          balanceAfter,
          referenceId: deposit.bkashTrxId,
          description: `bKash Top-Up Approved [TrxID: ${deposit.bkashTrxId}]`,
        },
      });

      // 4. Update deposit status
      const updatedDeposit = await tx.depositRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNote: adminNote || "Payment confirmed via bKash",
          reviewedById: adminId,
          reviewedAt: new Date(),
        },
      });

      // 5. Create CreditTransfer audit record
      await tx.creditTransfer.create({
        data: {
          userId: deposit.userId,
          adminId,
          amount: deposit.amount,
          reason: "DEPOSIT_APPROVED",
          depositRequestId: deposit.id,
        },
      });

      return {
        deposit: updatedDeposit,
        action: "APPROVED",
        creditedAmount: deposit.amount,
        newBalance: balanceAfter,
      };
    });

    return NextResponse.json({
      success: true,
      message:
        result.action === "APPROVED"
          ? `Successfully approved deposit. +${result.creditedAmount} PTS added to user wallet.`
          : "Deposit request rejected successfully.",
      result,
    });
  } catch (error: any) {
    console.error("Admin deposit review error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process review" },
      { status: 400 }
    );
  }
}
