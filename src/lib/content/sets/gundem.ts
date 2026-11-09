import type { FactSet, SingleSet } from "../gen";

// olay|yıl|alan  (2000-2025; olayların yılı tarihsel kayıtlara göre)
const EVENTS = [
  "Vladimir Putin'in Rusya devlet başkanı seçilmesi|2000|dünya", "11 Eylül saldırıları (ABD)|2001|dünya", "ABD'nin Afganistan'a askerî harekâtı|2001|dünya", "Euro banknot ve madeni paralarının dolaşıma girmesi|2002|dünya",
  "ABD liderliğindeki güçlerin Irak'a girmesi|2003|dünya", "Space Shuttle Columbia'nın parçalanması|2003|bilim", "Hint Okyanusu tsunamisi (26 Aralık)|2004|dünya", "Avrupa Birliği'nin on yeni üye kabul etmesi|2004|dünya",
  "Katrina Kasırgası'nın ABD'yi vurması|2005|dünya", "Papa II. Jean Paul'ün ölümü|2005|dünya", "Plüton'un cüce gezegen sınıfına alınması|2006|bilim", "Saddam Hüseyin'in idam edilmesi|2006|dünya", "Bulgaristan ve Romanya'nın AB'ye katılması|2007|dünya",
  "Lehman Brothers'ın iflası ve küresel mali krizin derinleşmesi|2008|dünya", "Barack Obama'nın ABD başkanı seçilmesi|2008|dünya", "H1N1 (domuz gribi) pandemisi|2009|dünya", "Haiti depremi|2010|dünya", "Eyjafjallajökull patlaması ve Avrupa hava trafiğinin durması|2010|dünya",
  "Arap Baharı'nın yayılması|2011|dünya", "Fukushima nükleer kazası|2011|dünya", "Usame bin Ladin'in öldürülmesi|2011|dünya", "Curiosity keşif aracının Mars'a inmesi|2012|bilim", "Papa Franciscus'un seçilmesi|2013|dünya", "Edward Snowden'ın gözetim belgelerini sızdırması|2013|dünya",
  "Rusya'nın Kırım'ı ilhak etmesi|2014|dünya", "Batı Afrika'da Ebola salgınının büyümesi|2014|dünya", "Paris İklim Anlaşması'nın kabulü|2015|dünya", "Suriyeli mültecilerin Avrupa'ya büyük akını|2015|dünya", "Birleşik Krallık'ın AB'den ayrılma referandumu (Brexit)|2016|dünya",
  "Donald Trump'ın ilk kez ABD başkanı seçilmesi|2016|dünya", "Emmanuel Macron'un Fransa cumhurbaşkanı seçilmesi|2017|dünya", "Tayland'da mağarada mahsur kalan çocukların kurtarılması|2018|dünya", "Notre-Dame Katedrali'nde büyük yangın|2019|dünya",
  "Hong Kong'da yaygın protestolar|2019|dünya", "İlk kara delik görüntüsünün yayımlanması|2019|bilim", "COVID-19'un pandemi ilan edilmesi|2020|dünya", "Beyrut Limanı'ndaki büyük patlama|2020|dünya", "ABD Kongre Binası'na baskın|2021|dünya",
  "Taliban'ın Kabil'i ele geçirmesi|2021|dünya", "Süveyş Kanalı'nın Ever Given gemisi tarafından tıkanması|2021|dünya", "Rusya'nın Ukrayna'ya topyekûn saldırısı|2022|dünya", "Kraliçe II. Elizabeth'in ölümü|2022|dünya", "Dünya nüfusunun 8 milyarı aşması|2022|dünya",
  "7 Ekim'de Hamas'ın İsrail'e saldırısı|2023|dünya", "Titan denizaltısının Titanik enkazı yakınında kaybolması|2023|dünya", "Donald Trump'ın ABD başkanlığına yeniden seçilmesi|2024|dünya", "Papa Franciscus'un ölümü ve Papa XIV. Leo'nun seçilmesi|2025|dünya",
  "Ahmet Necdet Sezer'in cumhurbaşkanı seçilmesi|2000|türkiye", "Şubat ekonomik krizi|2001|türkiye", "AK Parti'nin genel seçimde tek başına iktidara gelmesi|2002|türkiye", "İstanbul'da sinagog ve İngiliz Konsolosluğu saldırıları|2003|türkiye",
  "Yeni Türk Lirası'na geçiş (altı sıfırın atılması)|2005|türkiye", "Türkiye'nin AB ile katılım müzakerelerine başlaması|2005|türkiye", "Abdullah Gül'ün cumhurbaşkanı seçilmesi|2007|türkiye", "Hrant Dink suikastı|2007|türkiye", "Türkiye'nin BM Güvenlik Konseyi geçici üyeliğine seçilmesi|2008|türkiye",
  "12 Eylül anayasa referandumu|2010|türkiye", "Van depremi|2011|türkiye", "Gezi Parkı olayları|2013|türkiye", "Marmaray'ın hizmete açılması|2013|türkiye", "Cumhurbaşkanının ilk kez halk oyuyla seçilmesi|2014|türkiye", "7 Haziran ve 1 Kasım genel seçimleri|2015|türkiye",
  "15 Temmuz darbe girişimi|2016|türkiye", "Yavuz Sultan Selim Köprüsü'nün açılması|2016|türkiye", "Cumhurbaşkanlığı hükümet sistemine geçiş referandumu|2017|türkiye", "Cumhurbaşkanlığı hükümet sisteminin ilk seçimi (24 Haziran)|2018|türkiye", "İstanbul Havalimanı'nın açılması|2018|türkiye",
  "İstanbul büyükşehir seçiminin yenilenmesi|2019|türkiye", "Ayasofya'nın yeniden ibadete açılması|2020|türkiye", "Elazığ depremi|2020|türkiye", "İzmir Seferihisar açıklarındaki deprem|2020|türkiye", "Türkiye'nin İstanbul Sözleşmesi'nden çekilmesi|2021|türkiye",
  "Karadeniz'de Bozkurt (Kastamonu) sel felaketi|2021|türkiye", "Çanakkale 1915 Köprüsü'nün açılması|2022|türkiye", "6 Şubat Kahramanmaraş depremleri|2023|türkiye", "Cumhurbaşkanlığı seçiminde ikinci turun yapılması|2023|türkiye", "Cumhuriyet'in 100. yıl dönümü|2023|türkiye", "31 Mart yerel seçimleri|2024|türkiye",
  "Galatasaray'ın UEFA Kupası'nı kazanması|2000|spor", "Sydney Yaz Olimpiyatları|2000|spor", "Türkiye'nin Dünya Kupası'nı üçüncü bitirmesi|2002|spor", "Atina Yaz Olimpiyatları|2004|spor", "Dünya Kupası finalinde Zidane'ın kırmızı kartı|2006|spor", "Türkiye'nin Euro 2008'de yarı finale çıkması|2008|spor",
  "Pekin Yaz Olimpiyatları|2008|spor", "A Milli Basketbol Takımı'nın Dünya Şampiyonası'nda ikinci olması|2010|spor", "Almanya'nın Dünya Kupası yarı finalinde Brezilya'yı 7-1 yenmesi|2014|spor", "Soçi Kış Olimpiyatları|2014|spor", "Rio Yaz Olimpiyatları|2016|spor",
  "Leicester City'nin Premier Lig şampiyonluğu|2016|spor", "PyeongChang Kış Olimpiyatları|2018|spor", "Tokyo Olimpiyatları'nın pandemi nedeniyle ertelenmesi|2020|spor", "İtalya'nın Euro 2020 şampiyonluğu|2021|spor", "Arjantin'in Katar'da Dünya Kupası şampiyonluğu|2022|spor",
  "Filenin Sultanları'nın Avrupa şampiyonluğu|2023|spor", "Türkiye'nin Euro 2024'te çeyrek finale çıkması|2024|spor", "Paris Yaz Olimpiyatları|2024|spor",
  "İnsan genomunun ilk taslağının duyurulması|2000|bilim", "Wikipedia'nın kuruluşu|2001|teknoloji", "Facebook'un kuruluşu|2004|teknoloji", "YouTube'un kuruluşu|2005|teknoloji", "Twitter'ın kuruluşu|2006|teknoloji", "İlk iPhone'un tanıtılması|2007|teknoloji",
  "Android'in ilk telefonla piyasaya çıkması|2008|teknoloji", "CERN'de Büyük Hadron Çarpıştırıcısı'nın ilk çalıştırılması|2008|bilim", "Bitcoin ağının başlaması|2009|teknoloji", "Instagram'ın kuruluşu|2010|teknoloji", "İlk iPad'in tanıtılması|2010|teknoloji",
  "Higgs bozonuna dair bulguların açıklanması|2012|bilim", "Philae iniş aracının bir kuyruklu yıldıza inmesi|2014|bilim", "New Horizons'ın Plüton'un yakınından geçmesi|2015|bilim", "AlphaGo'nun Lee Sedol'ü yenmesi|2016|teknoloji", "CRISPR çalışmalarına Nobel Kimya Ödülü verilmesi|2020|bilim",
  "İlk mRNA COVID-19 aşılarının acil onayı|2020|bilim", "James Webb Uzay Teleskobu'nun fırlatılması|2021|bilim", "Facebook'un adını Meta olarak değiştirmesi|2021|teknoloji", "ChatGPT'nin kullanıma açılması|2022|teknoloji", "GPT-4'ün tanıtılması|2023|teknoloji",
  "Twitter'ın adının X olarak değiştirilmesi|2023|teknoloji", "Nobel Fizik Ödülü'nün yapay sinir ağları çalışmalarına verilmesi|2024|bilim",
  "Harry Potter serisinin ilk filminin vizyona girmesi|2001|kültür", "Sertab Erener'in Eurovision'u kazanması|2003|kültür", "Orhan Pamuk'un Nobel Edebiyat Ödülü'nü alması|2006|kültür", "Muhteşem Yüzyıl dizisinin yayına başlaması|2011|kültür", "Gangnam Style'ın küresel yayılması|2012|kültür",
  "Kış Uykusu'nun Cannes'da Altın Palmiye kazanması|2014|kültür", "Diriliş: Ertuğrul dizisinin yayına başlaması|2014|kültür", "Parazit'in Cannes'da Altın Palmiye kazanması|2019|kültür", "Parazit'in En İyi Film Oscar'ını kazanması|2020|kültür", "Squid Game'in yayımlanması|2021|kültür",
  "Barbie ve Oppenheimer filmlerinin aynı hafta vizyona girmesi|2023|kültür", "Oppenheimer'ın En İyi Film Oscar'ını kazanması|2024|kültür", "Anora'nın En İyi Film Oscar'ını kazanması|2025|kültür",
];
const AREA: Record<string, string> = { dünya: "dünya gündeminde", türkiye: "Türkiye gündeminde", spor: "spor gündeminde", bilim: "bilim gündeminde", teknoloji: "teknoloji gündeminde", kültür: "kültür-sanat gündeminde" };
const ROWS = EVENTS.map((r) => { const [o, y, a] = r.split("|"); return `${o}|${y}|${AREA[a]}`; });

