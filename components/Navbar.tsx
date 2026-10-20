"use client";

import Link from "next/link";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import { Coins, Sparkles, Shield, RefreshCw, Languages } from "lucide-react";
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
    <header className="sticky top-0 z-40 w-full border-b border-[#1E293B]/70 bg-[#060814]/80 backdrop-blur-2xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Editorial Title */}
        <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000F2] rounded-xl">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0000F2] to-[#00D2FF] p-[1.5px] shadow-[0_0_20px_rgba(0,0,242,0.4)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_28px_rgba(0,210,255,0.5)]">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#060814]">
              {/* Hermes Geometric Wings Prism */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#00D2FF] transition-transform duration-300 group-hover:rotate-6"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="#0000F2"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">{t("appName")}</span>
              <span className="rounded-md bg-[#0000F2]/15 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-[#00D2FF] border border-[#0000F2]/40">
                {t("provablyFairBadge")}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-tight -mt-0.5 hidden sm:block">
              {t("tagline")}
            </p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle Button (Bangla <-> English) */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs font-bold text-gray-300 transition-all hover:border-[#0000F2]/60 hover:text-white hover:bg-white/[0.08] active:scale-95"
            title="Toggle between বাংলা and English"
          >
            <Languages className="h-3.5 w-3.5 text-[#00D2FF]" />
            <span className="font-mono text-[11px] font-bold">
              {locale === "bn" ? "বাংলা" : "ENG"}
            </span>
            <span className="text-[9px] text-gray-500 font-mono">
              ({locale === "bn" ? "EN" : "বাং"})
            </span>
          </button>

          {/* Virtual Balance Display */}
          <div className="flex items-center rounded-xl border border-white/10 bg-[#0A1026]/90 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-lg bg-[#0000F2]/25 text-[#00D2FF]">
              <Coins className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                {t("simCredits")}
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-white tabular-nums tracking-tight">
                {loading ? "..." : `${formatCurrency(balance)} PTS`}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              aria-label={t("refreshBalance")}
              className="ml-2 rounded-md p-1 text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0000F2]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#00D2FF]" : ""}`} />
            </button>
          </div>

          {/* Quick Top-up Button */}
          <button
            onClick={() => setIsTopUpOpen(true)}
            className="btn-tactile flex items-center gap-1.5 rounded-xl border border-[#0000F2] bg-[#0000F2] px-3.5 py-2 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D2FF]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00D2FF]" />
            <span className="hidden sm:inline">{t("refillCredits")}</span>
            <span className="sm:hidden">+</span>
          </button>

          {/* Admin Link */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-gray-300 transition-all hover:border-[#0000F2]/60 hover:bg-white/[0.06] hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0000F2]"
          >
            <Shield className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">{t("adminDesk")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
