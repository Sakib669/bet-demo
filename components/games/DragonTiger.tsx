"use client";

import { localFetch } from "@/lib/browser-db";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  Trophy,
  History,
  ShieldCheck,
  Flame,
  Zap,
} from "lucide-react";

interface DragonTigerProps {
  onRoundComplete?: () => void;
}

interface CardState {
  rank: number;
  suit: string;
  label: string;
}

export function DragonTiger({ onRoundComplete }: DragonTigerProps) {
  const { balance, refreshWallet } = useWallet();
  const { locale } = useLanguage();

  const [betSide, setBetSide] = useState<"DRAGON" | "TIGER" | "TIE">("DRAGON");
  const [betAmount, setBetAmount] = useState<number>(100);
  const [dealing, setDealing] = useState<boolean>(false);
  const [dragonCard, setDragonCard] = useState<CardState | null>({ rank: 13, suit: "♠", label: "K" });
  const [tigerCard, setTigerCard] = useState<CardState | null>({ rank: 10, suit: "♥", label: "10" });
  const [winner, setWinner] = useState<"DRAGON" | "TIGER" | "TIE" | null>("DRAGON");
  const [lastWin, setLastWin] = useState<{ amount: number; won: boolean; tieRefund?: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Bead plate road history (CV666 Asian table standard)
  const [roadHistory, setRoadHistory] = useState<Array<"DRAGON" | "TIGER" | "TIE">>([
    "DRAGON",
    "TIGER",
    "DRAGON",
    "DRAGON",
    "TIE",
    "TIGER",
    "DRAGON",
    "TIGER",
  ]);

  const handleDeal = async () => {
    if (betAmount > balance) {
      setErrorMsg(locale === "bn" ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient balance");
      return;
    }

    setErrorMsg(null);
    setDealing(true);
    setLastWin(null);

    try {
      const res = await localFetch("/api/games/dragon-tiger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          betSide,
          betAmount,
          clientSeed: `dt-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message);
        setDealing(false);
        return;
      }

      // Card deal animation suspense
      setTimeout(() => {
        setDragonCard(data.outcome.dragonCard);
      }, 350);

      setTimeout(() => {
        setTigerCard(data.outcome.tigerCard);
        setWinner(data.outcome.winner);
        setRoadHistory((prev) => [data.outcome.winner, ...prev.slice(0, 11)]);
        setLastWin({
          amount: data.payout,
          won: data.won,
          tieRefund: data.multiplier === 0.5,
        });
        setDealing(false);
        refreshWallet();
        if (onRoundComplete) onRoundComplete();
      }, 850);
    } catch {
      setErrorMsg(locale === "bn" ? "ডিল করতে ত্রুটি হয়েছে" : "Deal request failed");
      setDealing(false);
    }
  };

  const getSuitColor = (suit: string) => {
    return suit === "♥" || suit === "♦" ? "text-rose-500" : "text-slate-900";
  };

  return (
    <div className="mst-card relative overflow-hidden rounded-2xl border border-[#345441]/70 bg-[#182b21] p-4 sm:p-6 shadow-2xl">
      {/* Table Header */}
      <div className="mb-4 flex items-center justify-between border-b border-[#345441]/50 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-[#c4e77d]" />
          <span className="text-sm font-black uppercase tracking-wider text-white">
            {locale === "bn" ? "ড্রাগন ভার্সেস টাইগার" : "DRAGON TIGER LIVE"}
          </span>
          <span className="rounded bg-[#c4e77d]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#c4e77d] border border-[#c4e77d]/40">
            DRAGON TIGER
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-[#e2f4c6]">
          <ShieldCheck className="h-4 w-4" />
          <span>Browser random result</span>
        </div>
      </div>

      {/* Duel Arena Canvas */}
      <div className="relative mb-5 min-h-[220px] rounded-2xl border border-[#345441] bg-gradient-to-b from-[#0c1714] to-[#0a1b38] p-4 sm:p-6 shadow-inner flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-4 sm:gap-8 items-center justify-center my-auto">
          {/* DRAGON SIDE */}
          <div className="flex flex-col items-center">
            <span className="mb-2 rounded-full bg-rose-600/20 border border-rose-500/40 px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-rose-400">
              {locale === "bn" ? "ড্রাগন (DRAGON)" : "DRAGON (2.0X)"}
            </span>

            {/* Dragon Playing Card */}
            <div
              className={`relative flex h-36 w-24 sm:h-44 sm:w-28 flex-col justify-between rounded-xl bg-gradient-to-br from-white via-slate-100 to-slate-200 p-2.5 shadow-xl transition-all duration-300 ${
                winner === "DRAGON" ? "ring-4 ring-rose-500 scale-105 shadow-[0_0_25px_rgba(244,63,94,0.8)]" : "opacity-90"
              } ${dealing ? "animate-pulse" : ""}`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-mono text-lg font-black ${getSuitColor(dragonCard?.suit || "♠")}`}>
                  {dragonCard?.label}
                </span>
                <span className={`text-base ${getSuitColor(dragonCard?.suit || "♠")}`}>
                  {dragonCard?.suit}
                </span>
              </div>
              <div className="my-auto text-center">
                <span className={`text-4xl sm:text-5xl ${getSuitColor(dragonCard?.suit || "♠")}`}>
                  {dragonCard?.suit}
                </span>
              </div>
              <div className="flex justify-between items-end rotate-180">
                <span className={`font-mono text-lg font-black ${getSuitColor(dragonCard?.suit || "♠")}`}>
                  {dragonCard?.label}
                </span>
                <span className={`text-base ${getSuitColor(dragonCard?.suit || "♠")}`}>
                  {dragonCard?.suit}
                </span>
              </div>
            </div>
          </div>

          {/* TIGER SIDE */}
          <div className="flex flex-col items-center">
            <span className="mb-2 rounded-full bg-blue-600/20 border border-blue-500/40 px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-blue-400">
              {locale === "bn" ? "টাইগার (TIGER)" : "TIGER (2.0X)"}
            </span>

            {/* Tiger Playing Card */}
            <div
              className={`relative flex h-36 w-24 sm:h-44 sm:w-28 flex-col justify-between rounded-xl bg-gradient-to-br from-white via-slate-100 to-slate-200 p-2.5 shadow-xl transition-all duration-300 ${
                winner === "TIGER" ? "ring-4 ring-blue-500 scale-105 shadow-[0_0_25px_rgba(59,130,246,0.8)]" : "opacity-90"
              } ${dealing ? "animate-pulse" : ""}`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-mono text-lg font-black ${getSuitColor(tigerCard?.suit || "♥")}`}>
                  {tigerCard?.label}
                </span>
                <span className={`text-base ${getSuitColor(tigerCard?.suit || "♥")}`}>
                  {tigerCard?.suit}
                </span>
              </div>
              <div className="my-auto text-center">
                <span className={`text-4xl sm:text-5xl ${getSuitColor(tigerCard?.suit || "♥")}`}>
                  {tigerCard?.suit}
                </span>
              </div>
              <div className="flex justify-between items-end rotate-180">
                <span className={`font-mono text-lg font-black ${getSuitColor(tigerCard?.suit || "♥")}`}>
                  {tigerCard?.label}
                </span>
                <span className={`text-base ${getSuitColor(tigerCard?.suit || "♥")}`}>
                  {tigerCard?.suit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tie indicator badge */}
        {winner === "TIE" && (
          <div className="mx-auto mt-2 rounded-full bg-emerald-500/30 border border-emerald-400 px-4 py-1 text-xs font-black uppercase text-emerald-400 animate-bounce">
            {locale === "bn" ? "টাই ড্র! (৯ গুণ পেআউট)" : "TIE DRAW! 9.0X"}
          </div>
        )}
      </div>

      {/* Result announcement */}
      {lastWin && (
        <div
          className={`mb-4 flex items-center justify-between rounded-xl p-3 border animate-in zoom-in-95 duration-200 ${
            lastWin.won
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
              : lastWin.tieRefund
              ? "border-[#e2f4c6]/50 bg-[#e2f4c6]/10 text-[#e2f4c6]"
              : "border-rose-500/50 bg-rose-500/10 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <div>
              <p className="text-xs font-bold uppercase">
                {lastWin.won
                  ? locale === "bn"
                    ? "চমৎকার জয়!"
                    : "Round Won!"
                  : lastWin.tieRefund
                  ? locale === "bn"
                    ? "টাই হওয়ায় ৫০% রিফান্ড"
                    : "Tie 50% Refunded"
                  : locale === "bn"
                  ? "রাউন্ড শেষ"
                  : "Round Finished"}
              </p>
              {lastWin.amount > 0 && (
                <span className="font-mono text-sm font-black">
                  +{formatCurrency(lastWin.amount)} PTS
                </span>
              )}
            </div>
          </div>
          <span className="font-mono text-xs font-black uppercase text-white">
            {winner} WINS
          </span>
        </div>
      )}

      {/* Betting Side Selection Boxes */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {/* DRAGON */}
        <button
          onClick={() => setBetSide("DRAGON")}
          disabled={dealing}
          className={`rounded-xl p-3.5 text-center transition-all ${
            betSide === "DRAGON"
              ? "border-2 border-rose-500 bg-rose-600/30 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)]"
              : "border border-[#345441]/60 bg-[#0c1714] text-gray-300 hover:text-white"
          }`}
        >
          <span className="block text-sm sm:text-base font-black text-rose-400">
            {locale === "bn" ? "ড্রাগন" : "DRAGON"}
          </span>
          <span className="font-mono text-xs font-bold text-gray-300">2.0X</span>
        </button>

        {/* TIE */}
        <button
          onClick={() => setBetSide("TIE")}
          disabled={dealing}
          className={`rounded-xl p-3.5 text-center transition-all ${
            betSide === "TIE"
              ? "border-2 border-emerald-500 bg-emerald-600/30 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
              : "border border-[#345441]/60 bg-[#0c1714] text-gray-300 hover:text-white"
          }`}
        >
          <span className="block text-sm sm:text-base font-black text-emerald-400">
            {locale === "bn" ? "টাই" : "TIE"}
          </span>
          <span className="font-mono text-xs font-bold text-[#e2f4c6]">9.0X</span>
        </button>

        {/* TIGER */}
        <button
          onClick={() => setBetSide("TIGER")}
          disabled={dealing}
          className={`rounded-xl p-3.5 text-center transition-all ${
            betSide === "TIGER"
              ? "border-2 border-blue-500 bg-blue-600/30 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              : "border border-[#345441]/60 bg-[#0c1714] text-gray-300 hover:text-white"
          }`}
        >
          <span className="block text-sm sm:text-base font-black text-blue-400">
            {locale === "bn" ? "টাইগার" : "TIGER"}
          </span>
          <span className="font-mono text-xs font-bold text-gray-300">2.0X</span>
        </button>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-xs font-bold text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Stake & Deal Action */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-gray-300">
            {locale === "bn" ? "বাজির পরিমাণ" : "Stake"}
          </span>
          <span className="font-mono text-gray-400">
            {locale === "bn" ? "ব্যালেন্স" : "Balance"}: {formatCurrency(balance)} PTS
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 250, 500].map((amt) => (
            <button
              key={amt}
              disabled={dealing}
              onClick={() => setBetAmount(amt)}
              className={`rounded-xl py-2 font-mono text-xs font-bold transition-all ${
                betAmount === amt
                  ? "border border-[#c4e77d] bg-[#c4e77d]/25 text-[#e2f4c6]"
                  : "border border-[#345441]/50 bg-[#0c1714] text-gray-300 hover:text-white"
              }`}
            >
              +{amt}
            </button>
          ))}
        </div>

        <button
          onClick={handleDeal}
          disabled={dealing}
          className="btn-action-orange w-full rounded-xl py-4 text-base font-black uppercase tracking-wider text-white shadow-[0_6px_20px_rgba(255,107,0,0.5)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Zap className="h-5 w-5 fill-white" />
          <span>
            {dealing
              ? locale === "bn"
                ? "ডিল হচ্ছে..."
                : "DEALING CARDS..."
              : locale === "bn"
              ? `ডিল করুন (${betSide} • ${betAmount} PTS)`
              : `DEAL (${betSide} • ${betAmount} PTS)`}
          </span>
        </button>
      </div>

      {/* Asian Bead Plate Road Map */}
      <div className="border-t border-[#345441]/50 pt-3">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-[#c4e77d]" />
            {locale === "bn" ? "বিড প্লেট রোডম্যাপ" : "Bead Plate Road"}
          </span>
          <span className="font-mono text-[10px] text-gray-400">D = Dragon, T = Tiger, X = Tie</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {roadHistory.map((outcome, idx) => {
            const isDragon = outcome === "DRAGON";
            const isTiger = outcome === "TIGER";
            const isTie = outcome === "TIE";

            let bg = "bg-emerald-600 text-white";
            let letter = "X";
            if (isDragon) {
              bg = "bg-rose-600 text-white";
              letter = "D";
            } else if (isTiger) {
              bg = "bg-blue-600 text-white";
              letter = "T";
            }

            return (
              <span
                key={idx}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-black shadow-inner ${bg}`}
              >
                {letter}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
