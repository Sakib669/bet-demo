"use client";

import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { CircleDollarSign, Dices, Grid2X2, Plane, Target } from "lucide-react";

interface BottomNavProps { activeTab: string; setActiveTab: (tab: string) => void; }

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { setIsTopUpOpen } = useWallet();
  const { locale } = useLanguage();
  const bn = locale === "bn";
  const items = [
    { id: "wingo", label: "Win Go", icon: Target },
    { id: "aviator", label: "Aviator", icon: Plane },
    { id: "mines", label: "Mines", icon: Grid2X2 },
    { id: "dice", label: "Dice", icon: Dices },
  ];

  return <nav className="mobile-game-nav" aria-label="Quick game navigation">{items.map(({ id, label, icon: Icon }) => <button key={id} aria-current={activeTab === id ? "page" : undefined} onClick={() => setActiveTab(id)}><Icon size={19} /><span>{label}</span></button>)}<button className="mobile-credit-action" onClick={() => setIsTopUpOpen(true)}><CircleDollarSign size={19} /><span>{bn ? "ক্রেডিট" : "Credits"}</span></button></nav>;
}
