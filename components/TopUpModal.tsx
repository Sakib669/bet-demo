"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import {
  X,
  Gift,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Smartphone,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
} from "lucide-react";

type MfsType = "bkash" | "nagad" | "rocket";

interface MfsConfig {
  name: string;
  number: string;
  rawNumber: string;
  type: string;
  typeBn: string;
  color: string;
  logo: string;
  ussd: string;
  sampleTrx: string;
}

const MFS_PROVIDERS: Record<MfsType, MfsConfig> = {
  bkash: {
    name: "bKash",
    number: "01798-234567",
    rawNumber: "01798234567",
    type: "Personal (Send Money)",
    typeBn: "পার্সোনাল (Send Money)",
    color: "#E2136E",
    logo: "/images/payments/bkash.svg",
    ussd: "*247#",
    sampleTrx: "BK9X728Q41",
  },
  nagad: {
    name: "Nagad",
    number: "01987-654321",
    rawNumber: "01987654321",
    type: "Personal (Send Money)",
    typeBn: "পার্সোনাল (Send Money)",
    color: "#F7931E",
    logo: "/images/payments/nagad.svg",
    ussd: "*167#",
    sampleTrx: "NG82940172",
  },
  rocket: {
    name: "Rocket",
    number: "01812-345678-4",
    rawNumber: "018123456784",
    type: "Personal (Send Money)",
    typeBn: "পার্সোনাল (Send Money)",
    color: "#8C3494",
    logo: "/images/payments/rocket.svg",
    ussd: "*322#",
    sampleTrx: "RK40192831",
  },
};

