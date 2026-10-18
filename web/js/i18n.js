// Interface texts, book names and Greek grammar labels in English, Polish and Italian.

export const LANGS = ["en", "pl", "it"];
export const LANG_NAMES = { en: "English", pl: "Polski", it: "Italiano", grc: "Ελληνικά" };
export const LANG_SHORT = { en: "EN", pl: "PL", it: "IT", grc: "GRC" };

export const UI = {
  en: {
    tagline: "The Gospel of the day, word by word with the Greek original",
    today: "Today",
    prevDay: "Previous day",
    nextDay: "Next day",
    gospel: "Gospel",
    year: "Year",
    weekdayCycle: "Weekday cycle",
    viewRead: "Reading",
    viewParallel: "Parallel",
    showGreek: "Greek under each verse",
    noGospelTitle: "This day is not in the proof of concept yet",
    noGospel: "The proof of concept contains the Gospels from 18 to 25 October 2026. Pick one of these days:",
    loading: "Loading…",
    tapHint: "Tap any word to see the Greek original.",
    greekWord: "Greek word",
    dictionaryForm: "Dictionary form",
    grammar: "Grammar",
    meaning: "Meaning",
    inThisVerse: "In this verse",
    otherUses: "Other occurrences",
    timesInNT: (n) => `${n} ${n === 1 ? "time" : "times"} in the New Testament`,
    showAll: "Show all occurrences",
    noGreekTitle: "No Greek word",
    noGreek: "No Greek word stands behind this word. The translator added it to make the sentence natural in this language (in the Wujek translation it may also come from the Latin Vulgate).",
    close: "Close",
    back: "Back",
    translatedAs: "How the aligned passages translate it",
    thisGospel: "today's Gospel",
    expand: "Show verses",
    notAvailable: "(verse not available in this translation)",
    notAligned: "Word links for this verse are not ready yet.",
    alsoLinked: "This word translates several Greek words:",
    sources: "Sources",
    origin: { lat: "Latin loanword", arc: "Aramaic word", heb: "Hebrew word", sem: "Semitic loanword" },
    translations: { en: "World English Bible, Catholic edition (public domain)", pl: "Biblia Jakuba Wujka, 1923 edition (public domain)", it: "Riveduta 1927 (public domain)", grc: "SBL Greek New Testament with MorphGNT tagging" },
  },
  pl: {
    tagline: "Ewangelia dnia, słowo po słowie z greckim oryginałem",
    today: "Dzisiaj",
    prevDay: "Poprzedni dzień",
    nextDay: "Następny dzień",
    gospel: "Ewangelia",
    year: "Rok",
    weekdayCycle: "Cykl dni powszednich",
    viewRead: "Czytanie",
    viewParallel: "Równolegle",
    showGreek: "Grecki pod każdym wersetem",
    noGospelTitle: "Tego dnia nie ma jeszcze w wersji próbnej",
    noGospel: "Wersja próbna zawiera Ewangelie od 18 do 25 października 2026. Wybierz jeden z tych dni:",
    loading: "Wczytywanie…",
    tapHint: "Dotknij dowolnego słowa, aby zobaczyć grecki oryginał.",
    greekWord: "Słowo greckie",
    dictionaryForm: "Forma słownikowa",
    grammar: "Gramatyka",
    meaning: "Znaczenie",
    inThisVerse: "W tym wersecie",
    otherUses: "Inne wystąpienia",
    timesInNT: (n) => `${n} ${n === 1 ? "raz" : "razy"} w Nowym Testamencie`,
    showAll: "Pokaż wszystkie wystąpienia",
    noGreekTitle: "Brak słowa greckiego",
    noGreek: "Za tym słowem nie stoi żadne słowo greckie. Tłumacz dodał je, aby zdanie brzmiało naturalnie w tym języku (u Wujka może też pochodzić z łacińskiej Wulgaty).",
    close: "Zamknij",
    back: "Wstecz",
    translatedAs: "Jak tłumaczą to opracowane fragmenty",
    thisGospel: "dzisiejsza Ewangelia",
    expand: "Pokaż wersety",
    notAvailable: "(brak wersetu w tym przekładzie)",
    notAligned: "Powiązania słów dla tego wersetu nie są jeszcze gotowe.",
    alsoLinked: "To słowo tłumaczy kilka słów greckich:",
    sources: "Źródła",
    origin: { lat: "Zapożyczenie z łaciny", arc: "Słowo aramejskie", heb: "Słowo hebrajskie", sem: "Zapożyczenie semickie" },
    translations: { en: "World English Bible, wydanie katolickie (domena publiczna)", pl: "Biblia Jakuba Wujka, wydanie z 1923 r. (domena publiczna)", it: "Riveduta 1927 (domena publiczna)", grc: "SBL Greek New Testament z analizą MorphGNT" },
  },
  it: {
    tagline: "Il Vangelo del giorno, parola per parola con l'originale greco",
    today: "Oggi",
    prevDay: "Giorno precedente",
    nextDay: "Giorno successivo",
    gospel: "Vangelo",
    year: "Anno",
    weekdayCycle: "Ciclo feriale",
    viewRead: "Lettura",
    viewParallel: "Parallelo",
    showGreek: "Greco sotto ogni versetto",
    noGospelTitle: "Questo giorno non è ancora nel prototipo",
    noGospel: "Il prototipo contiene i Vangeli dal 18 al 25 ottobre 2026. Scegli uno di questi giorni:",
    loading: "Caricamento…",
    tapHint: "Tocca una parola per vedere l'originale greco.",
    greekWord: "Parola greca",
    dictionaryForm: "Forma del dizionario",
    grammar: "Grammatica",
    meaning: "Significato",
    inThisVerse: "In questo versetto",
    otherUses: "Altre occorrenze",
    timesInNT: (n) => `${n} ${n === 1 ? "volta" : "volte"} nel Nuovo Testamento`,
    showAll: "Mostra tutte le occorrenze",
    noGreekTitle: "Nessuna parola greca",
    noGreek: "Dietro questa parola non c'è nessuna parola greca. Il traduttore l'ha aggiunta perché la frase suoni naturale in questa lingua.",
    close: "Chiudi",
    back: "Indietro",
    translatedAs: "Come la traducono i brani allineati",
    thisGospel: "Vangelo di oggi",
    expand: "Mostra i versetti",
    notAvailable: "(versetto assente in questa traduzione)",
    notAligned: "I collegamenti delle parole per questo versetto non sono ancora pronti.",
    alsoLinked: "Questa parola traduce più parole greche:",
    sources: "Fonti",
    origin: { lat: "Prestito dal latino", arc: "Parola aramaica", heb: "Parola ebraica", sem: "Prestito semitico" },
    translations: { en: "World English Bible, edizione cattolica (pubblico dominio)", pl: "Biblia Jakuba Wujka, edizione 1923 (pubblico dominio)", it: "Riveduta 1927 (pubblico dominio)", grc: "SBL Greek New Testament con analisi MorphGNT" },
  },
};

