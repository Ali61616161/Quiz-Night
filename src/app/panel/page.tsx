"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Pul } from "@/components/Pul";
import { api } from "@/lib/client/api";
import { brandStyle } from "@/lib/client/brandStyle";
import { contrast, suggestDarker } from "@/lib/brand";
import { PLANS, yearlyPrice, type PlanId } from "@config/plans";

interface Info {
  id: string; name: string; plan: PlanId; planName: string; status: string; email: string; features: string[];
  brand: { logo: string | null; color1: string; color2: string; font: string; bg: string }; hasLogo: boolean;
  aiQuota: number; aiUsed: number; seenCount: number;
  schedules: { id: string; title: string; weekday: number; time: string }[];
  history: { gameId: string; at: number; teams: number; players: number; winner: string }[];
}
const TABS = ["Oyun", "Sorular", "Takvim", "İstatistik", "Lig", "Marka", "Abonelik", "Destek"] as const;
type Tab = (typeof TABS)[number];
const DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

export default function Panel() {
  const r = useRouter();
  const [info, setInfo] = useState<Info | null>(null);
  const [tab, setTab] = useState<Tab>("Oyun");
  const [msg, setMsg] = useState("");
  const load = useCallback(() => api<Info>("/api/venue/info").then(setInfo).catch((e) => { if (e.status === 401) r.push("/giris"); }), [r]);
  useEffect(() => { load(); }, [load]);
  if (!info) return <main style={{ padding: "1.25rem" }}><p>Yükleniyor…</p></main>;
  const has = (f: string) => info.features.includes(f);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 4000); };
  const props = { info, has, flash, reload: load };
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "1rem 1rem 4rem", display: "grid", gap: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: ".5rem" }}>
        <div><h1 style={{ fontSize: "2.2rem" }}>{info.name}</h1><span>{info.planName} planı{info.status === "past_due" && " · ödeme bekliyor"}{info.status === "canceled" && " · iptal edildi"}</span></div>
        <button className="btn btn-ghost" onClick={async () => { await api("/api/auth/logout", {}); r.push("/"); }}>Çıkış</button>
      </header>
      <nav aria-label="Panel" style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
        {TABS.map((t) => <button key={t} className={`btn ${tab === t ? "" : "btn-ghost"}`} aria-pressed={tab === t} onClick={() => setTab(t)}>{t}</button>)}
      </nav>
      {msg && <p role="status" className="fis" style={{ margin: 0 }}>{msg}</p>}
      {tab === "Oyun" && <GameTab {...props} />}
      {tab === "Sorular" && <QuestionsTab {...props} />}
      {tab === "Takvim" && <ScheduleTab {...props} />}
      {tab === "İstatistik" && <StatsTab {...props} />}
      {tab === "Lig" && <LeagueTab {...props} />}
      {tab === "Marka" && <BrandTab {...props} />}
      {tab === "Abonelik" && <BillingTab {...props} />}
      {tab === "Destek" && <SupportTab {...props} />}
    </main>
  );
}
type P = { info: Info; has: (f: string) => boolean; flash: (m: string) => void; reload: () => void };

function Locked({ plan, text }: { plan: string; text: string }) { return <p className="fis" style={{ margin: 0 }}>{text} <strong>{plan}</strong> planında açılır. Abonelik sekmesinden yükselt. Veriler silinmez.</p>; }

