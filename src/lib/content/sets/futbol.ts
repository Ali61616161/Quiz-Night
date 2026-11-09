import type { FactSet, SingleSet } from "../gen";

// yıl|şampiyon|finalist|ev sahibi
const WC = [
  "1930|Uruguay|Arjantin|Uruguay", "1934|İtalya|Çekoslovakya|İtalya", "1938|İtalya|Macaristan|Fransa", "1950|Uruguay|Brezilya|Brezilya", "1954|Batı Almanya;Almanya|Macaristan|İsviçre",
  "1958|Brezilya|İsveç|İsveç", "1962|Brezilya|Çekoslovakya|Şili", "1966|İngiltere|Batı Almanya;Almanya|İngiltere", "1970|Brezilya|İtalya|Meksika", "1974|Batı Almanya;Almanya|Hollanda|Batı Almanya;Almanya",
  "1978|Arjantin|Hollanda|Arjantin", "1982|İtalya|Batı Almanya;Almanya|İspanya", "1986|Arjantin|Batı Almanya;Almanya|Meksika", "1990|Batı Almanya;Almanya|Arjantin|İtalya", "1994|Brezilya|İtalya|ABD;Amerika Birleşik Devletleri",
  "1998|Fransa|Brezilya|Fransa", "2002|Brezilya|Almanya|-", "2006|İtalya|Fransa|Almanya", "2010|İspanya|Hollanda|Güney Afrika", "2014|Almanya;Batı Almanya|Arjantin|Brezilya", "2018|Fransa|Hırvatistan|Rusya", "2022|Arjantin|Fransa|Katar",
];
const EURO = ["1960|Sovyetler Birliği;SSCB", "1964|İspanya", "1968|İtalya", "1972|Batı Almanya;Almanya", "1976|Çekoslovakya", "1980|Batı Almanya;Almanya", "1984|Fransa", "1988|Hollanda", "1992|Danimarka", "1996|Almanya;Batı Almanya", "2000|Fransa",
  "2004|Yunanistan", "2008|İspanya", "2012|İspanya", "2016|Portekiz", "2020|İtalya", "2024|İspanya"];
const CL = ["1956|Real Madrid", "1957|Real Madrid", "1958|Real Madrid", "1959|Real Madrid", "1960|Real Madrid", "1961|Benfica", "1962|Benfica", "1963|Milan;AC Milan", "1964|Inter;Internazionale", "1965|Inter;Internazionale",
  "1966|Real Madrid", "1967|Celtic", "1968|Manchester United", "1969|Milan;AC Milan", "1970|Feyenoord", "1971|Ajax", "1972|Ajax", "1973|Ajax", "1974|Bayern Münih;Bayern Munich", "1975|Bayern Münih;Bayern Munich", "1976|Bayern Münih;Bayern Munich",
  "1977|Liverpool", "1978|Liverpool", "1979|Nottingham Forest", "1980|Nottingham Forest", "1981|Liverpool", "1982|Aston Villa", "1983|Hamburg;Hamburger SV", "1984|Liverpool", "1985|Juventus", "1986|Steaua Bükreş;Steaua Bucureşti", "1987|Porto",
  "1988|PSV Eindhoven;PSV", "1989|Milan;AC Milan", "1990|Milan;AC Milan", "1991|Kızılyıldız;Crvena Zvezda;Red Star Belgrad", "1992|Barcelona", "1993|Olympique Marsilya;Marsilya;Marseille", "1994|Milan;AC Milan", "1995|Ajax", "1996|Juventus",
  "1997|Borussia Dortmund;Dortmund", "1998|Real Madrid", "1999|Manchester United", "2000|Real Madrid", "2001|Bayern Münih;Bayern Munich", "2002|Real Madrid", "2003|Milan;AC Milan", "2004|Porto", "2005|Liverpool", "2006|Barcelona", "2007|Milan;AC Milan",
  "2008|Manchester United", "2009|Barcelona", "2010|Inter;Internazionale", "2011|Barcelona", "2012|Chelsea", "2013|Bayern Münih;Bayern Munich", "2014|Real Madrid", "2015|Barcelona", "2016|Real Madrid", "2017|Real Madrid", "2018|Real Madrid",
  "2019|Liverpool", "2020|Bayern Münih;Bayern Munich", "2021|Chelsea", "2022|Real Madrid", "2023|Manchester City", "2024|Real Madrid"];
