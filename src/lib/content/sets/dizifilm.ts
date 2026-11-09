import type { FactSet, SingleSet } from "../gen";

// film|yönetmen|yıl|başrol ("-" = soru atlanır)
const FILMS = [
  "Titanic|James Cameron;Cameron|1997|Leonardo DiCaprio;DiCaprio", "Avatar|James Cameron;Cameron|2009|Sam Worthington", "Inception|Christopher Nolan;Nolan|2010|Leonardo DiCaprio;DiCaprio",
  "Interstellar (Yıldızlararası)|Christopher Nolan;Nolan|2014|Matthew McConaughey;McConaughey", "The Dark Knight (Kara Şövalye)|Christopher Nolan;Nolan|2008|Christian Bale;Bale", "Oppenheimer|Christopher Nolan;Nolan|2023|Cillian Murphy;Murphy",
  "Memento|Christopher Nolan;Nolan|2000|Guy Pearce", "Jurassic Park|Steven Spielberg;Spielberg|1993|Sam Neill", "E.T.|Steven Spielberg;Spielberg|1982|-", "Schindler'in Listesi|Steven Spielberg;Spielberg|1993|Liam Neeson;Neeson",
  "Er Ryan'ı Kurtarmak|Steven Spielberg;Spielberg|1998|Tom Hanks;Hanks", "Jaws (Denizin Dişleri)|Steven Spielberg;Spielberg|1975|Roy Scheider", "Indiana Jones: Kutsal Hazine Avcıları|Steven Spielberg;Spielberg|1981|Harrison Ford",
  "Pulp Fiction|Quentin Tarantino;Tarantino|1994|John Travolta;Travolta", "Django Unchained|Quentin Tarantino;Tarantino|2012|Jamie Foxx", "Kill Bill: Volume 1|Quentin Tarantino;Tarantino|2003|Uma Thurman;Thurman",
  "Baba (The Godfather)|Francis Ford Coppola;Coppola|1972|Marlon Brando;Brando", "Kıyamet (Apocalypse Now)|Francis Ford Coppola;Coppola|1979|Martin Sheen", "Parazit|Bong Joon-ho;Bong Joon Ho|2019|Song Kang-ho",
  "Gladyatör|Ridley Scott;Scott|2000|Russell Crowe;Crowe", "Alien|Ridley Scott;Scott|1979|Sigourney Weaver;Weaver", "Blade Runner|Ridley Scott;Scott|1982|Harrison Ford", "Taksi Şoförü|Martin Scorsese;Scorsese|1976|Robert De Niro;De Niro",
  "Kızgın Boğa|Martin Scorsese;Scorsese|1980|Robert De Niro;De Niro", "Sıkı Dostlar (Goodfellas)|Martin Scorsese;Scorsese|1990|Ray Liotta", "Köstebek (The Departed)|Martin Scorsese;Scorsese|2006|Leonardo DiCaprio;DiCaprio",
  "Matrix|Wachowski Kardeşler;Wachowskiler|1999|Keanu Reeves;Reeves", "Forrest Gump|Robert Zemeckis;Zemeckis|1994|Tom Hanks;Hanks", "Geleceğe Dönüş|Robert Zemeckis;Zemeckis|1985|Michael J. Fox",
  "Yüzüklerin Efendisi: Yüzük Kardeşliği|Peter Jackson;Jackson|2001|Elijah Wood", "Star Wars: Yeni Bir Umut|George Lucas;Lucas|1977|Mark Hamill", "Hayat Güzeldir|Roberto Benigni;Benigni|1997|Roberto Benigni;Benigni",
  "Cinema Paradiso|Giuseppe Tornatore;Tornatore|1988|-", "Amélie|Jean-Pierre Jeunet;Jeunet|2001|Audrey Tautou", "Esaretin Bedeli|Frank Darabont;Darabont|1994|Tim Robbins", "Yeşil Yol|Frank Darabont;Darabont|1999|Tom Hanks;Hanks",
  "Fight Club (Dövüş Kulübü)|David Fincher;Fincher|1999|Brad Pitt;Pitt", "Se7en (Yedi)|David Fincher;Fincher|1995|Brad Pitt;Pitt", "Sosyal Ağ|David Fincher;Fincher|2010|Jesse Eisenberg", "Gone Girl|David Fincher;Fincher|2014|Ben Affleck",
  "Truman Show|Peter Weir;Weir|1998|Jim Carrey", "Maske (The Mask)|Chuck Russell;Russell|1994|Jim Carrey", "Aslan Kral|Roger Allers ve Rob Minkoff;Roger Allers;Rob Minkoff|1994|-", "Toy Story|John Lasseter;Lasseter|1995|-",
  "Shrek|Andrew Adamson ve Vicky Jenson;Andrew Adamson|2001|-", "Karlar Ülkesi (Frozen)|Chris Buck ve Jennifer Lee;Chris Buck;Jennifer Lee|2013|-", "Yukarı Bak (Up)|Pete Docter;Docter|2009|-", "Joker|Todd Phillips;Phillips|2019|Joaquin Phoenix;Phoenix",
  "Barbie|Greta Gerwig;Gerwig|2023|Margot Robbie;Robbie", "La La Land|Damien Chazelle;Chazelle|2016|Ryan Gosling;Gosling", "Whiplash|Damien Chazelle;Chazelle|2014|Miles Teller", "Gravity (Yerçekimi)|Alfonso Cuarón;Cuarón;Cuaron|2013|Sandra Bullock;Bullock",
  "Birdman|Alejandro González Iñárritu;Iñárritu;Inarritu|2014|Michael Keaton;Keaton", "Diriliş (The Revenant)|Alejandro González Iñárritu;Iñárritu;Inarritu|2015|Leonardo DiCaprio;DiCaprio", "Mad Max: Fury Road|George Miller;Miller|2015|Tom Hardy",
  "Rocky|John G. Avildsen;Avildsen|1976|Sylvester Stallone;Stallone", "Scarface|Brian De Palma;De Palma|1983|Al Pacino;Pacino", "Casablanca|Michael Curtiz;Curtiz|1942|Humphrey Bogart;Bogart", "Citizen Kane|Orson Welles;Welles|1941|Orson Welles;Welles",
  "Psycho (Sapık)|Alfred Hitchcock;Hitchcock|1960|Anthony Perkins", "Vertigo (Başdönmesi)|Alfred Hitchcock;Hitchcock|1958|James Stewart", "Parıltı (The Shining)|Stanley Kubrick;Kubrick|1980|Jack Nicholson;Nicholson",
  "2001: Bir Uzay Destanı|Stanley Kubrick;Kubrick|1968|-", "Otomatik Portakal|Stanley Kubrick;Kubrick|1971|Malcolm McDowell", "Braveheart (Cesur Yürek)|Mel Gibson;Gibson|1995|Mel Gibson;Gibson",
  "Harry Potter ve Felsefe Taşı|Chris Columbus;Columbus|2001|Daniel Radcliffe;Radcliffe", "Karayip Korsanları: Siyah İnci'nin Laneti|Gore Verbinski;Verbinski|2003|Johnny Depp;Depp", "Black Panther (Kara Panter)|Ryan Coogler;Coogler|2018|Chadwick Boseman;Boseman",
  "Avengers: Endgame|Anthony ve Joe Russo;Russo Kardeşler|2019|Robert Downey Jr.;Downey", "Iron Man|Jon Favreau;Favreau|2008|Robert Downey Jr.;Downey", "Spider-Man (2002)|Sam Raimi;Raimi|2002|Tobey Maguire;Maguire",
  "Batman Begins|Christopher Nolan;Nolan|2005|Christian Bale;Bale", "Top Gun: Maverick|Joseph Kosinski;Kosinski|2022|Tom Cruise;Cruise", "Dune|Denis Villeneuve;Villeneuve|2021|Timothée Chalamet;Chalamet",
  "Blade Runner 2049|Denis Villeneuve;Villeneuve|2017|Ryan Gosling;Gosling", "Arrival (Varış)|Denis Villeneuve;Villeneuve|2016|Amy Adams", "Eşkıya|Yavuz Turgul;Turgul|1996|Şener Şen;Şen", "Vizontele|Yılmaz Erdoğan ve Ömer Faruk Sorak;Yılmaz Erdoğan|2001|Yılmaz Erdoğan",
  "Babam ve Oğlum|Çağan Irmak;Irmak|2005|Fikret Kuşkan", "Kış Uykusu|Nuri Bilge Ceylan;Ceylan|2014|Haluk Bilginer;Bilginer", "Uzak|Nuri Bilge Ceylan;Ceylan|2002|Muzaffer Özdemir", "Bir Zamanlar Anadolu'da|Nuri Bilge Ceylan;Ceylan|2011|Muhammet Uzuner",
  "Ahlat Ağacı|Nuri Bilge Ceylan;Ceylan|2018|Doğu Demirkol", "G.O.R.A.|Ömer Faruk Sorak;Sorak|2004|Cem Yılmaz;Yılmaz", "Hababam Sınıfı|Ertem Eğilmez;Eğilmez|1975|Kemal Sunal;Sunal", "Selvi Boylum Al Yazmalım|Atıf Yılmaz;Yılmaz|1977|Kadir İnanır;İnanır",
  "Organize İşler|Yılmaz Erdoğan;Erdoğan|2005|Yılmaz Erdoğan;Erdoğan", "Recep İvedik|Togan Gökbakar;Gökbakar|2008|Şahan Gökbakar;Gökbakar", "Yol|Şerif Gören;Gören|1982|Tarık Akan;Akan", "Kelebeğin Rüyası|Yılmaz Erdoğan;Erdoğan|2013|Mert Fırat",
];

