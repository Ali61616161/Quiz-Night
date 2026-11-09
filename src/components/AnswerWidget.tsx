"use client";
import { useMemo, useState } from "react";

export interface QView {
  kind: "open" | "choice" | "ordering" | "matching" | "estimate";
  options: string[] | null; items: string[] | null; left: string[] | null; right: string[] | null;
}

/** Soru biçimine göre cevap girişi. `onValue` her değişimde (geçerli cevap oluştuğunda) çağrılır. */
export function AnswerWidget({ q, value, disabled, onValue, commitOnPick }: {
  q: QView; value: string; disabled: boolean; onValue: (v: string) => void; commitOnPick: boolean;
}) {
  if (q.kind === "choice" && q.options) {
    return (
      <div style={{ display: "grid", gap: ".5rem" }}>
        {q.options.map((o) => (
          <button key={o} className={`btn ${value === o ? "" : "btn-fis"}`} style={{ justifyContent: "flex-start", minHeight: 56 }} disabled={disabled} aria-pressed={value === o} onClick={() => onValue(o)}>
            {value === o ? "● " : "○ "}{o}
          </button>
        ))}
      </div>
    );
  }
  if (q.kind === "ordering" && q.items) return <Ordering items={q.items} value={value} disabled={disabled} onValue={onValue} />;
  if (q.kind === "matching" && q.left && q.right) return <Matching left={q.left} right={q.right} value={value} disabled={disabled} onValue={onValue} />;
  void commitOnPick;
  return (
    <input className="input" value={value} onChange={(e) => onValue(e.target.value)} disabled={disabled} maxLength={120}
      placeholder={q.kind === "estimate" ? "Sayı yaz" : "Cevabın"} inputMode={q.kind === "estimate" ? "decimal" : "text"}
      autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="send" />
  );
}

/** Dokun-sırala: öğelere sırayla dokun, sıra oluşur. */
function Ordering({ items, value, disabled, onValue }: { items: string[]; value: string; disabled: boolean; onValue: (v: string) => void }) {
  const chosen: string[] = useMemo(() => { try { const a = JSON.parse(value); return Array.isArray(a) ? a : []; } catch { return []; } }, [value]);
  const [partial, setPartial] = useState<string[]>([]);
  const cur = chosen.length === items.length ? chosen : partial;
  const tap = (it: string) => {
    if (disabled || cur.includes(it)) return;
    const next = [...(chosen.length === items.length ? [] : partial), it];
    setPartial(next);
    if (next.length === items.length) onValue(JSON.stringify(next)); else if (chosen.length) onValue("");
  };
  const reset = () => { setPartial([]); onValue(""); };
  return (
    <div style={{ display: "grid", gap: ".5rem" }}>
      <p style={{ margin: 0 }}>Doğru sıraya göre dokun: {cur.length}/{items.length}</p>
      {items.map((it) => {
        const pos = cur.indexOf(it);
        return (
          <button key={it} className={`btn ${pos >= 0 ? "" : "btn-fis"}`} style={{ justifyContent: "flex-start", minHeight: 52 }} disabled={disabled || pos >= 0} onClick={() => tap(it)}>
            <span className="display tabular" style={{ minWidth: "1.5em" }}>{pos >= 0 ? pos + 1 : "·"}</span> {it}
          </button>
        );
      })}
      <button className="btn btn-ghost" onClick={reset} disabled={disabled || !cur.length}>Sıfırla</button>
    </div>
  );
}

function Matching({ left, right, value, disabled, onValue }: { left: string[]; right: string[]; value: string; disabled: boolean; onValue: (v: string) => void }) {
  const [map, setMap] = useState<Record<number, string>>(() => { try { const a = JSON.parse(value); return Array.isArray(a) ? Object.fromEntries(a.map((r: string, i: number) => [i, r])) : {}; } catch { return {}; } });
  const [active, setActive] = useState<number | null>(0);
  const used = new Set(Object.values(map));
  const pick = (r: string) => {
    if (disabled || active === null || used.has(r)) return;
    const next = { ...map, [active]: r };
    setMap(next);
    const nextActive = left.findIndex((_, i) => !(i in next));
    setActive(nextActive >= 0 ? nextActive : null);
    onValue(Object.keys(next).length === left.length ? JSON.stringify(left.map((_, i) => next[i])) : "");
  };
  const clear = (i: number) => { if (disabled) return; const next = { ...map }; delete next[i]; setMap(next); setActive(i); onValue(""); };
  return (
    <div style={{ display: "grid", gap: ".6rem" }}>
      <p style={{ margin: 0 }}>Soldan birini seç, sonra eşini seç.</p>
      {left.map((l, i) => (
        <button key={l} className={`btn ${active === i ? "" : "btn-fis"}`} style={{ justifyContent: "space-between", minHeight: 52 }} disabled={disabled} onClick={() => (map[i] ? clear(i) : setActive(i))} aria-pressed={active === i}>
          <span>{l}</span><span>{map[i] ?? "…"}</span>
        </button>
      ))}
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem" }}>
        {right.map((r) => <button key={r} className="btn btn-ghost" disabled={disabled || used.has(r) || active === null} onClick={() => pick(r)}>{r}</button>)}
      </div>
    </div>
  );
}