function GameTab({ info, has, flash }: P) {
  const [template, setTemplate] = useState("classic"); const [theme, setTheme] = useState(""); const [mode, setMode] = useState("captain"); const [auto, setAuto] = useState(false); const [dur, setDur] = useState(30);
  const [busy, setBusy] = useState(false);
  const start = async () => {
    setBusy(true);
    try {
      const j = await api<{ id: string; hostToken: string; poolLow: boolean }>("/api/games", { template, theme: template === "themed" ? theme || "futbol" : undefined, teamMode: mode, autoHost: auto, durationSec: dur });
      if (j.poolLow) flash("Soru havuzu azalıyor: yeni soru ekle ya da AI ile üret.");
      location.href = `/host/${j.id}?t=${encodeURIComponent(j.hostToken)}`;
    } catch (e) { flash((e as Error).message); setBusy(false); }
  };
  return (
    <section style={{ display: "grid", gap: ".8rem" }}>
      <h2 style={{ fontSize: "1.6rem" }}>Gece şablonu</h2>
      <div style={{ display: "grid", gap: ".5rem" }}>
        {[["classic", "Klasik gece", "5 tur karışık konu + tahmin + final bahis sorusu"], ["themed", "Tematik gece", "Tek konu seç: 14 konudan biri"], ["quick", "Hızlı gece (45 dk)", "3 tur, hız turu dahil"], ["bilbakalim", "Bil Bakalım turu", "Kısa ve hızlı tek tur"]].map(([id, n, d]) => (
          <button key={id} className={`btn ${template === id ? "" : "btn-ghost"}`} style={{ justifyContent: "flex-start", textAlign: "left", flexDirection: "column", alignItems: "flex-start", padding: ".6rem 1rem" }} aria-pressed={template === id} onClick={() => setTemplate(id)}><strong>{n}</strong><span style={{ fontWeight: 400 }}>{d}</span></button>
        ))}
      </div>
      {template === "themed" && <label>Tema<select className="input" value={theme} onChange={(e) => setTheme(e.target.value)}>{[["cografya", "Coğrafya"], ["tarih", "Tarih"], ["bilim", "Bilim"], ["futbol", "Futbol"], ["spor", "Spor"], ["dizifilm", "Dizi/Film"], ["muzik", "Müzik"], ["edebiyat", "Edebiyat"], ["sanat", "Sanat"], ["yemek", "Yemek"], ["oyun", "Oyun"], ["kampus", "Üniversite hayatı"], ["yerel", "Yerel (şehir ve İstanbul)"], ["genel", "Genel kültür"], ["2000ler", "Eğlence karması"]].map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>}
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", alignItems: "center" }}>
        <span>Takım modu:</span>
        {[["captain", "Kaptan", true], ["individual", "Bireysel", has("mode_individual")], ["majority", "Çoğunluk", has("mode_majority")]].map(([v, n, ok]) => <button key={String(v)} className={`btn ${mode === v ? "" : "btn-ghost"}`} disabled={!ok} onClick={() => setMode(String(v))}>{String(n)}{ok ? "" : " (kilitli)"}</button>)}
      </div>
      <label>Soru süresi (sn)<input className="input" type="number" min={10} max={120} value={dur} onChange={(e) => setDur(Number(e.target.value))} /></label>
      <label style={{ display: "flex", gap: ".5rem", alignItems: "center", minHeight: 44 }}><input type="checkbox" checked={auto} disabled={!has("auto_host")} onChange={(e) => setAuto(e.target.checked)} style={{ width: 22, height: 22 }} /> Auto-Host (süre, kilit, açıklama ve geçiş otomatik){!has("auto_host") && " · Başlangıç planında"}</label>
      <button className="btn" style={{ minHeight: 56 }} onClick={start} disabled={busy}>Geceyi başlat</button>
      <p style={{ margin: 0, opacity: .85 }}>Bu mekanda {info.seenCount} soru görüldü; tekrar çıkmaz.</p>
      {info.history.length > 0 && <><h2 style={{ fontSize: "1.4rem" }}>Son geceler</h2><ul style={{ paddingLeft: "1.1rem", margin: 0 }}>{info.history.map((h) => <li key={h.gameId}>{new Date(h.at).toLocaleDateString("tr-TR")} · {h.teams} takım, {h.players} oyuncu · kazanan: {h.winner}</li>)}</ul></>}
    </section>
  );
}

function QuestionsTab({ info, has, flash, reload }: P) {
  const [data, setData] = useState<{ custom: { id: string; text: string; category: string; kind: string }[]; drafts: { id: string; text: string; correct: string; category: string }[] } | null>(null);
  const [f, setF] = useState({ category: "Genel Kültür", text: "", correct: "", options: "", accepted: "" });
  const [csv, setCsv] = useState(""); const [ai, setAi] = useState({ category: "Tarih", difficulty: 2, count: 5, theme: "" });
  const load = useCallback(() => api<typeof data>("/api/venue/questions").then(setData), []);
  useEffect(() => { load(); }, [load]);
  const run = async (fn: () => Promise<unknown>, ok: string) => { try { await fn(); flash(ok); load(); reload(); } catch (e) { flash((e as Error).message); } };
  const cats = ["Futbol", "Dizi/Film", "Müzik", "Genel Kültür", "Tarih", "Coğrafya", "Bilim", "Yemek", "Güncel", "Oyun", "Üniversite/Kampüs", "Yerel"];
  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <h2 style={{ fontSize: "1.6rem" }}>Kendi sorum</h2>
      {!has("own_packs_play") && <Locked plan="Başlangıç" text="Kendi soruların oyunda kullanılması" />}
      <form style={{ display: "grid", gap: ".5rem" }} onSubmit={(e) => { e.preventDefault(); const opts = f.options.split(";").map((x) => x.trim()).filter(Boolean); run(() => api("/api/venue/question", { category: f.category, kind: opts.length ? "choice" : "open", text: f.text, options: opts.length ? opts : undefined, correct: f.correct, accepted: f.accepted.split(";").map((x) => x.trim()).filter(Boolean) }), "Soru eklendi."); setF({ ...f, text: "", correct: "", options: "", accepted: "" }); }}>
        <select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{cats.map((c) => <option key={c}>{c}</option>)}</select>
        <input className="input" placeholder="Soru metni" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} required minLength={8} maxLength={300} />
        <input className="input" placeholder="Doğru cevap" value={f.correct} onChange={(e) => setF({ ...f, correct: e.target.value })} required />
        <input className="input" placeholder="4 şık, noktalı virgülle (boşsa açık uçlu)" value={f.options} onChange={(e) => setF({ ...f, options: e.target.value })} />
        <input className="input" placeholder="Kabul edilen alternatifler (noktalı virgülle)" value={f.accepted} onChange={(e) => setF({ ...f, accepted: e.target.value })} />
        <button className="btn">Soruyu ekle</button>
      </form>

      <h2 style={{ fontSize: "1.6rem" }}>Toplu yükleme (CSV)</h2>
      {!has("bulk_csv") ? <Locked plan="Pro" text="Toplu CSV yükleme" /> : (
        <div style={{ display: "grid", gap: ".5rem" }}>
          <textarea className="input" style={{ minHeight: 110, padding: ".5rem" }} placeholder={"category,difficulty,text,options,correct,accepted,explanation\nTarih,2,Soru metni?,A;B;C;D,A,,"} value={csv} onChange={(e) => setCsv(e.target.value)} />
          <button className="btn" onClick={() => run(async () => { const r = await api<{ added: number; errors: string[] }>("/api/venue/bulk", { csv }); if (r.errors.length) flash(`${r.added} eklendi. Hatalar: ${r.errors.join(" | ")}`); else flash(`${r.added} soru eklendi.`); setCsv(""); }, "")}>CSV’yi yükle</button>
        </div>
      )}

      <h2 style={{ fontSize: "1.6rem" }}>AI ile soru taslağı</h2>
      {info.aiQuota === 0 ? <Locked plan="Başlangıç" text="AI soru üretimi" /> : (
        <div style={{ display: "grid", gap: ".5rem" }}>
          <p style={{ margin: 0 }}>Bu ay {info.aiUsed}/{info.aiQuota} soru üretildi. Taslaklar sen onaylamadan oyuna girmez.</p>
          <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
            <select className="input" style={{ width: "auto" }} value={ai.category} onChange={(e) => setAi({ ...ai, category: e.target.value })}>{cats.map((c) => <option key={c}>{c}</option>)}</select>
            <select className="input" style={{ width: "auto" }} value={ai.difficulty} onChange={(e) => setAi({ ...ai, difficulty: Number(e.target.value) })}>{[1, 2, 3].map((d) => <option key={d} value={d}>Zorluk {d}</option>)}</select>
            <input className="input" style={{ width: 90 }} type="number" min={1} max={25} value={ai.count} onChange={(e) => setAi({ ...ai, count: Number(e.target.value) })} aria-label="Adet" />
            <input className="input" style={{ flex: 1, minWidth: 160 }} placeholder="Tema (isteğe bağlı)" value={ai.theme} onChange={(e) => setAi({ ...ai, theme: e.target.value })} />
          </div>
          <button className="btn" onClick={() => run(async () => { const r = await api<{ added: number; rejected: number; duplicates: number }>("/api/venue/ai", { ...ai, theme: ai.theme || undefined }); flash(`${r.added} taslak eklendi (${r.rejected} geçersiz, ${r.duplicates} mükerrer elendi).`); }, "")}>Taslak üret</button>
        </div>
      )}
      {data && data.drafts.length > 0 && <><h3 style={{ fontSize: "1.3rem" }}>Onay bekleyen taslaklar</h3>{data.drafts.map((d) => (
        <div key={d.id} style={{ display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap", borderTop: "1px solid var(--cuha-line)", paddingTop: ".5rem" }}>
          <span style={{ flex: 1 }}>{d.text} <em>→ {d.correct}</em></span>
          <button className="btn" onClick={() => run(() => api("/api/venue/draft_approve", { id: d.id }), "Onaylandı.")}>Onayla</button>
          <button className="btn btn-ghost" onClick={() => run(() => api("/api/venue/draft_reject", { id: d.id }), "Silindi.")}>Sil</button>
        </div>))}</>}
      {data && <><h3 style={{ fontSize: "1.3rem" }}>Sorularım ({data.custom.length})</h3>{data.custom.map((q) => <div key={q.id} style={{ display: "flex", gap: ".5rem", alignItems: "center" }}><span style={{ flex: 1 }}>{q.category} · {q.text}</span><button className="btn btn-ghost" onClick={() => run(() => api("/api/venue/question_delete", { id: q.id }), "Silindi.")}>Sil</button></div>)}</>}
    </section>
  );
}

function ScheduleTab({ info, flash, reload }: P) {
  const [f, setF] = useState({ title: "Salı quiz gecesi", weekday: 2, time: "20:30", remindEmail: true });
  return (
    <section style={{ display: "grid", gap: ".6rem" }}>
      <h2 style={{ fontSize: "1.6rem" }}>Tekrarlayan geceler</h2>
      <ul style={{ paddingLeft: "1.1rem", margin: 0 }}>{info.schedules.map((s) => <li key={s.id}>Her {DAYS[s.weekday]} {s.time} · {s.title} <button className="btn btn-ghost" onClick={async () => { await api("/api/venue/schedule_delete", { id: s.id }); reload(); }}>Sil</button></li>)}{!info.schedules.length && <li>Henüz kayıt yok.</li>}</ul>
      <form style={{ display: "grid", gap: ".5rem" }} onSubmit={async (e) => { e.preventDefault(); try { await api("/api/venue/schedule", f); flash("Takvime eklendi. Hatırlatma e-postası bir gün önce gelir."); reload(); } catch (e2) { flash((e2 as Error).message); } }}>
        <input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
        <select className="input" value={f.weekday} onChange={(e) => setF({ ...f, weekday: Number(e.target.value) })}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select>
        <input className="input" type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} required />
        <label style={{ display: "flex", gap: ".5rem", minHeight: 44, alignItems: "center" }}><input type="checkbox" checked={f.remindEmail} onChange={(e) => setF({ ...f, remindEmail: e.target.checked })} style={{ width: 22, height: 22 }} /> Hatırlatma e-postası gönder</label>
        <button className="btn">Takvime ekle</button>
      </form>
      <p style={{ margin: 0 }}><a href="/panel/afis" style={{ color: "var(--lamba)" }}>Afiş ve masa kartı hazırla</a></p>
    </section>
  );
}

