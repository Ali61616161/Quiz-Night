import type { FactSet, SingleSet } from "../gen";

// hayvan|beslenme
const DIET = ["Aslan|Etçil", "Kaplan|Etçil", "Çita|Etçil", "Leopar|Etçil", "Kurt|Etçil", "Köpekbalığı|Etçil", "Yunus|Etçil", "Timsah|Etçil", "Kartal|Etçil", "Baykuş|Etçil", "Penguen|Etçil", "Kutup ayısı|Etçil", "Kobra|Etçil", "Akrep|Etçil",
  "Zebra|Otçul", "Fil|Otçul", "Zürafa|Otçul", "Gergedan|Otçul", "Su aygırı|Otçul", "Koala|Otçul", "Kanguru|Otçul", "Koyun|Otçul", "İnek|Otçul", "Keçi|Otçul", "At|Otçul", "Tavşan|Otçul", "Goril|Otçul", "Deve|Otçul", "Geyik|Otçul", "Büyük panda|Otçul",
  "Kahverengi ayı|Hepçil", "Domuz|Hepçil", "Şempanze|Hepçil", "Karınca|Hepçil", "Sincap|Hepçil", "Kuzgun|Hepçil", "Rakun|Hepçil", "Fare|Hepçil", "Karga|Hepçil"];
// anne hayvan|yavru adı
const YOUNG = ["İnek|Buzağı", "Koyun|Kuzu", "Keçi|Oğlak", "At (kısrak)|Tay", "Eşek|Sıpa", "Tavuk|Civciv", "Kurbağa|İribaş", "Kelebek|Tırtıl (larva)", "Köpek|Köpek yavrusu (enik)"];
// hayvan|ses
const SOUND = ["Köpek|Havlar", "Kedi|Miyavlar", "İnek|Böğürür", "Koyun|Meler", "At|Kişner", "Horoz|Öter", "Eşek|Anırır", "Aslan|Kükrer", "Kurt|Uluyan", "Kurbağa|Vıraklar", "Arı|Vızıldar", "Yılan|Tıslar", "Ördek|Vaklar", "Tavuk|Gıdaklar", "Karga|Gaklar", "Güvercin|Guruldar", "Hindi|Gulu gulu der"];
// ülke|ulusal/simge hayvan
const NATIONAL = ["ABD|Kel kartal", "Avustralya|Kanguru", "Çin|Dev panda", "Hindistan|Bengal kaplanı", "Rusya|Kahverengi ayı", "Kanada|Kunduz", "İskoçya|Tek boynuzlu at (unicorn)", "Yeni Zelanda|Kivi", "Güney Afrika|Springbok", "Meksika|Altın kartal"];
// milli park/yer|ülke
const PARKS = ["Yellowstone Milli Parkı|ABD", "Yosemite Milli Parkı|ABD", "Serengeti Milli Parkı|Tanzanya", "Kruger Milli Parkı|Güney Afrika", "Galápagos Adaları|Ekvador", "Kakadu Milli Parkı|Avustralya", "Banff Milli Parkı|Kanada", "Fiordland Milli Parkı|Yeni Zelanda",
  "Plitvice Gölleri Milli Parkı|Hırvatistan", "Torres del Paine Milli Parkı|Şili", "Okavango Deltası|Botsvana", "Ngorongoro Krateri|Tanzanya"];
// yanardağ|ülke
const VOLCANO = ["Vezüv|İtalya", "Etna|İtalya", "Stromboli|İtalya", "Fuji Dağı|Japonya", "Krakatau|Endonezya", "Merapi|Endonezya", "Kilauea|ABD", "Mauna Loa|ABD", "Eyjafjallajökull|İzlanda", "Popocatépetl|Meksika", "Pinatubo|Filipinler", "Erciyes Dağı (sönmüş)|Türkiye", "Ağrı Dağı (sönmüş)|Türkiye", "Hasan Dağı (sönmüş)|Türkiye", "Nemrut (Bitlis, sönmüş)|Türkiye"];
// bitki|Türkiye'de en çok yetiştiği bölge
const CROPS = ["Çay|Karadeniz", "Fındık|Karadeniz", "Zeytin|Ege", "Muz|Akdeniz", "Narenciye (turunçgil)|Akdeniz", "Üzüm (sofralık ve kuru)|Ege", "İncir|Ege", "Kayısı|Doğu Anadolu", "Antep fıstığı|Güneydoğu Anadolu", "Şeker pancarı|İç Anadolu", "Buğday|İç Anadolu"];
const CLIMATE = ["Akdeniz iklimi|Akdeniz Bölgesi kıyıları", "Karadeniz iklimi (her mevsim yağışlı)|Karadeniz kıyıları", "Karasal iklim|İç Anadolu"];

