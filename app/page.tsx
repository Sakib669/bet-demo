"use client";

import { useState } from "react";
import { CoinFlip } from "@/components/games/CoinFlip";
import { DiceRoll } from "@/components/games/DiceRoll";
import { Mines } from "@/components/games/Mines";
import { BottomNav } from "@/components/BottomNav";
import {
  Coins,
  Dices,
  Bomb,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sparkles,
  Trophy,
  History,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("coin-flip");

  const games = [
    {
      id: "coin-flip",
      title: "Coin Flip",
      desc: "50/50 Classic • 1.98x Multiplier",
      icon: Coins,
      multiplier: "1.98x",
      tag: "POPULAR",
    },
    {
      id: "dice",
      title: "Dice Over/Under",
      desc: "Precision Slider • 99% RTP",
      icon: Dices,
      multiplier: "Up to 49.5x",
      tag: "HOT",
    },
    {
      id: "mines",
      title: "Mines 5x5",
      desc: "Step-by-step Cashout Grid",
      icon: Bomb,
      multiplier: "Up to 100x+",
      tag: "HIGH VOLATILITY",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Hero Announcement Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#1E293B] bg-gradient-to-r from-[#0A1026] via-[#060814] to-[#0A1026] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -left-20 top-0 h-48 w-48 rounded-full bg-[#0000F2]/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-[#00D2FF]/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0000F2]/50 bg-[#0000F2]/10 px-3 py-1 text-xs font-bold text-[#00D2FF] mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>LAUNCH EDITION • NEXT-GEN SIMULATION</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              FAIR, FAST & POSH <span className="text-[#00D2FF]">E-GAMING</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-400 leading-relaxed">
              Experience cryptographic provably fair mechanics with instant state updates. Powered by Next.js, Prisma, and PostgreSQL with zero real-money risk.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto">
            <div className="rounded-2xl border border-[#1E293B] bg-[#060814]/80 p-3 sm:p-4 text-center">
              <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-[#0000F2]/20 text-[#00D2FF]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="font-mono text-sm sm:text-base font-black text-white">99%</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Fair RTP</p>
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#060814]/80 p-3 sm:p-4 text-center">
              <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Zap className="h-4 w-4" />
              </div>
              <p className="font-mono text-sm sm:text-base font-black text-white">&lt;50ms</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Latency</p>
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#060814]/80 p-3 sm:p-4 text-center">
              <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <Trophy className="h-4 w-4" />
              </div>
              <p className="font-mono text-sm sm:text-base font-black text-white">100x</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">Max Multiplier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Selection Cards */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {games.map((g) => {
          const Icon = g.icon;
          const isActive = activeTab === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveTab(g.id)}
              className={`relative flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                isActive
                  ? "border-[#0000F2] bg-[#0A1026] shadow-cobalt-glow ring-1 ring-[#0000F2]"
                  : "border-[#1E293B] bg-[#0A1026]/50 hover:border-gray-700 hover:bg-[#0A1026]"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? "bg-[#0000F2] text-white shadow-cyan-glow"
                      : "bg-[#060814] text-gray-400 border border-[#1E293B]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm sm:text-base">{g.title}</span>
                    <span className="rounded bg-[#0000F2]/30 px-1.5 py-0.5 text-[9px] font-black text-[#00D2FF]">
                      {g.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{g.desc}</p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="font-mono text-xs font-black text-[#00D2FF]">{g.multiplier}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Game Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Game Stage (2 Columns on Desktop) */}
        <div className="lg:col-span-2">
          {activeTab === "coin-flip" && <CoinFlip />}
          {activeTab === "dice" && <DiceRoll />}
          {activeTab === "mines" && <Mines />}
          {activeTab === "lobby" && <CoinFlip />}
        </div>

        {/* Sidebar: Live Platform Activity & Simulation Details */}
        <div className="space-y-6">
          {/* Live Recent Simulation Hits */}
          <div className="rounded-2xl border border-[#1E293B] bg-[#0A1026]/80 p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#00D2FF]" />
                <h3 className="text-sm font-bold text-white">Live Activity</h3>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                REAL-TIME
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { game: "Coin Flip", user: "alex_99", bet: 100, win: 198, mult: "1.98x", won: true },
                { game: "Mines 5x5", user: "high_roller", bet: 250, win: 625, mult: "2.50x", won: true },
                { game: "Dice Roll", user: "player_one", bet: 50, win: 0, mult: "0.00x", won: false },
                { game: "Mines 5x5", user: "satoshi_x", bet: 500, win: 1850, mult: "3.70x", won: true },
                { game: "Dice Roll", user: "gemini_pro", bet: 100, win: 495, mult: "4.95x", won: true },
              ].map((round, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-[#1E293B]/70 bg-[#060814]/80 p-2.5 text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-200">{round.user}</span>
                    <span className="text-gray-500 text-[10px] block">{round.game}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold block ${
                        round.won ? "text-emerald-400" : "text-gray-500"
                      }`}
                    >
                      {round.won ? `+${round.win} PTS` : `-${round.bet} PTS`}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">{round.mult}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Architecture & Fairness Box */}
          <div className="rounded-2xl border border-[#0000F2]/30 bg-gradient-to-br from-[#0A1026] to-[#060814] p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-[#00D2FF]" />
              <h3 className="text-sm font-bold text-white">Simulation Standards</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              All games utilize deterministic HMAC-SHA256 seed hashing. Outcomes are computed prior to user interaction and verifiable in our database.
            </p>
            <div className="space-y-2 border-t border-[#1E293B] pt-3 text-[11px] text-gray-400">
              <div className="flex justify-between">
                <span>RNG Provider</span>
                <span className="text-white font-mono">Node.js Crypto</span>
              </div>
              <div className="flex justify-between">
                <span>Ledger Architecture</span>
                <span className="text-white font-mono">Double-Entry ACID</span>
              </div>
              <div className="flex justify-between">
                <span>Database Engine</span>
                <span className="text-white font-mono">PostgreSQL / Prisma</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Thumb Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
