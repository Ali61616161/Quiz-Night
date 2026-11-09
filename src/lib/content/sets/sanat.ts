import type { FactSet, SingleSet } from "../gen";

// eser|sanatçı
const WORKS = [
  "Mona Lisa|Leonardo da Vinci;Da Vinci", "Son Akşam Yemeği|Leonardo da Vinci;Da Vinci", "Yıldızlı Gece|Vincent van Gogh;Van Gogh", "Ayçiçekleri|Vincent van Gogh;Van Gogh", "Çığlık|Edvard Munch;Munch",
  "Guernica|Pablo Picasso;Picasso", "Avignonlu Kızlar|Pablo Picasso;Picasso", "Belleğin Azmi (Erimiş Saatler)|Salvador Dalí;Dali", "Öpücük (Klimt)|Gustav Klimt;Klimt", "Venüs'ün Doğuşu|Sandro Botticelli;Botticelli",
  "Adem'in Yaratılışı (Sistine Şapeli)|Michelangelo", "İnci Küpeli Kız|Johannes Vermeer;Vermeer", "Gece Devriyesi|Rembrandt", "Las Meninas|Diego Velázquez;Velazquez", "Büyük Dalga (Kanagava)|Katsushika Hokusai;Hokusai",
  "Nilüfer (Su Zambakları) serisi|Claude Monet;Monet", "İzlenim: Gün Doğumu|Claude Monet;Monet", "Çimenler Üzerinde Öğle Yemeği|Édouard Manet;Manet", "Halka Önderlik Eden Özgürlük|Eugène Delacroix;Delacroix",
  "Campbell Çorba Kutuları|Andy Warhol;Warhol", "Kaplumbağa Terbiyecisi|Osman Hamdi Bey", "Silah Taciri|Osman Hamdi Bey", "David (heykel)|Michelangelo", "Düşünen Adam (heykel)|Auguste Rodin;Rodin", "Özgürlük Heykeli|Frédéric Auguste Bartholdi;Bartholdi",
  "Atina Okulu (fresk)|Raffaello;Raphael", "Mutlu? |-", "Büyük Odalık|Jean-Auguste-Dominique Ingres;Ingres", "Olympia (Manet tablosu)|Édouard Manet;Manet", "Frida Kahlo Otoportresi (Kırık Sütun)|Frida Kahlo;Kahlo",
  "Kompozisyon VIII|Wassily Kandinsky;Kandinsky", "Broadway Boogie Woogie|Piet Mondrian;Mondrian", "Bu Bir Pipo Değildir (İmgelerin İhaneti)|René Magritte;Magritte", "Bahar (Primavera)|Sandro Botticelli;Botticelli",
  "Üç Müzisyen|Pablo Picasso;Picasso", "Ağlayan Kadın|Pablo Picasso;Picasso", "Dans (Matisse)|Henri Matisse;Matisse", "Yıldız Kapısı? |-", "Bale Provası|Edgar Degas;Degas", "Kaplan ve Bebeği? |-",
];
// sanatçı|akım|ülke
const PAINTERS = [
  "Pablo Picasso;Picasso|Kübizm|İspanya", "Claude Monet;Monet|İzlenimcilik|Fransa", "Salvador Dalí;Dali|Gerçeküstücülük (Sürrealizm)|İspanya", "Vincent van Gogh;Van Gogh|Post-izlenimcilik|Hollanda", "Andy Warhol;Warhol|Pop Art|ABD",
  "Wassily Kandinsky;Kandinsky|Soyut sanat|Rusya", "Piet Mondrian;Mondrian|De Stijl (Neoplastisizm)|Hollanda", "Edvard Munch;Munch|Dışavurumculuk (Ekspresyonizm)|Norveç", "Michelangelo|Yüksek Rönesans|İtalya", "Caravaggio|Barok|İtalya",
  "Eugène Delacroix;Delacroix|Romantizm|Fransa", "Gustave Courbet;Courbet|Gerçekçilik (Realizm)|Fransa", "Paul Cézanne;Cézanne;Cezanne|Post-izlenimcilik|Fransa", "Georges Seurat;Seurat|Noktacılık (Pointilizm)|Fransa", "René Magritte;Magritte|Gerçeküstücülük (Sürrealizm)|Belçika",
  "Jackson Pollock;Pollock|Soyut dışavurumculuk|ABD", "Marcel Duchamp;Duchamp|Dadaizm|Fransa", "Rembrandt|Barok|Hollanda", "Francisco Goya;Goya|Romantizm|İspanya", "Sandro Botticelli;Botticelli|Erken Rönesans|İtalya", "Leonardo da Vinci;Da Vinci|Yüksek Rönesans|İtalya",
  "Johannes Vermeer;Vermeer|Barok|Hollanda", "Diego Velázquez;Velazquez|Barok|İspanya", "Gustav Klimt;Klimt|Art Nouveau (Sezesyon)|Avusturya", "Henri Matisse;Matisse|Fovizm|Fransa", "Pierre-Auguste Renoir;Renoir|İzlenimcilik|Fransa", "Edgar Degas;Degas|İzlenimcilik|Fransa",
  "Frida Kahlo;Kahlo|Gerçeküstücü etkili Meksika sanatı|Meksika", "Katsushika Hokusai;Hokusai|Ukiyo-e|Japonya", "Osman Hamdi Bey|Oryantalizm|Türkiye", "Fikret Mualla;Mualla|Ekspresyonizm|Türkiye", "Bedri Rahmi Eyüboğlu;Eyüboğlu|Modern Türk resmi|Türkiye",
];
// müze|şehir
const MUSEUMS = [
  "Louvre Müzesi|Paris", "Orsay Müzesi|Paris", "Centre Pompidou|Paris", "Prado Müzesi|Madrid", "Reina Sofía Müzesi|Madrid", "Uffizi Galerisi|Floransa", "Vatikan Müzeleri|Vatikan", "Hermitage Müzesi|Saint Petersburg", "Britanya Müzesi|Londra",
  "National Gallery|Londra", "Tate Modern|Londra", "Metropolitan Sanat Müzesi|New York", "Modern Sanat Müzesi (MoMA)|New York", "Rijksmuseum|Amsterdam", "Van Gogh Müzesi|Amsterdam", "Pergamon Müzesi|Berlin", "Akropolis Müzesi|Atina",
  "İstanbul Arkeoloji Müzeleri|İstanbul", "Topkapı Sarayı Müzesi|İstanbul", "İstanbul Modern|İstanbul", "Pera Müzesi|İstanbul", "Sakıp Sabancı Müzesi|İstanbul", "Rahmi M. Koç Müzesi|İstanbul", "Anadolu Medeniyetleri Müzesi|Ankara",
  "Zeugma Mozaik Müzesi|Gaziantep", "Troya Müzesi|Çanakkale", "Mevlana Müzesi|Konya", "Efes Müzesi|İzmir", "Guggenheim Müzesi (Frank Gehry binası)|Bilbao", "Kunsthistorisches Müzesi|Viyana", "Tretyakov Galerisi|Moskova",
];
// yapı|mimar
const BUILDINGS = [
  "Süleymaniye Camii|Mimar Sinan;Sinan", "Selimiye Camii|Mimar Sinan;Sinan", "Şehzade Camii|Mimar Sinan;Sinan", "Sultanahmet Camii (Mavi Cami)|Sedefkâr Mehmed Ağa;Mehmed Ağa", "Eyfel Kulesi|Gustave Eiffel;Eiffel", "Sagrada Família|Antoni Gaudí;Gaudi",
  "Park Güell|Antoni Gaudí;Gaudi", "Guggenheim Müzesi Bilbao|Frank Gehry;Gehry", "Sidney Opera Binası|Jørn Utzon;Utzon", "Opéra Garnier|Charles Garnier;Garnier", "Louvre Piramidi|I. M. Pei;Pei", "Villa Savoye|Le Corbusier",
  "Fallingwater (Şelale Ev)|Frank Lloyd Wright;Wright", "Anıtkabir|Emin Onat ve Orhan Arda;Emin Onat", "Dolmabahçe Sarayı|Garabet Balyan ve Nikoğos Balyan;Balyan", "Haydarpaşa Garı|Otto Ritter ve Helmut Cuno;Otto Ritter", "Sirkeci Garı|August Jasmund;Jasmund",
  "Özgürlük Heykeli'nin iç iskeleti|Gustave Eiffel;Eiffel", "Brandenburg Kapısı|Carl Gotthard Langhans;Langhans", "Ayasofya (ilk yapı mimarları)|Anthemios ve Isidoros;Anthemios;Isidoros", "Kapalıçarşı? |-",
];

