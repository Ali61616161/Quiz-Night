import type { FactSet, SingleSet } from "../gen";

const CURRENCY = ["Türkiye|Türk lirası;Lira", "ABD|Amerikan doları;Dolar", "Birleşik Krallık|Sterlin;İngiliz sterlini", "Japonya|Yen", "Çin|Yuan;Renminbi", "Hindistan|Hint rupisi;Rupi", "Rusya|Ruble", "İsviçre|İsviçre frangı;Frank", "Kanada|Kanada doları",
  "Avustralya|Avustralya doları", "Brezilya|Real", "Meksika|Meksika pesosu;Peso", "Güney Kore|Won", "Güney Afrika|Rand", "Tayland|Baht", "Polonya|Zloti", "Macaristan|Forint", "Çekya|Çek kronu;Koruna", "İsveç|İsveç kronu", "Norveç|Norveç kronu",
  "Danimarka|Danimarka kronu", "İsrail|Şekel", "Suudi Arabistan|Suudi riyali;Riyal", "Birleşik Arap Emirlikleri|Dirhem", "Endonezya|Rupiah", "Malezya|Ringgit", "Vietnam|Dong", "Nijerya|Naira", "Ukrayna|Grivna", "Bulgaristan|Euro",
  "Romanya|Romen leyi;Leu", "Gürcistan|Lari", "Azerbaycan|Azerbaycan manatı;Manat", "Kazakistan|Tenge", "İzlanda|İzlanda kronu", "Peru|Sol", "Pakistan|Pakistan rupisi", "Mısır|Mısır lirası", "Filipinler|Filipin pesosu", "Sırbistan|Sırp dinarı;Dinar"];
const LANG = ["Fransa|Fransızca", "İtalya|İtalyanca", "İspanya|İspanyolca", "Portekiz|Portekizce", "Brezilya|Portekizce", "Rusya|Rusça", "Çin|Mandarin Çincesi;Çince", "Japonya|Japonca", "Güney Kore|Korece", "Yunanistan|Yunanca", "Polonya|Lehçe;Polonyaca",
  "Hollanda|Felemenkçe;Hollandaca", "İsveç|İsveççe", "Norveç|Norveççe", "Danimarka|Danca", "Finlandiya|Fince", "Macaristan|Macarca", "Çekya|Çekçe", "Romanya|Rumence", "Bulgaristan|Bulgarca", "Arnavutluk|Arnavutça", "İran|Farsça", "Mısır|Arapça",
  "İsrail|İbranice", "Tayland|Tayca", "Vietnam|Vietnamca", "Endonezya|Endonezce", "Arjantin|İspanyolca", "Meksika|İspanyolca", "Küba|İspanyolca", "Ukrayna|Ukraynaca", "Hırvatistan|Hırvatça", "Gürcistan|Gürcüce", "Azerbaycan|Azerbaycan Türkçesi;Azerice"];
