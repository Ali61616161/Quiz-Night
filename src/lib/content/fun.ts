import type { Question } from "@/lib/engine/types";
import { normalizeTr } from "@/lib/engine/normalize";
import { EMOJI_GROUPS, FUNNY_SUBJECTS, FUNNY_TEMPLATES, parseEmojiRows } from "./fun-emoji";
import { rng, sample } from "./gen";

/**
 * Eğlence turlarının içerikleri (emoji tahmini, saçma cevap, sahte cevap, eğlence tahmini).
 * Ana soru havuzundan ayrıdır: yalnızca ilgili tur kutularına girer, klasik gecelerde çıkmaz.
 * Her sorunun birebir İngilizce karşılığı vardır.
 */
export const FUN_CATS = { emoji: "Emoji", funny: "Saçma Cevap", bluff: "Sahte Cevap", guess: "Eğlence Tahmin" } as const;
export const FUN_CAT_SET: ReadonlySet<string> = new Set(Object.values(FUN_CATS));

// ---------- Emoji tahmini ----------
// [emoji, TR cevap, EN cevap]
type E = [string, string, string];
const EMO: Record<string, { tr: string; en: string; rows: E[] }> = {
  film: { tr: "filmi", en: "film", rows: [
    ["🧙‍♂️💍🌋", "Yüzüklerin Efendisi", "The Lord of the Rings"], ["🦈🏖️", "Çene", "Jaws"], ["🦖🏝️", "Jurassic Park", "Jurassic Park"],
    ["👽📞🏠", "E.T.", "E.T. the Extra-Terrestrial"], ["🚀🌌⚔️", "Yıldız Savaşları", "Star Wars"], ["🍫🏭", "Charlie'nin Çikolata Fabrikası", "Charlie and the Chocolate Factory"],
    ["🏴‍☠️🦜🌊", "Karayip Korsanları", "Pirates of the Caribbean"], ["🕶️💊🟢", "Matrix", "The Matrix"], ["🧛‍♂️🏰🦇", "Drakula", "Dracula"],
    ["🧙‍♂️⚡👓", "Harry Potter", "Harry Potter"], ["🦍🏙️🗽", "King Kong", "King Kong"], ["🏎️💨🔥", "Hızlı ve Öfkeli", "The Fast and the Furious"],
    ["🚢🧊❤️", "Titanik", "Titanic"], ["👻🚫", "Hayalet Avcıları", "Ghostbusters"], ["🕷️🕸️🏙️", "Örümcek Adam", "Spider-Man"],
    ["🦸‍♂️🔨⚡", "Thor", "Thor"], ["🃏🦇🌃", "Batman", "Batman"], ["🦁🧙‍♂️🚪❄️", "Narnia Günlükleri", "The Chronicles of Narnia"],
  ] },
  animasyon: { tr: "animasyonu / çizgi diziyi", en: "animated film or cartoon", rows: [
    ["🦁👑🌅", "Aslan Kral", "The Lion King"], ["🐠🔍🌊", "Kayıp Balık Nemo", "Finding Nemo"], ["🧊👸⛄", "Karlar Ülkesi", "Frozen"],
    ["🐀👨‍🍳🍷", "Ratatouille", "Ratatouille"], ["🤖🌱❤️", "WALL-E", "WALL-E"], ["🎈🏠👴", "Yukarı Bak", "Up"],
    ["🧸🤠🚀", "Oyuncak Hikayesi", "Toy Story"], ["🐼🥋🍜", "Kung Fu Panda", "Kung Fu Panda"], ["🧞‍♂️🪔🐒", "Aladdin", "Aladdin"],
    ["🌹👸👹", "Güzel ve Çirkin", "Beauty and the Beast"], ["🧜‍♀️🐠🌊", "Küçük Deniz Kızı", "The Little Mermaid"], ["🚗⚡🏁", "Arabalar", "Cars"],
    ["🟢👹🐴", "Shrek", "Shrek"], ["🐘🎪", "Dumbo", "Dumbo"], ["🐻🍯🎈", "Winnie the Pooh", "Winnie the Pooh"],
    ["🦊🐰👮", "Zootropolis", "Zootopia"], ["🧽🍍🌊", "Sünger Bob", "SpongeBob SquarePants"], ["🐱🐭💥", "Tom ve Jerry", "Tom and Jerry"],
    ["🐢🥷🍕", "Ninja Kaplumbağalar", "Teenage Mutant Ninja Turtles"],
  ] },
  dizi: { tr: "diziyi", en: "TV series", rows: [
    ["🧪👨‍🏫💰", "Breaking Bad", "Breaking Bad"], ["🐉👑🧊", "Taht Oyunları", "Game of Thrones"], ["👽🚲🔦", "Stranger Things", "Stranger Things"],
    ["🛋️☕👫", "Friends", "Friends"], ["🔴🟢🦑", "Kalamar Oyunu", "Squid Game"], ["🎭💰🔴", "La Casa de Papel", "Money Heist"],
    ["🔍🎻🧥", "Sherlock", "Sherlock"],
  ] },
  ulke: { tr: "ülkeyi", en: "country", rows: [
    ["🗼🥖🧀", "Fransa", "France"], ["🍕🛵🏛️", "İtalya", "Italy"], ["🥋🍣🗻", "Japonya", "Japan"], ["🐼🧧🏯", "Çin", "China"],
    ["🦘🐨🏄", "Avustralya", "Australia"], ["🍺🥨🏰", "Almanya", "Germany"], ["🌮🌵🎺", "Meksika", "Mexico"], ["🐂💃🥘", "İspanya", "Spain"],
    ["🌷🚲🧀", "Hollanda", "The Netherlands"], ["🏔️🧀⌚", "İsviçre", "Switzerland"], ["⚽💃🏖️", "Brezilya", "Brazil"], ["🐫🔺☀️", "Mısır", "Egypt"],
  ] },
};

