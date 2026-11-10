import type { FactSet, SingleSet } from "../gen";

// olay|yıl
const EVENTS = [
  "Malazgirt Savaşı|1071", "I. Haçlı Seferi'nin fiilen başlaması|1096", "Miryokefalon Savaşı|1176", "Kösedağ Savaşı|1243", "Osman Bey'in beyliğinin geleneksel kuruluş tarihi (yaklaşık)|1299",
  "Birinci Kosova Savaşı|1389", "Niğbolu Savaşı|1396", "Ankara Savaşı|1402", "İstanbul'un fethi|1453", "Otlukbeli Savaşı|1473", "Çaldıran Savaşı|1514", "Mercidabık Savaşı|1516", "Ridaniye Savaşı|1517",
  "Belgrad'ın fethi|1521", "Rodos'un fethi|1522", "Mohaç Meydan Muharebesi|1526", "Birinci Viyana Kuşatması|1529", "Preveze Deniz Savaşı|1538", "Cerbe Deniz Savaşı|1560", "Kıbrıs'ın fethinin tamamlanması|1571",
  "İnebahtı Deniz Savaşı|1571", "İkinci Viyana Kuşatması|1683", "Karlofça Antlaşması|1699", "Pasarofça Antlaşması|1718", "Küçük Kaynarca Antlaşması|1774", "Kabakçı Mustafa İsyanı|1807", "Sened-i İttifak'ın imzalanması|1808",
  "Yeniçeri Ocağı'nın kaldırılması (Vaka-i Hayriye)|1826", "Navarin Deniz Savaşı|1827", "Tanzimat Fermanı'nın ilanı|1839", "Islahat Fermanı'nın ilanı|1856", "Kırım Savaşı'nın başlaması|1853",
  "Birinci Meşrutiyet'in ilanı (Kanun-ı Esasi)|1876", "93 Harbi'nin başlaması|1877", "Berlin Antlaşması|1878", "İkinci Meşrutiyet'in ilanı|1908", "31 Mart Olayı|1909", "Trablusgarp Savaşı'nın başlaması|1911",
  "Balkan Savaşları'nın başlaması|1912", "Bab-ı Ali Baskını|1913", "Osmanlı Devleti'nin I. Dünya Savaşı'na girmesi|1914", "Çanakkale Kara Savaşları'nın başlaması|1915", "Çanakkale Deniz Zaferi|1915",
  "Kut'ül Amare Zaferi|1916", "Mondros Ateşkes Antlaşması|1918", "İzmir'in işgali|1919", "Mustafa Kemal'in Samsun'a çıkışı|1919", "Amasya Genelgesi|1919", "Erzurum Kongresi|1919", "Sivas Kongresi|1919",
  "Misak-ı Millî'nin kabulü|1920", "TBMM'nin açılışı|1920", "Sevr Antlaşması'nın imzalanması|1920", "Birinci İnönü Savaşı|1921", "İkinci İnönü Savaşı|1921", "Sakarya Meydan Muharebesi|1921",
  "Teşkilat-ı Esasiye Kanunu'nun kabulü|1921", "Büyük Taarruz|1922", "Başkomutanlık Meydan Muharebesi|1922", "Mudanya Ateşkes Antlaşması|1922", "Saltanatın kaldırılması|1922", "İzmir İktisat Kongresi|1923",
  "Lozan Antlaşması'nın imzalanması|1923", "Cumhuriyet'in ilanı|1923", "Hilafetin kaldırılması|1924", "Tevhid-i Tedrisat Kanunu'nun kabulü|1924", "Şeyh Sait İsyanı|1925", "Şapka Kanunu'nun kabulü|1925",
  "Medeni Kanun'un kabulü|1926", "Harf Devrimi (yeni Türk harflerinin kabulü)|1928", "Kadınlara belediye seçimlerinde seçme ve seçilme hakkının tanınması|1930", "Kadınlara milletvekili seçme ve seçilme hakkının tanınması|1934",
  "Soyadı Kanunu'nun kabulü|1934", "Montrö Boğazlar Sözleşmesi|1936", "Atatürk'ün vefatı|1938", "Hatay'ın Türkiye'ye katılması|1939", "Köy Enstitüleri'nin kuruluşu|1940", "Demokrat Parti'nin kuruluşu|1946",
  "Demokrat Parti'nin iktidara gelmesi|1950", "Türkiye'nin NATO'ya katılması|1952", "27 Mayıs darbesi|1960", "Boğaziçi Köprüsü'nün açılışı|1973", "Kıbrıs Barış Harekâtı|1974", "12 Eylül darbesi|1980",
  "Türkiye'nin Avrupa Topluluğu'na tam üyelik başvurusu|1987", "Fatih Sultan Mehmet Köprüsü'nün açılışı|1988", "Gümrük Birliği'nin yürürlüğe girmesi|1996", "Marmara depremi (17 Ağustos)|1999",
  "Türkiye'nin AB ile katılım müzakerelerine başlaması|2005", "Marmaray'ın açılışı|2013", "15 Temmuz darbe girişimi|2016", "Yavuz Sultan Selim Köprüsü'nün açılışı|2016",
  "Milan Fermanı|313", "İstanbul'un Roma İmparatorluğu'nun başkenti ilan edilmesi|330", "Roma İmparatorluğu'nun ikiye bölünmesi|395", "Romulus Augustulus'un tahttan indirilmesi (Batı Roma'nın geleneksel sonu)|476", "Hicret|622",
  "Şarlman'ın imparator ilan edilmesi|800", "Hastings Savaşı|1066", "Kudüs'ün Selahaddin Eyyubi tarafından fethi|1187", "Cengiz Han'ın Moğol Devleti'ni kurması|1206", "Magna Carta'nın imzalanması|1215",
  "Moğolların Bağdat'ı yıkması|1258", "Yüzyıl Savaşları'nın başlaması|1337", "Kristof Kolomb'un Amerika'ya ulaşması|1492", "Granada'nın düşüşü|1492", "Vasco da Gama'nın Hindistan'a ulaşması|1498",
  "Martin Luther'in 95 tezi yayımlaması|1517", "Magellan seferinin yola çıkması|1519", "Newton'un Principia'yı yayımlaması|1687", "Amerikan Bağımsızlık Bildirgesi'nin ilanı|1776", "Fransız Devrimi|1789",
  "Napolyon'un imparator ilan edilmesi|1804", "Waterloo Savaşı|1815", "Darwin'in Türlerin Kökeni'ni yayımlaması|1859", "Amerikan İç Savaşı'nın başlaması|1861", "İtalya Krallığı'nın ilanı|1861",
  "Amerika'da kölelik yasağı (13. Değişiklik)|1865", "Almanya'nın birleşmesi|1871", "Telefonun icadı|1876", "Elektrik ampulünün geliştirilmesi|1879", "Wright Kardeşler'in ilk motorlu uçuşu|1903",
  "Einstein'ın özel görelilik kuramını yayımlaması|1905", "Titanic'in batışı|1912", "Birinci Dünya Savaşı'nın başlaması|1914", "Birinci Dünya Savaşı'nın sona ermesi|1918", "Rus Devrimi (Ekim Devrimi)|1917",
  "Versay Antlaşması|1919", "Tutankamon'un mezarının bulunması|1922", "Penisilinin keşfi|1928", "Büyük Buhran'ın başlaması (Wall Street çöküşü)|1929", "Hitler'in Almanya'da başbakan olması|1933",
  "İkinci Dünya Savaşı'nın başlaması|1939", "Pearl Harbor saldırısı|1941", "Normandiya Çıkarması|1944", "Hiroşima'ya atom bombası atılması|1945", "İkinci Dünya Savaşı'nın sona ermesi|1945",
  "Birleşmiş Milletler'in kuruluşu|1945", "İsrail'in kuruluşu|1948", "İnsan Hakları Evrensel Beyannamesi'nin kabulü|1948", "NATO'nun kuruluşu|1949", "Çin Halk Cumhuriyeti'nin kuruluşu|1949",
  "Kore Savaşı'nın başlaması|1950", "DNA'nın çift sarmal yapısının açıklanması|1953", "Everest'e ilk başarılı tırmanış|1953", "Sputnik 1'in fırlatılması|1957", "Roma Antlaşması'nın imzalanması|1957",
  "İlk insanın uzaya gönderilmesi (Yuri Gagarin)|1961", "Berlin Duvarı'nın inşası|1961", "Küba Füze Krizi|1962", "İnsanın Ay'a ilk inişi|1969", "Saygon'un düşmesi (Vietnam Savaşı'nın sonu)|1975",
  "Çernobil nükleer kazası|1986", "Berlin Duvarı'nın yıkılışı|1989", "Sovyetler Birliği'nin dağılması|1991", "Maastricht Antlaşması'nın imzalanması|1992", "Dolly adlı koyunun klonlanması|1996", "11 Eylül saldırıları|2001",
  "Euro'nun nakit olarak dolaşıma girmesi|2002", "İlk iPhone'un tanıtılması|2007", "Birleşik Krallık'ın AB'den ayrılma referandumu|2016", "COVID-19'un pandemi ilan edilmesi|2020",
];