// sanatçı|doğum yılı
const BIRTH = ["Leonardo da Vinci;Da Vinci|1452", "Michelangelo|1475", "Raffaello;Raphael|1483", "Rembrandt|1606", "Johannes Vermeer;Vermeer|1632", "Francisco Goya;Goya|1746", "Claude Monet;Monet|1840", "Vincent van Gogh;Van Gogh|1853", "Pablo Picasso;Picasso|1881",
  "Salvador Dalí;Dali|1904", "Edvard Munch;Munch|1863", "Gustav Klimt;Klimt|1862", "Henri Matisse;Matisse|1869", "Wassily Kandinsky;Kandinsky|1866", "Piet Mondrian;Mondrian|1872", "Andy Warhol;Warhol|1928", "Frida Kahlo;Kahlo|1907", "Osman Hamdi Bey|1842",
  "Paul Cézanne;Cézanne;Cezanne|1839", "Pierre-Auguste Renoir;Renoir|1841", "Edgar Degas;Degas|1834", "Édouard Manet;Manet|1832", "René Magritte;Magritte|1898", "Caravaggio|1571", "Diego Velázquez;Velazquez|1599", "Jackson Pollock;Pollock|1912",
  "Katsushika Hokusai;Hokusai|1760", "Auguste Rodin;Rodin|1840", "Antoni Gaudí;Gaudi|1852", "Eugène Delacroix;Delacroix|1798", "Gustave Courbet;Courbet|1819", "Georges Seurat;Seurat|1859", "Marcel Duchamp;Duchamp|1887", "Le Corbusier|1887"];
