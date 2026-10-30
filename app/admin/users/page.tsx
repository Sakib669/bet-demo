"use client";

import { localFetch } from "@/lib/browser-db";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Shield,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  wallet: { balance: number } | null;
  _count: {
    gameRounds: number;
    depositRequests: number;
  };
}

export default function AdminUsersPage() {
  const { locale } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await localFetch(`/api/admin/users?role=${roleFilter}&search=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePromote = async (id: string, currentRole: string) => {
    const isPromoting = currentRole !== "ADMIN";
    const confirmText = isPromoting
      ? "Are you sure you want to promote this user to ADMIN?"
      : "Are you sure you want to demote this user to CUSTOMER?";

    if (!confirm(confirmText)) return;

    try {
      const res = await localFetch(`/api/admin/users/${id}/promote`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(data.message);
        await fetchUsers();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Error changing user role");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#345441]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#e2f4c6]" />
            <span>{locale === "bn" ? "ইউজার ও প্লেয়ার ডিরেক্টরি" : "User & Player Registry"}</span>
          </h1>
          <p className="text-xs text-[#aabdab]">
            {locale === "bn"
              ? "প্লেয়ারদের ব্যালেন্স, অ্যাক্টিভিটি এবং বিস্তারিত অ্যানালিটিক্স পর্যবেক্ষণ করুন"
              : "Inspect user accounts, balances, game activity, and deep behavior analytics"}
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 rounded-xl border border-[#345441] bg-[#182b21] px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-[#c4e77d]" : ""}`} />
          <span>{locale === "bn" ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-xl bg-[#182b21] p-1 border border-[#345441]/60">
          {[
            { id: "ALL", label: locale === "bn" ? "সকল" : "All Users" },
            { id: "CUSTOMER", label: locale === "bn" ? "প্লেয়ার্স" : "Customers" },
            { id: "ADMIN", label: locale === "bn" ? "অ্যাডমিনস" : "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase transition-all ${
                roleFilter === tab.id
                  ? "bg-[#c4e77d] text-white shadow-[0_0_12px_rgba(255,107,0,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={locale === "bn" ? "নাম বা মোবাইল দিয়ে খুঁজুন..." : "Search name or mobile..."}
            className="w-full rounded-xl border border-[#345441]/60 bg-[#182b21] pl-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-[#c4e77d] focus:outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="mst-card rounded-2xl p-5 shadow-xl overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            {locale === "bn" ? "ইউজার তালিকা লোড হচ্ছে..." : "Loading users..."}
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            {locale === "bn" ? "কোনো ইউজার পাওয়া যায়নি।" : "No users found."}
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#345441]/60 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">{locale === "bn" ? "ইউজার প্রোফাইল" : "User Profile"}</th>
                <th className="pb-3">{locale === "bn" ? "মোবাইল নম্বর" : "Mobile"}</th>
                <th className="pb-3">{locale === "bn" ? "রোল" : "Role"}</th>
                <th className="pb-3">{locale === "bn" ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}</th>
                <th className="pb-3">{locale === "bn" ? "মোট খেলা রাউন্ড" : "Rounds Played"}</th>
                <th className="pb-3">{locale === "bn" ? "যোগদানের তারিখ" : "Joined"}</th>
                <th className="pb-3 text-right">{locale === "bn" ? "অ্যাকশন" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#345441]/30">
              {users.map((u) => {
                const isAdmin = u.role === "ADMIN";
                return (
                  <tr key={u.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                    <td className="py-3.5">
                      <span className="font-bold text-white block text-sm">{u.name}</span>
                      {u.email && <span className="text-[11px] text-gray-400 block">{u.email}</span>}
                    </td>
                    <td className="py-3.5 font-mono text-gray-300 font-bold">{u.mobile}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase font-mono ${
                          isAdmin
                            ? "bg-[#e2f4c6]/20 text-[#e2f4c6] border border-[#e2f4c6]/40"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                        }`}
                      >
                        {isAdmin ? <Shield className="h-3 w-3" /> : null}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="py-3.5 font-mono font-black text-white text-sm tabular-nums">
                      {formatCurrency(u.wallet?.balance || 0)} PTS
                    </td>
                    <td className="py-3.5 font-mono text-gray-300 font-bold tabular-nums">
                      {u._count.gameRounds} rounds
                    </td>
                    <td className="py-3.5 font-mono text-gray-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#c4e77d]/20 border border-[#c4e77d]/50 px-2.5 py-1.5 font-black uppercase text-[#e2f4c6] hover:bg-[#c4e77d]/30 transition-all active:scale-95 text-[11px]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{locale === "bn" ? "অ্যানালিটিক্স" : "Analyze"}</span>
                      </Link>

                      <button
                        onClick={() => handlePromote(u.id, u.role)}
                        title={isAdmin ? "Demote to Customer" : "Promote to Admin"}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#0c1714] px-2 py-1.5 text-gray-400 hover:text-white transition-all text-[11px]"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>{isAdmin ? "Demote" : "Make Admin"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
