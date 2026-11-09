/** Türkçe cevap eşleştirme: büyük/küçük harf, aksan, noktalama ve küçük yazım hataları. */

export function normalizeTr(input: string): string {
  return input
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Kısa cevaplarda (<5 karakter) bulanık eşleşme kapalı; 5-9: 1 hata; 10+: 2 hata. */
export function isCorrectOpen(answer: string, accepted: string[], fuzzy = true): boolean {
  const a = normalizeTr(answer);
  if (!a) return false;
  return accepted.some((ok) => {
    const n = normalizeTr(ok);
    if (a === n) return true;
    if (!fuzzy || n.length < 5) return false;
    const tol = n.length >= 10 ? 2 : 1;
    return levenshtein(a, n) <= tol;
  });
}
