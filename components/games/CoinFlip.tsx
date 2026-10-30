"use client";

import { localFetch } from "@/lib/browser-db";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import { Coins, ShieldCheck, Sparkles, AlertCircle, Check } from "lucide-react";

export function CoinFlip() {
  const { balance, updateBalance } = useWallet();
  const { t, locale } = useLanguage();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [choice, setChoice] = useState<"HEADS" | "TAILS">("HEADS");
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipResult, setFlipResult] = useState<"HEADS" | "TAILS" | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [lastPayout, setLastPayout] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seedHash, setSeedHash] = useState<string | null>(null);
  const [showFairness, setShowFairness] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const handleFlip = async () => {
    if (betAmount <= 0) {
      setErrorMessage(locale === "bn" ? "সঠিক বাজির পরিমাণ লিখুন।" : "Enter a valid stake amount.");
      return;
    }
    if (betAmount > balance) {
      setErrorMessage(locale === "bn" ? "পর্যাপ্ত ব্যালেন্স নেই।" : "Insufficient demo balance.");
      return;
    }

    setErrorMessage(null);
    setIsFlipping(true);
    setFlipResult(null);
    setLastWin(null);

    try {
      const res = await localFetch("/api/games/coin-flip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ betAmount, choice }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.message || (locale === "bn" ? "ফলাফল পেতে সমস্যা হয়েছে।" : "Failed to resolve coin flip."));
        setIsFlipping(false);
        return;
      }

      setTimeout(() => {
        setFlipResult(data.outcome);
        setLastWin(data.won);
        setLastPayout(data.payout);
        setSeedHash(data.seedHash);
        updateBalance(data.newBalance);
        setIsFlipping(false);
      }, 1400);
    } catch {
      setErrorMessage(locale === "bn" ? "নেটওয়ার্ক ত্রুটি।" : "Network error during game resolution.");
      setIsFlipping(false);
    }
  };

  const adjustBet = (multiplier: number) => {
    setBetAmount((prev) => {
      const val = Math.round(prev * multiplier);
      return Math.max(1, Math.min(balance, val));
    });
  };

  const copySeed = () => {
    if (!seedHash) return;
    navigator.clipboard.writeText(seedHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="mst-card relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-2xl">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#345441]/30 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#345441] text-[#e2f4c6] border border-white/15 shadow-[0_0_15px_rgba(255,199,0,0.3)]">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white uppercase">{t("coinFlipTitle")}</h2>
              <span className="rounded bg-[#e2f4c6] px-2 py-0.5 text-[10px] font-mono font-black text-[#0c1714]">
                1.98x {t("multiplier").toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[#aabdab] font-medium">{t("coinFlipDesc")}</p>
          </div>
        </div>

        <button
          onClick={() => setShowFairness(!showFairness)}
          className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:border-[#e2f4c6] hover:text-[#e2f4c6] transition-all active:scale-95"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-[#e2f4c6]" />
          <span>{t("provablyFair")}</span>
        </button>
      </div>

      {/* Fairness Drawer */}
      {showFairness && seedHash && (
        <div className="mb-6 rounded-2xl border border-white/15 bg-[#060d1c] p-4 font-mono text-xs text-gray-300 shadow-inner">
          <div className="flex items-center justify-between mb-1.5 font-sans font-bold text-[#aabdab] text-[11px]">
            <span>{t("sha256Hash")}</span>
            <button
              onClick={copySeed}
              className="flex items-center gap-1 text-[#e2f4c6] hover:underline text-[10px]"
            >
              {copiedHash ? <Check className="h-3 w-3" /> : null}
              {copiedHash ? t("copied") : t("copyHash")}
            </button>
          </div>
          <span className="break-all text-[#e2f4c6] text-[11px] select-all leading-relaxed">{seedHash}</span>
        </div>
      )}

      {/* 3D Coin Animation Display */}
      <div className="my-8 flex flex-col items-center justify-center">
        <div className="coin-container h-40 w-40 sm:h-48 sm:w-48">
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
            <div className="coin-face border-[5px] border-[#e2f4c6] bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-amber-950 shadow-[0_15px_35px_rgba(255,199,0,0.4)]">
              <div className="flex flex-col items-center justify-center rounded-full border-2 border-amber-200/90 p-6">
                <span className="text-4xl sm:text-5xl font-black tracking-tighter">H</span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1">HEADS</span>
              </div>
            </div>

            {/* Tails Face */}
            <div className="coin-face coin-back border-[5px] border-[#c4e77d] bg-gradient-to-tr from-[#345441] via-[#c4e77d] to-[#c4e77d] text-white shadow-[0_15px_35px_rgba(255,107,0,0.4)]">
              <div className="flex flex-col items-center justify-center rounded-full border-2 border-white/60 p-6">
                <span className="text-4xl sm:text-5xl font-black tracking-tighter">T</span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1">TAILS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Outcome banner */}
        <div className="mt-6 h-8 text-center">
          {lastWin !== null && (
            <div
              className={`inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-black tracking-wide animate-in zoom-in-95 duration-200 ${
                lastWin
                  ? "border border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "border border-ruby/50 bg-ruby/20 text-ruby"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {lastWin ? `${t("wonMsg")} +${formatCurrency(lastPayout)} PTS (1.98x)` : t("lossMsg")}
            </div>
          )}
        </div>
      </div>

      {/* Choice Selector (Heads or Tails) */}
      <div className="grid grid-cols-2 gap-3.5 mb-6">
        <button
          onClick={() => setChoice("HEADS")}
          disabled={isFlipping}
          className={`flex items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-black tracking-wider transition-all duration-200 ${
            choice === "HEADS"
              ? "border-2 border-[#e2f4c6] bg-[#e2f4c6]/20 text-[#e2f4c6] shadow-[0_0_25px_rgba(255,199,0,0.3)]"
              : "border border-white/10 bg-[#060d1c] text-gray-400 hover:text-white hover:border-white/20 active:scale-98"
          }`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e2f4c6]/30 text-[11px] text-[#e2f4c6] font-black">
            H
          </span>
          {t("heads")} (1.98x)
        </button>

        <button
          onClick={() => setChoice("TAILS")}
          disabled={isFlipping}
          className={`flex items-center justify-center gap-2.5 rounded-2xl py-4 text-sm font-black tracking-wider transition-all duration-200 ${
            choice === "TAILS"
              ? "border-2 border-[#c4e77d] bg-[#c4e77d]/20 text-[#c4e77d] shadow-[0_0_25px_rgba(255,107,0,0.3)]"
              : "border border-white/10 bg-[#060d1c] text-gray-400 hover:text-white hover:border-white/20 active:scale-98"
          }`}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c4e77d]/30 text-[11px] text-[#c4e77d] font-black">
            T
          </span>
          {t("tails")} (1.98x)
        </button>
      </div>

      {/* Bet Configuration */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#aabdab] mb-2">
            <span>{t("stakeAmount")}</span>
            <span className="tabular-nums font-mono text-white">{t("balance")}: {formatCurrency(balance)} PTS</span>
          </div>

          <div className="relative">
            <input
              type="number"
              min={1}
              max={balance}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              disabled={isFlipping}
              className="w-full rounded-2xl border border-white/15 bg-[#060d1c] px-4 py-3.5 font-mono text-base font-bold text-white tabular-nums focus:border-[#e2f4c6] focus:outline-none focus:ring-1 focus:ring-[#e2f4c6]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#aabdab] font-mono">
              PTS
            </span>
          </div>
        </div>

        {/* Quick Bet Presets */}
        <div className="grid grid-cols-5 gap-2">
          {[10, 50, 100, 500].map((amt) => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              disabled={isFlipping}
              className="rounded-xl border border-white/15 bg-white/5 py-2 font-mono text-xs font-bold text-white hover:border-[#e2f4c6] transition-all active:scale-95"
            >
              {amt}
            </button>
          ))}
          <button
            onClick={() => adjustBet(2)}
            disabled={isFlipping}
            className="rounded-xl border border-[#c4e77d]/40 bg-[#c4e77d]/15 py-2 font-mono text-xs font-bold text-[#c4e77d] hover:border-[#c4e77d] active:scale-95 transition-all"
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

        {/* Action Orange Button */}
        <button
          onClick={handleFlip}
          disabled={isFlipping}
          className="btn-action-orange w-full rounded-2xl py-4 text-sm font-black disabled:opacity-50"
        >
          {isFlipping ? t("flipping") : `${t("flipCoin")} (${betAmount} PTS)`}
        </button>
      </div>
    </div>
  );
}
