import type { FactSet, SingleSet } from "../gen";

const EL = ("Hidrojen H,Helyum He,Lityum Li,Berilyum Be,Bor B,Karbon C,Azot N,Oksijen O,Flor F,Neon Ne,Sodyum Na,Magnezyum Mg,Alüminyum Al,Silisyum Si,Fosfor P,Kükürt S,Klor Cl,Argon Ar,Potasyum K,Kalsiyum Ca," +
  "Skandiyum Sc,Titanyum Ti,Vanadyum V,Krom Cr,Mangan Mn,Demir Fe,Kobalt Co,Nikel Ni,Bakır Cu,Çinko Zn,Galyum Ga,Germanyum Ge,Arsenik As,Selenyum Se,Brom Br,Kripton Kr,Rubidyum Rb,Stronsiyum Sr,İtriyum Y,Zirkonyum Zr," +
  "Niyobyum Nb,Molibden Mo,Teknesyum Tc,Rutenyum Ru,Rodyum Rh,Paladyum Pd,Gümüş Ag,Kadmiyum Cd,İndiyum In,Kalay Sn,Antimon Sb,Tellür Te,İyot I,Ksenon Xe,Sezyum Cs,Baryum Ba,Lantan La,Seryum Ce,Praseodim Pr,Neodim Nd," +
  "Prometyum Pm,Samaryum Sm,Evropiyum Eu,Gadolinyum Gd,Terbiyum Tb,Disprosyum Dy,Holmiyum Ho,Erbiyum Er,Tülyum Tm,İterbiyum Yb,Lutesyum Lu,Hafniyum Hf,Tantal Ta,Volfram W,Renyum Re,Osmiyum Os,İridyum Ir,Platin Pt,Altın Au,Cıva Hg," +
  "Talyum Tl,Kurşun Pb,Bizmut Bi,Polonyum Po,Astatin At,Radon Rn,Fransiyum Fr,Radyum Ra,Aktinyum Ac,Toryum Th,Protaktinyum Pa,Uranyum U").split(",");
// ad|simge|atom numarası (numara listedeki sıradan türetilir)
const ELEMENTS = EL.map((e, i) => { const [n, s] = e.split(" "); return `${n}|${s}|${i + 1}`; });

const PLANETS = ["Merkür|1", "Venüs|2", "Dünya|3", "Mars|4", "Jüpiter|5", "Satürn|6", "Uranüs|7", "Neptün|8"];
const MOONS = ["Ay|Dünya", "Fobos|Mars", "Deimos|Mars", "İo|Jüpiter", "Europa|Jüpiter", "Ganymede|Jüpiter", "Callisto|Jüpiter", "Titan|Satürn", "Enceladus|Satürn", "Triton|Neptün", "Miranda|Uranüs", "Charon|Plüton"];

