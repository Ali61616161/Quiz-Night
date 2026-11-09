"use client";
import { Suspense, useEffect, useState } from "react";
import { QR } from "@/components/QR";
import { api } from "@/lib/client/api";
import { BRAND } from "@config/brand";

interface Info { name: string; plan: string; brand: { color1: string; color2: string }; hasLogo: boolean; id: string }

function Poster() {
  const [info, setInfo] = useState<Info | null>(null);
  const [kod, setKod] = useState("");
  const [title, setTitle] = useState("Quiz gecesi");
  const [when, setWhen] = useState("Her salı 20:30");
  const [size, setSize] = useState<"a3" | "a4" | "kart">("a4");
  useEffect(() => { api<Info>("/api/venue/info").then(setInfo).catch(() => {}); setKod(new URLSearchParams(location.search).get("kod") ?? ""); }, []);
  const branded = info?.plan === "brand";
  const bg = branded ? info!.brand.color1 : "#17483B", acc = branded ? info!.brand.color2 : "#F4B942";
  const url = typeof window !== "undefined" ? `${location.origin}${kod ? `/j/${kod}` : "/"}` : "";
  const dim = { a3: { w: "297mm", h: "420mm", f: 1.5 }, a4: { w: "210mm", h: "297mm", f: 1 }, kart: { w: "100mm", h: "140mm", f: 0.5 } }[size];
  return (
    <main style={{ padding: "1rem" }}>
      <div className="no-print" style={{ display: "grid", gap: ".6rem", maxWidth: 520, marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem" }}>Afiş ve masa kartı</h1>
        <label>Gece adı<input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} /></label>
        <label>Tarih ve saat<input className="input" value={when} onChange={(e) => setWhen(e.target.value)} maxLength={40} /></label>
        <label>Oda kodu (boşsa ana sayfa)<input className="input" value={kod} onChange={(e) => setKod(e.target.value.toUpperCase())} maxLength={4} autoCapitalize="off" /></label>
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          {(["a3", "a4", "kart"] as const).map((s) => <button key={s} className={`btn ${size === s ? "" : "btn-ghost"}`} onClick={() => setSize(s)}>{s === "kart" ? "Masa kartı" : s.toUpperCase()}</button>)}
          <button className="btn" onClick={() => window.print()}>Yazdır / PDF kaydet</button>
        </div>
        <p style={{ margin: 0, fontSize: ".9rem" }}>Yazdırma penceresinde “PDF olarak kaydet”i seç.{!branded && " Mekan renkleri Marka planındadır."}</p>
      </div>
      <div className="poster" style={{ width: dim.w, height: dim.h, background: bg, color: "#EDE4D0", padding: `${12 * dim.f}mm`, display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
        <div>
          {branded && info?.hasLogo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={`/api/venues/${info.id}/logo`} alt="" style={{ height: `${18 * dim.f}mm`, objectFit: "contain" }} />}
          <h2 style={{ fontSize: `${26 * dim.f}mm`, margin: 0, lineHeight: 1, color: acc }}>{title}</h2>
          <p style={{ fontSize: `${9 * dim.f}mm`, margin: `${3 * dim.f}mm 0 0` }}>{info?.name}</p>
          <p style={{ fontSize: `${8 * dim.f}mm`, margin: 0 }}>{when}</p>
        </div>
        <div style={{ display: "flex", alignItems: "end", gap: `${8 * dim.f}mm` }}>
          <div style={{ background: "#EDE4D0", padding: `${3 * dim.f}mm`, borderRadius: 6 }}>{url && <QR text={url} size={Math.round(180 * dim.f)} label="Katılım QR kodu" />}</div>
          <p style={{ fontSize: `${7 * dim.f}mm`, margin: 0 }}>Telefonla okut, takımını kur. Uygulama ve hesap gerekmez.{kod && <><br /><strong style={{ color: acc }}>Oda kodu: {kod}</strong></>}</p>
        </div>
        {!branded && <p style={{ margin: 0, fontSize: `${4 * dim.f}mm`, opacity: .7 }}>{BRAND.name}</p>}
      </div>
      <style>{`@media print { .no-print { display: none !important; } body { background: none !important; } main { padding: 0 !important; } .poster { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { margin: 0; } }`}</style>
    </main>
  );
}
export default function Page() { return <Suspense><Poster /></Suspense>; }
