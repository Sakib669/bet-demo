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
  Activity,
  Sparkles,
  Trophy,
  Cpu,
  Lock,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("coin-flip");

  const games = [
    {
      id: "coin-flip",
      title: "Coin Flip",
      desc: "Binary odds • 1.98x payout",
      icon: Coins,
      multiplier: "1.98x",
      badge: "Fastest",
    },
    {
      id: "dice",
      title: "Dice Over / Under",
      desc: "Slider target • 99% RTP",
      icon: Dices,
      multiplier: "49.5x",
      badge: "Popular",
    },
    {
      id: "mines",
      title: "Mines 5x5",
      desc: "Dynamic cashout grid",
      icon: Bomb,
      multiplier: "100x+",
      badge: "High Return",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Hero Command Banner */}
      <div className="glass-surface relative mb-8 overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-2xl">
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#0000F2]/20 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-[#00D2FF]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>DETERMINISTIC VERIFICATION ONLINE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white text-balance">
              Cryptographically Fair <span className="text-[#00D2FF]">Gaming Engine</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-400 font-medium leading-relaxed max-w-xl">
              Inspect server seeds, test mathematical betting models, and experience zero-latency game states powered by Next.js, Prisma, and PostgreSQL.
            </p>
          </div>

          {/* Asymmetric Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full md:w-auto">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 sm:p-4 text-center shadow-inner">
              <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-[#0000F2]/20 text-[#00D2FF]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="font-mono text-sm sm:text-base font-black text-white tabular-nums">99.0%</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Base RTP</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 sm:p-4 text-center shadow-inner">
              <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Zap className="h-4 w-4" />
              </div>
              <p className="font-mono text-sm sm:text-base font-black text-emerald-300 tabular-nums">12ms</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Resolution</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 sm:p-4 text-center shadow-inner">
              <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <Trophy className="h-4 w-4" />
              </div>
              <p className="font-mono text-sm sm:text-base font-black text-amber-300 tabular-nums">100x</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ceiling</p>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Game Selection Controls */}
      <div className="mb-8 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {games.map((g) => {
          const Icon = g.icon;
          const isActive = activeTab === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveTab(g.id)}
              className={`relative flex items-center justify-between rounded-2xl p-4 text-left transition-all duration-200 ${
                isActive
                  ? "border border-[#0000F2] bg-[#0C1432] shadow-[0_0_25px_rgba(0,0,242,0.35)] ring-1 ring-[#0000F2]"
                  : "border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] active:scale-98"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? "bg-[#0000F2] text-white shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                      : "bg-black/40 text-gray-400 border border-white/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm sm:text-base">{g.title}</span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#00D2FF]">
                      {g.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">{g.desc}</p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="font-mono text-xs font-black text-[#00D2FF] tabular-nums">{g.multiplier}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Game Arena Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Active Game Stage (2 Columns on Desktop) */}
        <div className="lg:col-span-2">
          {activeTab === "coin-flip" && <CoinFlip />}
          {activeTab === "dice" && <DiceRoll />}
          {activeTab === "mines" && <Mines />}
          {activeTab === "lobby" && <CoinFlip />}
        </div>

        {/* Sidebar: Platform Feed & Cryptographic Specification */}
        <div className="space-y-6">
          {/* Live Recent Simulation Hits */}
          <div className="glass-surface rounded-3xl p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#00D2FF]" />
                <h3 className="text-sm font-bold text-white">Live Activity Feed</h3>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                STREAMING
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { game: "Coin Flip", user: "khalid_92", bet: 150, win: 297, mult: "1.98x", won: true },
                { game: "Mines 5x5", user: "tanvir_bd", bet: 200, win: 580, mult: "2.90x", won: true },
                { game: "Dice Over", user: "player_one", bet: 75, win: 0, mult: "0.00x", won: false },
                { game: "Mines 5x5", user: "sultana_x", bet: 300, win: 1110, mult: "3.70x", won: true },
                { game: "Dice Under", user: "dev_audit", bet: 100, win: 495, mult: "4.95x", won: true },
              ].map((round, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 p-2.5 text-xs transition-colors hover:border-white/15"
                >
                  <div>
                    <span className="font-bold text-gray-200">{round.user}</span>
                    <span className="text-gray-500 text-[10px] block font-mono">{round.game}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold block tabular-nums ${
                        round.won ? "text-emerald-400" : "text-gray-500"
                      }`}
                    >
                      {round.won ? `+${round.win} PTS` : `-${round.bet} PTS`}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono tabular-nums">{round.mult}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Engine Specs Box */}
          <div className="glass-surface rounded-3xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-4 w-4 text-[#00D2FF]" />
              <h3 className="text-sm font-bold text-white">Platform Blueprint</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Deterministic outcomes generated by server-side HMAC-SHA256 seeds. Client seeds combined at request time ensure zero operator bias.
            </p>
            <div className="space-y-2.5 border-t border-white/10 pt-3 text-[11px] text-gray-400 font-mono">
              <div className="flex justify-between">
                <span>RNG Standard</span>
                <span className="text-white">CSPRNG Node.js</span>
              </div>
              <div className="flex justify-between">
                <span>Database Sync</span>
                <span className="text-white">ACID Double-Entry</span>
              </div>
              <div className="flex justify-between">
                <span>State Engine</span>
                <span className="text-white">Prisma / Next.js 15</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-white/10 pt-8 pb-12 text-center text-xs text-gray-500">
        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 mb-3">
          <span>Simulation Software v1.2</span>
          <span>•</span>
          <span>Zero Real-Money Risk</span>
          <span>•</span>
          <span>Provably Fair Architecture</span>
        </div>
        <p className="text-[11px] text-gray-600 max-w-lg mx-auto leading-relaxed">
          This platform is an open-source educational software architecture demonstrator. Virtual points hold no financial value and cannot be redeemed for real currency.
        </p>
      </footer>

      {/* Mobile Bottom Thumb Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
