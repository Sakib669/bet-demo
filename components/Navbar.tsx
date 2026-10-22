"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import {
  Coins,
  Sparkles,
  Shield,
  RefreshCw,
  Languages,
  Star,
  Flame,
  Trophy,
  User,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { balance, loading, refreshWallet, setIsTopUpOpen, user, isAuthenticated } = useWallet();
  const { locale, toggleLocale, t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWallet();
    setTimeout(() => setIsRefreshing(false), 450);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 w-full bg-[#193e87] shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-b border-[#2d84f9]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Editorial Star Mark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fedbbb] rounded-xl"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#fc7219] via-[#fedbbb] to-yellow-300 p-[1.5px] shadow-[0_0_15px_rgba(255,199,0,0.5)] transition-transform duration-200 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0e1f3d]">
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
                CV666
              </span>
            </div>
            <p className="text-[10px] text-[#94caf9] font-semibold -mt-1 hidden sm:block tracking-wide">
              {locale === "bn" ? "প্রুভেবলি ফেয়ার লাইভ এরিনা" : "Provably Fair Arena"}
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
            className="btn-action-orange flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fedbbb]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#fedbbb]" />
            <span className="hidden sm:inline">{t("refillCredits")}</span>
            <span className="sm:hidden">+</span>
          </button>

          {/* User Auth Buttons or Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5">
              {isAdmin ? (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1.5 rounded-xl border border-[#fedbbb]/40 bg-[#fedbbb]/15 px-3 py-1.5 text-xs font-black text-[#fedbbb] hover:bg-[#fedbbb]/25 transition-all"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Admin Panel</span>
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0e1f3d] px-2.5 py-1.5 text-xs text-gray-300">
                  <User className="h-3.5 w-3.5 text-[#fedbbb]" />
                  <span className="font-bold text-white max-w-[90px] truncate">{user.name}</span>
                </div>
              )}

              <button
                onClick={handleLogout}
                title="Log Out"
                className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 p-2 text-xs text-gray-300 hover:text-white hover:bg-rose-600/30 hover:border-rose-500/50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all"
              >
                <LogIn className="h-3.5 w-3.5 text-[#fedbbb]" />
                <span className="hidden sm:inline">{locale === "bn" ? "লগইন" : "Login"}</span>
              </Link>
              <Link
                href="/register"
                className="hidden sm:flex items-center gap-1 rounded-xl border border-[#fc7219]/60 bg-[#fc7219]/20 px-3 py-2 text-xs font-bold text-[#fedbbb] hover:bg-[#fc7219]/30 transition-all"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{locale === "bn" ? "রেজিস্টার" : "Register"}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
