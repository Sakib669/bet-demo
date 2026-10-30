"use client";

import { localFetch } from "@/lib/browser-db";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import { Bomb, Gem, ShieldCheck, Sparkles, AlertCircle, RefreshCw, Check } from "lucide-react";

export function Mines() {
  const { balance, updateBalance } = useWallet();
  const { t, locale } = useLanguage();
  const [betAmount, setBetAmount] = useState<number>(50);
  const [mineCount, setMineCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [nextMultiplier, setNextMultiplier] = useState<number>(1.12);
  const [revealedGems, setRevealedGems] = useState<number[]>([]);
  const [allMines, setAllMines] = useState<number[]>([]);
  const [explodedTile, setExplodedTile] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [lastPayout, setLastPayout] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seedHash, setSeedHash] = useState<string | null>(null);
  const [showFairness, setShowFairness] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [tileLoading, setTileLoading] = useState<number | null>(null);
  const [cashoutLoading, setCashoutLoading] = useState<boolean>(false);

  const handleStartGame = async () => {
    if (betAmount <= 0) {
      setErrorMessage(locale === "bn" ? "সঠিক বাজির পরিমাণ লিখুন।" : "Enter a valid stake amount.");
      return;
    }
    if (betAmount > balance) {
      setErrorMessage(locale === "bn" ? "পর্যাপ্ত ব্যালেন্স নেই।" : "Insufficient demo balance.");
      return;
    }

    setErrorMessage(null);
    setRevealedGems([]);
    setAllMines([]);
    setExplodedTile(null);
    setLastWin(null);
    setLastPayout(0);

    try {
      const res = await localFetch("/api/games/mines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START",
          betAmount,
          mineCount,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.message || (locale === "bn" ? "গেম শুরু করতে সমস্যা হয়েছে।" : "Failed to start Mines round."));
        return;
      }

      setRoundId(data.roundId);
      setCurrentMultiplier(data.currentMultiplier);
      setNextMultiplier(data.nextMultiplier);
      setSeedHash(data.seedHash);
      updateBalance(data.newBalance);
      setIsPlaying(true);
    } catch {
      setErrorMessage(locale === "bn" ? "নেটওয়ার্ক ত্রুটি।" : "Network error starting game.");
    }
  };

  const handleRevealTile = async (tileIndex: number) => {
    if (!isPlaying || !roundId || revealedGems.includes(tileIndex) || tileLoading !== null) {
      return;
    }

    setTileLoading(tileIndex);

    try {
      const res = await localFetch("/api/games/mines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REVEAL",
          roundId,
          tileIndex,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.message || (locale === "bn" ? "টাইল খুলতে সমস্যা হয়েছে।" : "Tile reveal failed."));
        setTileLoading(null);
        return;
      }

      if (data.status === "LOST") {
        setExplodedTile(data.explodedTile);
        setAllMines(data.allMines || []);
        setIsPlaying(false);
        setLastWin(false);
        setRoundId(null);
      } else if (data.status === "WON" && data.isAutoWin) {
        setRevealedGems(data.revealedGems);
        setAllMines(data.allMines || []);
        setIsPlaying(false);
        setLastWin(true);
        setLastPayout(data.payout);
        updateBalance(data.newBalance);
        setRoundId(null);
      } else {
        setRevealedGems(data.revealedGems);
        setCurrentMultiplier(data.currentMultiplier);
        setNextMultiplier(data.nextMultiplier);
      }
    } catch {
      setErrorMessage(locale === "bn" ? "টাইল খুলতে ত্রুটি।" : "Error revealing tile.");
    } finally {
      setTileLoading(null);
    }
  };

  const handleCashout = async () => {
    if (!isPlaying || !roundId || revealedGems.length === 0 || cashoutLoading) {
      return;
    }

    setCashoutLoading(true);

    try {
      const res = await localFetch("/api/games/mines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CASHOUT",
          roundId,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.message || (locale === "bn" ? "ক্যাশআউট ব্যর্থ হয়েছে।" : "Cashout failed."));
        setCashoutLoading(false);
        return;
      }

      setAllMines(data.allMines || []);
      setIsPlaying(false);
      setLastWin(true);
      setLastPayout(data.payout);
      updateBalance(data.newBalance);
      setRoundId(null);
    } catch {
      setErrorMessage(locale === "bn" ? "ক্যাশআউটে সমস্যা হয়েছে।" : "Error during cashout.");
    } finally {
      setCashoutLoading(false);
    }
  };

  const copySeed = () => {
    if (!seedHash) return;
    navigator.clipboard.writeText(seedHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const currentPayoutEstimate = parseFloat((betAmount * currentMultiplier).toFixed(2));

  return (
    <div className="mst-card relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-2xl">
      <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-[#345441]/30 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#345441] text-[#e2f4c6] border border-white/15 shadow-[0_0_15px_rgba(255,199,0,0.3)]">
            <Bomb className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white uppercase">{t("minesTitle")}</h2>
              <span className="rounded bg-[#c4e77d] px-2 py-0.5 text-[10px] font-mono font-black text-white">
                DYNAMIC CASHOUT
              </span>
            </div>
            <p className="text-xs text-[#aabdab] font-medium">{t("minesHeaderDesc")}</p>
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

      {/* Multiplier Status Banner */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-2xl border border-white/15 bg-[#060d1c] p-3 sm:p-4 text-center shadow-inner">
          <span className="text-[10px] uppercase font-bold text-[#aabdab]">{t("mineDensity")}</span>
          <p className="font-mono text-sm sm:text-base font-black text-white tabular-nums mt-0.5">
            {mineCount} / 25
          </p>
        </div>
        <div className="rounded-2xl border border-[#e2f4c6]/40 bg-[#345441]/40 p-3 sm:p-4 text-center shadow-[0_0_20px_rgba(255,199,0,0.2)]">
          <span className="text-[10px] uppercase font-bold text-[#e2f4c6]">{t("currentMultiplier")}</span>
          <p className="font-mono text-base sm:text-lg font-black text-[#e2f4c6] tabular-nums mt-0.5">
            {isPlaying ? `${currentMultiplier.toFixed(2)}x` : "1.00x"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-[#060d1c] p-3 sm:p-4 text-center shadow-inner">
          <span className="text-[10px] uppercase font-bold text-[#aabdab]">{t("nextTile")}</span>
          <p className="font-mono text-sm sm:text-base font-black text-emerald-400 tabular-nums mt-0.5">
            {isPlaying ? `${nextMultiplier.toFixed(2)}x` : "--"}
          </p>
        </div>
      </div>

      {/* 5x5 Mines Grid */}
      <div className="mb-6 flex justify-center">
        <div className="grid grid-cols-5 gap-2.5 sm:gap-3.5 w-full max-w-[340px] sm:max-w-[420px]">
          {Array.from({ length: 25 }).map((_, index) => {
            const isRevealedGem = revealedGems.includes(index);
            const isMine = allMines.includes(index);
            const isExploded = explodedTile === index;
            const isLoadingTile = tileLoading === index;

            return (
              <button
                key={index}
                onClick={() => handleRevealTile(index)}
                disabled={!isPlaying || isRevealedGem || !roundId}
                className={`relative flex aspect-square items-center justify-center rounded-2xl font-bold transition-all duration-200 ${
                  isExploded
                    ? "border-2 border-ruby bg-ruby text-white animate-bounce shadow-[0_0_30px_rgba(239,68,68,0.7)]"
                    : isRevealedGem
                    ? "border-2 border-[#e2f4c6] bg-[#e2f4c6]/20 text-[#e2f4c6] shadow-[0_0_20px_rgba(255,199,0,0.4)]"
                    : isMine
                    ? "border border-ruby/50 bg-ruby/20 text-ruby/80"
                    : isPlaying
                    ? "border border-white/15 bg-[#345441]/50 hover:border-[#e2f4c6] hover:bg-[#345441] hover:shadow-[0_0_15px_rgba(255,199,0,0.3)] active:scale-95 cursor-pointer shadow-inner"
                    : "border border-white/5 bg-white/[0.02] cursor-not-allowed text-gray-600"
                }`}
              >
                {isLoadingTile ? (
                  <RefreshCw className="h-5 w-5 animate-spin text-[#e2f4c6]" />
                ) : isExploded || isMine ? (
                  <Bomb className={`h-5 w-5 sm:h-6 sm:w-6 ${isExploded ? "text-white" : "text-ruby"}`} />
                ) : isRevealedGem ? (
                  <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-[#e2f4c6] animate-in zoom-in-50 duration-200" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#aabdab]/30" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outcome Banner */}
      {lastWin !== null && (
        <div className="mb-6 text-center">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-black tracking-wide animate-in zoom-in-95 duration-200 ${
              lastWin
                ? "border border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "border border-ruby/50 bg-ruby/20 text-ruby"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {lastWin
              ? `${t("wonMsg")} +${formatCurrency(lastPayout)} PTS (${currentMultiplier.toFixed(2)}x)`
              : t("detonated")}
          </div>
        </div>
      )}

      {/* Controls */}
      {!isPlaying ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#aabdab] mb-2 block">{t("numberMines")}</label>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setMineCount(cnt)}
                  className={`rounded-xl py-2 font-mono text-xs font-bold transition-all ${
                    mineCount === cnt
                      ? "border border-[#e2f4c6] bg-[#e2f4c6]/20 text-[#e2f4c6] shadow-[0_0_15px_rgba(255,199,0,0.3)]"
                      : "border border-white/15 bg-white/5 text-[#aabdab] hover:text-white"
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#aabdab] mb-2">
              <span>{t("stakeAmount")}</span>
              <span className="font-mono tabular-nums text-white">{t("balance")}: {formatCurrency(balance)} PTS</span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={1}
                max={balance}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-2xl border border-white/15 bg-[#060d1c] px-4 py-3.5 font-mono text-base font-bold text-white tabular-nums focus:border-[#e2f4c6] focus:outline-none focus:ring-1 focus:ring-[#e2f4c6]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#aabdab] font-mono">
                PTS
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-ruby/40 bg-ruby/10 p-3.5 text-xs font-semibold text-ruby">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={handleStartGame}
            className="btn-action-orange w-full rounded-2xl py-4 text-sm font-black tracking-wider"
          >
            {t("startMines")} ({betAmount} PTS)
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleCashout}
            disabled={revealedGems.length === 0 || cashoutLoading}
            className="w-full rounded-2xl border border-[#e2f4c6] bg-gradient-to-r from-amber-500 via-[#c4e77d] to-orange-600 py-4 text-sm font-black tracking-wider text-white shadow-[0_0_30px_rgba(255,107,0,0.5)] transition-all hover:brightness-110 active:scale-98 disabled:opacity-40"
          >
            {cashoutLoading
              ? t("cashingOut")
              : revealedGems.length === 0
              ? t("uncoverFirst")
              : `${t("cashOut")} +${formatCurrency(currentPayoutEstimate)} PTS (${currentMultiplier.toFixed(2)}x)`}
          </button>
        </div>
      )}
    </div>
  );
}