// sıra|padişah|tahta çıkış yılı
const SULTANS = [
  "1|Osman Gazi;Osman Bey;I. Osman|1299", "2|Orhan Gazi;Orhan Bey|1324", "3|I. Murad;Murad Hüdavendigâr|1362", "4|Yıldırım Bayezid;I. Bayezid|1389", "5|Çelebi Mehmed;I. Mehmed|1413", "6|II. Murad|1421",
  "7|Fatih Sultan Mehmed;II. Mehmed|1451", "8|II. Bayezid|1481", "9|Yavuz Sultan Selim;I. Selim|1512", "10|Kanuni Sultan Süleyman;I. Süleyman|1520", "11|II. Selim|1566", "12|III. Murad|1574",
  "13|III. Mehmed|1595", "14|I. Ahmed|1603", "15|I. Mustafa|1617", "16|II. Osman;Genç Osman|1618", "17|IV. Murad|1623", "18|Sultan İbrahim;I. İbrahim|1640", "19|IV. Mehmed|1648", "20|II. Süleyman|1687",
  "21|II. Ahmed|1691", "22|II. Mustafa|1695", "23|III. Ahmed|1703", "24|I. Mahmud|1730", "25|III. Osman|1754", "26|III. Mustafa|1757", "27|I. Abdülhamid|1774", "28|III. Selim|1789", "29|IV. Mustafa|1807",
  "30|II. Mahmud|1808", "31|Abdülmecid;I. Abdülmecid|1839", "32|Abdülaziz|1861", "33|V. Murad|1876", "34|II. Abdülhamid|1876", "35|V. Mehmed Reşad;V. Mehmed|1909", "36|VI. Mehmed Vahdeddin;VI. Mehmed|1918",
];

