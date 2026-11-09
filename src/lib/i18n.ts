import en from "../../messages/en.json";
import tr from "../../messages/tr.json";

const dict = { tr, en } as const;
export type Lang = keyof typeof dict;

/** t("play.lock") → çeviri. Eksik anahtarda Türkçeye, o da yoksa anahtarın kendisine düşer. */
export function t(key: string, lang: Lang = "tr"): string {
  const get = (d: unknown) => key.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), d);
  const v = get(dict[lang]) ?? get(dict.tr);
  return typeof v === "string" ? v : key;
}
