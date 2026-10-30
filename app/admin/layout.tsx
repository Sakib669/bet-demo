"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutLocal } from "@/lib/browser-db";
import { useWallet } from "@/lib/wallet-context";
import { ArrowLeft, Globe2, LogOut } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useWallet();
  const { locale, toggleLocale } = useLanguage();
  const bn = locale === "bn";
  const links = [
    { href: "/admin/dashboard", en: "Overview", bn: "ওভারভিউ" },
    { href: "/admin/payments", en: "Payment queue", bn: "পেমেন্ট" },
    { href: "/admin/users", en: "Members", bn: "সদস্য" },
    { href: "/admin/transactions", en: "Ledger", bn: "লেজার" },
    { href: "/admin/settings", en: "Settings", bn: "সেটিংস" },
  ];

  useEffect(() => { if (!loading && user?.role !== "ADMIN") router.replace("/login"); }, [loading, user, router]);
  if (loading || user?.role !== "ADMIN") return <div className="page-shell py-20 text-sm text-[#aabdab]">Checking operator access…</div>;

  return <div className="admin-shell"><div className="page-shell admin-header"><div><p className="eyebrow">PULSE / OPERATIONS</p><h1>{bn ? "অপারেশন ডেস্ক" : "Operations desk"}</h1><p>{bn ? "পেমেন্ট যাচাই, ক্রেডিট ও সদস্য ব্যবস্থাপনা" : "Review payments, manage credits, and keep records clear."}</p></div><div className="admin-header-actions"><Link href="/"><ArrowLeft size={16} /> {bn ? "গেম রুম" : "Game room"}</Link><button onClick={toggleLocale}><Globe2 size={16} /> {bn ? "BN" : "EN"}</button><button onClick={() => { signOutLocal(); window.location.href = "/login"; }}><LogOut size={16} /> {bn ? "লগআউট" : "Sign out"}</button></div></div><nav className="page-shell admin-nav" aria-label="Admin navigation">{links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href || (link.href !== "/admin/dashboard" && pathname.startsWith(link.href)) ? "page" : undefined}>{bn ? link.bn : link.en}</Link>)}</nav><div className="page-shell admin-content">{children}</div></div>;
}