// dizi|ilk yayın yılı|ülke
const SERIES = [
  "Friends|1994|ABD", "Seinfeld|1989|ABD", "The Simpsons (Simpsonlar)|1989|ABD", "Breaking Bad|2008|ABD", "Game of Thrones|2011|ABD", "Lost|2004|ABD", "Stranger Things|2016|ABD", "The Crown|2016|Birleşik Krallık", "Squid Game|2021|Güney Kore",
  "Dark|2017|Almanya", "La Casa de Papel|2017|İspanya", "Peaky Blinders|2013|Birleşik Krallık", "Sherlock (BBC)|2010|Birleşik Krallık", "House M.D. (Dr. House)|2004|ABD", "Prison Break|2005|ABD", "The Sopranos|1999|ABD", "Dexter|2006|ABD",
  "The Big Bang Theory|2007|ABD", "How I Met Your Mother|2005|ABD", "Black Mirror|2011|Birleşik Krallık", "The Witcher|2019|ABD", "Vikings|2013|Kanada;İrlanda", "Kurtlar Vadisi|2003|Türkiye", "Ezel|2009|Türkiye", "Behzat Ç.|2010|Türkiye",
  "Muhteşem Yüzyıl|2011|Türkiye", "Avrupa Yakası|2004|Türkiye", "Diriliş: Ertuğrul|2014|Türkiye", "Çocuklar Duymasın|2002|Türkiye", "The Office (ABD)|2005|ABD", "Twin Peaks|1990|ABD", "Narcos|2015|ABD",
];
// karakter|oyuncu
const CHARS = [
  "Jack Sparrow|Johnny Depp;Depp", "Hannibal Lecter|Anthony Hopkins;Hopkins", "Joker (2019 filmi)|Joaquin Phoenix;Phoenix", "Vito Corleone|Marlon Brando;Brando", "Forrest Gump|Tom Hanks;Hanks", "Gandalf|Ian McKellen;McKellen", "Harry Potter|Daniel Radcliffe;Radcliffe",
  "Hermione Granger|Emma Watson;Watson", "Tony Stark (Iron Man)|Robert Downey Jr.;Downey", "Neo (Matrix)|Keanu Reeves;Reeves", "Rocky Balboa|Sylvester Stallone;Stallone", "Indiana Jones|Harrison Ford", "Luke Skywalker|Mark Hamill;Hamill",
  "Ellen Ripley|Sigourney Weaver;Weaver", "Rose (Titanic)|Kate Winslet;Winslet", "Jack Dawson (Titanic)|Leonardo DiCaprio;DiCaprio", "Walter White (Breaking Bad)|Bryan Cranston;Cranston", "Tyrion Lannister|Peter Dinklage;Dinklage",
  "Daenerys Targaryen|Emilia Clarke;Clarke", "Jon Snow|Kit Harington;Harington", "Sheldon Cooper|Jim Parsons;Parsons", "Ross Geller|David Schwimmer;Schwimmer", "Rachel Green|Jennifer Aniston;Aniston", "Chandler Bing|Matthew Perry;Perry",
  "Monica Geller|Courteney Cox;Cox", "Joey Tribbiani|Matt LeBlanc;LeBlanc", "Phoebe Buffay|Lisa Kudrow;Kudrow", "Dr. Gregory House|Hugh Laurie;Laurie", "Sherlock Holmes (BBC dizisi)|Benedict Cumberbatch;Cumberbatch",
  "Eleven (Stranger Things)|Millie Bobby Brown", "Wednesday Addams (2022 dizisi)|Jenna Ortega;Ortega", "Katniss Everdeen|Jennifer Lawrence;Lawrence", "Batman (Christopher Nolan üçlemesi)|Christian Bale;Bale",
  "Joker (Kara Şövalye)|Heath Ledger;Ledger", "Thanos|Josh Brolin;Brolin", "Captain America|Chris Evans;Evans", "Thor (MCU)|Chris Hemsworth;Hemsworth", "Hulk (MCU)|Mark Ruffalo;Ruffalo", "Black Widow|Scarlett Johansson;Johansson",
  "Wolverine|Hugh Jackman;Jackman", "Barbie (2023 filmi)|Margot Robbie;Robbie", "Ken (2023 filmi)|Ryan Gosling;Gosling", "Maximus (Gladyatör)|Russell Crowe;Crowe", "Polat Alemdar|Necati Şaşmaz;Şaşmaz", "Behzat Ç.|Erdal Beşikçioğlu;Beşikçioğlu",
  "Ezel (dizi karakteri)|Kenan İmirzalıoğlu;İmirzalıoğlu", "Kanuni Sultan Süleyman (Muhteşem Yüzyıl)|Halit Ergenç;Ergenç", "Hürrem Sultan (Muhteşem Yüzyıl, ilk sezonlar)|Meryem Uzerli;Uzerli", "Ertuğrul Bey (Diriliş: Ertuğrul)|Engin Altan Düzyatan;Düzyatan",
  "Recep İvedik|Şahan Gökbakar;Gökbakar", "Tosun Paşa|Kemal Sunal;Sunal", "Mahmut Hoca (Hababam Sınıfı)|Münir Özkul;Özkul", "Baran (Eşkıya)|Şener Şen;Şen", "Pablo Escobar (Narcos)|Wagner Moura;Moura", "Tommy Shelby|Cillian Murphy;Murphy",
  "Michael Corleone|Al Pacino;Pacino", "Tony Montana|Al Pacino;Pacino", "Gollum|Andy Serkis;Serkis", "Jack Torrance (Parıltı)|Jack Nicholson;Nicholson", "Darth Vader (ses)|James Earl Jones;Jones", "Ethan Hunt|Tom Cruise;Cruise", "James Bond (Skyfall)|Daniel Craig;Craig",
];
// yıl|Oscar En İyi Film (yapım yılı)
const OSCAR = ["1993|Schindler'in Listesi", "1994|Forrest Gump", "1995|Braveheart (Cesur Yürek)", "1996|The English Patient (İngiliz Hasta)", "1997|Titanic", "1998|Shakespeare in Love (Aşık Shakespeare)", "1999|American Beauty (Amerikan Güzeli)", "2000|Gladyatör",
  "2001|A Beautiful Mind (Akıl Oyunları)", "2002|Chicago", "2003|Yüzüklerin Efendisi: Kralın Dönüşü", "2004|Million Dollar Baby", "2005|Crash", "2006|The Departed (Köstebek)", "2007|No Country for Old Men (Çocuklara Yer Yok)", "2008|Slumdog Millionaire (Milyoner)",
  "2009|The Hurt Locker (Savaş Alanı)", "2010|The King's Speech (Kral'ın Konuşması)", "2011|The Artist", "2012|Argo", "2013|12 Years a Slave (12 Yıllık Esaret)", "2014|Birdman", "2015|Spotlight", "2016|Moonlight", "2017|The Shape of Water (Suyun Sesi)",
  "2018|Green Book", "2019|Parazit", "2020|Nomadland", "2021|CODA", "2022|Everything Everywhere All at Once", "2023|Oppenheimer"];
