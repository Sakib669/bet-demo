"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { X, Gift, Star, Send, CheckCircle2, AlertCircle, Clock, Smartphone } from "lucide-react";

export function TopUpModal() {
  const { isTopUpOpen, setIsTopUpOpen, refreshWallet } = useWallet();
  const { t, locale } = useLanguage();
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
      setDailyError(locale === "bn" ? "দৈনিক বোনাস পেতে সমস্যা হয়েছে।" : "Network error claiming daily bonus.");
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
      setReqError(locale === "bn" ? "রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে।" : "Failed to submit request.");
    } finally {
      setReqLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#08478E]/60 bg-[#051738] p-6 sm:p-7 shadow-2xl">
        {/* Mostbet glowing accent */}
        <div className="absolute -top-20 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full bg-[#FF6B00]/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative mb-5 flex items-center justify-between border-b border-[#08478E]/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#08478E] text-[#FFC700] border border-[#FFC700]/30 shadow-[0_0_15px_rgba(255,199,0,0.25)]">
              <Star className="h-5 w-5 fill-[#FFC700]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white">{t("topUpTitle")}</h3>
              <p className="text-xs text-gray-400 font-medium">{t("topUpSubtitle")}</p>
            </div>
          </div>
          <button
            onClick={() => setIsTopUpOpen(false)}
            className="rounded-xl p-2 text-gray-400 hover:bg-[#08478E]/40 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="relative mb-5 grid grid-cols-2 gap-1 rounded-xl bg-[#040F26] p-1 border border-[#08478E]/40">
          <button
            onClick={() => setActiveSubTab("daily")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeSubTab === "daily"
                ? "bg-[#FF6B00] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Gift className="h-3.5 w-3.5" />
            {t("dailyAllowance")}
          </button>
          <button
            onClick={() => setActiveSubTab("request")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeSubTab === "request"
                ? "bg-[#FF6B00] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            {t("adminTopUp")}
          </button>
        </div>

        {/* Content Tab 1: Daily Bonus */}
        {activeSubTab === "daily" && (
          <div className="relative space-y-4">
            <div className="rounded-xl border border-[#08478E]/50 bg-[#040F26]/60 p-5 text-center shadow-inner">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FFC700] text-white shadow-[0_0_20px_rgba(255,107,0,0.35)]">
                <Gift className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wide text-white">{t("dailyBonusTitle")}</h4>
              <p className="mt-1 text-xs text-gray-300 font-medium leading-relaxed">
                {t("dailyBonusDesc")}
              </p>
            </div>

            {dailyMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{dailyMessage}</span>
              </div>
            )}

            {dailyError && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-bold text-amber-400">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{dailyError}</span>
              </div>
            )}

            <button
              onClick={handleClaimDaily}
              disabled={dailyLoading}
              className="btn-action-orange w-full rounded-xl py-3.5 text-xs font-black tracking-wider uppercase text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50"
            >
              {dailyLoading ? t("claimingBtn") : t("claimDailyBtn")}
            </button>
          </div>
        )}

        {/* Content Tab 2: Admin Simulation Request (bKash/Nagad BD Context) */}
        {activeSubTab === "request" && (
          <form onSubmit={handleSendRequest} className="relative space-y-4">
            <div className="rounded-xl border border-[#08478E]/50 bg-[#040F26]/70 p-3.5 text-xs text-gray-300 leading-relaxed shadow-inner">
              <div className="flex items-center gap-1.5 font-black uppercase tracking-wide text-[#FFC700] mb-1">
                <Smartphone className="h-3.5 w-3.5" />
                <span>{locale === "bn" ? "বাংলাদেশী সিমুলেশন নোট" : "BD Simulation Notice"}</span>
              </div>
              <p className="text-[11px] text-gray-400">
                {t("bdMfsNotice")}
              </p>
            </div>

            {/* Quick Amount Selection */}
            <div>
              <label className="text-xs font-bold text-gray-300 mb-1.5 block uppercase tracking-wider">{t("requestedCredits")}</label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setReqAmount(amt)}
                    className={`rounded-xl py-2 font-mono text-xs font-bold transition-all ${
                      reqAmount === amt
                        ? "border border-[#FF6B00] bg-[#FF6B00]/25 text-[#FFC700] shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                        : "border border-[#08478E]/40 bg-[#040F26] text-gray-400 hover:text-white"
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes / Simulated TrxID */}
            <div>
              <label className="text-xs font-bold text-gray-300 mb-1.5 block uppercase tracking-wider">{t("referenceNote")}</label>
              <input
                type="text"
                value={reqNotes}
                onChange={(e) => setReqNotes(e.target.value)}
                placeholder={locale === "bn" ? "যেমন: বিকাশ ডেমো TrxID: BK9284920X (টেস্টিং)" : "e.g. bKash Demo TrxID: BK9284920X"}
                className="w-full rounded-xl border border-[#08478E]/60 bg-[#040F26] px-3.5 py-3 text-xs text-white placeholder-gray-500 focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              />
            </div>

            {reqSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{reqSuccess}</span>
              </div>
            )}

            {reqError && (
              <div className="flex items-center gap-2 rounded-xl border border-ruby/30 bg-ruby/10 p-3 text-xs font-bold text-ruby">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{reqError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={reqLoading}
              className="btn-action-orange w-full rounded-xl py-3.5 text-xs font-black tracking-wider uppercase text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50"
            >
              {reqLoading ? t("submittingBtn") : `${t("submitRequestBtn")} (${reqAmount} PTS)`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
