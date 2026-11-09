"use client";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function QR({ text, size = 160, label }: { text: string; size?: number; label: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => { QRCode.toDataURL(text, { margin: 1, width: size * 2, color: { dark: "#10201A", light: "#EDE4D0" } }).then(setSrc); }, [text, size]);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} width={size} height={size} alt={label} style={{ borderRadius: 6, display: "block" }} /> : <div style={{ width: size, height: size }} />;
}
