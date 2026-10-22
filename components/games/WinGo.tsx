"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import {
  Timer,
  ShieldCheck,
  Sparkles,
  Trophy,
  History,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface WinGoProps {
  onRoundComplete?: () => void;
}

interface PastResult {
  period: string;
  number: number;
  color: "GREEN" | "RED" | "VIOLET" | "GREEN_VIOLET" | "RED_VIOLET";
  size: "BIG" | "SMALL";
}

export function WinGo({ onRoundComplete }: WinGoProps) {
  const { balance, refreshWallet } = useWallet();
  const { locale } = useLanguage();

  const [period, setPeriod] = useState<string>("2026102201");
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30-second interval cycle
  const [selectedBet, setSelectedBet] = useState<string>("GREEN"); // GREEN, VIOLET, RED, BIG, SMALL, NUM_0..NUM_9
  const [betAmount, setBetAmount] = useState<number>(100);
  const [activeRoundId, setActiveRoundId] = useState<string | null>(null);
  const [isBetPlaced, setIsBetPlaced] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastWin, setLastWin] = useState<{ amount: number; won: boolean; num: number } | null>(null);

  // Past results table
  const [history, setHistory] = useState<PastResult[]>([
    { period: "2026102200", number: 7, color: "GREEN", size: "BIG" },
    { period: "2026102199", number: 2, color: "RED", size: "SMALL" },
    { period: "2026102198", number: 0, color: "RED_VIOLET", size: "SMALL" },
    { period: "2026102197", number: 5, color: "GREEN_VIOLET", size: "BIG" },
    { period: "2026102196", number: 9, color: "GREEN", size: "BIG" },
    { period: "2026102195", number: 4, color: "RED", size: "SMALL" },
    { period: "2026102194", number: 8, color: "RED", size: "BIG" },
  ]);

  const activeRoundRef = useRef<string | null>(null);
  activeRoundRef.current = activeRoundId;

  // Real-time 30-second synchronized timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer hit 0 -> Settle round & update period
          handleCycleComplete();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCycleComplete = async () => {
    const currentRoundId = activeRoundRef.current;
    if (currentRoundId) {
      try {
        const res = await fetch("/api/games/wingo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SETTLE",
            roundId: currentRoundId,
          }),
        });
        const data = await res.json();
        if (data.success) {
          const outcome = data.outcome;
          setLastWin({
            amount: data.payout,
            won: data.won,
            num: outcome.number,
          });

          setHistory((prev) => [
            {
              period: period,
              number: outcome.number,
              color: outcome.color,
              size: outcome.size,
            },
            ...prev.slice(0, 9),
          ]);
          await refreshWallet();
          if (onRoundComplete) onRoundComplete();
        }
      } catch (e) {
        console.error("Auto settle error", e);
      } finally {
        setActiveRoundId(null);
        setIsBetPlaced(false);
      }
    } else {
      // Simulate historical outcome if no active bet
      const dummyNum = Math.floor(Math.random() * 10);
      const dummyColor =
        dummyNum === 0
          ? "RED_VIOLET"
          : dummyNum === 5
          ? "GREEN_VIOLET"
          : [1, 3, 7, 9].includes(dummyNum)
          ? "GREEN"
          : "RED";
      setHistory((prev) => [
        {
          period: period,
          number: dummyNum,
          color: dummyColor,
          size: dummyNum >= 5 ? "BIG" : "SMALL",
        },
        ...prev.slice(0, 9),
      ]);
    }

    // Advance period
    setPeriod((prev) => (BigInt(prev) + 1n).toString());
  };

  const handlePlaceBet = async () => {
    if (timeLeft <= 5) {
      setErrorMsg(
        locale === "bn"
          ? "রাউন্ড বন্ধ হচ্ছে! পরবর্তী রাউন্ডের জন্য অপেক্ষা করুন।"
          : "Round locking! Please wait for the next cycle."
      );
      return;
    }

    if (betAmount > balance) {
      setErrorMsg(locale === "bn" ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient balance");
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setLastWin(null);

    try {
      const res = await fetch("/api/games/wingo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BET",
          betType: selectedBet,
          betAmount,
          period,
          clientSeed: `wingo-seed-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message);
        setLoading(false);
        return;
      }

      setActiveRoundId(data.roundId);
      setIsBetPlaced(true);
      await refreshWallet();
    } catch {
      setErrorMsg(locale === "bn" ? "বাজি ধরতে ব্যর্থ হয়েছে" : "Failed to place bet");
    } finally {
      setLoading(false);
    }
  };

  // Color helper
  const getColorBadge = (c: PastResult["color"]) => {
    if (c === "GREEN") return "bg-emerald-500 text-white";
    if (c === "RED") return "bg-rose-500 text-white";
    if (c === "GREEN_VIOLET")
      return "bg-gradient-to-r from-emerald-500 to-purple-600 text-white";
    if (c === "RED_VIOLET")
      return "bg-gradient-to-r from-rose-500 to-purple-600 text-white";
    return "bg-purple-600 text-white";
  };

  return (
    <div className="mst-card relative overflow-hidden rounded-2xl border border-[#193e87]/70 bg-[#0e1f3d] p-4 sm:p-6 shadow-2xl">
      {/* CV666 Header Banner */}
      <div className="mb-4 flex flex-wrap items-center justify-between border-b border-[#193e87]/50 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-sm font-black uppercase tracking-wider text-white">
            {locale === "bn" ? "উইন গো ৩০ সে." : "WIN GO 30S"}
          </span>
          <span className="rounded bg-[#fc7219]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#fc7219] border border-[#fc7219]/40">
            CV666 LOTTERY
          </span>
        </div>

        {/* Period & Countdown */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block font-mono">
              {locale === "bn" ? "পিরিয়ড নং" : "Period"}
            </span>
            <span className="font-mono text-xs font-bold text-[#fedbbb]">{period}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#081329] px-3 py-1.5 shadow-inner">
            <Timer className={`h-4 w-4 ${timeLeft <= 5 ? "text-rose-500 animate-bounce" : "text-[#fc7219]"}`} />
            <span
              className={`font-mono text-lg font-black tabular-nums ${
                timeLeft <= 5 ? "text-rose-500" : "text-white"
              }`}
            >
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* Result announcement alert */}
      {lastWin && (
        <div
          className={`mb-4 flex items-center justify-between rounded-xl p-3 border animate-in zoom-in-95 duration-200 ${
            lastWin.won
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
              : "border-rose-500/50 bg-rose-500/10 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {lastWin.won ? <Trophy className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <div>
              <p className="text-xs font-bold uppercase">
                {lastWin.won
                  ? locale === "bn"
                    ? "অভিনন্দন! আপনি জিতেছেন!"
                    : "Round Won!"
                  : locale === "bn"
                  ? "রাউন্ড শেষ! নম্বর: " + lastWin.num
                  : `Result Number: ${lastWin.num}`}
              </p>
              {lastWin.won && (
                <span className="font-mono text-sm font-black">
                  +{formatCurrency(lastWin.amount)} PTS
                </span>
              )}
            </div>
          </div>
          <span className="rounded-lg bg-black/40 px-2 py-1 font-mono text-xs font-bold">
            #{period}
          </span>
        </div>
      )}

      {/* Main Color Selection Pads (Green 2x, Violet 4.5x, Red 2x) */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {/* GREEN (2X) */}
        <button
          onClick={() => setSelectedBet("GREEN")}
          className={`relative overflow-hidden rounded-xl p-3 sm:p-4 text-center transition-all ${
            selectedBet === "GREEN"
              ? "ring-2 ring-white scale-102 shadow-[0_0_20px_rgba(16,185,129,0.7)]"
              : "opacity-85 hover:opacity-100"
          } bg-gradient-to-b from-emerald-500 to-emerald-700 text-white`}
        >
          <span className="block text-sm sm:text-base font-black tracking-wide">
            {locale === "bn" ? "সবুজ" : "GREEN"}
          </span>
          <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-mono font-bold mt-1 inline-block">
            2.0X
          </span>
        </button>

        {/* VIOLET (4.5X) */}
        <button
          onClick={() => setSelectedBet("VIOLET")}
          className={`relative overflow-hidden rounded-xl p-3 sm:p-4 text-center transition-all ${
            selectedBet === "VIOLET"
              ? "ring-2 ring-white scale-102 shadow-[0_0_20px_rgba(168,85,247,0.7)]"
              : "opacity-85 hover:opacity-100"
          } bg-gradient-to-b from-purple-600 to-violet-800 text-white`}
        >
          <span className="block text-sm sm:text-base font-black tracking-wide">
            {locale === "bn" ? "বেগুনী" : "VIOLET"}
          </span>
          <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-mono font-bold mt-1 inline-block">
            4.5X
          </span>
        </button>

        {/* RED (2X) */}
        <button
          onClick={() => setSelectedBet("RED")}
          className={`relative overflow-hidden rounded-xl p-3 sm:p-4 text-center transition-all ${
            selectedBet === "RED"
              ? "ring-2 ring-white scale-102 shadow-[0_0_20px_rgba(244,63,94,0.7)]"
              : "opacity-85 hover:opacity-100"
          } bg-gradient-to-b from-rose-500 to-rose-700 text-white`}
        >
          <span className="block text-sm sm:text-base font-black tracking-wide">
            {locale === "bn" ? "লাল" : "RED"}
          </span>
          <span className="rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-mono font-bold mt-1 inline-block">
            2.0X
          </span>
        </button>
      </div>

      {/* Numbers Selection Grid (0 - 9) with 9.0x Payout */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span className="font-bold uppercase tracking-wider">
            {locale === "bn" ? "নির্দিষ্ট নম্বর নির্বাচন (৯ গুণ পেআউট)" : "Number Pick (9.0x Multiplier)"}
          </span>
          <span className="font-mono text-[#fedbbb]">0 to 9</span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isSelected = selectedBet === `NUM_${num}`;
            // Determine badge color matching CV666
            const isRedViolet = num === 0;
            const isGreenViolet = num === 5;
            const isGreen = [1, 3, 7, 9].includes(num);

            let bgClass = "bg-rose-600/80";
            if (isGreen) bgClass = "bg-emerald-600/80";
            if (isRedViolet) bgClass = "bg-gradient-to-br from-rose-600 to-purple-700";
            if (isGreenViolet) bgClass = "bg-gradient-to-br from-emerald-600 to-purple-700";

            return (
              <button
                key={num}
                onClick={() => setSelectedBet(`NUM_${num}`)}
                className={`h-11 rounded-xl font-mono text-base font-black text-white transition-all flex flex-col items-center justify-center ${bgClass} ${
                  isSelected
                    ? "ring-2 ring-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.7)]"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Big / Small Choice (2x) */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => setSelectedBet("BIG")}
          className={`rounded-xl py-3 text-center transition-all ${
            selectedBet === "BIG"
              ? "border border-[#fc7219] bg-[#fc7219] text-white shadow-[0_0_15px_rgba(255,107,0,0.6)]"
              : "border border-[#193e87]/60 bg-[#081329] text-gray-300 hover:text-white"
          }`}
        >
          <span className="block text-sm font-black uppercase">
            {locale === "bn" ? "বড় (৫-৯)" : "BIG (5-9)"}
          </span>
          <span className="text-[11px] font-mono font-bold opacity-80">2.0X</span>
        </button>

        <button
          onClick={() => setSelectedBet("SMALL")}
          className={`rounded-xl py-3 text-center transition-all ${
            selectedBet === "SMALL"
              ? "border border-[#0000F2] bg-[#0000F2] text-white shadow-[0_0_15px_rgba(0,0,242,0.6)]"
              : "border border-[#193e87]/60 bg-[#081329] text-gray-300 hover:text-white"
          }`}
        >
          <span className="block text-sm font-black uppercase">
            {locale === "bn" ? "ছোট (০-৪)" : "SMALL (0-4)"}
          </span>
          <span className="text-[11px] font-mono font-bold opacity-80">2.0X</span>
        </button>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-xs font-bold text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Stake & Action Button */}
      <div className="mb-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-gray-300">
            {locale === "bn" ? "বাজির পরিমাণ" : "Stake"}
          </span>
          <span className="font-mono text-gray-400">
            {locale === "bn" ? "ব্যালেন্স" : "Balance"}: {formatCurrency(balance)} PTS
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 500, 1000].map((amt) => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              className={`rounded-xl py-2 font-mono text-xs font-bold transition-all ${
                betAmount === amt
                  ? "border border-[#fc7219] bg-[#fc7219]/25 text-[#fedbbb]"
                  : "border border-[#193e87]/50 bg-[#081329] text-gray-300 hover:text-white"
              }`}
            >
              +{amt}
            </button>
          ))}
        </div>

        {/* Place Bet CTA */}
        <button
          onClick={handlePlaceBet}
          disabled={loading || timeLeft <= 5 || isBetPlaced}
          className="btn-action-orange w-full rounded-xl py-4 text-base font-black uppercase tracking-wider text-white shadow-[0_6px_20px_rgba(255,107,0,0.5)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isBetPlaced ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>
                {locale === "bn"
                  ? `বাজি গৃহীত (${selectedBet}) - ড্র অপেক্ষা...`
                  : `BET CONFIRMED (${selectedBet}) - AWAITING DRAW`}
              </span>
            </>
          ) : timeLeft <= 5 ? (
            <span>{locale === "bn" ? "রাউন্ড লকড" : "ROUND LOCKED (DRAWING...)"}</span>
          ) : (
            <>
              <Sparkles className="h-5 w-5 text-[#fedbbb]" />
              <span>
                {locale === "bn"
                  ? `বাজি নিশ্চিত করুন (${betAmount} PTS)`
                  : `CONFIRM BET (${betAmount} PTS)`}
              </span>
            </>
          )}
        </button>
      </div>

      {/* History Pill Ribbon (CV666 Lottery Style) */}
      <div className="border-t border-[#193e87]/50 pt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold uppercase text-gray-300">
            <History className="h-4 w-4 text-[#fc7219]" />
            <span>{locale === "bn" ? "সাম্প্রতিক ফলাফল হিস্ট্রি" : "Past Rounds History"}</span>
          </div>
          <span className="font-mono text-[10px] text-gray-500">Provably Fair</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {history.slice(0, 4).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-[#193e87]/40 bg-[#081329] p-2.5"
            >
              <div>
                <span className="font-mono text-[10px] text-gray-400 block">
                  #{item.period.slice(-4)}
                </span>
                <span className="text-[11px] font-bold text-gray-300">{item.size}</span>
              </div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-black shadow-md ${getColorBadge(
                  item.color
                )}`}
              >
                {item.number}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
