import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGameUser } from "@/lib/session-user";
import { generateServerSeed, hashSeed, resolveCoinFlip } from "@/lib/provably-fair";

export async function POST(req: Request) {
  try {
    const { betAmount, choice, clientSeed } = await req.json();

    const amount = Number(betAmount);
    if (isNaN(amount) || amount < 1) {
      return NextResponse.json(
        { success: false, message: "Minimum bet is 1.00 credit" },
        { status: 400 }
      );
    }

    if (choice !== "HEADS" && choice !== "TAILS") {
      return NextResponse.json(
        { success: false, message: "Invalid choice. Must be HEADS or TAILS." },
        { status: 400 }
      );
    }

    const user = await getGameUser();

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

    // Provably fair seed generation & resolution
    const serverSeed = generateServerSeed();
    const seedHash = hashSeed(serverSeed);
    const outcome = resolveCoinFlip(serverSeed, clientSeed || "client-flip");
    const won = outcome === choice;
    const multiplier = 1.98; // 2% house edge for provably fair simulation
    const payout = won ? parseFloat((amount * multiplier).toFixed(2)) : 0.0;

    // Atomically execute wallet balance updates & game round storage
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Deduct stake
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
          description: `Coin Flip Bet: ${choice} (Stake: ${amount})`,
        },
      });

      // 2. Credit winnings if won
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
            description: `Coin Flip Win: ${outcome} (${multiplier}x)`,
          },
        });
      }

      // 3. Persist GameRound
      const gameRound = await tx.gameRound.create({
        data: {
          userId: user.id,
          gameType: "COIN_FLIP",
          betAmount: amount,
          multiplier: won ? multiplier : 0.0,
          payout,
          status: won ? "WON" : "LOST",
          serverSeed,
          state: JSON.stringify({ choice, outcome, clientSeed, seedHash }),
          settledAt: new Date(),
        },
      });

      return { finalBalance, gameRound };
    });

    return NextResponse.json({
      success: true,
      roundId: result.gameRound.id,
      outcome,
      choice,
      won,
      payout,
      multiplier: won ? multiplier : 0.0,
      newBalance: result.finalBalance,
      serverSeed,
      seedHash,
    });
  } catch (error) {
    console.error("Coin Flip error:", error);
    return NextResponse.json(
      { success: false, message: "Game resolution error" },
      { status: 500 }
    );
  }
}
