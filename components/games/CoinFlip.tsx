"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency } from "@/lib/utils";
import { Coins, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

export function CoinFlip() {
  const { balance, updateBalance } = useWallet();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [choice, setChoice] = useState<"HEADS" | "TAILS">("HEADS");
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipResult, setFlipResult] = useState<"HEADS" | "TAILS" | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [lastPayout, setLastPayout] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seedHash, setSeedHash] = useState<string | null>(null);
  const [showFairness, setShowFairness] = useState<boolean>(false);

  const handleFlip = async () => {
    if (betAmount <= 0) {
      setErrorMessage("Enter a valid bet amount.");
      return;
    }
    if (betAmount > balance) {
      setErrorMessage("Insufficient demo balance.");
      return;
    }

    setErrorMessage(null);
    setIsFlipping(true);
    setFlipResult(null);
    setLastWin(null);

    try {
      const res = await fetch("/api/games/coin-flip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betAmount, choice }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.message || "Failed to flip coin.");
        setIsFlipping(false);
        return;
      }

      // Simulate 1.5s flip rotation animation
      setTimeout(() => {
        setFlipResult(data.outcome);
        setLastWin(data.won);
        setLastPayout(data.payout);
        setSeedHash(data.seedHash);
        updateBalance(data.newBalance);
        setIsFlipping(false);
      }, 1400);
    } catch {
      setErrorMessage("Network error during flip.");
      setIsFlipping(false);
    }
  };

  const adjustBet = (multiplier: number) => {
    setBetAmount((prev) => {
      const val = Math.round(prev * multiplier);
      return Math.max(1, Math.min(balance, val));
    });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0A1026]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#0000F2]/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0000F2]/20 text-[#00D2FF] border border-[#0000F2]/50 shadow-cyan-glow">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">COIN FLIP</h2>
            <p className="text-xs text-gray-400">Classic 50/50 • 1.98x Multiplier</p>
          </div>
        </div>

        <button
          onClick={() => setShowFairness(!showFairness)}
          className="flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#060814] px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 hover:text-[#00D2FF] transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Provably Fair</span>
        </button>
      </div>

      {/* Fairness verification bar */}
      {showFairness && seedHash && (
        <div className="mb-6 rounded-xl border border-[#0000F2]/40 bg-[#060814] p-3 text-[11px] font-mono text-gray-300">
          <span className="text-gray-500 block mb-0.5 font-sans font-bold">SHA-256 Server Seed Hash:</span>
          <span className="break-all text-[#00D2FF]">{seedHash}</span>
        </div>
      )}

      {/* 3D Coin Animation Display */}
      <div className="my-8 flex flex-col items-center justify-center">
        <div className="coin-container h-36 w-36 sm:h-44 sm:w-44">
          <div
            className={`coin-inner ${
              isFlipping
                ? "animate-spin duration-300"
                : flipResult === "HEADS"
                ? "flip-heads"
                : flipResult === "TAILS"
                ? "flip-tails"
                : ""
            }`}
          >
            {/* Heads Face */}
            <div className="coin-face border-4 border-amber-400 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 text-amber-950 shadow-2xl">
              <div className="flex flex-col items-center justify-center rounded-full border-2 border-amber-300/80 p-6">
                <span className="text-3xl sm:text-4xl font-black">H</span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">HEADS</span>
              </div>
            </div>

            {/* Tails Face */}
            <div className="coin-face coin-back border-4 border-[#00D2FF] bg-gradient-to-tr from-[#0000F2] via-[#3B82F6] to-[#00D2FF] text-white shadow-cyan-glow">
              <div className="flex flex-col items-center justify-center rounded-full border-2 border-[#00D2FF]/60 p-6">
                <span className="text-3xl sm:text-4xl font-black">T</span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">TAILS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Outcome banner */}
        <div className="mt-6 h-8 text-center">
          {lastWin !== null && (
            <div
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-bold tracking-wide animate-in zoom-in-95 duration-200 ${
                lastWin
                  ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-lg"
                  : "border border-ruby/50 bg-ruby/20 text-ruby"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {lastWin ? `WON +${formatCurrency(lastPayout)} PTS (1.98x)` : "LOST BET"}
            </div>
          )}
        </div>
      </div>

      {/* Choice Selector (Heads or Tails) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setChoice("HEADS")}
          disabled={isFlipping}
          className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wider transition-all ${
            choice === "HEADS"
              ? "border border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              : "border border-[#1E293B] bg-[#060814] text-gray-400 hover:text-white"
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-[10px] text-amber-300 font-black">
            H
          </span>
          HEADS (1.98x)
        </button>

        <button
          onClick={() => setChoice("TAILS")}
          disabled={isFlipping}
          className={`flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold tracking-wider transition-all ${
            choice === "TAILS"
              ? "border border-[#00D2FF] bg-[#0000F2]/30 text-[#00D2FF] shadow-cyan-glow"
              : "border border-[#1E293B] bg-[#060814] text-gray-400 hover:text-white"
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0000F2]/40 text-[10px] text-[#00D2FF] font-black">
            T
          </span>
          TAILS (1.98x)
        </button>
      </div>

      {/* Bet Configuration */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5">
            <span>Stake Amount</span>
            <span>Balance: {formatCurrency(balance)} PTS</span>
          </div>

          <div className="relative">
            <input
              type="number"
              min={1}
              max={balance}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={isFlipping}
              className="w-full rounded-xl border border-[#1E293B] bg-[#060814] px-4 py-3 font-mono text-base font-bold text-white focus:border-[#0000F2] focus:outline-none focus:ring-1 focus:ring-[#0000F2]"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
              PTS
            </span>
          </div>
        </div>

        {/* Quick Bet Buttons */}
        <div className="grid grid-cols-5 gap-2">
          {[10, 50, 100, 500].map((amt) => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              disabled={isFlipping}
              className="rounded-lg border border-[#1E293B] bg-[#060814] py-1.5 font-mono text-xs font-bold text-gray-300 hover:border-[#0000F2] hover:text-white transition-all"
            >
              {amt}
            </button>
          ))}
          <button
            onClick={() => adjustBet(2)}
            disabled={isFlipping}
            className="rounded-lg border border-[#1E293B] bg-[#060814] py-1.5 font-mono text-xs font-bold text-[#00D2FF] hover:border-[#0000F2]"
          >
            2X
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-ruby/30 bg-ruby/10 p-3 text-xs font-medium text-ruby">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Bet Action */}
        <button
          onClick={handleFlip}
          disabled={isFlipping}
          className="w-full rounded-xl border border-[#0000F2] bg-[#0000F2] py-4 text-sm font-black tracking-wider text-white shadow-cobalt-glow transition-all hover:bg-[#1E29FF] active:scale-98 disabled:opacity-50"
        >
          {isFlipping ? "FLIPPING COIN..." : `FLIP COIN (${betAmount} PTS)`}
        </button>
      </div>
    </div>
  );
}
