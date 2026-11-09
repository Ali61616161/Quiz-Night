"use client";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/client/api";
import { BRAND } from "@config/brand";

function Form() {
  const r = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [venueName, setVenueName] = useState("");
  const [err, setErr] = useState(""); const [info, setInfo] = useState(""); const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(""); setInfo("");
    try {
      if (mode === "signup") {
        const j = await api<{ devVerifyUrl?: string }>("/api/auth/signup", { email, password, venueName });
        setInfo("Doğrulama bağlantısı e-postana gönderildi. Bağlantıyı açtıktan sonra giriş yap." + (j.devVerifyUrl ? ` (Geliştirme: ${j.devVerifyUrl})` : ""));
        setMode("login");
      } else { await api("/api/auth/login", { email, password }); r.push("/panel"); }
    } catch (e2) { setErr((e2 as Error).message); } finally { setBusy(false); }
  };
  const q = typeof window !== "undefined" ? new URLSearchParams(location.search) : null;
  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "1.25rem", display: "grid", gap: "1rem" }}>
      <a href="/" className="display" style={{ fontSize: "1.6rem" }}>{BRAND.name}</a>
      <h1 style={{ fontSize: "2.4rem" }}>{mode === "login" ? "Mekan girişi" : "Mekanını kaydet"}</h1>
      {q?.get("dogrulandi") && <p role="status" className="fis">E-posta doğrulandı. Giriş yapabilirsin.</p>}
      {q?.get("hata") && <p role="alert" style={{ color: "#ffb4a6" }}>Doğrulama bağlantısı geçersiz.</p>}
      <form onSubmit={submit} style={{ display: "grid", gap: ".8rem" }}>
        {mode === "signup" && <label style={{ display: "grid", gap: ".3rem" }}>Mekan adı<input className="input" value={venueName} onChange={(e) => setVenueName(e.target.value)} required minLength={2} maxLength={60} autoComplete="organization" /></label>}
        <label style={{ display: "grid", gap: ".3rem" }}>E-posta<input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoCapitalize="off" autoCorrect="off" spellCheck={false} /></label>
        <label style={{ display: "grid", gap: ".3rem" }}>Şifre{mode === "signup" && " (en az 10 karakter)"}<input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === "signup" ? 10 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"} enterKeyHint="send" /></label>
        {err && <p role="alert" style={{ margin: 0, color: "#ffb4a6" }}>{err}</p>}
        {info && <p role="status" style={{ margin: 0, wordBreak: "break-all" }}>{info}</p>}
        <button className="btn" style={{ minHeight: 56 }} disabled={busy}>{mode === "login" ? "Giriş yap" : "Hesap oluştur"}</button>
      </form>
      <button className="btn btn-ghost" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}>{mode === "login" ? "Hesabın yok mu? Kayıt ol" : "Hesabın var mı? Giriş yap"}</button>
      {mode === "signup" && <p style={{ fontSize: ".9rem", opacity: .85 }}>Kayıt olarak <a href="/kosullar" style={{ color: "var(--lamba)" }}>kullanım koşullarını</a> ve <a href="/kvkk" style={{ color: "var(--lamba)" }}>KVKK aydınlatma metnini</a> kabul edersin.</p>}
    </main>
  );
}
export default function Page() { return <Suspense><Form /></Suspense>; }
