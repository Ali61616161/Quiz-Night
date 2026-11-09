import type { FactSet, SingleSet } from "../gen";

// yemek/ürün|il
const REGIONAL = [
  "Antep baklavası|Gaziantep;Antep", "Katmer|Gaziantep;Antep", "Beyran çorbası|Gaziantep;Antep", "Çiğ köfte (geleneksel)|Şanlıurfa;Urfa", "İskender kebap|Bursa", "Kestane şekeri|Bursa", "İnegöl köftesi|Bursa", "Pideli köfte|Bursa", "Mantı (geleneksel)|Kayseri",
  "Pastırma (ünlü)|Kayseri", "Etli ekmek|Konya", "Fırın kebabı|Konya", "Afyon kaymağı|Afyonkarahisar;Afyon", "Maraş dondurması|Kahramanmaraş;Maraş", "Bafra pidesi|Samsun", "Künefe|Hatay", "Tepsi kebabı (Antakya)|Hatay", "Beypazarı kurusu|Ankara",
  "Çubuk turşusu|Ankara", "Tantuni|Mersin", "Cezerye|Mersin", "Şalgam suyu|Adana", "Piyaz (Antalya piyazı)|Antalya", "Çökertme kebabı|Muğla", "Harput köftesi|Elazığ", "Cağ kebabı|Erzurum", "Van otlu peyniri|Van", "Kaburga dolması|Diyarbakır",
  "Büryan kebabı|Siirt", "Mengen yemekleri (aşçılar diyarı)|Bolu", "Ezine peyniri|Çanakkale", "Peynir helvası|Çanakkale", "Tava ciğer|Edirne", "Badem ezmesi (Edirne)|Edirne", "Hardaliye|Kırklareli", "Boyoz|İzmir", "Mesir macunu|Manisa",
  "Çibörek (Eskişehir)|Eskişehir", "Met helvası|Eskişehir", "Pişmaniye|Kocaeli", "Gül reçeli ve gülsuyu|Isparta", "Testi kebabı|Nevşehir", "Leblebi (ünlü)|Çorum", "Divriği? |-", "Hamsi tava (Karadeniz'in simgesi)|Trabzon", "Akçaabat köftesi|Trabzon",
  "Kuymak (mıhlama)|Rize", "Laz böreği|Giresun", "Antep fıstığı|Gaziantep;Antep", "Malatya kayısısı|Malatya", "Aydın inciri|Aydın", "Çay (Türkiye'nin çay üretim merkezi)|Rize", "Tokat yaprak sarması? |-", "Tulum peyniri (Erzincan)|Erzincan", "Kars kaşarı|Kars",
  "Sivas köftesi|Sivas", "Denizli kebabı|Denizli", "Simit kebabı|Kars", "Cantık|Bursa", "Tirit (geleneksel)|Konya",
];
// yemek|ülke
const CUISINE = [
  "Pizza|İtalya", "Lazanya|İtalya", "Risotto|İtalya", "Tiramisu|İtalya", "Carbonara|İtalya", "Panna cotta|İtalya", "Sushi|Japonya", "Ramen|Japonya", "Tempura|Japonya", "Sashimi|Japonya", "Miso çorbası|Japonya", "Taco|Meksika", "Burrito|Meksika",
  "Guacamole|Meksika", "Nachos|Meksika", "Enchilada|Meksika", "Paella|İspanya", "Gazpacho|İspanya", "Churros|İspanya", "Musakka (Yunan usulü)|Yunanistan", "Souvlaki|Yunanistan", "Gyros|Yunanistan", "Tzatziki|Yunanistan", "Fondü|İsviçre", "Raclette|İsviçre",
  "Rösti|İsviçre", "Gulaş|Macaristan", "Pierogi|Polonya", "Blini|Rusya", "Beef Stroganoff|Rusya", "Pelmeni|Rusya", "Kimchi|Güney Kore", "Bibimbap|Güney Kore", "Bulgogi|Güney Kore", "Pad Thai|Tayland", "Tom Yum çorbası|Tayland", "Pho|Vietnam",
  "Banh mi|Vietnam", "Pekin ördeği|Çin", "Dim sum|Çin", "Biryani|Hindistan", "Tereyağlı tavuk (Butter chicken)|Hindistan", "Samosa|Hindistan", "Tajin (Tagine)|Fas", "Baget|Fransa", "Ratatouille|Fransa", "Quiche|Fransa", "Krep (Crêpe)|Fransa",
  "Bouillabaisse|Fransa", "Makaron (Macaron)|Fransa", "Wiener Schnitzel|Avusturya", "Sachertorte|Avusturya", "Bratwurst|Almanya", "Pretzel|Almanya", "Haggis|İskoçya", "Fish and chips|İngiltere", "Feijoada|Brezilya", "Ceviche|Peru", "Asado|Arjantin",
  "Poutine|Kanada", "Gofret (Belçika waffle)|Belçika", "Apple pie|ABD", "Falafel? |-",
];
// peynir|ülke/il
const CHEESE = ["Parmesan|İtalya", "Mozzarella|İtalya", "Gorgonzola|İtalya", "Camembert|Fransa", "Roquefort|Fransa", "Brie|Fransa", "Gouda|Hollanda", "Edam|Hollanda", "Emmental|İsviçre", "Gruyère|İsviçre", "Cheddar|İngiltere", "Feta|Yunanistan", "Halloumi|Kıbrıs", "Manchego|İspanya", "Ricotta|İtalya"];
// içecek|ülke
const DRINKS = ["Tekila|Meksika", "Sake|Japonya", "Ouzo|Yunanistan", "Şampanya|Fransa", "Viski (Scotch)|İskoçya", "Guinness birası|İrlanda", "Sangria|İspanya", "Mojito|Küba", "Caipirinha|Brezilya", "Pilsner Urquell birası|Çekya", "Bordeaux şarabı|Fransa", "Chianti şarabı|İtalya", "Kahlúa likörü|Meksika", "Soju|Güney Kore", "Absinthe (kökeni)|İsviçre"];
// yemek|ana malzeme
const INGR = ["Humus|Nohut", "Falafel|Nohut", "Guakamole|Avokado", "Pesto|Fesleğen", "Sütlaç|Pirinç", "Aşure|Buğday", "Kısır|Bulgur", "Mercimek köftesi|Mercimek", "Pekmez|Üzüm", "Tahin|Susam", "Çikolata|Kakao", "Yoğurt|Süt", "Ketçap|Domates", "Bulgur pilavı|Bulgur", "Kuru fasulye|Fasulye", "Pekmezli helva? |-", "Tarator|Ceviz ve sarımsak", "Cacık|Yoğurt ve salatalık", "Karnıyarık|Patlıcan", "İmam bayıldı|Patlıcan", "Dolma (zeytinyağlı sarma)|Asma yaprağı;Üzüm yaprağı"];

