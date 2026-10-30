"use client";

import { localFetch } from "@/lib/browser-db";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Check, Clock3, Copy, Gift, ReceiptText, X } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";

type Tab = "buy" | "history" | "bonus";
type Purchase = { id: string; amount: number; bkashTrxId: string; senderNumber: string; status: string; adminNote?: string; createdAt: string };

export function TopUpModal() {
  const { isTopUpOpen, setIsTopUpOpen, refreshWallet, isAuthenticated } = useWallet();
  const { locale } = useLanguage();
  const bn = locale === "bn";
  const [tab, setTab] = useState<Tab>("buy");
  const [number, setNumber] = useState("");
  const [accountType, setAccountType] = useState("Personal (Send Money)");
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [amount, setAmount] = useState(500);
  const [sender, setSender] = useState("");
  const [trxId, setTrxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<Purchase[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [bonusLoading, setBonusLoading] = useState(false);

  useEffect(() => {
    if (!isTopUpOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsTopUpOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [isTopUpOpen, setIsTopUpOpen]);

  useEffect(() => {
    if (!isTopUpOpen) return;
    setSettingsLoading(true);
    localFetch("/api/settings/bkash")
      .then((response) => response.json())
      .then((data) => { setNumber(data.success ? data.data?.number || "" : ""); setAccountType(data.success ? data.data?.type || "Personal (Send Money)" : "Personal (Send Money)"); })
      .catch(() => setNumber(""))
      .finally(() => setSettingsLoading(false));
  }, [isTopUpOpen]);

  useEffect(() => {
    if (!isTopUpOpen || tab !== "history" || !isAuthenticated) return;
    setHistoryLoading(true);
    localFetch("/api/deposit/history")
      .then((response) => response.json())
      .then((data) => { if (data.success) setHistory(data.deposits || []); })
      .catch(() => setError(bn ? "পেমেন্টের তথ্য পাওয়া যায়নি।" : "Could not load payment history."))
      .finally(() => { setHistoryLoading(false); refreshWallet(); });
  }, [isTopUpOpen, tab, isAuthenticated, bn, refreshWallet]);

  if (!isTopUpOpen) return null;

  const cleanNumber = number.replace(/[-\s]/g, "");
  const copyNumber = async () => {
    if (!cleanNumber) return;
    try { await navigator.clipboard.writeText(cleanNumber); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
    catch { setError(bn ? "নম্বর কপি করা যায়নি।" : "Could not copy the number."); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(""); setMessage("");
    if (!isAuthenticated) { setError(bn ? "আগে লগইন করুন।" : "Sign in before submitting payment details."); return; }
    if (!cleanNumber) { setError(bn ? "বিকাশ নম্বর এখনো সেট করা হয়নি।" : "The receiving number is not configured yet."); return; }
    if (!/^01\d{9}$/.test(sender.replace(/[-\s]/g, "")) || !/^[a-zA-Z0-9]{8,20}$/.test(trxId.trim())) { setError(bn ? "সঠিক মোবাইল নম্বর ও TrxID দিন।" : "Enter an 11-digit sender number and valid transaction ID."); return; }
    setSubmitting(true);
    try {
      const response = await localFetch("/api/deposit/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, senderNumber: sender, bkashTrxId: trxId }) });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Could not submit payment details.");
      setMessage(bn ? "তথ্য জমা হয়েছে। যাচাইয়ের পর ক্রেডিট যোগ হবে।" : "Payment details submitted. Credits appear after review.");
      setSender(""); setTrxId("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not submit payment details."); }
    finally { setSubmitting(false); }
  };

  const claimBonus = async () => {
    setError(""); setMessage(""); setBonusLoading(true);
    try {
      const response = await localFetch("/api/wallet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "CLAIM_DAILY" }) });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Could not claim the daily credits.");
      setMessage(data.message); await refreshWallet();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not claim the daily credits."); }
    finally { setBonusLoading(false); }
  };

  return <div className="credit-sheet-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsTopUpOpen(false); }}><section className="credit-sheet" role="dialog" aria-modal="true" aria-labelledby="credit-title"><header className="credit-sheet-header"><div><p className="eyebrow">PULSE / WALLET</p><h2 id="credit-title">{bn ? "আপনার ক্রেডিট" : "Your credits"}</h2><p>{bn ? "পেমেন্ট, যাচাই ও ক্রেডিটের হিসাব এক জায়গায়।" : "Payments, reviews, and credits in one place."}</p></div><button className="credit-close" onClick={() => setIsTopUpOpen(false)} aria-label="Close credit panel"><X size={20} /></button></header><nav className="credit-tabs" aria-label="Credit panel sections"><button className={tab === "buy" ? "active" : ""} onClick={() => { setTab("buy"); setError(""); setMessage(""); }}>{bn ? "ক্রেডিট কিনুন" : "Buy credits"}</button><button className={tab === "history" ? "active" : ""} onClick={() => { setTab("history"); setError(""); setMessage(""); }}>{bn ? "ইতিহাস" : "History"}</button><button className={tab === "bonus" ? "active" : ""} onClick={() => { setTab("bonus"); setError(""); setMessage(""); }}>{bn ? "দৈনিক" : "Daily"}</button></nav><div className="credit-sheet-body">
    {tab === "buy" && <form onSubmit={submit} className="credit-form"><p className="credit-inline-note"><AlertCircle size={16} /> {bn ? "এই প্রিভিউতে তথ্য শুধু এই ব্রাউজারে থাকে। অন্য ডিভাইস থেকে পেমেন্ট যাচাই করা যায় না।" : "This preview stores claims only in this browser. An operator on another device cannot review them."}</p><div className="credit-recipient"><span className="credit-field-label">{bn ? "বিকাশে পাঠানোর নম্বর" : "bKash receiving number"}</span><div className="credit-recipient-line"><strong>{settingsLoading ? "···········" : number || (bn ? "এখনো সেট করা হয়নি" : "Not configured")}</strong><button type="button" onClick={copyNumber} disabled={!number} aria-label="Copy receiving number">{copied ? <Check size={17} /> : <Copy size={17} />}</button></div><small>{number ? accountType : (bn ? "নম্বর সেট না হওয়া পর্যন্ত টাকা পাঠাবেন না।" : "Do not send money until a number appears here.")}</small></div><ol className="credit-instructions"><li><span>01</span>{bn ? "প্যাক বেছে নিয়ে দেখানো নম্বরে পেমেন্ট করুন।" : "Choose a pack and pay the number shown above."}</li><li><span>02</span>{bn ? "প্রেরক নম্বর ও আসল TrxID জমা দিন।" : "Enter the sender number and real transaction ID."}</li><li><span>03</span>{bn ? "অপারেটর স্টেটমেন্ট মিলিয়ে ক্রেডিট যোগ করবেন।" : "An operator matches the statement before adding credits."}</li></ol><div><span className="credit-field-label">{bn ? "ক্রেডিট প্যাক" : "Credit pack"} <small>1 BDT = 1 PTS</small></span><div className="credit-pack-grid">{[100, 250, 500, 1000].map((pack) => <button key={pack} type="button" className={amount === pack ? "active" : ""} onClick={() => setAmount(pack)}><strong>{pack}</strong><span>BDT / PTS</span></button>)}</div></div><div className="credit-fields"><label><span className="credit-field-label">{bn ? "প্রেরক বিকাশ নম্বর" : "Sender bKash number"}</span><input type="tel" inputMode="numeric" pattern="01[0-9]{9}" value={sender} onChange={(event) => setSender(event.target.value)} placeholder="017XXXXXXXX" required /></label><label><span className="credit-field-label">{bn ? "পেমেন্ট TrxID" : "Payment TrxID"}</span><input type="text" pattern="[A-Za-z0-9]{8,20}" value={trxId} onChange={(event) => setTrxId(event.target.value)} placeholder="BK9X728Q41" required /></label></div>{!isAuthenticated && <p className="credit-inline-note"><AlertCircle size={16} /> {bn ? "ক্রেডিট পেতে আগে লগইন করুন।" : "Sign in to link the purchase to your wallet."} <Link href="/login" onClick={() => setIsTopUpOpen(false)}>{bn ? "লগইন" : "Sign in"}</Link></p>}<button className="button-primary credit-submit" type="submit" disabled={submitting || !number || !isAuthenticated}>{submitting ? (bn ? "জমা হচ্ছে…" : "Submitting…") : (bn ? "যাচাইয়ের জন্য জমা দিন" : "Submit for review")} <ArrowRight size={17} /></button></form>}
    {tab === "history" && <div className="credit-history">{!isAuthenticated ? <p>{bn ? "ইতিহাস দেখতে লগইন করুন।" : "Sign in to see your payment history."}</p> : historyLoading ? <p>{bn ? "লোড হচ্ছে…" : "Loading payment history…"}</p> : history.length === 0 ? <div className="credit-empty"><ReceiptText size={28} /><strong>{bn ? "এখনো পেমেন্ট নেই" : "No payments yet"}</strong><p>{bn ? "পেমেন্ট করলে তার অবস্থা এখানে দেখবেন।" : "Payment status will appear here after you submit a claim."}</p></div> : history.map((item) => <article className="credit-history-item" key={item.id}><div><strong>{item.amount} BDT</strong><span className={`credit-status credit-status-${item.status.toLowerCase()}`}>{item.status}</span></div><p>TrxID {item.bkashTrxId} · {item.senderNumber}</p><small>{new Date(item.createdAt).toLocaleString()}</small>{item.adminNote && <p>{item.adminNote}</p>}</article>)}</div>}
    {tab === "bonus" && <div className="credit-bonus"><Gift size={34} /><h3>{bn ? "দৈনিক ২৫০ পয়েন্ট" : "250 daily points"}</h3><p>{bn ? "প্রতি ২৪ ঘণ্টায় একবার বিনামূল্যে ২৫০ পয়েন্ট নিতে পারেন।" : "Claim 250 free game points once every 24 hours."}</p><button className="button-primary" onClick={claimBonus} disabled={!isAuthenticated || bonusLoading}>{bonusLoading ? (bn ? "অপেক্ষা করুন…" : "Working…") : (bn ? "দৈনিক পয়েন্ট নিন" : "Claim daily points")} <Clock3 size={17} /></button>{!isAuthenticated && <p>{bn ? "আগে লগইন করুন।" : "Sign in to claim daily points."}</p>}</div>}
    {message && <p className="credit-feedback success" role="status"><Check size={16} /> {message}</p>}{error && <p className="credit-feedback error" role="alert"><AlertCircle size={16} /> {error}</p>}
  </div></section></div>;
}
