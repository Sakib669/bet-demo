"use client";

import { useState } from "react";
import { WinGo } from "@/components/games/WinGo";
import { DragonTiger } from "@/components/games/DragonTiger";
import { CrazyWheel } from "@/components/games/CrazyWheel";
import { Aviator } from "@/components/games/Aviator";
import { Mines } from "@/components/games/Mines";
import { CasinoVerticalGameCard } from "@/components/CasinoVerticalGameCard";
import { BottomNav } from "@/components/BottomNav";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import {
  Timer,
  Flame,
  Disc3,
  Plane,
  Bomb,
  Activity,
  Sparkles,
  Cpu,
  ChevronRight,
  ShieldCheck,
  Star,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("wingo");
  const { setIsTopUpOpen, refreshWallet } = useWallet();
  const { t, locale } = useLanguage();

  const handleRoundDone = () => {
    refreshWallet();
  };

  return (
    <main className="w-full max-w-full overflow-x-hidden bg-[#081329] text-white">
      {/* SECTION 1: CV666 FAST GAMES HERO BANNER */}
      <section className="relative w-full bg-gradient-to-b from-[#193e87] via-[#0e1f3d] to-[#081329] pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#2d84f9]/50">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0e1f3d] via-[#193e87] to-[#0e1f3d] p-6 sm:p-10 border border-white/15 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,107,0,0.25)_0%,_transparent_70%)] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="max-w-2xl">
                {/* Star Emblem Capsule */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#fedbbb]/40 bg-[#081329]/60 px-3.5 py-1 text-xs font-mono font-bold text-[#fedbbb] mb-4 shadow-inner">
                  <Star className="h-3.5 w-3.5 fill-[#fedbbb] text-[#fedbbb]" />
                  <span>CV666 FAST LOTTERY & LIVE GAMES • BANGLADESH</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] uppercase italic">
                  {locale === "bn" ? (
                    <>
                      ১০০% স্বচ্ছ <span className="text-[#fc7219]">লটারি ও লাইভ গেম</span>
                    </>
                  ) : (
                    <>
                      PROVABLY FAIR <span className="text-[#fc7219]">LIVE GAMES</span>
                    </>
                  )}
                </h1>

                <p className="mt-3 text-xs sm:text-base text-[#94caf9] font-medium max-w-xl leading-relaxed">
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
                    <Sparkles className="h-4 w-4 text-[#fedbbb]" />
                    <span>{t("claimCredits")}</span>
                  </button>
                </div>
              </div>

              {/* Live Status Container */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#081329]/70 border border-white/10 shadow-inner">
                <div className="star-loader-container mb-3">
                  <div className="star-loader-arc" />
                  <div className="star-loader-star" />
                </div>
                <span className="font-mono text-xs font-bold text-[#fedbbb] uppercase tracking-wider">
                  HMAC-SHA256 CSPRNG
                </span>
                <span className="text-[10px] text-[#94caf9]">
                  {locale === "bn" ? "প্রুভেবলি ফেয়ার লাইভ রাউন্ডস" : "CV666 Provably Fair Dynamic Engine"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: VERTICAL GAME CARDS CATALOG (CV666 REPLACEMENT LINEUP) */}
      <section className="w-full py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between border-b border-[#193e87]/50 pb-4">
          <div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#fc7219]" />
              {locale === "bn" ? "জনপ্রিয় গেমস ক্যাটালগ (CV666 GAMES)" : "Top Games Catalog (CV666)"}
            </h2>
            <p className="text-xs text-[#94caf9]">
              {locale === "bn" ? "ক্লিক করে পছন্দের ইনস্ট্যান্ট গেম শুরু করুন" : "Select a card to play or run live simulation"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded bg-[#193e87] px-2.5 py-1 text-xs font-mono font-bold text-[#fedbbb] border border-white/10">
              5 CV666 GAMES ONLINE
            </span>
          </div>
        </div>

        {/* Responsive Grid: 5 CV666 vertical game cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* 1. Win Go (Color Trading Lottery) */}
          <CasinoVerticalGameCard
            title={t("wingoTitle")}
            category={locale === "bn" ? "কালার ট্রেডিং" : "Color Lottery"}
            multiplier="9.0x"
            provider="CV666"
            badge="HOT #1"
            imageSrc="/images/games/wingo.svg"
            imageBg="bg-gradient-to-tr from-emerald-950 via-[#193e87] to-purple-900"
            isActive={activeTab === "wingo"}
            onSelect={() => {
              setActiveTab("wingo");
              const el = document.getElementById("arena-stage");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            playText={locale === "bn" ? "খেলুন" : "PLAY NOW"}
            demoText={locale === "bn" ? "ডেমো রান" : "DEMO RUN"}
          />

          {/* 2. Dragon Tiger */}
          <CasinoVerticalGameCard
            title={t("dragonTigerTitle")}
            category={locale === "bn" ? "এশিয়ান লাইভ টেবিল" : "Asian Table"}
            multiplier="9.0x"
            provider="EVOLUTION"
            badge="LIVE DEAL"
            imageSrc="/images/games/dragon-tiger.svg"
            imageBg="bg-gradient-to-tr from-rose-950 via-[#0e1f3d] to-blue-900"
            isActive={activeTab === "dragon-tiger"}
            onSelect={() => {
              setActiveTab("dragon-tiger");
              const el = document.getElementById("arena-stage");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            playText={locale === "bn" ? "খেলুন" : "PLAY NOW"}
            demoText={locale === "bn" ? "ডেমো রান" : "DEMO RUN"}
          />

          {/* 3. Crazy Wheel */}
          <CasinoVerticalGameCard
            title={t("crazyWheelTitle")}
            category={locale === "bn" ? "মানি হুইল" : "Money Wheel"}
            multiplier="50.0x"
            provider="PRAGMATIC"
            badge="50X MAX"
            imageSrc="/images/games/wheel.svg"
            imageBg="bg-gradient-to-tr from-[#193e87] via-[#fc7219] to-orange-700"
            isActive={activeTab === "wheel"}
            onSelect={() => {
              setActiveTab("wheel");
              const el = document.getElementById("arena-stage");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            playText={locale === "bn" ? "খেলুন" : "PLAY NOW"}
            demoText={locale === "bn" ? "ডেমো রান" : "DEMO RUN"}
          />

          {/* 4. Aviator */}
          <CasinoVerticalGameCard
            title={t("aviatorTitle")}
            category={locale === "bn" ? "ক্র্যাশ গেম" : "Crash Flight"}
            multiplier="100x+"
            provider="SPRIBE"
            badge="POPULAR"
            imageSrc="/images/games/aviator.svg"
            imageBg="bg-gradient-to-tr from-red-950 via-[#193e87] to-[#fc7219]"
            isActive={activeTab === "aviator"}
            onSelect={() => {
              setActiveTab("aviator");
              const el = document.getElementById("arena-stage");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            playText={locale === "bn" ? "খেলুন" : "PLAY NOW"}
            demoText={locale === "bn" ? "ডেমো রান" : "DEMO RUN"}
          />

          {/* 5. Mines */}
          <CasinoVerticalGameCard
            title={t("minesTitle")}
            category={locale === "bn" ? "মাইনস ৫x৫" : "Crash & Mines"}
            multiplier="100x+"
            provider="AMARIX"
            badge="99% RTP"
            imageSrc="/images/games/mines.svg"
            imageBg="bg-gradient-to-tr from-[#0e1f3d] via-[#193e87] to-[#fedbbb]"
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
      <section id="arena-stage" className="w-full py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#193e87]/50">
        {/* Game Arena Navigation Bar */}
        <div className="mb-6 flex items-center justify-between overflow-x-auto no-scrollbar gap-2 pb-2">
          <div className="flex items-center gap-2">
            {[
              { id: "wingo", label: locale === "bn" ? "উইন গো ৩০ সে." : "Win Go 30s", icon: Timer },
              { id: "dragon-tiger", label: locale === "bn" ? "ড্রাগন টাইগার" : "Dragon Tiger", icon: Flame },
              { id: "wheel", label: locale === "bn" ? "ক্রেজি হুইল" : "Crazy Wheel", icon: Disc3 },
              { id: "aviator", label: locale === "bn" ? "এভিয়েটর" : "Aviator", icon: Plane },
              { id: "mines", label: locale === "bn" ? "মাইনস ৫x৫" : "Mines 5x5", icon: Bomb },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-[#fc7219] text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)]"
                      : "mst-card text-gray-300 hover:text-white hover:border-[#fc7219]/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#94caf9]">
            <ShieldCheck className="h-4 w-4 text-[#fedbbb]" />
            <span>CV666 Provably Fair</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Active Game Console: 8 Columns */}
          <div className="col-span-12 lg:col-span-8">
            {activeTab === "wingo" && <WinGo onRoundComplete={handleRoundDone} />}
            {activeTab === "dragon-tiger" && <DragonTiger onRoundComplete={handleRoundDone} />}
            {activeTab === "wheel" && <CrazyWheel onRoundComplete={handleRoundDone} />}
            {activeTab === "aviator" && <Aviator onRoundComplete={handleRoundDone} />}
            {activeTab === "mines" && <Mines />}
          </div>

          {/* Right Activity & Stats Column: 4 Columns */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Live Streaming Feed */}
            <div className="mst-card rounded-2xl p-5 shadow-xl">
              <div className="mb-4 flex items-center justify-between border-b border-[#193e87]/50 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#fedbbb]" />
                  <h3 className="text-sm font-black text-white uppercase">{t("liveActivity")}</h3>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {t("streaming")}
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  { game: locale === "bn" ? "উইন গো ৩০ সে." : "Win Go 30s", user: "shakib_75", bet: 250, win: 2250, mult: "9.00x", won: true },
                  { game: locale === "bn" ? "ড্রাগন টাইগার" : "Dragon Tiger", user: "tanvir_bd", bet: 500, win: 1000, mult: "2.00x", won: true },
                  { game: locale === "bn" ? "ক্রেজি হুইল" : "Crazy Wheel", user: "hasan_dhaka", bet: 100, win: 5000, mult: "50.00x", won: true },
                  { game: locale === "bn" ? "এভিয়েটর" : "Aviator", user: "sultana_dhk", bet: 300, win: 1110, mult: "3.70x", won: true },
                  { game: locale === "bn" ? "উইন গো ৩০ সে." : "Win Go 30s", user: "fahim_ctg", bet: 200, win: 400, mult: "2.00x", won: true },
                ].map((round, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-[#193e87]/40 bg-[#081329] p-2.5 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{round.user}</span>
                      <span className="text-[#94caf9] text-[10px] block font-mono">{round.game}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-mono font-bold block tabular-nums ${
                          round.won ? "text-emerald-400" : "text-gray-400"
                        }`}
                      >
                        {round.won ? `+${round.win} PTS` : `-${round.bet} PTS`}
                      </span>
                      <span className="text-[10px] text-[#fedbbb] font-mono tabular-nums">{round.mult}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture Card */}
            <div className="mst-card rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="h-4 w-4 text-[#fedbbb]" />
                <h3 className="text-sm font-black text-white uppercase">{t("platformBlueprint")}</h3>
              </div>
              <p className="text-xs text-[#94caf9] leading-relaxed mb-4">
                {t("blueprintDesc")}
              </p>
              <div className="space-y-2 border-t border-[#193e87]/40 pt-3 text-[11px] font-mono text-[#94caf9]">
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
      <footer className="w-full border-t border-[#193e87]/50 py-12 bg-[#081329] text-center text-xs text-[#94caf9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-white mb-3 font-bold uppercase tracking-wider">
            <span>CV666 FAST GAMING SIMULATION</span>
            <span>•</span>
            <span>{t("eduPurpose")}</span>
            <span>•</span>
            <span>{t("zeroMonetary")}</span>
          </div>
          <p className="text-[11px] text-[#668ab8] max-w-xl mx-auto leading-relaxed">
            {t("disclaimer")}
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Thumb Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </main>
  );
}
