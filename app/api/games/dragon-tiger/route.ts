import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateServerSeed,
  hashSeed,
  resolveDragonTiger,
} from "@/lib/provably-fair";

const DEMO_USERNAME = "player_one";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { betSide, betAmount, clientSeed } = body;
    const amount = Number(betAmount);

    if (!["DRAGON", "TIGER", "TIE"].includes(betSide)) {
      return NextResponse.json(
        { success: false, message: "Valid bet side must be DRAGON, TIGER, or TIE" },
        { status: 400 }
      );
    }

    if (isNaN(amount) || amount < 1) {
      return NextResponse.json(
        { success: false, message: "Minimum bet is 1.00 credit" },
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
    const roundRef = Date.now();
    const outcome = resolveDragonTiger(serverSeed, roundRef, clientSeed || "dt-client");

    let multiplier = 0;
    let won = false;

    if (betSide === outcome.winner) {
      won = true;
      multiplier = outcome.winner === "TIE" ? 9.0 : 2.0;
    } else if (outcome.winner === "TIE" && (betSide === "DRAGON" || betSide === "TIGER")) {
      // Standard Asian casino rule: 50% refund on Dragon/Tiger if round ties
      multiplier = 0.5;
      won = false;
    }

    const payout = parseFloat((amount * multiplier).toFixed(2));

    const result = await prisma.$transaction(async (tx: any) => {
      // Deduct bet amount
      let balance = user.wallet!.balance - amount;
      await tx.transaction.create({
        data: {
          walletId: user.wallet!.id,
          type: "BET_PLACED",
          amount: -amount,
          balanceBefore: user.wallet!.balance,
          balanceAfter: balance,
          description: `Dragon Tiger Bet on [${betSide}]`,
        },
      });

      // Add payout if won or tie partial refund
      if (multiplier > 0) {
        const balanceBeforePayout = balance;
        balance += payout;
        await tx.transaction.create({
          data: {
            walletId: user.wallet!.id,
            type: won ? "BET_WON" : "REFUND",
            amount: payout,
            balanceBefore: balanceBeforePayout,
            balanceAfter: balance,
            description: won
              ? `Dragon Tiger Won ${betSide} (${multiplier}x)`
              : `Dragon Tiger Tie Refund 50%`,
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
          gameType: "DRAGON_TIGER",
          betAmount: amount,
          multiplier,
          payout,
          status: won ? "WON" : multiplier > 0 ? "REFUNDED" : "LOST",
          serverSeed,
          state: JSON.stringify({
            betSide,
            outcome,
          }),
          settledAt: new Date(),
        },
      });

      return { gameRound, balance };
    });

    return NextResponse.json({
      success: true,
      won,
      betSide,
      outcome,
      multiplier,
      payout,
      newBalance: result.balance,
      serverSeed,
      seedHash,
    });
  } catch (error) {
    console.error("Dragon Tiger API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
