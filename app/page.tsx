"use client";

import { useState } from "react";
import { Aviator } from "@/components/games/Aviator";
import { PenaltyShootout } from "@/components/games/PenaltyShootout";
import { CoinFlip } from "@/components/games/CoinFlip";
import { DiceRoll } from "@/components/games/DiceRoll";
import { Mines } from "@/components/games/Mines";
import { CasinoVerticalGameCard } from "@/components/CasinoVerticalGameCard";
import { BottomNav } from "@/components/BottomNav";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import {
  Coins,
  Dices,
  Bomb,
  Plane,
  Trophy,
  Activity,
  Sparkles,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Star,
  Flame,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("aviator");
  const { setIsTopUpOpen, refreshWallet } = useWallet();
  const { t, locale } = useLanguage();

  const handleRoundDone = () => {
    refreshWallet();
  };

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#040F26] text-white">
      {/* SECTION 1: MOSTBET HERO BANNER */}
      <section className="relative w-full bg-gradient-to-b from-[#08478E] via-[#051738] to-[#040F26] pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#0B5CB8]/50">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#051738] via-[#08478E] to-[#051738] p-6 sm:p-10 border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,107,0,0.25)_0%,_transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                {/* Star Emblem Capsule */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FFC700]/40 bg-[#040F26]/60 px-3.5 py-1 text-xs font-mono font-bold text-[#FFC700] mb-4 shadow-inner">
                  <Star className="h-3.5 w-3.5 fill-[#FFC700] text-[#FFC700]" />
                  <span>MOSTBET FAST GAMES ARENA • BANGLADESH</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] uppercase italic">
                  {locale === "bn" ? (
                    <>
                      ১০০% স্বচ্ছ <span className="text-[#FF6B00]">গেমিং সিমুলেশন</span>
                    </>
                  ) : (
                    <>
                      PROVABLY FAIR <span className="text-[#FF6B00]">SIMULATION</span>
                    </>
                  )}
                </h1>

                <p className="mt-3 text-xs sm:text-base text-[#8EA8C7] font-medium max-w-xl leading-relaxed">
                  {t("heroSubtitle")}
                </p>

                {/* Action Orange CTAs */}
                <div className="mt-7 flex flex-wrap items-center gap-3.5">
                  <button
                    onClick={() => {
                      const el = document.getElementById("arena-stage");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="btn-action-orange flex items-center gap-2 rounded-xl px-7 py-3.5 text-xs font-black shadow-lg"
                  >
                    <span>{t("launchArena")}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setIsTopUpOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-xs font-bold text-white transition-all hover:bg-white/20 active:scale-95"
                  >
                    <Sparkles className="h-4 w-4 text-[#FFC700]" />
                    <span>{t("claimCredits")}</span>
                  </button>
                </div>
              </div>

              {/* Star Loader Graphic Animation from Mostbet CSS */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#040F26]/70 border border-white/10 shadow-inner">
                <div className="star-loader-container mb-3">
                  <div className="star-loader-arc" />
                  <div className="star-loader-star" />
                </div>
                <span className="font-mono text-xs font-bold text-[#FFC700] uppercase tracking-wider">
                  HMAC-SHA256 ACTIVE
                </span>
                <span className="text-[10px] text-[#8EA8C7]">
                  {locale === "bn" ? "শূন্য ঝুঁকি সিমুলেশন" : "Zero Risk Simulation"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: VERTICAL GAME CARDS CATALOG (MOSTBET ARCHITECTURE) */}
      <section className="w-full py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between border-b border-[#08478E]/50 pb-4">
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#FF6B00]" />
              {locale === "bn" ? "জনপ্রিয় গেমস ক্যাটালগ (MOSTBET GAMES)" : "Top Games Catalog (Mostbet)"}
            </h2>
            <p className="text-xs text-[#8EA8C7]">
              {locale === "bn" ? "ক্লিক করে পছন্দের ইনস্ট্যান্ট গেম শুরু করুন" : "Select a card to play or run demo mode"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded bg-[#08478E] px-2.5 py-1 text-xs font-mono font-bold text-[#FFC700] border border-white/10">
              5 FAST GAMES ONLINE
            </span>
          </div>
        </div>

        {/* Responsive Grid: 5 Mostbet vertical game cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Aviator */}
          <CasinoVerticalGameCard
            title={t("aviatorTitle")}
            category={locale === "bn" ? "ক্র্যাশ গেম" : "Crash Flight"}
            multiplier="100x+"
            provider="SPRIBE"
            badge="HOT #1"
            imageSrc="/images/games/aviator.svg"
            imageBg="bg-gradient-to-tr from-red-950 via-[#08478E] to-[#FF6B00]"
            isActive={activeTab === "aviator"}
            onSelect={() => {
              setActiveTab("aviator");
              const el = document.getElementById("arena-stage");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            playText={locale === "bn" ? "খেলুন" : "PLAY NOW"}
            demoText={locale === "bn" ? "ডেমো রান" : "DEMO RUN"}
          />

          {/* 2. Penalty Shoot-out */}
          <CasinoVerticalGameCard
            title={t("penaltyTitle")}
            category={locale === "bn" ? "ফুটবল পেনাল্টি" : "Penalty Shoot"}
            multiplier="30.72x"
            provider="EVOPLAY"
            badge="SPORTS"
            imageSrc="/images/games/penalty.svg"
            imageBg="bg-gradient-to-tr from-emerald-950 via-[#08478E] to-[#FFC700]"
            isActive={activeTab === "penalty"}
            onSelect={() => {
              setActiveTab("penalty");
              const el = document.getElementById("arena-stage");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            playText={locale === "bn" ? "খেলুন" : "PLAY NOW"}
            demoText={locale === "bn" ? "ডেমো রান" : "DEMO RUN"}
          />

          {/* 3. Mines */}
          <CasinoVerticalGameCard
            title={t("minesTitle")}
            category={locale === "bn" ? "মাইনস ৫x৫" : "Crash & Mines"}
            multiplier="100x+"
            provider="AMARIX"
            badge="TOP WIN"
            imageSrc="/images/games/mines.svg"
            imageBg="bg-gradient-to-tr from-[#08478E] via-[#FF6B00] to-orange-700"
            isActive={activeTab === "mines"}
            onSelect={() => {
              setActiveTab("mines");
              const el = document.getElementById("arena-stage");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            playText={locale === "bn" ? "খেলুন" : "PLAY NOW"}
            demoText={locale === "bn" ? "ডেমো রান" : "DEMO RUN"}
          />

          {/* 4. Coin Flip */}
          <CasinoVerticalGameCard
            title={t("coinFlipTitle")}
            category={locale === "bn" ? "কয়েন ফ্লিপ" : "Classic Table"}
            multiplier="1.98x"
            provider="HERMES RNG"
            badge="99% RTP"
            imageSrc="/images/games/coin-flip.svg"
            imageBg="bg-gradient-to-tr from-[#08478E] via-[#0B5CB8] to-[#FF6B00]"
            isActive={activeTab === "coin-flip"}
            onSelect={() => {
              setActiveTab("coin-flip");
              const el = document.getElementById("arena-stage");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            playText={locale === "bn" ? "খেলুন" : "PLAY NOW"}
            demoText={locale === "bn" ? "ডেমো রান" : "DEMO RUN"}
          />

          {/* 5. Dice Roll */}
          <CasinoVerticalGameCard
            title={t("diceTitle")}
            category={locale === "bn" ? "ডাইস ওভার/আন্ডার" : "Instant Multiplier"}
            multiplier="49.50x"
            provider="EVOLUTION"
            badge="CUSTOM"
            imageSrc="/images/games/dice.svg"
            imageBg="bg-gradient-to-tr from-[#051738] via-[#08478E] to-[#FFC700]"
            isActive={activeTab === "dice"}
            onSelect={() => {
              setActiveTab("dice");
              const el = document.getElementById("arena-stage");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            playText={locale === "bn" ? "খেলুন" : "PLAY NOW"}
            demoText={locale === "bn" ? "ডেমো রান" : "DEMO RUN"}
          />
        </div>
      </section>

      {/* SECTION 3: ARENA STAGE & LIVE AUDIT BENTO */}
      <section id="arena-stage" className="w-full py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#08478E]/50">
        {/* Game Arena Navigation Bar */}
        <div className="mb-6 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 pb-2">
          <div className="flex items-center gap-2">
            {[
              { id: "aviator", label: locale === "bn" ? "এভিয়েটর" : "Aviator", icon: Plane },
              { id: "penalty", label: locale === "bn" ? "পেনাল্টি" : "Penalty", icon: Trophy },
              { id: "mines", label: locale === "bn" ? "মাইনস" : "Mines", icon: Bomb },
              { id: "coin-flip", label: locale === "bn" ? "কয়েন ফ্লিপ" : "Coin Flip", icon: Coins },
              { id: "dice", label: locale === "bn" ? "ডাইস" : "Dice", icon: Dices },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-[#FF6B00] text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)]"
                      : "mst-card text-gray-300 hover:text-white hover:border-[#FF6B00]/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#8EA8C7]">
            <ShieldCheck className="h-4 w-4 text-[#FFC700]" />
            <span>Deterministic Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Active Game Console: 8 Columns */}
          <div className="col-span-12 lg:col-span-8">
            {activeTab === "aviator" && <Aviator onRoundComplete={handleRoundDone} />}
            {activeTab === "penalty" && <PenaltyShootout onRoundComplete={handleRoundDone} />}
            {activeTab === "mines" && <Mines />}
            {activeTab === "coin-flip" && <CoinFlip />}
            {activeTab === "dice" && <DiceRoll />}
            {activeTab === "lobby" && <Aviator onRoundComplete={handleRoundDone} />}
          </div>

          {/* Right Activity & Stats Column: 4 Columns */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Live Streaming Feed */}
            <div className="mst-card rounded-2xl p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-[#08478E]/50 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#FFC700]" />
                  <h3 className="text-sm font-black text-white uppercase">{t("liveActivity")}</h3>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t("streaming")}
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { game: locale === "bn" ? "এভিয়েটর" : "Aviator", user: "shakib_75", bet: 250, win: 2625, mult: "10.50x", won: true },
                  { game: locale === "bn" ? "পেনাল্টি" : "Penalty", user: "tanvir_bd", bet: 100, win: 768, mult: "7.68x", won: true },
                  { game: locale === "bn" ? "এভিয়েটর" : "Aviator", user: "hasan_dhaka", bet: 500, win: 0, mult: "1.08x", won: false },
                  { game: locale === "bn" ? "মাইনস ৫x৫" : "Mines 5x5", user: "sultana_dhk", bet: 300, win: 1110, mult: "3.70x", won: true },
                  { game: locale === "bn" ? "কয়েন ফ্লিপ" : "Coin Flip", user: "fahim_ctg", bet: 150, win: 297, mult: "1.98x", won: true },
                ].map((round, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-[#08478E]/40 bg-[#040F26] p-2.5 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{round.user}</span>
                      <span className="text-[#8EA8C7] text-[10px] block font-mono">{round.game}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold block tabular-nums ${
                          round.won ? "text-emerald-400" : "text-gray-400"
                        }`}
                      >
                        {round.won ? `+${round.win} PTS` : `-${round.bet} PTS`}
                      </span>
                      <span className="text-[10px] text-[#FFC700] font-mono tabular-nums">{round.mult}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Card */}
            <div className="mst-card rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="h-4 w-4 text-[#FFC700]" />
                <h3 className="text-sm font-black text-white uppercase">{t("platformBlueprint")}</h3>
              </div>
              <p className="text-xs text-[#8EA8C7] leading-relaxed mb-4">
                {t("blueprintDesc")}
              </p>
              <div className="space-y-2 border-t border-[#08478E]/40 pt-3 text-[11px] font-mono text-[#8EA8C7]">
                <div className="flex justify-between">
                  <span>{t("rngStandard")}</span>
                  <span className="text-white font-bold">Node.js CSPRNG</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("databaseSync")}</span>
                  <span className="text-white font-bold">Double-Entry ACID</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("stateEngine")}</span>
                  <span className="text-white font-bold">Next.js 15 App Router</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-[#08478E]/50 py-12 bg-[#040F26] text-center text-xs text-[#8EA8C7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-white mb-3 font-bold uppercase tracking-wider">
            <span>MOSTBET ARCHITECTURE DEMO</span>
            <span>•</span>
            <span>{t("eduPurpose")}</span>
            <span>•</span>
            <span>{t("zeroMonetary")}</span>
          </div>
          <p className="text-[11px] text-[#5B7596] max-w-xl mx-auto leading-relaxed">
            {t("disclaimer")}
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Thumb Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}
