import type { FactSet, SingleSet } from "../gen";

const F1 = ["1950|Giuseppe Farina;Farina", "1951|Juan Manuel Fangio;Fangio", "1952|Alberto Ascari;Ascari", "1953|Alberto Ascari;Ascari", "1954|Juan Manuel Fangio;Fangio", "1955|Juan Manuel Fangio;Fangio", "1956|Juan Manuel Fangio;Fangio", "1957|Juan Manuel Fangio;Fangio",
  "1958|Mike Hawthorn;Hawthorn", "1959|Jack Brabham;Brabham", "1960|Jack Brabham;Brabham", "1961|Phil Hill", "1962|Graham Hill", "1963|Jim Clark", "1964|John Surtees;Surtees", "1965|Jim Clark", "1966|Jack Brabham;Brabham", "1967|Denny Hulme;Hulme",
  "1968|Graham Hill", "1969|Jackie Stewart;Stewart", "1970|Jochen Rindt;Rindt", "1971|Jackie Stewart;Stewart", "1972|Emerson Fittipaldi;Fittipaldi", "1973|Jackie Stewart;Stewart", "1974|Emerson Fittipaldi;Fittipaldi", "1975|Niki Lauda;Lauda",
  "1976|James Hunt;Hunt", "1977|Niki Lauda;Lauda", "1978|Mario Andretti;Andretti", "1979|Jody Scheckter;Scheckter", "1980|Alan Jones", "1981|Nelson Piquet;Piquet", "1982|Keke Rosberg", "1983|Nelson Piquet;Piquet", "1984|Niki Lauda;Lauda",
  "1985|Alain Prost;Prost", "1986|Alain Prost;Prost", "1987|Nelson Piquet;Piquet", "1988|Ayrton Senna;Senna", "1989|Alain Prost;Prost", "1990|Ayrton Senna;Senna", "1991|Ayrton Senna;Senna", "1992|Nigel Mansell;Mansell", "1993|Alain Prost;Prost",
  "1994|Michael Schumacher;Schumacher", "1995|Michael Schumacher;Schumacher", "1996|Damon Hill", "1997|Jacques Villeneuve;Villeneuve", "1998|Mika Häkkinen;Häkkinen;Hakkinen", "1999|Mika Häkkinen;Häkkinen;Hakkinen", "2000|Michael Schumacher;Schumacher",
  "2001|Michael Schumacher;Schumacher", "2002|Michael Schumacher;Schumacher", "2003|Michael Schumacher;Schumacher", "2004|Michael Schumacher;Schumacher", "2005|Fernando Alonso;Alonso", "2006|Fernando Alonso;Alonso", "2007|Kimi Räikkönen;Räikkönen;Raikkonen",
  "2008|Lewis Hamilton;Hamilton", "2009|Jenson Button;Button", "2010|Sebastian Vettel;Vettel", "2011|Sebastian Vettel;Vettel", "2012|Sebastian Vettel;Vettel", "2013|Sebastian Vettel;Vettel", "2014|Lewis Hamilton;Hamilton", "2015|Lewis Hamilton;Hamilton",
  "2016|Nico Rosberg;Rosberg", "2017|Lewis Hamilton;Hamilton", "2018|Lewis Hamilton;Hamilton", "2019|Lewis Hamilton;Hamilton", "2020|Lewis Hamilton;Hamilton", "2021|Max Verstappen;Verstappen", "2022|Max Verstappen;Verstappen", "2023|Max Verstappen;Verstappen", "2024|Max Verstappen;Verstappen", "2025|Lando Norris;Norris"];
const SUMMER = ["1896|Atina", "1900|Paris", "1904|St. Louis", "1908|Londra", "1912|Stockholm", "1920|Anvers", "1924|Paris", "1928|Amsterdam", "1932|Los Angeles", "1936|Berlin", "1948|Londra", "1952|Helsinki", "1956|Melbourne", "1960|Roma", "1964|Tokyo", "1968|Meksiko",
  "1972|Münih", "1976|Montreal", "1980|Moskova", "1984|Los Angeles", "1988|Seul", "1992|Barselona", "1996|Atlanta", "2000|Sidney", "2004|Atina", "2008|Pekin", "2012|Londra", "2016|Rio de Janeiro", "2020|Tokyo", "2024|Paris"];
