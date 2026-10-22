"use client";

import { useState, useEffect } from "react";
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
  History,
  Sparkles,
} from "lucide-react";

interface DepositItem {
  id: string;
  amount: number;
  bkashTrxId: string;
  senderNumber: string;
  status: string;
  adminNote?: string;
  createdAt: string;
}

export function TopUpModal() {
  const { isTopUpOpen, setIsTopUpOpen, refreshWallet, isAuthenticated } = useWallet();
  const { t, locale } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<"deposit" | "history" | "daily">("deposit");

  // Dynamic bKash configuration from database
  const [bkashNumber, setBkashNumber] = useState<string>("01798-234567");
  const [bkashType, setBkashType] = useState<string>("Personal (Send Money)");
  const [copied, setCopied] = useState<boolean>(false);

  // Form states
  const [amount, setAmount] = useState<number>(500);
  const [senderNumber, setSenderNumber] = useState<string>("");
  const [bkashTrxId, setBkashTrxId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // History state
  const [historyList, setHistoryList] = useState<DepositItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Daily bonus state
  const [dailyLoading, setDailyLoading] = useState<boolean>(false);
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [dailyError, setDailyError] = useState<string | null>(null);

  // Load bKash settings on open
  useEffect(() => {
    if (isTopUpOpen) {
      fetch("/api/settings/bkash")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setBkashNumber(data.data.number || "01798-234567");
            setBkashType(data.data.type || "Personal (Send Money)");
          }
        })
        .catch(() => {});
    }
  }, [isTopUpOpen]);

  // Load history when tab is opened
  useEffect(() => {
    if (isTopUpOpen && activeSubTab === "history") {
      setLoadingHistory(true);
      fetch("/api/deposit/history")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setHistoryList(data.deposits || []);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    }
  }, [isTopUpOpen, activeSubTab]);

  if (!isTopUpOpen) return null;

  const rawNumber = bkashNumber.replace(/[-\s]/g, "");

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(rawNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const res = await fetch("/api/deposit/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          senderNumber,
          bkashTrxId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(data.message);
        setBkashTrxId("");
        setSenderNumber("");
      } else {
        setSubmitError(data.message);
      }
    } catch {
      setSubmitError(locale === "bn" ? "পেমেন্ট রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে।" : "Failed to submit deposit request.");
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto overflow-hidden rounded-2xl border border-[#193e87]/70 bg-[#0e1f3d] p-5 sm:p-6 shadow-2xl">
        <div className="absolute -top-20 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full bg-[#fc7219]/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative mb-4 flex items-center justify-between border-b border-[#193e87]/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#193e87] text-[#fedbbb] border border-[#fedbbb]/30 shadow-[0_0_15px_rgba(255,199,0,0.25)]">
              <Star className="h-5 w-5 fill-[#fedbbb]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white">
                {locale === "bn" ? "বিকাশ ডিপোজিট ও টপ-আপ" : "bKash Deposit & Top-Up"}
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                {locale === "bn" ? "১ টাকা = ১ গেম পয়েন্ট (১:১ রেশিও)" : "1 BDT = 1 Game Credit (1:1 Ratio)"}
              </p>
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
        <div className="relative mb-4 grid grid-cols-3 gap-1 rounded-xl bg-[#081329] p-1 border border-[#193e87]/40 text-center">
          <button
            onClick={() => setActiveSubTab("deposit")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-all ${
              activeSubTab === "deposit"
                ? "bg-[#fc7219] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>{locale === "bn" ? "বিকাশ পে" : "Deposit"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("history")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-all ${
              activeSubTab === "history"
                ? "bg-[#fc7219] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>{locale === "bn" ? "হিস্ট্রি" : "History"}</span>
          </button>

          <button
            onClick={() => setActiveSubTab("daily")}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-all ${
              activeSubTab === "daily"
                ? "bg-[#fc7219] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Gift className="h-3.5 w-3.5" />
            <span>{locale === "bn" ? "ফ্রি বোনাস" : "Bonus"}</span>
          </button>
        </div>

        {/* TAB 1: bKash Deposit Form */}
        {activeSubTab === "deposit" && (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            {/* Official bKash Recipient Card */}
            <div className="relative overflow-hidden rounded-xl border-2 border-[#E2136E]/60 bg-[#081329] p-4 shadow-lg">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#fedbbb] flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#E2136E] animate-pulse" />
                    {locale === "bn" ? "অফিসিয়াল বিকাশ নম্বর" : "Official bKash Number"}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-wider tabular-nums">
                      {bkashNumber}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 block mt-0.5">
                    {bkashType} • USSD: *247#
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition-all ${
                    copied
                      ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                      : "bg-[#E2136E] text-white hover:bg-[#E2136E]/80 shadow-[0_0_12px_rgba(226,19,110,0.4)]"
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
                      <span>{locale === "bn" ? "কপি নম্বর" : "Copy"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-2.5 pt-2.5 border-t border-white/10 text-[11px] text-gray-300 space-y-0.5">
                <p className="text-gray-400">
                  ১. আপনার বিকাশ অ্যাপ থেকে <strong className="text-white">Send Money</strong> করুন।
                </p>
                <p className="text-gray-400">
                  ২. পেমেন্ট সম্পন্ন হলে পাওয়া ১০ ডিজিটের <strong className="text-[#fedbbb]">TrxID</strong> নিচে লিখুন।
                </p>
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-bold text-gray-300 uppercase tracking-wider">
                  {locale === "bn" ? "টাকার পরিমাণ (BDT)" : "Deposit Amount (BDT)"}
                </label>
                <span className="font-mono text-xs text-[#fedbbb] font-bold">
                  +{amount} PTS
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`rounded-xl py-2 font-mono text-xs font-bold transition-all ${
                      amount === amt
                        ? "border border-[#fc7219] bg-[#fc7219]/25 text-[#fedbbb] shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                        : "border border-[#193e87]/40 bg-[#081329] text-gray-400 hover:text-white"
                    }`}
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Sender Number & TrxID Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  {locale === "bn" ? "আপনার বিকাশ নম্বর" : "Your bKash Number"}
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full rounded-xl border border-[#193e87]/60 bg-[#081329] px-3.5 py-2.5 font-mono text-xs text-white placeholder-gray-500 focus:border-[#fc7219] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
                  {locale === "bn" ? "বিকাশ TrxID" : "bKash TrxID"}
                </label>
                <input
                  type="text"
                  required
                  value={bkashTrxId}
                  onChange={(e) => setBkashTrxId(e.target.value)}
                  placeholder="e.g. BK9X728Q41"
                  className="w-full rounded-xl border border-[#193e87]/60 bg-[#081329] px-3.5 py-2.5 font-mono text-xs text-white uppercase placeholder-gray-500 focus:border-[#fc7219] focus:outline-none"
                />
              </div>
            </div>

            {submitSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{submitSuccess}</span>
              </div>
            )}

            {submitError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs font-bold text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-action-orange w-full rounded-xl py-3.5 text-xs font-black tracking-wider uppercase text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              <span>
                {submitting
                  ? locale === "bn"
                    ? "পাঠানো হচ্ছে..."
                    : "SUBMITTING..."
                  : locale === "bn"
                  ? `বিকাশ ডিপোজিট রিকোয়েস্ট (${amount} BDT)`
                  : `SUBMIT DEPOSIT REQUEST (${amount} BDT)`}
              </span>
            </button>
          </form>
        )}

        {/* TAB 2: Deposit History */}
        {activeSubTab === "history" && (
          <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
            {loadingHistory ? (
              <div className="py-8 text-center text-xs text-gray-400">
                {locale === "bn" ? "হিস্ট্রি লোড হচ্ছে..." : "Loading deposit history..."}
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
                {locale === "bn"
                  ? "এখনো কোনো ডিপোজিট রিকোয়েস্ট নেই。"
                  : "No deposit requests submitted yet."}
              </div>
            ) : (
              historyList.map((dep) => {
                const isApproved = dep.status === "APPROVED";
                const isRejected = dep.status === "REJECTED";
                return (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between rounded-xl border border-[#193e87]/40 bg-[#081329] p-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white">{dep.amount} BDT</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-black uppercase ${
                            isApproved
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : isRejected
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          }`}
                        >
                          {dep.status}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400 block mt-0.5">
                        TrxID: {dep.bkashTrxId} • From: {dep.senderNumber}
                      </span>
                      {dep.adminNote && (
                        <span className="text-[10px] text-gray-300 block mt-0.5 italic">
                          Note: {dep.adminNote}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">
                      {new Date(dep.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: Daily Allowance */}
        {activeSubTab === "daily" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#193e87]/50 bg-[#081329]/60 p-5 text-center shadow-inner">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#fc7219] to-[#fedbbb] text-white shadow-[0_0_20px_rgba(255,107,0,0.35)]">
                <Gift className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-wide text-white">
                {locale === "bn" ? "দৈনিক ফ্রি ডেমো রিফিল" : "Daily Free Demo Credits"}
              </h4>
              <p className="mt-1 text-xs text-gray-300 font-medium leading-relaxed">
                {locale === "bn"
                  ? "প্রতি ২৪ ঘণ্টায় একবার ২৫০ ফ্রি ডেমো ক্রেডিট পয়েন্ট ক্লেইম করতে পারবেন。"
                  : "Claim 250 free demo credit points once every 24 hours."}
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
              <span>
                {dailyLoading
                  ? locale === "bn"
                    ? "ক্লেইম হচ্ছে..."
                    : "CLAIMING..."
                  : locale === "bn"
                  ? "২৫০ ফ্রি পয়েন্ট নিন"
                  : "CLAIM 250 FREE PTS"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
