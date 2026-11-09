import { PLANS, yearlyPrice } from "@config/plans";
import { BRAND } from "@config/brand";
import { DemoBoard } from "@/components/DemoBoard";
import { StartDemo } from "@/components/StartDemo";

const ROWS: [string, (p: (typeof PLANS)[keyof typeof PLANS]) => string][] = [
  ["Oyuncu", (p) => (p.playerLimit ? `${p.playerLimit} kişi` : "Sınırsız")],
  ["Günlük oyun", (p) => (p.dailyGames ? String(p.dailyGames) : "Sınırsız")],
  ["AI soru kotası / ay", (p) => String(p.aiQuotaMonthly)],
  ["Mekan adı, logo, renk", (p) => (p.features.has("branding") ? "Var" : "Yok")],
  ["Lig ve sezon", (p) => (p.features.has("league") ? "Var" : "Yok")],
];

export default function Landing() {
  const plans = Object.values(PLANS);
  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "1.25rem" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <span className="display" style={{ fontSize: "1.8rem" }}>{BRAND.name}</span>
        <span style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}><a href="#fiyat" style={{ color: "var(--lamba)" }}>Fiyatlar</a><a href="/demo" style={{ color: "var(--lamba)" }}>Kendin dene</a><a href="/giris" style={{ color: "var(--lamba)" }}>Giriş</a></span>
      </nav>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2.5rem", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "clamp(2.8rem, 8vw, 5.5rem)" }}>Boş salı gecenizi doldurun.</h1>
          <p style={{ fontSize: "1.2rem", maxWidth: "34ch" }}>Sorular TV’de, oyuncular telefonda. QR’ı okutan takım kurar ve oynar. Uygulama yok, hesap yok.</p>
          <StartDemo />
          <p style={{ margin: ".8rem 0 0" }}><a href="/demo" style={{ color: "var(--lamba)" }}>Kayıt olmadan 5 soruluk demoyu dene</a> · <a href="/giris" style={{ color: "var(--lamba)" }}>Mekanını kaydet</a></p>
        </div>
        <DemoBoard />
      </section>

      <section style={{ marginTop: "4rem", maxWidth: 680 }}>
        <h2 style={{ fontSize: "2.2rem", marginBottom: ".75rem" }}>Masada tek cevap, herkesin sesi</h2>
        <p>Kaptan cevabı gönderir. Masadakiler kendi telefonlarından öneri yollar ya da oy verir. Kaptanın bağlantısı koparsa takımdan biri kaptanlığı alır. Host panelinde her adımda ne yapacağını ve ne söyleyeceğini gösteren bir yardımcı var.</p>
      </section>

      <section id="fiyat" style={{ marginTop: "4rem" }}>
        <h2 style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>Fiyatlar</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 560 }}>
            <thead>
              <tr>{["", ...plans.map((p) => p.name)].map((h, i) => <th key={i} className="display" style={{ textAlign: "left", fontSize: "1.5rem", padding: ".5rem", borderBottom: "2px solid var(--lamba)" }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: ".5rem" }}>Aylık (KDV hariç)</td>{plans.map((p) => <td key={p.id} className="tabular" style={{ padding: ".5rem" }}>{p.priceTryMonthly ? `${p.priceTryMonthly.toLocaleString("tr-TR")} TL` : "0 TL"}</td>)}</tr>
              <tr><td style={{ padding: ".5rem" }}>Yıllık (2 ay bedava)</td>{plans.map((p) => <td key={p.id} className="tabular" style={{ padding: ".5rem" }}>{p.priceTryMonthly ? `${yearlyPrice(p).toLocaleString("tr-TR")} TL` : "—"}</td>)}</tr>
              {ROWS.map(([label, f]) => (
                <tr key={label} style={{ borderTop: "1px solid var(--cuha-line)" }}><td style={{ padding: ".5rem" }}>{label}</td>{plans.map((p) => <td key={p.id} style={{ padding: ".5rem" }}>{f(p)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ opacity: .8 }}>Fiyatlar pilot sonrası güncellenecek.</p>
      </section>

      <footer style={{ margin: "4rem 0 2rem", opacity: .85, display: "flex", gap: "1rem", flexWrap: "wrap" }}><span>© {BRAND.name}</span><a href="/gizlilik">Gizlilik</a><a href="/kvkk">KVKK</a><a href="/kosullar">Koşullar</a><a href="/cerez">Çerezler</a></footer>
    </main>
  );
}