// hayvan|yaşam ortamı
const HABITAT = ["Köpekbalığı|Okyanus ve denizler", "Ahtapot|Okyanus ve denizler", "Mavi balina|Okyanus ve denizler", "Yunus|Okyanus ve denizler", "Penguen|Kutup bölgeleri", "Kutup ayısı|Kutup bölgeleri", "Deve|Çöl", "Akrep|Çöl", "Orangutan|Yağmur ormanı", "Goril|Yağmur ormanı", "Jaguar|Yağmur ormanı",
  "Aslan|Savan", "Zebra|Savan", "Zürafa|Savan", "Çita|Savan", "Fil|Savan", "Su aygırı|Nehir ve göller", "Timsah|Nehir ve göller", "Kunduz|Nehir ve göller", "Kartal|Dağ ve yüksek kayalıklar", "Kurt|Orman ve bozkır", "Yeşil kaplumbağa|Okyanus ve denizler"];
// hayvan|bacak sayısı
const LEGS = ["Kedi|4", "Kuş|2", "Böcek|6", "Örümcek|8", "Yengeç|10", "Karınca|6", "Kurbağa|4", "Yılan|0", "Köpek|4", "Arı|6", "Akrep|8", "Sinek|6"];

export const DOGA: FactSet[] = [
  { id: "habitat", cat: "Doğa ve Hayvanlar", sub: "Yaşam ortamları", diff: 1, rows: HABITAT, asks: [{ t: "{0} doğal olarak en çok nerede yaşar?", a: 1, by: [0], choice: true }] },
  { id: "bacak", cat: "Doğa ve Hayvanlar", sub: "Hayvanlar", diff: 1, rows: LEGS, asks: [{ t: "{0} kaç bacaklıdır?", a: 1, by: [0], num: true, choice: true }] },
  { id: "beslenme", cat: "Doğa ve Hayvanlar", sub: "Hayvanlar", diff: 1, rows: DIET, asks: [{ t: "{0} beslenme şekline göre hangisidir?", a: 1, by: [0], choice: true }] },
  { id: "yavru", cat: "Doğa ve Hayvanlar", sub: "Hayvanlar", diff: 1, rows: YOUNG, asks: [{ t: "{0} yavrusuna ne denir?", a: 1, by: [0], choice: true }] },
  { id: "ses", cat: "Doğa ve Hayvanlar", sub: "Hayvanlar", diff: 1, rows: SOUND, asks: [{ t: "{0} çıkardığı sesi tanımlayan fiil hangisidir?", a: 1, by: [0], choice: true }] },
  { id: "ulusal", cat: "Doğa ve Hayvanlar", sub: "Simge hayvanlar", diff: 2, rows: NATIONAL, asks: [{ t: "{0} ile en çok özdeşleşen simge hayvan hangisidir?", a: 1, by: [0], choice: true }] },
  { id: "park", cat: "Doğa ve Hayvanlar", sub: "Doğa harikaları", diff: 2, rows: PARKS, asks: [{ t: "{0} hangi ülkededir?", a: 1, by: [0], choice: true }] },
  { id: "yanardag", cat: "Doğa ve Hayvanlar", sub: "Yanardağlar", diff: 2, rows: VOLCANO, asks: [{ t: "{0} hangi ülkededir?", a: 1, by: [0], choice: true }] },
  { id: "urun", cat: "Doğa ve Hayvanlar", sub: "Bitkiler ve tarım", diff: 2, rows: CROPS, asks: [{ t: "{0} Türkiye'de en çok hangi bölgede yetiştirilir?", a: 1, by: [0], choice: true }] },
  { id: "iklim", cat: "Doğa ve Hayvanlar", sub: "İklim", diff: 2, rows: CLIMATE, asks: [{ t: "{0} Türkiye'de nerede görülür?", a: 1, by: [0], choice: true }] },
];

