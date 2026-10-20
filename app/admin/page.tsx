"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Coins,
  History,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Languages,
  Star,
} from "lucide-react";

interface RequestItem {
  id: string;
  requestedAmount: number;
  notes: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    wallet: {
      balance: number;
    } | null;
  };
}

interface GameRoundItem {
  id: string;
  gameType: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  status: string;
  serverSeed: string;
  createdAt: string;
  user: {
    username: string;
  };
}

interface UserItem {
  id: string;
  username: string;
  role: string;
  wallet: {
    balance: number;
  } | null;
}

export default function AdminPage() {
  const { t, locale, toggleLocale } = useLanguage();
  const [passcode] = useState<string>("hermes_admin_secret_9988");
  const [loading, setLoading] = useState<boolean>(true);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [recentRounds, setRecentRounds] = useState<GameRoundItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Direct adjustment form state
  const [adjustUserId, setAdjustUserId] = useState<string>("");
  const [adjustAmount, setAdjustAmount] = useState<number>(500);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        setRecentRounds(data.recentRounds || []);
        setUsers(data.users || []);
        if (data.users && data.users.length > 0 && !adjustUserId) {
          setAdjustUserId(data.users[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [adjustUserId]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleApprove = async (requestId: string) => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE_REQUEST",
          requestId,
          passcode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        await fetchAdminData();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Error approving request.");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT_REQUEST",
          requestId,
          passcode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        await fetchAdminData();
      }
    } catch {
      alert("Error rejecting request.");
    }
  };

  const handleDirectAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustUserId || adjustAmount === 0) return;

    try {
      const res = await fetch("/api/admin/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DIRECT_ADJUST",
          userId: adjustUserId,
          amount: adjustAmount,
          passcode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        await fetchAdminData();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Error adjusting balance.");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Bar Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[#08478E]/60 bg-[#051738] px-4 py-2 text-xs font-bold text-gray-300 hover:border-[#FF6B00] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{locale === "bn" ? "গেমিং এরিনায় ফিরুন" : "Back to Game Arena"}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 rounded-xl border border-[#08478E]/60 bg-[#051738] px-3.5 py-2 text-xs font-black uppercase text-gray-200 hover:text-white hover:border-[#FF6B00]"
          >
            <Languages className="h-3.5 w-3.5 text-[#FFC700]" />
            <span>{locale === "bn" ? "বাংলা" : "ENG"}</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 rounded-xl border border-[#08478E]/60 bg-[#051738] px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#FF6B00]" : ""}`} />
            <span>{locale === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Admin Title Banner */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-[#08478E] bg-gradient-to-r from-[#051738] via-[#08478E]/50 to-[#051738] p-6 shadow-2xl">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#08478E] text-[#FFC700] border border-[#FFC700]/30 shadow-[0_0_20px_rgba(255,199,0,0.25)]">
            <ShieldAlert className="h-6 w-6 text-[#FFC700]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">{t("adminTitle")}</h1>
            <p className="text-xs text-gray-300 font-medium">
              {t("adminSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="mst-card rounded-xl p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t("registeredUsers")}</span>
          <p className="mt-1 font-mono text-2xl font-black text-white tabular-nums">{users.length}</p>
        </div>
        <div className="mst-card rounded-xl p-4 border-[#FF6B00]/60 shadow-[0_0_15px_rgba(255,107,0,0.15)]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FFC700]">{t("pendingApprovals")}</span>
          <p className="mt-1 font-mono text-2xl font-black text-[#FF6B00] tabular-nums">{pendingRequests.length}</p>
        </div>
        <div className="mst-card rounded-xl p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t("totalRounds")}</span>
          <p className="mt-1 font-mono text-2xl font-black text-white tabular-nums">{recentRounds.length}+</p>
        </div>
        <div className="mst-card rounded-xl p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{t("systemMode")}</span>
          <p className="mt-1 font-mono text-xs font-black text-emerald-400 uppercase">
            {locale === "bn" ? "সিমুলেশন / সক্রিয়" : "SIMULATION / ACTIVE"}
          </p>
        </div>
      </div>

      {/* Section 1: Pending Simulation Top-Up Requests */}
      <div className="mst-card mb-8 rounded-2xl p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#08478E]/50 pb-4">
          <h2 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#FFC700]" />
            {t("activePending")} ({pendingRequests.length})
          </h2>
          <span className="text-xs text-gray-400 font-medium">{t("manualReview")}</span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 font-medium">
            {t("noPendingReqs")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#08478E]/50 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">{t("userCol")}</th>
                  <th className="pb-3">{t("balanceCol")}</th>
                  <th className="pb-3">{t("reqAmountCol")}</th>
                  <th className="pb-3">{t("notesCol")}</th>
                  <th className="pb-3 text-right">{t("actionsCol")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#08478E]/30">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="text-gray-300">
                    <td className="py-3 font-bold text-white">{req.user.username}</td>
                    <td className="py-3 font-mono tabular-nums">{formatCurrency(req.user.wallet?.balance || 0)} PTS</td>
                    <td className="py-3 font-mono font-bold text-[#FFC700] tabular-nums">
                      +{formatCurrency(req.requestedAmount)} PTS
                    </td>
                    <td className="py-3 text-gray-300 max-w-xs font-mono">{req.notes || "--"}</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-3 py-1.5 font-black uppercase text-emerald-400 hover:bg-emerald-500/30 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("approveBtn")}
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-ruby/20 border border-ruby/50 px-3 py-1.5 font-black uppercase text-ruby hover:bg-ruby/30 transition-all active:scale-95"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {t("rejectBtn")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Direct User Balance Modifier */}
      <div className="mst-card mb-8 rounded-2xl p-6 shadow-xl">
        <h2 className="text-base font-black uppercase tracking-tight text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#FF6B00]" />
          {t("directModifier")}
        </h2>
        <form onSubmit={handleDirectAdjust} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="text-xs text-gray-400 block mb-1.5 font-bold uppercase tracking-wider">
              {locale === "bn" ? "ইউজার নির্বাচন করুন" : "Select User"}
            </label>
            <select
              value={adjustUserId}
              onChange={(e) => setAdjustUserId(e.target.value)}
              className="w-full rounded-xl border border-[#08478E]/60 bg-[#040F26] px-3.5 py-3 text-xs text-white focus:border-[#FF6B00] focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({locale === "bn" ? "ব্যালেন্স" : "Balance"}: {formatCurrency(u.wallet?.balance || 0)} PTS)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1.5 font-bold uppercase tracking-wider">
              {locale === "bn" ? "সমন্বয় পরিমাণ (+ / -)" : "Adjustment (+ / -)"}
            </label>
            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(Number(e.target.value))}
              placeholder="e.g. 500 or -200"
              className="w-full rounded-xl border border-[#08478E]/60 bg-[#040F26] px-3.5 py-3 font-mono text-xs text-white tabular-nums focus:border-[#FF6B00] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="btn-action-orange w-full rounded-xl py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(255,107,0,0.35)] active:scale-98"
            >
              {t("applyAdjustment")}
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Live Game Rounds Ledger */}
      <div className="mst-card rounded-2xl p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#08478E]/50 pb-4">
          <h2 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
            <History className="h-4 w-4 text-[#FFC700]" />
            {t("recentLedger")}
          </h2>
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 text-[#FFC700] fill-[#FFC700]" />
            <span className="text-xs text-gray-400 font-mono">CSPRNG Audit Verified</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#08478E]/50 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">{locale === "bn" ? "রাউন্ড আইডি" : "Round ID"}</th>
                <th className="pb-3">{t("userCol")}</th>
                <th className="pb-3">{locale === "bn" ? "গেম" : "Game"}</th>
                <th className="pb-3">{t("stakeAmount")}</th>
                <th className="pb-3">{t("multiplier")}</th>
                <th className="pb-3">{locale === "bn" ? "পেআউট" : "Payout"}</th>
                <th className="pb-3">{locale === "bn" ? "স্ট্যাটাস" : "Status"}</th>
                <th className="pb-3">{locale === "bn" ? "সার্ভার সিড" : "Seed"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#08478E]/30">
              {recentRounds.map((rnd) => (
                <tr key={rnd.id} className="text-gray-300">
                  <td className="py-3 font-mono text-[10px] text-gray-500">{rnd.id.slice(0, 8)}...</td>
                  <td className="py-3 font-bold text-white">{rnd.user.username}</td>
                  <td className="py-3">
                    <span className="rounded-md bg-[#08478E]/40 border border-[#08478E] px-2 py-0.5 text-[10px] font-mono font-bold text-[#FFC700]">
                      {rnd.gameType}
                    </span>
                  </td>
                  <td className="py-3 font-mono tabular-nums">{formatCurrency(rnd.betAmount)} PTS</td>
                  <td className="py-3 font-mono font-bold text-white tabular-nums">{rnd.multiplier.toFixed(2)}x</td>
                  <td className="py-3 font-mono font-bold text-emerald-400 tabular-nums">
                    {rnd.payout > 0 ? `+${formatCurrency(rnd.payout)} PTS` : "--"}
                  </td>
                  <td className="py-3">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                        rnd.status === "WON"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-ruby/20 text-ruby border border-ruby/30"
                      }`}
                    >
                      {rnd.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[9px] text-gray-500 max-w-[120px] truncate">
                    {rnd.serverSeed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
