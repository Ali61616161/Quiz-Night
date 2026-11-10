import type { FactSet, SingleSet } from "../gen";

// eser|yazar
const BOOKS = [
  "Suç ve Ceza|Fyodor Dostoyevski;Dostoyevski", "Karamazov Kardeşler|Fyodor Dostoyevski;Dostoyevski", "Budala|Fyodor Dostoyevski;Dostoyevski", "Savaş ve Barış|Lev Tolstoy;Tolstoy", "Anna Karenina|Lev Tolstoy;Tolstoy",
  "Ölü Canlar|Nikolay Gogol;Gogol", "Usta ile Margarita|Mihail Bulgakov;Bulgakov", "Doktor Jivago|Boris Pasternak;Pasternak", "Vişne Bahçesi|Anton Çehov;Çehov", "Martı (oyun)|Anton Çehov;Çehov",
  "Sefiller|Victor Hugo;Hugo", "Notre Dame'ın Kamburu|Victor Hugo;Hugo", "Monte Kristo Kontu|Alexandre Dumas;Dumas", "Üç Silahşörler|Alexandre Dumas;Dumas", "Madam Bovary|Gustave Flaubert;Flaubert", "Kırmızı ve Siyah|Stendhal",
  "Germinal|Émile Zola;Zola", "Yabancı|Albert Camus;Camus", "Veba|Albert Camus;Camus", "Bulantı|Jean-Paul Sartre;Sartre", "Küçük Prens|Antoine de Saint-Exupéry;Saint-Exupéry", "Kayıp Zamanın İzinde|Marcel Proust;Proust",
  "Hamlet|William Shakespeare;Shakespeare", "Macbeth|William Shakespeare;Shakespeare", "Othello|William Shakespeare;Shakespeare", "Romeo ve Juliet|William Shakespeare;Shakespeare", "Kral Lear|William Shakespeare;Shakespeare",
  "Gurur ve Önyargı|Jane Austen;Austen", "Jane Eyre|Charlotte Brontë;Brontë", "Uğultulu Tepeler|Emily Brontë;Brontë", "Oliver Twist|Charles Dickens;Dickens", "Büyük Umutlar|Charles Dickens;Dickens", "Robinson Crusoe|Daniel Defoe;Defoe",
  "Gulliver'in Gezileri|Jonathan Swift;Swift", "Dorian Gray'in Portresi|Oscar Wilde;Wilde", "Dr. Jekyll ve Mr. Hyde|Robert Louis Stevenson;Stevenson", "Define Adası|Robert Louis Stevenson;Stevenson", "Dracula|Bram Stoker;Stoker", "Frankenstein|Mary Shelley;Shelley",
  "Sherlock Holmes (Kızıl Dosya)|Arthur Conan Doyle;Conan Doyle;Doyle", "1984|George Orwell;Orwell", "Hayvan Çiftliği|George Orwell;Orwell", "Cesur Yeni Dünya|Aldous Huxley;Huxley", "Harry Potter ve Felsefe Taşı|J. K. Rowling;Rowling",
  "Yüzüklerin Efendisi|J. R. R. Tolkien;Tolkien", "Hobbit|J. R. R. Tolkien;Tolkien", "Narnia Günlükleri|C. S. Lewis;Lewis", "Alice Harikalar Diyarında|Lewis Carroll;Carroll", "Peter Pan|J. M. Barrie;Barrie",
  "Muhteşem Gatsby|F. Scott Fitzgerald;Fitzgerald", "Fareler ve İnsanlar|John Steinbeck;Steinbeck", "Gazap Üzümleri|John Steinbeck;Steinbeck", "Yaşlı Adam ve Deniz|Ernest Hemingway;Hemingway", "Silahlara Veda|Ernest Hemingway;Hemingway",
  "Çavdar Tarlasında Çocuklar|J. D. Salinger;Salinger", "Moby Dick|Herman Melville;Melville", "Tom Sawyer'in Maceraları|Mark Twain;Twain", "Huckleberry Finn'in Maceraları|Mark Twain;Twain", "Bülbülü Öldürmek|Harper Lee;Lee",
  "Beyaz Diş|Jack London;London", "Vahşetin Çağrısı|Jack London;London", "Martin Eden|Jack London;London", "Faust|Johann Wolfgang von Goethe;Goethe", "Genç Werther'in Acıları|Johann Wolfgang von Goethe;Goethe",
  "Dönüşüm|Franz Kafka;Kafka", "Dava|Franz Kafka;Kafka", "Şato|Franz Kafka;Kafka", "Siddhartha|Hermann Hesse;Hesse", "Bozkırkurdu|Hermann Hesse;Hesse", "Teneke Trampet|Günter Grass;Grass", "Parfüm|Patrick Süskind;Süskind",
  "Don Kişot|Miguel de Cervantes;Cervantes", "Yüzyıllık Yalnızlık|Gabriel García Márquez;Márquez;Marquez", "Kolera Günlerinde Aşk|Gabriel García Márquez;Márquez;Marquez", "Simyacı|Paulo Coelho;Coelho", "İlyada|Homeros", "Odysseia|Homeros",
  "İlahi Komedya|Dante Alighieri;Dante", "Decameron|Giovanni Boccaccio;Boccaccio", "Şahname|Firdevsi", "Mesnevi|Mevlânâ Celâleddîn-i Rûmî;Mevlana", "Kutadgu Bilig|Yusuf Has Hacib;Balasagunlu Yusuf", "Divanü Lügati't-Türk|Kaşgarlı Mahmud;Kaşgarlı",
  "Seyahatname|Evliya Çelebi", "Leyla ile Mecnun|Fuzuli", "Hüsn ü Aşk|Şeyh Galip", "Safahat|Mehmet Akif Ersoy;Akif", "Nutuk|Mustafa Kemal Atatürk;Atatürk", "Çalıkuşu|Reşat Nuri Güntekin;Güntekin", "İnce Memed|Yaşar Kemal",
  "Tutunamayanlar|Oğuz Atay", "Huzur|Ahmet Hamdi Tanpınar;Tanpınar", "Saatleri Ayarlama Enstitüsü|Ahmet Hamdi Tanpınar;Tanpınar", "Kürk Mantolu Madonna|Sabahattin Ali", "Kuyucaklı Yusuf|Sabahattin Ali", "İçimizdeki Şeytan|Sabahattin Ali",
  "Benim Adım Kırmızı|Orhan Pamuk;Pamuk", "Kar|Orhan Pamuk;Pamuk", "Masumiyet Müzesi|Orhan Pamuk;Pamuk", "Cevdet Bey ve Oğulları|Orhan Pamuk;Pamuk", "Aşk-ı Memnu|Halit Ziya Uşaklıgil;Uşaklıgil", "Mai ve Siyah|Halit Ziya Uşaklıgil;Uşaklıgil",
  "Sinekli Bakkal|Halide Edib Adıvar;Adıvar", "Yaban|Yakup Kadri Karaosmanoğlu;Karaosmanoğlu", "Kiralık Konak|Yakup Kadri Karaosmanoğlu;Karaosmanoğlu", "Dokuzuncu Hariciye Koğuşu|Peyami Safa", "Fatih-Harbiye|Peyami Safa",
  "Araba Sevdası|Recaizade Mahmud Ekrem;Recaizade", "Aylak Adam|Yusuf Atılgan", "Anayurt Oteli|Yusuf Atılgan", "Devlet Ana|Kemal Tahir", "Bereketli Topraklar Üzerinde|Orhan Kemal", "Yılanların Öcü|Fakir Baykurt", "Sevgili Arsız Ölüm|Latife Tekin",
  "Zübük|Aziz Nesin", "Sarnıç|Sait Faik Abasıyanık;Sait Faik", "Memleketimden İnsan Manzaraları|Nazım Hikmet", "Garip (şiir kitabı)|Orhan Veli Kanık;Orhan Veli", "Üvercinka|Cemal Süreya", "Çile|Necip Fazıl Kısakürek;Necip Fazıl",
  "Kendi Gök Kubbemiz|Yahya Kemal Beyatlı;Yahya Kemal", "Piyale|Ahmet Haşim", "Rübab-ı Şikeste|Tevfik Fikret", "Vatan yahut Silistre|Namık Kemal", "Şair Evlenmesi|İbrahim Şinasi;Şinasi", "Hasretinden Prangalar Eskittim|Ahmed Arif",
  "Ağır Roman|Metin Kaçan", "Mutluluk|Zülfü Livaneli;Livaneli", "Ölmeye Yatmak|Adalet Ağaoğlu;Ağaoğlu", "Baba ve Piç|Elif Şafak;Şafak", "Patasana|Ahmet Ümit", "Kuyruklu Yıldız Altında Bir Izdivaç|Hüseyin Rahmi Gürpınar;Gürpınar",
];
// yıl|ödül sahibi (Nobel Edebiyat)
const NOBEL = ["1990|Octavio Paz;Paz", "1991|Nadine Gordimer;Gordimer", "1992|Derek Walcott;Walcott", "1993|Toni Morrison;Morrison", "1994|Kenzaburō Ōe;Kenzaburo Oe;Oe", "1995|Seamus Heaney;Heaney", "1996|Wisława Szymborska;Szymborska",
  "1997|Dario Fo", "1998|José Saramago;Saramago", "1999|Günter Grass;Grass", "2000|Gao Xingjian", "2001|V. S. Naipaul;Naipaul", "2002|Imre Kertész;Kertesz", "2003|J. M. Coetzee;Coetzee", "2004|Elfriede Jelinek;Jelinek", "2005|Harold Pinter;Pinter",
  "2006|Orhan Pamuk;Pamuk", "2007|Doris Lessing;Lessing", "2008|J. M. G. Le Clézio;Le Clezio", "2009|Herta Müller;Muller", "2010|Mario Vargas Llosa;Vargas Llosa", "2011|Tomas Tranströmer;Transtromer", "2012|Mo Yan", "2013|Alice Munro;Munro",
  "2014|Patrick Modiano;Modiano", "2015|Svetlana Aleksiyeviç;Aleksievich;Alexievich", "2016|Bob Dylan;Dylan", "2017|Kazuo Ishiguro;Ishiguro", "2018|Olga Tokarczuk;Tokarczuk", "2019|Peter Handke;Handke", "2020|Louise Glück;Gluck", "2021|Abdulrazak Gurnah;Gurnah",
  "2022|Annie Ernaux;Ernaux", "2023|Jon Fosse;Fosse", "2024|Han Kang", "2025|László Krasznahorkai;Krasznahorkai"];
