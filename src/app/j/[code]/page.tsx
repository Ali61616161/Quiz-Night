"use client";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { Flip } from "@/components/Flip";
import { Pul } from "@/components/Pul";
import { Sure } from "@/components/Sure";
import { post, useGameStream, useWakeLock } from "@/lib/client/useGameStream";
import { AnswerWidget } from "@/components/AnswerWidget";
import { brandStyle } from "@/lib/client/brandStyle";
import { buzz } from "@/lib/client/sound";
import { makeShareImage, shareOrDownload } from "@/lib/client/share";
import { BRAND } from "@config/brand";
import { TEAM_COLORS, TEAM_EMOJIS } from "@/lib/engine/types";

interface Room { id: string; venueName: string; phase: string; brand: Brand | null; teams: { id: string; name: string; color: string; emoji: string; members: number; full: boolean }[] }
interface Saved { gameId: string; memberToken: string; teamCode: string }
interface Brand { logo: string | null; color1: string; color2: string; font: string; bg: string }
interface PView {
  serverNow: number; venueName: string; phase: string; mode: "captain" | "majority" | "individual"; openedAt: number | null; deadline: number | null;
  brand: Brand | null; watermark: boolean; paused: boolean;
  question: null | { index: number; total: number; category: string; kind: "open" | "choice" | "ordering" | "matching" | "estimate"; round: string; roundNo: number; roundLabel: string;
    text: string | null; image: string | null; options: string[] | null; items: string[] | null; left: string[] | null; right: string[] | null; correct?: string; explanation?: string | null };
  teams: { id: string; rank: number; name: string; color: string; emoji: string; score: number }[];
  me: null | {
    teamId: string; teamCode: string; nickname: string; isCaptain: boolean; captainName: string; captainOnline: boolean; canClaim: boolean;
    members: { id: string; nickname: string; online: boolean; captain: boolean }[];
    answer: { value: string; locked: boolean } | null;
    suggestions: { memberId: string; value: string; nickname: string }[]; votes: Record<string, number>; mySuggestion: string | null;
    wager: number | null; wagerMax: number; jokerAvailable: boolean; jokerActive: boolean;
    result: { correct: boolean; gained: number; fraction?: number } | null; appealed: boolean; voided: boolean;
  };
}

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = use(params);
  const code = rawCode.toUpperCase();
  const key = `player:${code}`;
  const [saved, setSaved] = useState<Saved | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setSaved(JSON.parse(s)); } catch {}
    setReady(true);
  }, [key]);
  if (!ready) return <main style={{ padding: "1.25rem" }}><p>Yükleniyor…</p></main>;
  return saved
    ? <Play saved={saved} onLeave={() => { try { localStorage.removeItem(key); } catch {} setSaved(null); }} />
    : <Join code={code} onJoined={(s) => { try { localStorage.setItem(key, JSON.stringify(s)); } catch {} setSaved(s); }} />;
}

