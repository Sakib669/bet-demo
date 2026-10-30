"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

type Phase = "idle" | "preview" | "input" | "lost";
const nextPad = () => Math.floor(Math.random() * 4);

export function PatternRecall() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [active, setActive] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => { setBest(Number(window.localStorage.getItem("pulse:pattern-best")) || 0); }, []);

  useEffect(() => {
    if (phase !== "preview") return;
    const timers: number[] = [];
    sequence.forEach((pad, index) => {
      timers.push(window.setTimeout(() => setActive(pad), 600 + index * 720));
      timers.push(window.setTimeout(() => setActive(null), 1080 + index * 720));
    });
    timers.push(window.setTimeout(() => setPhase("input"), 1220 + (sequence.length - 1) * 720));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [phase, sequence]);

  const start = () => { setSequence([nextPad()]); setInputIndex(0); setActive(null); setPhase("preview"); };
  const press = (pad: number) => {
    if (phase !== "input") return;
    if (sequence[inputIndex] !== pad) { setPhase("lost"); return; }
    if (inputIndex === sequence.length - 1) {
      if (sequence.length > best) { setBest(sequence.length); window.localStorage.setItem("pulse:pattern-best", String(sequence.length)); }
      setInputIndex(0);
      setSequence((previous) => [...previous, nextPad()]);
      setPhase("preview");
    } else setInputIndex((value) => value + 1);
  };

  const message = phase === "idle" ? "Start a round to see the first pattern." : phase === "preview" ? "Watch the pattern." : phase === "lost" ? `Pattern missed. You reached round ${sequence.length}.` : `Your turn: ${inputIndex + 1} of ${sequence.length}`;
  return <div className="skill-game"><div className="skill-game-header"><div><p className="eyebrow">PULSE / RECALL</p><h3>Follow the pattern.</h3><p>Watch the tiles light up, then repeat the sequence. Each round adds one step.</p></div><button className="button-primary" onClick={start}><RotateCcw size={16} /> {phase === "idle" ? "Start game" : "Start over"}</button></div><div className="skill-game-stats"><span>Round <strong>{sequence.length || "—"}</strong></span><span>Best <strong>{best || "—"}</strong></span></div><div className="pattern-grid">{[0, 1, 2, 3].map((pad) => <button key={pad} type="button" disabled={phase !== "input"} aria-label={`Pattern tile ${pad + 1}`} className={`pattern-pad pattern-pad-${pad} ${active === pad ? "is-active" : ""}`} onClick={() => press(pad)}><span>{String(pad + 1).padStart(2, "0")}</span></button>)}</div><p className="skill-game-result" role="status">{message}</p></div>;
}
