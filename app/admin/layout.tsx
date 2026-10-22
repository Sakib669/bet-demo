"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/language-context";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Receipt,
  Settings,
  LogOut,
  Shield,
  Star,
  Languages,
  ArrowLeft,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, toggleLocale } = useLanguage();

  const navLinks = [
    {
      href: "/admin/dashboard",
      label: locale === "bn" ? "ড্যাশবোর্ড" : "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/payments",
      label: locale === "bn" ? "পেমেন্ট রিকোয়েস্ট" : "Payment Requests",
      icon: CreditCard,
    },
    {
      href: "/admin/users",
      label: locale === "bn" ? "ইউজার ও অ্যানালিটিক্স" : "Users & Analytics",
      icon: Users,
    },
    {
      href: "/admin/transactions",
      label: locale === "bn" ? "ট্রানজেকশন লেজার" : "Audit Ledgers",
      icon: Receipt,
    },
    {
      href: "/admin/settings",
      label: locale === "bn" ? "সেটিংস" : "Settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#060814] text-white flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-[#193e87]/60 bg-[#0e1f3d] p-4 flex flex-col justify-between">
        <div>
          {/* Admin Header */}
          <div className="flex items-center gap-3 border-b border-[#193e87]/60 pb-4 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#fc7219] to-[#fedbbb] text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black uppercase tracking-tight text-white">
                  HERMES ADMIN
                </span>
                <span className="rounded bg-[#fedbbb] px-1.5 py-0.2 text-[8px] font-black text-[#081329] uppercase">
                  OPERATOR
                </span>
              </div>
              <p className="text-[10px] text-[#94caf9] font-mono">CV666 Secure Panel</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#fc7219] text-white shadow-[0_0_15px_rgba(255,107,0,0.35)]"
                      : "text-gray-300 hover:bg-[#193e87]/40 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="border-t border-[#193e87]/60 pt-4 mt-6 space-y-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLocale}
            className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-[#081329] px-3.5 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Languages className="h-3.5 w-3.5 text-[#fedbbb]" />
              <span>Language</span>
            </div>
            <span className="font-mono text-[10px] text-[#fedbbb]">{locale === "bn" ? "বাংলা" : "ENG"}</span>
          </button>

          {/* Logout Action */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{locale === "bn" ? "অ্যাডমিন লগআউট" : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Stage */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
