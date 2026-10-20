"use client";

import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { Plane, Trophy, Bomb, Coins, PlusCircle } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { setIsTopUpOpen } = useWallet();
  const { locale } = useLanguage();

  const navItems = [
    { id: "aviator", label: locale === "bn" ? "এভিয়েটর" : "Aviator", icon: Plane },
    { id: "penalty", label: locale === "bn" ? "পেনাল্টি" : "Penalty", icon: Trophy },
    { id: "mines", label: locale === "bn" ? "মাইনস" : "Mines", icon: Bomb },
    { id: "coin-flip", label: locale === "bn" ? "কয়েন" : "Coin", icon: Coins },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-[#08478E]/60 bg-[#051738]/95 backdrop-blur-xl sm:hidden">
      <div className="grid h-16 grid-cols-5 items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                const el = document.getElementById("arena-stage");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? "text-[#FFC700]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive ? "bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/50 shadow-[0_0_12px_rgba(255,107,0,0.4)]" : ""
                }`}
              >
                <Icon className="h-4 w-4" />
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#FF6B00]" />
                )}
              </div>
              <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Top Up trigger on bottom bar */}
        <button
          onClick={() => setIsTopUpOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[#FF6B00] hover:text-[#FFC700]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF6B00] text-white shadow-[0_0_15px_rgba(255,107,0,0.5)]">
            <PlusCircle className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tight">{locale === "bn" ? "রিফিল" : "Refill"}</span>
        </button>
      </div>
    </nav>
  );
}
