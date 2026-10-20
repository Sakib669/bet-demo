"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  Coins,
  History,
  Lock,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  PlusCircle,
  MinusCircle,
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
  const [passcode, setPasscode] = useState<string>("hermes_admin_secret_9988");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
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
          className="inline-flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#0A1026] px-3.5 py-2 text-xs font-bold text-gray-300 hover:border-[#0000F2] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Game Arena</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#0A1026] px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#00D2FF]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Admin Title */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#0000F2]/40 bg-[#0A1026] p-6 shadow-2xl">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#0000F2]/20 blur-3xl" />
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0000F2] text-white shadow-cobalt-glow">
            <ShieldAlert className="h-6 w-6 text-[#00D2FF]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">ADMIN CONTROL DESK</h1>
            <p className="text-xs text-gray-400">
              Manual Top-Up Approvals, Ledger Inquiries, and User Credit Adjustments
            </p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-400 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#1E293B] bg-[#0A1026] p-4">
          <span className="text-xs font-bold uppercase text-gray-400">Registered Users</span>
          <p className="mt-1 font-mono text-2xl font-black text-white">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-[#0000F2]/40 bg-[#0A1026] p-4 shadow-cobalt-glow">
          <span className="text-xs font-bold uppercase text-[#00D2FF]">Pending Approvals</span>
          <p className="mt-1 font-mono text-2xl font-black text-[#00D2FF]">{pendingRequests.length}</p>
        </div>
        <div className="rounded-2xl border border-[#1E293B] bg-[#0A1026] p-4">
          <span className="text-xs font-bold uppercase text-gray-400">Total Game Rounds</span>
          <p className="mt-1 font-mono text-2xl font-black text-white">{recentRounds.length}+</p>
        </div>
        <div className="rounded-2xl border border-[#1E293B] bg-[#0A1026] p-4">
          <span className="text-xs font-bold uppercase text-gray-400">System Mode</span>
          <p className="mt-1 font-mono text-xs font-black text-emerald-400 uppercase">
            SIMULATION / ACTIVE
          </p>
        </div>
      </div>

      {/* Section 1: Pending Simulation Top-Up Requests */}
      <div className="mb-8 rounded-2xl border border-[#1E293B] bg-[#0A1026] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#1E293B] pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="h-4 w-4 text-[#00D2FF]" />
            Simulation Top-Up Requests ({pendingRequests.length})
          </h2>
          <span className="text-xs text-gray-400">Manual review & approval</span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No pending top-up requests. Users can submit requests from the &quot;Free Credits&quot; modal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-gray-400 font-semibold">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Current Balance</th>
                  <th className="pb-3">Requested Amount</th>
                  <th className="pb-3">Notes</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="text-gray-300">
                    <td className="py-3 font-bold text-white">{req.user.username}</td>
                    <td className="py-3 font-mono">{formatCurrency(req.user.wallet?.balance || 0)} PTS</td>
                    <td className="py-3 font-mono font-bold text-[#00D2FF]">
                      +{formatCurrency(req.requestedAmount)} PTS
                    </td>
                    <td className="py-3 text-gray-400 max-w-xs truncate">{req.notes || "--"}</td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-3 py-1.5 font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-ruby/20 border border-ruby/50 px-3 py-1.5 font-bold text-ruby hover:bg-ruby/30 transition-all"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
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
      <div className="mb-8 rounded-2xl border border-[#1E293B] bg-[#0A1026] p-5 shadow-xl">
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#00D2FF]" />
          Direct Balance Modifier
        </h2>
        <form onSubmit={handleDirectAdjust} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1 font-semibold">Select User</label>
            <select
              value={adjustUserId}
              onChange={(e) => setAdjustUserId(e.target.value)}
              className="w-full rounded-xl border border-[#1E293B] bg-[#060814] px-3 py-2 text-xs text-white focus:border-[#0000F2] focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} (Balance: {formatCurrency(u.wallet?.balance || 0)} PTS)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1 font-semibold">Adjustment (+ / -)</label>
            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(Number(e.target.value))}
              placeholder="e.g. 500 or -200"
              className="w-full rounded-xl border border-[#1E293B] bg-[#060814] px-3 py-2 font-mono text-xs text-white focus:border-[#0000F2] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl border border-[#0000F2] bg-[#0000F2] py-2 text-xs font-bold text-white shadow-cobalt-glow hover:bg-[#1E29FF] transition-all"
            >
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>

      {/* Section 3: Live Game Rounds Ledger */}
      <div className="rounded-2xl border border-[#1E293B] bg-[#0A1026] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between border-b border-[#1E293B] pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="h-4 w-4 text-[#00D2FF]" />
            Recent Game Rounds & Provably Fair Seeds
          </h2>
          <span className="text-xs text-gray-400">Audit trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] text-gray-400 font-semibold">
                <th className="pb-3">Round ID</th>
                <th className="pb-3">User</th>
                <th className="pb-3">Game</th>
                <th className="pb-3">Stake</th>
                <th className="pb-3">Multiplier</th>
                <th className="pb-3">Payout</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Seed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {recentRounds.map((rnd) => (
                <tr key={rnd.id} className="text-gray-300">
                  <td className="py-3 font-mono text-[10px] text-gray-400">{rnd.id.slice(0, 8)}...</td>
                  <td className="py-3 font-bold text-white">{rnd.user.username}</td>
                  <td className="py-3">
                    <span className="rounded bg-[#0000F2]/20 px-2 py-0.5 text-[10px] font-bold text-[#00D2FF]">
                      {rnd.gameType}
                    </span>
                  </td>
                  <td className="py-3 font-mono">{formatCurrency(rnd.betAmount)} PTS</td>
                  <td className="py-3 font-mono font-bold text-white">{rnd.multiplier.toFixed(2)}x</td>
                  <td className="py-3 font-mono font-bold text-emerald-400">
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
