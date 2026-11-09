export const metadata = { title: "Yazı tipi testi" };
const SAMPLE = "ığüşöç İĞÜŞÖÇ ıİ iI · Çığ gibi büyüyen şöhret 0123456789";
export default function FontTest() {
  return (
    <main style={{ padding: "1.5rem", maxWidth: 900, margin: "0 auto", display: "grid", gap: "1rem" }}>
      <h1 style={{ fontSize: "3rem" }}>Türkçe karakter testi</h1>
      <p className="display" style={{ fontSize: "3rem", margin: 0 }}>{SAMPLE}</p>
      <p style={{ fontSize: "1.5rem", margin: 0 }}>{SAMPLE}</p>
      <p className="tabular display" style={{ fontSize: "4rem", margin: 0 }}>1.234 · 0 5 8 100 −20</p>
    </main>
  );
}