const WINTER = ["1924|Chamonix", "1928|St. Moritz", "1932|Lake Placid", "1936|Garmisch-Partenkirchen", "1948|St. Moritz", "1952|Oslo", "1956|Cortina d'Ampezzo", "1960|Squaw Valley", "1964|Innsbruck", "1968|Grenoble", "1972|Sapporo", "1976|Innsbruck",
  "1980|Lake Placid", "1984|Saraybosna", "1988|Calgary", "1992|Albertville", "1994|Lillehammer", "1998|Nagano", "2002|Salt Lake City", "2006|Torino", "2010|Vancouver", "2014|Soçi", "2018|PyeongChang", "2022|Pekin"];
const NBA = ["1991|Chicago Bulls", "1992|Chicago Bulls", "1993|Chicago Bulls", "1994|Houston Rockets", "1995|Houston Rockets", "1996|Chicago Bulls", "1997|Chicago Bulls", "1998|Chicago Bulls", "1999|San Antonio Spurs", "2000|Los Angeles Lakers", "2001|Los Angeles Lakers",
  "2002|Los Angeles Lakers", "2003|San Antonio Spurs", "2004|Detroit Pistons", "2005|San Antonio Spurs", "2006|Miami Heat", "2007|San Antonio Spurs", "2008|Boston Celtics", "2009|Los Angeles Lakers", "2010|Los Angeles Lakers", "2011|Dallas Mavericks",
  "2012|Miami Heat", "2013|Miami Heat", "2014|San Antonio Spurs", "2015|Golden State Warriors", "2016|Cleveland Cavaliers", "2017|Golden State Warriors", "2018|Golden State Warriors", "2019|Toronto Raptors", "2020|Los Angeles Lakers", "2021|Milwaukee Bucks",
  "2022|Golden State Warriors", "2023|Denver Nuggets", "2024|Boston Celtics", "2025|Oklahoma City Thunder", "2026|New York Knicks"];
const WIMB = ["2000|Pete Sampras;Sampras", "2001|Goran Ivanišević;Ivanisevic", "2002|Lleyton Hewitt;Hewitt", "2003|Roger Federer;Federer", "2004|Roger Federer;Federer", "2005|Roger Federer;Federer", "2006|Roger Federer;Federer", "2007|Roger Federer;Federer", "2008|Rafael Nadal;Nadal",
  "2009|Roger Federer;Federer", "2010|Rafael Nadal;Nadal", "2011|Novak Djokovic;Djokovic", "2012|Roger Federer;Federer", "2013|Andy Murray;Murray", "2014|Novak Djokovic;Djokovic", "2015|Novak Djokovic;Djokovic", "2016|Andy Murray;Murray", "2017|Roger Federer;Federer",
  "2018|Novak Djokovic;Djokovic", "2019|Novak Djokovic;Djokovic", "2021|Novak Djokovic;Djokovic", "2022|Novak Djokovic;Djokovic", "2023|Carlos Alcaraz;Alcaraz", "2024|Carlos Alcaraz;Alcaraz", "2025|Jannik Sinner;Sinner", "2026|Jannik Sinner;Sinner"];
