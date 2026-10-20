import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.simulationRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            wallet: true,
          },
        },
      },
    });

    const recentRounds = await prisma.gameRound.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    const users = await prisma.user.findMany({
      include: {
        wallet: true,
      },
    });

    return NextResponse.json({
      success: true,
      requests,
      recentRounds,
      users,
    });
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin data" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, requestId, userId, amount, passcode } = body;

    // Check admin passcode
    const expectedPasscode = process.env.ADMIN_SECRET_KEY || "hermes_admin_secret_9988";
    if (passcode !== expectedPasscode) {
      return NextResponse.json(
        { success: false, message: "Invalid Admin Passcode" },
        { status: 401 }
      );
    }

    if (action === "APPROVE_REQUEST") {
      const request = await prisma.simulationRequest.findUnique({
        where: { id: requestId },
        include: { user: { include: { wallet: true } } },
      });

      if (!request || request.status !== "PENDING" || !request.user.wallet) {
        return NextResponse.json(
          { success: false, message: "Request cannot be approved" },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx: any) => {
        const newBalance = request.user.wallet!.balance + request.requestedAmount;
        await tx.wallet.update({
          where: { id: request.user.wallet!.id },
          data: { balance: newBalance },
        });

        await tx.transaction.create({
          data: {
            walletId: request.user.wallet!.id,
            type: "ADMIN_GRANT",
            amount: request.requestedAmount,
            balanceBefore: request.user.wallet!.balance,
            balanceAfter: newBalance,
            description: `Admin manual approval for simulated top-up #${request.id.slice(0, 8)}`,
          },
        });

        await tx.simulationRequest.update({
          where: { id: request.id },
          data: { status: "APPROVED" },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Approved ${request.requestedAmount} demo credits for ${request.user.username}`,
      });
    }

    if (action === "REJECT_REQUEST") {
      await prisma.simulationRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({
        success: true,
        message: "Simulation request rejected",
      });
    }

    if (action === "DIRECT_ADJUST") {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount === 0) {
        return NextResponse.json(
          { success: false, message: "Invalid adjustment amount" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { wallet: true },
      });

      if (!user || !user.wallet) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      const newBalance = Math.max(0, user.wallet.balance + parsedAmount);

      await prisma.$transaction(async (tx: any) => {
        await tx.wallet.update({
          where: { id: user.wallet!.id },
          data: { balance: newBalance },
        });

        await tx.transaction.create({
          data: {
            walletId: user.wallet!.id,
            type: "ADMIN_GRANT",
            amount: parsedAmount,
            balanceBefore: user.wallet!.balance,
            balanceAfter: newBalance,
            description: `Direct Admin manual balance adjustment (${parsedAmount > 0 ? "+" : ""}${parsedAmount})`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Adjusted balance for ${user.username} to ${newBalance}`,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid admin action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json(
      { success: false, message: "Admin processing failed" },
      { status: 500 }
    );
  }
}
