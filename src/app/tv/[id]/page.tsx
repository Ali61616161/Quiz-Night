"use client";
import { use, useEffect, useRef, useState } from "react";
import { Flip } from "@/components/Flip";
import { Pul } from "@/components/Pul";
import { QR } from "@/components/QR";
import { Sure } from "@/components/Sure";
import { brandStyle, type BrandView } from "@/lib/client/brandStyle";
import { dingSound, tickSound } from "@/lib/client/sound";
import { useGameStream, useWakeLock } from "@/lib/client/useGameStream";
import { BRAND } from "@config/brand";

interface TvTeam { id: string; rank: number; name: string; color: string; emoji: string; score: number; members: number; locked?: boolean }
interface TvView {
  serverNow: number; code: string; venueName: string; phase: string; mode: string; openedAt: number | null; deadline: number | null; brand: BrandView | null; watermark: boolean; paused: boolean;
  question: null | { index: number; total: number; category: string; kind: string; round: string; roundNo: number; roundLabel: string; text: string | null; image: string | null;
    options: string[] | null; items: string[] | null; left: string[] | null; right: string[] | null; correct?: string; explanation?: string | null };
  teams: TvTeam[];
}
const ROUND_NAME: Record<string, string> = { all: "", speed: "Hız turu", wager: "Bahis turu", final: "Final sorusu" };
const MODE_NAME: Record<string, string> = { captain: "Kaptan cevaplar", majority: "Masa oylar", individual: "Herkes ayrı cevaplar" };

