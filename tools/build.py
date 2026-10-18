"""Build the static data used by the web app.

Inputs
  sources/            downloaded third-party texts (see tools/fetch_sources.sh)
  data-src/           hand-made data: lectionary, word alignments, trilingual lexicon
Output
  web/data/           JSON files loaded by the app

Run:  python3 tools/build.py [--allow-missing]
"""
import glob
from html.parser import HTMLParser
import json
import os
import re
import sys
import unicodedata
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "sources")
DATA_SRC = os.path.join(ROOT, "data-src")
OUT = os.path.join(ROOT, "web", "data")
LANGS = ("en", "pl", "it")

# code, MorphGNT file, eBible VPL book code
BOOKS = [
    ("Mt", "61-Mt", "MAT"), ("Mk", "62-Mk", "MAR"), ("Lk", "63-Lk", "LUK"), ("Jn", "64-Jn", "JOH"),
    ("Acts", "65-Ac", "ACT"), ("Rom", "66-Ro", "ROM"), ("1Cor", "67-1Co", "1CO"), ("2Cor", "68-2Co", "2CO"),
    ("Gal", "69-Ga", "GAL"), ("Eph", "70-Eph", "EPH"), ("Phil", "71-Php", "PHI"), ("Col", "72-Col", "COL"),
    ("1Thess", "73-1Th", "1TH"), ("2Thess", "74-2Th", "2TH"), ("1Tim", "75-1Ti", "1TI"), ("2Tim", "76-2Ti", "2TI"),
    ("Titus", "77-Tit", "TIT"), ("Phlm", "78-Phm", "PHM"), ("Heb", "79-Heb", "HEB"), ("Jas", "80-Jas", "JAM"),
    ("1Pet", "81-1Pe", "1PE"), ("2Pet", "82-2Pe", "2PE"), ("1Jn", "83-1Jn", "1JO"), ("2Jn", "84-2Jn", "2JO"),
    ("3Jn", "85-3Jn", "3JO"), ("Jude", "86-Jud", "JUD"), ("Rev", "87-Re", "REV"),
]
BOOK_CODES = [b[0] for b in BOOKS]

CRITICAL_SIGNS = "⸀⸁⸂⸃⸄⸅"


def fail(msg):
    sys.exit("build error: " + msg)


# ---------------------------------------------------------------- Greek

def load_greek():
    """{book: {(c, v): [token]}} from MorphGNT SBLGNT."""
    greek = {}
    for code, fname, _ in BOOKS:
        verses = defaultdict(list)
        for line in open(os.path.join(SRC, "morphgnt", fname + "-morphgnt.txt"), encoding="utf-8"):
            ref, pos, parse, text, word, _norm, lemma = line.split()
            c, v = int(ref[2:4]), int(ref[4:6])
            text = "".join(ch for ch in text if ch not in CRITICAL_SIGNS)
            i = text.find(word)
            if i < 0:
                fail(f"cannot locate {word!r} in {text!r} ({code} {c}:{v})")
            verses[(c, v)].append({
                "w": word, "pre": text[:i], "post": text[i + len(word):],
                "lemma": lemma, "m": (pos + parse).replace("-", "."),
            })
        greek[code] = verses
    return greek


def strip_accents(s):
    return "".join(ch for ch in unicodedata.normalize("NFD", s) if not unicodedata.combining(ch))


TRANSLIT = {
    "α": "a", "β": "b", "γ": "g", "δ": "d", "ε": "e", "ζ": "z", "η": "ē", "θ": "th", "ι": "i", "κ": "k",
    "λ": "l", "μ": "m", "ν": "n", "ξ": "x", "ο": "o", "π": "p", "ρ": "r", "σ": "s", "ς": "s", "τ": "t",
    "υ": "y", "φ": "ph", "χ": "ch", "ψ": "ps", "ω": "ō",
}


def transliterate(word):
    """Simplified SBL-style transliteration."""
    nfd = unicodedata.normalize("NFD", word)
    rough = False
    # rough breathing on the first vowel (or the second vowel of an initial diphthong)
    letters = [ch for ch in nfd if not unicodedata.combining(ch)]
    count = 0
    for ch in nfd:
        if not unicodedata.combining(ch):
            count += 1
            if count > 2:
                break
        elif ch == "̔":
            rough = True
    base = "".join(letters).lower()
    out = []
    i = 0
    while i < len(base):
        ch, nxt = base[i], base[i + 1] if i + 1 < len(base) else ""
        if ch == "γ" and nxt in "γκξχ":
            out.append("n")
        elif ch == "υ" and i > 0 and base[i - 1] in "αεηο":
            out.append("u")
        else:
            out.append(TRANSLIT.get(ch, ch))
        i += 1
    s = "".join(out)
    if rough:
        s = "rh" + s[1:] if s.startswith("r") else "h" + s
    if letters and letters[0].isupper():
        s = s[:1].upper() + s[1:]
    return s