const BALLON = ["1956|Stanley Matthews", "1957|Alfredo Di Stéfano;Di Stefano", "1958|Raymond Kopa;Kopa", "1959|Alfredo Di Stéfano;Di Stefano", "1960|Luis Suárez;Suarez", "1961|Omar Sívori;Sivori", "1962|Josef Masopust;Masopust", "1963|Lev Yashin;Yashin;Yaşin",
  "1964|Denis Law", "1965|Eusébio;Eusebio", "1966|Bobby Charlton", "1967|Flórián Albert;Florian Albert", "1968|George Best", "1969|Gianni Rivera", "1970|Gerd Müller;Gerd Muller", "1971|Johan Cruyff;Cruyff", "1972|Franz Beckenbauer;Beckenbauer",
  "1973|Johan Cruyff;Cruyff", "1974|Johan Cruyff;Cruyff", "1975|Oleg Blokhin;Blohin", "1976|Franz Beckenbauer;Beckenbauer", "1977|Allan Simonsen", "1978|Kevin Keegan", "1979|Kevin Keegan", "1980|Karl-Heinz Rummenigge;Rummenigge",
  "1981|Karl-Heinz Rummenigge;Rummenigge", "1982|Paolo Rossi", "1983|Michel Platini;Platini", "1984|Michel Platini;Platini", "1985|Michel Platini;Platini", "1986|Igor Belanov", "1987|Ruud Gullit;Gullit", "1988|Marco van Basten;Van Basten",
  "1989|Marco van Basten;Van Basten", "1990|Lothar Matthäus;Matthaus", "1991|Jean-Pierre Papin;Papin", "1992|Marco van Basten;Van Basten", "1993|Roberto Baggio;Baggio", "1994|Hristo Stoichkov;Stoichkov", "1995|George Weah;Weah",
  "1996|Matthias Sammer;Sammer", "1997|Ronaldo Nazário;Ronaldo", "1998|Zinedine Zidane;Zidane", "1999|Rivaldo", "2000|Luís Figo;Figo", "2001|Michael Owen;Owen", "2002|Ronaldo Nazário;Ronaldo", "2003|Pavel Nedvěd;Nedved", "2004|Andriy Shevchenko;Shevchenko",
  "2005|Ronaldinho", "2006|Fabio Cannavaro;Cannavaro", "2007|Kaká;Kaka", "2008|Cristiano Ronaldo", "2009|Lionel Messi;Messi", "2010|Lionel Messi;Messi", "2011|Lionel Messi;Messi", "2012|Lionel Messi;Messi", "2013|Cristiano Ronaldo",
  "2014|Cristiano Ronaldo", "2015|Lionel Messi;Messi", "2016|Cristiano Ronaldo", "2017|Cristiano Ronaldo", "2018|Luka Modrić;Modric", "2019|Lionel Messi;Messi", "2021|Lionel Messi;Messi", "2022|Karim Benzema;Benzema", "2023|Lionel Messi;Messi", "2024|Rodri"];
const SUPERLIG = ["1999-2000|Galatasaray", "2000-01|Fenerbahçe", "2001-02|Galatasaray", "2002-03|Beşiktaş", "2003-04|Fenerbahçe", "2004-05|Fenerbahçe", "2005-06|Fenerbahçe", "2006-07|Fenerbahçe", "2007-08|Galatasaray", "2008-09|Beşiktaş",
  "2009-10|Bursaspor", "2010-11|Fenerbahçe", "2011-12|Galatasaray", "2012-13|Galatasaray", "2013-14|Fenerbahçe", "2014-15|Galatasaray", "2015-16|Beşiktaş", "2016-17|Beşiktaş", "2017-18|Galatasaray", "2018-19|Galatasaray",
  "2019-20|İstanbul Başakşehir;Başakşehir", "2020-21|Beşiktaş", "2021-22|Trabzonspor", "2022-23|Galatasaray", "2023-24|Galatasaray"];
