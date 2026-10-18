// Liturgical calendar of the Roman Rite (General Roman Calendar, simplified for the proof of concept).
//
// liturgicalDay("2026-10-18") ->
//   { date, season, week, weekday, key: "OT29-0-A", rank, color,
//     cycle: { sunday: "A", weekday: "II" }, names: { en, pl, it } }
//
// `key` identifies the day in the lectionary (data-src/lectionary.json).
// Not handled yet: national calendars (Epiphany/Ascension/Corpus Christi moved to Sunday,
// national patrons), memorials, and most rare collision/transfer rules.

const DAY = 86400000;

export function parseDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / DAY;
}

export function formatDate(n) {
  return new Date(n * DAY).toISOString().slice(0, 10);
}

const weekdayOf = (n) => new Date(n * DAY).getUTCDay(); // 0 = Sunday
const ymd = (y, m, d) => Date.UTC(y, m - 1, d) / DAY;

export function easter(year) {
  // Anonymous Gregorian algorithm
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(year, month, day);
}

export function firstAdventSunday(year) {
  const dec24 = ymd(year, 12, 24);
  return dec24 - weekdayOf(dec24) - 21;
}

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV",
  "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI", "XXVII", "XXVIII", "XXIX",
  "XXX", "XXXI", "XXXII", "XXXIII", "XXXIV"];

function ordinalEn(n) {
  const s = n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th";
  return n + s;
}

const WEEKDAYS = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  pl: ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"],
  it: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
};
const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  pl: ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"],
  it: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
};

export function formatLongDate(n, lang) {
  const d = new Date(n * DAY);
  const wd = WEEKDAYS[lang][d.getUTCDay()], day = d.getUTCDate(), mon = MONTHS[lang][d.getUTCMonth()];
  if (lang === "en") return `${wd}, ${mon} ${day}, ${d.getUTCFullYear()}`;
  return `${wd.toLowerCase()}, ${day} ${mon} ${d.getUTCFullYear()}`;
}

// Names of temporal days, per language. `n` = week number, `wd` = weekday index.
const SEASON_NAMES = {
  advent: {
    sunday: { en: (n) => `${ordinalEn(n)} Sunday of Advent`, pl: (n) => `${ROMAN[n]} Niedziela Adwentu`, it: (n) => `${ROMAN[n]} Domenica di Avvento` },
    weekday: { en: (n, wd) => `${WEEKDAYS.en[wd]} of the ${ordinalEn(n)} Week of Advent`, pl: (n, wd) => `${WEEKDAYS.pl[wd]} ${ROMAN[n]} tygodnia Adwentu`, it: (n, wd) => `${WEEKDAYS.it[wd]} della ${ROMAN[n]} settimana di Avvento` },
  },
  lent: {
    sunday: { en: (n) => `${ordinalEn(n)} Sunday of Lent`, pl: (n) => `${ROMAN[n]} Niedziela Wielkiego Postu`, it: (n) => `${ROMAN[n]} Domenica di Quaresima` },
    weekday: { en: (n, wd) => `${WEEKDAYS.en[wd]} of the ${ordinalEn(n)} Week of Lent`, pl: (n, wd) => `${WEEKDAYS.pl[wd]} ${ROMAN[n]} tygodnia Wielkiego Postu`, it: (n, wd) => `${WEEKDAYS.it[wd]} della ${ROMAN[n]} settimana di Quaresima` },
  },
  easter: {
    sunday: { en: (n) => `${ordinalEn(n)} Sunday of Easter`, pl: (n) => `${ROMAN[n]} Niedziela Wielkanocna`, it: (n) => `${ROMAN[n]} Domenica di Pasqua` },
    weekday: { en: (n, wd) => `${WEEKDAYS.en[wd]} of the ${ordinalEn(n)} Week of Easter`, pl: (n, wd) => `${WEEKDAYS.pl[wd]} ${ROMAN[n]} tygodnia wielkanocnego`, it: (n, wd) => `${WEEKDAYS.it[wd]} della ${ROMAN[n]} settimana di Pasqua` },
  },
  ordinary: {
    sunday: { en: (n) => `${ordinalEn(n)} Sunday in Ordinary Time`, pl: (n) => `${ROMAN[n]} Niedziela zwykła`, it: (n) => `${ROMAN[n]} Domenica del Tempo Ordinario` },
    weekday: { en: (n, wd) => `${WEEKDAYS.en[wd]} of the ${ordinalEn(n)} Week in Ordinary Time`, pl: (n, wd) => `${WEEKDAYS.pl[wd]} ${ROMAN[n]} tygodnia zwykłego`, it: (n, wd) => `${WEEKDAYS.it[wd]} della ${ROMAN[n]} settimana del Tempo Ordinario` },
  },
};

