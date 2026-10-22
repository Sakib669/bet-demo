import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    let userId = session?.user?.id;

    let user: any = null;

    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          wallet: {
            include: {
              transactions: {
                orderBy: { createdAt: "desc" },
                take: 15,
              },
            },
          },
        },
      });
    }

    // Fallback to default demo customer if not logged in
    if (!user) {
      user = await prisma.user.findUnique({
        where: { mobile: "01711111111" },
        include: {
          wallet: {
            include: {
              transactions: {
                orderBy: { createdAt: "desc" },
                take: 15,
              },
            },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isAuthenticated: !!session?.user,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    console.error("Wallet GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const { action, amount, notes } = body;

    let userId = session?.user?.id;
    let user = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          include: { wallet: true },
        })
      : await prisma.user.findUnique({
          where: { mobile: "01711111111" },
          include: { wallet: true },
        });

    if (!user || !user.wallet) {
      return NextResponse.json(
        { success: false, message: "User wallet not found" },
        { status: 404 }
      );
    }

    // Daily Bonus Claim
    if (action === "CLAIM_DAILY") {
      const lastDaily = await prisma.transaction.findFirst({
        where: {
          walletId: user.wallet.id,
          type: "DAILY_BONUS",
        },
        orderBy: { createdAt: "desc" },
      });

      const now = new Date();
      if (lastDaily) {
        const diffHours = (now.getTime() - lastDaily.createdAt.getTime()) / (1000 * 60 * 60);
        if (diffHours < 24) {
          const hoursRemaining = Math.ceil(24 - diffHours);
          return NextResponse.json(
            {
              success: false,
              message: `Daily reward already claimed! Next available in ${hoursRemaining}h.`,
            },
            { status: 400 }
          );
        }
      }

      const bonusAmount = 250.0;
      const newBalance = user.wallet.balance + bonusAmount;

      const [updatedWallet] = await prisma.$transaction([
        prisma.wallet.update({
          where: { id: user.wallet.id },
          data: { balance: newBalance },
        }),
        prisma.transaction.create({
          data: {
            walletId: user.wallet.id,
            type: "DAILY_BONUS",
            amount: bonusAmount,
            balanceBefore: user.wallet.balance,
            balanceAfter: newBalance,
            description: "Daily Free Demo Credits Reload (+250 PTS)",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Successfully claimed 250 free demo credits!",
        balance: updatedWallet.balance,
      });
    }

    // Submit Simulation Request
    if (action === "REQUEST_CREDITS") {
      const parsedAmount = Math.max(10, Math.min(50000, Number(amount) || 500));

      const request = await prisma.simulationRequest.create({
        data: {
          userId: user.id,
          requestedAmount: parsedAmount,
          notes: notes || "Demo token refill request",
          status: "PENDING",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Simulated credit request submitted for Admin review.",
        request,
      });
    }

    return NextResponse.json(
      { success: false, message: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Wallet POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process request" },
      { status: 500 }
    );
  }
}
