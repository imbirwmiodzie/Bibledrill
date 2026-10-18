# Bibledrill

An application for reading the **Gospel of the day** from the Catholic liturgical
calendar in **English, Polish and Italian**, with every word linked to the
**original Greek text**.

You read in one language. You tap any word and see:

- the Greek word it translates, with its dictionary form, grammar and meaning,
- a short explanation of the word **in English, Polish and Italian**,
- the matching words in the other two translations,
- every other place in the New Testament where that Greek word appears.

This lets you check how each translation renders the original and how the same
word is used elsewhere.

---

## Proof of concept: what works today

| | |
|---|---|
| **Platform** | Static web app, mobile-first (`web/`), no server and no build step |
| **Days covered** | 18–25 October 2026: the 29th and 30th Sundays in Ordinary Time (Year A) and the weekdays in between (8 Gospels, 57 verses) |
| **Calendar** | Computed on the device for any date: seasons, Sunday cycle A/B/C, weekday cycle I/II, main solemnities and feasts. Other dates show the liturgical day and say that their text is not in the proof of concept yet |
| **Word links** | Every word of the 8 Gospels, linked by hand to the Greek in all three translations |
| **Explanations** | All 295 Greek dictionary forms in these Gospels, with a short meaning and a one-sentence explanation in EN, PL and IT. Latin, Hebrew and Aramaic loanwords are marked |
| **Other occurrences** | The whole Greek New Testament (MorphGNT), with the verse text in the reading language |

### Run it

```sh
npm start            # serves web/ at http://localhost:8000 (python3 -m http.server)
npm test             # calendar tests (node --test)
```

Rebuilding the data needs the source texts. They are downloaded into `sources/`,
which git ignores; see [Data pipeline](#data-pipeline).

```sh
python3 tools/build.py     # sources/ + data-src/ -> web/data/
```

---

## 1. Vision

Bibledrill is a study tool for daily prayer. It is not just a Bible reader.
It answers three questions about every word of the day's Gospel:

1. **What does it say in the original?** Which Greek word is behind the word in
   my translation?
2. **How do the translations differ?** How do the English, Polish and Italian
   texts render that same Greek word?
3. **Where else does it appear?** In which other verses is that Greek word
   used, and how is it translated there?

## 2. The original language: Greek, not Aramaic

The four Gospels were **written in Koine Greek**. That is the original text we
link to.

Jesus and his disciples mostly spoke **Aramaic**. The Gospels keep a few of His
Aramaic words, written in Greek letters. Examples:

| Reference | Aramaic (in Greek letters) | Meaning |
|-----------|----------------------------|---------|
| Mk 5:41 | ταλιθα κουμ (*talitha koum*) | "Little girl, arise" |
| Mk 7:34 | εφφαθα (*ephphatha*) | "Be opened" |
| Mk 14:36 | αββα (*abba*) | "Father" |
| Mk 15:34 / Mt 27:46 | ελωι ελωι λεμα σαβαχθανι | "My God, my God, why have you forsaken me?" |
| Jn 20:16 | ραββουνι (*rabbouni*) | "My teacher" |
| Mk 7:11 | κορβαν (*korban*) | "Offering to God" |

The word panel marks such words by origin: Aramaic (e.g. Φαρισαῖος, "Pharisee"),
Hebrew (ἀμήν, Ἰησοῦς) and Latin (κῆνσος from *census*, δηνάριον from *denarius*,
Καῖσαρ).

**Optional later:** the *Peshitta* (an early Syriac/Aramaic translation, 2nd–5th
century) could be added as an extra layer for comparison. It is a translation,
not the original, and should be labeled that way.

## 3. Features

### 3.1 Gospel of the day
- Shows the Gospel for today and for any chosen date (‹ › buttons, date picker,
  or a link such as `#2026-10-18`).
- Follows the General Roman Calendar: seasons, Sunday cycle (A/B/C), weekday
  cycle (I/II), solemnities and feasts, with the usual transfers (St Joseph,
  Annunciation, Immaculate Conception).
- Shows the liturgical day name in the reading language and its color.

### 3.2 Reading in three languages
- The reading language (EN / PL / IT) also sets the interface language.
- **Reading** view: one translation, optionally with the Greek under each verse.
- **Parallel** view: the reading language, the Greek and the other two
  translations, verse by verse.

### 3.3 Tap a word → original and translations
The panel shows:
- the **Greek word** as it appears in the text, with transliteration;
- its **dictionary form**, **Strong's number** and **grammar** (described in
  the reading language);
