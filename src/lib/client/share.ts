/** Instagram story boyutunda (1080x1920) sonuç görseli üretir. Tamamen istemci tarafında. */
export async function makeShareImage(o: { venue: string; team: string; rank: number; score: number; color: string; emoji: string; total: number; bg?: string; accent?: string; app: string }): Promise<Blob> {
  const c = document.createElement("canvas"); c.width = 1080; c.height = 1920;
  const x = c.getContext("2d")!;
  x.fillStyle = o.bg ?? "#17483B"; x.fillRect(0, 0, 1080, 1920);
  const ink = "#EDE4D0", acc = o.accent ?? "#F4B942";
  x.fillStyle = ink; x.textBaseline = "alphabetic";
  const font = (px: number, w = 800) => `${w} ${px}px "Big Shoulders Display Variable", Impact, sans-serif`;
  x.font = font(64, 700); x.fillText(`Bu gece ${o.venue} sundu`, 80, 200);
  x.beginPath(); x.arc(540, 700, 260, 0, Math.PI * 2); x.fillStyle = o.color; x.fill();
  x.lineWidth = 14; x.strokeStyle = "rgba(255,255,255,.3)"; x.stroke();
  x.font = "260px sans-serif"; x.textAlign = "center"; x.fillStyle = "#fff"; x.fillText(o.emoji, 540, 790);
  x.fillStyle = acc; x.font = font(300); x.fillText(`${o.rank}.`, 540, 1180);
  x.fillStyle = ink; x.font = font(110); x.fillText(o.team.slice(0, 22), 540, 1330);
  x.font = font(80, 600); x.fillText(`${o.score} puan · ${o.total} takım içinde`, 540, 1430);
  x.textAlign = "left"; x.fillStyle = acc; x.font = font(56, 600); x.fillText(o.app, 80, 1800);
  return new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
}
export async function shareOrDownload(blob: Blob, name = "sonuc.png") {
  const file = new File([blob], name, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
  if (nav.canShare?.({ files: [file] })) { try { await nav.share({ files: [file] }); return; } catch { /* iptal */ } }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
