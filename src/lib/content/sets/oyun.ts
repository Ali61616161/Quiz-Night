import type { FactSet, SingleSet } from "../gen";

// oyun|geliştirici|yıl ("-" = soru atlanır)
const GAMES = [
  "Pac-Man|Namco|1980", "Super Mario Bros.|Nintendo|1985", "Tetris|Alexey Pajitnov;Aleksey Pajitnov|1984", "The Legend of Zelda|Nintendo|1986", "Sonic the Hedgehog|Sega|1991", "Street Fighter II|Capcom|1991", "Doom|id Software|1993",
  "Half-Life|Valve|1998", "Grand Theft Auto V|Rockstar Games;Rockstar North|2013", "Minecraft|Mojang|-", "The Witcher 3: Wild Hunt|CD Projekt RED;CD Projekt|2015", "The Elder Scrolls V: Skyrim|Bethesda Game Studios;Bethesda|2011", "Fortnite|Epic Games|2017",
  "League of Legends|Riot Games;Riot|2009", "Dota 2|Valve|2013", "World of Warcraft|Blizzard Entertainment;Blizzard|2004", "StarCraft|Blizzard Entertainment;Blizzard|1998", "Diablo|Blizzard Entertainment;Blizzard|1996", "Overwatch|Blizzard Entertainment;Blizzard|2016",
  "The Sims|Maxis|2000", "SimCity|Maxis|1989", "Civilization|MicroProse|1991", "Age of Empires|Ensemble Studios|1997", "Red Dead Redemption 2|Rockstar Games;Rockstar|2018", "Portal|Valve|2007", "Left 4 Dead|Valve|2008", "Among Us|Innersloth|2018",
  "Fall Guys|Mediatonic|2020", "Angry Birds|Rovio|2009", "Candy Crush Saga|King|2012", "Pokémon Kırmızı ve Yeşil|Game Freak|1996", "Pokémon GO|Niantic|2016", "Call of Duty|Infinity Ward|2003", "Battlefield 1942|DICE|2002", "Assassin's Creed|Ubisoft Montreal;Ubisoft|2007",
  "Far Cry|Crytek|2004", "Crysis|Crytek|2007", "Resident Evil|Capcom|1996", "Silent Hill|Konami|1999", "Metal Gear Solid|Konami|1998", "Final Fantasy|Square|1987", "Dragon Quest|Enix|1986", "Donkey Kong|Nintendo|1981", "Mario Kart|Nintendo|1992",
  "Animal Crossing|Nintendo|2001", "Metroid|Nintendo|1986", "Mega Man|Capcom|1987", "Prince of Persia|Jordan Mechner|1989", "Lemmings|DMA Design|1991", "Worms|Team17|1995", "Tomb Raider|Core Design|1996", "Need for Speed|Electronic Arts;EA|1994",
  "Rocket League|Psyonix|2015", "Valorant|Riot Games;Riot|2020", "Genshin Impact|miHoYo|2020", "Elden Ring|FromSoftware|2022", "Dark Souls|FromSoftware|2011", "The Last of Us|Naughty Dog|2013", "God of War (2018)|Santa Monica Studio|2018",
  "Halo: Combat Evolved|Bungie|2001", "Gears of War|Epic Games|2006", "Mass Effect|BioWare|2007", "Baldur's Gate 3|Larian Studios;Larian|2023", "Cyberpunk 2077|CD Projekt RED;CD Projekt|2020", "Hades|Supergiant Games|2020", "Stardew Valley|ConcernedApe|2016",
  "Terraria|Re-Logic|2011", "Undertale|Toby Fox|2015", "Hollow Knight|Team Cherry|2017", "Celeste|Maddy Makes Games|2018", "BioShock|Irrational Games;2K Boston|2007", "Fallout 3|Bethesda Game Studios;Bethesda|2008", "Hearthstone|Blizzard Entertainment;Blizzard|2014",
  "Clash of Clans|Supercell|2012", "Clash Royale|Supercell|2016", "Brawl Stars|Supercell|2018", "Apex Legends|Respawn Entertainment;Respawn|2019", "Rainbow Six Siege|Ubisoft Montreal;Ubisoft|2015", "Team Fortress 2|Valve|2007", "Garry's Mod|Facepunch Studios;Facepunch|2006",
  "Counter-Strike: Global Offensive|Valve|2012", "Portal 2|Valve|2011", "Warcraft III|Blizzard Entertainment;Blizzard|2002", "Super Smash Bros.|HAL Laboratory|1999", "Kirby'nin Rüya Diyarı|HAL Laboratory|1992", "Crash Bandicoot|Naughty Dog|1996", "Spyro the Dragon|Insomniac Games|1998",
];
// konsol|şirket|çıkış yılı
const CONSOLES = ["PlayStation|Sony|1994", "PlayStation 2|Sony|2000", "PlayStation 3|Sony|2006", "PlayStation 4|Sony|2013", "PlayStation 5|Sony|2020", "Xbox|Microsoft|2001", "Xbox 360|Microsoft|2005", "Xbox One|Microsoft|2013", "Xbox Series X|Microsoft|2020",
  "Nintendo 64|Nintendo|1996", "GameCube|Nintendo|2001", "Wii|Nintendo|2006", "Wii U|Nintendo|2012", "Nintendo Switch|Nintendo|2017", "Game Boy|Nintendo|1989", "Nintendo DS|Nintendo|2004", "Dreamcast|Sega|1998", "Atari 2600|Atari|1977", "Steam Deck|Valve|2022"];