// spor|sahadaki oyuncu sayısı
const TEAMSIZE = ["Futbol|11", "Basketbol|5", "Voleybol|6", "Hentbol|7", "Ragbi (15'li)|15", "Buz hokeyi (kaleci dahil)|6", "Beyzbol|9", "Kriket|11", "Su topu (kaleci dahil)|7", "Plaj voleybolu|2", "Amerikan futbolu|11", "Çim hokeyi|11"];
const ORIGIN = ["Judo|Japonya", "Sumo|Japonya", "Taekwondo|Güney Kore", "Basketbol|ABD;Amerika Birleşik Devletleri", "Voleybol|ABD;Amerika Birleşik Devletleri", "Ragbi|İngiltere;Birleşik Krallık", "Kriket|İngiltere;Birleşik Krallık", "Golf|İskoçya", "Capoeira|Brezilya", "Yağlı güreş|Türkiye", "Kung fu|Çin"];
// sporcu|dal
const ATHLETES = ["Usain Bolt|Atletizm", "Carl Lewis|Atletizm", "Eliud Kipchoge|Atletizm", "Michael Phelps|Yüzme", "Serena Williams|Tenis", "Roger Federer|Tenis", "Rafael Nadal|Tenis", "Novak Djokovic|Tenis", "Michael Jordan|Basketbol", "LeBron James|Basketbol", "Kobe Bryant|Basketbol",
  "Stephen Curry|Basketbol", "Giannis Antetokounmpo|Basketbol", "Nikola Jokić|Basketbol", "Hidayet Türkoğlu|Basketbol", "Muhammed Ali|Boks", "Mike Tyson|Boks", "Lewis Hamilton|Formula 1", "Michael Schumacher|Formula 1", "Ayrton Senna|Formula 1", "Max Verstappen|Formula 1",
  "Tiger Woods|Golf", "Simone Biles|Cimnastik", "Nadia Comăneci|Cimnastik", "Naim Süleymanoğlu|Halter", "Halil Mutlu|Halter", "Rıza Kayaalp|Güreş", "Mete Gazoz|Okçuluk", "Yusuf Dikeç|Atıcılık", "Zinedine Zidane|Futbol", "Pelé|Futbol", "Magic Johnson|Basketbol",
  "Larry Bird|Basketbol", "Shaquille O'Neal|Basketbol", "Luka Dončić|Basketbol", "Bruce Lee|Dövüş sanatları", "Sachin Tendulkar|Kriket", "Lionel Messi|Futbol", "Valentino Rossi|Motosiklet yarışı", "Kenan Sofuoğlu|Motosiklet yarışı", "Tom Brady|Amerikan futbolu", "Marc Márquez|Motosiklet yarışı",
  "Floyd Mayweather|Boks", "Khabib Nurmagomedov|Karma dövüş sanatları (MMA)", "Katie Ledecky|Yüzme", "Mo Farah|Atletizm", "Yelena Isinbayeva|Atletizm (sırıkla atlama)", "Sergey Bubka|Atletizm (sırıkla atlama)"];

export const SPOR: FactSet[] = [
  { id: "f1", cat: "Spor", sub: "Formula 1", diff: 2, rows: F1, asks: [{ t: "{0} Formula 1 Dünya Şampiyonu kimdir?", a: 1, by: [0], choice: true }] },
  { id: "oy", cat: "Spor", sub: "Olimpiyatlar", diff: 2, rows: SUMMER, asks: [{ t: "{0} Yaz Olimpiyatları hangi şehirde düzenlenmiştir?", a: 1, by: [0], choice: true }] },
  { id: "ok", cat: "Spor", sub: "Olimpiyatlar", diff: 3, rows: WINTER, asks: [{ t: "{0} Kış Olimpiyatları hangi şehirde düzenlenmiştir?", a: 1, by: [0], choice: true }] },
  { id: "nba", cat: "Spor", sub: "NBA", diff: 2, rows: NBA, asks: [{ t: "{0} NBA şampiyonu hangi takımdır?", a: 1, by: [0], choice: true }] },
  { id: "wimb", cat: "Spor", sub: "Tenis", diff: 2, rows: WIMB, asks: [{ t: "{0} Wimbledon erkekler tek şampiyonu kimdir?", a: 1, by: [0], choice: true }] },
  { id: "kadro", cat: "Spor", sub: "Spor kuralları", diff: 1, rows: TEAMSIZE, asks: [{ t: "{0} maçında bir takım sahada kaç oyuncuyla oynar?", a: 1, by: [0], num: true, choice: true }] },
  { id: "koken", cat: "Spor", sub: "Sporların kökeni", diff: 2, rows: ORIGIN, asks: [{ t: "{0} sporunun anavatanı hangi ülkedir?", a: 1, by: [0], choice: true }] },
  { id: "sporcu", cat: "Spor", sub: "Sporcular", diff: 1, rows: ATHLETES, asks: [{ t: "{0} hangi spor dalıyla özdeşleşmiştir?", a: 1, by: [0], choice: true }] },
];