const BRANDS = ["Toyota|Japonya", "Honda|Japonya", "Sony|Japonya", "Nintendo|Japonya", "Samsung|Güney Kore", "LG|Güney Kore", "Hyundai|Güney Kore", "Nokia|Finlandiya", "Ericsson|İsveç", "IKEA|İsveç", "H&M|İsveç", "Volvo|İsveç", "Spotify|İsveç", "LEGO|Danimarka",
  "Nestlé|İsviçre", "Rolex|İsviçre", "Swatch|İsviçre", "Ferrari|İtalya", "Lamborghini|İtalya", "Fiat|İtalya", "Gucci|İtalya", "Prada|İtalya", "Armani|İtalya", "Barilla|İtalya", "Peugeot|Fransa", "Renault|Fransa", "Citroën|Fransa", "Louis Vuitton|Fransa",
  "Chanel|Fransa", "Danone|Fransa", "BMW|Almanya", "Mercedes-Benz|Almanya", "Audi|Almanya", "Volkswagen|Almanya", "Porsche|Almanya", "Adidas|Almanya", "Puma|Almanya", "Siemens|Almanya", "SAP|Almanya", "Bosch|Almanya", "Zara|İspanya", "Philips|Hollanda",
  "Heineken|Hollanda", "Rolls-Royce|Birleşik Krallık", "Jaguar|Birleşik Krallık", "Burberry|Birleşik Krallık", "Apple|ABD", "Microsoft|ABD", "Google|ABD", "Amazon|ABD", "Coca-Cola|ABD", "Nike|ABD", "Ford|ABD", "Tesla|ABD", "Walmart|ABD", "Disney|ABD",
  "Netflix|ABD", "Intel|ABD", "Huawei|Çin", "Xiaomi|Çin", "Alibaba|Çin", "Tencent|Çin", "BYD|Çin", "Lenovo|Çin", "Tata|Hindistan", "Embraer|Brezilya", "Vestel|Türkiye", "Arçelik|Türkiye", "Ülker|Türkiye", "Eti|Türkiye", "Turkcell|Türkiye",
  "Türk Hava Yolları|Türkiye", "Pegasus|Türkiye", "Trendyol|Türkiye", "Getir|Türkiye", "Hepsiburada|Türkiye", "Aselsan|Türkiye", "Baykar|Türkiye", "Togg|Türkiye", "Yemeksepeti|Türkiye", "Peak Games|Türkiye", "Gram Games|Türkiye", "Royal Match (Dream Games)|Türkiye", "Koç Holding|Türkiye", "Sabancı Holding|Türkiye", "Beko|Türkiye", "Tofaş|Türkiye"];
// tanrı|alan
const MYTH = ["Zeus|Gök ve yıldırım (tanrıların kralı)", "Poseidon|Deniz", "Hades|Yeraltı dünyası", "Athena|Bilgelik ve savaş stratejisi", "Apollon|Güneş, müzik ve kehanet", "Artemis|Av ve ay", "Ares|Savaş", "Afrodit|Aşk ve güzellik", "Hermes|Haberci ve tüccarlar", "Hephaistos|Demircilik ve ateş",
  "Demeter|Tarım ve bereket", "Dionysos|Şarap ve eğlence", "Hera|Evlilik ve aile", "Eros|Aşkın tanrısı (Afrodit'in oğlu)", "Pan|Doğa ve çobanlar", "Odin|İskandinav mitolojisinin baş tanrısı", "Thor|Gök gürültüsü ve çekiç", "Loki|Hile ve oyunbazlık", "Ra|Eski Mısır'ın güneş tanrısı", "Anubis|Ölüler ve mumyalama",
  "Osiris|Ölümden sonraki yaşam (Mısır)", "İsis|Büyü ve ana tanrıça (Mısır)", "Horus|Gökyüzü, şahin başlı (Mısır)", "Jüpiter|Roma'nın Zeus karşılığı", "Venüs|Roma'nın Afrodit karşılığı", "Mars|Roma'nın Ares karşılığı", "Neptün|Roma'nın Poseidon karşılığı", "Minerva|Roma'nın Athena karşılığı"];
// yapı|ülke
const WONDERS = ["Eyfel Kulesi|Fransa", "Kolezyum|İtalya", "Pisa Kulesi|İtalya", "Big Ben|Birleşik Krallık", "Taç Mahal|Hindistan", "Çin Seddi|Çin", "Machu Picchu|Peru", "Petra Antik Kenti|Ürdün", "Özgürlük Heykeli|ABD", "Sidney Opera Binası|Avustralya",
  "Kurtarıcı İsa Heykeli|Brezilya", "Gize Piramitleri|Mısır", "Angkor Wat|Kamboçya", "Alhambra Sarayı|İspanya", "Sagrada Família|İspanya", "Brandenburg Kapısı|Almanya", "Neuschwanstein Şatosu|Almanya", "Akropolis|Yunanistan", "Stonehenge|Birleşik Krallık", "Kremlin|Rusya",
  "Louvre Müzesi|Fransa", "Versay Sarayı|Fransa", "Atomium|Belçika", "Küçük Deniz Kızı Heykeli|Danimarka", "Burj Khalifa|Birleşik Arap Emirlikleri", "Petronas Kuleleri|Malezya", "Borobudur Tapınağı|Endonezya", "Fuji Dağı|Japonya", "Yasak Şehir|Çin", "Moai heykelleri|Şili",
  "Chichén Itzá|Meksika", "Masa Dağı (Table Mountain)|Güney Afrika", "Prag Astronomik Saati|Çekya", "Mostar Köprüsü|Bosna Hersek", "Dubrovnik Surları|Hırvatistan", "Schönbrunn Sarayı|Avusturya", "Hagia Sophia Camii|Türkiye", "Peles Kalesi|Romanya"];