// karakter|oyun serisi
const CHARS = ["Mario|Super Mario", "Luigi|Super Mario", "Bowser|Super Mario", "Link|The Legend of Zelda", "Prenses Zelda|The Legend of Zelda", "Ganon|The Legend of Zelda", "Sonic|Sonic the Hedgehog", "Lara Croft|Tomb Raider", "Kratos|God of War", "Master Chief|Halo",
  "Geralt of Rivia|The Witcher", "Cloud Strife|Final Fantasy VII", "Solid Snake|Metal Gear", "Gordon Freeman|Half-Life", "Samus Aran|Metroid", "Crash Bandicoot|Crash Bandicoot", "Ezio Auditore|Assassin's Creed", "Nathan Drake|Uncharted", "Arthur Morgan|Red Dead Redemption 2",
  "Ryu|Street Fighter", "Pikachu|Pokémon", "Kirby|Kirby", "Yoshi|Super Mario", "Donkey Kong|Donkey Kong", "Isaac Clarke|Dead Space", "Ellie|The Last of Us", "Steve|Minecraft", "Pac-Man|Pac-Man", "Dante|Devil May Cry"];

export const OYUN: FactSet[] = [
  { id: "oyun", cat: "Oyun", sub: "Video oyunları", diff: 2, rows: GAMES, asks: [
    { t: "{0} oyununu geliştiren stüdyo/kişi kimdir?", a: 1, by: [0], choice: true },
    { t: "{0} oyunu hangi yıl çıkmıştır?", a: 2, by: [0], num: true },
  ] },
  { id: "konsol", cat: "Oyun", sub: "Konsollar", diff: 2, rows: CONSOLES, asks: [
    { t: "{0} hangi şirketin oyun konsoludur?", a: 1, by: [0], choice: true },
    { t: "{0} hangi yıl piyasaya çıkmıştır?", a: 2, by: [0], num: true },
  ] },
  { id: "oyunkarakter", cat: "Oyun", sub: "Karakterler", diff: 1, rows: CHARS, asks: [{ t: "{0} hangi oyun serisinin karakteridir?", a: 1, by: [0], choice: true }] },
];