// yemek|grup
const GROUP = ["Mercimek çorbası|Çorba", "Ezogelin çorbası|Çorba", "Tarhana çorbası|Çorba", "Domates çorbası|Çorba", "Yayla çorbası|Çorba", "İşkembe çorbası|Çorba", "Baklava|Tatlı", "Kadayıf|Tatlı", "Künefe|Tatlı", "Sütlaç|Tatlı", "Kazandibi|Tatlı", "Aşure|Tatlı", "Revani|Tatlı",
  "Şekerpare|Tatlı", "Lokma|Tatlı", "Güllaç|Tatlı", "Profiterol|Tatlı", "Tiramisu|Tatlı", "Mantı|Hamur işi", "Lahmacun|Hamur işi", "Pide|Hamur işi", "Su böreği|Hamur işi", "Gözleme|Hamur işi", "Simit|Hamur işi", "Poğaça|Hamur işi", "Açma|Hamur işi",
  "Ayran|İçecek", "Şalgam|İçecek", "Boza|İçecek", "Salep|İçecek", "Limonata|İçecek", "Türk kahvesi|İçecek", "Zeytinyağlı taze fasulye|Zeytinyağlı yemek", "İmam bayıldı|Zeytinyağlı yemek", "Zeytinyağlı yaprak sarma|Zeytinyağlı yemek", "Cacık|Meze", "Haydari|Meze",
  "Muhammara|Meze", "Acılı ezme|Meze", "Çoban salatası|Salata", "Gavurdağı salatası|Salata", "Kısır|Salata", "Mevsim salatası|Salata"];
// besin|anavatan
const ORIGIN = ["Domates|Güney Amerika", "Patates|Güney Amerika", "Mısır|Orta Amerika", "Kahve|Etiyopya", "Kakao|Orta ve Güney Amerika", "Çay|Çin", "Muz|Güneydoğu Asya", "Biber (kapya/dolma biberi)|Orta ve Güney Amerika", "Pirinç|Asya", "Buğday|Orta Doğu (Bereketli Hilal)", "Zeytin|Akdeniz havzası"];

