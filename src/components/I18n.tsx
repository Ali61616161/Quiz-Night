"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { startTranslator } from "@/lib/i18n/runtime";

export type Lang = "tr" | "en";
const KEY = "lang", CHOSEN = "lang-chosen";
const read = (): Lang => { try { const v = localStorage.getItem(KEY); if (v === "en" || v === "tr") return v; } catch {} return "tr"; };

/** Dil: kayıtlı seçim → varsayılan Türkçe. Oyun İngilizce açıldıysa ve kullanıcı bir seçim yapmadıysa İngilizceye geçilir (tek yenileme). */
export function I18nBoot() {
  useEffect(() => {
    const lang = read();
    let stop = () => {};
    if (lang === "en") stop = startTranslator(); else document.documentElement.lang = "tr";
    const onGame = (e: Event) => {
      const gl = (e as CustomEvent<Lang>).detail;
      let chosen = false; try { chosen = localStorage.getItem(CHOSEN) === "1"; } catch {}
      if (!chosen && gl && gl !== read()) { try { localStorage.setItem(KEY, gl); } catch {} location.reload(); }
    };
    window.addEventListener("game-lang", onGame);
    return () => { stop(); window.removeEventListener("game-lang", onGame); };
  }, []);
  return null;
}

export function announceGameLang(lang: Lang | undefined) { if (lang) window.dispatchEvent(new CustomEvent("game-lang", { detail: lang })); }

/** Her sayfada sabit duran dil düğmesi. */
export function LangSwitch() {
  const [lang, setLang] = useState<Lang>("tr");
  const path = usePathname();
  useEffect(() => setLang(read()), []);
  const set = (l: Lang) => { try { localStorage.setItem(KEY, l); localStorage.setItem(CHOSEN, "1"); } catch {} location.reload(); };
  if (path?.startsWith("/tv")) return null; // TV dili oyunun diliyle gelir
  return (
    <>
    <div className="lang-spacer" aria-hidden />
    <div data-no-translate style={{ position: "fixed", top: "max(8px, env(safe-area-inset-top))", right: 8, zIndex: 50, display: "flex", gap: 2, background: "var(--cuha-deep)", borderRadius: 10, padding: 3, border: "1px solid var(--cuha-line)" }} role="group" aria-label="Language">
      {(["tr", "en"] as const).map((l) => (
        <button key={l} onClick={() => set(l)} aria-pressed={lang === l} className="btn" style={{ minHeight: 36, minWidth: 44, padding: "0 .6rem", fontSize: ".9rem", background: lang === l ? "var(--lamba)" : "transparent", color: lang === l ? "var(--murekkep)" : "var(--fildisi)" }}>{l.toUpperCase()}</button>
      ))}
    </div>
    </>
  );
}