// sanat dalı|usta
const CRAFT = ["Ebru|Su yüzeyinde boyayla desen oluşturma", "Hat|Güzel yazı sanatı", "Tezhip|Kitap süsleme sanatı (altınla)", "Minyatür|Küçük boyutlu resim sanatı", "Çini|Pişmiş toprak üzerine renkli sır süslemesi", "Kilim|Düz dokuma halı", "Karagöz|Gölge oyunu", "Meddah|Tek kişilik taklit ve hikâye anlatma sanatı",
  "Ortaoyunu|Meydanda oynanan geleneksel Türk tiyatrosu", "Kaligrafi|Güzel yazı sanatı (hat)", "Mozaik|Küçük taş parçalarıyla yapılan yüzey süsleme", "Fresk|Islak sıva üzerine duvar resmi", "Vitray|Renkli camlarla yapılan süsleme", "Seramik|Pişmiş çamurdan yapılan eşyalar sanatı",
  "Origami|Kâğıt katlama sanatı (Japon)", "Bonsai|Ağaçları minyatür biçimde yetiştirme sanatı (Japon)", "Rölyef|Yüzeyden kabartma olarak çıkan heykel tekniği", "Karikatür|Mizahi çizgi sanatı", "Kolaj|Parçaların yapıştırılmasıyla oluşan eser"];

export const SANAT: FactSet[] = [
  { id: "dogum", cat: "Sanat", sub: "Sanatçılar", diff: 3, rows: BIRTH, asks: [
    { t: "{0} hangi yıl doğmuştur?", a: 1, by: [0], num: true },
    { t: "{1} yılında doğan sanatçı/mimar kimdir?", a: 0, by: [1] },
  ] },
  { id: "dal", cat: "Sanat", sub: "Sanat dalları", diff: 2, rows: CRAFT, asks: [
    { t: "{0} nedir?", a: 1, by: [0], choice: true },
    { t: "“{1}” hangi sanat dalını tanımlar?", a: 0, by: [1], choice: true },
  ] },
  { id: "eser", cat: "Sanat", sub: "Eserler ve sanatçılar", diff: 2, rows: WORKS.filter((r) => !r.includes("? |-") && !r.endsWith("|-")), asks: [
    { t: "“{0}” adlı eserin sanatçısı kimdir?", a: 1, by: [0], choice: true },
  ] },
  { id: "ressam", cat: "Sanat", sub: "Sanat akımları", diff: 2, rows: PAINTERS, asks: [
    { t: "{0} hangi sanat akımıyla özdeşleşmiştir?", a: 1, by: [0], choice: true },
    { t: "{0} hangi ülkenin sanatçısıdır?", a: 2, by: [0], choice: true },
  ] },
  { id: "muze", cat: "Sanat", sub: "Müzeler", diff: 2, rows: MUSEUMS, asks: [{ t: "{0} hangi şehirdedir?", a: 1, by: [0], choice: true }] },
  { id: "mimar", cat: "Sanat", sub: "Mimarlık", diff: 3, rows: BUILDINGS.filter((r) => !r.endsWith("|-")), asks: [{ t: "{0} yapısının mimarı kimdir?", a: 1, by: [0], choice: true }] },
];

