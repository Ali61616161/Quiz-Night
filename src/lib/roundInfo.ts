/** Tur adları ve kısa kurallar (TV, telefon ve host ortak kullanır). */
export const ROUND_NAME: Record<string, string> = {
  all: "", speed: "Hız turu", wager: "Bahis turu", final: "Final sorusu",
  streak: "Zamana karşı seri", silent: "Sessiz tur", bluff: "Sahte cevap turu", funny: "Saçma cevap turu",
};
export const ROUND_RULE: Record<string, string> = {
  streak: "Her soruda süre kısalır. Art arda doğru bilen takımın puan çarpanı büyür.",
  silent: "Konuşmak yasak! Herkes telefonundan oy verir, çoğunluk cevabı belirler.",
  bluff: "Gerçeğe benzeyen yanlış bir cevap yaz. Sonra gerçeği bul: bulursan puan, cevabına kananlar sana puan kazandırır.",
  funny: "Doğru cevap yok: en komik cevabı yaz. Sonra takımlar en iyisine oy verir (kendi cevabına oy veremezsin).",
};
export const VOTE_PROMPT: Record<string, string> = {
  bluff: "Hangisi gerçek? Telefonundan seç (kendi cevabını seçemezsin).",
  funny: "En komik cevaba oy ver (kendi cevabına oy veremezsin).",
};
export interface RevealEntry { text: string; truth: boolean; authors: string[]; pickedBy: string[] }
