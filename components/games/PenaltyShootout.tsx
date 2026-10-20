"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import {
  Trophy,
  ShieldCheck,
  Target,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface PenaltyShootoutProps {
  onRoundComplete?: () => void;
}

const PENALTY_MULTIPLIERS = [1.92, 3.84, 7.68, 15.36, 30.72];

const SPOTS = [
  { id: 0, label: "Top-Left", bnLabel: "উপরে বাম", pos: "top-4 left-4" },
  { id: 1, label: "Top-Right", bnLabel: "উপরে ডান", pos: "top-4 right-4" },
  { id: 4, label: "Center", bnLabel: "মাঝখানে", pos: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" },
  { id: 2, label: "Bottom-Left", bnLabel: "নিচে বাম", pos: "bottom-4 left-4" },
  { id: 3, label: "Bottom-Right", bnLabel: "নিচে ডান", pos: "bottom-4 right-4" },
];

export function PenaltyShootout({ onRoundComplete }: PenaltyShootoutProps) {
  const { balance, refreshWallet } = useWallet();
  const { locale } = useLanguage();

  const [betAmount, setBetAmount] = useState<number>(100);
  const [gameState, setGameState] = useState<"IDLE" | "PLAYING" | "GOAL" | "SAVED" | "WON">("IDLE");
  const [roundId, setRoundId] = useState<string | null>(null);
  const [goals, setGoals] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(0);
  const [goalkeeperSpot, setGoalkeeperSpot] = useState<number | null>(null);
  const [lastShotSpot, setLastShotSpot] = useState<number | null>(null);
  const [shooting, setShooting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [seedHash, setSeedHash] = useState<string | null>(null);
  const [serverSeed, setServerSeed] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [winPayout, setWinPayout] = useState<number | null>(null);

  // Start penalty round
  const handleStart = async () => {
    if (betAmount > balance) {
      setErrorMsg(locale === "bn" ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient balance");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    setGoals(0);
    setCurrentMultiplier(0);
    setGoalkeeperSpot(null);
    setLastShotSpot(null);
    setWinPayout(null);
    setServerSeed(null);

    try {
      const res = await fetch("/api/games/penalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START",
          betAmount,
          clientSeed: `penalty-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message);
        setLoading(false);
        return;
      }

      setRoundId(data.roundId);
      setSeedHash(data.seedHash);
      setGameState("PLAYING");
      await refreshWallet();
    } catch {
      setErrorMsg(locale === "bn" ? "খেলা শুরু করতে ব্যর্থ হয়েছে" : "Failed to start match");
    } finally {
      setLoading(false);
    }
  };

  // Shoot at a spot
  const handleShoot = async (spotId: number) => {
    if (!roundId || shooting || gameState !== "PLAYING") return;
    setShooting(true);
    setErrorMsg(null);
    setLastShotSpot(spotId);

    try {
      const res = await fetch("/api/games/penalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SHOOT",
          roundId,
          targetSpot: spotId,
        }),
      });

      const data = await res.json();
      setGoalkeeperSpot(data.goalkeeperSpot);

      if (data.isGoal) {
        setGoals(data.goals);
        setCurrentMultiplier(data.multiplier);

        if (data.roundFinished && data.status === "WON") {
          // All 5 goals scored!
          setGameState("WON");
          setWinPayout(data.payout);
          setServerSeed(data.serverSeed);
          await refreshWallet();
          if (onRoundComplete) onRoundComplete();
        } else {
          setGameState("GOAL");
          // Return to playing state after brief celebration
          setTimeout(() => {
            if (gameState !== "WON") setGameState("PLAYING");
          }, 1200);
        }
      } else {
        // Goalkeeper saved it!
        setGameState("SAVED");
        setServerSeed(data.serverSeed);
        await refreshWallet();
        if (onRoundComplete) onRoundComplete();
      }
    } catch {
      setErrorMsg(locale === "bn" ? "শটে সমস্যা হয়েছে" : "Error taking shot");
    } finally {
      setShooting(false);
    }
  };

  // Cash out accrued multiplier
  const handleCashOut = async () => {
    if (!roundId || goals === 0) return;
    setLoading(true);

    try {
      const res = await fetch("/api/games/penalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CASHOUT",
          roundId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGameState("WON");
        setWinPayout(data.payout);
        setCurrentMultiplier(data.multiplier);
        setServerSeed(data.serverSeed);
        await refreshWallet();
        if (onRoundComplete) onRoundComplete();
      }
    } catch {
      setErrorMsg(locale === "bn" ? "ক্যাশআউটে ব্যর্থ হয়েছে" : "Failed to cash out");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mst-card relative overflow-hidden rounded-2xl border border-[#08478E]/60 bg-[#051738] p-4 sm:p-6 shadow-2xl">
      {/* Header & Goal Multiplier Ladder */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#08478E]/40 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[#FFC700]" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            {locale === "bn" ? "পেনাল্টি শ্যুট-আউট" : "PENALTY SHOOT-OUT"}
          </span>
          <span className="rounded bg-[#FFC700]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#FFC700]">
            Evoplay Style
          </span>
        </div>

        {/* 5-Shot Goal Multiplier Ladder */}
        <div className="flex items-center gap-1.5">
          {PENALTY_MULTIPLIERS.map((mult, idx) => {
            const isCompleted = goals > idx;
            const isCurrent = goals === idx && gameState === "PLAYING";
            return (
              <div
                key={idx}
                className={`flex flex-col items-center rounded-lg px-2 py-1 text-center font-mono transition-all ${
                  isCompleted
                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-400"
                    : isCurrent
                    ? "bg-[#FF6B00]/20 border border-[#FF6B00] text-[#FFC700] shadow-[0_0_12px_rgba(255,107,0,0.4)]"
                    : "bg-[#040F26] border border-[#08478E]/40 text-gray-400"
                }`}
              >
                <span className="text-[9px] font-bold uppercase">Shot {idx + 1}</span>
                <span className="text-[11px] font-black">{mult}x</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Arena Viewport */}
      <div className="relative mb-5 h-64 sm:h-72 w-full overflow-hidden rounded-xl border-4 border-[#08478E] bg-gradient-to-b from-[#040F26] via-[#051B38] to-[#0A2F1D] p-4 shadow-inner flex flex-col justify-between">
        {/* Stadium Goalpost & Net Pattern */}
        <div
          className="absolute inset-x-8 top-6 bottom-4 border-t-8 border-x-8 border-white rounded-t-lg pointer-events-none opacity-90 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Status Notification Overlay */}
        <div className="relative z-10 text-center my-auto pointer-events-none">
          {gameState === "GOAL" && (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500 px-6 py-2 animate-bounce shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <span className="font-mono text-2xl font-black text-white uppercase tracking-wider">
                {locale === "bn" ? "গোল হয়েছে!" : "GOAL!"} ({currentMultiplier}x)
              </span>
            </div>
          )}
          {gameState === "SAVED" && (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-ruby/20 border-2 border-ruby px-6 py-2 animate-pulse shadow-[0_0_25px_rgba(255,0,85,0.5)]">
              <XCircle className="h-6 w-6 text-ruby" />
              <span className="font-mono text-2xl font-black text-white uppercase tracking-wider">
                {locale === "bn" ? "গোলকিপার সেভ করেছে!" : "SAVED BY KEEPER!"}
              </span>
            </div>
          )}
          {gameState === "WON" && (
            <div className="inline-flex flex-col items-center gap-1 rounded-2xl bg-[#FF6B00]/25 border-2 border-[#FFC700] px-6 py-3 shadow-[0_0_30px_rgba(255,199,0,0.6)] animate-in zoom-in-95">
              <span className="font-mono text-2xl font-black text-[#FFC700] uppercase tracking-wider">
                {locale === "bn" ? "ম্যাচ জয়ী!" : "MATCH WON!"}
              </span>
              {winPayout && (
                <span className="font-mono text-lg font-black text-emerald-400">
                  +{formatCurrency(winPayout)} PTS ({currentMultiplier}x)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Goalkeeper Avatar */}
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none ${
            goalkeeperSpot === 0
              ? "-translate-x-32 -translate-y-16 rotate-12"
              : goalkeeperSpot === 1
              ? "translate-x-32 -translate-y-16 -rotate-12"
              : goalkeeperSpot === 2
              ? "-translate-x-32 translate-y-2 rotate-45"
              : goalkeeperSpot === 3
              ? "translate-x-32 translate-y-2 -rotate-45"
              : ""
          }`}
        >
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full border-2 border-white bg-amber-500 shadow-md flex items-center justify-center font-black text-xs text-white">
              GK
            </div>
            <div className="h-14 w-8 bg-blue-600 rounded-lg shadow-inner -mt-1 flex items-center justify-center text-[10px] text-white font-bold">
              1
            </div>
          </div>
        </div>

        {/* Interactive Shoot Target Spots (5 Spots) */}
        {gameState === "PLAYING" && (
          <div className="absolute inset-x-12 top-10 bottom-8 z-20">
            {SPOTS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleShoot(s.id)}
                disabled={shooting}
                className={`absolute ${s.pos} group flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#FFC700]/70 bg-black/40 hover:bg-[#FF6B00]/40 hover:border-[#FF6B00] hover:scale-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,199,0,0.3)]`}
              >
                <Target className="h-7 w-7 text-[#FFC700] group-hover:text-white transition-colors" />
                <span className="sr-only">{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Penalty Spot & Football Ball Indicator */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-gray-300 border-t border-[#08478E]/40 pt-2 font-mono">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            <span>{locale === "bn" ? "টার্গেটে ক্লিক করে শ্যুট করুন" : "Click target zone to shoot"}</span>
          </div>
          <span className="text-[#FFC700] font-bold">Goals: {goals}/5</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-ruby/50 bg-ruby/10 p-3 text-xs font-bold text-ruby">
          {errorMsg}
        </div>
      )}

      {/* Stake & Controls */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-gray-300">
            {locale === "bn" ? "বাজির পরিমাণ" : "Stake Amount"}
          </span>
          <span className="font-mono text-gray-400">
            {locale === "bn" ? "ব্যালেন্স" : "Balance"}: {formatCurrency(balance)} PTS
          </span>
        </div>
        <div className="relative">
          <input
            type="number"
            disabled={gameState === "PLAYING" || gameState === "GOAL"}
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
            className="w-full rounded-xl border border-[#08478E]/60 bg-[#040F26] px-3.5 py-3 font-mono text-sm font-bold text-white tabular-nums focus:border-[#FF6B00] focus:outline-none"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-gray-400">
            PTS
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[50, 100, 250, 500].map((amt) => (
            <button
              key={amt}
              disabled={gameState === "PLAYING" || gameState === "GOAL"}
              onClick={() => setBetAmount(amt)}
              className={`rounded-lg py-1.5 font-mono text-[11px] font-bold transition-all ${
                betAmount === amt
                  ? "border border-[#FF6B00] bg-[#FF6B00]/25 text-[#FFC700]"
                  : "border border-[#08478E]/40 bg-[#040F26] text-gray-300 hover:text-white"
              }`}
            >
              +{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons: Start Shootout vs Cash Out */}
      {gameState === "PLAYING" || gameState === "GOAL" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleCashOut}
            disabled={goals === 0 || loading}
            className="btn-action-orange w-full rounded-xl py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Zap className="h-4 w-4" />
            <span>
              {locale === "bn" ? "ক্যাশ আউট" : "CASH OUT"} (+{formatCurrency(betAmount * currentMultiplier)} PTS)
            </span>
          </button>
          <div className="flex items-center justify-center rounded-xl border border-[#08478E]/60 bg-[#040F26] p-2 text-xs font-bold text-[#FFC700] text-center">
            {locale === "bn" ? "যেকোনো টার্গেটে শট নিন" : "Aim and shoot at a target above"}
          </div>
        </div>
      ) : (
        <button
          onClick={handleStart}
          disabled={loading}
          className="btn-action-orange w-full rounded-xl py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          <span>
            {loading
              ? locale === "bn"
                ? "শুরু হচ্ছে..."
                : "STARTING..."
              : locale === "bn"
              ? `পেনাল্টি শুরু (${betAmount} PTS)`
              : `START PENALTY (${betAmount} PTS)`}
          </span>
        </button>
      )}

      {/* Provably Fair Audit Drawer */}
      <div className="mt-4 rounded-xl border border-[#08478E]/40 bg-[#040F26] p-3 text-xs text-gray-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[#FFC700]" />
          <span className="font-bold uppercase tracking-wider text-gray-300">
            {locale === "bn" ? "প্রুভেবলি ফেয়ার অডিট" : "Provably Fair Verification"}
          </span>
        </div>
        <div className="font-mono text-[10px] text-gray-500 max-w-[200px] truncate">
          {seedHash ? `Hash: ${seedHash.slice(0, 16)}...` : "SHA-256 HMAC Pre-Committed"}
        </div>
      </div>
    </div>
  );
}