export const DOGA_SINGLES: SingleSet[] = [{
  id: "dga1", cat: "Doğa ve Hayvanlar", sub: "Doğa bilgisi", diff: 1, rows: [
    "Dünyanın en büyük hayvanı hangisidir?|Mavi balina||Afrika fili;Köpekbalığı;Kaşalot",
    "En hızlı kara hayvanı hangisidir?|Çita||Aslan;Antilop;At",
    "En uzun boylu kara hayvanı hangisidir?|Zürafa||Fil;Deve;Devekuşu",
    "En ağır kara hayvanı hangisidir?|Afrika fili|Fil|Gergedan;Su aygırı;Zürafa",
    "Dünyanın en büyük kuşu hangisidir?|Devekuşu||Albatros;Kondor;Emu",
    "Dünyanın en küçük kuşu hangisidir?|Arı kolibrisi|Kolibri|Serçe;Çıta;Sığırcık",
    "Hangi kuş uçamaz ve Antarktika'da yaşar?|Penguen||Kivi;Devekuşu;Emu",
    "Hangi memeli yumurtlar?|Ornitorenk|Gagalı memeli|Yarasa;Yunus;Kanguru",
    "Uçabilen tek memeli grubu hangisidir?|Yarasalar|Yarasa|Sincaplar;Kuş türleri;Yunuslar",
    "Kelebeğin tırtıl hâlinden kelebeğe dönüşme sürecine ne denir?|Başkalaşım (metamorfoz)|Metamorfoz|Gelişim;Evrim;Bölünme",
    "Arılar bal üretmek için çiçeklerden ne toplar?|Nektar|Çiçek nektarı|Polen;Reçine;Su",
    "Bir arı kovanında yumurta bırakan tek dişi arıya ne denir?|Ana arı|Kraliçe arı|İşçi arı;Erkek arı;Bekçi arı",
    "Karıncalar hangi yapıda yaşar?|Koloni|Karınca yuvası|Sürü;Küme;Sığınak",
    "Develerin hörgüçlerinde ne depolanır?|Yağ||Su;Kum;Süt",
    "Ahtapotun kaç kolu vardır?|8|sekiz|6;10;12",
    "Örümceklerin kaç bacağı vardır?|8|sekiz|6;10;12",
    "Böceklerin kaç bacağı vardır?|6|altı|4;8;10",
    "Denizyıldızı hangi grupta yer alır?|Derisidikenliler|Derisi dikenliler|Yumuşakçalar;Balıklar;Kabuklular",
    "Dünyanın en zehirli deniz canlılarından biri olan kutu denizanası hangi bölgede yaygındır?|Avustralya kıyıları|Avustralya|Akdeniz;Karadeniz;Baltık",
    "Hangi hayvan 'çölün gemisi' olarak bilinir?|Deve||At;Eşek;Katır",
    "Hangi hayvan 'ormanın kralı' olarak anılır (mecazi)?|Aslan||Kaplan;Ayı;Kurt",
    "Kutup ayıları hangi bölgede yaşar?|Kuzey Kutbu (Arktik)|Arktik|Antarktika;Sibirya;Alaska ormanları",
    "Penguenler hangi yarım kürede doğal olarak yaşar?|Güney Yarımküre|Güney yarım küre|Kuzey Yarımküre;Ekvator;Tüm dünya",
    "Dünyanın en uzun ömürlü kara hayvanlarından biri hangisidir?|Dev kaplumbağa|Kaplumbağa|Fil;Papağan;At",
    "Bitkilerin gıda üretme sürecine ne denir?|Fotosentez||Solunum;Terleme;Sindirim",
    "Bitkilerin yeşil rengini veren madde nedir?|Klorofil||Karoten;Melanin;Hemoglobin",
    "Çiçekli bitkilerde tozlaşmaya en çok yardımcı olan canlılar hangileridir?|Arılar ve diğer böcekler|Arılar|Balıklar;Kuşlar;Yılanlar",
    "Dünyanın en hızlı büyüyen bitkilerinden biri hangisidir?|Bambu||Meşe;Çam;Kaktüs",
    "Kaktüsler nerede yaşar?|Çöl ve kurak bölgelerde|Çöl|Ormanlarda;Tundrada;Göllerde",
    "Dünyanın en büyük çiçeği (Rafflesia) hangi bölgede yetişir?|Güneydoğu Asya|Endonezya|Amazon;Avrupa;Afrika",
    "Hangi gaz ozon tabakasını incelten başlıca maddelerden biridir?|CFC (kloroflorokarbon)|CFC|Oksijen;Azot;Helyum",
    "Sera etkisine en çok katkı yapan gaz hangisidir?|Karbondioksit|CO2|Oksijen;Azot;Argon",
    "Türkiye'deki en büyük deprem kuşaklarından biri olan fay hattı hangisidir?|Kuzey Anadolu Fayı|KAF|Doğu Anadolu Fayı;Ege Fayı;Toros Fayı",
    "Deprem anında yer altında enerjinin açığa çıktığı noktaya ne denir?|Odak (hiposantr)|Hiposantr;Odak noktası|Merkez üssü;Fay hattı;Sismograf",
    "Depremin yer yüzünde en şiddetli hissedildiği noktaya ne denir?|Merkez üssü (episantr)|Episantr|Odak;Fay;Sismograf",
    "Depremi kaydeden alete ne denir?|Sismograf||Barometre;Termometre;Higrometre",
    "Atmosfer basıncını ölçen alete ne denir?|Barometre||Termometre;Higrometre;Anemometre",
    "Rüzgârın hızını ölçen alete ne denir?|Anemometre||Barometre;Higrometre;Pluviyometre",
    "Yağış miktarını ölçen alete ne denir?|Yağış ölçer (pluviyometre)|Pluviyometre|Barometre;Anemometre;Higrometre",
    "Havadaki nem oranını ölçen alete ne denir?|Higrometre|Nem ölçer|Barometre;Termometre;Anemometre",
    "Dünya'nın en büyük tropikal yağmur ormanı hangisidir?|Amazon Ormanları|Amazon|Kongo;Borneo;Daintree",
    "Dünyanın en büyük mercan resifi sistemi hangisidir?|Büyük Set Resifi|Great Barrier Reef|Kızıldeniz Resifi;Belize Resifi;Maldiv Resifi",
    "Türkiye'nin en büyük milli parkı hangisidir?|Ağrı Dağı Milli Parkı|Ağrı Dağı|Kaçkar Dağları;Munzur Vadisi;Köprülü Kanyon",
    "Aşağıdakilerden hangisi Türkiye'deki doğal tuz gölüdür?|Tuz Gölü||Eğirdir Gölü;Beyşehir Gölü;İznik Gölü",
    "Pamukkale travertenlerinin beyaz renginin nedeni nedir?|Kalsiyum karbonat birikimi|Kalsiyum karbonat|Tuz;Kar;Kum",
    "Güneş'ten gelen zararlı morötesi ışınları büyük oranda tutan tabaka hangisidir?|Ozon tabakası|Ozon|Troposfer;Mezosfer;İyonosfer",
    "Hava olaylarının yaşandığı atmosfer katmanı hangisidir?|Troposfer||Stratosfer;Mezosfer;Termosfer",
    "Su döngüsünde yeryüzünden suyun buhar halinde atmosfere çıkmasına ne denir?|Buharlaşma||Yoğuşma;Yağış;Süzülme",
    "Kelebeklerin kanatlarındaki renkli tozlara ne denir?|Pullar|Kanat pulları|Tüyler;Polenler;Kıllar",
    "Hangi böcek ışık üretebilir?|Ateş böceği|Kıvılcım böceği|Uğur böceği;Karınca;Kelebek",
    "Bukalemun hangi özelliğiyle ünlüdür?|Rengini değiştirmesi|Renk değiştirme|Uçabilmesi;Su altında yaşaması;Zehir üretmesi",
    "Kutup ayısının kürkünün altındaki derisi hangi renktedir?|Siyah||Beyaz;Pembe;Gri",
    "Zürafanın boynunda kaç tane boyun omuru bulunur?|7|yedi|5;9;12",
    "Fillerin burnuna ne ad verilir?|Hortum|Fil hortumu|Boynuz;Gaga;Çene",
    "Kuşların yumurtayı sıcak tutmak için üzerine oturmasına ne denir?|Kuluçka|Kuluçkaya yatma|Beslenme;Göç;Tüy dökme",
    "Hangi hayvan kış uykusuna yatar?|Ayı|Kahverengi ayı|Aslan;Zürafa;Fil",
    "Yeryüzündeki canlıların besin zincirinde ilk halka genellikle nedir?|Üreticiler (bitkiler)|Bitkiler|Etçiller;Otçullar;Ayrıştırıcılar",
    "Bitki yiyen canlılara ne ad verilir?|Otçul|Otobur|Etçil;Hepçil;Leşçil",
    "Hem bitki hem et yiyen canlılara ne ad verilir?|Hepçil|Omnivor|Otçul;Etçil;Ayrıştırıcı",
    "Ölü canlıları ayrıştırarak doğaya geri kazandıran canlılara ne denir?|Ayrıştırıcılar|Mantarlar ve bakteriler|Üreticiler;Otçullar;Etçiller",
  ],
}];
