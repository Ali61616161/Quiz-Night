import type { FactSet, SingleSet } from "../gen";

// üniversite|şehir
const TR_UNI = [
  "Orta Doğu Teknik Üniversitesi|Ankara", "Bilkent Üniversitesi|Ankara", "Hacettepe Üniversitesi|Ankara", "Gazi Üniversitesi|Ankara", "Boğaziçi Üniversitesi|İstanbul", "Yıldız Teknik Üniversitesi|İstanbul", "Koç Üniversitesi|İstanbul",
  "Sabancı Üniversitesi|İstanbul", "Galatasaray Üniversitesi|İstanbul", "Bahçeşehir Üniversitesi|İstanbul", "Kadir Has Üniversitesi|İstanbul", "Özyeğin Üniversitesi|İstanbul", "Yeditepe Üniversitesi|İstanbul", "Acıbadem Üniversitesi|İstanbul",
  "Marmara Üniversitesi|İstanbul", "Mimar Sinan Güzel Sanatlar Üniversitesi|İstanbul", "Haliç Üniversitesi|İstanbul", "Beykent Üniversitesi|İstanbul", "Maltepe Üniversitesi|İstanbul", "Işık Üniversitesi|İstanbul", "MEF Üniversitesi|İstanbul",
  "Bezmialem Vakıf Üniversitesi|İstanbul", "Ege Üniversitesi|İzmir", "Dokuz Eylül Üniversitesi|İzmir", "Yaşar Üniversitesi|İzmir", "Anadolu Üniversitesi|Eskişehir", "Selçuk Üniversitesi|Konya", "Necmettin Erbakan Üniversitesi|Konya",
  "Erciyes Üniversitesi|Kayseri", "Abdullah Gül Üniversitesi|Kayseri", "Akdeniz Üniversitesi|Antalya", "Karadeniz Teknik Üniversitesi|Trabzon", "Ondokuz Mayıs Üniversitesi|Samsun", "Atatürk Üniversitesi|Erzurum", "Fırat Üniversitesi|Elazığ",
  "İnönü Üniversitesi|Malatya", "Dicle Üniversitesi|Diyarbakır", "Çukurova Üniversitesi|Adana", "Pamukkale Üniversitesi|Denizli", "Uludağ Üniversitesi|Bursa", "Namık Kemal Üniversitesi|Tekirdağ", "Trakya Üniversitesi|Edirne",
  "Süleyman Demirel Üniversitesi|Isparta", "Mustafa Kemal Üniversitesi|Hatay", "Harran Üniversitesi|Şanlıurfa", "Cumhuriyet Üniversitesi|Sivas", "Gaziosmanpaşa Üniversitesi|Tokat", "Ahi Evran Üniversitesi|Kırşehir", "Adnan Menderes Üniversitesi|Aydın",
  "Celal Bayar Üniversitesi|Manisa", "Dumlupınar Üniversitesi|Kütahya", "Abant İzzet Baysal Üniversitesi|Bolu", "Gebze Teknik Üniversitesi|Kocaeli", "Kafkas Üniversitesi|Kars", "Yüzüncü Yıl Üniversitesi|Van", "Munzur Üniversitesi|Tunceli",
  "Sütçü İmam Üniversitesi|Kahramanmaraş", "Hasan Kalyoncu Üniversitesi|Gaziantep", "Hitit Üniversitesi|Çorum",
];
const UNI_ABBR = ["ODTÜ|Orta Doğu Teknik Üniversitesi", "İTÜ|İstanbul Teknik Üniversitesi", "YTÜ|Yıldız Teknik Üniversitesi", "KTÜ|Karadeniz Teknik Üniversitesi", "DEÜ|Dokuz Eylül Üniversitesi", "ÖSYM|Ölçme, Seçme ve Yerleştirme Merkezi",
  "YÖK|Yükseköğretim Kurulu", "MEB|Milli Eğitim Bakanlığı", "KYK|Kredi ve Yurtlar Kurumu", "TÜBİTAK|Türkiye Bilimsel ve Teknolojik Araştırma Kurumu", "YKS|Yükseköğretim Kurumları Sınavı", "TYT|Temel Yeterlilik Testi", "AYT|Alan Yeterlilik Testi",
  "KPSS|Kamu Personeli Seçme Sınavı", "ALES|Akademik Personel ve Lisansüstü Eğitimi Giriş Sınavı", "YDS|Yabancı Dil Bilgisi Seviye Tespit Sınavı", "LGS|Liselere Geçiş Sınavı", "DGS|Dikey Geçiş Sınavı", "AÖF|Açıköğretim Fakültesi",
  "GANO|Genel Akademik Not Ortalaması", "ECTS|Avrupa Kredi Transfer Sistemi", "TÜBA|Türkiye Bilimler Akademisi", "BAU|Bahçeşehir Üniversitesi"];