// karakter|eser
const CHARACTERS = ["Raskolnikov|Suç ve Ceza", "Anna Karenina (kahramanı)|Anna Karenina", "Heathcliff|Uğultulu Tepeler", "Jay Gatsby|Muhteşem Gatsby", "Winston Smith|1984", "Sancho Panza|Don Kişot", "Quasimodo|Notre Dame'ın Kamburu", "Jean Valjean|Sefiller",
  "Atticus Finch|Bülbülü Öldürmek", "Holden Caulfield|Çavdar Tarlasında Çocuklar", "Gregor Samsa|Dönüşüm", "Bilbo Baggins|Hobbit", "Elizabeth Bennet|Gurur ve Önyargı", "Robinson Crusoe (kahramanı)|Robinson Crusoe", "Ahab Kaptan|Moby Dick", "Pip|Büyük Umutlar",
  "Dr. Watson|Sherlock Holmes", "Hester Prynne|Kızıl Harf", "Madam Bovary (Emma)|Madam Bovary", "Oliver|Oliver Twist", "Tom Sawyer|Tom Sawyer'in Maceraları", "Santiago (yaşlı balıkçı)|Yaşlı Adam ve Deniz", "Dorian Gray|Dorian Gray'in Portresi", "Hamlet (Danimarka prensi)|Hamlet",
  "Prens Mışkin|Budala", "Pierre Bezuhov|Savaş ve Barış"];