const NOBEL_PEACE = ["2000|Kim Dae-jung", "2001|Birleşmiş Milletler ve Kofi Annan", "2002|Jimmy Carter", "2003|Şirin Ebadi", "2004|Wangari Maathai", "2005|Uluslararası Atom Enerjisi Ajansı ve Muhammed el-Baradey", "2006|Muhammed Yunus ve Grameen Bank", "2007|Hükümetlerarası İklim Değişikliği Paneli ve Al Gore",
  "2008|Martti Ahtisaari", "2009|Barack Obama", "2010|Liu Xiaobo", "2012|Avrupa Birliği", "2013|Kimyasal Silahların Yasaklanması Örgütü", "2014|Malala Yousafzai ve Kailash Satyarthi", "2016|Juan Manuel Santos", "2017|Nükleer Silahların Ortadan Kaldırılması Uluslararası Kampanyası (ICAN)",
  "2018|Denis Mukwege ve Nadia Murad", "2019|Abiy Ahmed", "2020|Dünya Gıda Programı", "2021|Maria Ressa ve Dmitry Muratov", "2023|Narges Mohammadi", "2024|Nihon Hidankyo"];

export const GUNDEM: FactSet[] = [
  { id: "gundem", cat: "Gündem", sub: "2000-2025 gündemi", diff: 2, rows: ROWS, asks: [
    { t: "{0} hangi yıl gerçekleşmiştir?", a: 1, by: [0], num: true },
    { t: "{1} yılında {2} aşağıdaki olaylardan hangisi yaşanmıştır?", a: 0, by: [], exSame: 1, near: 2 },
  ] },
  { id: "nobelbaris", cat: "Gündem", sub: "Nobel Barış Ödülü", diff: 3, rows: NOBEL_PEACE, asks: [{ t: "{0} Nobel Barış Ödülü'nü kim ya da hangi kuruluş kazanmıştır?", a: 1, by: [0], choice: true }] },
];

