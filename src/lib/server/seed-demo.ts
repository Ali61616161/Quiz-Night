import type { Question } from "@/lib/engine/types";

/** Faz 1 geliştirme verisi. 400+ soruluk havuz Faz 3'te veritabanına taşınır. */
export const DEMO_QUESTIONS: Question[] = [
  { id: "d1", category: "Coğrafya", kind: "choice", text: "Türkiye'nin başkenti neresidir?", options: ["İstanbul", "Ankara", "İzmir", "Bursa"], correct: "Ankara", accepted: [], explanation: "Başkent 1923'ten beri Ankara." },
  { id: "d2", category: "Tarih", kind: "open", text: "İstanbul'un fethi hangi yıl gerçekleşti?", correct: "1453", accepted: [], explanation: "II. Mehmed, 29 Mayıs 1453." },
  { id: "d3", category: "Futbol", kind: "choice", text: "Bir futbol takımı sahada kaç oyuncuyla başlar?", options: ["9", "10", "11", "12"], correct: "11", accepted: [] },
  { id: "d4", category: "Bilim", kind: "open", text: "Suyun kimyasal formülü nedir?", correct: "H2O", accepted: ["h2o"], explanation: "İki hidrojen, bir oksijen." },
  { id: "d5", category: "Yemek", kind: "choice", text: "Baklavanın ana hamur malzemesi hangisidir?", options: ["Yufka", "Pirinç", "Bulgur", "Mısır unu"], correct: "Yufka", accepted: [] },
];
