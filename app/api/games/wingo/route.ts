import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateServerSeed,
  hashSeed,
  resolveWinGo,
  calculateWinGoPayout,
} from "@/lib/provably-fair";

const DEMO_USERNAME = "player_one";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

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

    // 1. PLACE BET IN CURRENT ROUND
    if (action === "BET") {
      const { betType, betAmount, period, clientSeed } = body;
      const amount = Number(betAmount);

      if (!betType || isNaN(amount) || amount < 1) {
        return NextResponse.json(
          { success: false, message: "Valid bet option and minimum 1.00 credit required" },
          { status: 400 }
        );
      }

      if (user.wallet.balance < amount) {
        return NextResponse.json(
          { success: false, message: "Insufficient balance" },
          { status: 400 }
        );
      }

      const currentPeriod = period || Math.floor(Date.now() / 30000).toString();
      const serverSeed = generateServerSeed();
      const seedHash = hashSeed(serverSeed);

      // Perform atomic deduction
      const result = await prisma.$transaction(async (tx: any) => {
        const balanceAfter = user.wallet!.balance - amount;
        await tx.wallet.update({
          where: { id: user.wallet!.id },
          data: { balance: balanceAfter },
        });

        await tx.transaction.create({
          data: {
            walletId: user.wallet!.id,
            type: "BET_PLACED",
            amount: -amount,
            balanceBefore: user.wallet!.balance,
            balanceAfter,
            description: `Win Go [${betType}] Round #${currentPeriod}`,
          },
        });

        const gameRound = await tx.gameRound.create({
          data: {
            userId: user.id,
            gameType: "WIN_GO",
            betAmount: amount,
            multiplier: 0.0,
            payout: 0.0,
            status: "IN_PROGRESS",
            serverSeed,
            state: JSON.stringify({
              betType,
              period: currentPeriod,
              clientSeed: clientSeed || "wingo-default",
            }),
          },
        });

        return { gameRound, balanceAfter };
      });

      return NextResponse.json({
        success: true,
        roundId: result.gameRound.id,
        seedHash,
        period: currentPeriod,
        newBalance: result.balanceAfter,
      });
    }

    // 2. SETTLE ROUND ON COUNTDOWN COMPLETION
    if (action === "SETTLE") {
      const { roundId } = body;

      const round = await prisma.gameRound.findUnique({
        where: { id: roundId },
      });

      if (!round || round.userId !== user.id) {
        return NextResponse.json(
          { success: false, message: "Round not found" },
          { status: 404 }
        );
      }

      if (round.status !== "IN_PROGRESS") {
        return NextResponse.json({
          success: true,
          status: round.status,
          multiplier: round.multiplier,
          payout: round.payout,
          state: JSON.parse(round.state || "{}"),
        });
      }

      const state = JSON.parse(round.state || "{}");
      const outcome = resolveWinGo(round.serverSeed, state.period, state.clientSeed);
      const multiplier = calculateWinGoPayout(state.betType, outcome);
      const isWon = multiplier > 0;
      const payout = parseFloat((round.betAmount * multiplier).toFixed(2));

      const updated = await prisma.$transaction(async (tx: any) => {
        let balanceAfter = user.wallet!.balance;
        if (isWon && payout > 0) {
          balanceAfter += payout;
          await tx.wallet.update({
            where: { id: user.wallet!.id },
            data: { balance: balanceAfter },
          });

          await tx.transaction.create({
            data: {
              walletId: user.wallet!.id,
              type: "BET_WON",
              amount: payout,
              balanceBefore: user.wallet!.balance,
              balanceAfter,
              description: `Win Go Won ${state.betType} #${state.period} (${multiplier}x)`,
            },
          });
        }

        const gameRound = await tx.gameRound.update({
          where: { id: round.id },
          data: {
            status: isWon ? "WON" : "LOST",
            multiplier,
            payout,
            settledAt: new Date(),
            state: JSON.stringify({
              ...state,
              outcome,
            }),
          },
        });

        return { gameRound, balanceAfter };
      });

      return NextResponse.json({
        success: true,
        won: isWon,
        outcome,
        multiplier,
        payout,
        newBalance: updated.balanceAfter,
        serverSeed: round.serverSeed,
        seedHash: hashSeed(round.serverSeed),
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Win Go API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