// sıra|cumhurbaşkanı|göreve başlama yılı
const PRESIDENTS = [
  "1|Mustafa Kemal Atatürk;Atatürk|1923", "2|İsmet İnönü;İnönü|1938", "3|Celal Bayar;Bayar|1950", "4|Cemal Gürsel;Gürsel|1961", "5|Cevdet Sunay;Sunay|1966", "6|Fahri Korutürk;Korutürk|1973",
  "7|Kenan Evren;Evren|1982", "8|Turgut Özal;Özal|1989", "9|Süleyman Demirel;Demirel|1993", "10|Ahmet Necdet Sezer;Sezer|2000", "11|Abdullah Gül;Gül|2007", "12|Recep Tayyip Erdoğan;Erdoğan|2014",
];

// kişi|ilişkili devlet/uygarlık
const FIGURES = [
  "Napolyon Bonapart|Fransa", "Winston Churchill|Birleşik Krallık", "Abraham Lincoln|Amerika Birleşik Devletleri;ABD", "George Washington|Amerika Birleşik Devletleri;ABD", "Franklin D. Roosevelt|Amerika Birleşik Devletleri;ABD",
  "Mahatma Gandhi|Hindistan", "Nelson Mandela|Güney Afrika", "Mao Zedong|Çin", "Adolf Hitler|Almanya", "Benito Mussolini|İtalya", "Charles de Gaulle|Fransa", "Otto von Bismarck|Almanya;Prusya",
  "Kraliçe Victoria|Birleşik Krallık", "Kral XIV. Louis|Fransa", "Büyük Petro|Rusya", "II. Katerina|Rusya", "Jül Sezar|Roma", "Augustus|Roma", "Kleopatra|Mısır", "II. Ramses|Mısır", "Tutankamon|Mısır",
  "Büyük İskender|Makedonya", "Hannibal|Kartaca", "Atilla|Hunlar", "Cengiz Han|Moğollar", "Kubilay Han|Moğollar", "Selahaddin Eyyubi|Eyyubiler", "Alparslan|Selçuklular;Büyük Selçuklu Devleti", "Timur|Timurlular",
  "Fatih Sultan Mehmed|Osmanlı", "Kanuni Sultan Süleyman|Osmanlı", "Mustafa Kemal Atatürk|Türkiye", 
  "Joan of Arc (Jeanne d'Arc)|Fransa", "Elizabeth I|İngiltere", "Cengiz Han'ın torunu Hülagü|Moğollar;İlhanlılar",
];

