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

    const { id: userId } = await params;
    const body = await req.json();
    const { amount, reason } = body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount === 0) {
      return NextResponse.json(
        { success: false, message: "Valid non-zero adjustment amount is required" },
        { status: 400 }
      );
    }

    const adminId = (session.user as any).id;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      });

      if (!user) {
        throw new Error("Target user not found");
      }

      let wallet = user.wallet;
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: user.id,
            balance: 0.0,
          },
        });
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + numAmount;

      if (balanceAfter < 0) {
        throw new Error(`Insufficient user balance. Cannot deduct more than current balance (${balanceBefore} PTS).`);
      }

      // Update wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "ADMIN_GRANT",
          amount: numAmount,
          balanceBefore,
          balanceAfter,
          description: `Admin Manual Adjustment: ${reason || "Direct balance modifier"}`,
        },
      });

      // Create credit transfer audit log
      const creditTransfer = await tx.creditTransfer.create({
        data: {
          userId: user.id,
          adminId,
          amount: numAmount,
          reason: reason ? `MANUAL_GRANT: ${reason}` : "MANUAL_GRANT",
        },
      });

      return { balanceBefore, balanceAfter, numAmount, creditTransfer };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully adjusted balance by ${result.numAmount > 0 ? "+" : ""}${result.numAmount} PTS. New balance: ${result.balanceAfter} PTS.`,
      result,
    });
  } catch (error: any) {
    console.error("Admin credit adjustment error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to adjust balance" },
      { status: 400 }
    );
  }
}