const PALME = ["2009|The White Ribbon (Beyaz Kurdele)", "2011|The Tree of Life (Hayat Ağacı)", "2013|Mavi En Sıcak Renktir", "2014|Kış Uykusu", "2016|I, Daniel Blake (Ben, Daniel Blake)", "2017|The Square (Kare)", "2018|Shoplifters (Hırsız Aile)", "2019|Parazit",
  "2021|Titane", "2022|Triangle of Sadness (Hüzün Üçgeni)", "2023|Anatomy of a Fall (Bir Düşüşün Anatomisi)", "1994|Pulp Fiction", "2002|The Pianist (Piyanist)", "2004|Fahrenheit 9/11"];

export const DIZIFILM: FactSet[] = [
  { id: "film", cat: "Dizi/Film", sub: "Filmler", diff: 2, rows: FILMS, asks: [
    { t: "“{0}” filminin yönetmeni kimdir?", a: 1, by: [0], choice: true },
    { t: "“{0}” filmi hangi yıl vizyona girmiştir?", a: 2, by: [0], num: true },
    { t: "“{0}” filminde başrolü kim oynamıştır?", a: 3, by: [0], choice: true },
  ] },
  { id: "dizi", cat: "Dizi/Film", sub: "Diziler", diff: 2, rows: SERIES, asks: [
    { t: "“{0}” dizisi ilk kez hangi yıl yayınlanmıştır?", a: 1, by: [0], num: true },
    { t: "“{0}” dizisi hangi ülkenin yapımıdır?", a: 2, by: [0], choice: true },
  ] },
  { id: "karakter", cat: "Dizi/Film", sub: "Karakterler", diff: 1, rows: CHARS, asks: [{ t: "{0} karakterini canlandıran oyuncu kimdir?", a: 1, by: [0], choice: true }] },
  { id: "oscar", cat: "Dizi/Film", sub: "Ödüller", diff: 3, rows: OSCAR, asks: [{ t: "{0} yapımı filmlerden hangisi Oscar'da En İyi Film ödülünü kazanmıştır?", a: 1, by: [0], choice: true }] },
  { id: "palme", cat: "Dizi/Film", sub: "Ödüller", diff: 3, rows: PALME, asks: [{ t: "{0} Cannes Film Festivali'nde Altın Palmiye'yi hangi film kazanmıştır?", a: 1, by: [0], choice: true }] },
];

