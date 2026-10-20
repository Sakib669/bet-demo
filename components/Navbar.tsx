"use client";

import Link from "next/link";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency } from "@/lib/utils";
import { Coins, PlusCircle, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { balance, loading, refreshWallet, setIsTopUpOpen } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWallet();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E293B]/80 bg-[#060814]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0000F2] to-[#3B82F6] p-[1px] shadow-cobalt-glow transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#060814]">
              {/* Hermes Geometric Prism Icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#00D2FF]"
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
                  strokeWidth="2"
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
              <span className="text-lg font-black tracking-wider text-white">HERMES</span>
              <span className="rounded bg-[#0000F2]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#00D2FF] border border-[#0000F2]/50">
                PROVABLY FAIR
              </span>
            </div>
            <p className="text-[10px] text-gray-400 -mt-1 hidden sm:block tracking-wide">
              Virtual E-Gaming Simulation
            </p>
          </div>
        </Link>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Virtual Balance Display */}
          <div className="flex items-center rounded-xl border border-[#1E293B] bg-[#0A1026]/90 px-3 py-1.5 shadow-inner">
            <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-lg bg-[#0000F2]/30 text-[#00D2FF]">
              <Coins className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                Demo Credits
              </span>
              <span className="font-mono text-sm font-bold text-white tracking-tight">
                {loading ? "..." : `${formatCurrency(balance)} PTS`}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              title="Refresh Balance"
              className="ml-2 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-[#00D2FF]" : ""}`} />
            </button>
          </div>

          {/* Quick Top-up Button */}
          <button
            onClick={() => setIsTopUpOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#0000F2] bg-[#0000F2] px-3.5 py-2 text-xs font-bold text-white shadow-cobalt-glow transition-all hover:bg-[#1E29FF] active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00D2FF]" />
            <span className="hidden sm:inline">Free Credits</span>
            <span className="sm:hidden">+</span>
          </button>

          {/* Admin Link */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#0F172A]/70 px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:border-[#0000F2]/60 hover:text-white"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Admin Panel</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