export const EDEBIYAT: FactSet[] = [
  { id: "kitap", cat: "Edebiyat", sub: "Eserler ve yazarlar", diff: 2, rows: BOOKS, asks: [{ t: "“{0}” adlı eserin yazarı kimdir?", a: 1, by: [0], choice: true }] },
  { id: "nobel", cat: "Edebiyat", sub: "Nobel Edebiyat Ödülü", diff: 3, rows: NOBEL, asks: [
    { t: "{0} Nobel Edebiyat Ödülü'nü kim kazanmıştır?", a: 1, by: [0], choice: true },
    { t: "{1} hangi yıl Nobel Edebiyat Ödülü'nü almıştır?", a: 0, by: [1], num: true },
  ] },
  { id: "edkarakter", cat: "Edebiyat", sub: "Edebî karakterler", diff: 2, rows: CHARACTERS, asks: [{ t: "{0} adlı karakter hangi eserde yer alır?", a: 1, by: [0], choice: true }] },
];

export const EDEBIYAT_SINGLES: SingleSet[] = [{
  id: "edb1", cat: "Edebiyat", sub: "Genel edebiyat", diff: 1, rows: [
    "Nobel Edebiyat Ödülü'nü kazanan ilk Türk yazar kimdir?|Orhan Pamuk|Pamuk|Yaşar Kemal;Nazım Hikmet;Elif Şafak",
    "Orhan Pamuk Nobel Edebiyat Ödülü'nü hangi yıl almıştır?|2006||2002;2010;2004",
    "İstiklal Marşı'nın şairi kimdir?|Mehmet Akif Ersoy|Akif|Ziya Gökalp;Yahya Kemal;Namık Kemal",
    "İstiklal Marşı kaç kıtadan oluşur?|10|on|5;7;12",
    "Divan edebiyatında 'Sultanü'ş-Şuara' (şairler sultanı) olarak anılan şair kimdir?|Baki||Fuzuli;Nedim;Nef'i",
    "Karacaoğlan hangi edebiyat geleneğinin şairidir?|Halk edebiyatı|Âşık edebiyatı|Divan edebiyatı;Tanzimat edebiyatı;Servet-i Fünun",
    "Türk edebiyatında 'Garip' akımının üç şairi Orhan Veli, Oktay Rifat ve kimdir?|Melih Cevdet Anday|Melih Cevdet|Cemal Süreya;Nazım Hikmet;Attila İlhan",
    "'Kuvayı Milliye Destanı' kimin eseridir?|Nazım Hikmet||Orhan Veli;Cahit Sıtkı Tarancı;Faruk Nafiz Çamlıbel",
    "Aziz Nesin hangi türdeki eserleriyle tanınır?|Mizah|Hiciv ve mizah|Şiir;Destan;Ağıt",
    "Dede Korkut Hikâyeleri hangi halkın destansı anlatılarıdır?|Oğuz Türkleri|Oğuzlar|Kırgızlar;Moğollar;Hunlar",
    "Manas Destanı hangi Türk topluluğuna aittir?|Kırgızlar|Kırgız Türkleri|Kazaklar;Özbekler;Uygurlar",
    "Nasreddin Hoca'nın şehri Akşehir hangi ilimize bağlıdır?|Konya||Afyonkarahisar;Isparta;Eskişehir",
    "Homeros'un İlyada destanı hangi savaşı anlatır?|Truva Savaşı|Truva|Pers Savaşları;Peloponez Savaşı;Pön Savaşları",
    "Odysseia destanının kahramanı kimdir?|Odysseus|Ulysses|Aşil;Hektor;Paris",
    "Shakespeare hangi ülkenin yazarıdır?|İngiltere|Birleşik Krallık|Fransa;İtalya;İrlanda",
    "Dostoyevski hangi ülkenin yazarıdır?|Rusya||Polonya;Ukrayna;Çekya",
    "Victor Hugo hangi ülkenin yazarıdır?|Fransa||Belçika;İtalya;İspanya",
    "Franz Kafka hangi dilde yazmıştır?|Almanca||Çekçe;Yidiş;Fransızca",
    "Haiku adı verilen kısa şiir türü hangi ülkeye aittir?|Japonya||Çin;Kore;Hindistan",
    "Rubai nedir?|Dörtlük şiir türü|Dört mısralık şiir|Uzun destan;Tek mısralık şiir;Ağıt",
    "Gazel hangi edebiyatın nazım biçimidir?|Divan edebiyatı|Divan şiiri|Halk edebiyatı;Tanzimat edebiyatı;Servet-i Fünun",
    "Mani nedir?|Halk edebiyatında dört dizelik kısa şiir|Dörtlük|Roman;Tiyatro;Destan",
    "Tiyatro eseri yazarına ne denir?|Oyun yazarı|Dramaturg|Romancı;Şair;Eleştirmen",
    "Edebiyatta 'otobiyografi' ne demektir?|Kişinin kendi hayatını anlatması|Yaşamöyküsü|Başkasının hayatını anlatma;Seyahat anlatısı;Anı",
    "Edebiyatta 'biyografi' ne demektir?|Bir kişinin hayat hikâyesi|Yaşam öyküsü|Roman;Şiir;Tiyatro",
  ],
}];