// üniversite|ülke
const WORLD_UNI = [
  "Harvard Üniversitesi|ABD", "Massachusetts Teknoloji Enstitüsü (MIT)|ABD", "Stanford Üniversitesi|ABD", "Yale Üniversitesi|ABD", "Princeton Üniversitesi|ABD", "Columbia Üniversitesi|ABD", "Caltech|ABD", "Kaliforniya Üniversitesi, Berkeley|ABD",
  "Cornell Üniversitesi|ABD", "Johns Hopkins Üniversitesi|ABD", "Carnegie Mellon Üniversitesi|ABD", "Oxford Üniversitesi|Birleşik Krallık", "Cambridge Üniversitesi|Birleşik Krallık", "Imperial College London|Birleşik Krallık", "London School of Economics|Birleşik Krallık",
  "ETH Zürih|İsviçre", "EPFL|İsviçre", "Sorbonne Üniversitesi|Fransa", "École Polytechnique|Fransa", "Heidelberg Üniversitesi|Almanya", "Charles Üniversitesi|Çekya", "Tsinghua Üniversitesi|Çin", "Fudan Üniversitesi|Çin", "KAIST|Güney Kore",
  "Avustralya Ulusal Üniversitesi (ANU)|Avustralya", "McGill Üniversitesi|Kanada", "British Columbia Üniversitesi|Kanada", "Leiden Üniversitesi|Hollanda", "KU Leuven|Belçika", "Karolinska Enstitüsü|İsveç", "Uppsala Üniversitesi|İsveç", "Lund Üniversitesi|İsveç",
  "Trinity College Dublin|İrlanda", "El-Ezher Üniversitesi|Mısır", "Sapienza Üniversitesi|İtalya", "Bocconi Üniversitesi|İtalya", "Politecnico di Milano|İtalya", "Lomonosov Üniversitesi|Rusya", "Tel Aviv Üniversitesi|İsrail", "Ben-Gurion Üniversitesi|İsrail",
  "Salamanca Üniversitesi|İspanya", "Bologna Üniversitesi|İtalya", "Sao Paulo Üniversitesi (USP)|Brezilya", "Buenos Aires Üniversitesi|Arjantin", "Cape Town Üniversitesi|Güney Afrika", "Hong Kong Üniversitesi|Hong Kong",
];
// bölüm|meslek unvanı
const DEPTS = ["Diş Hekimliği|Diş hekimi", "Eczacılık|Eczacı", "Veterinerlik|Veteriner hekim", "Mimarlık|Mimar", "Hemşirelik|Hemşire", "Psikoloji|Psikolog", "Sosyoloji|Sosyolog", "Diyetetik (Beslenme ve Diyetetik)|Diyetisyen", "Fizyoterapi ve Rehabilitasyon|Fizyoterapist",
  "Gazetecilik|Gazeteci", "Şehir ve Bölge Planlama|Şehir plancısı", "Peyzaj Mimarlığı|Peyzaj mimarı", "Ziraat Mühendisliği|Ziraat mühendisi", "Jeoloji Mühendisliği|Jeoloji mühendisi", "Fizik|Fizikçi", "Kimya|Kimyager", "Matematik|Matematikçi", "Biyoloji|Biyolog",
  "Aktüerya|Aktüer", "Tıp|Hekim (doktor)", "Hukuk|Hukukçu (avukat, hâkim, savcı)", "Pilotaj|Pilot", "Mimari Restorasyon|Restoratör", "Arkeoloji|Arkeolog", "Antropoloji|Antropolog", "Biyomedikal Mühendisliği|Biyomedikal mühendisi", "Bilgisayar Mühendisliği|Bilgisayar mühendisi"];