export function TopUpModal() {
  const { isTopUpOpen, setIsTopUpOpen, refreshWallet } = useWallet();
  const { t, locale } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<"daily" | "request">("request");
  
  // Selected MFS provider
  const [selectedMfs, setSelectedMfs] = useState<MfsType>("bkash");
  const [copied, setCopied] = useState<boolean>(false);

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

  const currentMfs = MFS_PROVIDERS[selectedMfs];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentMfs.rawNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

    const submissionNotes = reqNotes
      ? `${currentMfs.name} TrxID: ${reqNotes}`
      : `${currentMfs.name} TrxID: ${currentMfs.sampleTrx}`;

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REQUEST_CREDITS",
          amount: reqAmount,
          notes: submissionNotes,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto overflow-hidden rounded-2xl border border-[#193e87]/60 bg-[#0e1f3d] p-5 sm:p-6 shadow-2xl">
        {/* Mostbet glowing accent */}
        <div className="absolute -top-20 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full bg-[#fc7219]/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative mb-4 flex items-center justify-between border-b border-[#193e87]/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#193e87] text-[#fedbbb] border border-[#fedbbb]/30 shadow-[0_0_15px_rgba(255,199,0,0.25)]">
              <Star className="h-5 w-5 fill-[#fedbbb]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white">{t("topUpTitle")}</h3>
              <p className="text-xs text-gray-400 font-medium">{t("topUpSubtitle")}</p>
            </div>
          </div>
          <button
            onClick={() => setIsTopUpOpen(false)}
            className="rounded-xl p-2 text-gray-400 hover:bg-[#193e87]/40 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="relative mb-4 grid grid-cols-2 gap-1 rounded-xl bg-[#081329] p-1 border border-[#193e87]/40">
          <button
            onClick={() => setActiveSubTab("request")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeSubTab === "request"
                ? "bg-[#fc7219] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            {locale === "bn" ? "বিকাশ / নগদ পেমেন্ট" : "bKash / MFS Top-Up"}
          </button>
          <button
            onClick={() => setActiveSubTab("daily")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeSubTab === "daily"
                ? "bg-[#fc7219] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Gift className="h-3.5 w-3.5" />
            {t("dailyAllowance")}
          </button>
        </div>

        {/* Content Tab 1: bKash / Nagad Payment & Simulation Form */}
        {activeSubTab === "request" && (
          <form onSubmit={handleSendRequest} className="relative space-y-4">
            {/* Step 1: Select Payment Gateway (bKash / Nagad / Rocket) */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block mb-2">
                {locale === "bn" ? "পেমেন্ট মাধ্যম নির্বাচন করুন" : "Select Payment Gateway"}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["bkash", "nagad", "rocket"] as MfsType[]).map((key) => {
                  const mfs = MFS_PROVIDERS[key];
                  const isSelected = selectedMfs === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedMfs(key);
                        setCopied(false);
                      }}
                      className={`relative flex flex-col items-center justify-center rounded-xl p-2.5 border transition-all ${
                        isSelected
                          ? "border-[#fc7219] bg-[#fc7219]/15 shadow-[0_0_15px_rgba(255,107,0,0.35)] scale-[1.02]"
                          : "border-white/10 bg-[#081329] hover:border-white/30 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="h-7 w-full flex items-center justify-center mb-1">
                        <img src={mfs.logo} alt={mfs.name} className="h-full object-contain" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tight text-white">
                        {mfs.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Highlighted bKash / MFS Official Number Card */}
            <div className="relative overflow-hidden rounded-xl border-2 border-[#193e87] bg-[#081329] p-4 shadow-lg">
              <div className="absolute top-0 right-0 h-28 w-28 bg-[#fc7219]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#fedbbb]">
                    {locale === "bn" ? "অফিসিয়াল পেমেন্ট নম্বর" : "Official Payment Recipient"}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider tabular-nums">
                      {currentMfs.number}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 block mt-0.5">
                    {locale === "bn" ? currentMfs.typeBn : currentMfs.type} • USSD: {currentMfs.ussd}
                  </span>
                </div>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition-all ${
                    copied
                      ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      : "bg-[#193e87] text-[#fedbbb] hover:bg-[#fc7219] hover:text-white border border-white/15"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{locale === "bn" ? "কপি হয়েছে!" : "Copied!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{locale === "bn" ? "নম্বর কপি" : "Copy"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Step-by-Step Payment Instructions */}
              <div className="mt-3 pt-3 border-t border-[#193e87]/50 text-[11px] text-gray-300 space-y-1 leading-relaxed">
                <p className="font-bold text-[#fedbbb]">
                  {locale === "bn" ? "পেমেন্ট করার নিয়ম:" : "How to Pay via Mobile Banking:"}
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-gray-400">
                  <li>
                    {locale === "bn"
                      ? `আপনার ${currentMfs.name} অ্যাপ খুলুন বা ডায়াল করুন ${currentMfs.ussd}`
                      : `Open your ${currentMfs.name} App or dial ${currentMfs.ussd}`}
                  </li>
                  <li>
                    {locale === "bn"
                      ? `"Send Money" অপশনে যান এবং উপরের নম্বরে (${currentMfs.number}) টাকা পাঠান`
                      : `Select "Send Money" and send amount to ${currentMfs.number}`}
                  </li>
                  <li>
                    {locale === "bn"
                      ? `১ টাকা = ১ ক্রেডিট পয়েন্টস (যেমন: ৫০০ টাকা = ৫০০ PTS)`
                      : `1 BDT = 1 Demo Credit Point (e.g. 500 BDT = 500 PTS)`}
                  </li>
                  <li>
                    {locale === "bn"
                      ? `পেমেন্ট সম্পন্ন হওয়ার পর পাওয়া TrxID নিচে লিখুন`
                      : `Enter the 10-digit TrxID received in SMS below`}
                  </li>
                </ol>
              </div>
            </div>

            {/* Quick Amount Selection */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-bold text-gray-300 uppercase tracking-wider">
                  {t("requestedCredits")}
                </label>
                <span className="font-mono text-gray-400 text-[11px]">
                  1 BDT = 1 PTS
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setReqAmount(amt)}
                    className={`rounded-xl py-2 font-mono text-xs font-bold transition-all ${
                      reqAmount === amt
                        ? "border border-[#fc7219] bg-[#fc7219]/25 text-[#fedbbb] shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                        : "border border-[#193e87]/40 bg-[#081329] text-gray-400 hover:text-white"
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* TrxID / Reference Input Field */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-bold text-gray-300 uppercase tracking-wider">
                  {locale === "bn" ? `${currentMfs.name} ট্রানজেকশন আইডি (TrxID)` : `${currentMfs.name} Transaction ID (TrxID)`}
                </label>
                <button
                  type="button"
                  onClick={() => setReqNotes(currentMfs.sampleTrx)}
                  className="text-[10px] font-mono font-bold text-[#fc7219] hover:text-[#fedbbb] underline"
                >
                  {locale === "bn" ? "স্যাম্পল TrxID দিন" : "Fill Sample TrxID"}
                </button>
              </div>
              <input
                type="text"
                value={reqNotes}
                onChange={(e) => setReqNotes(e.target.value)}
                placeholder={locale === "bn" ? `যেমন: ${currentMfs.sampleTrx} (পেমেন্ট SMS থেকে)` : `e.g. ${currentMfs.sampleTrx}`}
                className="w-full rounded-xl border border-[#193e87]/60 bg-[#081329] px-3.5 py-3 font-mono text-xs text-white placeholder-gray-500 focus:border-[#fc7219] focus:outline-none focus:ring-1 focus:ring-[#fc7219]"
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
              className="btn-action-orange w-full rounded-xl py-3.5 text-xs font-black tracking-wider uppercase text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>
                {reqLoading
                  ? t("submittingBtn")
                  : locale === "bn"
                  ? `${currentMfs.name} পেমেন্ট সাবমিট করুন (${reqAmount} PTS)`
                  : `Submit ${currentMfs.name} Top-Up (${reqAmount} PTS)`}
              </span>
            </button>
          </form>
        )}

        {/* Content Tab 2: Daily Bonus */}
        {activeSubTab === "daily" && (
          <div className="relative space-y-4">
            <div className="rounded-xl border border-[#193e87]/50 bg-[#081329]/60 p-5 text-center shadow-inner">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#fc7219] to-[#fedbbb] text-white shadow-[0_0_20px_rgba(255,107,0,0.35)]">
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
              className="btn-action-orange w-full rounded-xl py-3.5 text-xs font-black tracking-wider uppercase text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{dailyLoading ? t("claimingBtn") : t("claimDailyBtn")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
