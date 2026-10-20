"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency } from "@/lib/utils";
import { Dices, ShieldCheck, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function DiceRoll() {
  const { balance, updateBalance } = useWallet();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [target, setTarget] = useState<number>(50.0);
  const [condition, setCondition] = useState<"OVER" | "UNDER">("OVER");
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [lastPayout, setLastPayout] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seedHash, setSeedHash] = useState<string | null>(null);
  const [showFairness, setShowFairness] = useState<boolean>(false);

  // Dynamic calculations
  const winChance = condition === "OVER" ? 100 - target : target;
  const multiplier = parseFloat((99 / winChance).toFixed(2));
  const potentialPayout = parseFloat((betAmount * multiplier).toFixed(2));

  const handleRoll = async () => {
    if (betAmount <= 0) {
      setErrorMessage("Enter a valid bet amount.");
      return;
    }
    if (betAmount > balance) {
      setErrorMessage("Insufficient demo balance.");
      return;
    }

    setErrorMessage(null);
    setIsRolling(true);
    setLastWin(null);

    try {
      const res = await fetch("/api/games/dice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betAmount, target, condition }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.message || "Failed to roll dice.");
        setIsRolling(false);
        return;
      }

      // Simulate quick dice spin
      setTimeout(() => {
        setLastRoll(data.roll);
        setLastWin(data.won);
        setLastPayout(data.payout);
        setSeedHash(data.seedHash);
        updateBalance(data.newBalance);
        setIsRolling(false);
      }, 500);
    } catch {
      setErrorMessage("Network error during roll.");
      setIsRolling(false);
    }
  };

  const adjustBet = (mult: number) => {
    setBetAmount((prev) => Math.max(1, Math.min(balance, Math.round(prev * mult))));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0A1026]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#00D2FF]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0000F2]/20 text-[#00D2FF] border border-[#0000F2]/50 shadow-cyan-glow">
            <Dices className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">DICE OVER / UNDER</h2>
            <p className="text-xs text-gray-400">Customizable Multipliers up to 49.50x • 99% RTP</p>
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

      {showFairness && seedHash && (
        <div className="mb-6 rounded-xl border border-[#0000F2]/40 bg-[#060814] p-3 text-[11px] font-mono text-gray-300">
          <span className="text-gray-500 block mb-0.5 font-sans font-bold">SHA-256 Server Seed Hash:</span>
          <span className="break-all text-[#00D2FF]">{seedHash}</span>
        </div>
      )}

      {/* Visual Dice Slider & Outcome Display */}
      <div className="my-6 rounded-2xl border border-[#1E293B] bg-[#060814] p-5">
        {/* Roll Display Box */}
        <div className="mb-6 flex items-center justify-center">
          <div
            className={`flex h-20 w-36 items-center justify-center rounded-2xl border-2 font-mono text-3xl font-black shadow-inner transition-all ${
              lastWin === true
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                : lastWin === false
                ? "border-ruby bg-ruby/10 text-ruby"
                : "border-[#1E293B] bg-[#0A1026] text-white"
            }`}
          >
            {isRolling ? (
              <span className="animate-pulse text-gray-500">...</span>
            ) : lastRoll !== null ? (
              lastRoll.toFixed(2)
            ) : (
              "50.00"
            )}
          </div>
        </div>

        {/* Dynamic Track Bar */}
        <div className="relative mb-6 h-5 w-full rounded-full bg-[#1E293B] overflow-hidden">
          {condition === "OVER" ? (
            <>
              {/* Red Zone (Below Target) */}
              <div
                className="absolute left-0 top-0 h-full bg-ruby/60"
                style={{ width: `${target}%` }}
              />
              {/* Green Zone (Above Target) */}
              <div
                className="absolute right-0 top-0 h-full bg-emerald-500/70"
                style={{ width: `${100 - target}%` }}
              />
            </>
          ) : (
            <>
              {/* Green Zone (Below Target) */}
              <div
                className="absolute left-0 top-0 h-full bg-emerald-500/70"
                style={{ width: `${target}%` }}
              />
              {/* Red Zone (Above Target) */}
              <div
                className="absolute right-0 top-0 h-full bg-ruby/60"
                style={{ width: `${100 - target}%` }}
              />
            </>
          )}

          {/* Marker pin */}
          <div
            className="absolute top-0 h-full w-1.5 -translate-x-1/2 bg-white shadow-lg transition-all"
            style={{ left: `${target}%` }}
          />

          {/* Last Roll Pin */}
          {lastRoll !== null && !isRolling && (
            <div
              className={`absolute top-0 h-full w-2 -translate-x-1/2 rounded-full shadow-lg ${
                lastWin ? "bg-emerald-300" : "bg-red-400"
              }`}
              style={{ left: `${lastRoll}%` }}
            />
          )}
        </div>

        {/* Interactive Target Range Slider */}
        <input
          type="range"
          min={2}
          max={98}
          step={1}
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          disabled={isRolling}
          className="w-full accent-[#0000F2] cursor-pointer"
        />

        <div className="mt-2 flex justify-between font-mono text-[11px] text-gray-500 font-bold">
          <span>0.00</span>
          <span>Target: {target.toFixed(2)}</span>
          <span>100.00</span>
        </div>
      </div>

      {/* Target & Condition Control Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Multiplier Card */}
        <div className="rounded-xl border border-[#1E293B] bg-[#060814] p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-gray-400">Multiplier</span>
          <p className="font-mono text-base sm:text-lg font-black text-[#00D2FF]">
            {multiplier}x
          </p>
        </div>

        {/* Roll Direction Button */}
        <button
          onClick={() => setCondition(condition === "OVER" ? "UNDER" : "OVER")}
          disabled={isRolling}
          className="flex flex-col items-center justify-center rounded-xl border border-[#0000F2] bg-[#0000F2]/20 p-3 transition-colors hover:bg-[#0000F2]/30 text-white"
        >
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-300">
            <span>Direction</span>
            {condition === "OVER" ? (
              <ArrowUpRight className="h-3 w-3 text-emerald-400" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-amber-400" />
            )}
          </div>
          <p className="font-mono text-sm sm:text-base font-black text-white">
            ROLL {condition}
          </p>
        </button>

        {/* Win Chance Card */}
        <div className="rounded-xl border border-[#1E293B] bg-[#060814] p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-gray-400">Win Chance</span>
          <p className="font-mono text-base sm:text-lg font-black text-emerald-400">
            {winChance.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Stake & Quick Selectors */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1.5">
            <span>Stake Amount</span>
            <span>Est. Payout: +{formatCurrency(potentialPayout)} PTS</span>
          </div>

          <div className="relative">
            <input
              type="number"
              min={1}
              max={balance}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={isRolling}
              className="w-full rounded-xl border border-[#1E293B] bg-[#060814] px-4 py-3 font-mono text-base font-bold text-white focus:border-[#0000F2] focus:outline-none focus:ring-1 focus:ring-[#0000F2]"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
              PTS
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[10, 50, 100, 500].map((amt) => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              disabled={isRolling}
              className="rounded-lg border border-[#1E293B] bg-[#060814] py-1.5 font-mono text-xs font-bold text-gray-300 hover:border-[#0000F2] hover:text-white transition-all"
            >
              {amt}
            </button>
          ))}
          <button
            onClick={() => adjustBet(2)}
            disabled={isRolling}
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

        {/* Action Button */}
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full rounded-xl border border-[#0000F2] bg-[#0000F2] py-4 text-sm font-black tracking-wider text-white shadow-cobalt-glow transition-all hover:bg-[#1E29FF] active:scale-98 disabled:opacity-50"
        >
          {isRolling ? "ROLLING DICE..." : `ROLL DICE (${betAmount} PTS)`}
        </button>
      </div>
    </div>
  );
}
