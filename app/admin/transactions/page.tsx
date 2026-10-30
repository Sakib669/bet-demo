"use client";

import { localFetch } from "@/lib/browser-db";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  Receipt,
  Coins,
  CreditCard,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Calendar,
} from "lucide-react";

interface IncomeItem {
  id: string;
  amount: number;
  bkashTrxId: string;
  senderNumber: string;
  createdAt: string;
  reviewedAt: string;
  user: {
    id: string;
    name: string;
    mobile: string;
  };
  reviewedBy: {
    id: string;
    name: string;
  } | null;
}

interface CreditItem {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    mobile: string;
  };
  admin: {
    id: string;
    name: string;
  };
  depositRequest?: {
    bkashTrxId: string;
  } | null;
}

export default function AdminTransactionsPage() {
  const { locale } = useLanguage();
  const [activeLedger, setActiveLedger] = useState<"income" | "credit">("income");
  const [loading, setLoading] = useState(true);
  const [incomeLedger, setIncomeLedger] = useState<IncomeItem[]>([]);
  const [creditLedger, setCreditLedger] = useState<CreditItem[]>([]);
  const [totals, setTotals] = useState<{
    totalIncomeBDT: number;
    totalCreditsIssuedPTS: number;
    incomeCount: number;
    creditCount: number;
  }>({
    totalIncomeBDT: 0,
    totalCreditsIssuedPTS: 0,
    incomeCount: 0,
    creditCount: 0,
  });

  const fetchLedgers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await localFetch("/api/admin/transactions");
      const data = await res.json();
      if (data.success) {
        setIncomeLedger(data.incomeLedger || []);
        setCreditLedger(data.creditLedger || []);
        setTotals(data.totals);
      }
    } catch (err) {
      console.error("Fetch transactions error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedgers();
  }, [fetchLedgers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#345441]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
            <Receipt className="h-6 w-6 text-[#e2f4c6]" />
            <span>{locale === "bn" ? "ডুয়াল ট্রানজেকশন অডিট লেজার" : "Dual Transaction Audit Ledgers"}</span>
          </h1>
          <p className="text-xs text-[#aabdab]">
            {locale === "bn"
              ? "প্রকৃত বিকাশ আয় এবং গেম পয়েন্ট স্থানান্তরের পৃথক ও অপরিবর্তনীয় অডিট রেজিস্টার"
              : "Reconcile verified bKash real-money income and virtual game credit distributions"}
          </p>
        </div>

        <button
          onClick={fetchLedgers}
          className="flex items-center gap-1.5 rounded-xl border border-[#345441] bg-[#182b21] px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#c4e77d]" : ""}`} />
          <span>{locale === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="mst-card rounded-2xl p-5 border-emerald-500/40 shadow-inner">
          <span className="text-xs font-bold uppercase text-emerald-400 block mb-1">
            Confirmed Income (BDT)
          </span>
          <span className="font-mono text-2xl font-black text-white tabular-nums">
            {formatCurrency(totals.totalIncomeBDT)} BDT
          </span>
          <span className="text-[10px] text-gray-400 font-mono block mt-1">
            {totals.incomeCount} confirmed payments
          </span>
        </div>

        <div className="mst-card rounded-2xl p-5 border-[#345441]/70">
          <span className="text-xs font-bold uppercase text-[#e2f4c6] block mb-1">
            Credits Distributed (PTS)
          </span>
          <span className="font-mono text-2xl font-black text-[#e2f4c6] tabular-nums">
            {formatCurrency(totals.totalCreditsIssuedPTS)} PTS
          </span>
          <span className="text-[10px] text-gray-400 font-mono block mt-1">
            {totals.creditCount} ledger transfers
          </span>
        </div>

        <div className="mst-card rounded-2xl p-5 border-[#345441]/70">
          <span className="text-xs font-bold uppercase text-gray-400 block mb-1">
            Reconciliation Ratio
          </span>
          <span className="font-mono text-2xl font-black text-white tabular-nums">
            1 BDT = 1 PTS
          </span>
          <span className="text-[10px] text-emerald-400 font-mono block mt-1">
            100% Balanced Parity
          </span>
        </div>

        <div className="mst-card rounded-2xl p-5 border-[#345441]/70">
          <span className="text-xs font-bold uppercase text-gray-400 block mb-1">
            Audit Security
          </span>
          <span className="font-mono text-sm font-black text-emerald-400 uppercase block mt-1">
            ACID Double-Entry
          </span>
          <span className="text-[10px] text-gray-400 font-mono block mt-1">
            PostgreSQL Immutable
          </span>
        </div>
      </div>

      {/* Ledger Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-[#345441]/60 pb-3">
        <button
          onClick={() => setActiveLedger("income")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
            activeLedger === "income"
              ? "bg-[#c4e77d] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]"
              : "border border-[#345441]/60 bg-[#182b21] text-gray-300 hover:text-white"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>{locale === "bn" ? "১. বিকাশ আয় লেজার (INCOME)" : "1. bKash Income Ledger"}</span>
        </button>

        <button
          onClick={() => setActiveLedger("credit")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
            activeLedger === "credit"
              ? "bg-[#c4e77d] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]"
              : "border border-[#345441]/60 bg-[#182b21] text-gray-300 hover:text-white"
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>{locale === "bn" ? "২. গেম ক্রেডিট ট্রান্সফার লেজার" : "2. Game Credit Ledger"}</span>
        </button>
      </div>

      {/* Active Ledger Table */}
      <div className="mst-card rounded-2xl p-5 shadow-xl overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading audit ledgers...</div>
        ) : activeLedger === "income" ? (
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold uppercase text-white">Confirmed bKash Payments Log</span>
              <span className="font-mono">{incomeLedger.length} entries</span>
            </div>

            {incomeLedger.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">No confirmed payments yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#345441]/60 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Customer User</th>
                    <th className="pb-3">Amount (BDT)</th>
                    <th className="pb-3">bKash TrxID</th>
                    <th className="pb-3">Sender Mobile</th>
                    <th className="pb-3">Reviewed By Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#345441]/30">
                  {incomeLedger.map((item) => (
                    <tr key={item.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono text-gray-400">
                        {new Date(item.reviewedAt || item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-white block">{item.user.name}</span>
                        <span className="font-mono text-[11px] text-gray-400">{item.user.mobile}</span>
                      </td>
                      <td className="py-3 font-mono font-black text-emerald-400 text-sm tabular-nums">
                        +{formatCurrency(item.amount)} BDT
                      </td>
                      <td className="py-3 font-mono font-bold text-white">
                        <span className="rounded bg-black/40 px-2 py-1 border border-white/10">
                          {item.bkashTrxId}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-gray-300">{item.senderNumber}</td>
                      <td className="py-3 text-[11px] text-gray-300">
                        {item.reviewedBy ? item.reviewedBy.name : "System"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold uppercase text-white">All Credit Grant & Transfer Events</span>
              <span className="font-mono">{creditLedger.length} entries</span>
            </div>

            {creditLedger.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">No credit transfers yet.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#345441]/60 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3">Recipient Customer</th>
                    <th className="pb-3">Credit Amount</th>
                    <th className="pb-3">Reason / Source</th>
                    <th className="pb-3">Reference TrxID</th>
                    <th className="pb-3">Operator Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#345441]/30">
                  {creditLedger.map((item) => (
                    <tr key={item.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-white block">{item.user.name}</span>
                        <span className="font-mono text-[11px] text-gray-400">{item.user.mobile}</span>
                      </td>
                      <td className="py-3 font-mono font-black text-[#e2f4c6] text-sm tabular-nums">
                        +{formatCurrency(item.amount)} PTS
                      </td>
                      <td className="py-3 text-xs text-gray-300">{item.reason}</td>
                      <td className="py-3 font-mono text-xs text-gray-400">
                        {item.depositRequest?.bkashTrxId || "--"}
                      </td>
                      <td className="py-3 text-xs text-white font-bold">{item.admin.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
