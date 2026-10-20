"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import { Dices, ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight, Check } from "lucide-react";

export function DiceRoll() {
  const { balance, updateBalance } = useWallet();
  const { t, locale } = useLanguage();
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
      setErrorMessage(locale === "bn" ? "সঠিক বাজির পরিমাণ লিখুন।" : "Enter a valid stake amount.");
      return;
    }
    if (betAmount > balance) {
      setErrorMessage(locale === "bn" ? "পর্যাপ্ত ব্যালেন্স নেই।" : "Insufficient demo balance.");
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
        setErrorMessage(data.message || (locale === "bn" ? "ডাইস রোল করতে সমস্যা হয়েছে।" : "Failed to roll dice."));
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
      setErrorMessage(locale === "bn" ? "নেটওয়ার্ক ত্রুটি।" : "Network error during roll.");
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
    <div className="mst-card relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-2xl">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#08478E]/30 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#08478E] text-[#FFC700] border border-white/15 shadow-[0_0_15px_rgba(255,199,0,0.3)]">
            <Dices className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white uppercase">{t("diceTitle")}</h2>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/40">
                99% RTP
              </span>
            </div>
            <p className="text-xs text-[#8EA8C7] font-medium">{t("diceHeaderDesc")}</p>
          </div>
        </div>

        <button
          onClick={() => setShowFairness(!showFairness)}
          className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:border-[#FFC700] hover:text-[#FFC700] transition-all active:scale-95"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#FFC700]" />
          <span>{t("provablyFair")}</span>
        </button>
      </div>

      {showFairness && seedHash && (
        <div className="mb-6 rounded-2xl border border-white/15 bg-[#030B1C] p-4 font-mono text-xs text-gray-300 shadow-inner">
          <div className="flex items-center justify-between mb-1.5 font-sans font-bold text-[#8EA8C7] text-[11px]">
            <span>{t("sha256Hash")}</span>
            <button
              onClick={copySeed}
              className="flex items-center gap-1 text-[#FFC700] hover:underline text-[10px]"
            >
              {copiedHash ? <Check className="h-3 w-3" /> : null}
              {copiedHash ? t("copied") : t("copyHash")}
            </button>
          </div>
          <span className="break-all text-[#FFC700] text-[11px] select-all leading-relaxed">{seedHash}</span>
        </div>
      )}

      {/* Visual Dice Slider & Outcome Display */}
      <div className="my-6 rounded-2xl border border-white/15 bg-[#030B1C] p-5 sm:p-6 shadow-inner">
        {/* Roll Display Box */}
        <div className="mb-6 flex items-center justify-center">
          <div
            className={`flex h-20 w-44 items-center justify-center rounded-2xl border-2 font-mono text-3xl font-black tabular-nums shadow-inner transition-all duration-300 ${
              lastWin === true
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                : lastWin === false
                ? "border-ruby/80 bg-ruby/20 text-ruby shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                : "border-white/15 bg-[#051738] text-white"
            }`}
          >
            {isRolling ? (
              <span className="animate-pulse text-[#8EA8C7] tracking-widest font-sans text-sm uppercase">{t("rolling")}</span>
            ) : lastRoll !== null ? (
              lastRoll.toFixed(2)
            ) : (
              "50.00"
            )}
          </div>
        </div>

        {/* Dynamic Track Bar */}
        <div className="relative mb-5 h-4 w-full rounded-full bg-[#08478E]/40 overflow-hidden shadow-inner">
          {condition === "OVER" ? (
            <>
              <div
                className="absolute left-0 top-0 h-full bg-ruby/75 transition-all"
                style={{ width: `${target}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-emerald-500/85 transition-all"
                style={{ width: `${100 - target}%` }}
              />
            </>
          ) : (
            <>
              <div
                className="absolute left-0 top-0 h-full bg-emerald-500/85 transition-all"
                style={{ width: `${target}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-ruby/75 transition-all"
                style={{ width: `${100 - target}%` }}
              />
            </>
          )}

          {/* Target marker pin */}
          <div
            className="absolute top-0 h-full w-1.5 -translate-x-1/2 bg-[#FFC700] shadow-md transition-all"
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
          className="w-full accent-[#FF6B00] cursor-pointer"
        />

        <div className="mt-2.5 flex justify-between font-mono text-xs text-[#8EA8C7] font-bold tabular-nums">
          <span>0.00</span>
          <span className="text-[#FFC700] font-bold">{t("target")}: {target.toFixed(2)}</span>
          <span>100.00</span>
        </div>
      </div>

      {/* Multiplier & Direction Controls */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl border border-white/15 bg-[#030B1C] p-3.5 text-center shadow-inner">
          <span className="text-[10px] uppercase font-bold text-[#8EA8C7]">{t("multiplier")}</span>
          <p className="font-mono text-base sm:text-lg font-black text-[#FFC700] tabular-nums mt-0.5">
            {multiplier}x
          </p>
        </div>

        <button
          onClick={() => setCondition(condition === "OVER" ? "UNDER" : "OVER")}
          disabled={isRolling}
          className="flex flex-col items-center justify-center rounded-2xl border border-[#08478E] bg-[#08478E]/40 p-3.5 transition-all hover:bg-[#08478E]/60 active:scale-95 text-white"
        >
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#8EA8C7]">
            <span>{condition === "OVER" ? t("rollOver") : t("rollUnder")}</span>
            {condition === "OVER" ? (
              <ArrowUpRight className="h-3 w-3 text-emerald-400" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-[#FFC700]" />
            )}
          </div>
          <p className="font-mono text-sm sm:text-base font-black text-white mt-0.5">
            {condition}
          </p>
        </button>

        <div className="rounded-2xl border border-white/15 bg-[#030B1C] p-3.5 text-center shadow-inner">
          <span className="text-[10px] uppercase font-bold text-[#8EA8C7]">{t("winProbability")}</span>
          <p className="font-mono text-base sm:text-lg font-black text-emerald-400 tabular-nums mt-0.5">
            {winChance.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Stake & Presets */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#8EA8C7] mb-2">
            <span>{t("stakeAmount")}</span>
            <span className="font-mono tabular-nums text-white">
              {locale === "bn" ? "সম্ভাব্য লাভ" : "Est. Return"}: +{formatCurrency(potentialPayout)} PTS
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
              className="w-full rounded-2xl border border-white/15 bg-[#030B1C] px-4 py-3.5 font-mono text-base font-bold text-white tabular-nums focus:border-[#FFC700] focus:outline-none focus:ring-1 focus:ring-[#FFC700]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8EA8C7] font-mono">
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
              className="rounded-xl border border-white/15 bg-white/5 py-2 font-mono text-xs font-bold text-white hover:border-[#FFC700] transition-all active:scale-95"
            >
              {amt}
            </button>
          ))}
          <button
            onClick={() => adjustBet(2)}
            disabled={isRolling}
            className="rounded-xl border border-[#FF6B00]/40 bg-[#FF6B00]/15 py-2 font-mono text-xs font-bold text-[#FF6B00] hover:border-[#FF6B00] active:scale-95 transition-all"
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
          className="btn-action-orange w-full rounded-2xl py-4 text-sm font-black disabled:opacity-50"
        >
          {isRolling ? t("rolling") : `${t("rollDice")} (${betAmount} PTS)`}
        </button>
      </div>
    </div>
  );
}