export const SEASONS = {
  advent: { en: "Advent", pl: "Adwent", it: "Avvento" },
  christmas: { en: "Christmas Time", pl: "Okres Bożego Narodzenia", it: "Tempo di Natale" },
  lent: { en: "Lent", pl: "Wielki Post", it: "Quaresima" },
  triduum: { en: "Paschal Triduum", pl: "Triduum Paschalne", it: "Triduo pasquale" },
  easter: { en: "Easter Time", pl: "Okres Wielkanocny", it: "Tempo di Pasqua" },
  ordinary: { en: "Ordinary Time", pl: "Okres zwykły", it: "Tempo Ordinario" },
};

// Fixed-date solemnities and feasts of the General Roman Calendar.
// rank: 3 solemnity, 5 feast of the Lord, 7 feast (lower number = higher precedence).
const S = 3, FL = 5, F = 7;
const FIXED = {
  "01-25": ["conversion-paul", F, "white", "Conversion of Saint Paul the Apostle", "Nawrócenie św. Pawła Apostoła", "Conversione di San Paolo apostolo"],
  "02-02": ["presentation", FL, "white", "Presentation of the Lord", "Ofiarowanie Pańskie", "Presentazione del Signore"],
  "02-22": ["chair-peter", F, "white", "Chair of Saint Peter the Apostle", "Katedry św. Piotra Apostoła", "Cattedra di San Pietro apostolo"],
  "03-19": ["joseph", S, "white", "Saint Joseph, Spouse of the Blessed Virgin Mary", "Uroczystość św. Józefa, Oblubieńca NMP", "San Giuseppe, sposo della Beata Vergine Maria"],
  "03-25": ["annunciation", S, "white", "Annunciation of the Lord", "Zwiastowanie Pańskie", "Annunciazione del Signore"],
  "04-25": ["mark", F, "red", "Saint Mark, Evangelist", "Św. Marka, Ewangelisty", "San Marco, evangelista"],
  "05-03": ["philip-james", F, "red", "Saints Philip and James, Apostles", "Św. Apostołów Filipa i Jakuba", "Santi Filippo e Giacomo, apostoli"],
  "05-14": ["matthias", F, "red", "Saint Matthias the Apostle", "Św. Macieja Apostoła", "San Mattia, apostolo"],
  "05-31": ["visitation", F, "white", "Visitation of the Blessed Virgin Mary", "Nawiedzenie Najświętszej Maryi Panny", "Visitazione della Beata Vergine Maria"],
  "06-24": ["john-baptist", S, "white", "Nativity of Saint John the Baptist", "Narodzenie św. Jana Chrzciciela", "Natività di San Giovanni Battista"],
  "06-29": ["peter-paul", S, "red", "Saints Peter and Paul, Apostles", "Św. Apostołów Piotra i Pawła", "Santi Pietro e Paolo, apostoli"],
  "07-03": ["thomas", F, "red", "Saint Thomas the Apostle", "Św. Tomasza Apostoła", "San Tommaso, apostolo"],
  "07-22": ["mary-magdalene", F, "white", "Saint Mary Magdalene", "Św. Marii Magdaleny", "Santa Maria Maddalena"],
  "07-25": ["james", F, "red", "Saint James the Apostle", "Św. Jakuba Apostoła", "San Giacomo, apostolo"],
  "08-06": ["transfiguration", FL, "white", "Transfiguration of the Lord", "Przemienienie Pańskie", "Trasfigurazione del Signore"],
  "08-10": ["lawrence", F, "red", "Saint Lawrence, Deacon and Martyr", "Św. Wawrzyńca, diakona i męczennika", "San Lorenzo, diacono e martire"],
  "08-15": ["assumption", S, "white", "Assumption of the Blessed Virgin Mary", "Wniebowzięcie Najświętszej Maryi Panny", "Assunzione della Beata Vergine Maria"],
  "08-24": ["bartholomew", F, "red", "Saint Bartholomew the Apostle", "Św. Bartłomieja Apostoła", "San Bartolomeo, apostolo"],
  "09-08": ["nativity-mary", F, "white", "Nativity of the Blessed Virgin Mary", "Narodzenie Najświętszej Maryi Panny", "Natività della Beata Vergine Maria"],
  "09-14": ["exaltation-cross", FL, "red", "Exaltation of the Holy Cross", "Podwyższenie Krzyża Świętego", "Esaltazione della Santa Croce"],
  "09-21": ["matthew", F, "red", "Saint Matthew, Apostle and Evangelist", "Św. Mateusza, Apostoła i Ewangelisty", "San Matteo, apostolo ed evangelista"],
  "09-29": ["archangels", F, "white", "Saints Michael, Gabriel and Raphael, Archangels", "Św. Archaniołów Michała, Gabriela i Rafała", "Santi Michele, Gabriele e Raffaele, arcangeli"],
  "10-18": ["luke", F, "red", "Saint Luke the Evangelist", "Św. Łukasza Ewangelisty", "San Luca, evangelista"],
  "10-28": ["simon-jude", F, "red", "Saints Simon and Jude, Apostles", "Św. Apostołów Szymona i Judy Tadeusza", "Santi Simone e Giuda, apostoli"],
  "11-01": ["all-saints", S, "white", "All Saints", "Wszystkich Świętych", "Tutti i Santi"],
  "11-02": ["all-souls", S, "violet", "Commemoration of All the Faithful Departed", "Wspomnienie wszystkich wiernych zmarłych", "Commemorazione di tutti i fedeli defunti"],
  "11-09": ["lateran", FL, "white", "Dedication of the Lateran Basilica", "Rocznica poświęcenia Bazyliki Laterańskiej", "Dedicazione della Basilica Lateranense"],
  "11-30": ["andrew", F, "red", "Saint Andrew the Apostle", "Św. Andrzeja Apostoła", "Sant'Andrea, apostolo"],
  "12-08": ["immaculate-conception", S, "white", "Immaculate Conception of the Blessed Virgin Mary", "Niepokalane Poczęcie Najświętszej Maryi Panny", "Immacolata Concezione della Beata Vergine Maria"],
  "12-26": ["stephen", F, "red", "Saint Stephen, the First Martyr", "Św. Szczepana, pierwszego męczennika", "Santo Stefano, protomartire"],
  "12-27": ["john", F, "white", "Saint John, Apostle and Evangelist", "Św. Jana, Apostoła i Ewangelisty", "San Giovanni, apostolo ed evangelista"],
  "12-28": ["holy-innocents", F, "red", "The Holy Innocents, Martyrs", "Św. Młodzianków, męczenników", "Santi Innocenti, martiri"],
};

