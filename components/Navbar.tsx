"use client";

import Link from "next/link";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import { Coins, Sparkles, Shield, RefreshCw, Languages, Star, Flame, Trophy } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { balance, loading, refreshWallet, setIsTopUpOpen } = useWallet();
  const { locale, toggleLocale, t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWallet();
    setTimeout(() => setIsRefreshing(false), 450);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#193e87] shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-b border-[#2d84f9]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Editorial Star Mark */}
        <Link href="/" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fedbbb] rounded-xl">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#fc7219] via-[#fedbbb] to-yellow-300 p-[1.5px] shadow-[0_0_15px_rgba(255,199,0,0.5)] transition-transform duration-200 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0e1f3d]">
              {/* Mostbet Star Emblem */}
              <div className="relative w-5 h-5 flex items-center justify-center">
                <Star className="h-5 w-5 fill-[#fedbbb] text-[#fedbbb] drop-shadow-[0_0_8px_rgba(255,199,0,0.8)]" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tighter text-white uppercase italic">
                MOST<span className="text-[#fc7219]">BET</span>
              </span>
              <span className="rounded bg-[#fedbbb] px-1.5 py-0.5 text-[9px] font-black text-[#081329] uppercase tracking-wider">
                SIMULATION
              </span>
            </div>
            <p className="text-[10px] text-[#94caf9] font-semibold -mt-1 hidden sm:block tracking-wide">
              {locale === "bn" ? "প্রোভ্যাবলি ফেয়ার প্ল্যাটফর্ম" : "Provably Fair Portal"}
            </p>
          </div>
        </Link>

        {/* Center Quick Navigation (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#0e1f3d]/60 p-1 rounded-xl border border-white/10">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#2d84f9] shadow-sm"
          >
            <Flame className="h-3.5 w-3.5 text-[#fedbbb]" />
            <span>{locale === "bn" ? "ক্যাসিনো" : "Casino"}</span>
          </Link>
          <button
            onClick={() => {
              const el = document.getElementById("arena-stage");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#94caf9] hover:text-white hover:bg-white/5 transition-colors"
          >
            <Trophy className="h-3.5 w-3.5 text-[#fc7219]" />
            <span>{locale === "bn" ? "লাইভ গেমস" : "Live Games"}</span>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-2.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-white/20 active:scale-95"
            title="Toggle between বাংলা and English"
          >
            <Languages className="h-3.5 w-3.5 text-[#fedbbb]" />
            <span className="font-mono text-[11px] font-bold">
              {locale === "bn" ? "বাংলা" : "ENG"}
            </span>
          </button>

          {/* Virtual Balance Display */}
          <div className="flex items-center rounded-xl border border-white/15 bg-[#0e1f3d] px-3 py-1.5 shadow-inner">
            <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-lg bg-[#fedbbb]/20 text-[#fedbbb]">
              <Coins className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#94caf9] uppercase tracking-wider">
                {t("simCredits")}
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white tabular-nums tracking-tight">
                {loading ? "..." : `${formatCurrency(balance)} PTS`}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              aria-label={t("refreshBalance")}
              className="ml-2 rounded-md p-1 text-[#94caf9] hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#fedbbb]" : ""}`} />
            </button>
          </div>

          {/* Action Orange Quick Refill Button */}
          <button
            onClick={() => setIsTopUpOpen(true)}
            className="btn-action-orange flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fedbbb]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#fedbbb]" />
            <span className="hidden sm:inline">{t("refillCredits")}</span>
            <span className="sm:hidden">+</span>
          </button>

          {/* Admin Desk Link */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
          >
            <Shield className="h-3.5 w-3.5 text-[#fedbbb]" />
            <span className="hidden md:inline">{t("adminDesk")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