// kulüp|ülke|stadyum
const CLUBS = [
  "Real Madrid|İspanya|Santiago Bernabéu;Bernabéu", "Barcelona|İspanya|Camp Nou", "Atlético Madrid|İspanya|Metropolitano;Cívitas Metropolitano", "Manchester United|İngiltere|Old Trafford", "Liverpool|İngiltere|Anfield",
  "Arsenal|İngiltere|Emirates Stadyumu;Emirates", "Chelsea|İngiltere|Stamford Bridge", "Manchester City|İngiltere|Etihad Stadyumu;Etihad", "Tottenham Hotspur|İngiltere|Tottenham Hotspur Stadyumu", "Newcastle United|İngiltere|St James' Park",
  "Bayern Münih|Almanya|Allianz Arena", "Borussia Dortmund|Almanya|Signal Iduna Park", "Juventus|İtalya|Allianz Stadium;Juventus Stadium", "AC Milan|İtalya|San Siro", "Inter|İtalya|San Siro", "Roma|İtalya|Stadio Olimpico",
  "Napoli|İtalya|Diego Armando Maradona Stadyumu;Stadio Maradona", "Paris Saint-Germain|Fransa|Parc des Princes", "Olympique Marsilya|Fransa|Orange Vélodrome", "Ajax|Hollanda|Johan Cruyff Arena;Amsterdam Arena",
  "Benfica|Portekiz|Estádio da Luz", "Porto|Portekiz|Estádio do Dragão", "Galatasaray|Türkiye|RAMS Park;Rams Park", "Fenerbahçe|Türkiye|Şükrü Saracoğlu Stadyumu;Ülker Stadyumu;Kadıköy", "Beşiktaş|Türkiye|Tüpraş Stadyumu;Vodafone Park;Beşiktaş Park",
  "Celtic|İskoçya|Celtic Park", "Rangers|İskoçya|Ibrox", "Boca Juniors|Arjantin|La Bombonera", "River Plate|Arjantin|Monumental", "Flamengo|Brezilya|Maracanã;Maracana", "Sporting Lizbon|Portekiz|Estádio José Alvalade;Alvalade",
  "Valencia|İspanya|Mestalla", "Sevilla|İspanya|Ramón Sánchez-Pizjuán", "Athletic Bilbao|İspanya|San Mamés", "Leverkusen|Almanya|BayArena", "Borussia Mönchengladbach|Almanya|Borussia-Park", "Olympique Lyon|Fransa|Groupama Stadyumu",
  "Dinamo Kiev|Ukrayna|Olimpiyskiy Stadyumu", "Şahtar Donetsk|Ukrayna|-", "Kızılyıldız Belgrad|Sırbistan|Rajko Mitić Stadyumu", "Anderlecht|Belçika|-",
];
// futbolcu|ülke|mevki
const PLAYERS = [
  "Lionel Messi|Arjantin|Forvet", "Cristiano Ronaldo|Portekiz|Forvet", "Neymar|Brezilya|Forvet", "Kylian Mbappé|Fransa|Forvet", "Erling Haaland|Norveç|Forvet", "Robert Lewandowski|Polonya|Forvet", "Mohamed Salah|Mısır|Forvet",
  "Harry Kane|İngiltere|Forvet", "Luka Modrić|Hırvatistan|Orta saha", "Kevin De Bruyne|Belçika|Orta saha", "Zinedine Zidane|Fransa|Orta saha", "Andrés Iniesta|İspanya|Orta saha", "Xavi Hernández|İspanya|Orta saha", "Andrea Pirlo|İtalya|Orta saha",
  "Diego Maradona|Arjantin|Orta saha", "Pelé|Brezilya|Forvet", "Johan Cruyff|Hollanda|Forvet", "Franz Beckenbauer|Almanya|Defans", "Paolo Maldini|İtalya|Defans", "Gianluigi Buffon|İtalya|Kaleci", "Iker Casillas|İspanya|Kaleci",
  "Manuel Neuer|Almanya|Kaleci", "Oliver Kahn|Almanya|Kaleci", "Lev Yashin|Sovyetler Birliği|Kaleci", "Thibaut Courtois|Belçika|Kaleci", "Virgil van Dijk|Hollanda|Defans", "Sergio Ramos|İspanya|Defans", "Fabio Cannavaro|İtalya|Defans",
  "Carles Puyol|İspanya|Defans", "Ronaldo Nazário|Brezilya|Forvet", "Ronaldinho|Brezilya|Orta saha", "Thierry Henry|Fransa|Forvet", "Zlatan Ibrahimović|İsveç|Forvet", "Wayne Rooney|İngiltere|Forvet", "David Beckham|İngiltere|Orta saha",
  "Steven Gerrard|İngiltere|Orta saha", "Frank Lampard|İngiltere|Orta saha", "Michel Platini|Fransa|Orta saha", "Marco van Basten|Hollanda|Forvet", "Roberto Baggio|İtalya|Forvet", "Gabriel Batistuta|Arjantin|Forvet", "Eric Cantona|Fransa|Forvet",
  "Ryan Giggs|Galler|Orta saha", "Paul Scholes|İngiltere|Orta saha", "Toni Kroos|Almanya|Orta saha", "Karim Benzema|Fransa|Forvet", "Antoine Griezmann|Fransa|Forvet", "N'Golo Kanté|Fransa|Orta saha", "Jude Bellingham|İngiltere|Orta saha",
  "Vinícius Júnior|Brezilya|Forvet", "Rodri|İspanya|Orta saha", "Lamine Yamal|İspanya|Forvet", "Hakan Şükür|Türkiye|Forvet", "Rüştü Reçber|Türkiye|Kaleci", "Arda Turan|Türkiye|Orta saha", "Emre Belözoğlu|Türkiye|Orta saha",
  "Hamit Altıntop|Türkiye|Orta saha", "Nihat Kahveci|Türkiye|Forvet", "Burak Yılmaz|Türkiye|Forvet", "Hakan Çalhanoğlu|Türkiye|Orta saha", "Arda Güler|Türkiye|Orta saha", "Uğurcan Çakır|Türkiye|Kaleci", "Merih Demiral|Türkiye|Defans",
  "Çağlar Söyüncü|Türkiye|Defans", "Zeki Çelik|Türkiye|Defans", "Tugay Kerimoğlu|Türkiye|Orta saha", "Bülent Korkmaz|Türkiye|Defans", "Alpay Özalan|Türkiye|Defans", "Metin Oktay|Türkiye|Forvet", "Lefter Küçükandonyadis|Türkiye|Forvet",
  "Cenk Tosun|Türkiye|Forvet", "Mauro Icardi|Arjantin|Forvet", "Didier Drogba|Fildişi Sahili|Forvet", "Samuel Eto'o|Kamerun|Forvet", "George Weah|Liberya|Forvet", "Sadio Mané|Senegal|Forvet", "Son Heung-min|Güney Kore|Forvet",
];

