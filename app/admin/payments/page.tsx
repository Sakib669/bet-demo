"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface DepositItem {
  id: string;
  amount: number;
  bkashTrxId: string;
  senderNumber: string;
  status: string;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    email?: string;
    wallet: { balance: number } | null;
  };
  reviewedBy?: {
    id: string;
    name: string;
  };
}

export default function AdminPaymentsPage() {
  const { locale } = useLanguage();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Reject modal state
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState<string>("");

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/deposits?status=${filterStatus}`);
      const data = await res.json();
      if (data.success) {
        setDeposits(data.deposits || []);
      }
    } catch (err) {
      console.error("Fetch deposits error:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/deposits/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(data.message);
        await fetchDeposits();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Error approving request");
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectId) return;
    try {
      const res = await fetch(`/api/admin/deposits/${rejectId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          adminNote: rejectNote || "Payment confirmation failed on bKash statement",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg(data.message);
        setRejectId(null);
        setRejectNote("");
        await fetchDeposits();
      } else {
        alert(data.message);
      }
    } catch {
      alert("Error rejecting request");
    }
  };

  const filtered = deposits.filter((d) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.bkashTrxId.toLowerCase().includes(term) ||
      d.senderNumber.includes(term) ||
      d.user.name.toLowerCase().includes(term) ||
      d.user.mobile.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#345441]/60 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-[#c4e77d]" />
            <span>{locale === "bn" ? "বিকাশ পেমেন্ট ভেরিফিকেশন ও অনুমোদন" : "bKash Deposit Verification"}</span>
          </h1>
          <p className="text-xs text-[#aabdab]">
            {locale === "bn"
              ? "গ্রাহকদের প্রেরিত বিকাশ TrxID যাচাই করে গেমিং ক্রেডিট যুক্ত করুন"
              : "Verify customer bKash TrxIDs and credit game points to user wallets"}
          </p>
        </div>

        <button
          onClick={fetchDeposits}
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

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#182b21] p-1 border border-[#345441]/60">
          {[
            { id: "ALL", label: locale === "bn" ? "সকল" : "All" },
            { id: "PENDING", label: locale === "bn" ? "অপেক্ষমান" : "Pending" },
            { id: "APPROVED", label: locale === "bn" ? "অনুমোদিত" : "Approved" },
            { id: "REJECTED", label: locale === "bn" ? "বাতিল" : "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase transition-all ${
                filterStatus === tab.id
                  ? "bg-[#c4e77d] text-white shadow-[0_0_12px_rgba(255,107,0,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={locale === "bn" ? "TrxID বা নম্বর খুঁজুন..." : "Search TrxID or mobile..."}
            className="w-full rounded-xl border border-[#345441]/60 bg-[#182b21] pl-9 pr-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-[#c4e77d] focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="mst-card rounded-2xl p-5 shadow-xl overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">
            {locale === "bn" ? "পেমেন্ট লোড হচ্ছে..." : "Loading payments..."}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">
            {locale === "bn" ? "কোনো পেমেন্ট রিকোয়েস্ট পাওয়া যায়নি।" : "No payment requests found."}
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#345441]/60 text-gray-400 font-bold uppercase tracking-wider">
                <th className="pb-3">{locale === "bn" ? "তারিখ ও সময়" : "Timestamp"}</th>
                <th className="pb-3">{locale === "bn" ? "ইউজার তথ্য" : "Customer"}</th>
                <th className="pb-3">{locale === "bn" ? "পরিমাণ (টাকা)" : "Amount (BDT)"}</th>
                <th className="pb-3">{locale === "bn" ? "বিকাশ TrxID" : "bKash TrxID"}</th>
                <th className="pb-3">{locale === "bn" ? "প্রেরক বিকাশ নম্বর" : "Sender Mobile"}</th>
                <th className="pb-3">{locale === "bn" ? "বর্তমান স্ট্যাটাস" : "Status"}</th>
                <th className="pb-3">{locale === "bn" ? "রিভিউ তথ্য" : "Review Info"}</th>
                <th className="pb-3 text-right">{locale === "bn" ? "অ্যাকশন" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#345441]/30">
              {filtered.map((dep) => {
                const isPending = dep.status === "PENDING";
                const isApproved = dep.status === "APPROVED";
                const isRejected = dep.status === "REJECTED";

                return (
                  <tr key={dep.id} className="text-gray-300 hover:bg-white/5 transition-colors">
                    <td className="py-3.5 font-mono text-gray-400">
                      {new Date(dep.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-white block">{dep.user.name}</span>
                      <span className="font-mono text-[11px] text-gray-400">{dep.user.mobile}</span>
                    </td>
                    <td className="py-3.5 font-mono font-black text-[#e2f4c6] text-sm tabular-nums">
                      +{formatCurrency(dep.amount)} BDT
                    </td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      <span className="rounded bg-black/40 px-2 py-1 border border-white/10 font-bold">
                        {dep.bkashTrxId}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-gray-300">{dep.senderNumber}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase font-mono ${
                          isApproved
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : isRejected
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                        }`}
                      >
                        {dep.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-[11px] text-gray-400">
                      {dep.reviewedBy ? (
                        <div>
                          <span className="text-gray-300 font-bold block">By: {dep.reviewedBy.name}</span>
                          {dep.adminNote && <span className="italic block text-gray-400">{dep.adminNote}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-500">Awaiting verification</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      {isPending ? (
                        <div className="space-x-2">
                          <button
                            onClick={() => handleApprove(dep.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-2.5 py-1.5 font-black uppercase text-emerald-400 hover:bg-emerald-500/30 transition-all active:scale-95 text-[11px]"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{locale === "bn" ? "অনুমোদন" : "Approve"}</span>
                          </button>

                          <button
                            onClick={() => setRejectId(dep.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-500/20 border border-rose-500/50 px-2.5 py-1.5 font-black uppercase text-rose-400 hover:bg-rose-500/30 transition-all active:scale-95 text-[11px]"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>{locale === "bn" ? "বাতিল" : "Reject"}</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-gray-500 uppercase">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-[#182b21] p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 mb-3">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-base font-black uppercase">
                {locale === "bn" ? "পেমেন্ট বাতিল নিশ্চিত করুন" : "Confirm Payment Rejection"}
              </h3>
            </div>
            <p className="text-xs text-gray-300 mb-4">
              {locale === "bn"
                ? "বাতিল করার কারণ লিখুন (গ্রাহক তার ড্যাশবোর্ডে দেখতে পাবেন):"
                : "Provide a reason for rejection (visible to user in deposit history):"}
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="e.g. TrxID not found on bKash merchant statement / amount mismatch"
              className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] p-3 text-xs text-white placeholder-gray-500 focus:border-rose-500 focus:outline-none mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectId(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
              >
                {locale === "bn" ? "ফিরে যান" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmReject}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-black uppercase text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:bg-rose-500"
              >
                {locale === "bn" ? "বাতিল করুন" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