export const TARIH: FactSet[] = [
  { id: "olay", cat: "Tarih", sub: "Tarihler", diff: 2, rows: EVENTS, asks: [
    { t: "{0} hangi yıl gerçekleşmiştir?", a: 1, by: [0], num: true },
    { t: "{1} yılında aşağıdaki olaylardan hangisi yaşanmıştır?", a: 0, by: [1] },
  ] },
  { id: "padisah", cat: "Tarih", sub: "Osmanlı padişahları", diff: 2, rows: SULTANS, asks: [
    { t: "Osmanlı Devleti'nin {0}. padişahı kimdir?", a: 1, by: [0] },
    { t: "{1} kaçıncı Osmanlı padişahıdır?", a: 0, by: [1], num: true },
    { t: "{1} hangi yıl tahta çıkmıştır?", a: 2, by: [1], num: true },
    { t: "Osmanlı tahtına {2} yılında çıkan padişah kimdir?", a: 1, by: [2] },
  ] },
  { id: "cb", cat: "Tarih", sub: "Cumhurbaşkanları", diff: 2, rows: PRESIDENTS, asks: [
    { t: "Türkiye Cumhuriyeti'nin {0}. cumhurbaşkanı kimdir?", a: 1, by: [0] },
    { t: "{1} Türkiye Cumhuriyeti'nin kaçıncı cumhurbaşkanıdır?", a: 0, by: [1], num: true },
    { t: "{1} hangi yıl cumhurbaşkanı olmuştur?", a: 2, by: [1], num: true },
  ] },
  { id: "sahsiyet", cat: "Tarih", sub: "Tarihî kişilikler", diff: 2, rows: FIGURES, asks: [
    { t: "{0} hangi ülke ya da devletle özdeşleşmiştir?", a: 1, by: [0], choice: true },
  ] },
];

