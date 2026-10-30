"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Check, CreditCard, Gamepad2 } from "lucide-react";
import { WinGo } from "@/components/games/WinGo";
import { DragonTiger } from "@/components/games/DragonTiger";
import { CrazyWheel } from "@/components/games/CrazyWheel";
import { Aviator } from "@/components/games/Aviator";
import { Mines } from "@/components/games/Mines";
import { CoinFlip } from "@/components/games/CoinFlip";
import { DiceRoll } from "@/components/games/DiceRoll";
import { PenaltyShootout } from "@/components/games/PenaltyShootout";
import { MemoryMatch } from "@/components/games/MemoryMatch";
import { PatternRecall } from "@/components/games/PatternRecall";
import { BottomNav } from "@/components/BottomNav";
import { useWallet } from "@/lib/wallet-context";
import { useLanguage } from "@/lib/language-context";

const games = [
  { id: "wingo", name: "Win Go", type: "Colour & number", image: "/images/games/wingo.svg", note: "30-second rounds" },
  { id: "aviator", name: "Aviator", type: "Crash", image: "/images/games/aviator.svg", note: "Time your exit" },
  { id: "mines", name: "Mines", type: "Grid", image: "/images/games/mines.svg", note: "Pick your tiles" },
  { id: "dragon-tiger", name: "Dragon Tiger", type: "Cards", image: "/images/games/dragon-tiger.svg", note: "Two sides, one result" },
  { id: "wheel", name: "Crazy Wheel", type: "Wheel", image: "/images/games/wheel.svg", note: "Choose a segment" },
  { id: "coin-flip", name: "Coin Flip", type: "Classic", image: "/images/games/coin-flip.svg", note: "Heads or tails" },
  { id: "dice", name: "Dice", type: "Classic", image: "/images/games/dice.svg", note: "Set your target" },
  { id: "penalty", name: "Penalty", type: "Sports", image: "/images/games/penalty.svg", note: "Five shots" },
  { id: "memory", name: "Memory Match", type: "Puzzle", image: "/images/games/memory.svg", note: "Find eight pairs" },
  { id: "pattern", name: "Pattern Recall", type: "Puzzle", image: "/images/games/pattern.svg", note: "Remember the sequence" },
] as const;

type GameId = (typeof games)[number]["id"];

