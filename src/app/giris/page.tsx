"use client";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/client/api";
import { BRAND } from "@config/brand";

function Form() {
  const r = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [accepted, setAccepted] = useState(false);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [venueName, setVenueName] = useState("");
  const [err, setErr] = useState(""); const [info, setInfo] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(""); setInfo("");
    try {
      if (mode === "signup") {
        const j = await api<{ devVerifyUrl?: string }>("/api/auth/signup", { email, password, venueName, acceptTerms: accepted });
        setInfo("Doğrulama bağlantısı e-postana gönderildi. Bağlantıyı açtıktan sonra giriş yap." + (j.devVerifyUrl ? ` (Geliştirme: ${j.devVerifyUrl})` : ""));
        setMode("login");
      } else { await api("/api/auth/login", { email, password }); r.push("/panel"); }
    } catch (e2) { setErr((e2 as Error).message); } finally { setBusy(false); }
  };
  const resetToken = typeof window !== "undefined" ? new URLSearchParams(location.search).get("sifirla") : null;
  const forgot = async () => {
    if (!email) { setErr("Önce e-posta adresini yaz."); return; }
    try { const j = await api<{ devResetUrl?: string }>("/api/auth/forgot", { email }); setInfo("Hesap varsa sıfırlama bağlantısı e-postana gönderildi." + (j.devResetUrl ? ` (Geliştirme: ${j.devResetUrl})` : "")); setErr(""); } catch (e) { setErr((e as Error).message); }
  };
  const doReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api("/api/auth/reset", { token: resetToken, password }); setInfo("Şifren güncellendi. Giriş yapabilirsin."); history.replaceState(null, "", "/giris"); } catch (e2) { setErr((e2 as Error).message); }
  };
  const q = typeof window !== "undefined" ? new URLSearchParams(location.search) : null;
  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "1.25rem", display: "grid", gap: "1rem" }}>
      <a href="/" className="display" style={{ fontSize: "1.6rem" }}>{BRAND.name}</a>
      <h1 style={{ fontSize: "2.4rem" }}>{mode === "login" ? "Mekan girişi" : "Mekanını kaydet"}</h1>
      {q?.get("dogrulandi") && <p role="status" className="fis">E-posta doğrulandı. Giriş yapabilirsin.</p>}
      {q?.get("hata") && <p role="alert" style={{ color: "#ffb4a6" }}>Doğrulama bağlantısı geçersiz.</p>}
      {resetToken ? (
        <form onSubmit={doReset} style={{ display: "grid", gap: ".8rem" }}>
          <label style={{ display: "grid", gap: ".3rem" }}>Yeni şifre (en az 10 karakter)<input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} autoComplete="new-password" /></label>
          {err && <p role="alert" style={{ margin: 0, color: "#ffb4a6" }}>{err}</p>}{info && <p role="status" style={{ margin: 0 }}>{info}</p>}
          <button className="btn" style={{ minHeight: 56 }}>Şifreyi güncelle</button>
        </form>
      ) : null}
      <form hidden={Boolean(resetToken)} onSubmit={submit} style={{ display: "grid", gap: ".8rem" }}>
        {mode === "signup" && <label style={{ display: "grid", gap: ".3rem" }}>Mekan adı<input className="input" value={venueName} onChange={(e) => setVenueName(e.target.value)} required minLength={2} maxLength={60} autoComplete="organization" /></label>}
        <label style={{ display: "grid", gap: ".3rem" }}>E-posta<input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoCapitalize="off" autoCorrect="off" spellCheck={false} /></label>
        <label style={{ display: "grid", gap: ".3rem" }}>Şifre{mode === "signup" && " (en az 10 karakter)"}<input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "signup" ? 10 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"} enterKeyHint="send" /></label>
        {mode === "signup" && (
          <label style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", fontSize: ".95rem" }}>
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required style={{ width: 24, height: 24, marginTop: 2 }} />
            <span><a href="/kosullar" target="_blank" rel="noreferrer" style={{ color: "var(--lamba)" }}>Kullanım koşulları</a>, <a href="/sozlesme" target="_blank" rel="noreferrer" style={{ color: "var(--lamba)" }}>veri işleme sözleşmesi</a> ve <a href="/kvkk" target="_blank" rel="noreferrer" style={{ color: "var(--lamba)" }}>KVKK aydınlatma metnini</a> okudum, kabul ediyorum.</span>
          </label>
        )}
        {err && <p role="alert" style={{ margin: 0, color: "#ffb4a6" }}>{err}</p>}
        {info && <p role="status" style={{ margin: 0, wordBreak: "break-all" }}>{info}</p>}
        <button className="btn" style={{ minHeight: 56 }} disabled={busy}>{mode === "login" ? "Giriş yap" : "Hesap oluştur"}</button>
      </form>
      {mode === "login" && <button className="btn btn-ghost" type="button" onClick={forgot}>Şifremi unuttum</button>}
      <button className="btn btn-ghost" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}>{mode === "login" ? "Hesabın yok mu? Kayıt ol" : "Hesabın var mı? Giriş yap"}</button>
    </main>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