function emojiQuestions(): Question[] {
  const out: Question[] = [];
  let n = 0;
  for (const [gid, g] of Object.entries(EMO)) {
    g.rows.forEach((row, i) => {
      const r = rng(`emo:${gid}:${i}`);
      const others = g.rows.filter((_, j) => j !== i);
      const pick = sample(others, 3, r);
      const idx = Math.floor(r() * 4);
      const trOpts = pick.map((x) => x[1]); const enOpts = pick.map((x) => x[2]);
      trOpts.splice(idx, 0, row[1]); enOpts.splice(idx, 0, row[2]);
      out.push({
        id: `fun-emoji-${n++}`, category: FUN_CATS.emoji, subtopic: gid, difficulty: 1, kind: "choice",
        text: `Bu emojiler hangi ${g.tr} anlatıyor? ${row[0]}`, options: trOpts, correct: row[1], accepted: [], status: "approved", reports: 0,
        en: { text: `Which ${g.en} do these emojis describe? ${row[0]}`, options: enOpts, correct: row[2] },
      });
    });
  }
  // Tek emoji: "Bu emoji hangi hayvanı gösteriyor?" ve ters: "Hangisi 'Zürafa' emojisidir?" (şıklar emoji, dilden bağımsız)
  for (const [gid, g] of Object.entries(EMOJI_GROUPS)) {
    const rows = parseEmojiRows(g);
    const names = new Set(rows.map((x) => x[1]));
    if (names.size !== rows.length) throw new Error(`emoji grubu ${gid}: yinelenen ad`);
    rows.forEach((row, i) => {
      const r = rng(`emo1:${gid}:${i}`);
      const others = rows.filter((_, j) => j !== i);
      const pick = sample(others, 3, r); const idx = Math.floor(r() * 4);
      const trOpts = pick.map((x) => x[1]); const enOpts = pick.map((x) => x[2]);
      trOpts.splice(idx, 0, row[1]); enOpts.splice(idx, 0, row[2]);
      out.push({
        id: `fun-emoji1-${gid}-${i}`, category: FUN_CATS.emoji, subtopic: `tek-${gid}`, difficulty: 1, kind: "choice",
        text: `Bu emoji hangi ${g.tr} gösteriyor? ${row[0]}`, options: trOpts, correct: row[1], accepted: [], status: "approved", reports: 0,
        en: { text: `Which ${g.en} does this emoji show? ${row[0]}`, options: enOpts, correct: row[2] },
      });
      const r2 = rng(`emo2:${gid}:${i}`);
      const pick2 = sample(others, 3, r2); const idx2 = Math.floor(r2() * 4);
      const emoOpts = pick2.map((x) => x[0]); emoOpts.splice(idx2, 0, row[0]);
      out.push({
        id: `fun-emoji2-${gid}-${i}`, category: FUN_CATS.emoji, subtopic: `ters-${gid}`, difficulty: 1, kind: "choice",
        text: `Hangisi “${row[1]}” emojisidir?`, options: emoOpts, correct: row[0], accepted: [], status: "approved", reports: 0,
        en: { text: `Which one is the “${row[2]}” emoji?`, options: [...emoOpts], correct: row[0] },
      });
    });
  }
  return out;
}

