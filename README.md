# Bibledrill

An application for reading the **Gospel of the day** from the Catholic liturgical
calendar in **English, Polish and Italian**, with every word linked to the
**original Greek text**.

You read in one language. You tap any word and see:

- the Greek word it translates, with its dictionary form, grammar and meaning,
- the matching words in the other two languages,
- every other place where that Greek word appears.

This lets you check how each translation renders the original and how the same
word is used elsewhere.

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

The app will mark these words as Aramaic and explain them in the word popup.

**Optional later:** the *Peshitta* (an early Syriac/Aramaic translation, 2nd–5th
century) could be added as an extra layer for comparison. It is a translation,
not the original, and should be labeled that way.

## 3. Core features

### 3.1 Gospel of the day
- Show the Gospel for today and for any chosen date.
- Follow the General Roman Calendar, the Sunday cycle (A/B/C), the weekday
  cycle (I/II), feasts, solemnities and memorials.
- **National calendars differ.** Poland, Italy and English-speaking countries
  sometimes read a **different Gospel on the same day** (proper feasts,
  Epiphany and Ascension moved to Sunday, etc.). The user picks a calendar
  region. The reading language does not decide the region.
- Show the liturgical day name and color, e.g. *29th Sunday in Ordinary Time,
  Year A — green*.

### 3.2 Reading in three languages
- The reading language can be English, Polish or Italian.
- Optional parallel view: the three translations and the Greek side by side,
  verse by verse.
- Optional interlinear view: Greek with the chosen language under each word.

### 3.3 Tap a word → translation and original
When the user taps a word in the text, a panel opens with:

- **Greek word** as it appears in the text (e.g. `εἰκὼν`) and its
  **dictionary form / lemma** (e.g. `εἰκών`).
- **Transliteration** and pronunciation hint (*eikōn*).
- **Grammar** (e.g. noun, nominative, singular, feminine).
- **Short meaning** (gloss) in the reading language.
- **The same Greek word in the other two translations** for this verse
  (e.g. EN *image* · PL *obraz* · IT *immagine*).
- **Strong's number** (e.g. G1504) so you can look it up in other tools.

Translations do not map one word to one word:
- One Greek word can become several words ("ἀπεκρίθη" → "he answered").
- Several Greek words can become one word.
- Some Greek words are not translated at all (articles, particles such as δέ).
- Some translated words have no Greek word behind them, especially the
  lectionary opening ("At that time Jesus said to his disciples…").

The UI must handle all four cases: highlight every linked word, and say clearly
when a word has no Greek counterpart.

### 3.4 Other uses of the word (concordance)
From the word panel, the user can open **"Other occurrences"**:
- Every verse where the same Greek lemma appears. Start with the Gospels and
  extend to the whole New Testament.
- Each result shows the verse in the reading language, with the matching word
  highlighted, plus the Greek.
- Results can be grouped by book and by how the word was translated. This
  shows, for example, that one Greek word is sometimes "love" and sometimes
  "charity".
- Total count (e.g. "εἰκών — 23 times in the NT").

**Example, Gospel for 18 October 2026 (Mt 22:15–21, "Render to Caesar"):**
Jesus asks *"Whose image (εἰκών) is this?"*. Tapping *image* shows that the same
word is used in *Col 1:15* ("He is the **image** of the invisible God"),
*2 Cor 4:4*, *Rom 8:29* and *1 Cor 15:49*. The coin bears Caesar's image, and
the human person bears God's. This is the kind of link the app should make easy
to find.

## 4. Data needed