// Book names and abbreviations, in the order of web/data/text/*.json codes.
export const BOOKS = {
  codes: ["Mt", "Mk", "Lk", "Jn", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess",
    "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1Jn", "2Jn", "3Jn", "Jude", "Rev"],
  abbr: {
    en: ["Mt", "Mk", "Lk", "Jn", "Acts", "Rom", "1 Cor", "2 Cor", "Gal", "Eph", "Phil", "Col", "1 Thess", "2 Thess",
      "1 Tim", "2 Tim", "Titus", "Phlm", "Heb", "Jas", "1 Pet", "2 Pet", "1 Jn", "2 Jn", "3 Jn", "Jude", "Rev"],
    pl: ["Mt", "Mk", "Łk", "J", "Dz", "Rz", "1 Kor", "2 Kor", "Ga", "Ef", "Flp", "Kol", "1 Tes", "2 Tes",
      "1 Tm", "2 Tm", "Tt", "Flm", "Hbr", "Jk", "1 P", "2 P", "1 J", "2 J", "3 J", "Jud", "Ap"],
    it: ["Mt", "Mc", "Lc", "Gv", "At", "Rm", "1 Cor", "2 Cor", "Gal", "Ef", "Fil", "Col", "1 Ts", "2 Ts",
      "1 Tm", "2 Tm", "Tt", "Fm", "Eb", "Gc", "1 Pt", "2 Pt", "1 Gv", "2 Gv", "3 Gv", "Gd", "Ap"],
  },
  name: {
    en: ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
      "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy",
      "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"],
    pl: ["Ewangelia wg św. Mateusza", "Ewangelia wg św. Marka", "Ewangelia wg św. Łukasza", "Ewangelia wg św. Jana",
      "Dzieje Apostolskie", "List do Rzymian", "1 List do Koryntian", "2 List do Koryntian", "List do Galatów",
      "List do Efezjan", "List do Filipian", "List do Kolosan", "1 List do Tesaloniczan", "2 List do Tesaloniczan",
      "1 List do Tymoteusza", "2 List do Tymoteusza", "List do Tytusa", "List do Filemona", "List do Hebrajczyków",
      "List św. Jakuba", "1 List św. Piotra", "2 List św. Piotra", "1 List św. Jana", "2 List św. Jana",
      "3 List św. Jana", "List św. Judy", "Apokalipsa św. Jana"],
    it: ["Vangelo secondo Matteo", "Vangelo secondo Marco", "Vangelo secondo Luca", "Vangelo secondo Giovanni",
      "Atti degli Apostoli", "Lettera ai Romani", "Prima lettera ai Corinzi", "Seconda lettera ai Corinzi",
      "Lettera ai Galati", "Lettera agli Efesini", "Lettera ai Filippesi", "Lettera ai Colossesi",
      "Prima lettera ai Tessalonicesi", "Seconda lettera ai Tessalonicesi", "Prima lettera a Timoteo",
      "Seconda lettera a Timoteo", "Lettera a Tito", "Lettera a Filemone", "Lettera agli Ebrei", "Lettera di Giacomo",
      "Prima lettera di Pietro", "Seconda lettera di Pietro", "Prima lettera di Giovanni", "Seconda lettera di Giovanni",
      "Terza lettera di Giovanni", "Lettera di Giuda", "Apocalisse"],
  },
};

