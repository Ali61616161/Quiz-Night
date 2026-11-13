import type { RevealEntry } from "@/lib/roundInfo";

/** Oylamalı turların (sahte/saçma cevap) sonucu: kim yazdı, kim seçti. */
export function RevealList({ entries, big }: { entries: RevealEntry[]; big?: boolean }) {
  if (!entries.length) return null;
  return (
    <ul aria-label="Cevaplar ve oylar" style={{ listStyle: "none", padding: 0, margin: ".6rem 0 0", display: "grid", gap: big ? ".6rem" : ".4rem", fontSize: big ? "clamp(18px, 1.9vw, 34px)" : undefined }}>
      {entries.map((e, i) => (
        <li key={i} style={{ borderLeft: `4px solid ${e.truth ? "var(--yesil, #8FBF6A)" : "var(--lamba)"}`, paddingLeft: ".6rem" }}>
          <strong>{e.truth ? "✔ " : ""}{e.text}</strong>
          <div style={{ opacity: .85, fontSize: ".85em" }}>
            {e.truth ? "Gerçek cevap" : `Yazan: ${e.authors.join(", ")}`}
            {e.pickedBy.length > 0 ? ` · Seçenler (${e.pickedBy.length}): ${e.pickedBy.join(", ")}` : " · Seçen yok"}
          </div>
        </li>
      ))}
    </ul>
  );
}
