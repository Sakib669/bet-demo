import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USERNAME = "player_one";

export async function GET() {
  try {
    let user = await prisma.user.findUnique({
      where: { username: DEMO_USERNAME },
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

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: DEMO_USERNAME,
          role: "USER",
          wallet: {
            create: {
              balance: 1000.0,
              transactions: {
                create: {
                  type: "DAILY_BONUS",
                  amount: 1000.0,
                  balanceBefore: 0.0,
                  balanceAfter: 1000.0,
                  description: "Welcome grant: 1,000 free demo credits",
                },
              },
            },
          },
        },
        include: {
          wallet: {
            include: {
              transactions: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
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
    const body = await req.json();
    const { action, amount, notes } = body;

    const user = await prisma.user.findUnique({
      where: { username: DEMO_USERNAME },
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

    // Submit Simulated Credit Request
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
