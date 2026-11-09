import type { FactSet, SingleSet } from "../gen";

// şirket|kuruluş yılı|kurucu(lar)
const COMPANIES = ["Apple|1976|Steve Jobs, Steve Wozniak ve Ronald Wayne", "Microsoft|1975|Bill Gates ve Paul Allen", "Google|1998|Larry Page ve Sergey Brin", "Amazon|1994|Jeff Bezos", "Facebook|2004|Mark Zuckerberg", "Netflix|1997|Reed Hastings ve Marc Randolph",
  "YouTube|2005|Chad Hurley, Steve Chen ve Jawed Karim", "Wikipedia|2001|Jimmy Wales ve Larry Sanger", "Spotify|2006|Daniel Ek ve Martin Lorentzon", "Intel|1968|Robert Noyce ve Gordon Moore", "IBM|1911|Charles Ranlett Flint", "Samsung|1938|Lee Byung-chul",
  "Sony|1946|Masaru Ibuka ve Akio Morita", "Nokia|1865|Fredrik Idestam", "Oracle|1977|Larry Ellison", "Adobe|1982|John Warnock ve Charles Geschke", "eBay|1995|Pierre Omidyar", "PayPal|1998|Peter Thiel ve Max Levchin (Confinity)", "Uber|2009|Travis Kalanick ve Garrett Camp",
  "Airbnb|2008|Brian Chesky, Joe Gebbia ve Nathan Blecharczyk", "Dropbox|2007|Drew Houston ve Arash Ferdowsi", "Zoom|2011|Eric Yuan", "Snapchat|2011|Evan Spiegel, Bobby Murphy ve Reggie Brown", "Pinterest|2010|Ben Silbermann, Paul Sciarra ve Evan Sharp", "LinkedIn|2002|Reid Hoffman",
  "Instagram|2010|Kevin Systrom ve Mike Krieger", "WhatsApp|2009|Jan Koum ve Brian Acton", "OpenAI|2015|Sam Altman, Elon Musk ve diğerleri", "Telegram|2013|Pavel Durov ve Nikolai Durov", "Hepsiburada|1998|Hanzade Doğan Boyner", "Yemeksepeti|2001|Nevzat Aydın",
  "Trendyol|2010|Demet Mutlu", "Twitter|2006|Jack Dorsey, Noah Glass, Biz Stone ve Evan Williams", "Alibaba|1999|Jack Ma", "Tesla|2003|Martin Eberhard ve Marc Tarpenning"];
// dil|yaratıcı|yıl
const LANGS = ["Python|Guido van Rossum|1991", "Java|James Gosling|1995", "C|Dennis Ritchie|1972", "C++|Bjarne Stroustrup|1985", "JavaScript|Brendan Eich|1995", "PHP|Rasmus Lerdorf|1995", "Ruby|Yukihiro Matsumoto|1995", "Perl|Larry Wall|1987", "Pascal|Niklaus Wirth|1970",
  "BASIC|John Kemeny ve Thomas Kurtz|1964", "FORTRAN|John Backus|1957", "Lisp|John McCarthy|1958", "Go|Robert Griesemer, Rob Pike ve Ken Thompson (Google)|2009", "Rust|Graydon Hoare|2010", "Swift|Chris Lattner (Apple)|2014", "Kotlin|JetBrains|2011", "Linux çekirdeği|Linus Torvalds|1991"];
// ürün|yıl
const LAUNCH = ["İlk iPhone|2007", "İlk iPad|2010", "Windows 95|1995", "Windows XP|2001", "Windows 11|2021", "İlk Macintosh bilgisayar|1984", "Google Chrome|2008", "Mozilla Firefox 1.0|2004", "Gmail|2004", "Google Maps|2005", "Skype|2003", "Amazon Kindle|2007", "Tesla Model S|2012", "ChatGPT|2022",
  "USB standardı (1.0)|1996", "Wi-Fi (802.11 ilk standart)|1997", "Bluetooth (ilk sürüm)|1999", "İlk e-posta (ARPANET)|1971", "ARPANET'in ilk bağlantısı|1969", "IBM PC|1981", "Apple II|1977", "Altair 8080|1975", "Walkman|1979", "Compact Disc (ticari CD)|1982", "DVD|1996",
  "Sony PlayStation|1994", "Netflix'in akış hizmeti|2007", "Apple Watch|2015", "Windows 3.0|1990", "MS-DOS|1981", "Java dili|1995", "Google Arama|1998", "Visual Basic|1991", "İlk web sitesi (CERN)|1991", "Cep telefonuyla ilk görüşme (Motorola)|1973", "Intel 4004 mikroişlemcisi|1971"];
