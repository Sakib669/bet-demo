"use client";

import { useState } from "react";
import Link from "next/link";
import { signInLocal } from "@/lib/browser-db";
import { useLanguage } from "@/lib/language-context";
import { Smartphone, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { locale } = useLanguage();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const cleanMobile = mobile.trim().replace(/[-\s]/g, "");

    try {
      const res = await signInLocal(cleanMobile, password);

      if (!res.success) {
        setErrorMsg(
          locale === "bn"
            ? "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।"
            : "Invalid mobile number or password."
        );
        setLoading(false);
        return;
      }

      // Check role via wallet/session endpoint and redirect
      if ("user" in res && res.user.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/";
      }
    } catch {
      setErrorMsg(
        locale === "bn"
          ? "লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
          : "Sign-in request failed. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell page-shell">
      <aside className="auth-aside"><p className="eyebrow">PULSE / ACCESS</p><h2>Back in<br /><em>the room.</em></h2><p>Choose a game, check your balance, and pick up where you left off.</p><span>01 / 02</span></aside>
      <div className="auth-panel">

        {/* Logo / Header */}
        <div className="mb-8">
          <p className="eyebrow">ACCOUNT / SIGN IN</p>
          <h1 className="auth-title">
            {locale === "bn" ? "আবার স্বাগতম" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-[#aabdab]">
            {locale === "bn"
              ? "আপনার মোবাইল নম্বর এবং পাসওয়ার্ড দিয়ে লগইন করুন"
              : "Enter your mobile number and password to continue"}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-300">
              {locale === "bn" ? "মোবাইল নম্বর" : "Mobile Number"}
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] pl-10 pr-4 py-3 font-mono text-sm text-white placeholder-gray-500 focus:border-[#c4e77d] focus:outline-none focus:ring-1 focus:ring-[#c4e77d]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-300">
              {locale === "bn" ? "পাসওয়ার্ড" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[#c4e77d] focus:outline-none focus:ring-1 focus:ring-[#c4e77d]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-action-orange w-full rounded-xl py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>
              {loading
                ? locale === "bn"
                  ? "যাচাই হচ্ছে..."
                  : "VERIFYING..."
                : locale === "bn"
                ? "লগইন করুন"
                : "SIGN IN"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-[#345441]/50 pt-4">
          <p className="text-xs text-gray-400">
            {locale === "bn" ? "অ্যাকাউন্ট নেই?" : "Don't have an account?"}{" "}
            <Link
              href="/register"
              className="font-bold text-[#e2f4c6] hover:text-[#c4e77d] hover:underline"
            >
              {locale === "bn" ? "নতুন অ্যাকাউন্ট খুলুন" : "Register Now"}
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
