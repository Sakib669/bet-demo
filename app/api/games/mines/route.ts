import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGameUser } from "@/lib/session-user";
import {
  generateServerSeed,
  hashSeed,
  generateMines,
  calculateMinesMultiplier,
} from "@/lib/provably-fair";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, roundId, betAmount, mineCount, tileIndex, clientSeed } = body;

    const user = await getGameUser();

    if (!user || !user.wallet) {
      return NextResponse.json(
        { success: false, message: "User wallet not found" },
        { status: 404 }
      );
    }

    // 1. ACTION: START GAME
    if (action === "START") {
      const amount = Number(betAmount);
      if (isNaN(amount) || amount < 1) {
        return NextResponse.json(
          { success: false, message: "Minimum bet is 1.00 credit" },
          { status: 400 }
        );
      }

      const count = Math.max(1, Math.min(24, parseInt(mineCount) || 3));

      if (user.wallet.balance < amount) {
        return NextResponse.json(
          { success: false, message: "Insufficient balance for this bet" },
          { status: 400 }
        );
      }

      const serverSeed = generateServerSeed();
      const seedHash = hashSeed(serverSeed);
      const minePositions = generateMines(serverSeed, count, clientSeed || "client-mines");

      const nextMultiplier = calculateMinesMultiplier(count, 1);

      const result = await prisma.$transaction(async (tx: any) => {
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
            description: `Mines Start: ${count} Mines on 5x5 Grid (Stake: ${amount})`,
          },
        });

        const round = await tx.gameRound.create({
          data: {
            userId: user.id,
            gameType: "MINES",
            betAmount: amount,
            multiplier: 1.0,
            payout: 0.0,
            status: "IN_PROGRESS",
            serverSeed,
            state: JSON.stringify({
              mineCount: count,
              minePositions,
              revealedGems: [],
              currentMultiplier: 1.0,
              seedHash,
            }),
          },
        });

        return { balanceAfterDeduct, round };
      });

      return NextResponse.json({
        success: true,
        roundId: result.round.id,
        currentMultiplier: 1.0,
        nextMultiplier,
        newBalance: result.balanceAfterDeduct,
        seedHash,
      });
    }

    // 2. ACTION: REVEAL TILE
    if (action === "REVEAL") {
      if (!roundId || tileIndex === undefined || tileIndex < 0 || tileIndex > 24) {
        return NextResponse.json(
          { success: false, message: "Invalid tile selection" },
          { status: 400 }
        );
      }

      const round = await prisma.gameRound.findUnique({
        where: { id: roundId },
      });

      if (!round || round.status !== "IN_PROGRESS" || round.userId !== user.id) {
        return NextResponse.json(
          { success: false, message: "Game round is not active" },
          { status: 400 }
        );
      }

      const state = JSON.parse(round.state || "{}");
      const { minePositions, revealedGems, mineCount } = state;

      if (revealedGems.includes(tileIndex)) {
        return NextResponse.json(
          { success: false, message: "Tile already revealed" },
          { status: 400 }
        );
      }

      // Check if stepped on a mine
      if (minePositions.includes(tileIndex)) {
        // Boom! Game Lost
        await prisma.gameRound.update({
          where: { id: round.id },
          data: {
            status: "LOST",
            multiplier: 0.0,
            payout: 0.0,
            settledAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          status: "LOST",
          explodedTile: tileIndex,
          allMines: minePositions,
          revealedGems,
          payout: 0.0,
          currentMultiplier: 0.0,
          newBalance: user.wallet.balance,
        });
      }

      // Gem uncovered!
      revealedGems.push(tileIndex);
      const newMultiplier = calculateMinesMultiplier(mineCount, revealedGems.length);
      const safeTilesLeft = 25 - mineCount - revealedGems.length;
      const nextMultiplier = safeTilesLeft > 0 ? calculateMinesMultiplier(mineCount, revealedGems.length + 1) : newMultiplier;
      const currentPayout = parseFloat((round.betAmount * newMultiplier).toFixed(2));

      // Check if all safe tiles cleared -> Auto-win!
      if (safeTilesLeft === 0) {
        await prisma.$transaction(async (tx: any) => {
          const finalBalance = user.wallet!.balance + currentPayout;
          await tx.wallet.update({
            where: { id: user.wallet!.id },
            data: { balance: finalBalance },
          });

          await tx.transaction.create({
            data: {
              walletId: user.wallet!.id,
              type: "BET_WON",
              amount: currentPayout,
              balanceBefore: user.wallet!.balance,
              balanceAfter: finalBalance,
              description: `Mines Perfect Board Cleared! (${newMultiplier}x)`,
            },
          });

          await tx.gameRound.update({
            where: { id: round.id },
            data: {
              status: "WON",
              multiplier: newMultiplier,
              payout: currentPayout,
              settledAt: new Date(),
              state: JSON.stringify({ ...state, revealedGems, currentMultiplier: newMultiplier }),
            },
          });
        });

        return NextResponse.json({
          success: true,
          status: "WON",
          isAutoWin: true,
          revealedGems,
          allMines: minePositions,
          currentMultiplier: newMultiplier,
          payout: currentPayout,
          newBalance: user.wallet.balance + currentPayout,
        });
      }

      // Still in progress
      await prisma.gameRound.update({
        where: { id: round.id },
        data: {
          multiplier: newMultiplier,
          payout: currentPayout,
          state: JSON.stringify({ ...state, revealedGems, currentMultiplier: newMultiplier }),
        },
      });

      return NextResponse.json({
        success: true,
        status: "IN_PROGRESS",
        revealedGems,
        newlyRevealed: tileIndex,
        currentMultiplier: newMultiplier,
        nextMultiplier,
        currentPayout,
      });
    }

    // 3. ACTION: CASHOUT
    if (action === "CASHOUT") {
      if (!roundId) {
        return NextResponse.json(
          { success: false, message: "Round ID required for cashout" },
          { status: 400 }
        );
      }

      const round = await prisma.gameRound.findUnique({
        where: { id: roundId },
      });

      if (!round || round.status !== "IN_PROGRESS" || round.userId !== user.id) {
        return NextResponse.json(
          { success: false, message: "No active game to cash out" },
          { status: 400 }
        );
      }

      const state = JSON.parse(round.state || "{}");
      const { minePositions, revealedGems, currentMultiplier } = state;

      if (!revealedGems || revealedGems.length === 0) {
        return NextResponse.json(
          { success: false, message: "Must reveal at least one safe gem before cashout" },
          { status: 400 }
        );
      }

      const payout = parseFloat((round.betAmount * currentMultiplier).toFixed(2));

      const updatedWallet = await prisma.$transaction(async (tx: any) => {
        const finalBalance = user.wallet!.balance + payout;
        const w = await tx.wallet.update({
          where: { id: user.wallet!.id },
          data: { balance: finalBalance },
        });

        await tx.transaction.create({
          data: {
            walletId: user.wallet!.id,
            type: "BET_WON",
            amount: payout,
            balanceBefore: user.wallet!.balance,
            balanceAfter: finalBalance,
            description: `Mines Cashed Out: ${revealedGems.length} Gems (${currentMultiplier}x)`,
          },
        });

        await tx.gameRound.update({
          where: { id: round.id },
          data: {
            status: "WON",
            multiplier: currentMultiplier,
            payout,
            settledAt: new Date(),
          },
        });

        return w;
      });

      return NextResponse.json({
        success: true,
        status: "WON",
        payout,
        currentMultiplier,
        revealedGems,
        allMines: minePositions,
        newBalance: updatedWallet.balance,
      });
    }

    return NextResponse.json(
      { success: false, message: "Unknown Mines action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Mines error:", error);
    return NextResponse.json(
      { success: false, message: "Mines engine error" },
      { status: 500 }
    );
  }
}