// buluş|mucit
const INVENT = ["Telefon|Alexander Graham Bell;Bell", "Dinamit|Alfred Nobel;Nobel", "Hareketli harfli matbaa (Avrupa)|Johannes Gutenberg;Gutenberg", "Telgraf (Mors alfabesi)|Samuel Morse;Morse", "Sinematograf|Lumière Kardeşler;Lumiere", "Paratoner|Benjamin Franklin;Franklin",
  "Dikiş makinesi (ilk pratik)|Elias Howe;Howe", "Benzinli otomobil|Karl Benz;Benz", "Dizel motor|Rudolf Diesel;Diesel", "Dünya Çapında Ağ (WWW)|Tim Berners-Lee", "Çiçek aşısı|Edward Jenner;Jenner", "Pastörizasyon|Louis Pasteur;Pasteur", "Penisilin|Alexander Fleming;Fleming",
  "Motorlu uçak|Wright Kardeşler;Wright", "Elektrik ampulü (ticari)|Thomas Edison;Edison", "Alternatif akım sistemleri|Nikola Tesla;Tesla"];

export const GENEL: FactSet[] = [
  { id: "para", cat: "Genel Kültür", sub: "Para birimleri", diff: 2, rows: CURRENCY, asks: [
    { t: "{0} ülkesinin para birimi nedir?", a: 1, by: [0], choice: true },
  ] },
  { id: "dil", cat: "Genel Kültür", sub: "Diller", diff: 1, rows: LANG, asks: [{ t: "{0} ülkesinin resmî dili nedir?", a: 1, by: [0], choice: true }] },
  { id: "marka", cat: "Genel Kültür", sub: "Markalar", diff: 1, rows: BRANDS, asks: [{ t: "{0} markası hangi ülkeye aittir?", a: 1, by: [0], choice: true }] },
  { id: "mitoloji", cat: "Genel Kültür", sub: "Mitoloji", diff: 2, rows: MYTH, asks: [
    { t: "{0} neyin tanrısıdır (ya da neyle özdeşleşir)?", a: 1, by: [0], choice: true },
    { t: "“{1}” hangi tanrıyla ilişkilendirilir?", a: 0, by: [1], choice: true },
  ] },
  { id: "yapi", cat: "Genel Kültür", sub: "Dünya yapıları", diff: 1, rows: WONDERS.filter((r) => !r.endsWith("|-")), asks: [{ t: "{0} hangi ülkededir?", a: 1, by: [0], choice: true }] },
  { id: "bulus", cat: "Genel Kültür", sub: "Buluşlar", diff: 2, rows: INVENT, asks: [
    { t: "{0} kime atfedilir?", a: 1, by: [0], choice: true },
  ] },
];