// üniversite|kuruluş yılı
const FOUNDED_TR = ["Orta Doğu Teknik Üniversitesi|1956", "Bilkent Üniversitesi|1984", "Koç Üniversitesi|1993", "Hacettepe Üniversitesi|1967", "Ege Üniversitesi|1955", "Karadeniz Teknik Üniversitesi|1955", "Atatürk Üniversitesi|1957", "İstanbul Üniversitesi (modern)|1933",
  "Ankara Üniversitesi|1946", "Bahçeşehir Üniversitesi|1998", "Yeditepe Üniversitesi|1996", "Kadir Has Üniversitesi|1997", "Özyeğin Üniversitesi|2007", "Anadolu Üniversitesi|1982", "Dokuz Eylül Üniversitesi|1982", "Marmara Üniversitesi|1982", "Gazi Üniversitesi|1982"];
const FOUNDED_WORLD = ["Harvard Üniversitesi|1636", "Yale Üniversitesi|1701", "Princeton Üniversitesi|1746", "Columbia Üniversitesi|1754", "MIT|1861", "Stanford Üniversitesi|1885", "Cambridge Üniversitesi|1209", "Bologna Üniversitesi|1088", "Sorbonne Üniversitesi (ilk kuruluş)|1257",
  "Heidelberg Üniversitesi|1386", "Charles Üniversitesi (Prag)|1348", "Salamanca Üniversitesi|1218", "Karolinska Enstitüsü|1810", "Uppsala Üniversitesi|1477", "Leiden Üniversitesi|1575", "KU Leuven|1425", "Kaliforniya Üniversitesi, Berkeley|1868", "Caltech|1891",
  "Cornell Üniversitesi|1865", "Johns Hopkins Üniversitesi|1876", "Imperial College London|1907", "London School of Economics|1895", "ETH Zürih|1855", "Trinity College Dublin|1592", "Lomonosov Üniversitesi|1755", "Tsinghua Üniversitesi|1911"];

export const KAMPUS: FactSet[] = [
  { id: "ktr", cat: "Üniversite/Kampüs", sub: "Kuruluş yılları", diff: 3, rows: FOUNDED_TR, asks: [{ t: "{0} hangi yıl kurulmuştur?", a: 1, by: [0], num: true }, { t: "{1} yılında kurulan üniversite hangisidir?", a: 0, by: [1] }] },
  { id: "kdn", cat: "Üniversite/Kampüs", sub: "Kuruluş yılları", diff: 3, rows: FOUNDED_WORLD, asks: [{ t: "{0} hangi yıl kurulmuştur?", a: 1, by: [0], num: true }, { t: "{1} yılında kurulan üniversite hangisidir?", a: 0, by: [1] }] },
  { id: "tru", cat: "Üniversite/Kampüs", sub: "Türkiye'deki üniversiteler", diff: 2, rows: TR_UNI.filter((r) => !r.endsWith("|-")), asks: [{ t: "{0} hangi şehirdedir?", a: 1, by: [0], choice: true }] },
  { id: "kisalt", cat: "Üniversite/Kampüs", sub: "Eğitim kısaltmaları", diff: 1, rows: UNI_ABBR.filter((r) => !r.endsWith("|-")), asks: [
    { t: "{0} kısaltması neyi ifade eder?", a: 1, by: [0], choice: true },
    { t: "“{1}” ifadesinin kısaltması nedir?", a: 0, by: [1], choice: true },
  ] },
  { id: "wu", cat: "Üniversite/Kampüs", sub: "Dünya üniversiteleri", diff: 2, rows: WORLD_UNI, asks: [{ t: "{0} hangi ülkededir?", a: 1, by: [0], choice: true }] },
  { id: "bolum", cat: "Üniversite/Kampüs", sub: "Bölümler", diff: 1, rows: DEPTS, asks: [{ t: "{0} bölümü mezunları hangi unvanla çalışır?", a: 1, by: [0], choice: true }] },
];