# ---------------------------------------------------------------- translations

def load_vpl(path):
    by_code = {b[2]: b[0] for b in BOOKS}
    out = defaultdict(dict)
    for line in open(path, encoding="utf-8-sig"):
        m = re.match(r"(\w+) (\d+):(\d+) (.*)", line.rstrip("\n"))
        if m and m[1] in by_code:
            out[by_code[m[1]]][(int(m[2]), int(m[3]))] = m[4].strip()
    return out


class WujekParser(HTMLParser):
    """Collects verse texts from a rendered Wikisource page of the Wujek Bible.

    Verses start at <span id="C:V">; verse text is the paragraph text that follows,
    without verse numbers and footnote markers (<sup>), page numbers and footnote lists.
    """

    VOID = {"br", "img", "hr", "meta", "link", "input", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.verses, self.current = {}, None
        self.stack = []  # (tag, skip, paragraph)

    def handle_starttag(self, tag, attrs):
        if tag in self.VOID:
            return
        a = dict(attrs)
        m = re.fullmatch(r"(\d+):(\d+)", a.get("id", ""))
        if tag == "span" and m:
            self.current = (int(m[1]), int(m[2]))
            self.verses.setdefault(self.current, [])
        skip = tag == "sup" or "ws-pagenum" in a.get("class", "") or "references" in a.get("class", "")
        self.stack.append((tag, skip, tag == "p"))

    def handle_endtag(self, tag):
        if tag in self.VOID:
            return
        while self.stack:
            if self.stack.pop()[0] == tag:
                break

    def handle_data(self, data):
        if self.current is None or any(s for _, s, _ in self.stack) or not any(p for _, _, p in self.stack):
            return
        self.verses[self.current].append(data)


def load_wujek():
    out = defaultdict(dict)
    for i, code in enumerate(BOOK_CODES):
        path = os.path.join(SRC, "wujek", f"{i:02d}.json")
        if not os.path.exists(path):
            print(f"warning: Wujek text for {code} missing", file=sys.stderr)
            continue
        parser = WujekParser()
        parser.feed(json.load(open(path, encoding="utf-8"))["html"])
        for ref, parts in parser.verses.items():
            text = re.sub(r"\s+", " ", "".join(parts).replace("\u00a0", " ")).strip()
            if text:
                out[code][ref] = text
    return out


# ---------------------------------------------------------------- lexicon

def load_dodson():
    """Lookup function: lemma -> (strong, brief English gloss) or (None, None)."""
    xml = open(os.path.join(SRC, "dodson", "dodson.xml"), encoding="utf-8").read()
    exact, loose = {}, {}
    for m in re.finditer(r'<entry n="([^|"]+)\| (\d+)">.*?<def role="brief">(.*?)</def>', xml, re.S):
        word = unicodedata.normalize("NFC", m[1].strip())
        value = ("G" + str(int(m[2])), re.sub(r"\s+", " ", m[3]).strip())
        exact.setdefault(word, value)
        loose.setdefault(strip_accents(word).lower(), value)

    def lookup(lemma):
        # MorphGNT writes optional letters in parentheses: οὕτω(ς), ἔξεστι(ν)
        variants = [lemma, re.sub(r"\((\w+)\)", r"\1", lemma), re.sub(r"\(\w+\)", "", lemma)]
        for v in variants:
            if v in exact:
                return exact[v]
        for v in variants:
            if strip_accents(v).lower() in loose:
                return loose[strip_accents(v).lower()]
        return None, None
    return lookup


def load_lexicon():
    """Hand-written trilingual glosses and explanations (data-src/lexicon.tsv)."""
    lex = {}
    cols = ["lemma", "origin", "gloss_en", "gloss_pl", "gloss_it", "expl_en", "expl_pl", "expl_it"]
    for n, line in enumerate(open(os.path.join(DATA_SRC, "lexicon.tsv"), encoding="utf-8"), 1):
        line = line.rstrip("\n")
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) != len(cols):
            fail(f"lexicon.tsv line {n}: expected {len(cols)} columns, got {len(parts)}")
        row = dict(zip(cols, parts))
        lemma = unicodedata.normalize("NFC", row["lemma"])
        if lemma in lex:
            fail(f"lexicon.tsv line {n}: duplicate lemma {lemma}")
        lex[lemma] = {
            "origin": row["origin"] or None,
            "gloss": {l: row["gloss_" + l] for l in LANGS},
            "expl": {l: row["expl_" + l] for l in LANGS},
        }
    return lex