function celebration(id, rank, color, en, pl, it) {
  return { key: id, celebration: id, rank, color, names: { en, pl, it } };
}

// Temporal (seasonal) day for date n.
function temporal(n) {
  const date = new Date(n * DAY);
  const year = date.getUTCFullYear();
  const wd = weekdayOf(n);
  const advent1 = firstAdventSunday(year);
  const litYear = n >= advent1 ? year + 1 : year; // liturgical year is named after the year it ends
  const cycle = { sunday: "CAB"[litYear % 3], weekday: litYear % 2 ? "I" : "II" };
  const E = easter(year);
  const christmas = (y) => ymd(y, 12, 25);

  const base = { cycle, weekday: wd };
  const named = (season, week, key, rank, color, names) => ({ ...base, season, week, key, rank, color, names });
  const regular = (season, week, prefix, color) => {
    const sunday = wd === 0;
    const kind = sunday ? "sunday" : "weekday";
    const t = SEASON_NAMES[season][kind];
    const names = { en: t.en(week, wd), pl: t.pl(week, wd), it: t.it(week, wd) };
    const rank = sunday ? (season === "ordinary" ? 6 : 2) : season === "lent" ? 9 : 13;
    const key = sunday ? `${prefix}${week}-0-${cycle.sunday}` : `${prefix}${week}-${wd}`;
    return named(season, week, key, rank, color, names);
  };

  // --- Christmas Time (Dec 25 .. Baptism of the Lord)
  const epiphany = (y) => ymd(y, 1, 6);
  const baptism = (y) => epiphany(y) + (7 - weekdayOf(epiphany(y)));
  if (n >= christmas(year) || n <= baptism(year)) {
    const cy = n >= christmas(year) ? year : year - 1; // year of the Christmas that started this season
    const xmas = christmas(cy);
    const holyFamily = weekdayOf(xmas) === 0 ? ymd(cy, 12, 30) : xmas + (7 - weekdayOf(xmas));
    const ny = ymd(cy + 1, 1, 1);
    if (n === xmas) return named("christmas", 0, "christmas", 2, "white", { en: "The Nativity of the Lord (Christmas)", pl: "Uroczystość Narodzenia Pańskiego", it: "Natale del Signore" });
    if (n === holyFamily) return named("christmas", 0, `holy-family-${cycle.sunday}`, 5, "white", { en: "The Holy Family of Jesus, Mary and Joseph", pl: "Świętej Rodziny: Jezusa, Maryi i Józefa", it: "Santa Famiglia di Gesù, Maria e Giuseppe" });
    if (n === ny) return named("christmas", 0, "mary-mother-of-god", 3, "white", { en: "Mary, the Holy Mother of God", pl: "Świętej Bożej Rodzicielki Maryi", it: "Maria Santissima Madre di Dio" });
    if (n === epiphany(cy + 1)) return named("christmas", 0, "epiphany", 2, "white", { en: "The Epiphany of the Lord", pl: "Objawienie Pańskie", it: "Epifania del Signore" });
    if (n === baptism(cy + 1)) return named("christmas", 0, `baptism-${cycle.sunday}`, 5, "white", { en: "The Baptism of the Lord", pl: "Chrzest Pański", it: "Battesimo del Signore" });
    if (n < ny) {
      const day = n - xmas + 1;
      return named("christmas", 0, `christmas-octave-${day}`, 9, "white", { en: `${ordinalEn(day)} Day within the Octave of Christmas`, pl: `${day}. dzień w oktawie Narodzenia Pańskiego`, it: `${day}° giorno fra l'ottava di Natale` });
    }
    if (wd === 0) return named("christmas", 0, "christmas-sunday-2", 6, "white", { en: "2nd Sunday after the Nativity", pl: "II Niedziela po Narodzeniu Pańskim", it: "II Domenica dopo Natale" });
    const d = new Date(n * DAY);
    const label = { en: `${MONTHS.en[0]} ${d.getUTCDate()}`, pl: `${d.getUTCDate()} ${MONTHS.pl[0]}`, it: `${d.getUTCDate()} ${MONTHS.it[0]}` };
    return named("christmas", 0, `christmas-${n < epiphany(cy + 1) ? "before" : "after"}-epiphany-${d.getUTCDate()}`, 13, "white",
      { en: `Christmas Weekday (${label.en})`, pl: `Dzień powszedni okresu Narodzenia Pańskiego (${label.pl})`, it: `Feria del Tempo di Natale (${label.it})` });
  }

  // --- Advent
  if (n >= advent1) {
    const week = Math.floor((n - advent1) / 7) + 1;
    const d = new Date(n * DAY).getUTCDate();
    const color = wd === 0 && week === 3 ? "rose" : "violet";
    if (wd !== 0 && d >= 17) {
      return named("advent", week, `advent-dec-${d}`, 9, "violet", {
        en: `Advent Weekday (December ${d})`, pl: `Dzień powszedni Adwentu (${d} grudnia)`, it: `Feria di Avvento (${d} dicembre)`,
      });
    }
    return regular("advent", week, "ADV", color);
  }

  // --- Lent and Triduum
  const ash = E - 46;
  if (n >= ash && n < E) {
    if (n === E - 3) return named("triduum", 0, "holy-thursday", 1, "white", { en: "Thursday of the Lord's Supper (Holy Thursday)", pl: "Wielki Czwartek", it: "Giovedì santo" });
    if (n === E - 2) return named("triduum", 0, "good-friday", 1, "red", { en: "Friday of the Passion of the Lord (Good Friday)", pl: "Wielki Piątek Męki Pańskiej", it: "Venerdì santo" });
    if (n === E - 1) return named("triduum", 0, "holy-saturday", 1, "violet", { en: "Holy Saturday", pl: "Wielka Sobota", it: "Sabato santo" });
    if (n === ash) return named("lent", 0, "ash-wednesday", 2, "violet", { en: "Ash Wednesday", pl: "Środa Popielcowa", it: "Mercoledì delle Ceneri" });
    if (n < ash + 4) return named("lent", 0, `ash-${wd}`, 9, "violet", { en: `${WEEKDAYS.en[wd]} after Ash Wednesday`, pl: `${WEEKDAYS.pl[wd]} po Popielcu`, it: `${WEEKDAYS.it[wd]} dopo le Ceneri` });
    if (n === E - 7) return named("lent", 6, `palm-sunday-${cycle.sunday}`, 2, "red", { en: "Palm Sunday of the Passion of the Lord", pl: "Niedziela Palmowa Męki Pańskiej", it: "Domenica delle Palme e della Passione del Signore" });
    if (n > E - 7) return named("lent", 6, `holy-week-${wd}`, 2, "violet", { en: `${WEEKDAYS.en[wd]} of Holy Week`, pl: ["", "Wielki Poniedziałek", "Wielki Wtorek", "Wielka Środa"][wd], it: `${WEEKDAYS.it[wd]} santo` });
    const week = Math.floor((n - (ash + 4)) / 7) + 1;
    return regular("lent", week, "LENT", wd === 0 && week === 4 ? "rose" : "violet");
  }

  // --- Easter Time
  const pentecost = E + 49;
  if (n >= E && n <= pentecost) {
    if (n === E) return named("easter", 1, "easter-sunday", 2, "white", { en: "Easter Sunday of the Resurrection of the Lord", pl: "Niedziela Zmartwychwstania Pańskiego", it: "Domenica di Pasqua nella Risurrezione del Signore" });
    if (n < E + 7) return named("easter", 1, `easter-octave-${wd}`, 2, "white", { en: `${WEEKDAYS.en[wd]} within the Octave of Easter`, pl: `${WEEKDAYS.pl[wd]} w oktawie Wielkanocy`, it: `${WEEKDAYS.it[wd]} fra l'ottava di Pasqua` });
    if (n === E + 39) return named("easter", 6, "ascension", 2, "white", { en: "The Ascension of the Lord", pl: "Wniebowstąpienie Pańskie", it: "Ascensione del Signore" });
    if (n === pentecost) return named("easter", 8, "pentecost", 2, "red", { en: "Pentecost Sunday", pl: "Uroczystość Zesłania Ducha Świętego", it: "Domenica di Pentecoste" });
    const week = Math.floor((n - E) / 7) + 1;
    const day = regular("easter", week, "EASTER", "white");
    if (n === E + 7) day.names = { en: "2nd Sunday of Easter (Divine Mercy Sunday)", pl: "II Niedziela Wielkanocna (Miłosierdzia Bożego)", it: "II Domenica di Pasqua (della Divina Misericordia)" };
    return day;
  }

  // --- Ordinary Time
  if (n > pentecost) {
    if (n === pentecost + 7) return named("ordinary", 0, `trinity-${cycle.sunday}`, 3, "white", { en: "The Most Holy Trinity", pl: "Najświętszej Trójcy", it: "Santissima Trinità" });
    if (n === pentecost + 11) return named("ordinary", 0, `corpus-christi-${cycle.sunday}`, 3, "white", { en: "The Most Holy Body and Blood of Christ", pl: "Najświętszego Ciała i Krwi Chrystusa", it: "Santissimo Corpo e Sangue di Cristo" });
    if (n === pentecost + 19) return named("ordinary", 0, `sacred-heart-${cycle.sunday}`, 3, "white", { en: "The Most Sacred Heart of Jesus", pl: "Najświętszego Serca Pana Jezusa", it: "Sacratissimo Cuore di Gesù" });
    if (n === advent1 - 7) return named("ordinary", 34, `christ-the-king-${cycle.sunday}`, 3, "white", { en: "Our Lord Jesus Christ, King of the Universe", pl: "Jezusa Chrystusa, Króla Wszechświata", it: "Nostro Signore Gesù Cristo Re dell'Universo" });
    const week = 35 - (advent1 - (n - wd)) / 7;
    return regular("ordinary", week, "OT", "green");
  }
  // first part of Ordinary Time (after the Baptism of the Lord, before Ash Wednesday)
  const week = Math.floor((n - baptism(year)) / 7) + 1;
  return regular("ordinary", week, "OT", "green");
}

