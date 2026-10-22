import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGameUser } from "@/lib/session-user";
import {
  generateServerSeed,
  hashSeed,
  resolvePenaltyGoalkeeper,
  PENALTY_MULTIPLIERS,
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

    // 1. START PENALTY ROUND
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

      const serverSeed = generateServerSeed();
      const seedHash = hashSeed(serverSeed);

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
            description: `Penalty Shoot-Out Stake: ${amount} PTS`,
          },
        });

        const gameRound = await tx.gameRound.create({
          data: {
            userId: user.id,
            gameType: "PENALTY",
            betAmount: amount,
            multiplier: 0.0,
            payout: 0.0,
            status: "IN_PROGRESS",
            serverSeed,
            state: JSON.stringify({
              currentShot: 0,
              goals: 0,
              shots: [],
              clientSeed: clientSeed || "penalty-client",
            }),
          },
        });

        return { gameRound, balanceAfter };
      });

      return NextResponse.json({
        success: true,
        roundId: result.gameRound.id,
        seedHash,
        multipliers: PENALTY_MULTIPLIERS,
        newBalance: result.balanceAfter,
      });
    }

    // 2. SHOOT BALL AT TARGET SPOT
    if (action === "SHOOT") {
      const { roundId, targetSpot } = body;
      const spot = Number(targetSpot);

      if (isNaN(spot) || spot < 0 || spot > 4) {
        return NextResponse.json(
          { success: false, message: "Invalid target spot. Must be 0-4." },
          { status: 400 }
        );
      }

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
      const currentShot = state.currentShot || 0;
      const goals = state.goals || 0;
      const clientSeed = state.clientSeed || "penalty-client";

      // Provably fair calculation of goalkeeper dive position
      const goalkeeperSpot = resolvePenaltyGoalkeeper(
        round.serverSeed,
        currentShot,
        clientSeed
      );

      const isGoal = spot !== goalkeeperSpot;
      const newShots = [...(state.shots || []), { shot: currentShot, spot, goalkeeperSpot, isGoal }];

      if (!isGoal) {
        // Goalkeeper saved the ball! Round over.
        await prisma.gameRound.update({
          where: { id: round.id },
          data: {
            status: "LOST",
            multiplier: 0.0,
            payout: 0.0,
            settledAt: new Date(),
            state: JSON.stringify({
              ...state,
              currentShot: currentShot + 1,
              shots: newShots,
            }),
          },
        });

        return NextResponse.json({
          success: true,
          isGoal: false,
          goalkeeperSpot,
          roundFinished: true,
          status: "LOST",
          serverSeed: round.serverSeed,
          seedHash: hashSeed(round.serverSeed),
          message: "Shot saved by the goalkeeper!",
        });
      }

      // It is a GOAL!
      const newGoals = goals + 1;
      const currentMultiplier = PENALTY_MULTIPLIERS[newGoals - 1];
      const maxStreakReached = newGoals >= PENALTY_MULTIPLIERS.length;

      if (maxStreakReached) {
        // All 5 penalties scored! Automatic maximum payout!
        const payout = parseFloat((round.betAmount * currentMultiplier).toFixed(2));
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
              description: `Penalty Grand Win: 5/5 Goals (${currentMultiplier}x)`,
            },
          });

          await tx.gameRound.update({
            where: { id: round.id },
            data: {
              status: "WON",
              multiplier: currentMultiplier,
              payout,
              settledAt: new Date(),
              state: JSON.stringify({
                ...state,
                currentShot: currentShot + 1,
                goals: newGoals,
                shots: newShots,
              }),
            },
          });

          return { balanceAfter };
        });

        return NextResponse.json({
          success: true,
          isGoal: true,
          goalkeeperSpot,
          goals: newGoals,
          multiplier: currentMultiplier,
          roundFinished: true,
          status: "WON",
          payout,
          newBalance: result.balanceAfter,
          serverSeed: round.serverSeed,
          seedHash: hashSeed(round.serverSeed),
        });
      }

      // Goal scored, can continue shooting or cash out!
      await prisma.gameRound.update({
        where: { id: round.id },
        data: {
          state: JSON.stringify({
            ...state,
            currentShot: currentShot + 1,
            goals: newGoals,
            shots: newShots,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        isGoal: true,
        goalkeeperSpot,
        goals: newGoals,
        currentMultiplier,
        nextMultiplier: PENALTY_MULTIPLIERS[newGoals],
        roundFinished: false,
      });
    }

    // 3. CASHOUT COLLECT ACCRUED WINNINGS
    if (action === "CASHOUT") {
      const { roundId } = body;

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
      const goals = state.goals || 0;

      if (goals === 0) {
        return NextResponse.json(
          { success: false, message: "Score at least 1 goal to cash out" },
          { status: 400 }
        );
      }

      const multiplier = PENALTY_MULTIPLIERS[goals - 1];
      const payout = parseFloat((round.betAmount * multiplier).toFixed(2));

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
            description: `Penalty Cashed Out: ${goals} Goals (${multiplier}x)`,
          },
        });

        await tx.gameRound.update({
          where: { id: round.id },
          data: {
            status: "WON",
            multiplier,
            payout,
            settledAt: new Date(),
            state: JSON.stringify({
              ...state,
              cashedOut: true,
            }),
          },
        });

        return { balanceAfter };
      });

      return NextResponse.json({
        success: true,
        status: "WON",
        goals,
        multiplier,
        payout,
        newBalance: result.balanceAfter,
        serverSeed: round.serverSeed,
        seedHash: hashSeed(round.serverSeed),
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Penalty API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
