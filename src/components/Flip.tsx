"use client";
import { useEffect, useRef, useState } from "react";

function Digit({ value, simple }: { value: string; simple: boolean }) {
  const [prev, setPrev] = useState(value);
  const [flipKey, setFlipKey] = useState(0);
  const last = useRef(value);
  useEffect(() => {
    if (last.current !== value) {
      setPrev(last.current);
      last.current = value;
      setFlipKey((k) => k + 1);
    }
  }, [value]);
  const flipping = flipKey > 0 && !simple && prev !== value;
  return (
    <span className={`flip-d${simple ? " rm" : ""}`} aria-hidden>
      <span className="h t"><span>{value}</span></span>
      <span className="h b"><span>{flipping ? prev : value}</span></span>
      {flipping && (
        <>
          <span key={`a${flipKey}`} className="h t f1"><span>{prev}</span></span>
          <span key={`b${flipKey}`} className="h b f2"><span>{value}</span></span>
        </>
      )}
    </span>
  );
}

/** Mekanik tabela rakamı. Skor değişince rakamlar çevrilir. */
export function Flip({ value, pad = 3, simple = false }: { value: number; pad?: number; simple?: boolean }) {
  const neg = value < 0;
  const s = String(Math.abs(value)).padStart(pad, "0");
  return (
    <span className="flip" role="text" aria-label={`${value} puan`}>
      {neg && <span aria-hidden style={{ alignSelf: "center", padding: "0 .1em" }}>−</span>}
      {s.split("").map((d, i) => <Digit key={i} value={d} simple={simple} />)}
    </span>
  );
}