| Data | Purpose | Candidate sources (licenses must be verified) |
|------|---------|-----------------------------------------------|
| Liturgical calendar | Which day / feast / cycle | Computed in code; e.g. [romcal](https://github.com/romcal/romcal) (MIT, includes national calendars) |
| Lectionary table | Which Gospel passage on which liturgical day | *Ordo Lectionum Missae* reference list (references only, no text) |
| Greek text + grammar | The original, word by word | SBLGNT + MorphGNT, Nestle 1904 (public domain), STEPBible TAGNT (CC BY 4.0) |
| Greek dictionary | Meanings, glosses | Strong's, Thayer, Abbott-Smith, Dodson (public domain) |
| English text | Reading text | Liturgical: NABRE (US), ESV-CE / Jerusalem Bible (UK etc.) — **copyrighted**. Free: Douay-Rheims, World English Bible |
| Polish text | Reading text | Liturgical: Biblia Tysiąclecia (Pallottinum) — **copyrighted**. Free: Biblia Wujka (1599) |
| Italian text | Reading text | Liturgical: CEI 2008 — **copyrighted**. Free: Martini (Catholic, 18th c.) |
| Word alignment | Links between each translated word and the Greek | Partly available for English (Strong's-tagged texts); **must be built for Polish and Italian** |

### 4.1 Licensing decision (open)
The texts read at Mass (NABRE, Biblia Tysiąclecia, CEI 2008) are copyrighted.
There are two options:
1. **Start with public-domain translations** (Douay-Rheims / WEB, Wujek,
   Martini). We can build and publish right away, but the wording will differ
   from what is heard in church.
2. **Ask the publishers** (USCCB, Pallottinum, CEI) for permission to use the
   liturgical texts. This matches what is read at Mass, but it is slow and may
   cost money.

Proposal: build with option 1, design the data so a translation can be swapped
in later, and pursue option 2 in parallel.

### 4.2 Word alignment (the hardest part)
The Greek text is the **pivot**. Each word in each translation is linked to one
or more Greek word IDs. Links between translations (EN ↔ PL ↔ IT) come from the
shared Greek.

Approach:
1. Tokenize the Greek and each translation, verse by verse.
2. Make automatic first-pass alignments with a statistical word aligner and/or
   an LLM.
3. **Have a human review** each Gospel passage, starting with the most-read
   passages (Sundays and solemnities).
4. Store a confidence/review flag on each link, and show unreviewed links in
   the UI as "suggested".

The four Gospels have roughly 64,000 Greek words, and the lectionary uses most
of them. Reviewing passage by passage is feasible over time.

## 5. Proposed architecture

```
          ┌──────────────────────────────────────────┐
          │           Data pipeline (offline)        │
          │  Greek text + morphology + lexicon       │
          │  EN / PL / IT texts                      │
          │  alignment (auto + human review)         │
          │  lectionary table                        │
          └──────────────────┬───────────────────────┘
                             │  JSON per passage + concordance index
                             ▼
┌──────────────┐     ┌──────────────────────────────┐
│  Calendar    │────▶│  App (web / PWA, mobile-first)│
│  (romcal)    │     │  - Today's Gospel            │
└──────────────┘     │  - Tap word → panel          │
                     │  - Other occurrences         │
                     └──────────────────────────────┘
```

- **Offline data pipeline.** Builds static JSON files, one per Gospel passage,
  plus a lemma → occurrences index for the concordance.
- **Client app.** Mobile-first progressive web app. It works offline once
  loaded and can later be wrapped as an Android/iOS app.
- **No server needed at first.** The calendar is computed on the device and the
  texts are static files.

### 5.1 Data model (sketch)

```jsonc
// greek token
{ "id": "Mt22:20.4", "text": "εἰκὼν", "lemma": "εἰκών", "strong": "G1504",
  "morph": "N-NSF", "translit": "eikōn", "lang": "grc" }   // "arc" for Aramaic words

// translation token
{ "id": "pl:Mt22:20.3", "text": "obraz", "greek": ["Mt22:20.4"],
  "status": "reviewed" }                                   // or "suggested"

// lemma entry
{ "lemma": "εἰκών", "strong": "G1504",
  "gloss": { "en": "image", "pl": "obraz", "it": "immagine" },
  "occurrences": ["Mt22:20.4", "Mk12:16.5", "Col1:15.3", "..."] }
```

## 6. Roadmap

1. **MVP:** one Sunday Gospel, hand-aligned in all three languages. Tap-a-word
   panel. Concordance within the four Gospels.
2. **Calendar:** today's Gospel for the General Roman Calendar, then national
   calendars (PL, IT, US/UK).
3. **Coverage:** all Sunday and solemnity Gospels (cycles A/B/C) aligned and
   reviewed.
4. **Coverage:** weekday Gospels.
5. **Extras:** parallel and interlinear views, Aramaic notes, NT-wide
   concordance, bookmarks/notes, audio.
6. **Later:** other readings (first reading, psalm). These need **Hebrew** and
   the Greek Septuagint as the original.

## 7. Open questions

- Platform: web/PWA first, or a native mobile app from the start?
- Translations: public-domain texts first, or wait for liturgical text
  permissions?
- Default calendar region: Poland, Italy, or the General Roman Calendar?
- Should the word panel's dictionary explanations be in all three languages,
  or English only at first?