# ---------------------------------------------------------------- alignments

WORD_RE = re.compile(r"[\w’'\-]+", re.U)
ANNOT_RE = re.compile(r"\[([0-9.,: ]+)\]")


def parse_annotated(line, c, v, where):
    """'Then[1] the[3] Pharisees[4] ...' -> (plain text, [segments]).

    A bracket after a word links that word to Greek tokens of the verse
    (1-based). `20.2` refers to token 2 of verse 20 in the same chapter.
    A bracket placed inside a word splits it (Italian elision: ch’[7]è[8]).
    """
    plain, cuts = [], []  # cuts: (offset in plain text, [greek ids])
    pos = 0
    for m in ANNOT_RE.finditer(line):
        plain.append(line[pos:m.start()])
        offset = sum(len(p) for p in plain)
        ids = []
        for ref in m[1].replace(" ", "").split(","):
            if "." in ref:
                vv, ii = ref.split(".")
                ids.append(f"{c}:{int(vv)}.{int(ii)}")
            else:
                ids.append(f"{c}:{v}.{int(ref)}")
        cuts.append((offset, ids))
        pos = m.end()
    plain.append(line[pos:])
    text = "".join(plain)
    cut_at = dict(cuts)

    segments = []
    last = 0
    for m in WORD_RE.finditer(text):
        start = m.start()
        bounds = [o for o in sorted(cut_at) if m.start() < o < m.end()] + [m.end()]
        if start > last:
            segments.append(text[last:start])
        for b in bounds:
            seg = {"t": text[start:b]}
            if b in cut_at:
                seg["g"] = cut_at.pop(b)
            segments.append(seg)
            start = b
        last = m.end()
    if last < len(text):
        segments.append(text[last:])
    if cut_at:
        fail(f"{where}: annotation not attached to a word end at offsets {sorted(cut_at)}")
    return text, segments


def load_alignment(path, greek, texts):
    meta, verses, cur = {}, [], None
    for n, raw in enumerate(open(path, encoding="utf-8"), 1):
        line = raw.rstrip("\n")
        where = f"{os.path.basename(path)}:{n}"
        if not line.strip() or line.startswith("#"):
            continue
        if line.startswith("@"):
            m = re.match(r"@\s*(\d+):(\d+)\s*$", line)
            if not m:
                fail(f"{where}: bad verse header")
            cur = {"c": int(m[1]), "v": int(m[2])}
            verses.append(cur)
            continue
        key, _, value = line.partition(":")
        key, value = key.strip(), value.strip()
        if cur is None:
            meta[key] = value
            continue
        if key not in LANGS:
            fail(f"{where}: unknown key {key!r}")
        book = meta["book"]
        text, segments = parse_annotated(value, cur["c"], cur["v"], where)
        source = texts[key][book].get((cur["c"], cur["v"]))
        if source is None:
            fail(f"{where}: no {key} source text for {book} {cur['c']}:{cur['v']}")
        if text != source:
            fail(f"{where}: {key} text differs from source\n  annotated: {text}\n  source:    {source}")
        cur[key] = segments
    book = meta["book"]
    for vs in verses:
        g = greek[book].get((vs["c"], vs["v"]))
        if g is None:
            fail(f"{path}: no Greek for {book} {vs['c']}:{vs['v']}")
        for lang in LANGS:
            if lang not in vs:
                # not aligned yet: plain source text, words without links
                src = texts[lang][book].get((vs["c"], vs["v"]), "")
                vs[lang] = parse_annotated(src, vs["c"], vs["v"], path)[1]
                vs.setdefault("unaligned", []).append(lang)
            for seg in vs[lang]:
                for gid in seg.get("g", []) if isinstance(seg, dict) else []:
                    c, rest = gid.split(":")
                    vv, ii = map(int, rest.split("."))
                    tokens = greek[book].get((int(c), vv))
                    if not tokens or not 1 <= ii <= len(tokens):
                        fail(f"{path}: {lang} {book} {vs['c']}:{vs['v']} links to missing Greek token {gid}")
    return meta, verses


# ---------------------------------------------------------------- build

