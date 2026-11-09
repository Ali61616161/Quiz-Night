export function Pul({ color, emoji, size = 44, drop = false }: { color: string; emoji: string; size?: number; drop?: boolean }) {
  return (
    <span className={`pul${drop ? " pul-dus" : ""}`} style={{ width: size, height: size, background: color, fontSize: size * 0.5 }} aria-hidden>
      {emoji}
    </span>
  );
}