export const GUNDEM_SINGLES: SingleSet[] = [{
  id: "gnd1", cat: "Gündem", sub: "Güncel bilgiler", diff: 2, rows: [
    "2026 FIFA Dünya Kupası hangi üç ülkenin ortak ev sahipliğinde düzenlenmiştir?|ABD, Kanada ve Meksika|Kanada, Meksika ve ABD|ABD, Meksika ve Brezilya;Kanada, ABD ve Panama;Meksika, Kolombiya ve ABD",
    "2028 Yaz Olimpiyatları hangi şehirde düzenlenecektir?|Los Angeles||Brisbane;Paris;Roma",
    "2032 Yaz Olimpiyatları hangi şehirde düzenlenecektir?|Brisbane||Los Angeles;Doha;Madrid",
    "Euro 2024 hangi ülkede düzenlenmiştir?|Almanya||Fransa;İspanya;Türkiye",
    "Türkiye'nin yerli ve milli otomobil markası hangisidir?|Togg||Anadol;Devrim;Tofaş",
    "ChatGPT'yi geliştiren şirket hangisidir?|OpenAI||Google;Meta;Microsoft",
    "'Barbie' (2023) filmini yöneten kişi kimdir?|Greta Gerwig|Gerwig|Christopher Nolan;Sofia Coppola;Patty Jenkins",
    "'Oppenheimer' (2023) filmini yöneten kişi kimdir?|Christopher Nolan|Nolan|Denis Villeneuve;Greta Gerwig;Steven Spielberg",
    "Ayasofya 2020'de hangi statüye dönüştürülmüştür?|Cami|Camii|Müze;Kilise;Kütüphane",
    "Marmaray hangi yıl hizmete açılmıştır?|2013||2009;2016;2019",
    "İstanbul Havalimanı hangi yıl hizmete açılmıştır?|2018||2013;2020;2016",
    "Kahramanmaraş merkezli büyük depremler hangi tarihte yaşanmıştır?|6 Şubat 2023|6 Şubat|17 Ağustos 1999;23 Ekim 2011;24 Ocak 2020",
    "17 Ağustos 1999 depremi hangi bölgede yaşanmıştır?|Marmara (İzmit)|Marmara Bölgesi|Ege;Doğu Anadolu;Akdeniz",
    "Türkiye'de TL'den altı sıfır atılması hangi yıl gerçekleşmiştir (YTL'ye geçiş)?|2005||2000;2008;2010",
    "Birleşik Krallık hangi yıl resmen AB'den ayrılmıştır?|2020||2016;2018;2022",
    "NATO'ya 2023'te katılan ülke hangisidir?|Finlandiya||İsveç;Ukrayna;Gürcistan",
    "James Webb Uzay Teleskobu hangi uzay ajansı öncülüğünde geliştirilmiştir?|NASA||ESA;Roscosmos;JAXA",
    "Starship roketinin üreticisi şirket hangisidir?|SpaceX||Blue Origin;NASA;Boeing",
  ],
}];
