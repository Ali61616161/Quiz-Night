"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client/api";

interface Overview {
  venues: { id: string; name: string; email: string; plan: string; effective: string; status: string; games: number }[];
  liveGames: number; abuse: { id: string; at: number; kind: string; detail: string; venueId: string | null }[];
  coupons: { code: string; percentOff: number; months: number; maxUses: number; uses: number; expires: number | null }[]; announcement: string;
  reports: { id: string; questionId: string; text: string; reason: string }[]; drafts: number; draftList: { id: string; text: string; correct: string; category: string }[];
  calibration: { id: string; text: string; current: number; suggested: number; rate: number; n: number }[]; audit: { at: number; who: string; what: string }[]; bank: { total: number };
}

export default function Admin() {
  const [d, setD] = useState<Overview | null>(null); const [err, setErr] = useState(""); const [msg, setMsg] = useState("");
  const [c, setC] = useState({ code: "PILOT50", percentOff: 50, months: 3, maxUses: 20, expiresDays: 90 }); const [ann, setAnn] = useState("");
  const load = useCallback(() => api<Overview>("/api/admin/overview").then((x) => { setD(x); setAnn(x.announcement); }).catch((e) => setErr(e.status === 401 ? "Giriş yapmalısın." : "Yetkin yok.")), []);
  useEffect(() => { load(); }, [load]);
  if (err) return <main style={{ padding: "1.25rem" }}><p>{err}</p><a href="/giris" className="btn">Giriş</a></main>;
  if (!d) return <main style={{ padding: "1.25rem" }}><p>Yükleniyor…</p></main>;
  const run = async (fn: () => Promise<unknown>, ok: string) => { try { await fn(); setMsg(ok); load(); } catch (e) { setMsg((e as Error).message); } };
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "1rem", display: "grid", gap: "1.5rem" }}>
      <h1 style={{ fontSize: "2.4rem" }}>Süper admin</h1>
      {msg && <p role="status" className="fis" style={{ margin: 0 }}>{msg}</p>}
      <p style={{ margin: 0 }}>{d.venues.length} mekan · {d.liveGames} canlı oyun · {d.bank.total} havuz sorusu · {d.drafts} AI taslağı</p>

      <section><h2 style={{ fontSize: "1.6rem" }}>Mekanlar</h2>
        <div style={{ overflowX: "auto" }}><table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}><thead><tr>{["Mekan", "E-posta", "Plan", "Geçerli", "Durum", "Oyun", ""].map((h) => <th key={h} style={{ textAlign: "left", padding: ".4rem" }}>{h}</th>)}</tr></thead>
          <tbody>{d.venues.map((v) => <tr key={v.id} style={{ borderTop: "1px solid var(--cuha-line)" }}><td style={{ padding: ".4rem" }}>{v.name}</td><td>{v.email}</td><td>{v.plan}</td><td>{v.effective}</td><td>{v.status}</td><td>{v.games}</td>
            <td><select className="input" style={{ minHeight: 36 }} value={v.plan} onChange={(e) => run(() => api("/api/admin/set_plan", { venueId: v.id, plan: e.target.value }), "Plan güncellendi.")}>{["free", "starter", "pro", "brand"].map((p) => <option key={p}>{p}</option>)}</select></td></tr>)}</tbody></table></div></section>

      <section><h2 style={{ fontSize: "1.6rem" }}>Kupon / pilot kodu</h2>
        <form style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }} onSubmit={(e) => { e.preventDefault(); run(() => api("/api/admin/coupon", c), "Kupon kaydedildi."); }}>
          <input className="input" style={{ width: 150 }} value={c.code} onChange={(e) => setC({ ...c, code: e.target.value })} aria-label="Kod" />
          <input className="input" style={{ width: 90 }} type="number" value={c.percentOff} onChange={(e) => setC({ ...c, percentOff: Number(e.target.value) })} aria-label="Yüzde" />
          <input className="input" style={{ width: 90 }} type="number" value={c.months} onChange={(e) => setC({ ...c, months: Number(e.target.value) })} aria-label="Ay" />
          <input className="input" style={{ width: 100 }} type="number" value={c.maxUses} onChange={(e) => setC({ ...c, maxUses: Number(e.target.value) })} aria-label="Kullanım" />
          <input className="input" style={{ width: 110 }} type="number" value={c.expiresDays} onChange={(e) => setC({ ...c, expiresDays: Number(e.target.value) })} aria-label="Geçerlilik günü" />
          <button className="btn">Kaydet</button></form>
        <ul style={{ paddingLeft: "1.1rem" }}>{d.coupons.map((k) => <li key={k.code}>{k.code} · %{k.percentOff} · {k.months} ay · {k.uses}/{k.maxUses} <button className="btn btn-ghost" onClick={() => run(() => api("/api/admin/coupon_delete", { code: k.code }), "Silindi.")}>Sil</button></li>)}</ul></section>

      <section><h2 style={{ fontSize: "1.6rem" }}>Duyuru</h2>
        <div style={{ display: "flex", gap: ".5rem" }}><input className="input" value={ann} onChange={(e) => setAnn(e.target.value)} maxLength={300} /><button className="btn" onClick={() => run(() => api("/api/admin/announce", { text: ann }), "Duyuru güncellendi.")}>Yayınla</button></div></section>

      <section><h2 style={{ fontSize: "1.6rem" }}>Hatalı soru bildirimleri ({d.reports.length})</h2><ul style={{ paddingLeft: "1.1rem" }}>{d.reports.map((r) => <li key={r.id}>{r.text} — <em>{r.reason}</em></li>)}</ul></section>
      <section><h2 style={{ fontSize: "1.6rem" }}>Zorluk kalibrasyonu önerileri ({d.calibration.length})</h2><ul style={{ paddingLeft: "1.1rem" }}>{d.calibration.map((r) => <li key={r.id}>{r.text}: {r.current} → {r.suggested} (doğru oranı %{Math.round(r.rate * 100)}, n={r.n}) <button className="btn btn-ghost" onClick={() => run(() => api("/api/admin/calibration_apply", { id: r.id, difficulty: r.suggested }), "Zorluk güncellendi.")}>Uygula</button></li>)}</ul></section>
      <section><h2 style={{ fontSize: "1.6rem" }}>AI taslak onay kuyruğu ({d.drafts})</h2><ul style={{ paddingLeft: "1.1rem" }}>{d.draftList.map((q) => <li key={q.id}>{q.category} · {q.text} → {q.correct} <button className="btn" onClick={() => run(() => api("/api/admin/draft_publish", { id: q.id }), "Genel havuza eklendi.")}>Genel havuza ekle</button> <button className="btn btn-ghost" onClick={() => run(() => api("/api/admin/draft_delete", { id: q.id }), "Silindi.")}>Sil</button></li>)}</ul></section>
      <section><h2 style={{ fontSize: "1.6rem" }}>Kötüye kullanım bayrakları ({d.abuse.length})</h2><ul style={{ paddingLeft: "1.1rem" }}>{d.abuse.map((a) => <li key={a.id}>{new Date(a.at).toLocaleString("tr-TR")} · {a.kind} · {a.detail}</li>)}</ul></section>
      <section><h2 style={{ fontSize: "1.6rem" }}>Denetim kaydı</h2><ul style={{ paddingLeft: "1.1rem" }}>{d.audit.map((a, i) => <li key={i}>{new Date(a.at).toLocaleString("tr-TR")} · {a.who} · {a.what}</li>)}</ul></section>
    </main>
  );
}
