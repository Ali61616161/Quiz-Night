"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartDemo() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const start = async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ venueName: "Demo Kafe" }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message);
      router.push(`/host/${j.id}?t=${encodeURIComponent(j.hostToken)}`);
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  };
  return (
    <div>
      <button className="btn" style={{ minHeight: 56, fontSize: "1.2rem" }} onClick={start} disabled={busy}>Demo gece başlat</button>
      {err && <p role="alert" style={{ color: "#ffb4a6" }}>{err}</p>}
    </div>
  );
}