// bilim insanı|alanı|ile özdeşleşen çalışma
const SCIENTISTS = [
  "Isaac Newton;Newton|Fizik|Evrensel kütleçekim yasası", "Albert Einstein;Einstein|Fizik|Görelilik kuramı", "Marie Curie;Curie|Fizik ve Kimya|Radyoaktivite çalışmaları", "Charles Darwin;Darwin|Biyoloji|Doğal seçilimle evrim kuramı",
  "Galileo Galilei;Galileo|Astronomi|Teleskopla Jüpiter'in uydularının gözlemi", "Nicolaus Copernicus;Kopernik|Astronomi|Güneş merkezli evren modeli", "Louis Pasteur;Pasteur|Mikrobiyoloji|Kuduz aşısı ve pastörizasyon",
  "Gregor Mendel;Mendel|Genetik|Bezelye deneyleriyle kalıtım yasaları", "Nikola Tesla;Tesla|Elektrik mühendisliği|Alternatif akım sistemleri", "Alexander Fleming;Fleming|Tıp|Penisilinin keşfi", "Stephen Hawking;Hawking|Fizik|Kara delik radyasyonu",
  "Dmitri Mendeleyev;Mendeleyev|Kimya|Periyodik tablo", "Michael Faraday;Faraday|Fizik|Elektromanyetik indüksiyon", "Alessandro Volta;Volta|Fizik|İlk elektrik pili", "Georg Ohm;Ohm|Fizik|Direnç yasası (Ohm yasası)",
  "Arşimet;Archimedes|Matematik ve Fizik|Kaldırma kuvveti ilkesi", "Pisagor;Pythagoras|Matematik|Dik üçgende kenar bağıntısı (Pisagor teoremi)", "Öklid;Euclid|Matematik|Elemanlar adlı geometri eseri", "Johannes Kepler;Kepler|Astronomi|Gezegen hareketi yasaları",
  "Werner Heisenberg;Heisenberg|Fizik|Belirsizlik ilkesi", "Niels Bohr;Bohr|Fizik|Atomun yörünge modeli", "Ernest Rutherford;Rutherford|Fizik|Atom çekirdeğinin keşfi", "Max Planck;Planck|Fizik|Kuantum kuramının temeli", "Sigmund Freud;Freud|Psikoloji|Psikanaliz",
  "Aziz Sancar|Biyokimya|DNA onarımı çalışmaları ve 2015 Nobel Kimya Ödülü", "Cahit Arf|Matematik|Arf değişmezi", "Ali Kuşçu|Astronomi|Semerkant Rasathanesi'nde çalışmaları", "İbn-i Sina;Avicenna|Tıp|El-Kanun fi't-Tıb adlı tıp ansiklopedisi",
  "Harezmî;Al-Khwarizmi|Matematik|Cebir biliminin temeli", "Piri Reis|Denizcilik|Kitab-ı Bahriye ve dünya haritası", "Uluğ Bey|Astronomi|Semerkant Rasathanesi'nin kurucusu", "Takiyüddin|Astronomi|İstanbul Rasathanesi'nin kurucusu",
  "James Watt;Watt|Mühendislik|Buhar makinesinin geliştirilmesi", "Edward Jenner;Jenner|Tıp|Çiçek aşısı", "Antoine Lavoisier;Lavoisier|Kimya|Kütlenin korunumu yasası", "John Dalton;Dalton|Kimya|Modern atom kuramı", "Alfred Nobel;Nobel|Kimya|Dinamitin icadı",
  "Wilhelm Röntgen;Röntgen|Fizik|X ışınlarının keşfi", "Edwin Hubble;Hubble|Astronomi|Evrenin genişlediğinin gözlemi", "Alan Turing;Turing|Bilgisayar bilimi|Turing makinesi ve Enigma'nın çözülmesi", "Tim Berners-Lee|Bilgisayar bilimi|World Wide Web'in icadı",
  "Johannes Gutenberg;Gutenberg|Matbaacılık|Avrupa'da hareketli harfli matbaa", "Rudolf Diesel;Diesel|Mühendislik|Dizel motor", "Wright Kardeşler|Havacılık|İlk kontrollü motorlu uçuş", "Rosalind Franklin|Biyofizik|DNA'nın X ışını kırınım görüntüsü",
  "Gordon Moore;Moore|Elektronik|Moore yasası (yongadaki transistör sayısı)", "Ada Lovelace|Matematik|İlk bilgisayar programı olarak kabul edilen algoritma", "Jane Goodall|Primatoloji|Şempanzeler üzerine uzun süreli saha çalışması",
];

// büyüklük|SI birimi
const UNITS = [
  "Kuvvet|Newton", "Enerji|Joule;Jul", "Güç|Watt", "Basınç|Pascal", "Frekans|Hertz", "Elektrik akımı|Amper;Ampere", "Elektrik potansiyeli (gerilim)|Volt", "Elektrik direnci|Ohm", "Sıcaklık (SI)|Kelvin",
  "Kütle (SI)|Kilogram", "Uzunluk (SI)|Metre", "Zaman (SI)|Saniye", "Işık şiddeti|Kandela;Candela", "Madde miktarı|Mol", "Elektrik yükü|Coulomb;Kulomb", "Radyoaktivite|Becquerel;Bekerel",
  "Manyetik akı yoğunluğu|Tesla", "Elektrik sığası (kapasitans)|Farad", "Endüktans|Henry", "Ses şiddeti (düzeyi)|Desibel",
];