export function bookAbbr(code, lang) {
  return BOOKS.abbr[lang][BOOKS.codes.indexOf(code)];
}

export function bookName(code, lang) {
  return BOOKS.name[lang][BOOKS.codes.indexOf(code)];
}

// MorphGNT codes: 2-character part of speech + 8 parsing positions
// (person, tense, voice, mood, case, number, gender, degree); "." = not applicable.
const MORPH = {
  en: {
    pos: { "A.": "adjective", "C.": "conjunction", "D.": "adverb", "I.": "interjection", "N.": "noun", "P.": "preposition", RA: "article", RD: "demonstrative pronoun", RI: "interrogative/indefinite pronoun", RP: "personal pronoun", RR: "relative pronoun", "V.": "verb", "X.": "particle" },
    person: { 1: "1st person", 2: "2nd person", 3: "3rd person" },
    tense: { P: "present", I: "imperfect", F: "future", A: "aorist", X: "perfect", Y: "pluperfect" },
    voice: { A: "active", M: "middle", P: "passive" },
    mood: { I: "indicative", D: "imperative", S: "subjunctive", O: "optative", N: "infinitive", P: "participle" },
    case: { N: "nominative", G: "genitive", D: "dative", A: "accusative", V: "vocative" },
    number: { S: "singular", P: "plural" },
    gender: { M: "masculine", F: "feminine", N: "neuter" },
    degree: { C: "comparative", S: "superlative" },
  },
  pl: {
    pos: { "A.": "przymiotnik", "C.": "spójnik", "D.": "przysłówek", "I.": "wykrzyknik", "N.": "rzeczownik", "P.": "przyimek", RA: "rodzajnik", RD: "zaimek wskazujący", RI: "zaimek pytający/nieokreślony", RP: "zaimek osobowy", RR: "zaimek względny", "V.": "czasownik", "X.": "partykuła" },
    person: { 1: "1. osoba", 2: "2. osoba", 3: "3. osoba" },
    tense: { P: "czas teraźniejszy", I: "imperfectum", F: "czas przyszły", A: "aoryst", X: "perfectum", Y: "plusquamperfectum" },
    voice: { A: "strona czynna", M: "strona medialna", P: "strona bierna" },
    mood: { I: "tryb oznajmujący", D: "tryb rozkazujący", S: "koniunktiwus", O: "optatiwus", N: "bezokolicznik", P: "imiesłów" },
    case: { N: "mianownik", G: "dopełniacz", D: "celownik", A: "biernik", V: "wołacz" },
    number: { S: "liczba pojedyncza", P: "liczba mnoga" },
    gender: { M: "rodzaj męski", F: "rodzaj żeński", N: "rodzaj nijaki" },
    degree: { C: "stopień wyższy", S: "stopień najwyższy" },
  },
  it: {
    pos: { "A.": "aggettivo", "C.": "congiunzione", "D.": "avverbio", "I.": "interiezione", "N.": "sostantivo", "P.": "preposizione", RA: "articolo", RD: "pronome dimostrativo", RI: "pronome interrogativo/indefinito", RP: "pronome personale", RR: "pronome relativo", "V.": "verbo", "X.": "particella" },
    person: { 1: "1ª persona", 2: "2ª persona", 3: "3ª persona" },
    tense: { P: "presente", I: "imperfetto", F: "futuro", A: "aoristo", X: "perfetto", Y: "piuccheperfetto" },
    voice: { A: "attivo", M: "medio", P: "passivo" },
    mood: { I: "indicativo", D: "imperativo", S: "congiuntivo", O: "ottativo", N: "infinito", P: "participio" },
    case: { N: "nominativo", G: "genitivo", D: "dativo", A: "accusativo", V: "vocativo" },
    number: { S: "singolare", P: "plurale" },
    gender: { M: "maschile", F: "femminile", N: "neutro" },
    degree: { C: "comparativo", S: "superlativo" },
  },
};

export function describeMorph(code, lang) {
  const t = MORPH[lang];
  const pos = code.slice(0, 2);
  const [person, tense, voice, mood, kase, number, gender, degree] = code.slice(2);
  const parts = [t.pos[pos] || pos];
  if (tense !== ".") parts.push(t.tense[tense]);
  if (voice !== ".") parts.push(t.voice[voice]);
  if (mood !== ".") parts.push(t.mood[mood]);
  if (person !== ".") parts.push(t.person[person]);
  if (kase !== ".") parts.push(t.case[kase]);
  if (number !== ".") parts.push(t.number[number]);
  if (gender !== ".") parts.push(t.gender[gender]);
  if (degree !== ".") parts.push(t.degree[degree]);
  return parts.filter(Boolean).join(" · ");
}