function StatsTab({ has }: P) {
  const [s, setS] = useState<{ games: number; teamsTotal: number; playersTotal: number; avgCorrect: number; returning: number; hardest: { id: string; text: string; rate: number }[]; easiest: { id: string; text: string; rate: number }[] } | null>(null);
  useEffect(() => { if (has("stats")) api<typeof s>("/api/venue/stats").then(setS).catch(() => {}); }, [has]);
  if (!has("stats")) return <Locked plan="Pro" text="İstatistikler" />;
  if (!s) return <p>Yükleniyor…</p>;
  return (
    <section style={{ display: "grid", gap: ".6rem" }}>
      <h2 style={{ fontSize: "1.6rem" }}>İstatistikler</h2>
      <p style={{ margin: 0 }}>{s.games} gece · {s.teamsTotal} takım · {s.playersTotal} oyuncu · ortalama doğru oranı %{Math.round(s.avgCorrect * 100)} · geri dönen takım: {s.returning}</p>
      <h3 style={{ fontSize: "1.3rem" }}>En zor sorular</h3><ul style={{ margin: 0, paddingLeft: "1.1rem" }}>{s.hardest.map((q) => <li key={q.id}>%{Math.round(q.rate * 100)} · {q.text}</li>)}</ul>
      <h3 style={{ fontSize: "1.3rem" }}>En kolay sorular</h3><ul style={{ margin: 0, paddingLeft: "1.1rem" }}>{s.easiest.map((q) => <li key={q.id}>%{Math.round(q.rate * 100)} · {q.text}</li>)}</ul>
    </section>
  );
}