// hayvan|sınıf
const ANIMALS = [
  "Yunus|Memeli", "Yarasa|Memeli", "Balina|Memeli", "Kanguru|Memeli", "Penguen|Kuş", "Devekuşu|Kuş", "Kivi|Kuş", "Baykuş|Kuş", "Timsah|Sürüngen", "Deniz kaplumbağası|Sürüngen", "Kertenkele|Sürüngen", "Kobra|Sürüngen",
  "Kurbağa|Amfibi", "Semender|Amfibi", "Köpekbalığı|Balık", "Som balığı|Balık", "Denizatı|Balık", "Kelebek|Böcek", "Bal arısı|Böcek", "Karınca|Böcek", "Uğur böceği|Böcek", "Örümcek|Örümceksi",
  "Akrep|Örümceksi", "Yengeç|Kabuklu", "Istakoz|Kabuklu", "Ahtapot|Yumuşakça", "Salyangoz|Yumuşakça", "Denizyıldızı|Derisidikenli", "Kaplan|Memeli", "Karakartal|Kuş", "Zebra|Memeli", "Fil|Memeli", "Aslan|Memeli", "Kedi|Memeli", "Köpek|Memeli", "At|Memeli", "Karga|Kuş", "Serçe|Kuş", "Papağan|Kuş", "Flamingo|Kuş", "Yılan|Sürüngen", "Bukalemun|Sürüngen", "Hamsi|Balık", "Orkinos|Balık", "Sivrisinek|Böcek", "Çekirge|Böcek", "Cırcır böceği|Böcek", "Midye|Yumuşakça", "Kalamar|Yumuşakça", "Karides|Kabuklu", "Yengeç|Kabuklu",
];

// hayvan|yaşam alanı/anavatan
const ANIMAL_HOME = [
  "Kanguru|Avustralya", "Koala|Avustralya", "Panda|Çin", "Zürafa|Afrika", "Lama|Güney Amerika", "Bizon|Kuzey Amerika", "Penguen|Antarktika", "Kutup ayısı|Kuzey Kutbu;Arktik", "Kivi (kuş)|Yeni Zelanda", "Komodo ejderi|Endonezya",
  "Aslan (doğal yaşam alanı)|Afrika", "Orangutan|Endonezya;Borneo;Sumatra", "Alpaka|Güney Amerika", "Kaplan (Sibirya)|Rusya", "Dingo|Avustralya", "Goril|Afrika",
];

export const BILIM: FactSet[] = [
  { id: "element", cat: "Bilim", sub: "Kimya: elementler", diff: 2, rows: ELEMENTS, asks: [
    { t: "{0} elementinin simgesi nedir?", a: 1, by: [0] },
    { t: "{1} simgesi hangi elemente aittir?", a: 0, by: [1] },
    { t: "{0} elementinin atom numarası kaçtır?", a: 2, by: [0], num: true },
    { t: "Atom numarası {2} olan element hangisidir?", a: 0, by: [2] },
  ] },
  { id: "gezegen", cat: "Bilim", sub: "Astronomi", diff: 1, rows: PLANETS, asks: [
    { t: "Güneş'e yakınlık sırasına göre {1}. gezegen hangisidir?", a: 0, by: [1] },
    { t: "{0}, Güneş'e en yakın kaçıncı gezegendir?", a: 1, by: [0], num: true },
  ] },
  { id: "uydu", cat: "Bilim", sub: "Astronomi", diff: 2, rows: MOONS, asks: [{ t: "{0}, hangi gezegenin ya da cüce gezegenin uydusudur?", a: 1, by: [0], choice: true }] },
  { id: "bilimci", cat: "Bilim", sub: "Bilim insanları", diff: 2, rows: SCIENTISTS, asks: [
    { t: "“{2}” ile özdeşleşen bilim insanı kimdir?", a: 0, by: [2] },
    { t: "{0} hangi alanda çalışmıştır?", a: 1, by: [0], choice: true },
  ] },
  { id: "birim", cat: "Bilim", sub: "Fizik: birimler", diff: 2, rows: UNITS, asks: [
    { t: "{0} büyüklüğünün birimi nedir?", a: 1, by: [0] },
    { t: "{1} hangi büyüklüğün birimidir?", a: 0, by: [1] },
  ] },
  { id: "hayvan", cat: "Doğa ve Hayvanlar", sub: "Biyoloji: hayvanlar", diff: 1, rows: ANIMALS, asks: [{ t: "{0} hangi hayvan sınıfında yer alır?", a: 1, by: [0], choice: true }] },
  { id: "yasam", cat: "Doğa ve Hayvanlar", sub: "Biyoloji: hayvanlar", diff: 1, rows: ANIMAL_HOME, asks: [{ t: "{0} hangi bölgeyle özdeşleşmiştir?", a: 1, by: [0], choice: true }] },
];