export const OYUN_SINGLES: SingleSet[] = [{
  id: "oyn1", cat: "Oyun", sub: "Genel oyun", diff: 1, rows: [
    "Satranç tahtasında kaç kare vardır?|64|altmış dört|32;81;100",
    "Satrançta her oyuncunun başlangıçta kaç taşı vardır?|16|on altı|12;14;18",
    "Satrançta oyunu bitiren duruma ne denir?|Şah mat|Mat|Pat;Rok;Tempo",
    "Satrançta hiçbir taşın hareket edememesi ve şahın tehdit altında olmaması durumuna ne denir?|Pat||Mat;Rok;Gambit",
    "Satrançta kaleyle şahın aynı hamlede yer değiştirmesine ne denir?|Rok||Pat;Mat;Gambit",
    "Tavlada her oyuncunun kaç pulu vardır?|15|on beş|12;16;20",
    "Tavlada tahtada toplam kaç üçgen (nokta) bulunur?|24|yirmi dört|12;20;30",
    "Standart okey setinde kaç taş bulunur?|106|yüz altı|104;108;112",
    "Standart bir iskambil destesinde kaç kağıt bulunur (jokersiz)?|52|elli iki|48;54;56",
    "İskambil destesinde kaç farklı takım (renk/sembol) vardır?|4|dört|2;3;5",
    "Blackjack oyununda hedef sayı kaçtır?|21|yirmi bir|18;20;25",
    "Domino setinde (çift altılı) kaç taş vardır?|28|yirmi sekiz|24;32;36",
    "Bir zarın altı yüzündeki sayıların toplamı kaçtır?|21|yirmi bir|18;24;36",
    "Rubik küpünün bir yüzünde kaç küçük kare bulunur (3x3)?|9|dokuz|6;12;16",
    "Rubik küpünü icat eden kişi kimdir?|Ernő Rubik|Rubik|Rubik Brothers;Alexey Pajitnov;Gary Gygax",
    "Sudoku bulmacasında kaç hücre vardır?|81|seksen bir|64;100;72",
    "Monopoly oyununda başlangıç karesinin adı nedir?|Başla|Go|Hapis;Şans;Vergi",
    "Scrabble oyununda amaç nedir?|Harf karolarıyla kelime oluşturmak|Kelime yapmak|Kart toplamak;Zar atmak;Taş dizmek",
    "Bilardoda 8 numaralı top hangi renktedir?|Siyah||Kırmızı;Mavi;Mor",
    "Bowlingde bir sıra için kaç labut devrilmeye çalışılır?|10|on|8;12;6",
    "Dartta tam merkez (boğa gözü) kaç puandır?|50|elli|25;100;60",
    "Pokémon'da Pikachu hangi tür Pokémon'dur?|Elektrik||Ateş;Su;Çimen",
    "Among Us oyununda sahtekârlara ne denir?|Impostor|Sahtekâr|Crewmate;Ghost;Killer",
    "Fortnite hangi oyun türüne örnektir?|Battle royale|Hayatta kalma|Satranç;Spor;Yarış",
    "LEGO hangi ülkede kurulmuştur?|Danimarka||Almanya;İsveç;Hollanda",
    "Pac-Man hangi ülkenin oyunudur?|Japonya||ABD;Kore;İngiltere",
    "Tetris hangi ülkede geliştirilmiştir?|Rusya|Sovyetler Birliği|Japonya;ABD;Polonya",
    "Angry Birds hangi ülke yapımıdır?|Finlandiya||İsveç;Danimarka;Norveç",
    "PlayStation'ı hangi şirket üretir?|Sony||Nintendo;Sega;Microsoft",
    "Xbox'ı hangi şirket üretir?|Microsoft||Sony;Nintendo;Valve",
    "Steam hangi şirkete aittir?|Valve||Epic Games;EA;Ubisoft",
    "Esporda 'The International' hangi oyunun şampiyonasıdır?|Dota 2||League of Legends;Counter-Strike;Valorant",
    "League of Legends Dünya Şampiyonası'nın adı nedir?|Worlds|Dünya Şampiyonası|The International;Major;Blast",
    "Süper Mario'da kurtarılması gereken prenses kimdir?|Prenses Peach|Peach|Prenses Zelda;Daisy;Rosalina",
  ],
}];
