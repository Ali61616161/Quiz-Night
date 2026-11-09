let ctx: AudioContext | null = null;
export function beep(freq = 660, ms = 110, vol = 0.04) {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = freq; o.type = "sine"; g.gain.value = vol;
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + ms / 1000);
  } catch { /* ses desteklenmiyor */ }
}
export const tickSound = () => beep(880, 60);
export const dingSound = () => { beep(660, 120); setTimeout(() => beep(990, 160), 130); };
export const buzz = (ms = 25) => { try { navigator.vibrate?.(ms); } catch { /* haptik yok */ } };