// kısaltma|açılım
const ABBR = ["CPU|Merkezî İşlem Birimi (Central Processing Unit)", "GPU|Grafik İşlem Birimi (Graphics Processing Unit)", "RAM|Rastgele Erişimli Bellek (Random Access Memory)", "ROM|Salt Okunur Bellek (Read Only Memory)", "SSD|Katı Hâl Sürücüsü (Solid State Drive)",
  "HDD|Sabit Disk Sürücüsü (Hard Disk Drive)", "USB|Evrensel Seri Veri Yolu (Universal Serial Bus)", "HTML|Köprü Metni İşaretleme Dili (HyperText Markup Language)", "HTTP|Köprü Metni Aktarım Protokolü (HyperText Transfer Protocol)", "URL|Tekdüzen Kaynak Konumlayıcı (Uniform Resource Locator)",
  "DNS|Alan Adı Sistemi (Domain Name System)", "IP|İnternet Protokolü (Internet Protocol)", "LAN|Yerel Ağ (Local Area Network)", "VPN|Sanal Özel Ağ (Virtual Private Network)", "PDF|Taşınabilir Belge Biçimi (Portable Document Format)", "SQL|Yapılandırılmış Sorgu Dili (Structured Query Language)",
  "AI|Yapay Zekâ (Artificial Intelligence)", "GPS|Küresel Konumlandırma Sistemi (Global Positioning System)", "LED|Işık Yayan Diyot (Light Emitting Diode)", "LCD|Sıvı Kristal Ekran (Liquid Crystal Display)", "PIN|Kişisel Kimlik Numarası (Personal Identification Number)",
  "SMS|Kısa Mesaj Servisi (Short Message Service)", "QR|Hızlı Yanıt (Quick Response) kodu", "NFC|Yakın Alan İletişimi (Near Field Communication)", "API|Uygulama Programlama Arayüzü (Application Programming Interface)", "OS|İşletim Sistemi (Operating System)", "IoT|Nesnelerin İnterneti (Internet of Things)"];
// uzantı|dosya türü
const EXT = [".jpg|Resim", ".png|Resim", ".gif|Hareketli/rastgele resim", ".mp3|Ses", ".wav|Ses", ".mp4|Video", ".avi|Video", ".pdf|Belge", ".docx|Metin belgesi", ".xlsx|Hesap tablosu", ".pptx|Sunum", ".zip|Sıkıştırılmış arşiv", ".rar|Sıkıştırılmış arşiv", ".exe|Çalıştırılabilir program",
  ".html|Web sayfası", ".txt|Düz metin", ".csv|Virgülle ayrılmış tablo verisi", ".json|Yapılandırılmış veri"].map((r) => r.replace("Hareketli/rastgele resim", "Resim (animasyonlu)"));
// uygulama|şirket
const APPS = ["WhatsApp|Meta", "Instagram|Meta", "Facebook|Meta", "YouTube|Google", "Gmail|Google", "Android|Google", "Waze|Google", "LinkedIn|Microsoft", "Skype|Microsoft", "GitHub|Microsoft", "Siri|Apple", "iMessage|Apple", "Alexa|Amazon", "Twitch|Amazon", "Kindle|Amazon", "Messenger|Meta", "Excel|Microsoft"];

