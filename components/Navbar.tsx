"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutLocal } from "@/lib/browser-db";
import { ArrowUpRight, Globe2, Wallet } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";
import { formatCurrency } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { balance, loading, setIsTopUpOpen, user, isAuthenticated } = useWallet();
  const { locale, toggleLocale } = useLanguage();
  const isAdmin = user?.role === "ADMIN";
  const bn = locale === "bn";

  return (
    <header className="site-header">
      <div className="page-shell site-header-inner">
        <Link href="/" className="brand-mark" aria-label="Pulse home"><span className="brand-symbol">P<span>.</span></span><span className="brand-name">PULSE<small>GAME ROOM</small></span></Link>
        <nav className="site-main-nav" aria-label="Main navigation">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>{bn ? "হোম" : "Home"}</Link>
          <Link href="/#games">{bn ? "গেম" : "Games"}</Link>
          {isAdmin && <Link href="/admin/dashboard" aria-current={pathname.startsWith("/admin") ? "page" : undefined}>{bn ? "অ্যাডমিন" : "Admin"}</Link>}
        </nav>
        <div className="site-header-actions">
          <button className="language-button" onClick={toggleLocale} aria-label={bn ? "Switch to English" : "বাংলায় দেখুন"}><Globe2 size={16} /><span>{bn ? "BN" : "EN"}</span></button>
          <div className="wallet-chip"><Wallet size={16} /><span>{loading ? "···" : formatCurrency(balance)} <small>PTS</small></span></div>
          <button className="header-credit-button" onClick={() => setIsTopUpOpen(true)}>{bn ? "ক্রেডিট" : "Credits"} <ArrowUpRight size={16} /></button>
          {isAuthenticated ? <button className="account-link" onClick={() => { signOutLocal(); window.location.href = "/login"; }}>{bn ? "লগআউট" : "Sign out"}</button> : <Link className="account-link" href="/login">{bn ? "লগইন" : "Sign in"}</Link>}
        </div>
      </div>
    </header>
  );
}
