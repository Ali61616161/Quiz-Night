import { BRAND, COMPANY } from "@config/brand";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Kullanım koşulları" };
export default function Page() {
  const doc = LEGAL["kosullar"];
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "1.25rem" }}>
      <a href="/" className="display" style={{ fontSize: "1.6rem" }}>{BRAND.name}</a>
      <h1 style={{ fontSize: "2.4rem", margin: "1rem 0" }}>{doc.title}</h1>
      {COMPANY.name ? (
        <p className="fis">{COMPANY.name}{COMPANY.address ? ` · ${COMPANY.address}` : ""}{COMPANY.mersis ? ` · MERSİS ${COMPANY.mersis}` : ""}{COMPANY.verbis ? ` · VERBİS ${COMPANY.verbis}` : ""}{COMPANY.email ? ` · ${COMPANY.email}` : ""}{COMPANY.kep ? ` · KEP ${COMPANY.kep}` : ""}</p>
      ) : (
        <p className="fis">Bu metin yayın öncesinde bir avukat tarafından incelenmelidir. Şirket unvanı, adres, MERSİS/VERBİS ve iletişim bilgileri (NEXT_PUBLIC_COMPANY_* değişkenleri) tamamlanmalıdır.</p>
      )}
      {doc.sections.map((s) => (<section key={s.h} style={{ marginTop: "1.2rem" }}><h2 style={{ fontSize: "1.5rem" }}>{s.h}</h2><p>{s.p}</p></section>))}
    </main>
  );
}