export const TARIH_SINGLES: SingleSet[] = [{
  id: "tarih1", cat: "Tarih", sub: "Genel tarih", diff: 2, rows: [
    "İstanbul'u fetheden Osmanlı padişahı kimdir?|Fatih Sultan Mehmed|II. Mehmed;Fatih|Yavuz Sultan Selim;Kanuni Sultan Süleyman;II. Bayezid",
    "Osmanlı Devleti'ni kuran kişi kimdir?|Osman Bey|Osman Gazi;I. Osman|Orhan Gazi;Ertuğrul Gazi;Yıldırım Bayezid",
    "Mısır'ı Osmanlı topraklarına katan padişah kimdir?|Yavuz Sultan Selim|I. Selim|Kanuni Sultan Süleyman;Fatih Sultan Mehmed;II. Bayezid",
    "Osmanlı tarihinde en uzun süre tahtta kalan padişah kimdir?|Kanuni Sultan Süleyman|I. Süleyman;Kanuni|Fatih Sultan Mehmed;IV. Mehmed;II. Mahmud",
    "Türkiye Cumhuriyeti'nin kurucusu kimdir?|Mustafa Kemal Atatürk|Atatürk|İsmet İnönü;Celal Bayar;Fevzi Çakmak",
    "Atatürk'ün doğduğu şehir neresidir?|Selanik||Manastır;İstanbul;Üsküp",
    "Atatürk'ün annesinin adı nedir?|Zübeyde Hanım|Zübeyde|Latife Hanım;Makbule Hanım;Fikriye Hanım",
    "Atatürk'ün babasının adı nedir?|Ali Rıza Efendi|Ali Rıza|Mehmet Efendi;Hüseyin Efendi;Ahmet Efendi",
    "Türkiye Büyük Millet Meclisi'nin ilk başkanı kimdir?|Mustafa Kemal Atatürk|Atatürk|İsmet İnönü;Fevzi Çakmak;Kâzım Karabekir",
    "Sakarya Meydan Muharebesi hangi cephede yapılmıştır?|Batı Cephesi||Doğu Cephesi;Güney Cephesi;Kafkas Cephesi",
    "Kurtuluş Savaşı'nda Doğu Cephesi komutanı kimdir?|Kâzım Karabekir||Ali Fuat Cebesoy;Fevzi Çakmak;Refet Bele",
    "I. Dünya Savaşı'nda Osmanlı Devleti hangi ittifak içinde savaşmıştır?|İttifak Devletleri|Almanya yanında;Merkez Devletleri|İtilaf Devletleri;Üçlü Anlaşma;Varşova Paktı",
    "Çanakkale Savaşları'nda Anafartalar Grup Komutanı olarak görev yapan komutan kimdir?|Mustafa Kemal Atatürk|Mustafa Kemal;Atatürk|Enver Paşa;Esat Paşa;Liman von Sanders",
    "Fransız Devrimi'nin slogan üçlüsü hangisidir?|Özgürlük, Eşitlik, Kardeşlik||Barış, Ekmek, Toprak;Hak, Adalet, Hukuk;Akıl, Bilim, Özgürlük",
    "Rönesans hareketi ilk olarak hangi ülkede başlamıştır?|İtalya||Fransa;İngiltere;İspanya",
    "Sanayi Devrimi hangi ülkede başlamıştır?|İngiltere|Birleşik Krallık|Fransa;Almanya;ABD",
    "Kolomb'un Amerika'ya yaptığı yolculukta hangi krallık onu destekledi?|İspanya|Kastilya|Portekiz;Fransa;İngiltere",
    "Tarihte bilinen ilk yazıyı (çivi yazısı) bulan uygarlık hangisidir?|Sümerler||Mısırlılar;Hititler;Fenikeliler",
    "Hititler'in başkenti neresidir?|Hattuşa|Boğazköy|Truva;Efes;Gordion",
    "Roma İmparatorluğu'nun ilk imparatoru kimdir?|Augustus|Octavianus|Jül Sezar;Neron;Trajan",
    "Büyük İskender'in öğretmeni olan filozof kimdir?|Aristoteles||Platon;Sokrates;Pisagor",
    "Pers Kralı Darius'un kurduğu Kral Yolu hangi iki kenti birbirine bağlar?|Sardes ve Susa|Susa ve Sardes|Efes ve Babil;Truva ve Persepolis;Ninova ve Mısır",
    "Mısır'daki en büyük piramit hangisidir?|Keops Piramidi|Giza Büyük Piramidi;Büyük Piramit|Kefren Piramidi;Mikerinos Piramidi;Sakkara Piramidi",
    "Vikingler hangi bölgenin denizcileridir?|İskandinavya||Akdeniz;Karadeniz;Britanya",
    "Haçlı Seferleri'ni başlatan papa kimdir? (1095)|II. Urban|Papa Urban II;Urbanus II|III. Innocentius;VII. Gregorius;I. Gregorius",
    "Osmanlı'da 'Divan-ı Hümayun' neyi ifade eder?|Devlet yönetim kurulunu||Orduyu;Vergi dairesini;Okulu",
    "Osmanlı Devleti'nde sadrazam kimdir?|Padişahın vekili olan başvezir|Baş vezir|Donanma komutanı;Şeyhülislam;Yeniçeri ağası",
    "Lale Devri hangi padişah döneminde yaşanmıştır?|III. Ahmed||II. Mahmud;III. Selim;Abdülhamid",
    "Osmanlı'da ilk matbaayı kuran kişi kimdir?|İbrahim Müteferrika||Takiyüddin;Evliya Çelebi;Katip Çelebi",
    "İstanbul'un fethinde kullanılan ünlü dökümcü topçu Macar ustanın adı nedir?|Urban|Orban|Sinan;Hızır Reis;Barbaros",
    "Atatürk ilkeleri toplam kaç tanedir?|6|altı|5;7;9",
    "TBMM'nin açılış günü hangi bayram olarak kutlanır?|23 Nisan|Ulusal Egemenlik ve Çocuk Bayramı|19 Mayıs;30 Ağustos;29 Ekim",
    "Cumhuriyet Bayramı hangi tarihte kutlanır?|29 Ekim||23 Nisan;30 Ağustos;19 Mayıs",
    "Zafer Bayramı hangi tarihte kutlanır?|30 Ağustos||29 Ekim;23 Nisan;19 Mayıs",
    "Atatürk'ü Anma, Gençlik ve Spor Bayramı hangi tarihte kutlanır?|19 Mayıs||23 Nisan;30 Ağustos;10 Kasım",
    "Atatürk'ün vefat ettiği yer neresidir?|Dolmabahçe Sarayı||Yıldız Sarayı;Çankaya Köşkü;Beylerbeyi Sarayı",
    "Ankara hangi tarihte Türkiye'nin başkenti ilan edilmiştir?|13 Ekim 1923|1923|29 Ekim 1923;23 Nisan 1920;1 Kasım 1922",
    "Türkiye'de kadınlar milletvekili seçme ve seçilme hakkını hangi yıl kazanmıştır?|1934||1930;1926;1946",
    "Türk Dil Kurumu hangi yıl kurulmuştur?|1932||1928;1934;1923",
    "Türk Tarih Kurumu hangi yıl kurulmuştur?|1931||1924;1938;1928",
    "Fransız imparator Napolyon hangi adada sürgünde ölmüştür?|Saint Helena|Sent Helena|Elba;Korsika;Malta",
    "II. Dünya Savaşı'nda Almanya'nın müttefiklerinden Japonya'ya atom bombası atan ülke hangisidir?|ABD|Amerika Birleşik Devletleri|Sovyetler Birliği;Birleşik Krallık;Fransa",
    "Soğuk Savaş'ın iki büyük kutbu hangileridir?|ABD ve Sovyetler Birliği|Sovyetler Birliği ve ABD|ABD ve Çin;Almanya ve Fransa;Birleşik Krallık ve Rusya",
    "İngiltere'de Kraliçe I. Elizabeth döneminde İspanyol Armadası kaç yılında yenilmiştir?|1588||1492;1603;1555",
    "Magna Carta hangi ülkede imzalanmıştır?|İngiltere|Birleşik Krallık|Fransa;Almanya;İspanya",
    "Berlin Duvarı hangi şehri bölmüştür?|Berlin||Viyana;Prag;Budapeşte",
    "Hitler'in başında bulunduğu parti hangisidir?|Nasyonal Sosyalist İşçi Partisi|Nazi Partisi;NSDAP|Komünist Parti;Sosyal Demokrat Parti;Faşist Parti",
    "Anayasa'nın ilk kez ilan edildiği Osmanlı dönemi hangisidir?|I. Meşrutiyet|Birinci Meşrutiyet|II. Meşrutiyet;Tanzimat;Lale Devri",
  ],
}];
