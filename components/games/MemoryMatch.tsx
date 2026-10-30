"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

const symbols = ["◆", "●", "▲", "✦", "■", "✳", "⬟", "✚"];
const initialDeck = [...symbols, ...symbols].map((symbol, index) => ({ id: index, symbol }));

function shuffledDeck() {
  const cards = [...initialDeck];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export function MemoryMatch() {
  const [deck, setDeck] = useState(initialDeck);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("pulse:memory-best"));
    if (saved > 0) setBest(saved);
  }, []);

  useEffect(() => {
    if (open.length !== 2) return;
    const [first, second] = open;
    if (deck[first].symbol === deck[second].symbol) {
      const timer = window.setTimeout(() => { setMatched((previous) => [...previous, first, second]); setOpen([]); }, 350);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setOpen([]), 850);
    return () => window.clearTimeout(timer);
  }, [deck, open]);

  useEffect(() => {
    if (!started || matched.length !== deck.length) return;
    if (best === null || moves < best) {
      setBest(moves);
      window.localStorage.setItem("pulse:memory-best", String(moves));
    }
  }, [best, deck.length, matched.length, moves, started]);

  const reset = () => { setDeck(shuffledDeck()); setOpen([]); setMatched([]); setMoves(0); setStarted(true); };
  const flip = (index: number) => {
    if (!started || open.length === 2 || open.includes(index) || matched.includes(index)) return;
    if (open.length === 1) setMoves((value) => value + 1);
    setOpen((previous) => [...previous, index]);
  };

  return <div className="skill-game"><div className="skill-game-header"><div><p className="eyebrow">PULSE / MEMORY</p><h3>Find the pairs.</h3><p>Turn over two tiles. Match all eight pairs in as few moves as you can.</p></div><button className="button-primary" onClick={reset}><RotateCcw size={16} /> {started ? "New round" : "Start game"}</button></div><div className="skill-game-stats"><span>Moves <strong>{moves}</strong></span><span>Pairs <strong>{matched.length / 2}/8</strong></span><span>Best <strong>{best ?? "—"}</strong></span></div><div className="memory-grid">{deck.map((card, index) => { const revealed = open.includes(index) || matched.includes(index); return <button key={card.id} type="button" className={`memory-card ${revealed ? "is-revealed" : ""} ${matched.includes(index) ? "is-matched" : ""}`} onClick={() => flip(index)} disabled={!started || matched.includes(index)} aria-label={revealed ? card.symbol : `Hidden card ${index + 1}`} aria-pressed={revealed}>{revealed ? card.symbol : <span>P</span>}</button>; })}</div>{started && matched.length === deck.length && <p className="skill-game-result" role="status">All pairs found in {moves} moves. {best === moves ? "That’s your best round." : "Want another round?"}</p>}</div>;
}
