"use client";
import { ROUND_NAME, ROUND_RULE, type RevealEntry } from "@/lib/roundInfo";
import { RevealList } from "@/components/RevealList";
import { announceGameLang } from "@/components/I18n";
import { use, useEffect, useMemo, useState } from "react";
import { Pul } from "@/components/Pul";
import { QR } from "@/components/QR";
import { Sure } from "@/components/Sure";
import { dingSound } from "@/lib/client/sound";
import { post, useGameStream } from "@/lib/client/useGameStream";
import { PHASE_LABEL } from "@/lib/engine/machine";
import type { Phase } from "@/lib/engine/types";

interface HostTeam {
  id: string; code: string; name: string; color: string; emoji: string; captainId: string;
  members: { id: string; nickname: string; online: boolean; hidden: number }[];
  answered: boolean; locked: boolean; wager: number | null; joker: boolean; answerValue: string | null;
  result: { correct: boolean; gained: number } | null; override: boolean | null;
}
interface HostView {
  serverNow: number; id: string; tvToken: string; code: string; phase: Phase; mode: string; openedAt: number | null; deadline: number | null; paused: boolean; autoHost: boolean; kicked?: boolean; otherHostActive?: boolean; voided: boolean;
  allowedModes: string[]; settings: { points: number; wrongPenalty: number; durationMs: number; lockFirst: boolean; teamMax: number; teamMode: string; individualAgg: string; speedBonus: boolean };
  question: null | { index: number; total: number; text: string | null; correct?: string; round: string; roundLabel: string; reveal?: RevealEntry[] | null };
  teams: { id: string; score: number; rank: number }[];
  teamDetails: HostTeam[]; coach: { do: string; say: string }; answeredCount: number;
  appeals: { id: string; teamId: string; team: string; note: string }[];
}

const NEXT_LABEL: Record<Phase, string> = {
  lobby: "Oyunu başlat", round_intro: "Soruyu aç", question_open: "Süreyi bitir", question_locked: "Cevabı göster",
  answer_reveal: "Skoru göster", scoreboard: "Sonraki soru", final: "Oyun bitti",
};
const MODES: Record<string, string> = { captain: "Kaptan", majority: "Çoğunluk", individual: "Bireysel" };