export const TEKNOLOJI: FactSet[] = [
  { id: "sirket", cat: "Teknoloji", sub: "Teknoloji şirketleri", diff: 2, rows: COMPANIES, asks: [
    { t: "{0} hangi yıl kurulmuştur?", a: 1, by: [0], num: true },
    { t: "{0} şirketinin/ürününün kurucusu (kurucuları) kimdir?", a: 2, by: [0], choice: true },
  ] },
  { id: "progdil", cat: "Teknoloji", sub: "Programlama", diff: 2, rows: LANGS, asks: [
    { t: "{0} kim tarafından geliştirilmiştir?", a: 1, by: [0], choice: true },
    { t: "{0} hangi yıl ortaya çıkmıştır?", a: 2, by: [0], num: true },
  ] },
  { id: "lansman", cat: "Teknoloji", sub: "Ürünler ve tarihler", diff: 2, rows: LAUNCH, asks: [
    { t: "{0} hangi yıl ortaya çıkmıştır (piyasaya çıkmıştır)?", a: 1, by: [0], num: true },
    { t: "{1} yılında ortaya çıkan teknoloji aşağıdakilerden hangisidir?", a: 0, by: [1] },
  ] },
  { id: "kisaltma", cat: "Teknoloji", sub: "Kısaltmalar", diff: 1, rows: ABBR, asks: [
    { t: "{0} kısaltması neyin açılımıdır?", a: 1, by: [0], choice: true },
    { t: "“{1}” ifadesinin kısaltması nedir?", a: 0, by: [1], choice: true },
  ] },
  { id: "uzanti", cat: "Teknoloji", sub: "Dosya türleri", diff: 1, rows: EXT, asks: [{ t: "{0} uzantılı dosya hangi türdedir?", a: 1, by: [0], choice: true }] },
  { id: "uygulama", cat: "Teknoloji", sub: "Uygulamalar", diff: 1, rows: APPS, asks: [{ t: "{0} hangi şirketin ürünüdür?", a: 1, by: [0], choice: true }] },
];