// ---------- Saçma cevap (komik, doğru cevabı yok; takımlar oylar) ----------
const FUNNY: [string, string][] = [
  ["Bir pastanenin en saçma yeni ürününün adı ne olurdu?", "What would be the silliest new product name at a bakery?"],
  ["Sürekli geç kalan birine verilecek en yaratıcı mazeret nedir?", "What is the most creative excuse for someone who is always late?"],
  ["Bir kedinin LinkedIn'deki unvanı ne olurdu?", "What would a cat's job title be on LinkedIn?"],
  ["Pazartesi sabahını anlatan tek cümle yazın.", "Describe a Monday morning in one sentence."],
  ["Bu mekanın gizli menüsündeki en tuhaf yemek hangisi olurdu?", "What would be the weirdest dish on this venue's secret menu?"],
  ["Bir robot ilk kez kahve içerse ne derdi?", "What would a robot say when drinking coffee for the first time?"],
  ["Yeni bir spor dalı icat edin: adı ve kuralı ne?", "Invent a new sport: what is it called and what is the rule?"],
  ["Bir ejderhanın en büyük korkusu ne olurdu?", "What would a dragon's biggest fear be?"],
  ["Telefonunuzun şarjı %1 olduğunda söyleyeceğiniz son söz ne?", "What are your last words when your phone battery hits 1%?"],
  ["Bir mekânın tuvalet kapısına asılabilecek en komik uyarı nedir?", "What is the funniest sign you could hang on a restroom door?"],
  ["Bir astronotun Mars'tan Dünya'ya yazdığı ilk mesaj ne olurdu?", "What would be an astronaut's first message from Mars to Earth?"],
  ["Hayvanat bahçesindeki bir zürafanın şikâyet dilekçesi ne içerirdi?", "What would a zoo giraffe's complaint letter say?"],
  ["Bir dinozorun Instagram biyografisi nasıl olurdu?", "What would a dinosaur's Instagram bio say?"],
  ["Bu gecenin quiz takımı için en saçma slogan nedir?", "What is the silliest slogan for tonight's quiz team?"],
  ["Bir bulutun yeni yıl dileği ne olurdu?", "What would a cloud's New Year's wish be?"],
  ["Eşinize/arkadaşınıza alınabilecek en işe yaramaz hediye nedir?", "What is the most useless gift you could buy for a friend?"],
  ["Bir penguenin buzdolabında ne bulunur?", "What would you find in a penguin's fridge?"],
  ["Bir süper kahramanın en gereksiz süper gücü ne olurdu?", "What would be a superhero's most useless superpower?"],
  ["Sabah alarmına verilecek en dramatik isim nedir?", "What is the most dramatic name for a morning alarm?"],
  ["Bir çayın ve bir kahvenin kavga ederken söyleyeceği cümle nedir?", "What would tea and coffee say to each other in a fight?"],
  ["Bir müzenin en tuhaf sergisi neden oluşurdu?", "What would be the strangest exhibit in a museum?"],
  ["Dünyanın en gereksiz ikinci icadı nedir?", "What is the second most useless invention in the world?"],
  ["Bir bebeğin ilk cümlesi 'Anne' yerine ne olsaydı komik olurdu?", "What would be the funniest first word for a baby instead of 'Mama'?"],
  ["Bir otobüs durağının felsefi sloganı ne olurdu?", "What would a bus stop's philosophical slogan be?"],
  ["Bu masadaki en tuhaf alışkanlığınızı bir cümleyle itiraf edin.", "Confess your weirdest habit in one sentence."],
  ["Bir kargo kuryesinin en inanılmaz teslimat hikâyesi nedir?", "What is a courier's most unbelievable delivery story?"],
  ["Uzaylılar Dünya'ya gelse ilk sorulacak saçma soru nedir?", "If aliens visited Earth, what would be the silliest first question?"],
  ["Bir sandalyenin yüzyıllık yalnızlığını anlatan dize yazın.", "Write a line about a chair's hundred years of solitude."],
  ["Bir pizza dilimi ile ananas arasında geçen diyalog nedir?", "What dialogue takes place between a slice of pizza and pineapple?"],
  ["Yağmurda şemsiyesiz kalan birinin kendine söylediği teselli nedir?", "What comforting line does someone caught in the rain without an umbrella tell themselves?"],
  ["Bir film için en komik alternatif ad nedir (ör. 'Titanik' yerine)?", "What is the funniest alternative title for a film (e.g. instead of 'Titanic')?"],
  ["Bir eski telefonun emekli konuşması nasıl olurdu?", "What would an old phone's retirement speech be like?"],
  ["Bir şehir efsanesi uydurun: 'Bu mahallede kimse …'", "Make up an urban legend: 'Nobody in this neighbourhood ever …'"],
  ["Bir kedi ile köpeğin ev arkadaşı ilanı nasıl olurdu?", "What would a cat and dog's flatmate ad look like?"],
  ["Süpermarkette en tuhaf raf bölümünün adı ne olurdu?", "What would be the weirdest aisle name in a supermarket?"],
  ["Tatilde yaşanabilecek en kötü ama komik felaket nedir?", "What is the worst but funniest holiday disaster?"],
  ["Bir dondurma çeşidinin en tuhaf adı ne olurdu?", "What would be the weirdest ice cream flavour name?"],
  ["İş görüşmesinde söylenebilecek en saçma 'zayıf yönüm' cevabı nedir?", "What is the silliest answer to 'what is your weakness' in a job interview?"],
  ["Bir bebek yunusun ilk kelimesi ne olurdu?", "What would a baby dolphin's first word be?"],
  ["Bu mekâna konabilecek en tuhaf kural nedir?", "What is the strangest rule you could put up in this venue?"],
];
function funnyQuestions(): Question[] {
  const combo: [string, string][] = [];
  for (const [subj, esubj] of FUNNY_SUBJECTS) for (const [t, e] of FUNNY_TEMPLATES) combo.push([t.replace("{s}", subj), e.replace("{s}", esubj)]);
  return [...FUNNY, ...combo].map(([tr, en], i) => ({
    id: `fun-funny-${i}`, category: FUN_CATS.funny, difficulty: 1 as const, kind: "freeform" as const, text: tr, correct: "", accepted: [],
    status: "approved" as const, reports: 0, en: { text: en, correct: "" },
  }));
}

