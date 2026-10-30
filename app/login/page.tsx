"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/lib/language-context";
import { Star, Smartphone, Lock, ArrowRight, AlertCircle, Shield } from "lucide-react";

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
      const res = await signIn("credentials", {
        mobile: cleanMobile,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg(
          locale === "bn"
            ? "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।"
            : "Invalid mobile number or password."
        );
        setLoading(false);
        return;
      }

      // Check role via wallet/session endpoint and redirect
      const checkRes = await fetch("/api/wallet");
      const checkData = await checkRes.json();
      if (checkData.success && checkData.user?.role === "ADMIN") {
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#345441]/70 bg-[#182b21] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-16 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full bg-[#c4e77d]/20 blur-3xl pointer-events-none" />

        {/* Logo / Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#c4e77d] to-[#e2f4c6] text-white shadow-[0_0_20px_rgba(255,107,0,0.4)] mb-3">
            <Star className="h-6 w-6 fill-white" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            {locale === "bn" ? "অ্যাকাউন্টে লগইন" : "Sign In to Account"}
          </h1>
          <p className="mt-1 text-xs text-[#aabdab]">
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

        <div className="mt-6 border-t border-[#345441]/50 pt-4 text-center">
          <p className="text-xs text-gray-400">
            {locale === "bn" ? "অ্যাকাউন্ট নেই?" : "Don't have an account?"}{" "}
            <Link
              href="/register"
              className="font-bold text-[#e2f4c6] hover:text-[#c4e77d] hover:underline"
            >
              {locale === "bn" ? "নতুন অ্যাকাউন্ট খুলুন" : "Register Now"}
            </Link>
          </p>

          <div className="mt-4 rounded-xl border border-white/10 bg-[#0c1714]/60 p-3 text-[11px] text-gray-400">
            <span className="font-bold text-gray-300 block mb-1">
              {locale === "bn" ? "ডেমো টেস্ট অ্যাকাউন্টসমূহ:" : "Demo Test Accounts:"}
            </span>
            <div className="font-mono text-[10px] space-y-0.5 text-gray-400">
              <p>👑 Admin: <span className="text-[#e2f4c6]">01700000000</span> / pass: <span className="text-[#e2f4c6]">admin123</span></p>
              <p>🎮 Player: <span className="text-[#aabdab]">01711111111</span> / pass: <span className="text-[#aabdab]">player123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