export default function HostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [device, setDevice] = useState("");
  const [origin, setOrigin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sound, setSound] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => {
    setOrigin(location.origin);
    try {
      let d = localStorage.getItem("device"); if (!d) { d = crypto.randomUUID().slice(0, 12); localStorage.setItem("device", d); }
      setDevice(d); setNote(localStorage.getItem(`note:${id}`) ?? "");
    } catch { setDevice(Math.random().toString(36).slice(2, 12)); }
    const q = new URLSearchParams(location.search).get("t");
    if (q) { try { localStorage.setItem(`host:${id}`, q); } catch {} setToken(q); history.replaceState(null, "", location.pathname); return; }
    try { setToken(localStorage.getItem(`host:${id}`)); } catch { setToken(null); }
  }, [id]);
  const extra = useMemo(() => (device ? `&device=${device}` : ""), [device]);
  const { view, connected, serverNow } = useGameStream<HostView>(id, "host", device ? token : null, extra);
  useEffect(() => { announceGameLang((view as { lang?: "tr" | "en" } | null)?.lang); }, [(view as { lang?: string } | null)?.lang]);
  const [prevPhase, setPrevPhase] = useState<Phase | null>(null);
  useEffect(() => { if (view && sound && prevPhase !== view.phase && view.phase === "answer_reveal") dingSound(); if (view) setPrevPhase(view.phase); }, [view, sound]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (action: unknown) => {
    if (!token) return;
    setBusy(true); setErr("");
    try { await post(id, { role: "host", token, action }); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  if (!token) return <main style={{ padding: "1.5rem" }}><p>Host yetkisi bulunamadı. Oyunu bu cihazdan oluştur.</p><a className="btn" href="/">Ana sayfa</a></main>;
  if (!view) return <main style={{ padding: "1.5rem" }}><p>Bağlanıyor…</p></main>;
  if (view.kicked) return <main style={{ padding: "1.5rem" }}><h1 style={{ fontSize: "2rem" }}>Başka bir cihaz bağlandı</h1><p>Planında en fazla {1} host cihazı var. Bu cihaz salt okunur.</p></main>;

  const joinUrl = `${origin}/j/${view.code}`;
  const tvUrl = `${origin}/tv/${id}?t=${view.tvToken}`;
  const done = view.phase === "final";
  const inQ = view.phase === "question_open" || view.phase === "question_locked";

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "1rem 1rem 7rem", display: "grid", gap: "1.25rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: ".5rem", flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "2rem" }}>Host · {view.code}</h1>
        <span>{connected ? PHASE_LABEL[view.phase] : "Bağlantı koptu, yeniden bağlanıyor"}{view.paused ? " · duraklatıldı" : ""}</span>
      </header>
      {view.otherHostActive && <p role="status" className="fis" style={{ margin: 0 }}>Bu oyunu başka bir cihaz da yönetiyor. Aynı anda iki kişi ilerletmesin.</p>}

      <section className="fis" aria-label="Host Coach">
        <p style={{ margin: 0, fontWeight: 700 }}>Şimdi: {view.coach.do}</p>
        <p style={{ margin: ".35rem 0 0" }}>Söyle: “{view.coach.say}”</p>
      </section>

      {view.question && view.phase !== "lobby" && (
        <section className="alan">
          <p style={{ margin: 0, opacity: .8 }}>Soru {view.question.index + 1}/{view.question.total} · {view.question.roundLabel} · mod: {MODES[view.mode] ?? view.mode}{view.question.round !== "all" ? ` · ${ROUND_NAME[view.question.round] ?? ""}` : ""}</p>
          <p style={{ margin: ".25rem 0", fontSize: "1.25rem", fontWeight: 700 }}>{view.question.text}</p>
          {ROUND_RULE[view.question.round] && <p style={{ margin: ".25rem 0" }}><strong>{ROUND_NAME[view.question.round]}:</strong> {ROUND_RULE[view.question.round]}</p>}
          <p style={{ margin: 0, color: "var(--lamba)" }}>{view.question.round === "funny" ? "En çok oy alan" : "Doğru cevap"}: {view.question.correct}</p>
          {view.question.reveal && <RevealList entries={view.question.reveal as RevealEntry[]} />}
          <div style={{ marginTop: ".75rem" }}><Sure openedAt={view.openedAt} deadline={view.deadline} active={view.phase === "question_open"} serverNow={serverNow} /></div>
          {view.phase === "question_open" && <p style={{ margin: ".5rem 0 0" }}>{view.answeredCount}/{view.teamDetails.length} takım cevapladı</p>}
          {view.voided && <p role="status" style={{ margin: ".5rem 0 0" }}>Bu soru iptal edildi, puanlar sayılmıyor.</p>}
        </section>
      )}

      {view.appeals.length > 0 && (
        <section className="alan" aria-label="İtiraz kuyruğu">
          <h2 style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>İtirazlar ({view.appeals.length})</h2>
          {view.appeals.map((a) => (
            <div key={a.id} style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap", marginBottom: ".4rem" }}>
              <span style={{ flex: 1 }}>{a.team}{a.note ? `: ${a.note}` : ""}</span>
              <button className="btn" disabled={busy} onClick={() => act({ type: "override", teamId: a.teamId, correct: true })}>Doğru say</button>
              <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "override", teamId: a.teamId, correct: false })}>Reddet</button>
            </div>
          ))}
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
                    <strong>{t.name}</strong> · <span className="tabular">{score} puan</span>{t.joker && " · joker ×2"}{t.wager !== null && ` · bahis ${t.wager}`}
                    <div style={{ fontSize: ".95rem", opacity: .85 }}>
                      Kaptan {cap?.nickname} {cap?.online ? "(bağlı)" : "(çevrimdışı)"} · {t.members.length} üye · kod {t.code}
                      {t.members.some((m) => m.hidden > 0) && ` · sekme gizlendi: ${t.members.reduce((a, m) => a + m.hidden, 0)}`}
                    </div>
                  </div>
                  <span aria-label={t.locked ? "Kilitlendi" : t.answered ? "Cevap gönderildi" : "Cevap yok"}>{t.locked ? "🔒" : t.answered ? "✎" : "…"}</span>
                </div>
                {t.answerValue !== null && (
                  <p style={{ margin: ".4rem 0 0 3.4rem" }}>Cevap: <strong>{t.answerValue.startsWith("[") ? "(sıralama/eşleştirme)" : t.answerValue}</strong>{t.result && <> · {t.result.correct ? "doğru" : "yanlış"} ({t.result.gained >= 0 ? "+" : ""}{t.result.gained}){t.override !== null && " · host düzeltti"}</>}</p>
                )}
                <div style={{ display: "flex", gap: ".5rem", margin: ".5rem 0 0 3.4rem", flexWrap: "wrap" }}>
                  {["question_locked", "answer_reveal", "scoreboard"].includes(view.phase) && (<>
                    <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "override", teamId: t.id, correct: true })}>Doğru say</button>
                    <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "override", teamId: t.id, correct: false })}>Yanlış say</button>
                  </>)}
                  <button className="btn btn-ghost" disabled={busy} onClick={() => { const n = prompt(`${t.name} için yeni ad:`, t.name); if (n) act({ type: "rename", teamId: t.id, name: n }); }}>Yeniden adlandır</button>
                  <button className="btn btn-ghost" disabled={busy} onClick={() => { const d = Number(prompt("Puan farkı (örn. 50 ya da -50):", "0")); const why = d ? prompt("Gerekçe notu:") : null; if (d && why) act({ type: "adjust", teamId: t.id, delta: d, note: why }); }}>Puan düzelt</button>
                  <button className="btn btn-ghost" disabled={busy} onClick={() => confirm(`${t.name} takımı atılsın mı?`) && act({ type: "kick", teamId: t.id })}>Takımı at</button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="alan" aria-label="Ayarlar">
        <h2 style={{ fontSize: "1.5rem", marginBottom: ".5rem" }}>Tur ayarları</h2>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
          <span>Takım modu:</span>
          {Object.keys(MODES).map((m) => (
            <button key={m} className={`btn ${view.settings.teamMode === m ? "" : "btn-ghost"}`} disabled={busy || inQ || !view.allowedModes.includes(m)} onClick={() => act({ type: "mode", mode: m })} title={view.allowedModes.includes(m) ? "" : "Planında yok"}>{MODES[m]}{view.allowedModes.includes(m) ? "" : " (kilitli)"}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".6rem" }}>
          <button className={`btn ${view.autoHost ? "" : "btn-ghost"}`} disabled={busy} onClick={() => act({ type: "auto", on: !view.autoHost })}>Auto-Host: {view.autoHost ? "açık" : "kapalı"}</button>
          <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "pause", on: !view.paused })}>{view.paused ? "Devam et" : "Oturumu duraklat"}</button>
          <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "settings", wrongPenalty: view.settings.wrongPenalty ? 0 : 25 })}>Yanlış ceza: {view.settings.wrongPenalty ? `−${view.settings.wrongPenalty}` : "kapalı"}</button>
          <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "settings", lockFirst: !view.settings.lockFirst })}>İlk cevap kilitlensin: {view.settings.lockFirst ? "evet" : "hayır"}</button>
          <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "settings", individualAgg: view.settings.individualAgg === "avg" ? "sum" : "avg" })}>Bireysel puan: {view.settings.individualAgg === "avg" ? "ortalama" : "toplam"}</button>
          <button className="btn btn-ghost" aria-pressed={sound} onClick={() => setSound((s) => !s)}>Ses: {sound ? "açık" : "kapalı"}</button>
        </div>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginTop: ".6rem" }}>
          {view.phase !== "lobby" && !done && <button className="btn btn-ghost" disabled={busy} onClick={() => { const why = prompt("Bu soru neden hatalı?"); if (why !== null) act({ type: "void", award: false, reason: why }); }}>Bu soru hatalı (puanları iptal et)</button>}
          {view.phase !== "lobby" && !done && <button className="btn btn-ghost" disabled={busy} onClick={() => confirm("Herkese tam puan verilsin mi?") && act({ type: "void", award: true, reason: "hatalı soru, herkese puan" })}>Hatalı soru: herkese puan ver</button>}
          {!done && <button className="btn btn-danger" disabled={busy} onClick={() => confirm("Oyun bitirilsin mi?") && act({ type: "end" })}>Oyunu bitir</button>}
        </div>
        <label style={{ display: "grid", gap: ".3rem", marginTop: ".8rem" }}>Host notu (sadece bu cihazda)
          <textarea className="input" style={{ minHeight: 70, padding: ".5rem" }} value={note} onChange={(e) => { setNote(e.target.value); try { localStorage.setItem(`note:${id}`, e.target.value); } catch {} }} />
        </label>
      </section>

      <section className="alan" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <QR text={joinUrl} size={120} label="Katılım QR kodu" />
        <div>
          <p style={{ margin: 0 }}>Oyuncu bağlantısı: <strong>{joinUrl}</strong></p>
          <p style={{ margin: ".4rem 0" }}><a href={tvUrl} target="_blank" rel="noreferrer" style={{ color: "var(--lamba)" }}>TV ekranını aç</a> · <a href={`${tvUrl}&basit=1`} target="_blank" rel="noreferrer" style={{ color: "var(--lamba)" }}>Basit TV modu</a> · <a href={`${tvUrl}&ses=1`} target="_blank" rel="noreferrer" style={{ color: "var(--lamba)" }}>Sesli TV</a></p>
          <p style={{ margin: ".4rem 0" }}><button className="btn btn-ghost" disabled={busy} onClick={() => confirm("TV bağlantısı yenilensin mi? Eski bağlantı kapanır.") && act({ type: "tv_rotate" })}>TV bağlantısını yenile</button></p>
          <p style={{ margin: ".4rem 0" }}><a href={`/panel/afis?kod=${view.code}`} target="_blank" rel="noreferrer" style={{ color: "var(--lamba)" }}>Afiş ve masa kartı</a></p>
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