function Join({ code, onJoined }: { code: string; onJoined: (s: Saved) => void }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [notFound, setNotFound] = useState("");
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [teamName, setTeamName] = useState("");
  const [color, setColor] = useState<string>(TEAM_COLORS[0]);
  const [emoji, setEmoji] = useState<string>(TEAM_EMOJIS[0]);
  const [teamRef, setTeamRef] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = () => fetch(`/api/rooms/${code}`).then(async (r) => { const j = await r.json(); r.ok ? setRoom(j) : setNotFound(j.message); }).catch(() => setNotFound("Bağlantı yok. İnterneti kontrol et."));
    load();
    const iv = setInterval(load, 4000);
    return () => clearInterval(iv);
  }, [code]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const body = mode === "create" ? { mode, nickname, teamName, color, emoji } : { mode, nickname, teamRef };
      const r = await fetch(`/api/rooms/${code}/join`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message);
      onJoined({ gameId: j.gameId, memberToken: j.memberToken, teamCode: j.teamCode });
    } catch (e2) { setErr((e2 as Error).message); } finally { setBusy(false); }
  };

  if (notFound) return <main style={{ padding: "1.25rem" }}><h1 style={{ fontSize: "2rem" }}>Oda bulunamadı</h1><p>{notFound}</p></main>;
  const taken = new Set(room?.teams.map((t) => t.color + t.emoji));

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "1.25rem", display: "grid", gap: "1.25rem", ...brandStyle(room?.brand) }}>
      <header>
        <p style={{ margin: 0, opacity: .85 }}>{room?.venueName ?? "…"}</p>
        <h1 style={{ fontSize: "2.4rem" }}>Oyuna katıl · {code}</h1>
      </header>
      <form onSubmit={submit} style={{ display: "grid", gap: "1rem" }}>
        <label style={{ display: "grid", gap: ".3rem" }}>Adın
          <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={20} required autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="next" />
        </label>
        <div role="tablist" style={{ display: "flex", gap: ".5rem" }}>
          <button type="button" role="tab" aria-selected={mode === "create"} className={`btn ${mode === "create" ? "" : "btn-ghost"}`} onClick={() => setMode("create")} style={{ flex: 1 }}>Yeni takım kur</button>
          <button type="button" role="tab" aria-selected={mode === "join"} className={`btn ${mode === "join" ? "" : "btn-ghost"}`} onClick={() => setMode("join")} style={{ flex: 1 }}>Takıma katıl</button>
        </div>

        {mode === "create" ? (
          <>
            <label style={{ display: "grid", gap: ".3rem" }}>Takım adı
              <input className="input" value={teamName} onChange={(e) => setTeamName(e.target.value)} maxLength={24} required autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="send" />
            </label>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ marginBottom: ".4rem" }}>Renk</legend>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: ".4rem" }}>
                {TEAM_COLORS.map((c) => (
                  <button key={c} type="button" aria-label={`Renk ${c}`} aria-pressed={color === c} onClick={() => setColor(c)}
                    style={{ minHeight: 44, borderRadius: "50%", background: c, border: color === c ? "4px solid var(--fildisi)" : "2px solid var(--cuha-deep)", cursor: "pointer" }} />
                ))}
              </div>
            </fieldset>
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ marginBottom: ".4rem" }}>Rozet</legend>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: ".4rem" }}>
                {TEAM_EMOJIS.map((em) => (
                  <button key={em} type="button" aria-label={`Rozet ${em}`} aria-pressed={emoji === em} onClick={() => setEmoji(em)}
                    style={{ minHeight: 44, fontSize: "1.4rem", borderRadius: 10, background: "var(--cuha-deep)", border: emoji === em ? "3px solid var(--lamba)" : "2px solid var(--cuha-line)", cursor: "pointer" }}>{em}</button>
                ))}
              </div>
            </fieldset>
            {taken.has(color + emoji) && <p role="alert" style={{ margin: 0, color: "#ffb4a6" }}>Bu renk ve rozet kullanımda, başka seç.</p>}
            <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}><Pul color={color} emoji={emoji} size={52} /><span>Takımın böyle görünecek.</span></div>
          </>
        ) : (
          <>
            {room?.teams.length ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: ".5rem" }}>
                {room.teams.map((t) => (
                  <li key={t.id}>
                    <button type="button" disabled={t.full} aria-pressed={teamRef === t.id} onClick={() => setTeamRef(t.id)}
                      style={{ width: "100%", minHeight: 52, display: "flex", alignItems: "center", gap: ".7rem", padding: ".4rem .7rem", borderRadius: 10, textAlign: "left", cursor: "pointer", color: "inherit", background: "var(--cuha-deep)", border: teamRef === t.id ? "3px solid var(--lamba)" : "2px solid var(--cuha-line)", font: "inherit" }}>
                      <Pul color={t.color} emoji={t.emoji} size={36} /> <span style={{ flex: 1 }}>{t.name}</span><span>{t.full ? "dolu" : `${t.members} kişi`}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p style={{ margin: 0 }}>Henüz takım yok. Yeni takım kur.</p>}
            <label style={{ display: "grid", gap: ".3rem" }}>Ya da 4 haneli takım kodu
              <input className="input tabular" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={/^\d{4}$/.test(teamRef) ? teamRef : ""} onChange={(e) => setTeamRef(e.target.value)} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="send" />
            </label>
          </>
        )}
        {err && <p role="alert" style={{ margin: 0, color: "#ffb4a6" }}>{err}</p>}
        <button className="btn" disabled={busy || !nickname || (mode === "join" && !teamRef)} style={{ minHeight: 56 }}>{mode === "create" ? "Takımını kur" : "Takıma katıl"}</button>
      </form>
    </main>
  );
}

const newKey = () => crypto.randomUUID();
const ROUND_NAME: Record<string, string> = { all: "", speed: "Hız turu", wager: "Bahis turu", final: "Final sorusu" };