// ---------- Sahte cevap (gerçeği bulmaya çalışırken ikna edici yalan yaz) ----------
// [TR soru, TR cevap, TR kabul edilen(ler), EN soru, EN cevap, EN kabul edilen(ler)]
type B = [string, string, string[], string, string, string[]];
const BLUFF: B[] = [
  ["İngilizcede bir karga sürüsüne ne denir?", "Murder", ["a murder"], "In English, what is a group of crows called?", "A murder", ["murder"]],
  ["İngilizcede bir flamingo sürüsüne ne denir?", "Flamboyance", ["a flamboyance"], "In English, what is a group of flamingos called?", "A flamboyance", ["flamboyance"]],
  ["İngilizcede bir baykuş grubuna ne denir?", "Parliament", ["a parliament"], "In English, what is a group of owls called?", "A parliament", ["parliament"]],
  ["İngilizcede bir zürafa grubuna ne denir?", "Tower", ["a tower"], "In English, what is a group of giraffes called?", "A tower", ["tower"]],
  ["İngilizcede bir gergedan grubuna ne denir?", "Crash", ["a crash"], "In English, what is a group of rhinoceroses called?", "A crash", ["crash"]],
  ["Bir kuğu yavrusuna ne denir?", "Cygnet", [], "What is a baby swan called?", "Cygnet", []],
  ["Bir tavşanın (yaban tavşanı) yavrusuna İngilizcede ne denir?", "Leveret", [], "What is a baby hare called in English?", "Leveret", []],
  ["Bir baykuş yavrusuna İngilizcede ne denir?", "Owlet", [], "What is a baby owl called in English?", "Owlet", []],
  ["İnsan vücudundaki en küçük kemik hangisidir?", "Üzengi kemiği", ["üzengi", "stapes"], "What is the smallest bone in the human body?", "Stapes", ["stirrup", "stirrup bone"]],
  ["Kanı mavi renkli olan (bakır içerdiği için) deniz canlısı hangisidir?", "Ahtapot", ["ahtapotlar"], "Which sea creature has blue blood (because it contains copper)?", "Octopus", ["octopuses"]],
  ["En hafif metal hangisidir?", "Lityum", ["lithium"], "Which is the lightest metal?", "Lithium", []],
  ["Hangi gezegende bir gün (kendi etrafında dönüş) bir yıldan uzundur?", "Venüs", ["venus"], "On which planet is one day (a full rotation) longer than its year?", "Venus", []],
  ["Dünyanın en derin gölü hangisidir?", "Baykal Gölü", ["baykal"], "Which is the deepest lake in the world?", "Lake Baikal", ["baikal"]],
  ["Denize kıyısı olmayan en büyük ülke hangisidir?", "Kazakistan", [], "Which is the largest landlocked country?", "Kazakhstan", []],
  ["Bayrağı kare şeklinde olan iki ülkeden biri hangisidir (ikisi de Avrupa'da)?", "İsviçre", ["vatikan"], "Name one of the two countries with a square flag (both in Europe).", "Switzerland", ["vatican", "vatican city"]],
  ["Tetris oyununu kim yarattı?", "Alexey Pajitnov", ["pajitnov", "aleksey pajitnov", "alexey pazhitnov", "pazhitnov"], "Who created the game Tetris?", "Alexey Pajitnov", ["pajitnov", "pazhitnov", "alexey pazhitnov"]],
  ["Pac-Man oyununu hangi şirket geliştirdi?", "Namco", [], "Which company developed Pac-Man?", "Namco", []],
  ["Rubik küpünü icat eden Macar mimar ve profesör kimdir?", "Ernő Rubik", ["erno rubik", "rubik"], "Which Hungarian architect and professor invented the Rubik's Cube?", "Ernő Rubik", ["erno rubik", "rubik"]],
  ["İlk bilgisayar programcısı kabul edilen kadın matematikçi kimdir?", "Ada Lovelace", ["lovelace", "ada"], "Which woman mathematician is considered the first computer programmer?", "Ada Lovelace", ["lovelace", "ada"]],
  ["Bluetooth adı hangi Danimarkalı krala atıfla verilmiştir?", "Harald Mavidiş", ["harald", "harald bluetooth", "mavi diş"], "After which Danish king is Bluetooth named?", "Harald Bluetooth", ["harald", "harald blåtand"]],
  ["Google'ın ilk adı neydi?", "BackRub", ["back rub"], "What was Google's original name?", "BackRub", ["back rub"]],
  ["Amazon'un ilk kurulduğundaki ilk alan adı/adı neydi?", "Cadabra", ["cadabra.com"], "What was Amazon's original name when it was founded?", "Cadabra", ["cadabra.com"]],
  ["Nintendo ilk olarak hangi ürünü üreterek kuruldu?", "Oyun kartı", ["hanafuda", "iskambil kartı", "kart"], "What product did Nintendo originally make when it was founded?", "Playing cards", ["hanafuda", "cards", "card"]],
  ["LEGO adı, Danca hangi anlama gelen ifadenin kısaltmasıdır?", "İyi oyna", ["iyi oynamak", "play well"], "LEGO is short for a Danish phrase meaning what?", "Play well", ["leg godt", "play well"]],
  ["Avustralya'nın başkenti neresidir?", "Canberra", [], "What is the capital of Australia?", "Canberra", []],
  ["Brezilya'nın başkenti neresidir?", "Brasília", ["brasilia"], "What is the capital of Brazil?", "Brasília", ["brasilia"]],
  ["Kanada'nın başkenti neresidir?", "Ottawa", [], "What is the capital of Canada?", "Ottawa", []],
  ["Yeni Zelanda'nın başkenti neresidir?", "Wellington", [], "What is the capital of New Zealand?", "Wellington", []],
  ["İsviçre'nin başkenti (federal şehir) neresidir?", "Bern", ["berne"], "What is the capital (federal city) of Switzerland?", "Bern", ["berne"]],
  ["Nijerya'nın başkenti neresidir?", "Abuja", [], "What is the capital of Nigeria?", "Abuja", []],
  ["Myanmar'ın başkenti neresidir?", "Naypyidaw", ["nay pyi taw", "naypyitaw"], "What is the capital of Myanmar?", "Naypyidaw", ["nay pyi taw", "naypyitaw"]],
  ["Türkiye'nin en uzun nehri hangisidir?", "Kızılırmak", ["kizilirmak"], "Which is the longest river in Turkey?", "Kızılırmak", ["kizilirmak"]],
  ["Coca-Cola'nın mucidi olan eczacı kimdir?", "John Pemberton", ["pemberton"], "Which pharmacist invented Coca-Cola?", "John Pemberton", ["pemberton"]],
];
function bluffQuestions(): Question[] {
  return BLUFF.map(([tr, a, acc, en, ea, eacc], i) => ({
    id: `fun-bluff-${i}`, category: FUN_CATS.bluff, difficulty: 2 as const, kind: "open" as const, text: tr, correct: a, accepted: acc,
    status: "approved" as const, reports: 0, en: { text: en, correct: ea, accepted: eacc },
  }));
}

