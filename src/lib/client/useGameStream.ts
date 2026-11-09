"use client";
import { useEffect, useRef, useState } from "react";

/** SSE akışı + sunucu saati farkı. EventSource kopunca kendisi yeniden bağlanır. */
export function useGameStream<T extends { serverNow: number }>(gameId: string | null, role: "host" | "tv" | "player", token: string | null) {
  const [view, setView] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  const offset = useRef(0); // sunucu - istemci
  useEffect(() => {
    if (!gameId || !token) return;
    const es = new EventSource(`/api/games/${gameId}/events?role=${role}&token=${encodeURIComponent(token)}`);
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (e) => {
      const v = JSON.parse(e.data) as T;
      offset.current = v.serverNow - Date.now();
      setView(v);
      setConnected(true);
    };
    return () => es.close();
  }, [gameId, role, token]);
  const serverNow = () => Date.now() + offset.current;
  return { view, connected, serverNow };
}

export async function post(gameId: string, body: unknown) {
  const r = await fetch(`/api/games/${gameId}/action`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.message ?? "İşlem başarısız, tekrar dene.");
  return j;
}

/** Kalan süreyi sunucu saatine göre çizmek için ~10 fps tick. */
export function useNow(serverNow: () => number, active: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => setN(serverNow()), 100);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return n || serverNow();
}

export function useWakeLock() {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const req = async () => {
      try { lock = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<typeof lock> } }).wakeLock?.request("screen") ?? null; } catch { /* desteklenmiyor */ }
    };
    req();
    const onVis = () => { if (document.visibilityState === "visible") req(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { document.removeEventListener("visibilitychange", onVis); lock?.release().catch(() => {}); };
  }, []);
}
