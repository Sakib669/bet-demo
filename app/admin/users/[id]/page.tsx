"use client";

import { localFetch } from "@/lib/browser-db";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  ArrowLeft,
  User,
  Smartphone,
  Mail,
  Shield,
  Coins,
  CreditCard,
  History,
  TrendingUp,
  TrendingDown,
  Sparkles,
  RefreshCw,
  Trophy,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface UserDetailData {
  user: {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
    wallet: { balance: number } | null;
  };
  analytics: {
    totalRounds: number;
    wonRounds: number;
    lostRounds: number;
    winRate: number;
    totalWagered: number;
    totalPayout: number;
    playerNetProfit: number;
    totalDeposited: number;
    approvedDepositsCount: number;
    totalCreditsReceived: number;
    gameTypeBreakdown: Record<string, { count: number; wagered: number; won: number }>;
    firstGameDate: string | null;
    lastGameDate: string | null;
  };
  recentGameRounds: Array<{
    id: string;
    gameType: string;
    betAmount: number;
    multiplier: number;
    payout: number;
    status: string;
    serverSeed: string;
    createdAt: string;
  }>;
  depositHistory: Array<{
    id: string;
    amount: number;
    bkashTrxId: string;
    senderNumber: string;
    status: string;
    adminNote?: string;
    createdAt: string;
  }>;
  creditHistory: Array<{
    id: string;
    amount: number;
    reason: string;
    createdAt: string;
    admin: { name: string; mobile: string };
  }>;
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { locale } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserDetailData | null>(null);

  // Direct adjustment form state
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState<string>("");
  const [adjustLoading, setAdjustLoading] = useState<boolean>(false);
  const [adjustMsg, setAdjustMsg] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const res = await localFetch(`/api/admin/users/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Fetch user details error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustAmount === 0) return;
    setAdjustLoading(true);
    setAdjustMsg(null);

    try {
      const res = await localFetch(`/api/admin/users/${id}/credit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: adjustAmount,
          reason: adjustReason || "Manual Admin Adjustment",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setAdjustMsg(json.message);
        setAdjustReason("");
        await fetchUserDetails();
      } else {
        alert(json.message);
      }
    } catch {
      alert("Error adjusting user balance");
    } finally {
      setAdjustLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-xs text-gray-400">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#c4e77d]" />
        <span>Loading comprehensive user analytics...</span>
      </div>
    );
  }

  const { user, analytics, recentGameRounds, depositHistory, creditHistory } = data;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 rounded-xl border border-[#345441]/60 bg-[#182b21] px-3.5 py-2 text-xs font-bold text-gray-300 hover:border-[#c4e77d] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{locale === "bn" ? "ইউজার তালিকায় ফিরুন" : "Back to Users"}</span>
        </Link>

        <button
          onClick={fetchUserDetails}
          className="flex items-center gap-1.5 rounded-xl border border-[#345441] bg-[#182b21] px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5 text-[#c4e77d]" />
          <span>{locale === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {/* User Identity Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#345441] bg-gradient-to-r from-[#182b21] via-[#345441]/40 to-[#182b21] p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0c1714] text-[#e2f4c6] border border-[#e2f4c6]/30 shadow-inner">
              <User className="h-7 w-7 text-[#e2f4c6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{user.name}</h1>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase font-mono ${
                    user.role === "ADMIN"
                      ? "bg-[#e2f4c6]/20 text-[#e2f4c6] border border-[#e2f4c6]/40"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-300 font-mono">
                <span className="flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5 text-[#c4e77d]" />
                  <span>{user.mobile}</span>
                </span>
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-[#aabdab]" />
                    <span>{user.email}</span>
                  </span>
                )}
                <span className="text-gray-400">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </span>
                {user.lastLoginAt && (
                  <span className="text-emerald-400 font-semibold">
                    Last active: {new Date(user.lastLoginAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Current Wallet Balance Capsule */}
          <div className="rounded-2xl border border-[#e2f4c6]/40 bg-[#0c1714] p-4 text-right">
            <span className="text-[10px] font-bold uppercase text-[#aabdab] block">
              {locale === "bn" ? "বর্তমান ওয়ালেট ব্যালেন্স" : "Current Wallet Balance"}
            </span>
            <span className="font-mono text-2xl font-black text-white tabular-nums">
              {formatCurrency(user.wallet?.balance || 0)} PTS
            </span>
          </div>
        </div>
      </div>

      {adjustMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{adjustMsg}</span>
        </div>
      )}

      {/* Analytics Overview Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Deposited BDT */}
        <div className="mst-card rounded-xl p-3.5">
          <span className="text-[10px] font-bold uppercase text-emerald-400 block">Total Deposited</span>
          <p className="mt-1 font-mono text-lg font-black text-white tabular-nums">
            {formatCurrency(analytics.totalDeposited)} BDT
          </p>
          <span className="text-[10px] text-gray-500 font-mono">{analytics.approvedDepositsCount} bKash tx</span>
        </div>

        {/* Total Credited PTS */}
        <div className="mst-card rounded-xl p-3.5">
          <span className="text-[10px] font-bold uppercase text-[#e2f4c6] block">Credits Granted</span>
          <p className="mt-1 font-mono text-lg font-black text-white tabular-nums">
            {formatCurrency(analytics.totalCreditsReceived)} PTS
          </p>
          <span className="text-[10px] text-gray-500 font-mono">By Admin</span>
        </div>

        {/* Total Wagered */}
        <div className="mst-card rounded-xl p-3.5">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Total Wagered</span>
          <p className="mt-1 font-mono text-lg font-black text-white tabular-nums">
            {formatCurrency(analytics.totalWagered)} PTS
          </p>
          <span className="text-[10px] text-gray-500 font-mono">{analytics.totalRounds} rounds</span>
        </div>

        {/* Total Won */}
        <div className="mst-card rounded-xl p-3.5">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Total Won</span>
          <p className="mt-1 font-mono text-lg font-black text-white tabular-nums">
            {formatCurrency(analytics.totalPayout)} PTS
          </p>
          <span className="text-[10px] text-gray-500 font-mono">{analytics.wonRounds} won</span>
        </div>

        {/* Win Rate */}
        <div className="mst-card rounded-xl p-3.5">
          <span className="text-[10px] font-bold uppercase text-[#c4e77d] block">Win Rate %</span>
          <p className="mt-1 font-mono text-lg font-black text-[#c4e77d] tabular-nums">
            {analytics.winRate}%
          </p>
          <span className="text-[10px] text-gray-500 font-mono">{analytics.lostRounds} lost</span>
        </div>

        {/* Player Net P/L */}
        <div className="mst-card rounded-xl p-3.5">
          <span className="text-[10px] font-bold uppercase text-gray-400 block">Player Net P/L</span>
          <p
            className={`mt-1 font-mono text-lg font-black tabular-nums flex items-center gap-1 ${
              analytics.playerNetProfit >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {analytics.playerNetProfit >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{analytics.playerNetProfit >= 0 ? "+" : ""}{formatCurrency(analytics.playerNetProfit)}</span>
          </p>
          <span className="text-[10px] text-gray-500 font-mono">Platform Edge</span>
        </div>
      </div>

      {/* Game Type Breakdown & Direct Credit Adjustment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Game Preferences Breakdown (7 Cols) */}
        <div className="lg:col-span-7 mst-card rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-black uppercase text-white mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#e2f4c6]" />
            <span>{locale === "bn" ? "গেমভিত্তিক কার্যকলাপ ও প্রেফারেন্স" : "Game Preferences & Usage"}</span>
          </h2>

          <div className="space-y-3">
            {Object.keys(analytics.gameTypeBreakdown).length === 0 ? (
              <p className="text-xs text-gray-400 py-4">No gameplay records for this user yet.</p>
            ) : (
              Object.entries(analytics.gameTypeBreakdown).map(([gameName, stats]) => {
                const pct = analytics.totalRounds > 0 ? Math.round((stats.count / analytics.totalRounds) * 100) : 0;
                return (
                  <div key={gameName} className="rounded-xl border border-[#345441]/40 bg-[#0c1714] p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white uppercase tracking-wider">{gameName}</span>
                      <span className="font-mono text-[11px] text-[#e2f4c6]">
                        {stats.count} rounds ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2 overflow-hidden">
                      <div className="bg-[#c4e77d] h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-gray-400">
                      <span>Wagered: {formatCurrency(stats.wagered)} PTS</span>
                      <span className="text-emerald-400">Won: +{formatCurrency(stats.won)} PTS</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Direct Wallet Credit Modifier Tool (5 Cols) */}
        <div className="lg:col-span-5 mst-card rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-black uppercase text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#c4e77d]" />
              <span>{locale === "bn" ? "সরাসরি ক্রেডিট সমন্বয় করুন" : "Direct Balance Adjustment"}</span>
            </h2>
            <p className="text-xs text-[#aabdab] mb-4">
              Add or deduct virtual points for this player. Audit trail will be permanently recorded.
            </p>

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1 font-bold uppercase">
                  {locale === "bn" ? "সমন্বয় পরিমাণ (+ / -)" : "Adjustment Amount (+ / -)"}
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  placeholder="e.g. 500 or -200"
                  className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] px-3.5 py-2.5 font-mono text-xs text-white focus:border-[#c4e77d] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 block mb-1 font-bold uppercase">
                  {locale === "bn" ? "কারণ (অডিট নোটে থাকবে)" : "Reason for Adjustment"}
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Manual compensation / Bonus promo"
                  className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] px-3.5 py-2.5 text-xs text-white focus:border-[#c4e77d] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={adjustLoading}
                className="btn-action-orange w-full rounded-xl py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50"
              >
                {adjustLoading ? "Applying..." : "Apply Balance Adjustment"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Recent Game Rounds Table (Detailed Logs with CSPRNG Seed) */}
      <div className="mst-card rounded-2xl p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#345441]/60 pb-3">
          <h2 className="text-sm font-black uppercase text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#e2f4c6]" />
            <span>{locale === "bn" ? "সাম্প্রতিক গেম রাউন্ড ও সিড লগ" : "Recent Game Rounds & Browser random Logs"}</span>
          </h2>
          <span className="font-mono text-xs text-gray-400">Last 50 Rounds</span>
        </div>

        <div className="overflow-x-auto max-h-96 no-scrollbar">
          {recentGameRounds.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-400">No game rounds recorded yet.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#345441]/60 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-2.5">Time</th>
                  <th className="pb-2.5">Game</th>
                  <th className="pb-2.5">Stake</th>
                  <th className="pb-2.5">Multiplier</th>
                  <th className="pb-2.5">Payout</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Local round reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#345441]/30">
                {recentGameRounds.map((rnd) => (
                  <tr key={rnd.id} className="text-gray-300">
                    <td className="py-2.5 font-mono text-[11px] text-gray-400">
                      {new Date(rnd.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5">
                      <span className="rounded bg-[#345441]/50 px-2 py-0.5 font-mono text-[10px] font-bold text-[#e2f4c6]">
                        {rnd.gameType}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono tabular-nums">{formatCurrency(rnd.betAmount)} PTS</td>
                    <td className="py-2.5 font-mono font-bold text-white tabular-nums">{rnd.multiplier.toFixed(2)}x</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-400 tabular-nums">
                      {rnd.payout > 0 ? `+${formatCurrency(rnd.payout)} PTS` : "--"}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase font-mono ${
                          rnd.status === "WON"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {rnd.status}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[10px] text-gray-500 max-w-[140px] truncate">
                      {rnd.serverSeed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User Deposit & Credit History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deposit Requests History */}
        <div className="mst-card rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-black uppercase text-white mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#c4e77d]" />
            <span>bKash Deposit Requests</span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
            {depositHistory.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No deposit requests from this user.</p>
            ) : (
              depositHistory.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl border border-[#345441]/40 bg-[#0c1714] p-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-white block">+{d.amount} BDT</span>
                    <span className="font-mono text-[10px] text-gray-400">TrxID: {d.bkashTrxId}</span>
                  </div>
                  <div className="text-right">
                    <span className="rounded bg-black/40 px-2 py-0.5 font-mono text-[10px] font-bold text-[#e2f4c6] block mb-0.5">
                      {d.status}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Credit Transfer History */}
        <div className="mst-card rounded-2xl p-5 shadow-xl">
          <h2 className="text-sm font-black uppercase text-white mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-[#e2f4c6]" />
            <span>Credit Transfer Audit Log</span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
            {creditHistory.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No credit transfers to this user.</p>
            ) : (
              creditHistory.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-[#345441]/40 bg-[#0c1714] p-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-[#e2f4c6] block">+{c.amount} PTS</span>
                    <span className="text-[10px] text-gray-400">{c.reason}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-300 font-bold block">By {c.admin.name}</span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