export const FUTBOL: FactSet[] = [
  { id: "dk", cat: "Futbol", sub: "Dünya Kupası", diff: 2, rows: WC, asks: [
    { t: "{0} Dünya Kupası'nı hangi ülke kazandı?", a: 1, by: [0], choice: true },
    { t: "{0} Dünya Kupası finalinde şampiyona kaybeden finalist hangi ülkedir?", a: 2, by: [0], choice: true },
    { t: "{0} Dünya Kupası hangi ülkede düzenlendi?", a: 3, by: [0], choice: true },
  ] },
  { id: "euro", cat: "Futbol", sub: "Avrupa Şampiyonası", diff: 2, rows: EURO, asks: [{ t: "{0} Avrupa Futbol Şampiyonası'nı hangi ülke kazandı?", a: 1, by: [0], choice: true }] },
  { id: "cl", cat: "Futbol", sub: "Şampiyonlar Ligi", diff: 2, rows: CL, asks: [{ t: "Avrupa Kulüpler Şampiyonası/Şampiyonlar Ligi finalini {0} yılında kazanan kulüp hangisidir?", a: 1, by: [0], choice: true }] },
  { id: "bd", cat: "Futbol", sub: "Ballon d'Or", diff: 3, rows: BALLON, asks: [{ t: "{0} Ballon d'Or ödülünü kim kazandı?", a: 1, by: [0], choice: true }] },
  { id: "sl", cat: "Futbol", sub: "Süper Lig", diff: 2, rows: SUPERLIG, asks: [{ t: "Türkiye Süper Ligi'nde {0} sezonunun şampiyonu hangi takımdır?", a: 1, by: [0], choice: true }] },
  { id: "kulup", cat: "Futbol", sub: "Kulüpler", diff: 2, rows: CLUBS, asks: [
    { t: "{0} hangi ülkenin futbol kulübüdür?", a: 1, by: [0], choice: true },
    { t: "{0} takımının iç saha stadyumu hangisidir?", a: 2, by: [0], choice: true, near: 1 },
    { t: "{2} hangi kulübün evidir?", a: 0, by: [2], choice: true, near: 1 },
  ] },
  { id: "oyuncu", cat: "Futbol", sub: "Futbolcular", diff: 2, rows: PLAYERS, asks: [
    { t: "{0} hangi ülkenin milli futbolcusudur (olmuştur)?", a: 1, by: [0], choice: true },
    { t: "{0} adlı futbolcunun mevkii nedir?", a: 2, by: [0], choice: true },
  ] },
];

