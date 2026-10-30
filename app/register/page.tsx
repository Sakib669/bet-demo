"use client";

import { useState } from "react";
import Link from "next/link";
import { registerLocal } from "@/lib/browser-db";
import { useLanguage } from "@/lib/language-context";
import { Smartphone, Lock, User, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const { locale } = useLanguage();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg(
        locale === "bn"
          ? "পাসওয়ার্ড দুটি মিলছে না।"
          : "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const data = await registerLocal({ name, mobile, email: email.trim() || undefined, password });
      if (!data.success) {
        setErrorMsg("message" in data ? data.message : "Registration failed.");
        setLoading(false);
        return;
      }

      window.location.href = "user" in data && data.user.role === "ADMIN" ? "/admin/settings" : "/";
    } catch {
      setErrorMsg(
        locale === "bn"
          ? "অ্যাকাউন্ট খুলতে ত্রুটি হয়েছে। আবার চেষ্টা করুন।"
          : "Registration failed. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell page-shell">
      <aside className="auth-aside"><p className="eyebrow">PULSE / ACCESS</p><h2>Your next<br /><em>round starts here.</em></h2><p>Create an account to keep your credits and game history together.</p><span>02 / 02</span></aside>
      <div className="auth-panel">

        {/* Logo / Header */}
        <div className="mb-8">
          <p className="eyebrow">ACCOUNT / REGISTER</p>
          <h1 className="auth-title">
            {locale === "bn" ? "অ্যাকাউন্ট খুলুন" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-[#aabdab]">
            {locale === "bn"
              ? "প্রথম অ্যাকাউন্টটি এই ব্রাউজারের অপারেটর হবে।"
              : "The first account in this browser becomes its operator."}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3.5 text-xs font-bold text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
              {locale === "bn" ? "আপনার নাম" : "Full Name"}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={locale === "bn" ? "যেমন: সাকিব হাসান" : "Your full name"}
                className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#c4e77d] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
              {locale === "bn" ? "মোবাইল নম্বর (১১ ডিজিট)" : "Mobile Number (11 Digits)"}
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] pl-10 pr-4 py-2.5 font-mono text-sm text-white placeholder-gray-500 focus:border-[#c4e77d] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
              {locale === "bn" ? "ইমেইল (ঐচ্ছিক)" : "Email (Optional)"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#c4e77d] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
              {locale === "bn" ? "পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)" : "Password (Min 6 chars)"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#c4e77d] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-300">
              {locale === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#345441]/60 bg-[#0c1714] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#c4e77d] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-action-orange w-full rounded-xl py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(255,107,0,0.4)] active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>
              {loading
                ? locale === "bn"
                  ? "তৈরি হচ্ছে..."
                  : "CREATING ACCOUNT..."
                : locale === "bn"
                ? "রেজিস্ট্রেশন সম্পন্ন করুন"
                : "COMPLETE REGISTRATION"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-5 border-t border-[#345441]/50 pt-4">
          <p className="text-xs text-gray-400">
            {locale === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
            <Link
              href="/login"
              className="font-bold text-[#e2f4c6] hover:text-[#c4e77d] hover:underline"
            >
              {locale === "bn" ? "লগইন করুন" : "Sign In"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
