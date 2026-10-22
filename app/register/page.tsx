"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/lib/language-context";
import { Star, Smartphone, Lock, User, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          mobile,
          email: email.trim() || undefined,
          password,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message);
        setLoading(false);
        return;
      }

      // Automatically sign in upon registration
      const loginRes = await signIn("credentials", {
        mobile: mobile.trim().replace(/[-\s]/g, ""),
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        window.location.href = "/login";
      } else {
        window.location.href = "/";
      }
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#193e87]/70 bg-[#0e1f3d] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-16 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full bg-[#fc7219]/20 blur-3xl pointer-events-none" />

        {/* Logo / Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#fc7219] to-[#fedbbb] text-white shadow-[0_0_20px_rgba(255,107,0,0.4)] mb-3">
            <Star className="h-6 w-6 fill-white" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            {locale === "bn" ? "নতুন অ্যাকাউন্ট রেজিস্ট্রেশন" : "Create New Account"}
          </h1>
          <p className="mt-1 text-xs text-[#94caf9]">
            {locale === "bn"
              ? "রেজিস্ট্রেশন করলেই সাথে সাথে ১,০০০ ফ্রি ডেমো পয়েন্ট পাবেন"
              : "Register to get 1,000 free demo credits instantly"}
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
                placeholder={locale === "bn" ? "যেমন: সাকিব হাসান" : "e.g. John Doe"}
                className="w-full rounded-xl border border-[#193e87]/60 bg-[#081329] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#fc7219] focus:outline-none"
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
                className="w-full rounded-xl border border-[#193e87]/60 bg-[#081329] pl-10 pr-4 py-2.5 font-mono text-sm text-white placeholder-gray-500 focus:border-[#fc7219] focus:outline-none"
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
                className="w-full rounded-xl border border-[#193e87]/60 bg-[#081329] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#fc7219] focus:outline-none"
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
                className="w-full rounded-xl border border-[#193e87]/60 bg-[#081329] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#fc7219] focus:outline-none"
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
                className="w-full rounded-xl border border-[#193e87]/60 bg-[#081329] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#fc7219] focus:outline-none"
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

        <div className="mt-5 border-t border-[#193e87]/50 pt-4 text-center">
          <p className="text-xs text-gray-400">
            {locale === "bn" ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}
            <Link
              href="/login"
              className="font-bold text-[#fedbbb] hover:text-[#fc7219] hover:underline"
            >
              {locale === "bn" ? "লগইন করুন" : "Sign In"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