- its **meaning and explanation in all three languages**, reading language first;
- **the same Greek word in the other two translations** for this verse.

All words linked to the same Greek word are highlighted in every visible text.
Words with no Greek behind them (added by the translator, or coming from the
Latin Vulgate in the Wujek translation) are underlined with dots, and tapping
them says so.

### 3.4 Other occurrences (concordance)
- Every verse in the New Testament where the same Greek dictionary form appears,
  grouped by book, with the current book first.
- Each result shows the Greek verse with the word highlighted and the verse in
  the reading language.
- A summary of **how the aligned passages translate the word** in each language
  (e.g. ψυχή: *soul* ×4, *dusze* ×2, *anima* ×4).

**Example, Gospel for 18 October 2026 (Mt 22:15–21, "Render to Caesar"):**
Jesus asks *"Whose image (εἰκών) is this?"*. Tapping *image* shows that the same
word is used in *Col 1:15* ("He is the **image** of the invisible God"),
*2 Cor 4:4*, *Rom 8:29* and *1 Cor 15:49*. The coin bears Caesar's image, and
the human person bears God's.

## 4. Data

### 4.1 Sources used in the proof of concept

All texts are public domain or openly licensed.

| Data | Source | License |
|------|--------|---------|
| Greek text, grammar, dictionary forms | [MorphGNT SBLGNT](https://github.com/morphgnt/sblgnt) | SBLGNT EULA (text, with attribution); CC BY-SA 3.0 (tagging) |
| Strong's numbers, short English glosses | [Dodson Greek Lexicon](https://github.com/biblicalhumanities/Dodson-Greek-Lexicon) | Public domain |
| English | World English Bible, Catholic edition ([eBible.org](https://ebible.org/)) | Public domain |
| Polish | Biblia Jakuba Wujka, 1923 edition ([Wikisource](https://pl.wikisource.org/wiki/Biblia_Wujka_(1923))) | Public domain |
| Italian | Riveduta 1927 ([eBible.org](https://ebible.org/)) | Public domain |
| Word alignments, trilingual explanations, lectionary table | Hand-made for this project (`data-src/`) | — |

Notes on the translations:
- These are **not the texts read at Mass** (NABRE/ESV-CE, Biblia Tysiąclecia,
  CEI 2008 are copyrighted). For the proof of concept we use public-domain texts.
  The data format lets a translation be swapped later.
- **Wujek** is a Catholic translation from the Latin Vulgate, in pre-war Polish
  spelling (*Pharyzeuszowie*, *Bożéj*). Where the Vulgate adds words that are not
  in the Greek, they are shown as words with no Greek counterpart. About 30
  verses are missing from the Wikisource transcription (e.g. Lk 18:2–4,
  Jn 4:2–9). None of them are in the proof-of-concept Gospels.
- **Riveduta 1927** is a Protestant translation from the Greek. No
  machine-readable public-domain Catholic Italian text (e.g. Martini) was found.
  Its verse divisions sometimes differ, and the alignment handles that
  (e.g. Mt 22:19).
- **World English Bible** follows the Byzantine Greek text in a few places, so
  some words (e.g. "to him" in Lk 12:41) have no counterpart in the SBLGNT.
- The lectionary passages are shown without the liturgical opening ("At that
  time Jesus said…").

### 4.2 Word alignment

The Greek text is the **pivot**. Each word in each translation links to one or
more Greek words of the verse. Links between translations (EN ↔ PL ↔ IT) follow
from the shared Greek. Alignments live in `data-src/alignments/*.txt` in a
compact, hand-editable format:

```
@ 22:20
en: He[2] asked[2] them[3], “Whose[4] is this[7] image[6] and[8] inscription[10]?”
pl: I[1] rzekł[2] im[3] Jezus: Czyj[4] jest ten[7] obraz[6] i[8] napis[10]?
it: Di[4] chi[4] è questa[7] effigie[6] e[8] questa iscrizione[10]?
```

- `word[3]` links a word to Greek word 3 of the verse; `word[3,4]` links it to
  several; `word[20.2]` links it to word 2 of verse 20 (verse-boundary
  differences).
- A bracket inside a word splits it: `coglier[9]lo[8]`, `co[4]ć[5]`.
- A word without a bracket has no Greek counterpart.
- The build checks that the annotated text, with the brackets removed, is
  **exactly** the source translation. It also checks that every link points to
  an existing Greek word.

The 8 proof-of-concept Gospels were aligned by hand and have not been reviewed
by a second person yet.

### 4.3 Data pipeline

```
sources/  (git-ignored downloads)          data-src/  (hand-made)
  morphgnt/   Greek NT + tagging             lectionary.json   liturgical day -> passage
  en-vpl/     WEB Catholic                   alignments/*.txt  word links
  it-vpl/     Riveduta 1927                  lexicon.tsv       EN/PL/IT glosses + explanations
  wujek/      Wujek 1923 (Wikisource)
  dodson/     Dodson lexicon
            \                               /
             └──── tools/build.py ─────────┘
                          │
                          ▼
  web/data/  lectionary.json, lemmas.json, passages/*.json,
             conc/<lemma>.json (occurrences), text/<book>.json (verse texts)
```

Downloads: MorphGNT (`https://raw.githubusercontent.com/morphgnt/sblgnt/master/<NN-Book>-morphgnt.txt`),
eBible VPL zips (`https://ebible.org/Scriptures/eng-web-c_vpl.zip`, `ita1927_vpl.zip`),
Dodson (`dodson.xml` from its repository) and Wujek (`python3 tools/fetch_wujek.py sources/wujek`;
Wikisource rate-limits, so the script waits between requests).

## 5. Architecture

```
┌──────────────────┐     ┌───────────────────────────────────────┐
│ web/js/calendar  │────▶│ web/js/app.js (no framework)          │
│ liturgical day   │     │ - Gospel of the day                   │
│ + lectionary key │     │ - tap word → panel (i18n.js labels)   │
└──────────────────┘     │ - other occurrences (lazy-loaded JSON)│
                         └───────────────────────────────────────┘
```

- No server: the calendar is computed on the device, and texts are static JSON
  files loaded when needed (a passage is 15–40 KB; book texts load only when the
  concordance needs them).
- It can be hosted on any static host (e.g. GitHub Pages) by publishing `web/`.

## 6. Roadmap

1. ~~**MVP:** Sunday Gospel hand-aligned in three languages, tap-a-word panel,
   concordance~~ — done for one week (18–25 Oct 2026), with an NT-wide
   concordance.
2. **Calendar:** national calendars (Poland, Italy, US/UK: Epiphany, Ascension
   and Corpus Christi moved to Sunday, national patrons), memorials.
3. **Lectionary table:** all Sunday/solemnity references (cycles A/B/C) and
   weekday references (cycles I/II).
4. **Alignment at scale:** automatic first-pass alignment (statistical aligner
   and/or LLM), then human review, starting with Sundays and solemnities.
   Show unreviewed links as "suggested".
5. **Lexicon at scale:** trilingual explanations for all Gospel vocabulary
   (about 2,900 dictionary forms).
6. **Extras:** interlinear view, Aramaic notes, bookmarks/notes, audio, offline
   mode (service worker).
7. **Later:** liturgical translations if permission is granted; other readings
   (first reading, psalm), which need **Hebrew** and the Greek Septuagint.

## 7. Decisions

- Platform: **web app** (mobile-first, static).
- Translations: **public-domain texts** for the proof of concept; no permission
  requests for now.
- Explanations: **in all three languages**.
- Calendar: **General Roman Calendar** by default, until national calendars are
  added.
