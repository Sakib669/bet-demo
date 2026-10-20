import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateServerSeed, hashSeed, resolveDice } from "@/lib/provably-fair";

const DEMO_USERNAME = "player_one";

export async function POST(req: Request) {
  try {
    const { betAmount, target, condition, clientSeed } = await req.json();

    const amount = Number(betAmount);
    if (isNaN(amount) || amount < 1) {
      return NextResponse.json(
        { success: false, message: "Minimum bet is 1.00 credit" },
        { status: 400 }
      );
    }

    const targetVal = parseFloat(Number(target).toFixed(2));
    if (isNaN(targetVal) || targetVal < 2 || targetVal > 98) {
      return NextResponse.json(
        { success: false, message: "Target must be between 2.00 and 98.00" },
        { status: 400 }
      );
    }

    if (condition !== "OVER" && condition !== "UNDER") {
      return NextResponse.json(
        { success: false, message: "Condition must be OVER or UNDER" },
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
        { success: false, message: "Insufficient balance for this bet" },
        { status: 400 }
      );
    }

    // Win probability & multiplier calculation
    const winChance = condition === "OVER" ? 100 - targetVal : targetVal;
    const multiplier = parseFloat((99 / winChance).toFixed(4));

    // Provably fair seed generation & roll
    const serverSeed = generateServerSeed();
    const seedHash = hashSeed(serverSeed);
    const roll = resolveDice(serverSeed, clientSeed || "client-dice");

    const won = condition === "OVER" ? roll > targetVal : roll < targetVal;
    const payout = won ? parseFloat((amount * multiplier).toFixed(2)) : 0.0;

    // Atomically execute balance deduction and win credit
    const result = await prisma.$transaction(async (tx) => {
      const balanceAfterDeduct = user.wallet!.balance - amount;
      await tx.wallet.update({
        where: { id: user.wallet!.id },
        data: { balance: balanceAfterDeduct },
      });

      await tx.transaction.create({
        data: {
          walletId: user.wallet!.id,
          type: "BET_PLACED",
          amount: -amount,
          balanceBefore: user.wallet!.balance,
          balanceAfter: balanceAfterDeduct,
          description: `Dice Bet: Roll ${condition} ${targetVal} (Stake: ${amount})`,
        },
      });

      let finalBalance = balanceAfterDeduct;
      if (won) {
        finalBalance = balanceAfterDeduct + payout;
        await tx.wallet.update({
          where: { id: user.wallet!.id },
          data: { balance: finalBalance },
        });

        await tx.transaction.create({
          data: {
            walletId: user.wallet!.id,
            type: "BET_WON",
            amount: payout,
            balanceBefore: balanceAfterDeduct,
            balanceAfter: finalBalance,
            description: `Dice Win: Rolled ${roll} (${multiplier}x)`,
          },
        });
      }

      const gameRound = await tx.gameRound.create({
        data: {
          userId: user.id,
          gameType: "DICE",
          betAmount: amount,
          multiplier: won ? multiplier : 0.0,
          payout,
          status: won ? "WON" : "LOST",
          serverSeed,
          state: JSON.stringify({ target: targetVal, condition, roll, winChance, seedHash }),
          settledAt: new Date(),
        },
      });

      return { finalBalance, gameRound };
    });

    return NextResponse.json({
      success: true,
      roundId: result.gameRound.id,
      roll,
      target: targetVal,
      condition,
      won,
      payout,
      multiplier: won ? multiplier : 0.0,
      winChance,
      newBalance: result.finalBalance,
      serverSeed,
      seedHash,
    });
  } catch (error) {
    console.error("Dice error:", error);
    return NextResponse.json(
      { success: false, message: "Dice roll error" },
      { status: 500 }
    );
  }
}