export default function TvPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [simple, setSimple] = useState(false);
  const [sound, setSound] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setToken(q.get("t")); setSimple(q.get("basit") === "1"); setSound(q.get("ses") === "1"); setOrigin(location.origin);
  }, []);
  useWakeLock();
  const { view, connected, serverNow } = useGameStream<TvView>(id, "tv", token);

  // Sesler (isteğe bağlı): son 5 sn tik, cevap açılınca zil
  const lastPhase = useRef("");
  useEffect(() => { if (sound && view && lastPhase.current !== view.phase) { if (view.phase === "answer_reveal") dingSound(); lastPhase.current = view.phase; } }, [view, sound]);
  useEffect(() => {
    if (!sound || view?.phase !== "question_open" || !view.deadline) return;
    const iv = setInterval(() => { const left = (view.deadline ?? 0) - serverNow(); if (left > 0 && left <= 5000) tickSound(); }, 1000);
    return () => clearInterval(iv);
  }, [sound, view?.phase, view?.deadline, serverNow]);

  if (!token) return <main style={{ padding: "2rem" }}><p>TV bağlantısı geçersiz. Host panelinden yeni bağlantı al.</p></main>;
  if (!view) return <main style={{ padding: "2rem" }}><p>Bağlanıyor…</p></main>;

  const joinUrl = `${origin}/j/${view.code}`;
  const q = view.question;
  const showQ = q && q.text && ["question_open", "question_locked", "answer_reveal"].includes(view.phase);
  const showBoard = view.phase === "scoreboard" || view.phase === "final";
  const sponsor = view.phase === "final" ? `Bu gece ${view.venueName} sundu` : null;

  return (
    <main className={simple ? "basit" : ""} style={{ minHeight: "100dvh", cursor: "none", display: "grid", gridTemplateRows: "auto 1fr auto", gap: "1.5rem", padding: "2vw", fontSize: "clamp(18px, 1.6vw, 28px)", ...brandStyle(view.brand) }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          {view.brand?.logo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={view.brand.logo} alt="" style={{ height: "clamp(40px, 5vw, 90px)", maxWidth: "20vw", objectFit: "contain" }} />}
          <h1 style={{ fontSize: "clamp(32px, 3.4vw, 64px)" }}>{view.venueName}</h1>
        </div>
        {q && view.phase !== "lobby" && <p className="display tabular" style={{ fontSize: "clamp(24px, 2.4vw, 44px)", color: "var(--lamba)", margin: 0, textAlign: "right" }}>
          Soru {q.index + 1}/{q.total} · {q.category}{ROUND_NAME[q.round] ? ` · ${ROUND_NAME[q.round]}` : ""}</p>}
      </header>

      {view.phase === "lobby" && (
        <section style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4vw", alignItems: "start" }}>
          <div>
            <QR text={joinUrl} size={360} label={`${view.venueName} oyununa katılmak için QR kod`} />
            <p className="display tabular" style={{ fontSize: "clamp(48px, 6vw, 110px)", color: "var(--lamba)", margin: ".5rem 0 0" }}>{view.code}</p>
            <p style={{ margin: 0 }}>Telefonla okut, takımını kur. Telefonlar sadece cevap içindir.</p>
          </div>
          <div>
            <h2 style={{ fontSize: "clamp(32px, 3.4vw, 64px)", marginBottom: "1rem" }}>{view.teams.length ? `${view.teams.length} takım hazır` : "Takımlar bekleniyor"}</h2>
            <ul style={{ display: "flex", flexWrap: "wrap", gap: "1.2vw", listStyle: "none", padding: 0, margin: 0 }}>
              {view.teams.map((t) => (
                <li key={t.id} style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                  <Pul color={t.color} emoji={t.emoji} size={72} drop={!simple} />
                  <span className="display" style={{ fontSize: "clamp(24px, 2.2vw, 40px)" }}>{t.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {view.phase === "round_intro" && (
        <section>
          <h2 style={{ fontSize: "clamp(48px, 7vw, 130px)" }}>{q?.roundLabel || "Hazır olun"}</h2>
          {q && ROUND_NAME[q.round] && <p className="display" style={{ fontSize: "clamp(28px, 3vw, 56px)", color: "var(--lamba)", margin: 0 }}>{ROUND_NAME[q.round]}</p>}
          <p style={{ fontSize: "1.4em" }}>{q && (q.round === "wager" || q.round === "final") ? "Soruyu görmeden bahsinizi girin." : `${MODE_NAME[view.mode]}. Masada konuşabilirsiniz.`}</p>
        </section>
      )}

      {showQ && q && (
        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 26vw)", gap: "2.5vw", alignItems: "start" }}>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div className="fis">
              <p style={{ fontSize: "clamp(32px, 4.2vw, 72px)", lineHeight: 1.15, fontWeight: 700, margin: 0 }}>{q.text}</p>
              {q.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={q.image} alt="" style={{ maxHeight: "38vh", maxWidth: "100%", marginTop: "1rem", borderRadius: 6 }} />}
              {q.options && (
                <ol style={{ listStyle: "upper-alpha", fontSize: "clamp(24px, 2.8vw, 48px)", margin: "1rem 0 0", paddingLeft: "1.6em", display: "grid", gap: ".3rem" }}>
                  {q.options.map((o) => <li key={o} style={view.phase === "answer_reveal" && o === q.correct ? { fontWeight: 800, textDecoration: "underline" } : undefined}>{o}{view.phase === "answer_reveal" && o === q.correct ? " ✓" : ""}</li>)}
                </ol>
              )}
              {q.items && <ul style={{ fontSize: "clamp(24px, 2.8vw, 48px)", margin: "1rem 0 0", display: "flex", gap: "1rem", flexWrap: "wrap", listStyle: "none", padding: 0 }}>{q.items.map((i) => <li key={i} style={{ border: "3px solid var(--murekkep)", borderRadius: 6, padding: ".2rem .8rem" }}>{i}</li>)}</ul>}
              {q.left && q.right && (
                <div style={{ display: "flex", justifyContent: "space-between", gap: "3rem", fontSize: "clamp(24px, 2.8vw, 48px)", marginTop: "1rem" }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>{q.left.map((l) => <li key={l}>{l}</li>)}</ul>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", textAlign: "right" }}>{q.right.map((r) => <li key={r}>{r}</li>)}</ul>
                </div>
              )}
              {q.kind === "estimate" && <p style={{ margin: ".8rem 0 0", fontSize: "1.2em" }}>En yakın tahmin kazanır.</p>}
            </div>
            {view.phase === "answer_reveal" ? (
              <div className="fis" style={{ background: "var(--lamba)" }}>
                <p className="display" style={{ fontSize: "clamp(32px, 4vw, 72px)", margin: 0 }}>Doğru cevap: {q.correct}</p>
                {q.explanation && <p style={{ margin: ".4rem 0 0", fontSize: "1.15em" }}>{q.explanation}</p>}
              </div>
            ) : <Sure openedAt={view.openedAt} deadline={view.deadline} active={view.phase === "question_open"} serverNow={serverNow} big />}
            {view.phase === "question_open" && (
              <div aria-label="Kilitlenen takımlar" style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", minHeight: 56 }}>
                {view.teams.filter((t) => t.locked).map((t) => <Pul key={t.id} color={t.color} emoji={t.emoji} size={52} drop={!simple} />)}
              </div>
            )}
          </div>
          <MiniBoard teams={view.teams} simple={simple} />
        </section>
      )}

      {showBoard && (
        <section>
          <h2 style={{ fontSize: "clamp(40px, 5vw, 90px)", marginBottom: "1rem" }}>{sponsor ?? "Skor tablosu"}</h2>
          {view.phase === "final" && <p style={{ fontSize: "1.3em", margin: "0 0 1rem" }}>Bu gecenin sıralaması</p>}
          <Board teams={view.teams} simple={simple} large />
        </section>
      )}

      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "end", opacity: .9 }}>
        <p style={{ margin: 0 }}>{view.phase !== "lobby" && <>Katıl: <strong className="tabular">{origin.replace(/^https?:\/\//, "")}/j/{view.code}</strong></>}</p>
        <p style={{ margin: 0, fontSize: ".8em" }}>{!connected && "Bağlantı koptu, yeniden bağlanıyor · "}{view.paused && "Duraklatıldı · "}{view.watermark ? BRAND.name : ""}</p>
      </footer>
    </main>
  );
}

function Board({ teams, simple, large }: { teams: TvTeam[]; simple: boolean; large?: boolean }) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: ".6rem" }}>
      {teams.map((t) => (
        <li key={t.id} style={{ display: "grid", gridTemplateColumns: "2.2em auto 1fr auto", alignItems: "center", gap: ".8rem", borderTop: "2px solid var(--cuha-line)", paddingTop: ".5rem" }}>
          <span className="display tabular" style={{ fontSize: large ? "2.4em" : "1.6em", color: "var(--lamba)" }}>{t.rank}</span>
          <Pul color={t.color} emoji={t.emoji} size={large ? 64 : 44} />
          <span className="display" style={{ fontSize: large ? "2.2em" : "1.4em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
          <span style={{ fontSize: large ? "2.6em" : "1.6em" }}><Flip value={t.score} simple={simple} /></span>
        </li>
      ))}
    </ol>
  );
}
function MiniBoard({ teams, simple }: { teams: TvTeam[]; simple: boolean }) {
  return <aside aria-label="Skor tablosu"><Board teams={teams.slice(0, 8)} simple={simple} /></aside>;
}
