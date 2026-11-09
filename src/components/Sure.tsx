"use client";
import { useNow } from "@/lib/client/useGameStream";

export function Sure({ openedAt, deadline, active, serverNow, big = false }: {
  openedAt: number | null; deadline: number | null; active: boolean; serverNow: () => number; big?: boolean;
}) {
  const now = useNow(serverNow, active);
  if (!openedAt || !deadline) return null;
  const total = deadline - openedAt;
  const left = active ? Math.max(0, deadline - now) : 0;
  const ratio = total > 0 ? left / total : 0;
  const secs = Math.ceil(left / 1000);
  const low = left < 8000 && active;
  return (
    <div>
      <div className={`sure${low ? " az" : ""}`} role="progressbar" aria-valuemin={0} aria-valuemax={Math.round(total / 1000)} aria-valuenow={secs} aria-label="Kalan süre">
        <i style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <p className="display tabular" style={{ fontSize: big ? "2rem" : "1.25rem", margin: ".35rem 0 0", color: low ? "var(--sinyal)" : "var(--lamba)" }}>
        {active ? `${secs} sn kaldı` : "Süre doldu"}
      </p>
    </div>
  );
}