export const YEMEK: FactSet[] = [
  { id: "grup", cat: "Yemek", sub: "Yemek grupları", diff: 1, rows: GROUP, asks: [{ t: "{0} hangi yemek grubunda yer alır?", a: 1, by: [0], choice: true }] },
  { id: "anavatan", cat: "Yemek", sub: "Besinlerin kökeni", diff: 3, rows: ORIGIN, asks: [{ t: "{0} hangi bölgeden dünyaya yayılmıştır?", a: 1, by: [0], choice: true }] },
  { id: "yore", cat: "Yemek", sub: "Yöresel lezzetler", diff: 2, rows: REGIONAL.filter((r) => !r.endsWith("|-")), asks: [{ t: "{0} hangi ille özdeşleşmiştir?", a: 1, by: [0], choice: true }] },
  { id: "mutfak", cat: "Yemek", sub: "Dünya mutfağı", diff: 1, rows: CUISINE.filter((r) => !r.endsWith("|-")), asks: [{ t: "{0} hangi ülke mutfağına aittir?", a: 1, by: [0], choice: true }] },
  { id: "peynir", cat: "Yemek", sub: "Peynirler", diff: 2, rows: CHEESE, asks: [{ t: "{0} peyniri hangi ülkeyle özdeşleşmiştir?", a: 1, by: [0], choice: true }] },
  { id: "icecek", cat: "Yemek", sub: "İçecekler", diff: 2, rows: DRINKS, asks: [{ t: "{0} hangi ülkeyle özdeşleşmiştir?", a: 1, by: [0], choice: true }] },
  { id: "malzeme", cat: "Yemek", sub: "Malzemeler", diff: 1, rows: INGR.filter((r) => !r.endsWith("|-")), asks: [{ t: "{0} yapımında temel olarak hangi malzeme kullanılır?", a: 1, by: [0], choice: true }] },
];