export const BILIM_SINGLES: SingleSet[] = [{
  id: "bilim1", cat: "Bilim", sub: "Genel bilim", diff: 1, rows: [
    "Güneş Sistemi'nin en büyük gezegeni hangisidir?|Jüpiter||Satürn;Neptün;Dünya",
    "Güneş'e en yakın gezegen hangisidir?|Merkür||Venüs;Mars;Dünya",
    "Kızıl Gezegen olarak bilinen gezegen hangisidir?|Mars||Venüs;Jüpiter;Merkür",
    "Halkalarıyla ünlü gezegen hangisidir?|Satürn||Jüpiter;Uranüs;Mars",
    "Dünya'nın doğal uydusu nedir?|Ay||Fobos;Titan;Europa",
    "Güneş Sistemi'nin en küçük gezegeni hangisidir?|Merkür||Mars;Venüs;Plüton",
    "Güneş Sistemi'nin en sıcak gezegeni hangisidir?|Venüs||Merkür;Mars;Jüpiter",
    "Işık Güneş'ten Dünya'ya yaklaşık kaç dakikada ulaşır?|8|sekiz|2;15;30",
    "Dünya'nın Güneş çevresindeki bir turu yaklaşık kaç gün sürer?|365|365 gün|300;400;180",
    "Dünya'nın kendi ekseni etrafında bir tam dönüşü yaklaşık kaç saat sürer?|24|24 saat|12;48;36",
    "Samanyolu hangi tür galaksidir?|Sarmal galaksi|Spiral galaksi;Sarmal|Eliptik galaksi;Düzensiz galaksi;Halka galaksi",
    "Ay'a ilk ayak basan insan kimdir?|Neil Armstrong|Armstrong|Buzz Aldrin;Yuri Gagarin;Michael Collins",
    "Uzaya çıkan ilk insan kimdir?|Yuri Gagarin|Gagarin|Neil Armstrong;Alan Shepard;John Glenn",
    "Hubble adı verilen uzay aracı ne amaçla kullanılır?|Uzay teleskobu|Teleskop|Ay iniş aracı;Uzay istasyonu;Roket",
    "Suyun deniz seviyesinde kaynama noktası kaç °C'dir?|100||90;80;120",
    "Suyun donma noktası kaç °C'dir?|0|sıfır|10;-5;4",
    "Su molekülünün kimyasal formülü nedir?|H2O||CO2;O2;NaCl",
    "Sofra tuzunun kimyasal formülü nedir?|NaCl||KCl;CaCO3;H2SO4",
    "Karbondioksitin kimyasal formülü nedir?|CO2||CO;O2;N2",
    "Atmosferde en bol bulunan gaz hangisidir?|Azot||Oksijen;Karbondioksit;Argon",
    "Bitkilerin fotosentezde atmosferden aldığı gaz nedir?|Karbondioksit|CO2|Oksijen;Azot;Hidrojen",
    "Bitkilerin yeşil rengini veren madde nedir?|Klorofil||Karoten;Melanin;Hemoglobin",
    "Doğadaki en sert maddelerden biri olan ve karbondan oluşan madde nedir?|Elmas||Kuvars;Grafit;Topaz",
    "Periyodik tabloda 'Au' simgesi hangi elementi gösterir?|Altın||Gümüş;Bakır;Alüminyum",
    "Periyodik tabloda 'Fe' simgesi hangi elementi gösterir?|Demir||Flor;Fosfor;Fransiyum",
    "pH değeri 7 olan çözelti nasıl adlandırılır?|Nötr||Asit;Baz;Tuz",
    "Asitlerin pH değeri 7'den nasıldır?|Küçüktür|Düşüktür|Büyüktür;Eşittir;Sıfırdır",
    "Sıvı haldeki bir maddenin gaz haline geçmesine ne denir?|Buharlaşma||Yoğuşma;Donma;Erime",
    "Gaz halindeki bir maddenin sıvı haline geçmesine ne denir?|Yoğuşma|Yoğunlaşma;Kondenzasyon|Buharlaşma;Süblimleşme;Erime",
    "Katı bir maddenin doğrudan gaza dönüşmesine ne denir?|Süblimleşme||Erime;Buharlaşma;Kırağılaşma",
    "Ses hangi ortamda yayılamaz?|Boşlukta|Vakumda;Uzay boşluğunda|Suda;Havada;Çelikte",
    "Ses hangi ortamda en hızlı yayılır?|Katılarda|Katı maddelerde|Gazlarda;Boşlukta;Sıvılarda",
    "Kütleçekim yasasını formüle eden bilim insanı kimdir?|Isaac Newton|Newton|Galileo;Einstein;Kepler",
    "E = mc² formülü hangi bilim insanına aittir?|Albert Einstein|Einstein|Isaac Newton;Max Planck;Niels Bohr",
    "Atomun merkezinde bulunan ve pozitif yüklü parçacıkları içeren yapı hangisidir?|Çekirdek||Elektron;Nötron;Orbital",
    "Atomda negatif yüklü parçacık hangisidir?|Elektron||Proton;Nötron;Pozitron",
    "Atomda yüksüz parçacık hangisidir?|Nötron||Proton;Elektron;Foton",
    "Elektrik akımının birimi nedir?|Amper|Ampere|Volt;Watt;Ohm",
    "Elektrik direncinin birimi nedir?|Ohm||Amper;Volt;Watt",
    "Bir mıknatısın zıt kutupları birbirini nasıl etkiler?|Çeker||İter;Etkilemez;Yok eder",
    "İnsan vücudunun en büyük organı hangisidir?|Deri||Karaciğer;Akciğer;Beyin",
    "İnsanda kanı vücuda pompalayan organ hangisidir?|Kalp||Akciğer;Karaciğer;Böbrek",
    "Yetişkin bir insanda yaklaşık kaç kemik vardır?|206||180;250;300",
    "İnsan kalbi kaç odacıktan oluşur?|4|dört|2;3;6",
    "Kanın kırmızı rengini veren madde nedir?|Hemoglobin||Klorofil;Melanin;Keratin",
    "İnsan DNA'sı hangi biçimde bir yapıya sahiptir?|Çift sarmal||Tek sarmal;Üçlü sarmal;Halka",
    "DNA'nın açılımı nedir?|Deoksiribonükleik asit||Ribonükleik asit;Aminoasit;Nükleik protein",
    "İnsanda kan şekerini düzenleyen hormon hangisidir?|İnsülin||Adrenalin;Tiroksin;Kortizol",
    "İnsülin hangi organ tarafından salgılanır?|Pankreas||Karaciğer;Mide;Böbrek",
    "Vücutta oksijen taşıyan kan hücreleri hangisidir?|Alyuvarlar|Eritrositler;Kırmızı kan hücreleri|Akyuvarlar;Trombositler;Plazma",
    "Vücudu hastalıklardan koruyan kan hücreleri hangisidir?|Akyuvarlar|Lökositler;Beyaz kan hücreleri|Alyuvarlar;Trombositler;Plazma",
    "Kanın pıhtılaşmasında görev alan hücre parçaları hangisidir?|Trombositler|Kan pulcukları|Alyuvarlar;Akyuvarlar;Plazma",
    "İnsanda mide hangi sistemin parçasıdır?|Sindirim sistemi|Sindirim|Dolaşım sistemi;Boşaltım sistemi;Solunum sistemi",
    "İnsan beyninin düşünme ve bilinç merkezi olan bölümü hangisidir?|Büyük beyin|Serebrum|Beyincik;Omurilik soğanı;Hipotalamus",
    "D vitamini en çok hangi kaynaktan sentezlenir?|Güneş ışığı|Güneş|Süt;Havuç;Portakal",
    "Portakalda en çok bulunan vitamin hangisidir?|C vitamini|C|A vitamini;D vitamini;B12",
    "Havucun turuncu rengini veren madde nedir?|Karoten|Beta karoten|Klorofil;Hemoglobin;Melanin",
    "İnsan vücudunda en çok bulunan madde hangisidir?|Su||Protein;Yağ;Karbonhidrat",
    "Dişlerin dış tabakasını oluşturan sert doku nedir?|Mine||Dentin;Sement;Pulpa",
    "Yetişkin insanda kaç diş bulunur?|32|otuz iki|28;30;36",
    "Süt dişi sayısı çocuklarda kaçtır?|20|yirmi|16;24;28",
    "Gözün ışığa duyarlı tabakası hangisidir?|Retina|Ağ tabaka|Kornea;İris;Lens",
    "Kulakta işitmeyi sağlayan salyangoz şeklindeki yapı nedir?|Koklea|İç kulak salyangozu|Östaki borusu;Kulak zarı;Çekiç kemiği",
    "Yağmur ormanları 'dünyanın akciğerleri' denilen yer hangisidir?|Amazon Ormanları|Amazon|Kongo Ormanları;Sibirya Tayga;Borneo",
    "Fotosentez hangi organelde gerçekleşir?|Kloroplast||Mitokondri;Ribozom;Çekirdek",
    "Hücrenin enerji santrali olarak bilinen organel hangisidir?|Mitokondri||Kloroplast;Ribozom;Golgi",
    "Bitkilerde su ve mineralleri köklerden yapraklara taşıyan doku hangisidir?|Odun borusu|Ksilem|Soymuk borusu;Floem;Epidermis",
    "Arılar çiçeklerden topladığı hangi maddeyi bala dönüştürür?|Nektar||Polen;Reçine;Su",
    "Kelebeğin yaşam döngüsü sırasıyla nasıldır?|Yumurta, larva, pupa, ergin||Yumurta, pupa, larva, ergin;Larva, yumurta, ergin, pupa;Pupa, yumurta, larva, ergin",
    "Memeli hayvanların ortak özelliği nedir?|Yavrularını sütle beslemeleri|Süt salgılamaları|Yumurtayla üremeleri;Soğukkanlı olmaları;Kanatlarının olması",
    "Yarasalar hangi canlı sınıfındandır?|Memeli||Kuş;Sürüngen;Böcek",
    "Kuşların ortak özelliği nedir?|Tüylerinin olması||Süt vermeleri;Pullarının olması;Soğukkanlı olmaları",
    "Dünyanın en büyük canlısı olan memeli hangisidir?|Mavi balina||Fil;Köpekbalığı;Kaşalot",
    "Kara hayvanları içinde en hızlı koşan hayvan hangisidir?|Çita||Aslan;Antilop;At",
    "En uzun boylu kara hayvanı hangisidir?|Zürafa||Fil;Deve;Devekuşu",
    "En ağır kara hayvanı hangisidir?|Afrika fili|Fil|Gergedan;Su aygırı;Zürafa",
    "Arı kovanında yumurta bırakan tek dişi arıya ne denir?|Ana arı|Kraliçe arı|İşçi arı;Erkek arı;Bekçi arı",
    "Dünyanın en hızlı kuşu (dalış hızıyla) hangisidir?|Şahin|Peregrine şahini;Doğan|Kartal;Albatros;Kızılcabaşlı",
    "Hangi gezegende Güneş Sistemi'nin en yüksek yanardağı Olympus Mons bulunur?|Mars||Venüs;Jüpiter;Dünya",
    "Jüpiter'in en tanınan özelliği olan dev fırtına nedir?|Büyük Kırmızı Leke|Kırmızı Leke|Mavi Nokta;Dev Halka;Sarı Girdap",
    "Pi sayısının yaklaşık değeri kaçtır?|3,14|3.14|2,71;1,62;3,41",
    "Bir üçgenin iç açıları toplamı kaç derecedir?|180||90;270;360",
    "Bir dörtgenin iç açıları toplamı kaç derecedir?|360||180;270;540",
    "En küçük asal sayı hangisidir?|2|iki|1;3;0",
    "İlk 10 doğal sayının toplamı (1'den 10'a) kaçtır?|55||50;45;66",
    "Bir daire için çevre formülü nedir?|2πr|2 pi r|πr²;πd²;4πr",
    "Bir daire için alan formülü nedir?|πr²|pi r kare|2πr;πd;4πr",
    "0'dan farklı herhangi bir sayının sıfırıncı kuvveti kaçtır?|1|bir|0;Tanımsız;Kendisi",
    "Bir yılda kaç gün olursa o yıl artık yıldır?|366|366 gün|365;364;367",
    "Bir metre kaç santimetredir?|100|yüz|10;1000;50",
    "Bir kilometre kaç metredir?|1000|bin|100;10000;500",
    "Bir saat kaç saniyedir?|3600||600;60;7200",
    "Bir ton kaç kilogramdır?|1000|bin|100;10000;500",
    "Bir litre kaç mililitredir?|1000|bin|100;10;500",
    "Tavuk yumurtasının ana besin maddesi olarak en çok hangisini içerir?|Protein||Karbonhidrat;Lif;Şeker",
    "Deprem büyüklüğü hangi ölçekle ölçülür?|Richter|Richter ölçeği;Moment büyüklüğü|Beaufort;Kelvin;Mohs",
    "Rüzgârın hızı hangi ölçekle sınıflandırılır?|Beaufort|Beaufort ölçeği|Richter;Mohs;Mercalli",
    "Minerallerin sertliği hangi ölçekle ölçülür?|Mohs|Mohs ölçeği|Richter;Beaufort;Kelvin",
    "Gökkuşağında kırmızıdan sonra gelen renk hangisidir?|Turuncu||Sarı;Mor;Yeşil",
    "Işığın bir prizmadan geçerek renklerine ayrılmasına ne denir?|Işığın kırılması ve yayılması|Dispersiyon;Renk ayrışması|Yansıma;Soğurma;Girişim",
    "Yer altından çıkan ve yakıt olarak kullanılan fosil yakıt hangisidir?|Petrol||Rüzgâr;Güneş;Jeotermal",
    "Güneş enerjisini elektriğe çeviren sistem hangisidir?|Fotovoltaik panel|Güneş paneli|Türbin;Jeneratör;Akü",
    "Hidrojen bombasında enerjinin kaynağı nedir?|Çekirdek füzyonu|Füzyon|Çekirdek fisyonu;Kimyasal yanma;Elektrik",
    "Nükleer santrallerde enerji üretiminin temeli nedir?|Çekirdek fisyonu|Fisyon|Çekirdek füzyonu;Yanma;Elektroliz",
    "Cep telefonlarında kullanılan en yaygın batarya türü hangisidir?|Lityum-iyon|Li-ion;Lityum iyon|Nikel-kadmiyum;Kurşun-asit;Alkalin",
    "Bilgisayarlarda 1 bayt kaç bittir?|8|sekiz|4;16;32",
    "Bilgisayarın beyni olarak bilinen bileşen hangisidir?|İşlemci|CPU|RAM;Anakart;Ekran kartı",
    "HTML neyin kısaltmasıdır?|Köprü Metni İşaretleme Dili|HyperText Markup Language|Yüksek Teknoloji Makine Dili;Ana Metin Yönetim Listesi;Köprü Taşıma Mantığı",
    "İnternette alan adlarını IP adreslerine çeviren sistem hangisidir?|DNS||HTTP;FTP;SMTP",
    "İlk web tarayıcılarından biri olan ve 1993'te çıkan tarayıcı hangisidir?|Mosaic|NCSA Mosaic|Chrome;Firefox;Edge",
    "Python programlama dilinin yaratıcısı kimdir?|Guido van Rossum|Van Rossum|Linus Torvalds;Bjarne Stroustrup;James Gosling",
    "Linux çekirdeğini ilk geliştiren kişi kimdir?|Linus Torvalds|Torvalds|Bill Gates;Steve Jobs;Richard Stallman",
    "Windows işletim sistemi hangi şirkete aittir?|Microsoft||Apple;IBM;Google",
    "Android işletim sistemi hangi şirket tarafından geliştirilmektedir?|Google||Apple;Microsoft;Samsung",
    "iPhone'un üreticisi hangi şirkettir?|Apple||Samsung;Nokia;Huawei",
    "Wi-Fi teknolojisinde veri hangi ortamla iletilir?|Radyo dalgaları|Radyo dalgasıyla|Kablolar;Fiber;Işık kabloları",
    "GPS sistemi hangi ülke tarafından geliştirilmiştir?|ABD|Amerika Birleşik Devletleri|Rusya;Çin;Avrupa Birliği",
  ],
}];
