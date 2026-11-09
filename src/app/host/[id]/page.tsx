"use client";
import { use, useEffect, useState } from "react";
import { Pul } from "@/components/Pul";
import { QR } from "@/components/QR";
import { Sure } from "@/components/Sure";
import { post, useGameStream } from "@/lib/client/useGameStream";
import { PHASE_LABEL } from "@/lib/engine/machine";
import type { Phase } from "@/lib/engine/types";

interface HostTeam {
  id: string; code: string; name: string; color: string; emoji: string; captainId: string;
  members: { id: string; nickname: string; online: boolean; hidden: number }[];
  answered: boolean; locked: boolean; answerValue: string | null;
  result: { correct: boolean; gained: number } | null; override: boolean | null;
}
interface HostView {
  serverNow: number; id: string; tvToken: string; code: string; phase: Phase; openedAt: number | null; deadline: number | null;
  question: null | { index: number; total: number; text: string; correct?: string };
  teams: { id: string; score: number; rank: number }[];
  teamDetails: HostTeam[]; coach: { do: string; say: string }; answeredCount: number;
}

const NEXT_LABEL: Record<Phase, string> = {
  lobby: "Oyunu başlat", round_intro: "Soruyu aç", question_open: "Süreyi bitir", question_locked: "Cevabı göster",
  answer_reveal: "Skoru göster", scoreboard: "Sonraki soru", final: "Oyun bitti",
};

export default function HostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setOrigin(location.origin);
    const q = new URLSearchParams(location.search).get("t");
    if (q) { try { localStorage.setItem(`host:${id}`, q); } catch {} setToken(q); history.replaceState(null, "", location.pathname); return; }
    try { setToken(localStorage.getItem(`host:${id}`)); } catch { setToken(null); }
  }, [id]);
  const { view, connected, serverNow } = useGameStream<HostView>(id, "host", token);

  const act = async (action: unknown) => {
    if (!token) return;
    setBusy(true); setErr("");
    try { await post(id, { role: "host", token, action }); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  if (!token) return <main style={{ padding: "1.5rem" }}><p>Host yetkisi bulunamadı. Oyunu bu cihazdan oluştur.</p><a className="btn" href="/">Ana sayfa</a></main>;
  if (!view) return <main style={{ padding: "1.5rem" }}><p>Bağlanıyor…</p></main>;

  const joinUrl = `${origin}/j/${view.code}`;
  const tvToken = view.tvToken ?? "";
  const tvUrl = `${origin}/tv/${id}?t=${tvToken}`;
  const done = view.phase === "final";

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "1rem 1rem 6rem", display: "grid", gap: "1.25rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ fontSize: "2rem" }}>Host · {view.code}</h1>
        <span>{connected ? PHASE_LABEL[view.phase] : "Bağlantı koptu, yeniden bağlanıyor"}</span>
      </header>

      <section className="fis" aria-label="Host Coach">
        <p style={{ margin: 0, fontWeight: 700 }}>Şimdi: {view.coach.do}</p>
        <p style={{ margin: ".35rem 0 0" }}>Söyle: “{view.coach.say}”</p>
      </section>

      {view.question && view.phase !== "lobby" && (
        <section className="alan">
          <p style={{ margin: 0, opacity: .8 }}>Soru {view.question.index + 1}/{view.question.total}</p>
          <p style={{ margin: ".25rem 0", fontSize: "1.25rem", fontWeight: 700 }}>{view.question.text}</p>
          <p style={{ margin: 0, color: "var(--lamba)" }}>Doğru cevap: {view.question.correct}</p>
          <div style={{ marginTop: ".75rem" }}>
            <Sure openedAt={view.openedAt} deadline={view.deadline} active={view.phase === "question_open"} serverNow={serverNow} />
          </div>
          {view.phase === "question_open" && <p style={{ margin: ".5rem 0 0" }}>{view.answeredCount}/{view.teamDetails.length} takım cevapladı</p>}
        </section>
      )}

      <section className="alan">
        <h2 style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>Takımlar ({view.teamDetails.length})</h2>
        {view.teamDetails.length === 0 && <p>Henüz takım yok. QR kodu TV’de göster.</p>}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: ".75rem" }}>
          {view.teamDetails.map((t) => {
            const score = view.teams.find((x) => x.id === t.id)?.score ?? 0;
            const cap = t.members.find((m) => m.id === t.captainId);
            return (
              <li key={t.id} style={{ borderTop: "1px solid var(--cuha-line)", paddingTop: ".6rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                  <Pul color={t.color} emoji={t.emoji} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{t.name}</strong> · <span className="tabular">{score} puan</span>
                    <div style={{ fontSize: ".95rem", opacity: .85 }}>
                      Kaptan {cap?.nickname} {cap?.online ? "(bağlı)" : "(çevrimdışı)"} · {t.members.length} üye · kod {t.code}
                      {t.members.some((m) => m.hidden > 0) && ` · sekme gizlendi: ${t.members.reduce((a, m) => a + m.hidden, 0)}`}
                    </div>
                  </div>
                  <span aria-label={t.locked ? "Kilitlendi" : t.answered ? "Cevap gönderildi" : "Cevap yok"}>{t.locked ? "🔒" : t.answered ? "✎" : "…"}</span>
                </div>
                {t.answerValue !== null && (
                  <p style={{ margin: ".4rem 0 0 3.4rem" }}>
                    Cevap: <strong>{t.answerValue}</strong>
                    {t.result && <> · {t.result.correct ? "doğru" : "yanlış"}{t.override !== null && " (host düzeltti)"}</>}
                  </p>
                )}
                <div style={{ display: "flex", gap: ".5rem", margin: ".5rem 0 0 3.4rem", flexWrap: "wrap" }}>
                  {["question_locked", "answer_reveal", "scoreboard"].includes(view.phase) && (
                    <>
                      <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "override", teamId: t.id, correct: true })}>Doğru say</button>
                      <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "override", teamId: t.id, correct: false })}>Yanlış say</button>
                    </>
                  )}
                  <button className="btn btn-ghost" disabled={busy} onClick={() => confirm(`${t.name} takımı atılsın mı?`) && act({ type: "kick", teamId: t.id })}>Takımı at</button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="alan" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <QR text={joinUrl} size={120} label="Katılım QR kodu" />
        <div>
          <p style={{ margin: 0 }}>Oyuncu bağlantısı: <strong>{joinUrl}</strong></p>
          <p style={{ margin: ".4rem 0" }}><a href={tvUrl} target="_blank" rel="noreferrer" style={{ color: "var(--lamba)" }}>TV ekranını aç</a> · <a href={`${tvUrl}&basit=1`} target="_blank" rel="noreferrer" style={{ color: "var(--lamba)" }}>Basit TV modu</a></p>
          <p style={{ margin: 0, fontSize: ".95rem", opacity: .85 }}>Telefonlar sadece cevap içindir.</p>
        </div>
      </section>

      {err && <p role="alert" style={{ color: "#ffb4a6", margin: 0 }}>{err}</p>}

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: ".75rem 1rem calc(.75rem + env(safe-area-inset-bottom))", background: "var(--cuha-deep)", display: "flex", gap: ".6rem", justifyContent: "center" }}>
        {view.phase === "question_open" && <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "extend", ms: 10000 })}>+10 sn</button>}
        <button className="btn" style={{ flex: 1, maxWidth: 420, minHeight: 56, fontSize: "1.2rem" }} disabled={busy || done} onClick={() => act({ type: "advance" })}>{NEXT_LABEL[view.phase]}</button>
      </div>
    </main>
  );
}