// ---------- Eğlence tahmini ----------
// [TR metin, EN metin, cevap, TR açıklama, EN açıklama]
type G = [string, string, number, string, string];
const GUESS: G[] = [
  ["Everest Dağı'nın yüksekliği kaç metredir?", "How many metres tall is Mount Everest?", 8849, "Yaklaşık 8.849 m (2020'de Nepal ve Çin'in ortak ölçümü).", "About 8,849 m (joint Nepal–China measurement, 2020)."],
  ["Ay'a ortalama uzaklık kaç kilometredir?", "What is the average distance to the Moon in kilometres?", 384400, "Ortalama yaklaşık 384.400 km.", "About 384,400 km on average."],
  ["Dünya'nın ekvator çevresi kaç kilometredir?", "What is Earth's circumference at the equator in kilometres?", 40075, "Yaklaşık 40.075 km.", "About 40,075 km."],
  ["Burj Khalifa kaç metre yüksekliğindedir?", "How tall is the Burj Khalifa in metres?", 828, "828 m.", "828 m."],
  ["Yetişkin bir insanın vücudunda kaç kemik vardır?", "How many bones does an adult human have?", 206, "206 kemik.", "206 bones."],
  ["Işığın boşluktaki hızı saniyede yaklaşık kaç kilometredir?", "About how many kilometres per second does light travel in a vacuum?", 299792, "Yaklaşık 299.792 km/sn.", "About 299,792 km/s."],
  ["Dünya'nın yaşı yaklaşık kaç milyon yıldır?", "About how many million years old is Earth?", 4540, "Yaklaşık 4,54 milyar yıl.", "About 4.54 billion years."],
  ["Güneş'e ortalama uzaklığımız yaklaşık kaç milyon kilometredir?", "About how many million kilometres is Earth from the Sun on average?", 150, "Yaklaşık 149,6 milyon km.", "About 149.6 million km."],
  ["Periyodik tabloda kaç element vardır?", "How many elements are in the periodic table?", 118, "118 element.", "118 elements."],
  ["Bir yetişkinin (yirmi yaş dişleri dahil) kaç dişi vardır?", "How many teeth does an adult have (wisdom teeth included)?", 32, "32 diş.", "32 teeth."],
  ["Standart bir Rubik küpünde dışarıdan görünen kaç renkli kare vardır?", "How many coloured squares are visible on a standard Rubik's Cube?", 54, "6 yüz × 9 kare = 54.", "6 faces × 9 squares = 54."],
  ["Angel Şelalesi (Venezuela) kaç metre yüksekliğindedir?", "How tall is Angel Falls in Venezuela in metres?", 979, "979 m, dünyanın en yüksek şelalesi.", "979 m, the world's tallest waterfall."],
  ["Mariana Çukuru'nun en derin noktası (Challenger Deep) yaklaşık kaç metre derinliktedir?", "About how deep in metres is the Challenger Deep in the Mariana Trench?", 10935, "Yaklaşık 10.935 m.", "About 10,935 m."],
  ["Türkiye'nin yüzölçümü kaç kilometrekaredir?", "What is Turkey's area in square kilometres?", 783562, "783.562 km² (göller dahil).", "783,562 km² (including lakes)."],
  ["Ağrı Dağı kaç metre yüksekliğindedir?", "How tall is Mount Ağrı (Ararat) in metres?", 5137, "5.137 m.", "5,137 m."],
  ["Giza'daki Büyük Piramit'in özgün yüksekliği yaklaşık kaç metredir?", "What was the original height of the Great Pyramid of Giza in metres (approx.)?", 146, "Yaklaşık 146,6 m.", "About 146.6 m."],
  ["Beethoven toplam kaç senfoni besteledi?", "How many symphonies did Beethoven compose?", 9, "9 senfoni.", "9 symphonies."],
  ["Mars'ın kaç doğal uydusu vardır?", "How many natural moons does Mars have?", 2, "Phobos ve Deimos.", "Phobos and Deimos."],
  ["Bir tavla oyununda toplam kaç pul bulunur?", "How many checkers are there in total in a backgammon game?", 30, "Her oyuncuda 15, toplam 30.", "15 per player, 30 in total."],
  ["İstanbul'un kaç ilçesi vardır?", "How many districts does Istanbul have?", 39, "39 ilçe.", "39 districts."],
];
function guessQuestions(): Question[] {
  return GUESS.map(([tr, en, v, xtr, xen], i) => ({
    id: `fun-guess-${i}`, category: FUN_CATS.guess, difficulty: 2 as const, kind: "estimate" as const, text: tr, correct: String(v), accepted: [],
    explanation: xtr, status: "approved" as const, reports: 0, en: { text: en, correct: String(v), explanation: xen },
  }));
}

