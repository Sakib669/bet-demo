"use client";

import { localFetch } from "@/lib/browser-db";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";
import {
  CRAZY_WHEEL_SEGMENTS,
  WheelSegment,
} from "@/lib/game-data";
import {
  Sparkles,
  Trophy,
  ShieldCheck,
  Disc3,
  RotateCw,
} from "lucide-react";

interface CrazyWheelProps {
  onRoundComplete?: () => void;
}

export function CrazyWheel({ onRoundComplete }: CrazyWheelProps) {
  const { balance, refreshWallet } = useWallet();
  const { locale } = useLanguage();

  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(2);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [lastWin, setLastWin] = useState<{ amount: number; won: boolean; mult: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const segmentCount = CRAZY_WHEEL_SEGMENTS.length;
  const anglePerSegment = 360 / segmentCount;

  const handleSpin = async () => {
    if (betAmount > balance) {
      setErrorMsg(locale === "bn" ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient balance");
      return;
    }

    setErrorMsg(null);
    setSpinning(true);
    setLastWin(null);

    try {
      const res = await localFetch("/api/games/wheel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          betAmount,
          selectedMultiplier,
          clientSeed: `wheel-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message);
        setSpinning(false);
        return;
      }

      const segmentIndex = data.winningSegment.index;
      // Calculate target angle (each segment center) + extra spins for cinematic effect
      const extraRounds = 5 * 360;
      // Point at the top (270 deg or pointer at 0 deg)
      const targetDeg = extraRounds + (360 - (segmentIndex * anglePerSegment + anglePerSegment / 2));

      setRotationAngle((prev) => prev + targetDeg);

      setTimeout(() => {
        setSpinning(false);
        setLastWin({
          amount: data.payout,
          won: data.won,
          mult: data.winningSegment.multiplier,
        });
        refreshWallet();
        if (onRoundComplete) onRoundComplete();
      }, 3500);
    } catch {
      setErrorMsg(locale === "bn" ? "হুইল ঘোরাতে ব্যর্থ হয়েছে" : "Spin request failed");
      setSpinning(false);
    }
  };

  return (
    <div className="mst-card relative overflow-hidden rounded-2xl border border-[#345441]/70 bg-[#182b21] p-4 sm:p-6 shadow-2xl">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-[#345441]/50 pb-3">
        <div className="flex items-center gap-2">
          <Disc3 className="h-5 w-5 text-[#c4e77d] animate-spin" />
          <span className="text-sm font-black uppercase tracking-wider text-white">
            {locale === "bn" ? "ক্রেজি হুইল ৫০x" : "CRAZY MONEY WHEEL"}
          </span>
          <span className="rounded bg-[#c4e77d]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#c4e77d] border border-[#c4e77d]/40">
            50X MAX
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-[#e2f4c6]">
          <ShieldCheck className="h-4 w-4" />
          <span>Browser random</span>
        </div>
      </div>

      {/* Rotating Wheel Arena */}
      <div className="relative mb-5 flex flex-col items-center justify-center min-h-[300px] overflow-hidden rounded-2xl border border-[#345441] bg-gradient-to-b from-[#0c1714] to-[#0d1d3a] p-4 shadow-inner">
        {/* Top Ticker Pointer */}
        <div className="absolute top-2 z-20 flex flex-col items-center pointer-events-none">
          <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(251,191,36,0.8)]" />
        </div>

        {/* The Animated Wheel SVG */}
        <div className="relative h-64 w-64 sm:h-72 sm:w-72">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transition: spinning ? "transform 3.5s cubic-bezier(0.15, 0.95, 0.35, 1.0)" : "none",
            }}
          >
            {CRAZY_WHEEL_SEGMENTS.map((seg, idx) => {
              const startAngle = idx * anglePerSegment;
              const endAngle = (idx + 1) * anglePerSegment;

              // Arc coordinates
              const x1 = 50 + 46 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 46 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 46 * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 50 + 46 * Math.sin((Math.PI * endAngle) / 180);

              const textAngle = startAngle + anglePerSegment / 2;
              const tx = 50 + 32 * Math.cos((Math.PI * textAngle) / 180);
              const ty = 50 + 32 * Math.sin((Math.PI * textAngle) / 180);

              return (
                <g key={idx}>
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 46 46 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    stroke="#0c1714"
                    strokeWidth="1.2"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill="#ffffff"
                    fontSize="5"
                    fontWeight="900"
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}

            {/* Wheel Center Hub */}
            <circle cx="50" cy="50" r="12" fill="#0c1714" stroke="#c4e77d" strokeWidth="2" />
            <circle cx="50" cy="50" r="6" fill="#c4e77d" />
          </svg>
        </div>
      </div>

      {/* Win Announcement */}
      {lastWin && (
        <div
          className={`mb-4 flex items-center justify-between rounded-xl p-3 border animate-in zoom-in-95 duration-200 ${
            lastWin.won
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
              : "border-rose-500/50 bg-rose-500/10 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <div>
              <p className="text-xs font-bold uppercase">
                {lastWin.won
                  ? locale === "bn"
                    ? `অভিনন্দন! ${lastWin.mult}x হিট হয়েছে!`
                    : `Hit ${lastWin.mult}X Multiplier!`
                  : locale === "bn"
                  ? `হুইল থেমেছে: ${lastWin.mult}x`
                  : `Wheel Landed on: ${lastWin.mult}X`}
              </p>
              {lastWin.won && (
                <span className="font-mono text-sm font-black">
                  +{formatCurrency(lastWin.amount)} PTS
                </span>
              )}
            </div>
          </div>
          <span className="font-mono text-xs font-black uppercase text-[#e2f4c6]">
            {lastWin.mult}X RESULT
          </span>
        </div>
      )}

      {/* Multiplier betting buttons */}
      <div className="mb-4">
        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">
          {locale === "bn" ? "মাল্টিপ্লায়ার বাজি নির্বাচন করুন" : "Select Multiplier Target"}
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { mult: 1, label: "1X", color: "border-[#345441]" },
            { mult: 2, label: "2X", color: "border-blue-500" },
            { mult: 5, label: "5X", color: "border-emerald-500" },
            { mult: 10, label: "10X", color: "border-purple-500" },
            { mult: 20, label: "20X", color: "border-orange-500" },
            { mult: 50, label: "50X", color: "border-rose-500" },
          ].map((item) => (
            <button
              key={item.mult}
              disabled={spinning}
              onClick={() => setSelectedMultiplier(item.mult)}
              className={`rounded-xl py-3 font-mono text-sm font-black transition-all ${
                selectedMultiplier === item.mult
                  ? "border-2 bg-[#c4e77d] text-white shadow-[0_0_15px_rgba(255,107,0,0.6)]"
                  : `border ${item.color} bg-[#0c1714] text-gray-300 hover:text-white`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="mb-4 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-xs font-bold text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Stake & Spin Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-gray-300">
            {locale === "bn" ? "বাজির পরিমাণ" : "Stake"}
          </span>
          <span className="font-mono text-gray-400">
            {locale === "bn" ? "ব্যালেন্স" : "Balance"}: {formatCurrency(balance)} PTS
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 250, 500].map((amt) => (
            <button
              key={amt}
              disabled={spinning}
              onClick={() => setBetAmount(amt)}
              className={`rounded-xl py-2 font-mono text-xs font-bold transition-all ${
                betAmount === amt
                  ? "border border-[#c4e77d] bg-[#c4e77d]/25 text-[#e2f4c6]"
                  : "border border-[#345441]/50 bg-[#0c1714] text-gray-300 hover:text-white"
              }`}
            >
              +{amt}
            </button>
          ))}
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          className="btn-action-orange w-full rounded-xl py-4 text-base font-black uppercase tracking-wider text-white shadow-[0_6px_20px_rgba(255,107,0,0.5)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <RotateCw className={`h-5 w-5 ${spinning ? "animate-spin" : ""}`} />
          <span>
            {spinning
              ? locale === "bn"
                ? "হুইল ঘুরছে..."
                : "SPINNING WHEEL..."
              : locale === "bn"
              ? `স্পিন করুন (${selectedMultiplier}X • ${betAmount} PTS)`
              : `SPIN WHEEL (${selectedMultiplier}X • ${betAmount} PTS)`}
          </span>
        </button>
      </div>
    </div>
  );
}
