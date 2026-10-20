"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency } from "@/lib/utils";
import { Bomb, Gem, ShieldCheck, Sparkles, AlertCircle, RefreshCw, Check } from "lucide-react";

export function Mines() {
  const { balance, updateBalance } = useWallet();
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
      setErrorMessage("Enter a valid stake amount.");
      return;
    }
    if (betAmount > balance) {
      setErrorMessage("Insufficient demo balance.");
      return;
    }

    setErrorMessage(null);
    setRevealedGems([]);
    setAllMines([]);
    setExplodedTile(null);
    setLastWin(null);
    setLastPayout(0);

    try {
      const res = await fetch("/api/games/mines", {
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
        setErrorMessage(data.message || "Failed to start Mines round.");
        return;
      }

      setRoundId(data.roundId);
      setCurrentMultiplier(data.currentMultiplier);
      setNextMultiplier(data.nextMultiplier);
      setSeedHash(data.seedHash);
      updateBalance(data.newBalance);
      setIsPlaying(true);
    } catch {
      setErrorMessage("Network error starting game.");
    }
  };

  const handleRevealTile = async (tileIndex: number) => {
    if (!isPlaying || !roundId || revealedGems.includes(tileIndex) || tileLoading !== null) {
      return;
    }

    setTileLoading(tileIndex);

    try {
      const res = await fetch("/api/games/mines", {
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
        setErrorMessage(data.message || "Tile reveal failed.");
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
      setErrorMessage("Error revealing tile.");
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
      const res = await fetch("/api/games/mines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CASHOUT",
          roundId,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.message || "Cashout failed.");
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
      setErrorMessage("Error during cashout.");
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
    <div className="glass-surface relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-2xl">
      <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-[#0000F2]/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0000F2]/20 text-[#00D2FF] border border-[#0000F2]/50 shadow-[0_0_20px_rgba(0,210,255,0.25)]">
            <Bomb className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white">Mines 5x5</h2>
              <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30">
                DYNAMIC CASHOUT
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium">Uncover safe gems • Lock in profits anytime</p>
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

      {/* Fairness Drawer */}
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

      {/* Multiplier Status Banner */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3 sm:p-4 text-center shadow-inner">
          <span className="text-[10px] uppercase font-bold text-gray-400">Mine Density</span>
          <p className="font-mono text-sm sm:text-base font-black text-white tabular-nums mt-0.5">
            {mineCount} / 25
          </p>
        </div>
        <div className="rounded-2xl border border-[#0000F2]/50 bg-[#0000F2]/15 p-3 sm:p-4 text-center shadow-[0_0_20px_rgba(0,0,242,0.2)]">
          <span className="text-[10px] uppercase font-bold text-[#00D2FF]">Current Multiplier</span>
          <p className="font-mono text-base sm:text-lg font-black text-[#00D2FF] tabular-nums mt-0.5">
            {isPlaying ? `${currentMultiplier.toFixed(2)}x` : "1.00x"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3 sm:p-4 text-center shadow-inner">
          <span className="text-[10px] uppercase font-bold text-gray-400">Next Tile</span>
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
                    ? "border border-emerald-400/80 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                    : isMine
                    ? "border border-ruby/50 bg-ruby/20 text-ruby/80"
                    : isPlaying
                    ? "border border-white/10 bg-white/[0.04] hover:border-[#0000F2] hover:bg-[#0000F2]/20 hover:shadow-cobalt-glow active:scale-95 cursor-pointer shadow-inner"
                    : "border border-white/5 bg-white/[0.02] cursor-not-allowed text-gray-600"
                }`}
              >
                {isLoadingTile ? (
                  <RefreshCw className="h-5 w-5 animate-spin text-[#00D2FF]" />
                ) : isExploded || isMine ? (
                  <Bomb className={`h-5 w-5 sm:h-6 sm:w-6 ${isExploded ? "text-white" : "text-ruby"}`} />
                ) : isRevealedGem ? (
                  <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 animate-in zoom-in-50 duration-200" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
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
                ? "border border-emerald-400/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : "border border-ruby/50 bg-ruby/15 text-ruby"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {lastWin
              ? `Cashed Out +${formatCurrency(lastPayout)} PTS (${currentMultiplier.toFixed(2)}x)`
              : "Detonation — Round Finished"}
          </div>
        </div>
      )}

      {/* Controls */}
      {!isPlaying ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">Number of Mines</label>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setMineCount(cnt)}
                  className={`rounded-xl py-2 font-mono text-xs font-bold transition-all ${
                    mineCount === cnt
                      ? "border border-[#0000F2] bg-[#0000F2]/40 text-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                      : "border border-white/10 bg-white/[0.03] text-gray-400 hover:text-white"
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2">
              <span>Stake Amount</span>
              <span className="font-mono tabular-nums text-gray-300">Balance: {formatCurrency(balance)} PTS</span>
            </div>

            <div className="relative">
              <input
                type="number"
                min={1}
                max={balance}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 font-mono text-base font-bold text-white tabular-nums focus:border-[#0000F2] focus:outline-none focus:ring-1 focus:ring-[#0000F2]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 font-mono">
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
            className="btn-tactile w-full rounded-2xl border border-[#0000F2] bg-[#0000F2] py-4 text-sm font-black tracking-wider text-white shadow-cobalt-glow active:scale-98"
          >
            Start Mines Game ({betAmount} PTS)
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={handleCashout}
            disabled={revealedGems.length === 0 || cashoutLoading}
            className="w-full rounded-2xl border border-emerald-400 bg-gradient-to-r from-emerald-600 to-teal-500 py-4 text-sm font-black tracking-wider text-white shadow-[0_0_30px_rgba(16,185,129,0.45)] transition-all hover:brightness-110 active:scale-98 disabled:opacity-40"
          >
            {cashoutLoading
              ? "Cashing Out..."
              : revealedGems.length === 0
              ? "Uncover Safe Gem to Cash Out"
              : `Cash Out +${formatCurrency(currentPayoutEstimate)} PTS (${currentMultiplier.toFixed(2)}x)`}
          </button>
        </div>
      )}
    </div>
  );
}