export const SANAT_SINGLES: SingleSet[] = [{
  id: "san1", cat: "Sanat", sub: "Genel sanat", diff: 1, rows: [
    "Mona Lisa tablosu hangi müzede sergilenir?|Louvre Müzesi|Louvre|Prado Müzesi;Uffizi Galerisi;Britanya Müzesi",
    "Sarı ve mavi renkler karıştırılırsa hangi renk elde edilir?|Yeşil||Turuncu;Mor;Kahverengi",
    "Kırmızı ve mavi renkler karıştırılırsa hangi renk elde edilir?|Mor|Menekşe|Yeşil;Turuncu;Pembe",
    "Kırmızı ve sarı renkler karıştırılırsa hangi renk elde edilir?|Turuncu||Yeşil;Mor;Kahverengi",
    "Rönesans sanatı hangi yüzyıllarda en parlak dönemini yaşamıştır?|15-16. yüzyıl|15. ve 16. yüzyıllar|11-12. yüzyıl;18-19. yüzyıl;20. yüzyıl",
    "Barok sanat hangi yüzyılla özdeşleşir?|17. yüzyıl|17. yüzyıl|13. yüzyıl;19. yüzyıl;20. yüzyıl",
    "İzlenimcilik akımının adı hangi tablodan gelir?|İzlenim: Gün Doğumu|Monet'nin İzlenim: Gün Doğumu|Ayçiçekleri;Mona Lisa;Çığlık",
    "Vincent van Gogh hangi ülkenin sanatçısıdır?|Hollanda||Fransa;Belçika;Almanya",
    "Pablo Picasso hangi ülkede doğmuştur?|İspanya||Fransa;İtalya;Portekiz",
    "Salvador Dalí'nin ünlü bıyıkları ve eserleri hangi akımla anılır?|Gerçeküstücülük|Sürrealizm|Kübizm;Pop Art;Fovizm",
    "Leonardo da Vinci'nin bir diğer ünlü eseri hangisidir?|Son Akşam Yemeği||Çığlık;Guernica;Yıldızlı Gece",
    "Michelangelo'nun Sistina Şapeli tavan freskleri hangi şehirde yer alır?|Vatikan|Roma|Floransa;Venedik;Milano",
    "Türk resim sanatında 'Kaplumbağa Terbiyecisi' tablosunun ressamı kimdir?|Osman Hamdi Bey||Şeker Ahmed Paşa;Fikret Mualla;Abidin Dino",
    "Osman Hamdi Bey hangi müzenin kurucusudur?|İstanbul Arkeoloji Müzesi|Arkeoloji Müzesi|Topkapı Sarayı Müzesi;Ayasofya Müzesi;Pera Müzesi",
    "Mimar Sinan'ın 'çıraklık eserim' dediği cami hangisidir?|Şehzade Camii|Şehzade|Süleymaniye;Selimiye;Sultanahmet",
    "Mimar Sinan'ın 'ustalık eserim' dediği cami hangisidir?|Selimiye Camii|Selimiye|Süleymaniye;Şehzade;Mihrimah",
    "Mimar Sinan'ın 'kalfalık eserim' dediği cami hangisidir?|Süleymaniye Camii|Süleymaniye|Şehzade;Selimiye;Sultanahmet",
    "Heykeltıraşlıkta 'David' heykelinin sanatçısı kimdir?|Michelangelo||Bernini;Donatello;Rodin",
    "Ebru sanatı hangi malzemeyle yapılır?|Su yüzeyinde boya|Suda boya|Yağlı boya;Mozaik;Kömür",
    "Kapadokya'daki kaya kiliseleri hangi dönem sanatını yansıtır?|Bizans|Bizans dönemi|Roma;Selçuklu;Osmanlı",
  ],
}];
