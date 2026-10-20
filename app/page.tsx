"use client";

import { useState } from "react";
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
  Activity,
  Sparkles,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Star,
  Flame,
  Trophy,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("coin-flip");
  const { setIsTopUpOpen } = useWallet();
  const { t, locale } = useLanguage();

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#040F26] text-white">
      {/* SECTION 1: MOSTBET HERO BANNER CAROUSEL */}
      <section className="relative w-full bg-gradient-to-b from-[#08478E] via-[#051738] to-[#040F26] pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#0B5CB8]/50">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#051738] via-[#08478E] to-[#051738] p-6 sm:p-10 border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,107,0,0.25)_0%,_transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                {/* Star Emblem Capsule */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FFC700]/40 bg-[#040F26]/60 px-3.5 py-1 text-xs font-mono font-bold text-[#FFC700] mb-4 shadow-inner">
                  <Star className="h-3.5 w-3.5 fill-[#FFC700] text-[#FFC700]" />
                  <span>MOSTBET SIMULATION PORTAL • BANGLADESH</span>
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

      {/* SECTION 2: VERTICAL GAME CARDS GRID (MOSTBET ARCHITECTURE) */}
      <section className="w-full py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#FF6B00]" />
              {locale === "bn" ? "জনপ্রিয় গেমস ক্যাটালগ" : "Top Games Catalog"}
            </h2>
            <p className="text-xs text-[#8EA8C7]">
              {locale === "bn" ? "ক্লিক করে পছন্দের গেম শুরু করুন" : "Select a card to play or run demo"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded bg-[#08478E] px-2.5 py-1 text-xs font-mono font-bold text-[#FFC700] border border-white/10">
              3 ACTIVE ENGINES
            </span>
          </div>
        </div>

        {/* Responsive Grid: 1 col on mobile, 3 cols on tablet/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <CasinoVerticalGameCard
            title={t("coinFlipTitle")}
            category={locale === "bn" ? "কয়েন ফ্লিপ গেম" : "Classic Table"}
            multiplier="1.98x"
            provider="HERMES RNG"
            badge="HOT"
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

          <CasinoVerticalGameCard
            title={t("diceTitle")}
            category={locale === "bn" ? "ডাইস ওভার / আন্ডার" : "Instant Multiplier"}
            multiplier="49.50x"
            provider="EVOLUTION"
            badge="99% RTP"
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

          <CasinoVerticalGameCard
            title={t("minesTitle")}
            category={locale === "bn" ? "মাইনস ৫x৫ গ্রিড" : "Crash & Mines"}
            multiplier="100x+"
            provider="AMARIX"
            badge="TOP WIN"
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
        </div>
      </section>

      {/* SECTION 3: ARENA STAGE & LIVE AUDIT BENTO */}
      <section id="arena-stage" className="w-full py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-12 gap-6">
          {/* Active Game Console: 8 Columns */}
          <div className="col-span-12 lg:col-span-8">
            {activeTab === "coin-flip" && <CoinFlip />}
            {activeTab === "dice" && <DiceRoll />}
            {activeTab === "mines" && <Mines />}
            {activeTab === "lobby" && <CoinFlip />}
          </div>

          {/* Right Activity & Stats Column: 4 Columns */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Live Streaming Feed */}
            <div className="mst-card rounded-3xl p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#FFC700]" />
                  <h3 className="text-sm font-bold text-white uppercase">{t("liveActivity")}</h3>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t("streaming")}
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { game: locale === "bn" ? "কয়েন ফ্লিপ" : "Coin Flip", user: "shakib_75", bet: 150, win: 297, mult: "1.98x", won: true },
                  { game: locale === "bn" ? "মাইনস ৫x৫" : "Mines 5x5", user: "tanvir_bd", bet: 200, win: 580, mult: "2.90x", won: true },
                  { game: locale === "bn" ? "ডাইস ওভার" : "Dice Over", user: "player_one", bet: 75, win: 0, mult: "0.00x", won: false },
                  { game: locale === "bn" ? "মাইনস ৫x৫" : "Mines 5x5", user: "sultana_dhk", bet: 300, win: 1110, mult: "3.70x", won: true },
                  { game: locale === "bn" ? "ডাইস আন্ডার" : "Dice Under", user: "fahim_ctg", bet: 100, win: 495, mult: "4.95x", won: true },
                ].map((round, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-[#030B1C] p-2.5 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{round.user}</span>
                      <span className="text-[#8EA8C7] text-[10px] block font-mono">{round.game}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold block tabular-nums ${
                          round.won ? "text-emerald-400" : "text-[#8EA8C7]"
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
            <div className="mst-card rounded-3xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="h-4 w-4 text-[#FFC700]" />
                <h3 className="text-sm font-bold text-white uppercase">{t("platformBlueprint")}</h3>
              </div>
              <p className="text-xs text-[#8EA8C7] leading-relaxed mb-4">
                {t("blueprintDesc")}
              </p>
              <div className="space-y-2 border-t border-white/10 pt-3 text-[11px] font-mono text-[#8EA8C7]">
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
      <footer className="w-full border-t border-white/10 py-12 bg-[#030B1C] text-center text-xs text-[#8EA8C7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-white mb-3 font-bold">
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
