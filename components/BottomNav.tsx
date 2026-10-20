"use client";

import { useWallet } from "@/lib/wallet-context";
import { CircleDollarSign, Dices, Bomb, Flame, PlusCircle } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { setIsTopUpOpen } = useWallet();

  const navItems = [
    { id: "lobby", label: "Lobby", icon: Flame },
    { id: "coin-flip", label: "Coin Flip", icon: CircleDollarSign },
    { id: "dice", label: "Dice", icon: Dices },
    { id: "mines", label: "Mines", icon: Bomb },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-[#1E293B] bg-[#060814]/95 backdrop-blur-lg sm:hidden">
      <div className="grid h-16 grid-cols-5 items-center px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? "text-[#00D2FF]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  isActive ? "bg-[#0000F2]/30 text-[#00D2FF] shadow-cyan-glow" : ""
                }`}
              >
                <Icon className="h-4 w-4" />
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#00D2FF]" />
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Top Up trigger on bottom bar */}
        <button
          onClick={() => setIsTopUpOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[#3B82F6] hover:text-[#00D2FF]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0000F2]/40 text-[#00D2FF] border border-[#0000F2]/60">
            <PlusCircle className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-bold">Top-Up</span>
        </button>
      </div>
    </nav>
  );
}