// Fixed-date celebration for date n, with the transfers needed when a solemnity is impeded.
function sanctoral(n) {
  const d = new Date(n * DAY);
  const year = d.getUTCFullYear();
  const E = easter(year);
  const key = formatDate(n).slice(5);
  const make = (k) => celebration(...FIXED[k]);

  // Saint Joseph in Holy Week -> Saturday before Palm Sunday; on a Sunday of Lent -> Monday.
  const joseph = ymd(year, 3, 19);
  let josephDay = joseph;
  if (joseph >= E - 7 && joseph < E) josephDay = E - 8;
  else if (weekdayOf(joseph) === 0) josephDay = joseph + 1;
  // Annunciation in Holy Week or the Easter Octave -> Monday after the 2nd Sunday of Easter; on a Sunday of Lent -> Monday.
  const annunciation = ymd(year, 3, 25);
  let annunciationDay = annunciation;
  if (annunciation >= E - 7 && annunciation <= E + 7) annunciationDay = E + 8;
  else if (weekdayOf(annunciation) === 0) annunciationDay = annunciation + 1;
  // Immaculate Conception on the 2nd Sunday of Advent -> Monday.
  const immaculate = ymd(year, 12, 8);
  const immaculateDay = weekdayOf(immaculate) === 0 ? immaculate + 1 : immaculate;

  if (n === josephDay) return make("03-19");
  if (n === annunciationDay) return make("03-25");
  if (n === immaculateDay) return make("12-08");
  if (["03-19", "03-25", "12-08"].includes(key)) return null;
  return FIXED[key] ? make(key) : null;
}

export function liturgicalDay(iso) {
  const n = parseDate(iso);
  const t = temporal(n);
  const s = sanctoral(n);
  const day = s && s.rank < t.rank ? { ...t, ...s, key: s.key } : t;
  return { ...day, date: iso };
}