function LeagueTab({ has, flash }: P) {
  const [d, setD] = useState<{ season: number; table: { rank: number; name: string; points: number; played: number; wins: number }[]; seasons: { season: number; champion: string; points: number }[] } | null>(null);
  const load = useCallback(() => api<typeof d>("/api/venue/league").then(setD).catch(() => {}), []);
  useEffect(() => { if (has("league")) load(); }, [has, load]);
  if (!has("league")) return <Locked plan="Marka" text="Lig ve sezon tablosu" />;
  if (!d) return <p>Yükleniyor…</p>;
  return (
    <section style={{ display: "grid", gap: ".6rem" }}>
      <h2 style={{ fontSize: "1.6rem" }}>Sezon {d.season}</h2>
      <p style={{ margin: 0 }}>Takımlar ad ile tanınır. Her gece: 1. sıra 10, 2. sıra 7, 3. sıra 5, 4. sıra 3, 5. sıra 2, diğerleri 1 puan.</p>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: ".3rem" }}>{d.table.map((t) => <li key={t.name} style={{ display: "flex", gap: ".8rem", borderTop: "1px solid var(--cuha-line)", paddingTop: ".3rem" }}><span className="display tabular" style={{ width: "1.5em", color: "var(--lamba)" }}>{t.rank}</span><span style={{ flex: 1 }}>{t.name}</span><span className="tabular">{t.points} puan · {t.played} gece · {t.wins} birincilik</span></li>)}{!d.table.length && <li>Henüz gece oynanmadı.</li>}</ol>
      <button className="btn btn-ghost" onClick={async () => { if (confirm("Sezon kapatılsın ve tablo sıfırlansın mı?")) { await api("/api/venue/league_close", {}); flash("Sezon kapatıldı."); load(); } }}>Sezonu kapat</button>
      {d.seasons.length > 0 && <><h3 style={{ fontSize: "1.3rem" }}>Geçmiş sezonlar</h3><ul style={{ margin: 0, paddingLeft: "1.1rem" }}>{d.seasons.map((s) => <li key={s.season}>Sezon {s.season}: {s.champion} ({s.points} puan)</li>)}</ul></>}
    </section>
  );
}

