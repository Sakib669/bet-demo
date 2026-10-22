import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGameUser } from "@/lib/session-user";
import {
  generateServerSeed,
  hashSeed,
  resolveCrashMultiplier,
} from "@/lib/provably-fair";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    const user = await getGameUser();

    if (!user || !user.wallet) {
      return NextResponse.json(
        { success: false, message: "User wallet not found" },
        { status: 404 }
      );
    }

    // 1. START FLIGHT
    if (action === "START") {
      const { betAmount, clientSeed } = body;
      const amount = Number(betAmount);

      if (isNaN(amount) || amount < 1) {
        return NextResponse.json(
          { success: false, message: "Minimum bet is 1.00 credit" },
          { status: 400 }
        );
      }

      if (user.wallet.balance < amount) {
        return NextResponse.json(
          { success: false, message: "Insufficient balance" },
          { status: 400 }
        );
      }

      // Generate provably fair server seed and crash point
      const serverSeed = generateServerSeed();
      const seedHash = hashSeed(serverSeed);
      const crashMultiplier = resolveCrashMultiplier(
        serverSeed,
        clientSeed || "client-aviator"
      );

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
            description: `Aviator Takeoff Stake: ${amount} PTS`,
          },
        });

        const gameRound = await tx.gameRound.create({
          data: {
            userId: user.id,
            gameType: "AVIATOR",
            betAmount: amount,
            multiplier: 0.0,
            payout: 0.0,
            status: "IN_PROGRESS",
            serverSeed,
            state: JSON.stringify({
              crashMultiplier,
              cashedOut: false,
            }),
          },
        });

        return { gameRound, balanceAfter };
      });

      return NextResponse.json({
        success: true,
        roundId: result.gameRound.id,
        seedHash,
        newBalance: result.balanceAfter,
      });
    }

    // 2. CASHOUT FLIGHT
    if (action === "CASHOUT") {
      const { roundId, claimedMultiplier } = body;
      const mult = parseFloat(Number(claimedMultiplier).toFixed(2));

      const round = await prisma.gameRound.findUnique({
        where: { id: roundId },
      });

      if (!round || round.userId !== user.id || round.status !== "IN_PROGRESS") {
        return NextResponse.json(
          { success: false, message: "Round is no longer active" },
          { status: 400 }
        );
      }

      const state = JSON.parse(round.state || "{}");
      const crashMultiplier = state.crashMultiplier;

      // Verify the plane hadn't already crashed at claimed multiplier
      if (mult > crashMultiplier) {
        // Crashed before cashout
        await prisma.gameRound.update({
          where: { id: round.id },
          data: {
            status: "LOST",
            multiplier: crashMultiplier,
            payout: 0.0,
            settledAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          crashed: true,
          won: false,
          crashMultiplier,
          serverSeed: round.serverSeed,
          seedHash: hashSeed(round.serverSeed),
          message: `Plane flew away at ${crashMultiplier}x!`,
        });
      }

      // Successful cashout
      const payout = parseFloat((round.betAmount * mult).toFixed(2));

      const result = await prisma.$transaction(async (tx: any) => {
        const balanceAfter = user.wallet!.balance + payout;
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
            description: `Aviator Cashed Out at ${mult}x (+${payout} PTS)`,
          },
        });

        const updatedRound = await tx.gameRound.update({
          where: { id: round.id },
          data: {
            status: "WON",
            multiplier: mult,
            payout,
            settledAt: new Date(),
            state: JSON.stringify({
              crashMultiplier,
              cashedOut: true,
              claimedMultiplier: mult,
            }),
          },
        });

        return { updatedRound, balanceAfter };
      });

      return NextResponse.json({
        success: true,
        crashed: false,
        won: true,
        multiplier: mult,
        crashMultiplier,
        payout,
        newBalance: result.balanceAfter,
        serverSeed: round.serverSeed,
        seedHash: hashSeed(round.serverSeed),
      });
    }

    // 3. SETTLE CRASH (Plane flew away before player cashed out)
    if (action === "CRASH") {
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

      if (round.status === "IN_PROGRESS") {
        const state = JSON.parse(round.state || "{}");
        await prisma.gameRound.update({
          where: { id: round.id },
          data: {
            status: "LOST",
            multiplier: state.crashMultiplier || 1.0,
            payout: 0.0,
            settledAt: new Date(),
          },
        });
      }

      const state = JSON.parse(round.state || "{}");
      return NextResponse.json({
        success: true,
        crashMultiplier: state.crashMultiplier,
        serverSeed: round.serverSeed,
        seedHash: hashSeed(round.serverSeed),
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Aviator API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
