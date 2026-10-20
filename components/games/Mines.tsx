"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { formatCurrency } from "@/lib/utils";
import { Bomb, Gem, ShieldCheck, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

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
  const [tileLoading, setTileLoading] = useState<number | null>(null);
  const [cashoutLoading, setCashoutLoading] = useState<boolean>(false);

  const handleStartGame = async () => {
    if (betAmount <= 0) {
      setErrorMessage("Enter a valid bet amount.");
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
        // Safe Gem revealed
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

  const currentPayoutEstimate = parseFloat((betAmount * currentMultiplier).toFixed(2));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0A1026]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[#0000F2]/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0000F2]/20 text-[#00D2FF] border border-[#0000F2]/50 shadow-cyan-glow">
            <Bomb className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide text-white">MINES 5x5</h2>
            <p className="text-xs text-gray-400">Uncover safe gems • Cash out anytime before hitting a mine</p>
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

      {/* Multiplier Status Banner */}
      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-xl border border-[#1E293B] bg-[#060814] p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-gray-400">Mines Count</span>
          <p className="font-mono text-sm sm:text-base font-black text-white">{mineCount} / 25</p>
        </div>
        <div className="rounded-xl border border-[#0000F2]/40 bg-[#0000F2]/10 p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-gray-400">Current Payout</span>
          <p className="font-mono text-sm sm:text-base font-black text-[#00D2FF]">
            {isPlaying ? `${currentMultiplier.toFixed(2)}x` : "1.00x"}
          </p>
        </div>
        <div className="rounded-xl border border-[#1E293B] bg-[#060814] p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-gray-400">Next Gem</span>
          <p className="font-mono text-sm sm:text-base font-black text-emerald-400">
            {isPlaying ? `${nextMultiplier.toFixed(2)}x` : "--"}
          </p>
        </div>
      </div>

      {/* 5x5 Mines Grid */}
      <div className="mb-6 flex justify-center">
        <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-[340px] sm:max-w-[400px]">
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
                className={`relative flex aspect-square items-center justify-center rounded-xl font-bold transition-all ${
                  isExploded
                    ? "border-2 border-ruby bg-ruby text-white animate-bounce shadow-[0_0_25px_rgba(239,68,68,0.7)]"
                    : isRevealedGem
                    ? "border border-emerald-500/80 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : isMine
                    ? "border border-ruby/50 bg-ruby/20 text-ruby/80"
                    : isPlaying
                    ? "border border-[#1E293B] bg-[#0A1026] hover:border-[#0000F2] hover:bg-[#0000F2]/20 hover:shadow-cobalt-glow active:scale-95"
                    : "border border-[#1E293B]/60 bg-[#060814]/70 cursor-not-allowed text-gray-600"
                }`}
              >
                {isLoadingTile ? (
                  <RefreshCw className="h-5 w-5 animate-spin text-[#00D2FF]" />
                ) : isExploded || isMine ? (
                  <Bomb className={`h-5 w-5 sm:h-6 sm:w-6 ${isExploded ? "text-white" : "text-ruby"}`} />
                ) : isRevealedGem ? (
                  <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 animate-in zoom-in-75 duration-200" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#1E293B]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outcome notification */}
      {lastWin !== null && (
        <div className="mb-6 text-center">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-bold tracking-wide animate-in zoom-in-95 duration-200 ${
              lastWin
                ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-lg"
                : "border border-ruby/50 bg-ruby/20 text-ruby"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {lastWin
              ? `CASHED OUT: +${formatCurrency(lastPayout)} PTS (${currentMultiplier.toFixed(2)}x)`
              : "MINE DETONATED! ROUND LOST"}
          </div>
        </div>
      )}

      {/* Controls & Bet Settings */}
      {!isPlaying ? (
        <div className="space-y-4">
          {/* Mine Count Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-1.5 block">Number of Mines</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[1, 2, 3, 5, 10, 15].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setMineCount(cnt)}
                  className={`rounded-lg py-2 font-mono text-xs font-bold transition-all ${
                    mineCount === cnt
                      ? "border border-[#0000F2] bg-[#0000F2]/40 text-[#00D2FF] shadow-cyan-glow"
                      : "border border-[#1E293B] bg-[#060814] text-gray-400 hover:text-white"
                  }`}
                >
                  {cnt} {cnt === 1 ? "Mine" : "Mines"}
                </button>
              ))}
            </div>
          </div>

          {/* Stake Input */}
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
                className="w-full rounded-xl border border-[#1E293B] bg-[#060814] px-4 py-3 font-mono text-base font-bold text-white focus:border-[#0000F2] focus:outline-none focus:ring-1 focus:ring-[#0000F2]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                PTS
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-ruby/30 bg-ruby/10 p-3 text-xs font-medium text-ruby">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartGame}
            className="w-full rounded-xl border border-[#0000F2] bg-[#0000F2] py-4 text-sm font-black tracking-wider text-white shadow-cobalt-glow transition-all hover:bg-[#1E29FF] active:scale-98"
          >
            START MINES GAME ({betAmount} PTS)
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Cashout Button */}
          <button
            onClick={handleCashout}
            disabled={revealedGems.length === 0 || cashoutLoading}
            className="w-full rounded-xl border border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-500 py-4 text-sm font-black tracking-wider text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all hover:from-emerald-500 hover:to-teal-400 active:scale-98 disabled:opacity-40"
          >
            {cashoutLoading
              ? "CASHING OUT..."
              : revealedGems.length === 0
              ? "REVEAL A GEM TO CASH OUT"
              : `CASH OUT +${formatCurrency(currentPayoutEstimate)} PTS (${currentMultiplier.toFixed(2)}x)`}
          </button>
        </div>
      )}
    </div>
  );
}