function BrandTab({ info, has, flash, reload }: P) {
  const [b, setB] = useState(info.brand);
  const c = contrast(b.color1, "#EDE4D0");
  const bad = c < 4.5;
  if (!has("branding")) return <Locked plan="Marka" text="Mekan adı, logo, renk ve yazı tipi özelleştirme" />;
  const upload = async (file: File) => {
    const r = await fetch("/api/venue/logo", { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: file });
    const j = await r.json(); flash(r.ok ? "Logo yüklendi." : j.message); reload();
  };
  const bs = brandStyle({ ...b, logo: info.hasLogo ? `/api/venues/${info.id}/logo` : null });
  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <h2 style={{ fontSize: "1.6rem" }}>Marka ayarları</h2>
      <div style={{ display: "grid", gap: ".6rem", maxWidth: 420 }}>
        <label>Ana renk (zemin)<input type="color" className="input" value={b.color1} onChange={(e) => setB({ ...b, color1: e.target.value })} /></label>
        <label>Vurgu rengi<input type="color" className="input" value={b.color2} onChange={(e) => setB({ ...b, color2: e.target.value })} /></label>
        <label>Başlık yazı tipi<select className="input" value={b.font} onChange={(e) => setB({ ...b, font: e.target.value })}>{[["varsayilan", "Stadyum (varsayılan)"], ["serif", "Serif"], ["mono", "Daktilo"], ["yuvarlak", "Yuvarlak"]].map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>
        <label>Logo (PNG, SVG, WebP, en fazla 1 MB)<input className="input" type="file" accept="image/png,image/svg+xml,image/webp" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} style={{ padding: ".6rem" }} /></label>
        {bad && <p role="alert" style={{ margin: 0, color: "#ffb4a6" }}>Kontrast düşük ({c.toFixed(1)}:1, en az 4,5). Önerilen: <button className="btn btn-ghost" onClick={() => setB({ ...b, color1: suggestDarker(b.color1) })}>{suggestDarker(b.color1)} uygula</button></p>}
        <button className="btn" disabled={bad} onClick={async () => { try { await api("/api/venue/brand", { color1: b.color1, color2: b.color2, font: b.font, bg: b.bg }); flash("Marka kaydedildi."); reload(); } catch (e) { flash((e as Error).message); } }}>Kaydet</button>
      </div>
      <h3 style={{ fontSize: "1.3rem" }}>Canlı önizleme</h3>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ ...bs, width: 400, aspectRatio: "16/9", padding: 14, borderRadius: 6, display: "grid", gap: 6, fontSize: 14 }} aria-label="TV önizleme">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{info.hasLogo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`/api/venues/${info.id}/logo`} alt="" height={22} />}<strong className="display" style={{ fontSize: 22 }}>{info.name}</strong></div>
          <div className="fis" style={{ padding: 8 }}><strong style={{ fontSize: 16 }}>Türkiye’nin başkenti neresidir?</strong></div>
          <div className="sure"><i style={{ width: "60%" }} /></div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}><Pul color="#D64933" emoji="⚽" size={22} /><span className="display">Kırmızılar</span><b style={{ marginLeft: "auto", color: "var(--lamba)" }}>300</b></div>
        </div>
        <div style={{ ...bs, width: 190, minHeight: 330, padding: 12, borderRadius: 18, display: "grid", gap: 8, alignContent: "start" }} aria-label="Telefon önizleme">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>{info.hasLogo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`/api/venues/${info.id}/logo`} alt="" height={20} />}<Pul color="#D64933" emoji="⚽" size={26} /><b>Kırmızılar</b></div>
          <strong className="display" style={{ fontSize: 20 }}>Başkent?</strong>
          {["Ankara", "İzmir"].map((o) => <div key={o} className="fis" style={{ padding: 8 }}>{o}</div>)}
          <div className="btn" style={{ minHeight: 36 }}>Cevabı kilitle</div>
        </div>
      </div>
    </section>
  );
}

