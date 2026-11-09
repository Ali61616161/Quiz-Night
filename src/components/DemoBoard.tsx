"use client";
import { useEffect, useState } from "react";
import { Flip } from "./Flip";
import { Pul } from "./Pul";

const TEAMS = [
  { name: "Çuha Çocukları", color: "#D64933", emoji: "⚽" },
  { name: "Okey Ustaları", color: "#F4B942", emoji: "🎲" },
  { name: "Kampüs Kurtları", color: "#5B8DB8", emoji: "🐺" },
  { name: "Son Yudum", color: "#8FBF6A", emoji: "🍀" },
];

/** Landing'in canlı demosu: skor gerçekten çevrilir. */
export function DemoBoard() {
  const [scores, setScores] = useState([300, 280, 240, 200]);
  useEffect(() => {
    const iv = setInterval(() => {
      setScores((s) => { const n = [...s]; n[Math.floor(Math.random() * n.length)] += 100; return n; });
    }, 2600);
    return () => clearInterval(iv);
  }, []);
  const rows = TEAMS.map((t, i) => ({ ...t, score: scores[i] })).sort((a, b) => b.score - a.score);
  return (
    <ol aria-label="Canlı skor tablosu örneği" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: ".5rem", fontSize: "clamp(20px, 3vw, 34px)" }}>
      {rows.map((t, i) => (
        <li key={t.name} style={{ display: "grid", gridTemplateColumns: "1.5em auto 1fr auto", alignItems: "center", gap: ".7rem", borderTop: "2px solid var(--cuha-line)", paddingTop: ".4rem" }}>
          <span className="display" style={{ color: "var(--lamba)" }}>{i + 1}</span>
          <Pul color={t.color} emoji={t.emoji} size={44} />
          <span className="display">{t.name}</span>
          <Flip value={t.score} />
        </li>
      ))}
    </ol>
  );
}
