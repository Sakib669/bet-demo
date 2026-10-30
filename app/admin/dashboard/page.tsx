"use client";

import { localFetch } from "@/lib/browser-db";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  ShieldAlert,
  Coins,
  History,
  Sparkles,
  RefreshCw,
  CreditCard,
  Users,
  Receipt,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface DepositItem {
  id: string;
  amount: number;
  bkashTrxId: string;
  senderNumber: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    wallet: { balance: number } | null;
  };
}

export default function AdminDashboardPage() {
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [pendingDeposits, setPendingDeposits] = useState<DepositItem[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [totals, setTotals] = useState<{ totalIncomeBDT: number; totalCreditsIssuedPTS: number }>({
    totalIncomeBDT: 0,
    totalCreditsIssuedPTS: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [depRes, txRes, usersRes] = await Promise.all([
        localFetch("/api/admin/deposits?status=PENDING"),
        localFetch("/api/admin/transactions"),
        localFetch("/api/admin/users"),
      ]);

      const depData = await depRes.json();
      const txData = await txRes.json();
      const usersData = await usersRes.json();

      if (depData.success) {
        setPendingDeposits(depData.deposits || []);
      }
      if (txData.success && txData.totals) {
        setTotals(txData.totals);
      }
      if (usersData.success && usersData.users) {
        setUserCount(usersData.users.length);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#345441]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-[#e2f4c6]" />
            <span>{locale === "bn" ? "অ্যাডমিন ওভারভিউ ড্যাশবোর্ড" : "Admin Operations Dashboard"}</span>
          </h1>
          <p className="text-xs text-[#aabdab]">
            {locale === "bn"
              ? "বিকাশ পেমেন্ট ভেরিফিকেশন, ইউজার ট্র্যাকিং ও অডিট কন্ট্রোল সেন্টার"
              : "bKash payment verification, customer tracking and audit ledger controls"}
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 rounded-xl border border-[#345441] bg-[#182b21] px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#c4e77d]" : ""}`} />
          <span>{locale === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Deposits */}
        <div className="mst-card rounded-2xl p-5 border-[#c4e77d]/60 shadow-[0_0_20px_rgba(255,107,0,0.15)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-[#e2f4c6]">
            <span>{locale === "bn" ? "অপেক্ষমান ডিপোজিট" : "Pending Deposits"}</span>
            <span className="flex h-2 w-2 rounded-full bg-[#c4e77d] animate-ping" />
          </div>
          <div className="my-2">
            <span className="font-mono text-3xl font-black text-white tabular-nums">
              {pendingDeposits.length}
            </span>
          </div>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#e2f4c6] hover:underline"
          >
            <span>{locale === "bn" ? "সবগুলো রিভিউ করুন" : "Review queue"}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Metric 2: Confirmed bKash Income */}
        <div className="mst-card rounded-2xl p-5 border-emerald-500/40 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-400">
            <span>{locale === "bn" ? "মোট বিকাশ আয় (BDT)" : "Confirmed bKash Income"}</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="my-2">
            <span className="font-mono text-3xl font-black text-white tabular-nums">
              {formatCurrency(totals.totalIncomeBDT)} BDT
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Approved payment claims only</span>
        </div>

        {/* Metric 3: Game Credits Issued */}
        <div className="mst-card rounded-2xl p-5 border-[#345441]/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-[#aabdab]">
            <span>{locale === "bn" ? "প্রদত্ত গেম ক্রেডিট (PTS)" : "Total Game Credits Issued"}</span>
            <Coins className="h-4 w-4" />
          </div>
          <div className="my-2">
            <span className="font-mono text-3xl font-black text-white tabular-nums">
              {formatCurrency(totals.totalCreditsIssuedPTS)} PTS
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Double-Entry Ledger Verified</span>
        </div>

        {/* Metric 4: Total Users */}
        <div className="mst-card rounded-2xl p-5 border-[#345441]/70 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-300">
            <span>{locale === "bn" ? "মোট নিবন্ধিত ইউজার" : "Registered Users"}</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="my-2">
            <span className="font-mono text-3xl font-black text-white tabular-nums">
              {userCount}
            </span>
          </div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#aabdab] hover:underline"
          >
            <span>{locale === "bn" ? "ইউজার ডিরেক্টরি" : "View directory"}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Section: Urgent Pending Payment Requests */}
      <div className="mst-card rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#345441]/60 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#c4e77d]" />
            <h2 className="text-base font-black uppercase text-white tracking-wide">
              {locale === "bn" ? "জরুরি পেমেন্ট ভেরিফিকেশন কিউ" : "Urgent bKash Payment Queue"}
            </h2>
          </div>
          <Link
            href="/admin/payments"
            className="text-xs font-bold text-[#e2f4c6] hover:underline flex items-center gap-1"
          >
            <span>{locale === "bn" ? "সকল রিকোয়েস্ট দেখুন" : "View all"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {pendingDeposits.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400 font-medium">
            {locale === "bn"
              ? "কোনো অপেক্ষমান পেমেন্ট রিকোয়েস্ট নেই। সব ভেরিফাইড!"
              : "No pending payment requests right now. Queue is clear!"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#345441]/60 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">{locale === "bn" ? "ইউজার" : "User"}</th>
                  <th className="pb-3">{locale === "bn" ? "মোবাইল" : "Mobile"}</th>
                  <th className="pb-3">{locale === "bn" ? "টাকার পরিমাণ" : "Amount"}</th>
                  <th className="pb-3">{locale === "bn" ? "বিকাশ TrxID" : "bKash TrxID"}</th>
                  <th className="pb-3">{locale === "bn" ? "প্রেরক নম্বর" : "Sender"}</th>
                  <th className="pb-3 text-right">{locale === "bn" ? "অ্যাকশন" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#345441]/30">
                {pendingDeposits.slice(0, 5).map((dep) => (
                  <tr key={dep.id} className="text-gray-300">
                    <td className="py-3.5 font-bold text-white">{dep.user.name}</td>
                    <td className="py-3.5 font-mono text-gray-400">{dep.user.mobile}</td>
                    <td className="py-3.5 font-mono font-black text-[#e2f4c6] tabular-nums">
                      +{formatCurrency(dep.amount)} BDT
                    </td>
                    <td className="py-3.5 font-mono font-bold text-white">{dep.bkashTrxId}</td>
                    <td className="py-3.5 font-mono text-gray-400">{dep.senderNumber}</td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link href="/admin/payments" className="inline-flex items-center gap-1 rounded-md border border-[#55704f] px-3 py-1.5 font-bold text-[#d5ebbc] hover:border-[#c4e77d]">{locale === "bn" ? "যাচাই করুন" : "Review"} <ArrowRight className="h-3.5 w-3.5" /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