export const YEMEK_SINGLES: SingleSet[] = [{
  id: "yem1", cat: "Yemek", sub: "Mutfak bilgisi", diff: 1, rows: [
    "Baklavanın hamuru hangi ana malzemeyle yapılır?|Yufka|Yufka (ince hamur)|Pirinç;Bulgur;Mısır unu",
    "Sütlaç hangi tahılla yapılır?|Pirinç||Buğday;Bulgur;Mısır",
    "Karnıyarık hangi sebzeyle yapılır?|Patlıcan||Kabak;Biber;Domates",
    "Menemen yapımında yumurtayla birlikte hangi sebzeler kullanılır?|Domates ve biber|Domates ve yeşil biber|Patlıcan ve kabak;Havuç ve bezelye;Patates ve soğan",
    "Mercimek çorbası hangi baklagille yapılır?|Mercimek||Nohut;Fasulye;Bezelye",
    "Humus hangi baklagilden yapılır?|Nohut||Mercimek;Fasulye;Bezelye",
    "Pekmez hangi meyveden yapılır?|Üzüm|Üzüm ve dut|Elma;İncir;Kayısı",
    "Türk kahvesi geleneksel olarak hangi kapta pişirilir?|Cezve||Demlik;Semaver;Cevizlik",
    "Tarhana çorbasının temel malzemelerinden biri hangisidir?|Yoğurt||Peynir;Tereyağı;Süt",
    "Lahmacun hangi hamurla yapılır?|İnce hamur|Yufka hamuru|Mayalı kalın hamur;Pizza hamuru;Milföy",
    "Gözleme hangi hamurla yapılır?|Açılmış yufka|Yufka|Milföy;Kabarmış hamur;Pide hamuru",
    "Pastırma hangi baharatla kaplanarak olgunlaştırılır?|Çemen|Çemen (çemen otu)|Pul biber;Kimyon;Nane",
    "Dünyanın en pahalı baharatlarından olan ve çiğdem çiçeğinden elde edilen baharat nedir?|Safran||Kimyon;Karanfil;Tarçın",
    "Çikolatanın ana hammaddesi olan kakao hangi bitkiden elde edilir?|Kakao ağacı|Kakao|Kahve;Çay;Şeker kamışı",
    "Kahve hangi bitkinin çekirdeklerinden elde edilir?|Kahve ağacı|Kahve|Kakao;Çay;Yerfıstığı",
    "Çay bitkisi Türkiye'de en çok hangi bölgede yetiştirilir?|Karadeniz|Doğu Karadeniz|Ege;Marmara;Akdeniz",
    "Fındık üretiminde dünyada ilk sırada hangi ülke yer alır?|Türkiye||İtalya;ABD;İspanya",
    "Kuru kayısı ihracatıyla ünlü ilimiz hangisidir?|Malatya||Elazığ;Mersin;Adana",
    "Antep fıstığı ile ünlü ilimiz hangisidir?|Gaziantep|Antep|Şanlıurfa;Adıyaman;Kilis",
    "Zeytinyağının sıkma sonucu elde edilen en kaliteli türü hangisidir?|Natürel sızma|Sızma zeytinyağı|Riviera;Rafine;Pomace",
    "Salep hangi bitkinin kökünden elde edilir?|Orkide|Salep orkidesi|Çam;Zambak;Lale",
    "Rakıya aroma veren bitki nedir?|Anason||Nane;Kimyon;Kekik",
    "Hamsi hangi denizin balığı olarak bilinir?|Karadeniz||Ege;Akdeniz;Marmara",
    "Midye dolma hangi şehirle özdeşleşmiştir?|İstanbul||İzmir;Antalya;Mersin",
    "Islak hamburger hangi şehrin sokak lezzetidir?|İstanbul|Taksim|Ankara;İzmir;Bursa",
    "Kumru hangi şehirle özdeşleşmiştir?|İzmir||Antalya;Bursa;Adana",
    "Lokum hangi iki ana malzemeyle yapılır?|Nişasta ve şeker|Şeker ve nişasta|Un ve süt;Bal ve yumurta;Pirinç ve şeker",
    "Ramazan ayına özgü, nişasta yufkalarıyla yapılan tatlı hangisidir?|Güllaç||Aşure;Kazandibi;Revani",
    "Kuru fasulye en çok hangi yemekle birlikte servis edilir?|Pilav|Pirinç pilavı|Makarna;Börek;Çorba",
    "Mantının geleneksel olarak üzerine dökülen sos nedir?|Yoğurt ve tereyağlı sos|Yoğurt ve salça|Bal ve süt;Peynir ve sirke;Ketçap",
    "Türk kahvesi genellikle yanında ne ile servis edilir?|Lokum ve su|Lokum|Simit;Börek;Dondurma",
    "Hünkâr beğendi yemeğinin altlığı hangi sebzeden yapılır?|Patlıcan (közlenmiş)|Patlıcan|Kabak;Patates;Havuç",
    "İskender kebabın ana et türü nedir?|Dana veya kuzu döner|Döner|Tavuk;Balık;Mantar",
    "Dünyada en çok tüketilen içecek (su hariç) hangisidir?|Çay||Kahve;Süt;Bira",
    "Tarçın hangi ağacın kabuğundan elde edilir?|Tarçın ağacı|Cinnamomum|Karanfil;Meşe;Çam",
    "Karabiber hangi bitkinin meyvesidir?|Biber asması (Piper nigrum)|Karabiber asması|Kırmızı biber;Hardal;Kimyon",
    "Safran hangi çiçekten elde edilir?|Çiğdem (Crocus)|Çiğdem|Lale;Gül;Papatya",
    "Bal hangi canlı tarafından üretilir?|Bal arısı|Arı|Karınca;Kelebek;Eşek arısı",
    "Çikolatasıyla ünlü iki Avrupa ülkesi hangileridir?|İsviçre ve Belçika|Belçika ve İsviçre|Fransa ve İtalya;İspanya ve Portekiz;Almanya ve Avusturya",
    "Pastırma ve sucuğuyla ünlü ilimiz hangisidir?|Kayseri||Konya;Eskişehir;Niğde",
    "Baklavada kullanılan fıstık en çok hangi ilimizle özdeşleşmiştir?|Gaziantep|Antep|Şanlıurfa;Adıyaman;Kilis",
    "Rakı sofrasında rakıyla birlikte en çok içilen içecek nedir?|Su|Soğuk su|Süt;Ayran;Meyve suyu",
    "Salatalık hangi bitki ailesindendir?|Kabakgiller|Kabak ailesi|Baklagiller;Patlıcangiller;Haşhaşgiller",
    "Domates hangi bitki ailesindendir?|Patlıcangiller|Patlıcan ailesi|Kabakgiller;Baklagiller;Gülgiller",
    "Elma hangi bitki ailesindendir?|Gülgiller|Gül ailesi|Kabakgiller;Baklagiller;Zambakgiller",
  ],
}];
