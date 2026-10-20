"use client";

import { useState } from "react";
import { CoinFlip } from "@/components/games/CoinFlip";
import { DiceRoll } from "@/components/games/DiceRoll";
import { Mines } from "@/components/games/Mines";
import { BottomNav } from "@/components/BottomNav";
import { useWallet } from "@/lib/wallet-context";
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
  ArrowUpRight,
  ChevronRight,
  Fingerprint,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("coin-flip");
  const { setIsTopUpOpen } = useWallet();

  const games = [
    {
      id: "coin-flip",
      title: "Coin Flip",
      desc: "Binary odds with 1.98x return",
      icon: Coins,
      multiplier: "1.98x",
      tag: "Deterministic",
    },
    {
      id: "dice",
      title: "Dice Over / Under",
      desc: "Slider target with 99.0% RTP",
      icon: Dices,
      multiplier: "49.50x",
      tag: "Configurable",
    },
    {
      id: "mines",
      title: "Mines 5x5 Grid",
      desc: "Step-by-step cashout matrix",
      icon: Bomb,
      multiplier: "100x+",
      tag: "Dynamic Risk",
    },
  ];

  return (
    <main className="w-full max-w-full overflow-x-hidden">
      {/* SECTION 1: ATTENTION (HERO) */}
      <section className="relative w-full pt-16 pb-20 md:pt-24 md:pb-28">
        {/* Cinematic Radial Backwash */}
        <div className="absolute left-1/2 top-0 h-[500px] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0000F2]/20 via-[#00D2FF]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Status Capsule */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono font-bold text-emerald-400 mb-8 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>HERMES ENGINE ONLINE • 0% REAL-WORLD EXPOSURE</span>
          </div>

          {/* 2-Line Ultra-Wide Headline */}
          <div className="max-w-6xl mx-auto w-full">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.06] text-balance">
              Deterministic verification meets <span className="text-[#00D2FF]">next-generation simulation.</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-6 text-sm sm:text-lg text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed text-balance">
            Inspect cryptographic server seeds, test probabilistic models, and execute instant game state transitions with zero financial risk.
          </p>

          {/* High-Contrast Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById("arena-stage");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-tactile flex items-center gap-2 rounded-2xl border border-[#0000F2] bg-[#0000F2] px-7 py-4 text-sm font-black tracking-wide text-white shadow-cobalt-glow active:scale-[0.985]"
            >
              <span>Launch Arena</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsTopUpOpen(true)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 text-sm font-bold text-gray-200 transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.985]"
            >
              <Sparkles className="h-4 w-4 text-[#00D2FF]" />
              <span>Claim Simulation Credits</span>
            </button>
          </div>

          {/* Streaming Audit Bar */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <span className="text-[10px] uppercase font-bold text-gray-500 font-mono">House Edge</span>
              <p className="font-mono text-xl font-black text-white tabular-nums mt-0.5">1.0%</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">99.0% Return to Player</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <span className="text-[10px] uppercase font-bold text-gray-500 font-mono">Execution Latency</span>
              <p className="font-mono text-xl font-black text-emerald-400 tabular-nums mt-0.5">12ms</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Node.js CSPRNG Pipeline</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <span className="text-[10px] uppercase font-bold text-gray-500 font-mono">Audit Standard</span>
              <p className="font-mono text-xl font-black text-[#00D2FF] tabular-nums mt-0.5">SHA-256</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">HMAC Deterministic Seeds</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <span className="text-[10px] uppercase font-bold text-gray-500 font-mono">Ledger Model</span>
              <p className="font-mono text-xl font-black text-amber-300 tabular-nums mt-0.5">ACID</p>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Double-Entry Balance</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: INTEREST & INTERACTION (ARENA STAGE & BENTO GRID) */}
      <section id="arena-stage" className="w-full py-16 md:py-24 border-t border-white/10 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Segmented Game Navigation */}
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Active Simulation Arena</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Select a game module to begin verification</p>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto p-1.5 rounded-2xl bg-black/60 border border-white/10">
              {games.map((g) => {
                const Icon = g.icon;
                const isActive = activeTab === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setActiveTab(g.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? "bg-[#0000F2] text-white shadow-cobalt-glow"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{g.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gapless Interlocking Bento Grid */}
          <div className="grid grid-cols-12 grid-flow-dense gap-6">
            {/* Active Game Stage: col-span-12 lg:col-span-8 */}
            <div className="col-span-12 lg:col-span-8">
              {activeTab === "coin-flip" && <CoinFlip />}
              {activeTab === "dice" && <DiceRoll />}
              {activeTab === "mines" && <Mines />}
              {activeTab === "lobby" && <CoinFlip />}
            </div>

            {/* Live Streaming Activity Feed: col-span-12 lg:col-span-4 */}
            <div className="col-span-12 lg:col-span-4 flex flex-col">
              <div className="glass-surface rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#00D2FF]" />
                      <h3 className="text-sm font-bold text-white">Live Activity Feed</h3>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      STREAMING
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { game: "Coin Flip", user: "khalid_92", bet: 150, win: 297, mult: "1.98x", won: true },
                      { game: "Mines 5x5", user: "tanvir_bd", bet: 200, win: 580, mult: "2.90x", won: true },
                      { game: "Dice Over", user: "player_one", bet: 75, win: 0, mult: "0.00x", won: false },
                      { game: "Mines 5x5", user: "sultana_x", bet: 300, win: 1110, mult: "3.70x", won: true },
                      { game: "Dice Under", user: "dev_audit", bet: 100, win: 495, mult: "4.95x", won: true },
                    ].map((round, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-3 text-xs transition-colors hover:border-white/15"
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

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>Cryptographic Protocol</span>
                  <span className="text-[#00D2FF]">HMAC-SHA256</span>
                </div>
              </div>
            </div>

            {/* Row 2 Bento Card 1: Provably Fair Architecture (col-span-12 lg:col-span-7) */}
            <div className="col-span-12 lg:col-span-7 glass-surface rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0000F2]/20 text-[#00D2FF] border border-[#0000F2]/40">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Mathematical Fairness Proof</h3>
                  <p className="text-xs text-gray-400">Zero operator intervention guaranteed by code</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
                Prior to every spin or roll, the server generates a cryptographically secure 256-bit random seed and broadcasts its SHA-256 hash. When combined with your client seed, the result is calculated deterministically.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
                  <span className="text-gray-500 block text-[10px]">Algorithm</span>
                  <span className="text-white font-bold">HMAC-SHA256</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
                  <span className="text-gray-500 block text-[10px]">Verification</span>
                  <span className="text-emerald-400 font-bold">Pre-Committed</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
                  <span className="text-gray-500 block text-[10px]">Audit Log</span>
                  <span className="text-[#00D2FF] font-bold">Immutable</span>
                </div>
              </div>
            </div>

            {/* Row 2 Bento Card 2: Engine Blueprint (col-span-12 lg:col-span-5) */}
            <div className="col-span-12 lg:col-span-5 glass-surface rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Full-Stack Blueprint</h3>
                  <p className="text-xs text-gray-400">Engine and database architecture</p>
                </div>
              </div>
              <div className="space-y-3 text-xs font-mono text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Framework</span>
                  <span className="text-white font-bold">Next.js 15 App Router</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">ORM & Ledger</span>
                  <span className="text-white font-bold">Prisma with SQLite/Postgres</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500">Styling System</span>
                  <span className="text-white font-bold">Tailwind with Hermes Theme</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Runtime Standard</span>
                  <span className="text-white font-bold">Node.js Engine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ACTION & COMPLIANCE FOOTER */}
      <footer className="w-full border-t border-white/10 py-16 bg-[#060814] text-center text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400 mb-4 font-medium">
            <span>Hermes Simulation Framework</span>
            <span>•</span>
            <span>Educational Software Architecture</span>
            <span>•</span>
            <span>Zero Monetary Transaction Rails</span>
          </div>
          <p className="text-[11px] text-gray-600 max-w-xl mx-auto leading-relaxed">
            This platform is an open-source software demonstration illustrating provably fair cryptographic RNG design and double-entry transaction ledgers. All currency points are virtual simulation tokens with zero real-world value.
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Thumb Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}
