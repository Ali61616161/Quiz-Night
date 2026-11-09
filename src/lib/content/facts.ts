/** Olgu tabloları. Satır biçimi: "soru öğesi|cevap|alternatif1;alternatif2". Her satır tek net cevaplı ve doğrulanabilir olmalı. */
export interface Table {
  key: string; category: string; subtopic: string; difficulty: 1 | 2 | 3;
  ask: (a: string) => string; rows: string[]; numeric?: boolean; explain?: (a: string, b: string) => string;
  /** Eşleştirme setleri için etiketler */
  pairLabel?: string;
}

export const TABLES: Table[] = [
  { key: "capital", category: "Coğrafya", subtopic: "Başkentler", difficulty: 1, ask: (a) => `${a} ülkesinin başkenti neresidir?`, rows: [
    "Fransa|Paris", "Almanya|Berlin", "İtalya|Roma", "İspanya|Madrid", "Portekiz|Lizbon", "Yunanistan|Atina", "Bulgaristan|Sofya", "Romanya|Bükreş",
    "Macaristan|Budapeşte", "Avusturya|Viyana", "İsviçre|Bern", "Hollanda|Amsterdam", "Belçika|Brüksel", "Polonya|Varşova", "Çekya|Prag", "İsveç|Stokholm",
    "Norveç|Oslo", "Finlandiya|Helsinki", "Danimarka|Kopenhag", "İrlanda|Dublin", "Rusya|Moskova", "Ukrayna|Kiev|Kyiv", "Japonya|Tokyo", "Çin|Pekin",
    "Güney Kore|Seul", "Hindistan|Yeni Delhi|Delhi", "Mısır|Kahire", "Suudi Arabistan|Riyad", "İran|Tahran", "Irak|Bağdat", "Ürdün|Amman", "Lübnan|Beyrut",
    "Azerbaycan|Bakü", "Gürcistan|Tiflis", "Kazakistan|Astana", "Özbekistan|Taşkent", "Kanada|Ottawa", "Avustralya|Kanberra", "Brezilya|Brasilia", "Arjantin|Buenos Aires",
    "Peru|Lima", "Şili|Santiago", "Kolombiya|Bogota", "Küba|Havana", "Kenya|Nairobi", "Nijerya|Abuja", "Etiyopya|Addis Ababa|Addis Abeba",
    "Fas|Rabat", "Libya|Trablus", "Tayland|Bangkok", "Vietnam|Hanoi", "Endonezya|Cakarta", "Filipinler|Manila", "Pakistan|İslamabad", "Afganistan|Kabil",
    "Sırbistan|Belgrad", "Hırvatistan|Zagreb", "Bosna Hersek|Saraybosna", "Arnavutluk|Tiran", "Kuzey Makedonya|Üsküp", "İzlanda|Reykjavik", "Yeni Zelanda|Wellington", "Malezya|Kuala Lumpur",
  ] },
  { key: "plate", category: "Coğrafya", subtopic: "Türkiye illeri", difficulty: 2, numeric: true, ask: (a) => `${a} ilinin plaka kodu kaçtır?`, rows: [
    "Adana|1", "Ankara|6", "Antalya|7", "Aydın|9", "Balıkesir|10", "Bursa|16", "Denizli|20", "Diyarbakır|21", "Edirne|22", "Elazığ|23", "Erzurum|25", "Eskişehir|26",
    "Gaziantep|27", "Hatay|31", "Isparta|32", "Mersin|33", "İstanbul|34", "İzmir|35", "Kayseri|38", "Kocaeli|41", "Konya|42", "Malatya|44", "Manisa|45", "Muğla|48",
    "Ordu|52", "Rize|53", "Sakarya|54", "Samsun|55", "Sivas|58", "Tekirdağ|59", "Tokat|60", "Trabzon|61", "Uşak|64", "Van|65", "Zonguldak|67", "Aksaray|68", "Bartın|74", "Karabük|78", "Osmaniye|80", "Düzce|81",
  ] },
  { key: "element", category: "Bilim", subtopic: "Kimya", difficulty: 2, ask: (a) => `${a} elementinin kimyasal simgesi nedir?`, rows: [
    "Hidrojen|H", "Helyum|He", "Lityum|Li", "Karbon|C", "Azot|N", "Oksijen|O", "Flor|F", "Neon|Ne", "Sodyum|Na", "Magnezyum|Mg", "Alüminyum|Al", "Silisyum|Si",
    "Fosfor|P", "Kükürt|S", "Klor|Cl", "Potasyum|K", "Kalsiyum|Ca", "Demir|Fe", "Bakır|Cu", "Çinko|Zn", "Gümüş|Ag", "Altın|Au", "Cıva|Hg", "Kurşun|Pb", "Kalay|Sn", "Platin|Pt", "Uranyum|U", "Argon|Ar", "Titanyum|Ti", "Nikel|Ni",
  ] },
  { key: "history", category: "Tarih", subtopic: "Tarihler", difficulty: 2, numeric: true, ask: (a) => `${a} hangi yıl gerçekleşti?`, rows: [
    "Malazgirt Savaşı|1071", "İstanbul'un fethi|1453", "Cumhuriyetin ilanı|1923", "Samsun'a çıkış (Kurtuluş Savaşı'nın başlangıcı)|1919", "TBMM'nin açılışı|1920",
    "Lozan Antlaşması'nın imzalanması|1923", "Soyadı Kanunu'nun kabulü|1934", "Harf Devrimi|1928", "Fransız Devrimi|1789", "Amerikan Bağımsızlık Bildirgesi'nin ilanı|1776",
    "Birinci Dünya Savaşı'nın başlangıcı|1914", "İkinci Dünya Savaşı'nın başlangıcı|1939", "İkinci Dünya Savaşı'nın bitişi|1945", "Berlin Duvarı'nın yıkılışı|1989",
    "Sovyetler Birliği'nin dağılması|1991", "İnsanın Ay'a ilk inişi|1969", "Titanic'in batışı|1912", "Kristof Kolomb'un Amerika'ya ulaşması|1492", "Çaldıran Savaşı|1514",
    "Mohaç Meydan Muharebesi|1526", "Preveze Deniz Savaşı|1538", "Sakarya Meydan Muharebesi|1921", "Büyük Taarruz|1922", "Türkiye'nin NATO'ya katılması|1952",
    "Tanzimat Fermanı'nın ilanı|1839", "Birinci Meşrutiyet'in ilanı|1876", "İkinci Meşrutiyet'in ilanı|1908", "Çanakkale Deniz Zaferi|1915", "Mondros Ateşkes Antlaşması|1918",
    "Atatürk'ün vefatı|1938", "Boğaziçi Köprüsü'nün açılışı|1973", "Marmaray'ın açılışı|2013", "Hilafetin kaldırılması|1924", "Magna Carta'nın imzalanması|1215",
    "Batı Roma İmparatorluğu'nun çöküşü|476", "Hicret|622", "İlk iPhone'un tanıtılması|2007", "Mustafa Kemal'in Ankara'ya gelişi|1919", "Sevr Antlaşması'nın imzalanması|1920", "Kanuni Sultan Süleyman'ın tahta çıkışı|1520",
  ] },
  { key: "worldcup", category: "Futbol", subtopic: "Dünya Kupası", difficulty: 2, ask: (a) => `${a} Dünya Kupası'nı hangi ülke kazandı?`, rows: [
    "1966|İngiltere", "1970|Brezilya", "1978|Arjantin", "1982|İtalya", "1986|Arjantin", "1990|Almanya|Batı Almanya", "1994|Brezilya", "1998|Fransa", "2002|Brezilya", "2006|İtalya", "2010|İspanya", "2014|Almanya", "2018|Fransa", "2022|Arjantin",
  ] },
  { key: "euro", category: "Futbol", subtopic: "Avrupa Şampiyonası", difficulty: 2, ask: (a) => `${a} Avrupa Futbol Şampiyonası'nı hangi ülke kazandı?`, rows: [
    "2004|Yunanistan", "2008|İspanya", "2012|İspanya", "2016|Portekiz", "2020|İtalya", "2024|İspanya",
  ] },
  { key: "book", category: "Genel Kültür", subtopic: "Edebiyat", difficulty: 2, ask: (a) => `“${a}” adlı eserin yazarı kimdir?`, rows: [
    "Sefiller|Victor Hugo|Hugo", "Suç ve Ceza|Fyodor Dostoyevski|Dostoyevski", "Savaş ve Barış|Lev Tolstoy|Tolstoy", "Don Kişot|Miguel de Cervantes|Cervantes", "Hamlet|William Shakespeare|Shakespeare",
    "1984|George Orwell|Orwell", "Hayvan Çiftliği|George Orwell|Orwell", "Küçük Prens|Antoine de Saint-Exupéry|Saint-Exupéry", "Simyacı|Paulo Coelho|Coelho",
    "Yüzyıllık Yalnızlık|Gabriel García Márquez|Márquez;Marquez", "İnce Memed|Yaşar Kemal", "Tutunamayanlar|Oğuz Atay", "Çalıkuşu|Reşat Nuri Güntekin|Güntekin",
    "Huzur|Ahmet Hamdi Tanpınar|Tanpınar", "Kürk Mantolu Madonna|Sabahattin Ali", "Benim Adım Kırmızı|Orhan Pamuk|Pamuk", "Masumiyet Müzesi|Orhan Pamuk|Pamuk",
    "Aşk-ı Memnu|Halit Ziya Uşaklıgil|Uşaklıgil", "Sinekli Bakkal|Halide Edib Adıvar|Adıvar", "Harry Potter|J. K. Rowling|Rowling", "Yüzüklerin Efendisi|J. R. R. Tolkien|Tolkien",
    "Gurur ve Önyargı|Jane Austen|Austen", "Dönüşüm|Franz Kafka|Kafka", "Yabancı|Albert Camus|Camus", "Romeo ve Juliet|William Shakespeare|Shakespeare", "Beyaz Diş|Jack London|London",
    "Define Adası|Robert Louis Stevenson|Stevenson", "Oliver Twist|Charles Dickens|Dickens", "Madam Bovary|Gustave Flaubert|Flaubert", "Çanlar Kimin İçin Çalıyor|Ernest Hemingway|Hemingway",
    "Fareler ve İnsanlar|John Steinbeck|Steinbeck", "Sherlock Holmes|Arthur Conan Doyle|Conan Doyle;Doyle", "Dracula|Bram Stoker|Stoker", "Frankenstein|Mary Shelley|Shelley",
    "İlyada|Homeros", "Kutadgu Bilig|Yusuf Has Hacib|Balasagunlu Yusuf", "Seyahatname|Evliya Çelebi", "Safahat|Mehmet Akif Ersoy|Akif", "Nutuk|Mustafa Kemal Atatürk|Atatürk",
  ] },
  { key: "inventor", category: "Bilim", subtopic: "Bilim insanları", difficulty: 2, ask: (a) => `${a} kimle özdeşleşmiştir?`, rows: [
    "Telefonun icadı|Alexander Graham Bell|Bell", "Elektrik ampulünün ticari başarısı|Thomas Edison|Edison", "Görelilik kuramı|Albert Einstein|Einstein", "Penisilinin keşfi|Alexander Fleming|Fleming",
    "Radyum ve polonyumun keşfi|Marie Curie|Curie", "Kütleçekimi yasası|Isaac Newton|Newton", "Evrim kuramı|Charles Darwin|Darwin", "Avrupa'da hareketli harfli matbaa|Johannes Gutenberg|Gutenberg",
    "Dinamitin icadı|Alfred Nobel|Nobel", "Çiçek aşısı|Edward Jenner|Jenner", "Pastörizasyon|Louis Pasteur|Pasteur", "Güneş merkezli evren modeli|Nicolaus Copernicus|Kopernik",
    "Periyodik tablo|Dmitri Mendeleyev|Mendeleyev", "Motorlu uçakla ilk uçuş|Wright Kardeşler|Wright", "Dünya Haritası ve Kitab-ı Bahriye|Piri Reis", "Süleymaniye Camii'nin mimarisi|Mimar Sinan|Sinan",
    "2015 Nobel Kimya Ödülü'nü alan Türk bilim insanı|Aziz Sancar|Sancar", "2006 Nobel Edebiyat Ödülü'nü alan Türk yazar|Orhan Pamuk|Pamuk", "Selimiye Camii'nin mimarisi|Mimar Sinan|Sinan",
  ] },
  { key: "science", category: "Bilim", subtopic: "Genel bilim", difficulty: 1, ask: (a) => a, rows: [
    "Güneş Sistemi'nin en büyük gezegeni hangisidir?|Jüpiter", "Güneş'e en yakın gezegen hangisidir?|Merkür", "Kızıl Gezegen olarak bilinen gezegen hangisidir?|Mars",
    "Halkalarıyla ünlü gezegen hangisidir?|Satürn", "Dünya'nın doğal uydusu nedir?|Ay", "Suyun deniz seviyesinde kaynama noktası kaç °C'dir?|100", "Suyun donma noktası kaç °C'dir?|0",
    "İnsan kalbi kaç odacıktan oluşur?|4", "DNA'nın açılımı nedir?|Deoksiribonükleik asit", "Bitkilerin fotosentezde atmosferden aldığı gaz nedir?|Karbondioksit|CO2",
    "Atmosferde en bol bulunan gaz hangisidir?|Azot", "Doğadaki en sert madde nedir?|Elmas", "İnsan vücudunun en büyük organı nedir?|Deri", "Güneş ışığıyla cilt tarafından üretilen vitamin hangisidir?|D vitamini|D",
    "Gökkuşağında kaç renk vardır?|7|yedi", "Kuvvetin SI birimi nedir?|Newton", "Elektrik direncinin birimi nedir?|Ohm", "Gücün SI birimi nedir?|Watt", "Frekansın SI birimi nedir?|Hertz",
    "Saf suyun pH değeri kaçtır?|7", "Örümceklerin kaç bacağı vardır?|8|sekiz", "Böceklerin kaç bacağı vardır?|6|altı", "Ahtapotun kaç kolu vardır?|8|sekiz", "En büyük hayvan hangisidir?|Mavi balina",
    "En hızlı kara hayvanı hangisidir?|Çita", "Penguenler hangi kıtada doğal olarak yaşar?|Antarktika", "Kanguru hangi ülkeyle özdeşleşmiştir?|Avustralya", "Büyük pandanın anavatanı hangi ülkedir?|Çin",
    "Yetişkin insanda yaklaşık kaç kemik bulunur?|206", "Dünya'nın Güneş çevresindeki turu yaklaşık kaç gün sürer?|365",     "Kanı vücutta dolaştıran organ hangisidir?|Kalp", "Dünya'nın en büyük okyanusu hangisidir?|Pasifik|Büyük Okyanus", "Işığın bir yılda aldığı yola ne ad verilir?|Işık yılı", "Su molekülünde kaç hidrojen atomu bulunur?|2|iki",
  ] },
  { key: "dish", category: "Yemek", subtopic: "Yöresel lezzetler", difficulty: 2, ask: (a) => `${a} hangi şehirle özdeşleşmiştir?`, rows: [
    "İskender kebap|Bursa", "Antep baklavası|Gaziantep", "Çiğ köfte|Şanlıurfa", "Etli ekmek|Konya", "Pastırma|Kayseri",
    "Afyon kaymağı|Afyonkarahisar|Afyon", "Maraş dondurması|Kahramanmaraş|Maraş", "Bafra pidesi|Samsun", "İnegöl köftesi|Bursa",
    "Beypazarı kurusu|Ankara", "Antep fıstığı|Gaziantep", "Ezine peyniri|Çanakkale",   ] },
  { key: "cuisine", category: "Yemek", subtopic: "Dünya mutfağı", difficulty: 1, ask: (a) => `${a} hangi ülke mutfağının simgelerindendir?`, rows: [
    "Pizza|İtalya", "Sushi|Japonya", "Tacos|Meksika", "Paella|İspanya", "Kimchi|Güney Kore|Kore", "Pad Thai|Tayland", "Musakka|Yunanistan", "Fondü|İsviçre", "Gulaş|Macaristan", "Baget|Fransa", "Lazanya|İtalya", "Ramen|Japonya", "Burrito|Meksika",
  ] },
  { key: "cooking", category: "Yemek", subtopic: "Mutfak bilgisi", difficulty: 1, ask: (a) => a, rows: [
    "Baklavanın hamuru hangi ana malzemeyle yapılır?|Yufka", "Sütlaç hangi tahılla yapılır?|Pirinç", "Aşure hangi tahıl ağırlıklı yapılır?|Buğday", "Karnıyarık hangi sebzeyle yapılır?|Patlıcan",
    "Zeytinyağlı sarmada genellikle hangi yaprak kullanılır?|Asma yaprağı|Üzüm yaprağı", "Humus hangi baklagilden yapılır?|Nohut", "Pekmez hangi meyveden yapılır?|Üzüm",
    "Türk kahvesi hangi kapta pişirilir?|Cezve", "Tarhana çorbasının ana ögelerinden biri hangi süt ürünüdür?|Yoğurt", "Lahmacun hangi hamurla yapılır?|İnce hamur|Yufka", "Menemende yumurtayla birlikte hangi sebze kullanılır?|Domates",
  ] },
  { key: "director", category: "Dizi/Film", subtopic: "Yönetmenler", difficulty: 2, ask: (a) => `“${a}” filminin yönetmeni kimdir?`, rows: [
    "Titanic|James Cameron|Cameron", "Avatar|James Cameron|Cameron", "Inception|Christopher Nolan|Nolan", "Yıldızlararası|Christopher Nolan|Nolan", "Kara Şövalye|Christopher Nolan|Nolan",
    "Jurassic Park|Steven Spielberg|Spielberg", "E.T.|Steven Spielberg|Spielberg", "Schindler'in Listesi|Steven Spielberg|Spielberg", "Pulp Fiction|Quentin Tarantino|Tarantino", "Baba|Francis Ford Coppola|Coppola",
    "Parazit|Bong Joon-ho|Bong Joon Ho", "Gladyatör|Ridley Scott", "Taksi Şoförü|Martin Scorsese|Scorsese", "Matrix|Wachowski Kardeşler|Wachowski", "Forrest Gump|Robert Zemeckis|Zemeckis",
    "Geleceğe Dönüş|Robert Zemeckis|Zemeckis", "Eşkıya|Yavuz Turgul|Turgul", "Vizontele|Yılmaz Erdoğan", "Kış Uykusu|Nuri Bilge Ceylan|Ceylan", "Babam ve Oğlum|Çağan Irmak|Irmak",
    "G.O.R.A.|Ömer Faruk Sorak|Sorak", "Hababam Sınıfı|Ertem Eğilmez|Eğilmez", "Selvi Boylum Al Yazmalım|Atıf Yılmaz", "Organize İşler|Yılmaz Erdoğan",
  ] },
  { key: "tv", category: "Dizi/Film", subtopic: "Dizi ve film", difficulty: 1, ask: (a) => a, rows: [
    "Friends dizisinde arkadaşların buluştuğu kafenin adı nedir?|Central Perk", "Breaking Bad dizisinin başkarakteri Walter White'ın mesleği nedir?|Kimya öğretmeni|Öğretmen", "Squid Game hangi ülkenin yapımıdır?|Güney Kore|Kore",
    "Muhteşem Yüzyıl'da Kanuni Sultan Süleyman'ı canlandıran oyuncu kimdir?|Halit Ergenç|Ergenç", "Ezel dizisinde başrolü kim oynamıştır?|Kenan İmirzalıoğlu|İmirzalıoğlu", "Behzat Ç. dizisinde Behzat karakterini kim canlandırır?|Erdal Beşikçioğlu|Beşikçioğlu",
    "Kurtlar Vadisi'nde Polat Alemdar'ı kim canlandırmıştır?|Necati Şaşmaz|Şaşmaz", "Aslan Kral'ın başkahramanı kimdir?|Simba", "Toy Story'de kovboy oyuncağın adı nedir?|Woody", "Frozen'da iki kız kardeşin adları nelerdir? (Elsa ve ...)|Anna",
    "Shrek'in yanındaki konuşkan arkadaşı hangi hayvandır?|Eşek", "Simpsonlar'da Homer'ın eşinin adı nedir?|Marge", "Hogwarts'ta kaç ev vardır?|4|dört", "Yüzüklerin Efendisi'nde yüzüğü taşıyan hobbit kimdir?|Frodo",
    "Oscar ödülü hangi sektörün ödülüdür?|Sinema", "Cannes Film Festivali'nin en büyük ödülü nedir?|Altın Palmiye", "İstanbul'da geçen ünlü Türk komedisi Recep İvedik'i kim canlandırır?|Şahan Gökbakar|Gökbakar",
    "Game of Thrones'ta Winterfell hangi hanedanın yurdudur?|Stark", "Batman'in gerçek adı nedir?|Bruce Wayne", "Örümcek Adam'ın gerçek adı nedir?|Peter Parker", "Pamuk Prenses'in yanında yaşayan cücelerin sayısı kaçtır?|7|yedi",
  ] },
  { key: "song", category: "Müzik", subtopic: "Şarkılar", difficulty: 2, ask: (a) => `“${a}” şarkısıyla özdeşleşen sanatçı veya grup kimdir?`, rows: [
    "Bohemian Rhapsody|Queen", "Thriller|Michael Jackson", "Imagine|John Lennon|Lennon", "Hotel California|Eagles", "Smells Like Teen Spirit|Nirvana", "Shape of You|Ed Sheeran", "Rolling in the Deep|Adele",
    "Billie Jean|Michael Jackson", "Yesterday|The Beatles|Beatles", "Like a Prayer|Madonna", "Born This Way|Lady Gaga", "Stairway to Heaven|Led Zeppelin", "Gangnam Style|Psy", "Despacito|Luis Fonsi",
    "Hey Jude|The Beatles|Beatles", "Another Brick in the Wall|Pink Floyd", "Şımarık|Tarkan", "Kuzu Kuzu|Tarkan", "Gül Pembe|Barış Manço|Manço", "Dönence|Barış Manço|Manço", "Huzurum Kalmadı|Ferdi Tayfur|Tayfur",
    "Everyway That I Can|Sertab Erener|Erener",   ] },
  { key: "music", category: "Müzik", subtopic: "Müzik bilgisi", difficulty: 1, ask: (a) => a, rows: [
    "Standart bir piyanoda kaç tuş bulunur?|88", "Klasik gitarda kaç tel bulunur?|6|altı", "Kemanın kaç teli vardır?|4|dört", "Kuğu Gölü balesinin bestecisi kimdir?|Çaykovski|Tchaikovsky", "Dört Mevsim eserinin bestecisi kimdir?|Vivaldi|Antonio Vivaldi",
    "Dokuzuncu Senfoni'nin (Neşeye Övgü) bestecisi kimdir?|Beethoven|Ludwig van Beethoven", "Türk halk müziğinin en yaygın telli çalgısı hangisidir?|Bağlama|Saz", "Mevlevi müziğinde kullanılan üflemeli çalgı hangisidir?|Ney",
    "Orkestrayı yöneten kişiye ne denir?|Şef", "Fındıkkıran balesinin bestecisi kimdir?|Çaykovski|Tchaikovsky",
    "Küçük Gece Müziği'nin bestecisi kimdir?|Mozart|Wolfgang Amadeus Mozart", "Eurovision'u 2003'te kazanan ülke hangisidir?|Türkiye", "Ay Işığı Sonatı'nın bestecisi kimdir?|Beethoven",
  ] },
  { key: "game", category: "Oyun", subtopic: "Oyunlar", difficulty: 1, ask: (a) => a, rows: [
    "Minecraft'ı hangi stüdyo geliştirdi?|Mojang", "Mario'nun yaratıcısı olan şirket hangisidir?|Nintendo", "Tetris hangi ülkede yaratıldı?|Rusya|Sovyetler Birliği", "Zelda serisinin kahramanı kimdir?|Link",
    "Sonic'i hangi şirket yarattı?|Sega", "PlayStation'ı hangi şirket üretir?|Sony", "Xbox'ı hangi şirket üretir?|Microsoft", "League of Legends'ın yapımcısı hangi şirkettir?|Riot Games|Riot", "Fortnite'ın yapımcısı hangi şirkettir?|Epic Games|Epic",
    "Satranç tahtasında kaç kare vardır?|64", "Satrançta her oyuncunun kaç taşı vardır?|16", "Tavlada her oyuncunun kaç pulu vardır?|15", "Standart okey setinde kaç taş bulunur?|106", "Zarın karşılıklı yüzlerinin toplamı kaçtır?|7",
    "Rubik küpünün kaç yüzü vardır?|6|altı", "Rubik küpünü kim icat etti? (uyruğu Macar)|Ernő Rubik|Rubik", "Pikachu hangi tür Pokémon'dur?|Elektrik", "Angry Birds hangi ülkenin oyunudur?|Finlandiya", "Grand Theft Auto serisini hangi şirket yayımlar?|Rockstar Games|Rockstar",
    "LEGO hangi ülkede kurulmuştur?|Danimarka", "Pac-Man hangi ülkenin oyunudur?|Japonya", "Süper Mario'da kurtarılan prensesin adı nedir?|Peach|Prenses Peach",
  ] },
  { key: "uni", category: "Üniversite/Kampüs", subtopic: "Üniversiteler", difficulty: 1, ask: (a) => `${a} hangi şehirdedir?`, rows: [
    "Orta Doğu Teknik Üniversitesi|Ankara", "Boğaziçi Üniversitesi|İstanbul", "Bilkent Üniversitesi|Ankara", "Koç Üniversitesi|İstanbul", "Sabancı Üniversitesi|İstanbul",
    "Ege Üniversitesi|İzmir", "Hacettepe Üniversitesi|Ankara", "Anadolu Üniversitesi|Eskişehir", "Atatürk Üniversitesi|Erzurum", "Karadeniz Teknik Üniversitesi|Trabzon", "Dokuz Eylül Üniversitesi|İzmir",
    "Akdeniz Üniversitesi|Antalya", "Selçuk Üniversitesi|Konya", "Gazi Üniversitesi|Ankara", "Marmara Üniversitesi|İstanbul", "Yıldız Teknik Üniversitesi|İstanbul", "Uludağ Üniversitesi|Bursa",
    "Erciyes Üniversitesi|Kayseri", "Pamukkale Üniversitesi|Denizli", "Dicle Üniversitesi|Diyarbakır", "İnönü Üniversitesi|Malatya", "Ondokuz Mayıs Üniversitesi|Samsun",
  ] },
  { key: "campus", category: "Üniversite/Kampüs", subtopic: "Kampüs hayatı", difficulty: 1, ask: (a) => a, rows: [
    "ECTS kısaltması neyi ifade eder?|Avrupa Kredi Transfer Sistemi|Avrupa Kredi Transferi", "YÖK'ün açılımı nedir?|Yükseköğretim Kurulu", "Üniversite sınavlarını düzenleyen kurum hangisidir?|ÖSYM", "Erasmus değişim programı hangi kıtanın programıdır?|Avrupa",
    "GANO neyin kısaltmasıdır?|Genel Akademik Not Ortalaması|Genel Not Ortalaması", "Yurt hizmetleri sunan devlet kurumunun kısa adı nedir?|KYK", "Mezuniyet töreninde takılan kareli şapkanın adı nedir?|Kep", "Bir dönemin ortasındaki sınava genellikle ne denir?|Vize|Ara sınav",
    "Dönem sonu sınavına genellikle ne denir?|Final", "Başarısız dersler için yapılan ek sınava ne denir?|Bütünleme", "Türkiye'de lisans eğitimi normalde kaç yıldır?|4|dört", "Türkiye'de bilimsel araştırmaları destekleyen kamu kurumunun kısa adı nedir?|TÜBİTAK",
  ] },
  { key: "istanbul", category: "Yerel", subtopic: "İstanbul", difficulty: 1, ask: (a) => a, rows: [
    "Kız Kulesi hangi ilçenin açıklarındadır?|Üsküdar", "Galata Kulesi hangi ilçededir?|Beyoğlu", "Ayasofya hangi ilçededir?|Fatih", "Dolmabahçe Sarayı hangi ilçededir?|Beşiktaş", "Rumeli Hisarı'nı hangi padişah yaptırmıştır?|Fatih Sultan Mehmet|Fatih",
    "Anadolu Hisarı'nı hangi padişah yaptırmıştır?|Yıldırım Bayezid|Yıldırım Beyazıt", "Sultanahmet Camii'nin yaygın adı nedir?|Mavi Cami", "Sultanahmet Camii'nin kaç minaresi vardır?|6|altı", "Süleymaniye Camii'nin mimarı kimdir?|Mimar Sinan|Sinan",
    "Galata Köprüsü hangi su yolunun üzerindedir?|Haliç", "İstanbul Boğazı, Karadeniz'i hangi denizle birleştirir?|Marmara Denizi|Marmara", "Marmaray hangi iki yakayı deniz altından bağlar?|Avrupa ve Asya|Avrupa-Asya",
    "Ortaköy Camii hangi köprünün yanındadır?|Boğaziçi Köprüsü|15 Temmuz Şehitler Köprüsü", "Adalar'ın en büyük adası hangisidir?|Büyükada", "Kapalıçarşı hangi ilçededir?|Fatih", "Mısır Çarşısı hangi semttedir?|Eminönü", "İstanbul hangi iki kıtada yer alır?|Avrupa ve Asya|Asya ve Avrupa",
    "Topkapı Sarayı hangi ilçededir?|Fatih", "Çamlıca Kulesi hangi yakadadır?|Anadolu Yakası|Asya Yakası", "Moda semti hangi ilçededir?|Kadıköy", "Taksim Meydanı'ndaki anıtın adı nedir?|Cumhuriyet Anıtı", "Emirgan hangi ilçededir?|Sarıyer",
    "Haliç'in iki yakasını birleştiren Metro köprüsünün bulunduğu semtlerden biri hangisidir? (Unkapanı ile ...)|Azapkapı", "Kadıköy ile Eminönü arasında hangi araç yaygın olarak çalışır?|Vapur",
  ] },
  { key: "place", category: "Yerel", subtopic: "Türkiye gezi", difficulty: 2, ask: (a) => `${a} hangi ilimizdedir?`, rows: [
    "Anıtkabir|Ankara", "Kaleiçi|Antalya", "Kapadokya (Göreme)|Nevşehir", "Pamukkale travertenleri|Denizli", "Nemrut Dağı heykelleri|Adıyaman", "Sümela Manastırı|Trabzon", "Ani Harabeleri|Kars",
    "Truva Antik Kenti|Çanakkale", "Safranbolu evleri|Karabük", "Göbeklitepe|Şanlıurfa", "Zeugma Mozaik Müzesi|Gaziantep", "Ölüdeniz|Muğla", "Salda Gölü|Burdur", "Uludağ|Bursa", "Van Kedisi'yle ünlü şehir|Van",
    "Mevlana Müzesi|Konya", "Efes Antik Kenti|İzmir", "Hasankeyf|Batman", "Kackar Dağları|Rize", "Aspendos Antik Tiyatrosu|Antalya", "Ihlara Vadisi|Aksaray", "Ayder Yaylası|Rize", "Karagöl-Sahara Milli Parkı|Artvin",
  ] },
  { key: "general", category: "Genel Kültür", subtopic: "Genel", difficulty: 1, ask: (a) => a, rows: [
    "Dünyanın en yüksek dağı hangisidir?|Everest", "Dünyanın en kalabalık ülkesi hangisidir?|Hindistan", "Yüzölçümü bakımından dünyanın en büyük ülkesi hangisidir?|Rusya", "En büyük kıta hangisidir?|Asya",
    "Eyfel Kulesi hangi şehirdedir?|Paris", "Özgürlük Heykeli hangi şehirdedir?|New York", "Pisa Kulesi hangi ülkededir?|İtalya", "Kolezyum hangi şehirdedir?|Roma", "Taç Mahal hangi ülkededir?|Hindistan", "Big Ben hangi şehirdedir?|Londra",
    "Machu Picchu hangi ülkededir?|Peru", "Petra Antik Kenti hangi ülkededir?|Ürdün", "Türkiye'de kaç coğrafi bölge vardır?|7|yedi", "Türkiye'nin en yüksek dağı hangisidir?|Ağrı Dağı|Ağrı", "Türkiye'nin en büyük gölü hangisidir?|Van Gölü|Van",
    "Türkiye'nin en uzun nehri hangisidir?|Kızılırmak", "İstiklal Marşı'nın yazarı kimdir?|Mehmet Akif Ersoy|Akif", "Türkiye Cumhuriyeti'nin ikinci cumhurbaşkanı kimdir?|İsmet İnönü|İnönü", "Romen rakamlarında 'X' kaçı gösterir?|10|on",
    "Romen rakamlarında 'L' kaçı gösterir?|50|elli", "Romen rakamlarında 'C' kaçı gösterir?|100|yüz", "Romen rakamlarında 'M' kaçı gösterir?|1000|bin", "Mısır piramitleri hangi şehrin yakınındadır?|Kahire|Giza", "Dünyanın en uzun nehri geleneksel olarak hangisidir?|Nil",
    "Olimpiyat bayrağında kaç halka vardır?|5|beş", "Bir yılda kaç hafta vardır (yaklaşık)?|52", "Türkiye'nin başkenti neresidir?|Ankara",     "Dünyanın en büyük çölü sıcak çöller arasında hangisidir?|Sahra|Büyük Sahra", "Amazon Ormanları en çok hangi ülkede yer alır?|Brezilya", "Nobel Barış Ödülü hangi şehirde verilir?|Oslo", "Dünyanın en derin gölü hangisidir?|Baykal Gölü|Baykal",
    "Karadeniz'in kuzeyinde hangi yarımada bulunur?|Kırım", "Fenerbahçe'nin renkleri nelerdir?|Sarı-lacivert|Sarı lacivert", "Galatasaray'ın renkleri nelerdir?|Sarı-kırmızı|Sarı kırmızı", "Beşiktaş'ın renkleri nelerdir?|Siyah-beyaz|Siyah beyaz", "Trabzonspor'un renkleri nelerdir?|Bordo-mavi|Bordo mavi",
  ] },
];

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