export const FUN_BANK: Question[] = [...emojiQuestions(), ...funnyQuestions(), ...bluffQuestions(), ...guessQuestions()];

// ---------- Ana havuzdan türetilen sahte cevap ve tahmin soruları ----------
const numeric = (v: string) => /^-?\d+$/.test(v.trim());
const BAD_TEXT = /^\d{3,4} yılında|yılında doğan|aşağıdaki|hangisi\b|hangileri|hangi biri|doğru olan|yanlış olan|hangi.*arasında/i;
/** Şıklı/açık sorulardan "açık uçlu" sahte cevap soruları: aynı kimlik (görülmüş sayılır), kategori "Sahte Cevap", altkonu özgün kategori. */
export function deriveBluff(bank: Question[]): Question[] {
  const seen = new Set<string>(); const out: Question[] = [];
  for (const q of bank) {
    if ((q.kind !== "choice" && q.kind !== "open") || !q.en || FUN_CAT_SET.has(q.category)) continue;
    const a = q.correct.trim();
    if (!/\p{L}/u.test(a) || numeric(a) || a.length < 3 || a.length > 36 || q.text.length > 150 || BAD_TEXT.test(q.text) || a.includes("[")) continue;
    if ((q.en.correct ?? "").length < 2) continue;
    const key = normalizeTr(q.text); if (seen.has(key)) continue; seen.add(key);
    out.push({
      id: q.id, category: FUN_CATS.bluff, subtopic: `${q.category}/${q.subtopic ?? "-"}`, difficulty: q.difficulty, kind: "open",
      text: q.text, correct: q.correct, accepted: q.accepted ?? [], explanation: q.explanation, status: "approved", reports: 0,
      en: { text: q.en.text, correct: q.en.correct, accepted: q.en.accepted ?? [], explanation: q.en.explanation },
    });
  }
  return out;
}
/** Sayısal cevaplı sorulardan (yıl, adet) "en yakın tahmin kazanır" soruları. */
export function deriveGuess(bank: Question[]): Question[] {
  const seen = new Set<string>(); const out: Question[] = [];
  for (const q of bank) {
    if ((q.kind !== "choice" && q.kind !== "open") || !q.en || FUN_CAT_SET.has(q.category)) continue;
    if (!numeric(q.correct) || !/hangi yıl|kaç/i.test(q.text) || /plaka|atom numarası|kaçıncı|sıra/i.test(q.text) || q.text.length > 140) continue;
    const v = Number(q.correct); if (!Number.isInteger(v) || Math.abs(v) > 1e9) continue;
    const key = normalizeTr(q.text); if (seen.has(key)) continue; seen.add(key);
    out.push({
      id: q.id, category: FUN_CATS.guess, subtopic: `${q.category}/${q.subtopic ?? "-"}`, difficulty: q.difficulty, kind: "estimate",
      text: `${q.text} (En yakın tahmin kazanır)`, correct: q.correct, accepted: [], explanation: q.explanation, status: "approved", reports: 0,
      en: { text: `${q.en.text} (The closest estimate wins)`, correct: q.correct, explanation: q.en.explanation },
    });
  }
  return out;
}
