"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  Settings,
  Save,
  CheckCircle2,
  Smartphone,
  Shield,
  RefreshCw,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { locale } = useLanguage();
  const [bkashNumber, setBkashNumber] = useState("01798-234567");
  const [bkashType, setBkashType] = useState("Personal (Send Money)");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          if (data.settings.bkash_number) setBkashNumber(data.settings.bkash_number);
          if (data.settings.bkash_type) setBkashType(data.settings.bkash_type);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bkash_number: bkashNumber,
          bkash_type: bkashType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Settings saved. Customer deposit modal updated in real time.");
      } else {
        alert(data.message);
      }
    } catch {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#345441]/60 pb-4">
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2.5">
          <Settings className="h-6 w-6 text-[#c4e77d]" />
          <span>{locale === "bn" ? "প্ল্যাটফর্ম ও বিকাশ সেটিংস" : "Platform & bKash Configuration"}</span>
        </h1>
        <p className="text-xs text-[#aabdab]">
          {locale === "bn"
            ? "ডিপোজিট পেইজে গ্রাহকদের প্রদর্শিত বিকাশ নম্বর এবং নির্দেশনা নিয়ন্ত্রণ করুন"
            : "Update active recipient bKash numbers and deposit payment instructions displayed to customers"}
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3.5 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="mst-card rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 text-sm font-black text-white uppercase border-b border-[#345441]/60 pb-3">
          <Smartphone className="h-4 w-4 text-[#c4e77d]" />
          <span>Official bKash Receiving Account</span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
            bKash Mobile Number
          </label>
          <input
            type="text"
            required
            value={bkashNumber}
            onChange={(e) => setBkashNumber(e.target.value)}
            placeholder="017XXXXXXXX"
            className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] px-4 py-3 font-mono text-sm text-white focus:border-[#c4e77d] focus:outline-none"
          />
          <span className="text-[11px] text-gray-400 block mt-1">
            This number is rendered on the customer deposit modal with one-click copy.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-gray-300 mb-1.5">
            bKash Account Type / Instructions
          </label>
          <select
            value={bkashType}
            onChange={(e) => setBkashType(e.target.value)}
            className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] px-4 py-3 text-xs text-white focus:border-[#c4e77d] focus:outline-none"
          >
            <option value="Personal (Send Money)">Personal (Send Money)</option>
            <option value="Merchant (Payment)">Merchant (Payment)</option>
            <option value="Agent (Cash In)">Agent (Cash In)</option>
          </select>
        </div>

        <div className="border-t border-[#345441]/60 pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-action-orange flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save Configuration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
