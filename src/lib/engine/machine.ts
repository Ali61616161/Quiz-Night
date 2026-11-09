import type { Phase } from "./types";

/** Durum makinesi: lobby → round_intro → question_open → question_locked → answer_reveal → scoreboard → (sonraki) → final */
export function nextPhase(phase: Phase, hasMoreQuestions: boolean): Phase {
  switch (phase) {
    case "lobby": return "round_intro";
    case "round_intro": return "question_open";
    case "question_open": return "question_locked";
    case "question_locked": return "answer_reveal";
    case "answer_reveal": return "scoreboard";
    case "scoreboard": return hasMoreQuestions ? "question_open" : "final";
    case "final": return "final";
  }
}

export const PHASE_LABEL: Record<Phase, string> = {
  lobby: "Lobi",
  round_intro: "Tur girişi",
  question_open: "Soru açık",
  question_locked: "Süre doldu",
  answer_reveal: "Cevap",
  scoreboard: "Skor tablosu",
  final: "Final",
};

/** Host Coach: şimdi ne yap + söylenecek tek cümle. */
export function coach(phase: Phase, teamCount: number): { do: string; say: string } {
  switch (phase) {
    case "lobby":
      return teamCount < 2
        ? { do: "QR kodu göster, en az 2 takım bekle.", say: "Telefonunuzla ekrandaki kodu okutun, takımınızı kurun." }
        : { do: "Takımlar hazırsa oyunu başlat.", say: "Telefonlar sadece cevap içindir. Başlıyoruz!" };
    case "round_intro":
      return { do: "Kuralı söyle, soruyu aç.", say: "Cevabı kaptan gönderir, masada konuşabilirsiniz." };
    case "question_open":
      return { do: "Süre akıyor. Herkes cevapladıysa erken kilitle.", say: "Süre bitmeden cevabı kilitleyin." };
    case "question_locked":
      return { do: "Cevabı göster.", say: "Süre doldu. Doğru cevaba bakalım." };
    case "answer_reveal":
      return { do: "Açıklamayı oku, itiraz var mı bak, skora geç.", say: "Puanlar işleniyor, tabloya bakalım." };
    case "scoreboard":
      return { do: "Sıralamayı yorumla, sonraki soruya geç.", say: "Sıradaki soru geliyor, hazır olun." };
    case "final":
      return { do: "Kazananı alkışla, mekan duyurusunu yap.", say: "Bu gecenin şampiyonu belli oldu!" };
  }
}
