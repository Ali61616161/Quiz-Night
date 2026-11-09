"use client";
import { use, useEffect, useState } from "react";
import { Flip } from "@/components/Flip";
import { Pul } from "@/components/Pul";
import { QR } from "@/components/QR";
import { Sure } from "@/components/Sure";
import { useGameStream, useWakeLock } from "@/lib/client/useGameStream";
import { BRAND } from "@config/brand";

interface TvTeam { id: string; rank: number; name: string; color: string; emoji: string; score: number; members: number }
interface TvView {
  serverNow: number; code: string; venueName: string; phase: string; openedAt: number | null; deadline: number | null;
  question: null | { index: number; total: number; category: string; kind: string; text: string; options: string[] | null; correct?: string; explanation?: string | null };
  teams: TvTeam[];
}

export default function TvPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [simple, setSimple] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setToken(q.get("t"));
    setSimple(q.get("basit") === "1");
  }, []);
  useWakeLock();
  const { view, connected, serverNow } = useGameStream<TvView>(id, "tv", token);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(location.origin), []);

  if (!token) return <main style={{ padding: "2rem" }}><p>TV bağlantısı geçersiz. Host panelinden yeni bağlantı al.</p></main>;
  if (!view) return <main style={{ padding: "2rem" }}><p>Bağlanıyor…</p></main>;

  const joinUrl = `${origin}/j/${view.code}`;
  const q = view.question;
  const showQ = q && ["question_open", "question_locked", "answer_reveal"].includes(view.phase);
  const showBoard = view.phase === "scoreboard" || view.phase === "final";

  return (
    <main className={simple ? "basit" : ""} style={{ minHeight: "100dvh", cursor: "none", display: "grid", gridTemplateRows: "auto 1fr auto", gap: "1.5rem", padding: "2vw", fontSize: "clamp(18px, 1.6vw, 28px)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: "clamp(32px, 3.4vw, 64px)" }}>{view.venueName}</h1>
        {q && view.phase !== "lobby" && <p className="display tabular" style={{ fontSize: "clamp(24px, 2.4vw, 44px)", color: "var(--lamba)", margin: 0 }}>Soru {q.index + 1}/{q.total} · {q.category}</p>}
      </header>

      {view.phase === "lobby" && (
        <section style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4vw", alignItems: "start" }}>
          <div>
            <QR text={joinUrl} size={Math.min(420, 360)} label={`${view.venueName} oyununa katılmak için QR kod`} />
            <p className="display tabular" style={{ fontSize: "clamp(48px, 6vw, 110px)", color: "var(--lamba)", margin: ".5rem 0 0" }}>{view.code}</p>
            <p style={{ margin: 0 }}>Telefonla okut, takımını kur.</p>
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
        <section><h2 style={{ fontSize: "clamp(48px, 7vw, 130px)" }}>Hazır olun</h2><p style={{ fontSize: "1.4em" }}>Cevabı kaptan gönderir. Masada konuşabilirsiniz.</p></section>
      )}

      {showQ && q && (
        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 26vw)", gap: "2.5vw", alignItems: "start" }}>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div className="fis">
              <p style={{ fontSize: "clamp(32px, 4.2vw, 72px)", lineHeight: 1.15, fontWeight: 700, margin: 0 }}>{q.text}</p>
              {q.options && (
                <ol style={{ listStyle: "upper-alpha", fontSize: "clamp(24px, 2.8vw, 48px)", margin: "1rem 0 0", paddingLeft: "1.6em", display: "grid", gap: ".3rem" }}>
                  {q.options.map((o) => (
                    <li key={o} style={view.phase === "answer_reveal" && o === q.correct ? { fontWeight: 800, textDecoration: "underline" } : undefined}>
                      {o}{view.phase === "answer_reveal" && o === q.correct ? " ✓" : ""}
                    </li>
                  ))}
                </ol>
              )}
            </div>
            {view.phase === "answer_reveal" ? (
              <div className="fis" style={{ background: "var(--lamba)" }}>
                <p className="display" style={{ fontSize: "clamp(32px, 4vw, 72px)", margin: 0 }}>Doğru cevap: {q.correct}</p>
                {q.explanation && <p style={{ margin: ".4rem 0 0", fontSize: "1.15em" }}>{q.explanation}</p>}
              </div>
            ) : (
              <Sure openedAt={view.openedAt} deadline={view.deadline} active={view.phase === "question_open"} serverNow={serverNow} big />
            )}
          </div>
          <MiniBoard teams={view.teams} simple={simple} />
        </section>
      )}

      {showBoard && (
        <section>
          <h2 style={{ fontSize: "clamp(40px, 5vw, 90px)", marginBottom: "1rem" }}>{view.phase === "final" ? "Bu gecenin sıralaması" : "Skor tablosu"}</h2>
          <Board teams={view.teams} simple={simple} large />
        </section>
      )}

      <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "end", opacity: .9 }}>
        <p style={{ margin: 0 }}>{view.phase !== "lobby" && <>Katıl: <strong className="tabular">{origin.replace(/^https?:\/\//, "")}/j/{view.code}</strong></>}</p>
        <p style={{ margin: 0, fontSize: ".8em" }}>{!connected && "Bağlantı koptu, yeniden bağlanıyor · "}{BRAND.name}</p>
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