function Play({ saved, onLeave }: { saved: Saved; onLeave: () => void }) {
  const { view, connected, serverNow } = useGameStream<PView>(saved.gameId, "player", saved.memberToken);
  useWakeLock();
  const [draft, setDraft] = useState("");
  const [wagerDraft, setWagerDraft] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const lastQ = useRef(-1);

  useEffect(() => {
    const onVis = () => { if (document.hidden) post(saved.gameId, { role: "player", token: saved.memberToken, action: { type: "heartbeat", hidden: true } }).catch(() => {}); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [saved]);

  const qIndex = view?.question?.index ?? -1;
  useEffect(() => { if (qIndex !== lastQ.current) { lastQ.current = qIndex; setDraft(""); setErr(""); setWagerDraft(""); } }, [qIndex]);

  const act = useCallback(async (action: unknown) => {
    setBusy(true); setErr("");
    try { await post(saved.gameId, { role: "player", token: saved.memberToken, action }); return true; }
    catch (e) { setErr((e as Error).message); return false; }
    finally { setBusy(false); }
  }, [saved]);

  if (!view) return <main style={{ padding: "1.25rem" }}><p>{connected ? "Yükleniyor…" : "Bağlantı koptu, yeniden bağlanıyor"}</p></main>;
  const me = view.me;
  const style = brandStyle(view.brand);
  if (!me) return <main style={{ padding: "1.25rem", ...style }}><p>Takımın bulunamadı (atılmış olabilirsin).</p><button className="btn" onClick={onLeave}>Yeniden katıl</button></main>;
  const team = view.teams.find((t) => t.id === me.teamId);
  const q = view.question;
  const open = view.phase === "question_open";
  const locked = me.answer?.locked ?? false;
  const captainMode = view.mode === "captain";
  const speed = q?.round === "speed";
  const isWager = q?.round === "wager" || q?.round === "final";
  const canLock = captainMode && me.isCaptain;
  const shown = canLock ? (draft || me.answer?.value || "") : (draft || me.mySuggestion || "");
  const inputDisabled = canLock ? locked : false;

  // Cevabı gönder: kaptan modunda kaptan "answer", diğer durumlarda "suggest" (öneri / oy / bireysel cevap)
  const submit = async (v: string, lock: boolean) => {
    if (!v) return;
    const ok = canLock ? await act({ type: "answer", value: v, lock: lock || speed, key: newKey() }) : await act({ type: "suggest", value: v });
    if (ok && (lock || speed) && canLock) buzz();
  };
  const pick = (v: string) => {
    setDraft(v);
    // Tek dokunuşlu biçimlerde (şık, sıralama, eşleştirme) anında gönder; yazılı cevapta gönder düğmesi var
    if (q && q.kind !== "open" && q.kind !== "estimate" && v) submit(v, speed);
  };

  const share = async () => {
    const blob = await makeShareImage({ venue: view.venueName, team: team?.name ?? "", rank: team?.rank ?? 0, score: team?.score ?? 0, color: team?.color ?? "#D64933", emoji: team?.emoji ?? "⚽", total: view.teams.length, bg: view.brand?.color1, accent: view.brand?.color2, app: view.watermark ? BRAND.name : view.venueName });
    await shareOrDownload(blob);
  };

  return (
    <main style={{ minHeight: "100dvh", maxWidth: 560, margin: "0 auto", padding: "1rem", display: "grid", gridTemplateRows: "auto auto 1fr auto", gap: "1rem", ...style }}>
      <header style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
        {view.brand?.logo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={view.brand.logo} alt={view.venueName} height={36} style={{ maxWidth: 80, objectFit: "contain" }} />}
        {team && <span key={locked ? "k" : "a"}><Pul color={team.color} emoji={team.emoji} size={44} drop={locked && open} /></span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong>{team?.name}</strong>
          <div style={{ fontSize: ".95rem", opacity: .85 }}>{view.mode === "individual" ? "Bireysel tur" : me.isCaptain ? "Kaptansın" : `Kaptan: ${me.captainName}`} · kod <span className="tabular">{me.teamCode}</span></div>
        </div>
        <span style={{ fontSize: "1.6rem" }}><Flip value={team?.score ?? 0} simple /></span>
      </header>
      {!connected && <p role="status" style={{ margin: 0, background: "var(--sinyal)", color: "#fff", padding: ".4rem .7rem", borderRadius: 6 }}>Bağlantı koptu, yeniden bağlanıyor</p>}
      {view.paused && <p role="status" style={{ margin: 0, background: "var(--lamba)", color: "var(--murekkep)", padding: ".4rem .7rem", borderRadius: 6 }}>Oyun duraklatıldı.</p>}

      <section aria-live="polite">
        {view.phase === "lobby" && <><h1 style={{ fontSize: "2.2rem" }}>Takımın hazır</h1><p>Oyun başlayınca soru burada görünür. Telefonlar sadece cevap içindir.</p>
          <ul style={{ paddingLeft: "1.1rem" }}>{me.members.map((m) => <li key={m.id}>{m.nickname}{m.captain ? " (kaptan)" : ""}{m.online ? "" : " · çevrimdışı"}</li>)}</ul></>}

        {view.phase === "round_intro" && q && (
          <>
            <h1 style={{ fontSize: "2.4rem" }}>{q.roundLabel || "Hazır ol"}</h1>
            {ROUND_NAME[q.round] && <p style={{ fontSize: "1.2rem" }}>{ROUND_NAME[q.round]}</p>}
            {isWager && (
              <div className="fis">
                <p style={{ margin: 0 }}>Soruyu görmeden bahis yap. En çok {me.wagerMax} puan. Doğruysa kazanırsın, yanlışsa kaybedersin.</p>
                {me.isCaptain ? (
                  <form onSubmit={async (e) => { e.preventDefault(); await act({ type: "wager", amount: Number(wagerDraft) }); }} style={{ display: "flex", gap: ".5rem", marginTop: ".6rem" }}>
                    <input className="input" style={{ color: "var(--fildisi)" }} value={wagerDraft} onChange={(e) => setWagerDraft(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Bahis" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="send" />
                    <button className="btn" disabled={busy || !wagerDraft}>Bahsi gönder</button>
                  </form>
                ) : <p style={{ margin: ".5rem 0 0" }}>Bahsi kaptan girer.</p>}
                {me.wager !== null && <p role="status" style={{ margin: ".5rem 0 0", fontWeight: 700 }}>Bahsin: {me.wager} puan</p>}
              </div>
            )}
          </>
        )}

        {q && q.text && ["question_open", "question_locked", "answer_reveal", "scoreboard"].includes(view.phase) && (
          <>
            <p style={{ margin: 0, opacity: .85 }}>Soru {q.index + 1}/{q.total} · {q.category}{ROUND_NAME[q.round] ? ` · ${ROUND_NAME[q.round]}` : ""}</p>
            <h2 style={{ fontSize: "1.9rem", lineHeight: 1.2, margin: ".4rem 0 .8rem" }}>{q.text}</h2>
            {q.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={q.image} alt="" style={{ maxWidth: "100%", borderRadius: 6, marginBottom: ".6rem" }} loading="lazy" />}
            {open && <Sure openedAt={view.openedAt} deadline={view.deadline} active serverNow={serverNow} />}
            {view.phase === "question_locked" && <p>Süre doldu. Cevap bekleniyor.</p>}
            {(view.phase === "answer_reveal" || view.phase === "scoreboard") && (
              <div className="fis" style={{ marginTop: ".5rem" }}>
                <p style={{ margin: 0 }}>Doğru cevap: <strong>{q.correct}</strong></p>
                {q.explanation && <p style={{ margin: ".3rem 0 0" }}>{q.explanation}</p>}
                <p style={{ margin: ".5rem 0 0", fontWeight: 700 }}>
                  {me.voided ? "Bu soru hatalı bulundu, puanlar iptal." : me.result ? (view.mode === "individual" && me.result.fraction !== undefined ? `Takımın %${Math.round(me.result.fraction * 100)} doğru, ${me.result.gained} puan.` : me.result.correct ? `✔ Takımın doğru bildi, ${me.result.gained} puan.` : `✘ Takımın bilemedi${me.result.gained < 0 ? `, ${me.result.gained} puan` : ""}.`) : ""}
                  {team && ` Sıran: ${team.rank}.`}
                </p>
                {!me.appealed && !me.voided && !(me.result?.correct) && <button className="btn btn-ghost" style={{ color: "var(--murekkep)", borderColor: "var(--murekkep)", marginTop: ".5rem" }} disabled={busy} onClick={() => act({ type: "appeal", note: "" })}>İtiraz et</button>}
                {me.appealed && <p role="status" style={{ margin: ".5rem 0 0" }}>İtirazın host’a iletildi.</p>}
              </div>
            )}
          </>
        )}

        {view.phase === "final" && (
          <>
            <h1 style={{ fontSize: "2.4rem" }}>Bu gece {view.venueName} sundu</h1>
            <p style={{ fontSize: "1.2rem" }}>Takımın {team?.rank}. sırada, {team?.score} puan.</p>
            <ol style={{ paddingLeft: "1.2rem" }}>{view.teams.slice(0, 5).map((t) => <li key={t.id}>{t.emoji} {t.name} · {t.score}</li>)}</ol>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              <button className="btn" onClick={share}>Sonucu paylaş</button>
              <button className="btn btn-ghost" onClick={onLeave}>Çık</button>
            </div>
          </>
        )}
        {me.canClaim && view.phase !== "final" && view.mode === "captain" && (
          <p style={{ margin: ".8rem 0" }}>Kaptan bağlı değil. <button className="btn" disabled={busy} onClick={() => act({ type: "claim_captain" })}>Kaptanlığı al</button></p>
        )}
        {me.isCaptain && me.members.length > 1 && view.phase !== "final" && view.phase !== "question_open" && (
          <details style={{ marginTop: ".6rem" }}><summary style={{ cursor: "pointer", minHeight: 44 }}>Kaptanlığı devret</summary>
            <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginTop: ".4rem" }}>
              {me.members.filter((m) => !m.captain).map((m) => <button key={m.id} className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "handover", to: m.id })}>{m.nickname}</button>)}
            </div>
          </details>
        )}
      </section>

      {q && q.text && open ? (
        <section style={{ display: "grid", gap: ".6rem", paddingBottom: "env(safe-area-inset-bottom)" }}>
          {captainMode && me.isCaptain && me.suggestions.length > 0 && (
            <div className="alan">
              <p style={{ margin: "0 0 .4rem" }}>Takım önerileri:</p>
              <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                {me.suggestions.map((s) => <button key={s.memberId} className="btn btn-ghost" disabled={locked} onClick={() => (q.kind === "choice" ? submit(s.value, false) : setDraft(s.value))}>{s.nickname}: {s.value.startsWith("[") ? "sıralama" : s.value}</button>)}
              </div>
            </div>
          )}
          {view.mode === "majority" && Object.keys(me.votes).length > 0 && <p style={{ margin: 0 }}>Takım oyları: {Object.entries(me.votes).map(([k, n]) => `${k.startsWith("[") ? "sıralama" : k} (${n})`).join(" · ")}</p>}
          <AnswerWidget key={qIndex} q={q} value={shown} disabled={inputDisabled || (view.mode !== "captain" ? false : false)} onValue={pick} commitOnPick />
          <div style={{ display: "flex", gap: ".5rem" }}>
            {(q.kind === "open" || q.kind === "estimate") && <button className="btn btn-ghost" disabled={busy || inputDisabled || !draft} onClick={() => submit(draft, false)}>{canLock ? "Cevabı gönder" : view.mode === "majority" ? "Oyumu gönder" : view.mode === "individual" ? "Cevabımı gönder" : "Öneriyi gönder"}</button>}
            {canLock && !speed && <button className="btn" style={{ flex: 1, minHeight: 56 }} disabled={busy || locked || !shown} onClick={() => submit(shown, true)}>{locked ? "Cevap kilitlendi" : "Cevabı kilitle"}</button>}
            {me.isCaptain && me.jokerAvailable && !me.jokerActive && !locked && <button className="btn btn-ghost" disabled={busy} onClick={() => act({ type: "joker" })}>Joker</button>}
          </div>
          {me.jokerActive && <p role="status" style={{ margin: 0 }}>Joker açık: bu soruda puan ×2.</p>}
          {locked && <p role="status" style={{ margin: 0 }}>Cevap kilitlendi, değişiklik yapılamaz.</p>}
          {!locked && canLock && me.answer && <p role="status" style={{ margin: 0 }}>Cevap gönderildi. Kilitleyene kadar değiştirebilirsin.</p>}
          {!canLock && me.mySuggestion && <p role="status" style={{ margin: 0 }}>{view.mode === "individual" ? "Cevabın kaydedildi." : view.mode === "majority" ? "Oyun kaydedildi." : "Önerin kaptana gitti."} Süre bitene kadar değiştirebilirsin.</p>}
          {err && <p role="alert" style={{ margin: 0, color: "#ffb4a6" }}>{err}</p>}
        </section>
      ) : <div>{err && <p role="alert" style={{ color: "#ffb4a6" }}>{err}</p>}{view.watermark && <p style={{ opacity: .6, fontSize: ".85rem" }}>{BRAND.name}</p>}</div>}
    </main>
  );
}