export default function Home() {
  const [activeTab, setActiveTab] = useState<GameId>("wingo");
  const { setIsTopUpOpen, refreshWallet } = useWallet();
  const { locale } = useLanguage();
  const selected = games.find((game) => game.id === activeTab) ?? games[0];
  const bn = locale === "bn";

  const selectGame = (id: GameId) => {
    setActiveTab(id);
    document.getElementById("arena-stage")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="site-home">
      <section className="home-hero page-shell" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="eyebrow"><span className="status-dot" /> PULSE / GAME ROOM</p>
          <h1 id="home-title">{bn ? <>আপনার খেলা।<br /><em>আপনার গতি।</em></> : <>Good games.<br /><em>Your pace.</em></>}</h1>
          <p className="hero-description">{bn ? "দশটি ছোট গেম, একটি পরিষ্কার ওয়ালেট। আপনার পছন্দের রাউন্ডে যান, ফলাফল দেখুন, আবার খেলুন।" : "Ten quick games in one focused room. Pick a round, see the result, and decide what comes next."}</p>
          <div className="hero-actions"><a className="button-primary" href="#games">{bn ? "গেম বেছে নিন" : "Browse games"} <ArrowDownRight size={17} /></a><button className="button-text" onClick={() => setIsTopUpOpen(true)}>{bn ? "ক্রেডিট কিনুন" : "Buy credits"} <ArrowUpRight size={17} /></button></div>
          <p className="hero-fineprint">{bn ? "পেমেন্টের পর অ্যাডমিন যাচাই করে ক্রেডিট যোগ করেন।" : "Credits are added after an operator verifies your payment."}</p>
        </div>
        <div className="home-hero-art" aria-hidden="true"><div className="art-orbit art-orbit-one" /><div className="art-orbit art-orbit-two" /><div className="art-ticket"><span>P/10</span><strong>PLAY<br />AT YOUR<br />PACE.</strong><small>GAME ROOM · 2026</small></div><div className="art-coin">P</div><div className="art-caption">01—10 / CHOOSE A GAME</div></div>
      </section>

      <section className="page-shell game-section" id="games" aria-labelledby="games-title">
        <div className="section-heading"><div><p className="eyebrow">01 / THE LINEUP</p><h2 id="games-title">{bn ? "খেলার ঘর" : "Pick your game"}</h2></div><p>{bn ? "প্রতিটি গেম এখানেই খুলবে।" : "Every game opens here. No extra tabs, no detours."}</p></div>
        <div className="game-grid">{games.map((game, index) => <button key={game.id} type="button" className={`game-tile ${activeTab === game.id ? "is-selected" : ""}`} onClick={() => selectGame(game.id)} aria-pressed={activeTab === game.id}><span className="game-tile-number">{String(index + 1).padStart(2, "0")}</span><span className="game-tile-art"><img src={game.image} alt="" /></span><span className="game-tile-body"><span className="game-tile-type">{game.type}</span><strong>{game.name}</strong><span className="game-tile-note">{game.note}</span></span><span className="game-tile-arrow"><ArrowUpRight size={18} /></span></button>)}</div>
      </section>

      <section className="arena-section page-shell" id="arena-stage" aria-labelledby="arena-title"><div className="section-heading"><div><p className="eyebrow">02 / NOW PLAYING</p><h2 id="arena-title">{selected.name}</h2></div><span className="arena-label"><Gamepad2 size={16} /> {selected.type}</span></div><div className="arena-frame">
        {activeTab === "wingo" && <WinGo onRoundComplete={refreshWallet} />}
        {activeTab === "aviator" && <Aviator onRoundComplete={refreshWallet} />}
        {activeTab === "mines" && <Mines />}
        {activeTab === "dragon-tiger" && <DragonTiger onRoundComplete={refreshWallet} />}
        {activeTab === "wheel" && <CrazyWheel onRoundComplete={refreshWallet} />}
        {activeTab === "coin-flip" && <CoinFlip />}
        {activeTab === "dice" && <DiceRoll />}
        {activeTab === "penalty" && <PenaltyShootout onRoundComplete={refreshWallet} />}
        {activeTab === "memory" && <MemoryMatch />}
        {activeTab === "pattern" && <PatternRecall />}
      </div></section>

      <section className="page-shell credit-section" aria-labelledby="credit-title"><div className="credit-heading"><p className="eyebrow">03 / YOUR WALLET</p><h2 id="credit-title">{bn ? "ক্রেডিট কীভাবে যোগ হয়" : "How credits are added"}</h2><p>{bn ? "বিকাশে পাঠানো টাকা যাচাইয়ের পরেই ওয়ালেটে পয়েন্ট আসে।" : "A claim alone does not add points. An operator checks the bKash transaction first."}</p><button className="button-primary" onClick={() => setIsTopUpOpen(true)}><CreditCard size={17} /> {bn ? "পেমেন্টের তথ্য দিন" : "Start a credit purchase"}</button></div><ol className="credit-steps"><li><span>01</span><div><strong>{bn ? "প্যাক বেছে নিন" : "Choose an amount"}</strong><p>{bn ? "কত ক্রেডিট লাগবে ঠিক করুন।" : "See the credit amount before you pay."}</p></div></li><li><span>02</span><div><strong>{bn ? "বিকাশে পেমেন্ট করুন" : "Pay with bKash"}</strong><p>{bn ? "নম্বর ও TrxID জমা দিন।" : "Submit the sender number and transaction ID."}</p></div></li><li><span>03</span><div><strong>{bn ? "যাচাইয়ের অপেক্ষা" : "Wait for review"}</strong><p>{bn ? "যাচাই হলে ক্রেডিট যোগ হবে।" : "Credits appear only after approval."}</p></div><Check size={18} /></li></ol></section>

      <footer className="site-footer"><div className="page-shell footer-inner"><div><strong>PULSE</strong><p>{bn ? "ছোট গেম। পরিষ্কার নিয়ম।" : "Quick games. Clear rules."}</p></div><nav aria-label="Footer"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><button onClick={() => setIsTopUpOpen(true)}>Credits</button></nav></div></footer>
      <BottomNav activeTab={activeTab} setActiveTab={(id) => selectGame(id as GameId)} />
    </div>
  );
}