def main():
    greek = load_greek()
    texts = {
        "en": load_vpl(os.path.join(SRC, "en-vpl", "eng-web-c_vpl.txt")),
        "it": load_vpl(os.path.join(SRC, "it-vpl", "ita1927_vpl.txt")),
        "pl": load_wujek(),
    }
    dodson = load_dodson()
    lexicon = load_lexicon()
    lectionary = json.load(open(os.path.join(DATA_SRC, "lectionary.json"), encoding="utf-8"))

    # global lemma ids and concordance
    lemma_refs = defaultdict(list)
    for code in BOOK_CODES:
        for (c, v), toks in sorted(greek[code].items()):
            for i, t in enumerate(toks, 1):
                lemma_refs[t["lemma"]].append([code, c, v, i])
    lemma_ids = {l: n for n, l in enumerate(sorted(lemma_refs))}

    os.makedirs(os.path.join(OUT, "passages"), exist_ok=True)
    os.makedirs(os.path.join(OUT, "conc"), exist_ok=True)
    os.makedirs(os.path.join(OUT, "text"), exist_ok=True)
    for old in glob.glob(os.path.join(OUT, "*", "*.json")):
        os.remove(old)

    passages, used_lemmas = {}, set()
    renderings = defaultdict(dict)  # lemma -> {"Mt 22:20.6": {lang: "words"}}
    for path in sorted(glob.glob(os.path.join(DATA_SRC, "alignments", "*.txt"))):
        meta, verses = load_alignment(path, greek, texts)
        pid = os.path.splitext(os.path.basename(path))[0]
        book = meta["book"]
        out_verses = []
        for vs in verses:
            toks = []
            for t in greek[book][(vs["c"], vs["v"])]:
                used_lemmas.add(t["lemma"])
                toks.append({"w": t["w"], "pre": t["pre"], "post": t["post"], "l": lemma_ids[t["lemma"]],
                             "m": t["m"], "tr": transliterate(t["w"])})
            out_verses.append({"c": vs["c"], "v": vs["v"], "grc": toks,
                               **{l: vs[l] for l in LANGS}, "unaligned": vs.get("unaligned", [])})
            for lang in LANGS:
                if lang in vs.get("unaligned", []):
                    continue
                for seg in vs[lang]:
                    if isinstance(seg, dict):
                        for gid in seg.get("g", []):
                            c, rest = gid.split(":")
                            vv, ii = map(int, rest.split("."))
                            lemma = greek[book][(int(c), vv)][ii - 1]["lemma"]
                            key = f"{book} {c}:{vv}.{ii}"
                            r = renderings[lemma].setdefault(key, {})
                            r[lang] = (r.get(lang, "") + " " + seg["t"]).strip()
        c1, v1 = out_verses[0]["c"], out_verses[0]["v"]
        c2, v2 = out_verses[-1]["c"], out_verses[-1]["v"]
        passage = {"id": pid, "book": book, "start": [c1, v1], "end": [c2, v2], "verses": out_verses}
        passages[pid] = passage
        json.dump(passage, open(os.path.join(OUT, "passages", pid + ".json"), "w", encoding="utf-8"),
                  ensure_ascii=False, separators=(",", ":"))

    for entry in lectionary["days"]:
        if entry.get("passage") and entry["passage"] not in passages:
            if "--allow-missing" not in sys.argv:
                fail(f"lectionary.json: unknown passage {entry['passage']}")
            print(f"warning: lectionary passage {entry['passage']} not aligned yet", file=sys.stderr)
            entry["passage"] = None

    missing = sorted(l for l in used_lemmas if l not in lexicon)
    if missing:
        print(f"warning: {len(missing)} lemmas without trilingual entry: {' '.join(missing)}", file=sys.stderr)

    lemmas_out = {}
    for lemma in sorted(used_lemmas):
        lid = lemma_ids[lemma]
        strong, brief = dodson(lemma)
        entry = {"lemma": lemma, "tr": transliterate(lemma), "strong": strong, "dodson": brief,
                 "count": len(lemma_refs[lemma])}
        if lemma in lexicon:
            entry.update(lexicon[lemma])
        lemmas_out[lid] = entry
        conc = {"refs": lemma_refs[lemma], "renderings": renderings.get(lemma, {})}
        json.dump(conc, open(os.path.join(OUT, "conc", f"{lid}.json"), "w", encoding="utf-8"),
                  ensure_ascii=False, separators=(",", ":"))
    json.dump(lemmas_out, open(os.path.join(OUT, "lemmas.json"), "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))

    # per-book texts for the concordance view
    for code in BOOK_CODES:
        book = {"grc": {}, **{l: {} for l in LANGS}}
        for (c, v), toks in sorted(greek[code].items()):
            book["grc"][f"{c}:{v}"] = [t["pre"] + t["w"] + t["post"] for t in toks]
        for lang in LANGS:
            for (c, v), t in sorted(texts[lang].get(code, {}).items()):
                book[lang][f"{c}:{v}"] = t
        json.dump(book, open(os.path.join(OUT, "text", code + ".json"), "w", encoding="utf-8"),
                  ensure_ascii=False, separators=(",", ":"))

    json.dump(lectionary, open(os.path.join(OUT, "lectionary.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"built {len(passages)} passages, {len(lemmas_out)} lemmas")


if __name__ == "__main__":
    main()
