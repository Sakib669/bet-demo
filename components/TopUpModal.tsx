"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { X, Gift, Sparkles, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export function TopUpModal() {
  const { isTopUpOpen, setIsTopUpOpen, refreshWallet } = useWallet();
  const [activeSubTab, setActiveSubTab] = useState<"daily" | "request">("daily");
  
  // Daily bonus state
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [dailyError, setDailyError] = useState<string | null>(null);

  // Manual simulation request state
  const [reqAmount, setReqAmount] = useState<number>(500);
  const [reqNotes, setReqNotes] = useState<string>("");
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSuccess, setReqSuccess] = useState<string | null>(null);
  const [reqError, setReqError] = useState<string | null>(null);

  if (!isTopUpOpen) return null;

  const handleClaimDaily = async () => {
    setDailyLoading(true);
    setDailyMessage(null);
    setDailyError(null);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CLAIM_DAILY" }),
      });
      const data = await res.json();
      if (data.success) {
        setDailyMessage(data.message);
        await refreshWallet();
      } else {
        setDailyError(data.message);
      }
    } catch {
      setDailyError("Network error claiming daily bonus.");
    } finally {
      setDailyLoading(false);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqLoading(true);
    setReqSuccess(null);
    setReqError(null);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_CREDITS",
          amount: reqAmount,
          notes: reqNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReqSuccess(data.message);
        setReqNotes("");
      } else {
        setReqError(data.message);
      }
    } catch {
      setReqError("Failed to submit request.");
    } finally {
      setReqLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0A1026] p-6 shadow-2xl">
        {/* Glowing border highlight */}
        <div className="absolute -top-24 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full bg-[#0000F2]/30 blur-3xl" />

        {/* Header */}
        <div className="relative mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0000F2]/20 text-[#00D2FF] border border-[#0000F2]/40">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Free Credits & Simulation</h3>
              <p className="text-xs text-gray-400">Refill your demo wallet points</p>
            </div>
          </div>
          <button
            onClick={() => setIsTopUpOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1E293B] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="relative mb-5 grid grid-cols-2 gap-1 rounded-xl bg-[#060814] p-1 border border-[#1E293B]">
          <button
            onClick={() => setActiveSubTab("daily")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              activeSubTab === "daily"
                ? "bg-[#0000F2] text-white shadow-cobalt-glow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Gift className="h-3.5 w-3.5" />
            Daily Allowance
          </button>
          <button
            onClick={() => setActiveSubTab("request")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              activeSubTab === "request"
                ? "bg-[#0000F2] text-white shadow-cobalt-glow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            Admin Top-Up
          </button>
        </div>

        {/* Content Tab 1: Daily Bonus */}
        {activeSubTab === "daily" && (
          <div className="relative space-y-4">
            <div className="rounded-xl border border-[#1E293B] bg-[#060814]/80 p-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0000F2] to-[#00D2FF] text-white shadow-cyan-glow">
                <Gift className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Daily Bonus: +250 PTS</h4>
              <p className="mt-1 text-xs text-gray-400">
                Claim free simulation credits every 24 hours to test all games.
              </p>
            </div>

            {dailyMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{dailyMessage}</span>
              </div>
            )}

            {dailyError && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-medium text-amber-400">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{dailyError}</span>
              </div>
            )}

            <button
              onClick={handleClaimDaily}
              disabled={dailyLoading}
              className="w-full rounded-xl border border-[#0000F2] bg-[#0000F2] py-3 text-sm font-bold text-white shadow-cobalt-glow transition-all hover:bg-[#1E29FF] active:scale-98 disabled:opacity-50"
            >
              {dailyLoading ? "Claiming..." : "Claim 250 Free Credits"}
            </button>
          </div>
        )}

        {/* Content Tab 2: Admin Simulation Request */}
        {activeSubTab === "request" && (
          <form onSubmit={handleSendRequest} className="relative space-y-4">
            <div className="rounded-xl border border-[#1E293B] bg-[#060814]/60 p-3 text-xs text-gray-400">
              <p className="font-semibold text-gray-300">Simulated Top-Up Workflow</p>
              <p className="mt-0.5">
                Submit a credit request for high-roller simulation. Administrators can review and approve it inside the Admin Panel.
              </p>
            </div>

            {/* Quick Amount Selection */}
            <div>
              <label className="text-xs font-semibold text-gray-300">Requested Credits</label>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setReqAmount(amt)}
                    className={`rounded-lg py-1.5 font-mono text-xs font-bold transition-all ${
                      reqAmount === amt
                        ? "border border-[#0000F2] bg-[#0000F2]/30 text-[#00D2FF]"
                        : "border border-[#1E293B] bg-[#060814] text-gray-400 hover:text-white"
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="text-xs font-semibold text-gray-300">Reference / Reason</label>
              <input
                type="text"
                value={reqNotes}
                onChange={(e) => setReqNotes(e.target.value)}
                placeholder="e.g. Testing Mines high-volatility strategy"
                className="mt-1.5 w-full rounded-xl border border-[#1E293B] bg-[#060814] px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:border-[#0000F2] focus:outline-none focus:ring-1 focus:ring-[#0000F2]"
              />
            </div>

            {reqSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{reqSuccess}</span>
              </div>
            )}

            {reqError && (
              <div className="flex items-center gap-2 rounded-xl border border-ruby/30 bg-ruby/10 p-3 text-xs font-medium text-ruby">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{reqError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={reqLoading}
              className="w-full rounded-xl border border-[#0000F2] bg-[#0000F2] py-3 text-sm font-bold text-white shadow-cobalt-glow transition-all hover:bg-[#1E29FF] active:scale-98 disabled:opacity-50"
            >
              {reqLoading ? "Submitting Request..." : `Submit Request (${reqAmount} PTS)`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