export const GENEL_SINGLES: SingleSet[] = [{
  id: "gen1", cat: "Genel Kültür", sub: "Genel", diff: 1, rows: [
    "Bir yılda kaç mevsim vardır?|4|dört|3;5;6",
    "Haftanın ilk günü Türkiye'de hangi gündür?|Pazartesi||Pazar;Cumartesi;Salı",
    "Şubat ayı artık yıllarda kaç gün çeker?|29|yirmi dokuz|28;30;31",
    "Bir düzine kaç tanedir?|12|on iki|10;6;24",
    "Bir yıl kaç haftadan oluşur (yaklaşık)?|52|elli iki|48;50;54",
    "Dünyada kaç kıta vardır (yaygın kabule göre)?|7|yedi|5;6;8",
    "Dünyada kaç okyanus vardır?|5|beş|3;4;7",
    "Türk alfabesinde kaç harf vardır?|29|yirmi dokuz|28;30;32",
    "Romen rakamlarında 'X' kaçı gösterir?|10|on|5;50;100",
    "Romen rakamlarında 'L' kaçı gösterir?|50|elli|5;10;100",
    "Romen rakamlarında 'C' kaçı gösterir?|100|yüz|10;50;500",
    "Romen rakamlarında 'D' kaçı gösterir?|500|beş yüz|50;100;1000",
    "Romen rakamlarında 'M' kaçı gösterir?|1000|bin|100;500;10000",
    "Cumhuriyet Bayramı hangi tarihte kutlanır?|29 Ekim||23 Nisan;30 Ağustos;19 Mayıs",
    "Ulusal Egemenlik ve Çocuk Bayramı hangi tarihte kutlanır?|23 Nisan||19 Mayıs;29 Ekim;30 Ağustos",
    "Öğretmenler Günü hangi tarihte kutlanır?|24 Kasım||5 Ekim;10 Kasım;1 Mayıs",
    "Emek ve Dayanışma Günü hangi tarihte kutlanır?|1 Mayıs||8 Mart;23 Nisan;19 Mayıs",
    "Dünya Kadınlar Günü hangi tarihte kutlanır?|8 Mart||1 Mayıs;21 Mart;14 Şubat",
    "Kurban Bayramı Türkiye'de resmî olarak kaç gün tatildir (genellikle)?|4|dört|2;3;5",
    "Ramazan Bayramı Türkiye'de resmî olarak kaç gün sürer (genellikle)?|3|üç|2;4;5",
    "Türkiye'nin saat dilimi UTC'ye göre nedir?|UTC+3|+3|UTC+2;UTC+1;UTC+4",
    "Türk bayrağındaki renkler hangileridir?|Kırmızı ve beyaz|Al ve beyaz|Kırmızı ve sarı;Mavi ve beyaz;Yeşil ve kırmızı",
    "Türk bayrağındaki semboller hangileridir?|Ay ve yıldız|Hilal ve yıldız|Güneş ve ay;Yalnızca yıldız;Kılıç ve kalkan",
    "ABD'nin başkenti neresidir?|Washington D.C.|Washington|New York;Los Angeles;Chicago",
    "Avustralya'nın başkenti neresidir?|Kanberra|Canberra|Sidney;Melbourne;Brisbane",
    "Brezilya'nın başkenti neresidir?|Brasilia||Rio de Janeiro;São Paulo;Salvador",
    "Kanada'nın başkenti neresidir?|Ottawa||Toronto;Montreal;Vancouver",
    "Işık yılı neyin birimidir?|Uzaklık|Mesafe|Zaman;Hız;Kütle",
    "Dünyanın en büyük okyanusu hangisidir?|Pasifik Okyanusu|Pasifik|Atlas;Hint;Arktik",
    "Dünyanın en uzun nehri hangisidir (geleneksel kabul)?|Nil||Amazon;Yangtze;Mississippi",
    "Dünyanın en yüksek dağı hangisidir?|Everest||K2;Kilimanjaro;Mont Blanc",
    "Dünyanın en kalabalık ülkesi hangisidir?|Hindistan||Çin;ABD;Endonezya",
    "Nobel Barış Ödülü hangi şehirde verilir?|Oslo||Stokholm;Cenevre;Kopenhag",
    "Birleşmiş Milletler'in genel merkezi hangi şehirdedir?|New York||Cenevre;Paris;Brüksel",
    "NATO'nun genel merkezi hangi şehirdedir?|Brüksel||Paris;Londra;Berlin",
    "Avrupa Birliği Parlamentosu'nun resmî merkezi hangi şehirdedir?|Strazburg|Strasbourg|Brüksel;Paris;Cenevre",
    "Euro hangi yıl nakit para olarak dolaşıma girmiştir?|2002||1999;2004;1995",
  ],
}];
