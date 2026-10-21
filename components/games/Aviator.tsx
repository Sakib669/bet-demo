"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import {
  Plane,
  Flame,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
} from "lucide-react";

interface AviatorProps {
  onRoundComplete?: () => void;
}

export function Aviator({ onRoundComplete }: AviatorProps) {
  const { balance, refreshWallet } = useWallet();
  const { locale } = useLanguage();

  const [betAmount, setBetAmount] = useState<number>(100);
  const [autoCashout, setAutoCashout] = useState<boolean>(false);
  const [autoCashoutTarget, setAutoCashoutTarget] = useState<number>(2.0);

  // Flight states
  const [gameState, setGameState] = useState<"IDLE" | "FLYING" | "CRASHED" | "CASHED_OUT">("IDLE");
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [seedHash, setSeedHash] = useState<string | null>(null);
  const [serverSeed, setServerSeed] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [winPayout, setWinPayout] = useState<number | null>(null);

  // Past rounds multiplier history bar (Mostbet Aviator pill style)
  const [history, setHistory] = useState<number[]>([1.34, 2.45, 1.12, 5.82, 1.05, 3.19, 14.6]);

  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const flightActiveRef = useRef<boolean>(false);
  const currentMultRef = useRef<number>(1.0);
  const targetCrashRef = useRef<number>(1.0);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Launch Flight
  const handleStartFlight = async () => {
    if (betAmount > balance) {
      setErrorMsg(locale === "bn" ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient balance");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    setWinPayout(null);
    setServerSeed(null);

    try {
      const res = await fetch("/api/games/aviator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START",
          betAmount,
          clientSeed: `aviator-${Date.now()}`,
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
      await refreshWallet();

      // Begin smooth visual flight curve
      setGameState("FLYING");
      flightActiveRef.current = true;
      startTimeRef.current = performance.now();
      currentMultRef.current = 1.0;
      setCurrentMultiplier(1.0);

      runFlightLoop(data.roundId);
    } catch {
      setErrorMsg(locale === "bn" ? "ফ্লাইট শুরু করতে ব্যর্থ হয়েছে" : "Failed to launch flight");
    } finally {
      setLoading(false);
    }
  };

  const runFlightLoop = (activeRoundId: string) => {
    const loop = (timestamp: number) => {
      if (!flightActiveRef.current) return;

      const elapsedMs = timestamp - startTimeRef.current;
      // Exponential curve: starts steady, climbs rapidly
      const rawMult = 1.0 + Math.pow(elapsedMs / 3000, 1.85);
      const mult = parseFloat(rawMult.toFixed(2));
      currentMultRef.current = mult;
      setCurrentMultiplier(mult);

      // Check auto-cashout condition
      if (autoCashout && mult >= autoCashoutTarget) {
        handleCashOut(activeRoundId, mult);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  // Cash Out
  const handleCashOut = async (activeRoundId = roundId, claimedMult = currentMultRef.current) => {
    if (!activeRoundId || !flightActiveRef.current) return;
    flightActiveRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    try {
      const res = await fetch("/api/games/aviator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CASHOUT",
          roundId: activeRoundId,
          claimedMultiplier: claimedMult,
        }),
      });

      const data = await res.json();

      if (data.won) {
        setGameState("CASHED_OUT");
        setWinPayout(data.payout);
        setCurrentMultiplier(data.multiplier);
        setServerSeed(data.serverSeed);
        setHistory((prev) => [data.multiplier, ...prev.slice(0, 7)]);
        await refreshWallet();
        if (onRoundComplete) onRoundComplete();
      } else {
        // Crashed before cashout
        setGameState("CRASHED");
        setCrashPoint(data.crashMultiplier);
        setCurrentMultiplier(data.crashMultiplier);
        setServerSeed(data.serverSeed);
        setHistory((prev) => [data.crashMultiplier, ...prev.slice(0, 7)]);
        await refreshWallet();
        if (onRoundComplete) onRoundComplete();
      }
    } catch {
      setErrorMsg(locale === "bn" ? "ক্যাশআউটে ত্রুটি" : "Cash out error");
      setGameState("CRASHED");
    }
  };

  // Trajectory progress percentages for SVG animation (0% to 100%)
  const progressRatio = Math.min(1, (currentMultiplier - 1.0) / 10.0);
  const planeX = 10 + progressRatio * 75; // percent
  const planeY = 85 - progressRatio * 70; // percent

  return (
    <div className="mst-card relative overflow-hidden rounded-2xl border border-[#193e87]/60 bg-[#0e1f3d] p-4 sm:p-6 shadow-2xl">
      {/* Top Multiplier History Bar (Mostbet Aviator Header) */}
      <div className="mb-4 flex items-center justify-between border-b border-[#193e87]/40 pb-3">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-[#fc7219]" />
          <span className="text-xs font-black uppercase tracking-wider text-white">
            {locale === "bn" ? "এভিয়েটর ক্র্যাশ" : "AVIATOR CRASH"}
          </span>
          <span className="rounded bg-[#fc7219]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#fc7219]">
            99.0% RTP
          </span>
        </div>

        {/* History Multiplier Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[280px] sm:max-w-md no-scrollbar py-0.5">
          {history.map((m, idx) => {
            const isHigh = m >= 10.0;
            const isMid = m >= 2.0;
            return (
              <span
                key={idx}
                className={`rounded-md px-2 py-0.5 font-mono text-[11px] font-black tabular-nums transition-transform ${
                  isHigh
                    ? "bg-[#fedbbb]/20 text-[#fedbbb] border border-[#fedbbb]/50"
                    : isMid
                    ? "bg-[#fc7219]/20 text-[#fc7219] border border-[#fc7219]/40"
                    : "bg-[#193e87]/40 text-gray-300 border border-[#193e87]/60"
                }`}
              >
                {m.toFixed(2)}x
              </span>
            );
          })}
        </div>
      </div>

      {/* Flight Canvas Arena */}
      <div className="relative mb-5 h-64 sm:h-72 w-full overflow-hidden rounded-xl border border-[#193e87]/80 bg-[#081329] shadow-inner flex flex-col justify-between p-4">
        {/* Background Runway Grid */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#3B82F6 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Glowing atmospheric flight aura */}
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#fc7219]/10 blur-3xl pointer-events-none" />

        {/* Big Center Multiplier Display */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
          {gameState === "CRASHED" ? (
            <div className="animate-bounce">
              <span className="font-mono text-3xl sm:text-5xl font-black text-ruby tracking-tight drop-shadow-[0_0_25px_rgba(255,0,85,0.6)]">
                {locale === "bn" ? "উড়ে গেছে!" : "FLEW AWAY!"}
              </span>
              <p className="mt-1 font-mono text-xl sm:text-2xl font-bold text-gray-300 tabular-nums">
                @{currentMultiplier.toFixed(2)}x
              </p>
            </div>
          ) : gameState === "CASHED_OUT" ? (
            <div className="animate-in zoom-in-95 duration-200">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black uppercase text-emerald-400 border border-emerald-500/40 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{locale === "bn" ? "ক্যাশআউট সফল!" : "CASHED OUT!"}</span>
              </div>
              <p className="font-mono text-3xl sm:text-5xl font-black text-[#fedbbb] tracking-tight tabular-nums drop-shadow-[0_0_20px_rgba(255,199,0,0.5)]">
                {currentMultiplier.toFixed(2)}x
              </p>
              {winPayout && (
                <p className="mt-1 font-mono text-base font-black text-emerald-400">
                  +{formatCurrency(winPayout)} PTS
                </p>
              )}
            </div>
          ) : (
            <div>
              <span
                className={`font-mono text-4xl sm:text-6xl font-black tracking-tight tabular-nums transition-colors ${
                  gameState === "FLYING"
                    ? "text-white drop-shadow-[0_0_25px_rgba(255,107,0,0.8)]"
                    : "text-gray-400"
                }`}
              >
                {currentMultiplier.toFixed(2)}x
              </span>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {gameState === "FLYING"
                  ? locale === "bn"
                    ? "ফ্লাইট সক্রিয়..."
                    : "PLANE IN FLIGHT"
                  : locale === "bn"
                  ? "উড্ডয়নের জন্য প্রস্তুত"
                  : "READY FOR TAKEOFF"}
              </p>
            </div>
          )}
        </div>

        {/* Animated Flight Path & SVG Red Jet */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {gameState === "FLYING" && (
              <path
                d={`M 5 95 Q ${planeX / 2} 95, ${planeX} ${planeY}`}
                fill="none"
                stroke="url(#flightGrad)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
            <defs>
              <linearGradient id="flightGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#193e87" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#fc7219" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Jet Icon positioned dynamically */}
          {gameState === "FLYING" && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
              style={{
                left: `${planeX}%`,
                top: `${planeY}%`,
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* Flame trail behind jet */}
                <Flame className="absolute -left-4 h-5 w-5 text-[#fc7219] animate-pulse -rotate-90" />
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#fc7219] to-[#fedbbb] text-white shadow-[0_0_20px_rgba(255,107,0,0.9)] transform -rotate-12">
                  <Plane className="h-5 w-5 fill-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Arena Stats */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-gray-400 border-t border-[#193e87]/40 pt-2 font-mono">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-[#fc7219]" />
            <span>{locale === "bn" ? "অড বৃদ্ধি: সূচকীয়" : "Odds Scale: Exponential"}</span>
          </div>
          <span>CSPRNG HMAC-SHA256</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-ruby/50 bg-ruby/10 p-3 text-xs font-bold text-ruby">
          {errorMsg}
        </div>
      )}

      {/* Bet & Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Stake Configuration */}
        <div className="space-y-2">
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
              disabled={gameState === "FLYING"}
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-xl border border-[#193e87]/60 bg-[#081329] px-3.5 py-3 font-mono text-sm font-bold text-white tabular-nums focus:border-[#fc7219] focus:outline-none"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-gray-400">
              PTS
            </span>
          </div>
          {/* Quick stake multipliers */}
          <div className="grid grid-cols-4 gap-1.5">
            {[50, 100, 250, 500].map((amt) => (
              <button
                key={amt}
                disabled={gameState === "FLYING"}
                onClick={() => setBetAmount(amt)}
                className={`rounded-lg py-1.5 font-mono text-[11px] font-bold transition-all ${
                  betAmount === amt
                    ? "border border-[#fc7219] bg-[#fc7219]/25 text-[#fedbbb]"
                    : "border border-[#193e87]/40 bg-[#081329] text-gray-300 hover:text-white"
                }`}
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Auto Cashout Feature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-gray-300">
              {locale === "bn" ? "অটো ক্যাশ আউট" : "Auto Cash Out"}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                disabled={gameState === "FLYING"}
                checked={autoCashout}
                onChange={(e) => setAutoCashout(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#fc7219]" />
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              disabled={!autoCashout || gameState === "FLYING"}
              value={autoCashoutTarget}
              onChange={(e) => setAutoCashoutTarget(Math.max(1.05, Number(e.target.value)))}
              className="w-full rounded-xl border border-[#193e87]/60 bg-[#081329] px-3.5 py-3 font-mono text-sm font-bold text-white tabular-nums focus:border-[#fc7219] focus:outline-none disabled:opacity-40"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#fedbbb]">
              X
            </span>
          </div>
          {/* Quick Auto Multiplier */}
          <div className="grid grid-cols-4 gap-1.5">
            {[1.5, 2.0, 5.0, 10.0].map((t) => (
              <button
                key={t}
                disabled={!autoCashout || gameState === "FLYING"}
                onClick={() => setAutoCashoutTarget(t)}
                className={`rounded-lg py-1.5 font-mono text-[11px] font-bold transition-all disabled:opacity-30 ${
                  autoCashoutTarget === t
                    ? "border border-[#fc7219] bg-[#fc7219]/25 text-[#fedbbb]"
                    : "border border-[#193e87]/40 bg-[#081329] text-gray-300 hover:text-white"
                }`}
              >
                {t}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Action Button (Mostbet Action Orange) */}
      {gameState === "FLYING" ? (
        <button
          onClick={() => handleCashOut()}
          className="btn-action-orange w-full rounded-xl py-4 text-base font-black uppercase tracking-wider text-white shadow-[0_6px_20px_rgba(255,107,0,0.6)] animate-pulse active:scale-98 flex items-center justify-center gap-2"
        >
          <Zap className="h-5 w-5 fill-white" />
          <span>
            {locale === "bn" ? "ক্যাশ আউট" : "CASH OUT"} +{formatCurrency(betAmount * currentMultiplier)} PTS ({currentMultiplier.toFixed(2)}x)
          </span>
        </button>
      ) : (
        <button
          onClick={handleStartFlight}
          disabled={loading}
          className="btn-action-orange w-full rounded-xl py-4 text-base font-black uppercase tracking-wider text-white shadow-[0_6px_20px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plane className="h-5 w-5" />
          <span>
            {loading
              ? locale === "bn"
                ? "লঞ্চ হচ্ছে..."
                : "LAUNCHING..."
              : locale === "bn"
              ? `উড্ডয়ন শুরু (${betAmount} PTS)`
              : `TAKE OFF (${betAmount} PTS)`}
          </span>
        </button>
      )}

      {/* Provably Fair Audit Drawer */}
      <div className="mt-4 rounded-xl border border-[#193e87]/40 bg-[#081329] p-3 text-xs text-gray-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-[#fedbbb]" />
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