export const KAMPUS_SINGLES: SingleSet[] = [{
  id: "kmp1", cat: "Üniversite/Kampüs", sub: "Kampüs hayatı", diff: 1, rows: [
    "Türkiye'de lisans eğitimi normalde kaç yıldır?|4|dört|2;3;5",
    "Türkiye'de ön lisans (meslek yüksekokulu) eğitimi kaç yıldır?|2|iki|1;3;4",
    "Tıp fakültesi eğitimi Türkiye'de kaç yıldır?|6|altı|4;5;7",
    "Diş hekimliği fakültesi eğitimi Türkiye'de kaç yıldır?|5|beş|4;6;7",
    "Eczacılık fakültesi eğitimi Türkiye'de kaç yıldır?|5|beş|4;6;3",
    "Veterinerlik fakültesi eğitimi Türkiye'de kaç yıldır?|5|beş|4;6;3",
    "Bir dönemin ortasında yapılan sınava genellikle ne denir?|Vize|Ara sınav|Final;Bütünleme;Quiz",
    "Dönem sonunda yapılan sınava genellikle ne denir?|Final|Dönem sonu sınavı|Vize;Quiz;Mazeret",
    "Başarısız olunan derslerden yeniden girilen sınava ne denir?|Bütünleme|But|Vize;Final;Quiz",
    "Haklı mazereti nedeniyle sınava giremeyen öğrencinin girdiği sınava ne denir?|Mazeret sınavı|Mazeret|Bütünleme;Vize;Final",
    "Öğrencinin belirli süre eğitime ara vermesine ne denir?|Kayıt dondurma|Kayıt dondurma (izin)|Mezuniyet;Yatay geçiş;Muafiyet",
    "Bir üniversiteden başka bir üniversiteye aynı seviyede geçişe ne denir?|Yatay geçiş||Dikey geçiş;Çift anadal;Yandal",
    "Meslek yüksekokulundan lisansa geçişe ne denir?|Dikey geçiş|DGS|Yatay geçiş;Çift anadal;Yandal",
    "Aynı anda iki lisans diploması almayı sağlayan programa ne denir?|Çift anadal|ÇAP|Yandal;Yatay geçiş;Muafiyet",
    "Mezuniyet töreninde takılan kareli şapkaya ne ad verilir?|Kep||Fötr;Bere;Takke",
    "Fakültenin yöneticisine ne denir?|Dekan||Rektör;Müdür;Bölüm başkanı",
    "Üniversitenin yöneticisine ne denir?|Rektör||Dekan;Müdür;Genel sekreter",
    "Lisansüstü eğitimde tez çalışmasını yöneten akademisyene ne denir?|Tez danışmanı|Danışman|Dekan;Rektör;Asistan",
    "Akademik unvan sıralamasında en üst unvan hangisidir?|Profesör||Doçent;Dr. Öğretim Üyesi;Araştırma görevlisi",
    "AA harf notunun katsayısı genellikle kaçtır?|4,00|4|3,00;3,50;5,00",
    "Erasmus programı hangi kıtanın öğrenci değişim programıdır?|Avrupa||Asya;Amerika;Afrika",
    "Erasmus adı hangi Hollandalı hümanistten gelir?|Rotterdamlı Erasmus|Erasmus|Spinoza;Rembrandt;Hugo",
    "Yurtlarda kalan öğrencilere devlet kredi ve burs veren kurum hangisidir?|KYK|Kredi ve Yurtlar Kurumu|MEB;YÖK;TÜBİTAK",
    "Üniversite giriş sınavı olan YKS'yi hangi kurum yapar?|ÖSYM||MEB;YÖK;TÜBİTAK",
    "Kampüste öğrencilerin kurduğu, ortak ilgi alanına göre faaliyet yapan topluluklara ne denir?|Öğrenci kulüpleri|Kulüp|Birlikler;Senatolar;Kurullar",
    "ODTÜ hangi yılda kurulmuştur?|1956||1946;1967;1971",
    "Bilkent Üniversitesi'nin kurucusu kimdir?|İhsan Doğramacı||Vehbi Koç;Sakıp Sabancı;Ali Sami Yen",
    "YÖK hangi yılda kurulmuştur?|1981||1973;1992;1960",
    "ÖSYM hangi yılda kurulmuştur?|1974||1965;1981;1992",
  ],
}];