function BillingTab({ info, flash, reload }: P) {
  const [st, setSt] = useState<{ status: string; cycle: string; renewsAt: number | null; invoices: { id: string; at: number; amountTry: number; kdv: number; plan: string; status: string }[]; billing: { company: string; taxNo: string; address: string } | null } | null>(null);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly"); const [coupon, setCoupon] = useState(""); const [card, setCard] = useState("");
  const [bill, setBill] = useState({ company: "", taxNo: "", address: "" });
  const load = useCallback(() => api<NonNullable<typeof st>>("/api/billing/state").then((s) => { setSt(s); if (s.billing) setBill(s.billing); }), []);
  useEffect(() => { load(); }, [load]);
  const buy = async (plan: PlanId) => {
    try { await api("/api/billing/subscribe", { plan, cycle, coupon: coupon || undefined, paymentToken: card || "tok_demo" }); flash(plan === "free" ? "Ücretsiz plana geçildi. Veriler silinmedi." : "Abonelik başladı."); load(); reload(); }
    catch (e) { flash((e as Error).message); }
  };
  return (
    <section style={{ display: "grid", gap: ".8rem" }}>
      <h2 style={{ fontSize: "1.6rem" }}>Abonelik</h2>
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
        <button className={`btn ${cycle === "monthly" ? "" : "btn-ghost"}`} onClick={() => setCycle("monthly")}>Aylık</button>
        <button className={`btn ${cycle === "yearly" ? "" : "btn-ghost"}`} onClick={() => setCycle("yearly")}>Yıllık (2 ay bedava)</button>
        <input className="input" style={{ width: 180 }} placeholder="Kupon / pilot kodu" value={coupon} onChange={(e) => setCoupon(e.target.value)} autoCapitalize="off" />
        <input className="input" style={{ width: 200 }} placeholder="Ödeme belirteci (demo)" value={card} onChange={(e) => setCard(e.target.value)} autoCapitalize="off" />
      </div>
      <div style={{ display: "grid", gap: ".5rem" }}>
        {(Object.values(PLANS)).map((p) => (
          <div key={p.id} style={{ display: "flex", gap: ".8rem", alignItems: "center", borderTop: "1px solid var(--cuha-line)", paddingTop: ".5rem", flexWrap: "wrap" }}>
            <strong style={{ minWidth: 100 }}>{p.name}</strong>
            <span className="tabular" style={{ flex: 1 }}>{p.priceTryMonthly ? `${(cycle === "yearly" ? yearlyPrice(p) : p.priceTryMonthly).toLocaleString("tr-TR")} TL + KDV / ${cycle === "yearly" ? "yıl" : "ay"}` : "0 TL"}</span>
            <button className={`btn ${info.plan === p.id ? "btn-ghost" : ""}`} disabled={info.plan === p.id} onClick={() => buy(p.id)}>{info.plan === p.id ? "Mevcut plan" : p.priceTryMonthly < PLANS[info.plan].priceTryMonthly ? "Plana geç (özellikler kapanır)" : "Seç"}</button>
          </div>
        ))}
      </div>
      {info.plan !== "free" && info.status !== "canceled" && <button className="btn btn-ghost" onClick={async () => { if (confirm("Abonelik dönem sonunda sona erecek. Emin misin?")) { await api("/api/billing/cancel", {}); flash("Abonelik iptal edildi. Dönem sonuna kadar planın geçerli."); load(); reload(); } }}>Aboneliği iptal et</button>}
      {st?.renewsAt && <p style={{ margin: 0 }}>Sonraki yenileme: {new Date(st.renewsAt).toLocaleDateString("tr-TR")}</p>}
      <h3 style={{ fontSize: "1.3rem" }}>Fatura bilgisi</h3>
      <form style={{ display: "grid", gap: ".5rem", maxWidth: 420 }} onSubmit={async (e) => { e.preventDefault(); try { await api("/api/billing/info", bill); flash("Fatura bilgisi kaydedildi."); } catch (e2) { flash((e2 as Error).message); } }}>
        <input className="input" placeholder="Unvan" value={bill.company} onChange={(e) => setBill({ ...bill, company: e.target.value })} required />
        <input className="input" placeholder="Vergi / TC kimlik no" value={bill.taxNo} onChange={(e) => setBill({ ...bill, taxNo: e.target.value })} required inputMode="numeric" />
        <input className="input" placeholder="Adres" value={bill.address} onChange={(e) => setBill({ ...bill, address: e.target.value })} required />
        <button className="btn">Kaydet</button>
      </form>
      {st && st.invoices.length > 0 && <><h3 style={{ fontSize: "1.3rem" }}>Faturalar</h3><ul style={{ margin: 0, paddingLeft: "1.1rem" }}>{st.invoices.map((i) => <li key={i.id}>{new Date(i.at).toLocaleDateString("tr-TR")} · {i.plan} · {i.amountTry.toLocaleString("tr-TR")} TL (KDV {i.kdv.toLocaleString("tr-TR")}) · {i.status === "paid" ? "ödendi" : "başarısız"}</li>)}</ul></>}
    </section>
  );
}

function SupportTab({ flash }: P) {
  const [f, setF] = useState({ subject: "", message: "" });
  return (
    <section style={{ display: "grid", gap: ".6rem", maxWidth: 520 }}>
      <h2 style={{ fontSize: "1.6rem" }}>Destek ve bildirim</h2>
      <p style={{ margin: 0 }}>Sorun, öneri ya da uygunsuz/telifli içerik bildirimi için yaz.</p>
      <form style={{ display: "grid", gap: ".5rem" }} onSubmit={async (e) => { e.preventDefault(); try { await api("/api/venue/support", f); flash("Mesajın iletildi."); setF({ subject: "", message: "" }); } catch (e2) { flash((e2 as Error).message); } }}>
        <input className="input" placeholder="Konu" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} required minLength={3} />
        <textarea className="input" style={{ minHeight: 120, padding: ".5rem" }} placeholder="Mesaj" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required minLength={10} />
        <button className="btn">Gönder</button>
      </form>
    </section>
  );
}