export const FUTBOL_SINGLES: SingleSet[] = [{
  id: "fut1", cat: "Futbol", sub: "Kurallar ve genel", diff: 1, rows: [
    "Bir futbol maçı normal sürede kaç dakikadır?|90|doksan|80;100;120",
    "Futbolda bir takım sahaya kaç oyuncuyla başlar?|11|on bir|9;10;12",
    "Futbolda penaltı noktası kaleye kaç metre uzaklıktadır?|11|11 metre|9;12;16",
    "Standart bir futbol kalesinin genişliği yaklaşık kaç metredir?|7,32|7.32|6,5;8,2;5,5",
    "Futbolda bir oyuncuya gösterilen iki sarı kart sonucu ne olur?|Kırmızı kart görür ve oyundan atılır|Oyundan atılır|Uyarı alır;Penaltı atılır;Hiçbir şey olmaz",
    "VAR kısaltması neyi ifade eder?|Video Yardımcı Hakem|Video Asistan Hakem;Video Yardımcı Hakem Sistemi|Video Analiz Raporu;Vurgu Alanı Referansı;Video Aktif Referans",
    "FIFA hangi yıl kurulmuştur?|1904||1900;1930;1920",
    "UEFA hangi yıl kurulmuştur?|1954||1930;1960;1946",
    "Türkiye Futbol Federasyonu hangi yıl kurulmuştur?|1923||1905;1930;1950",
    "Dünya Kupası kaç yılda bir düzenlenir?|4|dört|2;3;5",
    "Kornerden doğrudan atılan golün adı nedir?|Olimpik gol|Olimpiyat golü|Şut golü;Devre golü;Hat-trick",
    "Bir futbolcunun aynı maçta üç gol atmasına ne denir?|Hat-trick|Hattrick|Dubleks;Poker;Triplet",
    "Futbolda ofsayt kuralı hangi durumda ihlal edilir?|Oyuncunun topun ve son rakip savunmacının önünde pasa katılması|Savunmanın arkasında kalıp pasa katılması|Topu elle oynaması;Kaleciyi engellemesi;Penaltı alanına girmesi",
    "Türkiye A Milli Futbol Takımı 2002 Dünya Kupası'nda kaçıncı olmuştur?|3.|Üçüncü;3|2.;4.;5.",
    "Türkiye 2002 Dünya Kupası'nda üçüncülük maçında hangi ülkeyi yendi?|Güney Kore||Brezilya;Japonya;Almanya",
    "Hakan Şükür 2002 Dünya Kupası üçüncülük maçında kaçıncı saniyede gol atmıştır?|11|11. saniye|5;20;35",
    "Türkiye A Milli Takımı Euro 2008'de hangi turda elenmiştir?|Yarı final|Yarı finalde|Çeyrek final;Grup;Finalde",
    "Galatasaray UEFA Kupası'nı hangi yıl kazanmıştır?|2000||1998;2002;1996",
    "Galatasaray 2000 UEFA Kupası finalinde hangi İngiliz takımını yenmiştir?|Arsenal||Chelsea;Liverpool;Leeds United",
    "Galatasaray 2000'de UEFA Süper Kupası'nı hangi takımı yenerek kazandı?|Real Madrid||Barcelona;Milan;Bayern Münih",
    "Beşiktaş hangi yıl kurulmuştur?|1903||1905;1907;1900",
    "Galatasaray hangi yıl kurulmuştur?|1905||1903;1907;1910",
    "Fenerbahçe hangi yıl kurulmuştur?|1907||1903;1905;1909",
    "Trabzonspor hangi yıl kurulmuştur?|1967||1960;1975;1980",
    "Galatasaray'ın renkleri hangileridir?|Sarı-kırmızı|Sarı kırmızı|Sarı-lacivert;Siyah-beyaz;Bordo-mavi",
    "Fenerbahçe'nin renkleri hangileridir?|Sarı-lacivert|Sarı lacivert|Sarı-kırmızı;Siyah-beyaz;Kırmızı-beyaz",
    "Beşiktaş'ın renkleri hangileridir?|Siyah-beyaz|Siyah beyaz|Sarı-kırmızı;Sarı-lacivert;Bordo-mavi",
    "Trabzonspor'un renkleri hangileridir?|Bordo-mavi|Bordo mavi|Sarı-lacivert;Kırmızı-beyaz;Yeşil-beyaz",
    "Real Madrid, 2024 itibarıyla Avrupa Kulüpler Şampiyonası/Şampiyonlar Ligi'ni toplam kaç kez kazanmıştır?|15|on beş|13;14;12",
    "Pelé Dünya Kupası'nı kaç kez kazanmıştır?|3|üç|2;4;1",
    "Brezilya Dünya Kupası'nı kaç kez kazanmıştır?|5|beş|4;6;3",
    "Almanya (Batı Almanya dahil) Dünya Kupası'nı kaç kez kazanmıştır?|4|dört|3;5;2",
    "İtalya Dünya Kupası'nı kaç kez kazanmıştır?|4|dört|3;5;2",
    "Arjantin 2022 Dünya Kupası finalinde Fransa'yı hangi yöntemle yendi?|Penaltılarla|Penaltı atışlarıyla|Uzatmada altın golle;Normal sürede 1-0;Gümüş golle",
    "Maradona 1986'daki 'Tanrı'nın Eli' golünü hangi ülkeye karşı attı?|İngiltere||Almanya;Brezilya;Belçika",
    "Lionel Messi hangi kulüpte uzun yıllar forma giymiştir?|Barcelona||Real Madrid;Juventus;Bayern Münih",
    "Cristiano Ronaldo'nun profesyonel kariyerine başladığı kulüp hangisidir?|Sporting Lizbon|Sporting|Benfica;Porto;Manchester United",
    "'Futbolun Anavatanı' olarak anılan ülke hangisidir?|İngiltere||Brezilya;İtalya;Almanya",
    "Türkiye'de en çok Süper Lig şampiyonluğu bulunan kulüp hangisidir?|Galatasaray||Fenerbahçe;Beşiktaş;Trabzonspor",
    "Kadıköy hangi kulübün stadyumuyla anılır?|Fenerbahçe||Galatasaray;Beşiktaş;Başakşehir",
    "Euro 2024'te şampiyon olan takım hangisidir?|İspanya||İngiltere;Fransa;Almanya",
  ],
}];
