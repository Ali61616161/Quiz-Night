/** Sıralama ve tahmin soruları (elle yazılmış). Olgu tabloları sets/ altındadır. */
export interface OrderingFact { cat: string; text: string; items: string[]; diff: 1 | 2 | 3; explain?: string }
export const ORDERINGS: OrderingFact[] = [
  { cat: "Bilim", text: "Gezegenleri Güneş'e en yakından en uzağa doğru sırala.", items: ["Merkür", "Venüs", "Dünya", "Mars"], diff: 1 },
  { cat: "Tarih", text: "Olayları eskiden yeniye sırala.", items: ["Malazgirt Savaşı", "İstanbul'un fethi", "Cumhuriyetin ilanı", "Ay'a ilk iniş"], diff: 1 },
  { cat: "Bilim", text: "Hayvanları küçükten büyüğe (kütleye göre) sırala.", items: ["Karınca", "Kedi", "At", "Fil"], diff: 1 },
  { cat: "Coğrafya", text: "Dağları alçaktan yükseğe sırala.", items: ["Uludağ", "Erciyes", "Ağrı Dağı", "Everest"], diff: 2 },
  { cat: "Genel Kültür", text: "Ayları takvim sırasına göre dizin.", items: ["Mart", "Nisan", "Mayıs", "Haziran"], diff: 1 },
  { cat: "Tarih", text: "Çağları eskiden yeniye sırala.", items: ["Taş Devri", "Tunç Çağı", "Demir Çağı", "Orta Çağ"], diff: 2 },
  { cat: "Tarih", text: "Osmanlı padişahlarını tahta çıkış sırasına göre diz.", items: ["Osman Gazi", "Orhan Gazi", "I. Murad", "Yıldırım Bayezid"], diff: 2 },
  { cat: "Tarih", text: "Türkiye Cumhuriyeti cumhurbaşkanlarını görev sırasına göre diz.", items: ["Mustafa Kemal Atatürk", "İsmet İnönü", "Celal Bayar", "Cemal Gürsel"], diff: 2 },
  { cat: "Genel Kültür", text: "Zaman birimlerini kısadan uzuna sırala.", items: ["Saniye", "Dakika", "Saat", "Gün"], diff: 1 },
  { cat: "Futbol", text: "Dünya Kupası şampiyonlarını eskiden yeniye sırala.", items: ["Fransa (1998)", "Brezilya (2002)", "İtalya (2006)", "İspanya (2010)"], diff: 2 },
  { cat: "Genel Kültür", text: "Yaz Olimpiyatı ev sahiplerini eskiden yeniye sırala.", items: ["Atina", "Pekin", "Londra", "Rio de Janeiro"], diff: 2 },
  { cat: "Yerel", text: "İstanbul'daki Boğaz köprülerini açılış sırasına göre diz.", items: ["Boğaziçi Köprüsü", "Fatih Sultan Mehmet Köprüsü", "Yavuz Sultan Selim Köprüsü"], diff: 2 },
  { cat: "Üniversite/Kampüs", text: "Eğitim kademelerini sırayla diz.", items: ["İlkokul", "Ortaokul", "Lise", "Üniversite"], diff: 1 },
  { cat: "Bilim", text: "Gökkuşağı renklerini kırmızıdan başlayarak sırala.", items: ["Kırmızı", "Turuncu", "Sarı", "Yeşil"], diff: 1 },
  { cat: "Bilim", text: "Gezegenleri Güneş'ten uzaklığa göre sırala (Mars'tan başla).", items: ["Mars", "Jüpiter", "Satürn", "Uranüs"], diff: 2 },
];

/** Tahmin soruları: en yakın tahmin kazanır. */
export interface EstimateFact { cat: string; text: string; answer: number; unit?: string; diff: 1 | 2 | 3; explain?: string }
export const ESTIMATES: EstimateFact[] = [
  { cat: "Bilim", text: "Işığın boşluktaki hızı yaklaşık kaç km/sn'dir?", answer: 299792, diff: 2, explain: "Yaklaşık 299.792 km/sn." },
  { cat: "Coğrafya", text: "Everest Dağı'nın yüksekliği yaklaşık kaç metredir?", answer: 8849, diff: 2 },
  { cat: "Coğrafya", text: "Ağrı Dağı'nın yüksekliği yaklaşık kaç metredir?", answer: 5137, diff: 2 },
  { cat: "Yerel", text: "İstanbul'da kaç ilçe vardır?", answer: 39, diff: 2 },
  { cat: "Genel Kültür", text: "Türkiye'de kaç il vardır?", answer: 81, diff: 1 },
  { cat: "Genel Kültür", text: "Eyfel Kulesi yaklaşık kaç metre yüksekliğindedir?", answer: 330, diff: 3 },
  { cat: "Bilim", text: "Yetişkin bir insanda yaklaşık kaç kemik vardır?", answer: 206, diff: 2 },
  { cat: "Coğrafya", text: "Nil Nehri yaklaşık kaç kilometre uzunluğundadır?", answer: 6650, diff: 3 },
  { cat: "Bilim", text: "Dünya ile Güneş arasındaki ortalama uzaklık yaklaşık kaç milyon kilometredir?", answer: 150, diff: 2 },
  { cat: "Bilim", text: "Dünya ile Ay arasındaki ortalama uzaklık yaklaşık kaç bin kilometredir?", answer: 384, diff: 2 },
  { cat: "Tarih", text: "Mustafa Kemal Atatürk hangi yıl doğmuştur?", answer: 1881, diff: 2 },
  { cat: "Yerel", text: "Boğaziçi Köprüsü'nün toplam uzunluğu yaklaşık kaç metredir?", answer: 1560, diff: 3 },
  { cat: "Futbol", text: "Fenerbahçe hangi yıl kurulmuştur?", answer: 1907, diff: 2 },
  { cat: "Futbol", text: "Galatasaray hangi yıl kurulmuştur?", answer: 1905, diff: 2 },
  { cat: "Futbol", text: "Beşiktaş hangi yıl kurulmuştur?", answer: 1903, diff: 2 },
  { cat: "Futbol", text: "Trabzonspor hangi yıl kurulmuştur?", answer: 1967, diff: 3 },
  { cat: "Genel Kültür", text: "Türk alfabesinde kaç harf vardır?", answer: 29, diff: 1 },
  { cat: "Oyun", text: "Standart bir okey setinde kaç taş bulunur?", answer: 106, diff: 2 },
  { cat: "Tarih", text: "Edmund Hillary ve Tenzing Norgay Everest'e hangi yıl tırmandı?", answer: 1953, diff: 3 },
  { cat: "Genel Kültür", text: "Dünyanın nüfusu yaklaşık kaç milyardır?", answer: 8, diff: 2 },
  { cat: "Genel Kültür", text: "Türkiye'nin nüfusu yaklaşık kaç milyondur?", answer: 85, diff: 2 },
  { cat: "Yerel", text: "İstanbul'un nüfusu yaklaşık kaç milyondur?", answer: 16, diff: 2 },
  { cat: "Coğrafya", text: "Dünyanın çevresi ekvatorda yaklaşık kaç kilometredir?", answer: 40075, diff: 3 },
  { cat: "Tarih", text: "Titanic hangi yıl battı?", answer: 1912, diff: 2 },
];
