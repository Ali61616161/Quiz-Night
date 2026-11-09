"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flip } from "@/components/Flip";
import { Pul } from "@/components/Pul";

const QS = [
  { q: "Türkiye’nin başkenti neresidir?", o: ["İstanbul", "Ankara", "İzmir", "Bursa"], a: 1 },
  { q: "Bir futbol takımı sahada kaç oyuncuyla başlar?", o: ["9", "10", "11", "12"], a: 2 },
  { q: "Suyun kimyasal formülü nedir?", o: ["CO2", "H2O", "O2", "NaCl"], a: 1 },
  { q: "İstanbul’un fethi hangi yıl gerçekleşti?", o: ["1071", "1299", "1453", "1923"], a: 2 },
  { q: "Baklavanın hamuru hangi malzemeyle yapılır?", o: ["Yufka", "Pirinç", "Bulgur", "Mısır unu"], a: 0 },
];
const BOTS = [{ n: "Okey Ustaları", c: "#F4B942", e: "🎲", p: 0.7 }, { n: "Kampüs Kurtları", c: "#5B8DB8", e: "🐺", p: 0.5 }, { n: "Son Yudum", c: "#8FBF6A", e: "🍀", p: 0.4 }];

/** Kayıt gerektirmeyen, tamamen tarayıcıda çalışan 5 soruluk demo. */
export default function Demo() {
  const [i, setI] = useState(0); const [picked, setPicked] = useState<number | null>(null); const [left, setLeft] = useState(15);
  const [score, setScore] = useState(0); const [bots, setBots] = useState([0, 0, 0]); const [done, setDone] = useState(false);
  const revealed = picked !== null || left === 0;
  const scored = useRef(-1);
  useEffect(() => {
    if (revealed || done) return;
    const iv = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(iv);
  }, [revealed, done, i]);
  useEffect(() => {
    if (!revealed || scored.current === i) return;
    scored.current = i;
    if (picked === QS[i].a) setScore((s) => s + 100);
    setBots((b) => b.map((x, k) => x + (Math.random() < BOTS[k].p ? 100 : 0)));
  }, [revealed, i, picked]);
  const next = () => { if (i === QS.length - 1) setDone(true); else { setI(i + 1); setPicked(null); setLeft(15); } };
  const rows = useMemo(() => [{ n: "Sizin takımınız", c: "#D64933", e: "⚽", s: score }, ...BOTS.map((b, k) => ({ n: b.n, c: b.c, e: b.e, s: bots[k] }))].sort((a, b) => b.s - a.s), [score, bots]);
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "1.25rem", display: "grid", gap: "1.25rem" }}>
      <a href="/" style={{ color: "var(--lamba)" }}>Ana sayfa</a>
      <h1 style={{ fontSize: "2.4rem" }}>Kendin dene</h1>
      {!done ? (
        <>
          <p style={{ margin: 0 }}>Soru {i + 1}/{QS.length} · {left} sn kaldı</p>
          <div className="fis"><p style={{ fontSize: "1.6rem", fontWeight: 700, margin: 0 }}>{QS[i].q}</p></div>
          <div style={{ display: "grid", gap: ".5rem" }}>
            {QS[i].o.map((o, k) => <button key={o} className={`btn ${revealed && k === QS[i].a ? "" : "btn-fis"}`} style={{ justifyContent: "flex-start", minHeight: 56, outline: picked === k ? "3px solid var(--lamba)" : undefined }} disabled={revealed} onClick={() => setPicked(k)}>{revealed && k === QS[i].a ? "✓ " : picked === k ? "✘ " : "○ "}{o}</button>)}
          </div>
          {revealed && <button className="btn" onClick={next}>{i === QS.length - 1 ? "Sonucu gör" : "Sonraki soru"}</button>}
        </>
      ) : <p style={{ fontSize: "1.3rem" }}>Demo bitti. Gerçek gecede soruları TV’de, cevapları telefonda görürsün.</p>}
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: ".5rem" }}>
        {rows.map((r, k) => <li key={r.n} style={{ display: "grid", gridTemplateColumns: "1.5em auto 1fr auto", gap: ".7rem", alignItems: "center", borderTop: "2px solid var(--cuha-line)", paddingTop: ".4rem", fontSize: "1.6rem" }}><span className="display" style={{ color: "var(--lamba)" }}>{k + 1}</span><Pul color={r.c} emoji={r.e} size={40} /><span className="display">{r.n}</span><Flip value={r.s} /></li>)}
      </ol>
      {done && <a className="btn" href="/giris">Mekanını kaydet</a>}
    </main>
  );
}