export const DIZIFILM_SINGLES: SingleSet[] = [{
  id: "df1", cat: "Dizi/Film", sub: "Genel", diff: 1, rows: [
    "Friends dizisinde arkadaşların buluştuğu kafenin adı nedir?|Central Perk||Monk's Café;Cheers;Paddy's Pub",
    "Breaking Bad dizisinin başkarakteri Walter White'ın mesleği nedir?|Kimya öğretmeni|Öğretmen;Lise kimya öğretmeni|Doktor;Avukat;Polis",
    "Squid Game hangi ülkenin yapımıdır?|Güney Kore|Kore|Japonya;Çin;Tayland",
    "Game of Thrones'ta Winterfell hangi hanedanın yurdudur?|Stark||Lannister;Targaryen;Baratheon",
    "Aslan Kral'ın başkahramanı kimdir?|Simba||Mufasa;Scar;Timon",
    "Toy Story'de kovboy oyuncağın adı nedir?|Woody||Buzz;Rex;Slinky",
    "Toy Story'de uzay polisi oyuncağın adı nedir?|Buzz Lightyear|Buzz|Woody;Rex;Hamm",
    "Frozen'da iki kız kardeşin adları nelerdir?|Elsa ve Anna|Anna ve Elsa|Ariel ve Belle;Pocahontas ve Mulan;Rapunzel ve Jasmine",
    "Shrek'in yanında bulunan konuşkan arkadaşı hangi hayvandır?|Eşek||Kedi;At;Köpek",
    "Simpsonlar'da Homer'ın eşinin adı nedir?|Marge||Lisa;Maggie;Patty",
    "Simpsonlar hangi kasabada geçer?|Springfield||Shelbyville;Quahog;South Park",
    "Hogwarts Cadılık ve Büyücülük Okulu'nda kaç ev vardır?|4|dört|3;5;6",
    "Hogwarts evlerinden hangisi sembol olarak aslanı kullanır?|Gryffindor||Slytherin;Hufflepuff;Ravenclaw",
    "Yüzüklerin Efendisi'nde yüzüğü Mordor'a taşıyan hobbit kimdir?|Frodo|Frodo Baggins|Bilbo;Samwise;Pippin",
    "Oscar ödülü hangi sektörün ödülüdür?|Sinema|Film|Müzik;Tiyatro;Televizyon",
    "Cannes Film Festivali'nin en büyük ödülü nedir?|Altın Palmiye|Palme d'Or|Altın Ayı;Altın Aslan;Altın Küre",
    "Berlin Film Festivali'nin en büyük ödülü nedir?|Altın Ayı||Altın Palmiye;Altın Aslan;Altın Koza",
    "Venedik Film Festivali'nin en büyük ödülü nedir?|Altın Aslan||Altın Ayı;Altın Palmiye;Altın Portakal",
    "Antalya Altın Portakal Film Festivali hangi ilde düzenlenir?|Antalya||Adana;İzmir;İstanbul",
    "Adana Altın Koza Film Festivali hangi ilde düzenlenir?|Adana||Mersin;Antalya;Ankara",
    "Batman'in gerçek adı nedir?|Bruce Wayne||Clark Kent;Peter Parker;Tony Stark",
    "Superman'in gerçek adı nedir?|Clark Kent|Kal-El|Bruce Wayne;Barry Allen;Steve Rogers",
    "Örümcek Adam'ın gerçek adı nedir?|Peter Parker||Miles Morales;Bruce Banner;Matt Murdock",
    "Pamuk Prenses'in yanında yaşayan cücelerin sayısı kaçtır?|7|yedi|5;6;9",
    "Disney'in ilk uzun metrajlı animasyon filmi hangisidir?|Pamuk Prenses ve Yedi Cüceler|Pamuk Prenses|Pinokyo;Bambi;Uyuyan Güzel",
    "Pinokyo'nun burnu ne zaman uzar?|Yalan söylediğinde|Yalan söyleyince|Utandığında;Korktuğunda;Üzüldüğünde",
    "Alice Harikalar Diyarında'da Alice hangi hayvanı takip ederek tavşan deliğine düşer?|Beyaz tavşan|Tavşan|Kedi;Kuş;Tilki",
    "Kayıp Balık Nemo'da Nemo hangi balık türüdür?|Palyaço balığı||Köpekbalığı;Mavi balina;Denizatı",
    "Matrix'te Neo'nun seçmesi gereken iki hap hangi renklerdedir?|Mavi ve kırmızı|Kırmızı ve mavi|Yeşil ve sarı;Siyah ve beyaz;Mor ve turuncu",
    "Star Wars'ta Luke Skywalker'ın babası kimdir?|Darth Vader|Anakin Skywalker|Obi-Wan Kenobi;Han Solo;Yoda",
    "Titanic filmindeki ünlü 'Kalbimin Okyanusu' adlı mücevher ne şekildedir?|Mavi elmas|Elmas|Yakut;Zümrüt;İnci",
    "Kurtlar Vadisi dizisinin başkarakteri kimdir?|Polat Alemdar|Polat|Memati Baş;Abdülhey Çoban;İskender Büyük",
    "Hababam Sınıfı'nda Mahmut Hoca'yı kim canlandırmıştır?|Münir Özkul||Kemal Sunal;Tarık Akan;Adile Naşit",
    "Yeşilçam'ın 'Sultan' lakaplı oyuncusu kimdir?|Türkan Şoray||Filiz Akın;Hülya Koçyiğit;Fatma Girik;Cüneyt Arkın",
    "Yılmaz Erdoğan'ın yazıp oynadığı 'Vizontele' filminde ilk televizyonun getirildiği şehir hangisidir?|Hakkâri|Hakkari|Van;Erzurum;Kars",
    "Nuri Bilge Ceylan'ın Altın Palmiye kazanan filmi hangisidir?|Kış Uykusu||Uzak;Üç Maymun;Bir Zamanlar Anadolu'da",
    "Netflix'in kuruluşunda başlangıçta ne hizmeti verilmekteydi?|DVD kiralama|Posta ile DVD kiralama|Kitap satışı;Oyun satışı;Müzik satışı",
    "Harry Potter serisinin yazarı kimdir?|J. K. Rowling|Rowling|Stephen King;J. R. R. Tolkien;Roald Dahl",
    "Marvel Sinematik Evreni'nin ilk filmi hangisidir?|Iron Man|Iron Man (2008)|Thor;Hulk;Captain America",
    "Akira Kurosawa hangi ülkenin yönetmenidir?|Japonya||Çin;Güney Kore;Hindistan",
    "Hayao Miyazaki'nin kurduğu animasyon stüdyosu hangisidir?|Studio Ghibli|Ghibli|Pixar;Toei;DreamWorks",
    "Pixar stüdyosunun ilk uzun metrajlı filmi hangisidir?|Toy Story||Karıncalar;Canavarlar Şirketi;Arabalar",
    "Charlie Chaplin'in ünlü karakteri nedir?|Şarlo|Charlot;The Tramp|Kızıl Bıyık;Kral Lear;Zorro",
  ],
}];