export const SPOR_SINGLES: SingleSet[] = [{
  id: "spor1", cat: "Spor", sub: "Genel spor", diff: 1, rows: [
    "Olimpiyat bayrağında kaç halka vardır?|5|beş|4;6;7",
    "Maraton koşusu kaç kilometredir?|42,195|42.195;42 km 195 m|40;21,097;45",
    "Yarı maraton kaç kilometredir?|21,097|21.097|20;21;25",
    "Basketbolda serbest atış (faul atışı) kaç sayıdır?|1|bir|2;3;0",
    "Basketbolda üçlük çizgisinin ötesinden atılan isabetli şut kaç sayıdır?|3|üç|2;4;1",
    "Voleybolda bir sette kazanmak için normalde kaç sayıya ulaşmak gerekir (en az iki farkla)?|25|yirmi beş|21;15;30",
    "Tenis kortunda file üzerinden oynanan topun yere değmeden geri dönmesine ne denir?|Vole|Volley|Smaç;Servis;Ace",
    "Tenisin dört Grand Slam turnuvasından hangisi çim kortta oynanır?|Wimbledon||Roland Garros;US Open;Avustralya Açık",
    "Tenisin dört Grand Slam turnuvasından hangisi kil kortta oynanır?|Roland Garros|Fransa Açık|Wimbledon;US Open;Avustralya Açık",
    "Golfte bir deliğin par değerinden bir vuruş eksik tamamlanmasına ne denir?|Birdie||Eagle;Bogey;Albatros",
    "Boksta bir yuvarlak (raund) süresi profesyonellerde kaç dakikadır?|3|üç|2;4;5",
    "Satrançta tahtada kaç kare vardır?|64|altmış dört|32;81;100",
    "Tour de France hangi spor dalının yarışıdır?|Bisiklet|Yol bisikleti|Maraton;Triatlon;Kürek",
    "Triatlon hangi üç disiplinden oluşur?|Yüzme, bisiklet, koşu|Yüzme-bisiklet-koşu|Koşu, güreş, atıcılık;Yüzme, kürek, koşu;Bisiklet, atletizm, kayak",
    "Atletizmde 100 metre yarışının dünya rekoru kimdedir (9,58 sn)?|Usain Bolt|Bolt|Carl Lewis;Tyson Gay;Asafa Powell",
    "Yağlı güreşin en ünlü turnuvası hangi ilde yapılır?|Edirne|Kırkpınar|Bursa;Konya;Sivas",
    "Kırkpınar Yağlı Güreşleri hangi ilde düzenlenir?|Edirne||Tekirdağ;Kırklareli;Bursa",
    "'Cep Herkülü' lakabıyla bilinen Türk halterci kimdir?|Naim Süleymanoğlu|Naim|Halil Mutlu;Taner Sağır;Hafız Süleymanoğlu",
    "Naim Süleymanoğlu kaç Olimpiyat altın madalyası kazanmıştır?|3|üç|1;2;4",
    "Filenin Sultanları 2023'te Avrupa Şampiyonası'nı kazanırken hangi spor dalında yarışmıştır?|Voleybol||Basketbol;Hentbol;Futbol",
    "A Milli Erkek Basketbol Takımı 2010 Dünya Şampiyonası finalinde hangi ülkeye yenilmiştir?|ABD|Amerika Birleşik Devletleri|İspanya;Litvanya;Yunanistan",
    "İstanbul Park hangi motor sporları yarışına ev sahipliği yapmıştır?|Formula 1|F1|Rally;Moto GP;Nascar",
    "Wimbledon turnuvası hangi ülkede oynanır?|Birleşik Krallık|İngiltere|Fransa;ABD;Avustralya",
    "Su polosunda maç kaç oyuncuyla (sahada) oynanır?|7|yedi|5;6;9",
    "Olimpiyat Oyunları modern dönemde ilk kez hangi şehirde yapıldı?|Atina|Atina (1896)|Paris;Londra;Roma",
    "Olimpiyat meşalesi her oyunlarda hangi antik kentte yakılır?|Olimpiya|Olympia|Atina;Delfi;Sparta",
    "2005 UEFA Şampiyonlar Ligi finali hangi şehirde oynanmıştır?|İstanbul||Atina;Paris;Londra",
  ],
}];
