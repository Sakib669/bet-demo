import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin role required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallet: true,
        depositRequests: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
        receivedCredits: {
          include: {
            admin: {
              select: { name: true, mobile: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 30,
        },
        gameRounds: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Comprehensive Financial & Game Analytics Aggregations
    const allRounds = await prisma.gameRound.findMany({
      where: { userId: id },
      select: {
        gameType: true,
        betAmount: true,
        payout: true,
        status: true,
        createdAt: true,
      },
    });

    const totalRounds = allRounds.length;
    let totalWagered = 0;
    let totalPayout = 0;
    let wonRounds = 0;
    let lostRounds = 0;

    const gameTypeCounts: Record<string, { count: number; wagered: number; won: number }> = {};

    for (const r of allRounds) {
      totalWagered += r.betAmount;
      totalPayout += r.payout;
      if (r.status === "WON") wonRounds++;
      if (r.status === "LOST") lostRounds++;

      if (!gameTypeCounts[r.gameType]) {
        gameTypeCounts[r.gameType] = { count: 0, wagered: 0, won: 0 };
      }
      gameTypeCounts[r.gameType].count++;
      gameTypeCounts[r.gameType].wagered += r.betAmount;
      gameTypeCounts[r.gameType].won += r.payout;
    }

    const winRate = totalRounds > 0 ? parseFloat(((wonRounds / totalRounds) * 100).toFixed(1)) : 0;
    const playerNetProfit = parseFloat((totalPayout - totalWagered).toFixed(2));

    // Approved bKash deposits sum
    const approvedDeposits = await prisma.depositRequest.aggregate({
      where: { userId: id, status: "APPROVED" },
      _sum: { amount: true },
      _count: true,
    });

    const totalDeposited = approvedDeposits._sum.amount || 0;

    // Total admin manual credits sum
    const totalCreditsGranted = await prisma.creditTransfer.aggregate({
      where: { userId: id },
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        wallet: user.wallet,
      },
      analytics: {
        totalRounds,
        wonRounds,
        lostRounds,
        winRate,
        totalWagered: parseFloat(totalWagered.toFixed(2)),
        totalPayout: parseFloat(totalPayout.toFixed(2)),
        playerNetProfit,
        totalDeposited: parseFloat(totalDeposited.toFixed(2)),
        approvedDepositsCount: approvedDeposits._count,
        totalCreditsReceived: parseFloat((totalCreditsGranted._sum.amount || 0).toFixed(2)),
        gameTypeBreakdown: gameTypeCounts,
        firstGameDate: allRounds[allRounds.length - 1]?.createdAt || null,
        lastGameDate: allRounds[0]?.createdAt || null,
      },
      recentGameRounds: user.gameRounds,
      depositHistory: user.depositRequests,
      creditHistory: user.receivedCredits,
    });
  } catch (error) {
    console.error("Admin user deep analysis error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
