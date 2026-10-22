import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateServerSeed,
  hashSeed,
  resolveCrazyWheel,
  CRAZY_WHEEL_SEGMENTS,
} from "@/lib/provably-fair";

const DEMO_USERNAME = "player_one";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { betAmount, selectedMultiplier, clientSeed } = body;
    const amount = Number(betAmount);
    const chosenMult = Number(selectedMultiplier); // e.g. 1, 2, 5, 10, 20, 50

    if (isNaN(amount) || amount < 1) {
      return NextResponse.json(
        { success: false, message: "Minimum bet is 1.00 credit" },
        { status: 400 }
      );
    }

    const validMultipliers = [1, 2, 5, 10, 20, 50];
    if (!validMultipliers.includes(chosenMult)) {
      return NextResponse.json(
        { success: false, message: "Invalid multiplier choice" },
        { status: 400 }
      );
    }

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

    if (user.wallet.balance < amount) {
      return NextResponse.json(
        { success: false, message: "Insufficient balance" },
        { status: 400 }
      );
    }

    const serverSeed = generateServerSeed();
    const seedHash = hashSeed(serverSeed);
    const spinRef = Date.now();
    const winningSegment = resolveCrazyWheel(serverSeed, spinRef, clientSeed || "wheel-client");

    const won = winningSegment.multiplier === chosenMult;
    const payout = won ? parseFloat((amount * (winningSegment.multiplier + 1)).toFixed(2)) : 0; // return stake + net win

    const result = await prisma.$transaction(async (tx: any) => {
      let balance = user.wallet!.balance - amount;

      await tx.transaction.create({
        data: {
          walletId: user.wallet!.id,
          type: "BET_PLACED",
          amount: -amount,
          balanceBefore: user.wallet!.balance,
          balanceAfter: balance,
          description: `Crazy Wheel Bet on [${chosenMult}X]`,
        },
      });

      if (won && payout > 0) {
        const balanceBeforePayout = balance;
        balance += payout;
        await tx.transaction.create({
          data: {
            walletId: user.wallet!.id,
            type: "BET_WON",
            amount: payout,
            balanceBefore: balanceBeforePayout,
            balanceAfter: balance,
            description: `Crazy Wheel Hit [${winningSegment.label}] (+${payout} PTS)`,
          },
        });
      }

      await tx.wallet.update({
        where: { id: user.wallet!.id },
        data: { balance },
      });

      const gameRound = await tx.gameRound.create({
        data: {
          userId: user.id,
          gameType: "CRAZY_WHEEL",
          betAmount: amount,
          multiplier: won ? winningSegment.multiplier : 0,
          payout,
          status: won ? "WON" : "LOST",
          serverSeed,
          state: JSON.stringify({
            chosenMultiplier: chosenMult,
            segmentIndex: winningSegment.index,
            winningMultiplier: winningSegment.multiplier,
          }),
          settledAt: new Date(),
        },
      });

      return { gameRound, balance };
    });

    return NextResponse.json({
      success: true,
      won,
      winningSegment,
      payout,
      newBalance: result.balance,
      serverSeed,
      seedHash,
    });
  } catch (error) {
    console.error("Crazy Wheel API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
