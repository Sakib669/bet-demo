"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency } from "@/lib/utils";
import { Dices, ShieldCheck, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, Check } from "lucide-react";

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
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Dynamic calculations
  const winChance = condition === "OVER" ? 100 - target : target;
  const multiplier = parseFloat((99 / winChance).toFixed(2));
  const potentialPayout = parseFloat((betAmount * multiplier).toFixed(2));

  const handleRoll = async () => {
    if (betAmount <= 0) {
      setErrorMessage("Enter a valid stake amount.");
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

      setTimeout(() => {
        setLastRoll(data.roll);
        setLastWin(data.won);
        setLastPayout(data.payout);
        setSeedHash(data.seedHash);
        updateBalance(data.newBalance);
        setIsRolling(false);
      }, 450);
    } catch {
      setErrorMessage("Network error during roll.");
      setIsRolling(false);
    }
  };

  const adjustBet = (mult: number) => {
    setBetAmount((prev) => Math.max(1, Math.min(balance, Math.round(prev * mult))));
  };

  const copySeed = () => {
    if (!seedHash) return;
    navigator.clipboard.writeText(seedHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="glass-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-2xl">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#00D2FF]/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0000F2]/20 text-[#00D2FF] border border-[#0000F2]/50 shadow-[0_0_20px_rgba(0,210,255,0.25)]">
            <Dices className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">Dice Over / Under</h2>
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                99% RTP
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">Fine-tune target multipliers up to 49.50x</p>
          </div>
        </div>

        <button
          onClick={() => setShowFairness(!showFairness)}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-[#00D2FF] hover:border-[#0000F2]/50 transition-all active:scale-95"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Provably Fair</span>
        </button>
      </div>

      {showFairness && seedHash && (
        <div className="mb-6 rounded-2xl border border-[#0000F2]/40 bg-[#060814]/90 p-4 font-mono text-xs text-gray-300 shadow-inner">
          <div className="flex items-center justify-between mb-1.5 font-sans font-bold text-gray-400 text-[11px]">
            <span>Deterministic SHA-256 Seed Hash</span>
            <button
              onClick={copySeed}
              className="flex items-center gap-1 text-[#00D2FF] hover:underline text-[10px]"
            >
              {copiedHash ? <Check className="h-3 w-3" /> : null}
              {copiedHash ? "Copied" : "Copy Hash"}
            </button>
          </div>
          <span className="break-all text-[#00D2FF] text-[11px] select-all leading-relaxed">{seedHash}</span>
        </div>
      )}

      {/* Visual Dice Slider & Outcome Display */}
      <div className="my-6 rounded-2xl border border-white/10 bg-black/40 p-5 sm:p-6 shadow-inner">
        {/* Roll Display Box */}
        <div className="mb-6 flex items-center justify-center">
          <div
            className={`flex h-20 w-44 items-center justify-center rounded-2xl border-2 font-mono text-3xl font-black tabular-nums shadow-inner transition-all duration-300 ${
              lastWin === true
                ? "border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                : lastWin === false
                ? "border-ruby/80 bg-ruby/15 text-ruby shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                : "border-white/10 bg-white/[0.03] text-white"
            }`}
          >
            {isRolling ? (
              <span className="animate-pulse text-gray-500 tracking-widest font-sans text-sm uppercase">Rolling...</span>
            ) : lastRoll !== null ? (
              lastRoll.toFixed(2)
            ) : (
              "50.00"
            )}
          </div>
        </div>

        {/* Dynamic Track Bar */}
        <div className="relative mb-5 h-4 w-full rounded-full bg-[#1E293B] overflow-hidden shadow-inner">
          {condition === "OVER" ? (
            <>
              <div
                className="absolute left-0 top-0 h-full bg-ruby/65 transition-all"
                style={{ width: `${target}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-emerald-500/80 transition-all"
                style={{ width: `${100 - target}%` }}
              />
            </>
          ) : (
            <>
              <div
                className="absolute left-0 top-0 h-full bg-emerald-500/80 transition-all"
                style={{ width: `${target}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-ruby/65 transition-all"
                style={{ width: `${100 - target}%` }}
              />
            </>
          )}

          {/* Target marker pin */}
          <div
            className="absolute top-0 h-full w-1.5 -translate-x-1/2 bg-white shadow-md transition-all"
            style={{ left: `${target}%` }}
          />

          {/* Last Roll marker pin */}
          {lastRoll !== null && !isRolling && (
            <div
              className={`absolute top-0 h-full w-2.5 -translate-x-1/2 rounded-full shadow-lg ${
                lastWin ? "bg-emerald-300 shadow-[0_0_10px_#10B981]" : "bg-red-400"
              }`}
              style={{ left: `${lastRoll}%` }}
            />
          )}
        </div>

        {/* Range Slider */}
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

        <div className="mt-2.5 flex justify-between font-mono text-xs text-gray-400 font-bold tabular-nums">
          <span>0.00</span>
          <span className="text-[#00D2FF]">Target: {target.toFixed(2)}</span>
          <span>100.00</span>
        </div>
      </div>

      {/* Multiplier & Direction Controls */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 text-center shadow-inner">
          <span className="text-[10px] uppercase font-bold text-gray-400">Multiplier</span>
          <p className="font-mono text-base sm:text-lg font-black text-[#00D2FF] tabular-nums mt-0.5">
            {multiplier}x
          </p>
        </div>

        <button
          onClick={() => setCondition(condition === "OVER" ? "UNDER" : "OVER")}
          disabled={isRolling}
          className="flex flex-col items-center justify-center rounded-2xl border border-[#0000F2] bg-[#0000F2]/25 p-3.5 transition-all hover:bg-[#0000F2]/35 active:scale-95 text-white"
        >
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-300">
            <span>Roll</span>
            {condition === "OVER" ? (
              <ArrowUpRight className="h-3 w-3 text-emerald-400" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-amber-400" />
            )}
          </div>
          <p className="font-mono text-sm sm:text-base font-black text-white mt-0.5">
            {condition}
          </p>
        </button>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 text-center shadow-inner">
          <span className="text-[10px] uppercase font-bold text-gray-400">Win Probability</span>
          <p className="font-mono text-base sm:text-lg font-black text-emerald-400 tabular-nums mt-0.5">
            {winChance.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Stake & Presets */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
            <span>Stake Amount</span>
            <span className="font-mono tabular-nums text-gray-300">
              Est. Return: +{formatCurrency(potentialPayout)} PTS
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              min={1}
              max={balance}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={isRolling}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 font-mono text-base font-bold text-white tabular-nums focus:border-[#0000F2] focus:outline-none focus:ring-1 focus:ring-[#0000F2]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 font-mono">
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
              className="rounded-xl border border-white/10 bg-white/[0.03] py-2 font-mono text-xs font-bold text-gray-300 hover:border-[#0000F2]/60 hover:text-white transition-all active:scale-95"
            >
              {amt}
            </button>
          ))}
          <button
            onClick={() => adjustBet(2)}
            disabled={isRolling}
            className="rounded-xl border border-[#0000F2]/40 bg-[#0000F2]/10 py-2 font-mono text-xs font-bold text-[#00D2FF] hover:border-[#0000F2] active:scale-95 transition-all"
          >
            2X
          </button>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-ruby/40 bg-ruby/10 p-3.5 text-xs font-semibold text-ruby">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="btn-tactile w-full rounded-2xl border border-[#0000F2] bg-[#0000F2] py-4 text-sm font-black tracking-wider text-white shadow-cobalt-glow active:scale-98 disabled:opacity-50"
        >
          {isRolling ? "Rolling..." : `Roll Dice (${betAmount} PTS)`}
        </button>
      </div>
    </div>
  );
}