export const TEKNOLOJI_SINGLES: SingleSet[] = [{
  id: "tek1", cat: "Teknoloji", sub: "Genel teknoloji", diff: 1, rows: [
    "Bilgisayarlarda 1 bayt kaç bittir?|8|sekiz|4;16;32",
    "1 kilobayt (geleneksel) kaç bayttır?|1024|1.024|1000;512;2048",
    "İkilik (binary) sistemde kullanılan rakamlar hangileridir?|0 ve 1|Sıfır ve bir|1 ve 2;0 ve 9;1 ve 10",
    "Bilgisayarın 'beyni' olarak bilinen bileşen hangisidir?|İşlemci|CPU|RAM;Anakart;Ekran kartı",
    "Bilgisayarın geçici belleği hangisidir?|RAM|Bellek|SSD;ROM;HDD",
    "Wi-Fi hangi ortamla veri iletir?|Radyo dalgaları|Radyo dalgasıyla|Kablolar;Optik fiber;Ses dalgaları",
    "İnternet alan adlarını IP adreslerine çeviren sistem hangisidir?|DNS||HTTP;FTP;SMTP",
    "Web sitelerinde güvenli bağlantıyı gösteren protokol hangisidir?|HTTPS||FTP;SMTP;HTTP",
    "E-posta göndermede kullanılan protokol hangisidir?|SMTP||FTP;HTTP;SSH",
    "Linux çekirdeğini ilk geliştiren kişi kimdir?|Linus Torvalds|Torvalds|Bill Gates;Steve Jobs;Richard Stallman",
    "Python programlama dilinin yaratıcısı kimdir?|Guido van Rossum|Van Rossum|Linus Torvalds;Bjarne Stroustrup;James Gosling",
    "Android işletim sistemi hangi şirket tarafından geliştirilir?|Google||Apple;Microsoft;Samsung",
    "iPhone hangi şirketin ürünüdür?|Apple||Samsung;Nokia;Huawei",
    "Windows işletim sistemi hangi şirkete aittir?|Microsoft||Apple;IBM;Google",
    "Bitcoin'in yaratıcısı olarak bilinen takma ad hangisidir?|Satoshi Nakamoto|Nakamoto|Vitalik Buterin;Elon Musk;Charlie Lee",
    "Blockchain teknolojisinin kullanıldığı en ünlü kripto para hangisidir?|Bitcoin||Euro;Dolar;Rupi",
    "'Yapay zekâ' teriminin ilk kez kullanıldığı 1956 Dartmouth Konferansı'nı düzenleyenlerden biri kimdir?|John McCarthy|McCarthy|Alan Turing;Elon Musk;Bill Gates",
    "Turing testi neyi ölçmeyi amaçlar?|Makinenin insan gibi düşünüp düşünmediğini|Makine zekâsını|İşlemci hızını;Bellek miktarını;İnternet hızını",
    "Alan Turing hangi savaşta Enigma şifresinin çözülmesine katkı sağlamıştır?|İkinci Dünya Savaşı|II. Dünya Savaşı|Birinci Dünya Savaşı;Soğuk Savaş;Kore Savaşı",
    "QR kodu ilk olarak hangi ülkede geliştirilmiştir?|Japonya||ABD;Almanya;Güney Kore",
    "Bluetooth adı hangi tarihî kişiden gelir?|Danimarka Kralı Harald 'Mavi Diş' Gormsson|Harald Bluetooth|İsveç Kralı Gustav;Norveç Kralı Olaf;Finlandiya Kralı Erik",
    "Cep telefonlarında 4G'den sonra gelen nesil hangisidir?|5G||3G;6G;LTE",
    "Dünyadaki ilk SMS'in 1992'de ne metniyle gönderildiği bilinir?|Merry Christmas|Mutlu Noeller|Hello;Test;Merhaba",
    "Bir ekranın en küçük görüntü birimine ne denir?|Piksel||Bayt;Vat;Hertz",
    "Ekran çözünürlüğü olarak 'Full HD' neyi ifade eder?|1920x1080|1920 × 1080|1280x720;3840x2160;1024x768",
    "4K çözünürlük yaklaşık kaç yatay pikseldir?|3840|4000|1920;2560;7680",
    "İnternetin temelini oluşturan ağın adı nedir?|ARPANET||EUROPANET;COMNET;WEBNET",
    "World Wide Web'i (WWW) icat eden kişi kimdir?|Tim Berners-Lee|Berners-Lee|Bill Gates;Steve Jobs;Vint Cerf",
    "Google'ın kurucuları hangi üniversitede öğrenciydi?|Stanford|Stanford Üniversitesi|Harvard;MIT;Berkeley",
    "Facebook hangi üniversitede başlamıştır?|Harvard|Harvard Üniversitesi|Stanford;Yale;MIT",
    "Apple'ın kurucularından Steve Wozniak hangi bilgisayarı tasarlamıştır?|Apple I|Apple I ve Apple II|iPhone;Macintosh;iPad",
    "Mekanik bilgisayarın öncüsü olan 'Analitik Makine'yi tasarlayan kişi kimdir?|Charles Babbage|Babbage|Alan Turing;Ada Lovelace;Von Neumann",
    "İlk bilgisayar programcısı olarak anılan kişi kimdir?|Ada Lovelace|Lovelace|Grace Hopper;Alan Turing;Margaret Hamilton",
    "Apollo 11 yazılımını geliştiren ekibe liderlik eden bilim insanı kimdir?|Margaret Hamilton|Hamilton|Katherine Johnson;Grace Hopper;Ada Lovelace",
    "Roket şirketi SpaceX'in kurucusu kimdir?|Elon Musk|Musk|Jeff Bezos;Richard Branson;Bill Gates",
    "Amazon'un kurucusu Jeff Bezos'un uzay şirketi hangisidir?|Blue Origin||SpaceX;Virgin Galactic;Rocket Lab",
    "Elektrikli otomobil üreticisi Tesla hangi ülkelidir?|ABD|Amerika Birleşik Devletleri|Almanya;Çin;Japonya",
    "Samsung hangi ülke şirketidir?|Güney Kore|Kore|Japonya;Çin;Tayvan",
    "Huawei hangi ülke şirketidir?|Çin||Güney Kore;Japonya;Tayvan",
  ],
}];
