import { liturgicalDay, parseDate, formatDate, formatLongDate, SEASONS } from "./calendar.js";
import { LANGS, LANG_NAMES, LANG_SHORT, UI, bookAbbr, bookName, describeMorph } from "./i18n.js";

const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) if (c != null) node.append(c);
  return node;
};

const store = {
  get(key, fallback) {
    try { return localStorage.getItem("bibledrill." + key) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("bibledrill." + key, value); } catch { /* storage unavailable */ }
  },
};

const cache = new Map();
async function getJSON(path) {
  if (!cache.has(path)) {
    cache.set(path, fetch("data/" + path).then((r) => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.json();
    }));
  }
  return cache.get(path);
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const initialLang = () => {
  const saved = store.get("lang");
  if (LANGS.includes(saved)) return saved;
  const nav = (navigator.language || "en").slice(0, 2);
  return LANGS.includes(nav) ? nav : "en";
};

const state = {
  date: /^#\d{4}-\d{2}-\d{2}$/.test(location.hash) ? location.hash.slice(1) : todayISO(),
  lang: initialLang(),
  view: store.get("view", "read") === "parallel" ? "parallel" : "read",
  greek: store.get("greek", "0") === "1",
  passage: null,
  selected: null, // { gids: [...], source: element }
  panel: [], // stack of panel views
};

let lectionary = null;
let lemmas = null;
let tokenIndex = new Map(); // gid -> { verse, token, i }

const t = () => UI[state.lang];

function formatRef(book, c1, v1, c2, v2, lang) {
  const sep = lang === "en" ? ":" : ",";
  let s = `${bookAbbr(book, lang)} ${c1}${sep}${v1}`;
  if (c2 != null && (c2 !== c1 || v2 !== v1)) s += c2 === c1 ? `-${v2}` : `–${c2}${sep}${v2}`;
  return s;
}

// ------------------------------------------------------------------ static chrome

function renderChrome() {
  document.documentElement.lang = state.lang;
  $("#tagline").textContent = t().tagline;
  for (const b of document.querySelectorAll("#lang-switch button")) {
    b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang));
  }
  for (const b of document.querySelectorAll("#view-switch button")) {
    b.textContent = b.dataset.view === "read" ? t().viewRead : t().viewParallel;
    b.setAttribute("aria-pressed", String(b.dataset.view === state.view));
  }
  $("#greek-toggle").checked = state.greek;
  $("#greek-toggle-label").textContent = t().showGreek;
  $("#greek-toggle").closest("label").hidden = state.view === "parallel";
  $("#today-btn").textContent = t().today;
  $("#prev-day").setAttribute("aria-label", t().prevDay);
  $("#next-day").setAttribute("aria-label", t().nextDay);
  $("#date-text").textContent = formatLongDate(parseDate(state.date), state.lang);
  $("#date-input").value = state.date;

  const src = $("#sources");
  src.replaceChildren(
    el("h2", { text: t().sources }),
    el("ul", {}, ["grc", ...LANGS].map((l) => el("li", {}, el("b", { text: LANG_NAMES[l] + ": " }), t().translations[l]))),
    el("p", { class: "muted", text: "Dodson Greek Lexicon (public domain) · Word alignments and explanations: Bibledrill (proof of concept)" }),
  );
}

// ------------------------------------------------------------------ day

async function loadDay() {
  const day = liturgicalDay(state.date);
  const entry = lectionary.days.find((d) => d.key === day.key);
  state.passage = entry ? await getJSON(`passages/${entry.passage}.json`) : null;
  state.entry = entry;
  state.day = day;
  tokenIndex = new Map();
  if (state.passage) {
    for (const verse of state.passage.verses) {
      verse.grc.forEach((token, i) => tokenIndex.set(`${verse.c}:${verse.v}.${i + 1}`, { verse, token, i }));
    }
  }
  state.selected = null;
  closePanel();
  render();
}

function renderDayCard() {
  const { day, passage, entry } = state;
  const card = $("#day-card");
  card.dataset.color = day.color;
  const cycle = `${t().year} ${day.cycle.sunday} · ${t().weekdayCycle} ${day.cycle.weekday}`;
  const season = SEASONS[day.season]?.[state.lang] ?? "";
  card.replaceChildren(
    el("div", { class: "day-meta" },
      el("span", { class: "color-dot", title: day.color }),
      el("span", { text: season }),
      el("span", { class: "muted", text: cycle })),
    el("h1", { class: "day-name", text: day.names[state.lang] }),
    entry ? el("p", { class: "day-gospel" },
      el("span", { class: "label", text: t().gospel + ": " }),
      el("b", { text: formatRef(passage.book, passage.start[0], passage.start[1], passage.end[0], passage.end[1], state.lang) }),
      el("span", { class: "muted", text: " — " + bookName(passage.book, state.lang) })) : null,
  );
}

function renderNoGospel() {
  const days = [];
  for (let n = parseDate("2026-10-18"); n <= parseDate("2026-10-25"); n++) days.push(formatDate(n));
  $("#gospel").replaceChildren(el("div", { class: "empty" },
    el("h2", { text: t().noGospelTitle }),
    el("p", { text: t().noGospel }),
    el("div", { class: "day-list" }, days.map((d) => el("button", {
      type: "button", class: "chip", text: formatLongDate(parseDate(d), state.lang), onclick: () => goTo(d),
    })))));
}

// ------------------------------------------------------------------ gospel text

function wordSpan(seg, lang) {
  if (typeof seg === "string") return document.createTextNode(seg);
  const span = el("span", { class: "w" + (seg.g ? "" : " nog"), "data-lang": lang, text: seg.t, tabindex: "0", role: "button" });
  if (seg.g) span.dataset.g = seg.g.join(" ");
  return span;
}

function greekLine(verse) {
  const line = el("span", { class: "grc", lang: "grc" });
  verse.grc.forEach((tok, i) => {
    if (i) line.append(" ");
    if (tok.pre) line.append(tok.pre);
    line.append(el("span", { class: "w g", "data-lang": "grc", "data-g": `${verse.c}:${verse.v}.${i + 1}`, text: tok.w, tabindex: "0", role: "button" }));
    if (tok.post) line.append(tok.post);
  });
  return line;
}

function textLine(verse, lang) {
  const span = el("span", { class: "txt", lang });
  for (const seg of verse[lang]) span.append(wordSpan(seg, lang));
  if (verse.unaligned?.includes(lang)) span.classList.add("unaligned");
  return span;
}

function renderGospel() {
  const { passage } = state;
  if (!passage) return renderNoGospel();
  const box = $("#gospel");
  box.className = "gospel view-" + state.view;
  const hint = el("p", { class: "hint", text: t().tapHint });
  if (state.view === "read") {
    box.replaceChildren(hint, ...passage.verses.map((verse) => el("p", { class: "verse" },
      el("sup", { class: "vnum", text: verse.v }),
      textLine(verse, state.lang),
      state.greek ? el("span", { class: "verse-grc" }, greekLine(verse)) : null)));
  } else {
    const order = [state.lang, "grc", ...LANGS.filter((l) => l !== state.lang)];
    box.replaceChildren(hint, ...passage.verses.map((verse) => el("div", { class: "pverse" },
      el("div", { class: "pref", text: `${verse.c}${state.lang === "en" ? ":" : ","}${verse.v}` }),
      ...order.map((l) => el("div", { class: "prow" + (l === state.lang ? " primary" : ""), "data-lang": l },
        el("span", { class: "tag", text: LANG_SHORT[l] }),
        l === "grc" ? greekLine(verse) : textLine(verse, l))))));
  }
  applyHighlight();
}

function render() {
  renderChrome();
  renderDayCard();
  renderGospel();
}

// ------------------------------------------------------------------ selection

function applyHighlight() {
  const sel = state.selected ? new Set(state.selected.gids) : null;
  for (const w of document.querySelectorAll("#gospel .w")) {
    const ids = w.dataset.g ? w.dataset.g.split(" ") : [];
    w.classList.toggle("hl", !!sel && ids.some((id) => sel.has(id)));
    w.classList.toggle("sel", !!state.selected && w === state.selected.source);
  }
}

function selectWord(w) {
  const gids = w.dataset.g ? w.dataset.g.split(" ") : [];
  state.selected = { gids, source: w, text: w.textContent, lang: w.dataset.lang };
  applyHighlight();
  state.panel = [{ type: "word" }];
  renderPanel();
}

// ------------------------------------------------------------------ panel

function openPanel() {
  const panel = $("#panel");
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("panel-open");
}

function closePanel() {
  const panel = $("#panel");
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  state.panel = [];
  if (state.selected) {
    state.selected = null;
    applyHighlight();
  }
  renderPanelEmpty();
}

function renderPanelEmpty() {
  $("#panel-inner").replaceChildren(el("div", { class: "panel-empty" }, el("p", { text: t().tapHint })));
}

function panelHeader(title, { back } = {}) {
  return el("div", { class: "panel-head" },
    back ? el("button", { type: "button", class: "icon-btn", "aria-label": t().back, text: "‹", onclick: () => { state.panel.pop(); renderPanel(); } }) : null,
    el("div", { class: "panel-title" }, title),
    el("button", { type: "button", class: "icon-btn", "aria-label": t().close, text: "×", onclick: closePanel }));
}

function renderPanel() {
  const view = state.panel[state.panel.length - 1];
  if (!view) return closePanel();
  openPanel();
  if (view.type === "word") renderWordPanel();
  else if (view.type === "conc") renderConcordance(view.lemmaId, view.gid);
  $("#panel-inner").scrollTop = 0;
}

// Words of `lang` in the passage linked to Greek token `gid`.
function renderingsInPassage(gid, lang) {
  const out = [];
  for (const verse of state.passage.verses) {
    for (const seg of verse[lang]) {
      if (typeof seg !== "string" && seg.g?.includes(gid)) out.push(seg.t);
    }
  }
  return out.join(" ");
}

const isArticle = (gid) => tokenIndex.get(gid)?.token.m.startsWith("RA");

function renderWordPanel() {
  const { selected } = state;
  const inner = $("#panel-inner");
  if (!selected.gids.length) {
    inner.replaceChildren(
      panelHeader(el("span", { class: "sel-word", text: `“${selected.text}”` })),
      el("section", { class: "card" }, el("h3", { text: t().noGreekTitle }), el("p", { text: t().noGreek })));
    return;
  }
  const gids = [...selected.gids].sort((a, b) => isArticle(a) - isArticle(b));
  const title = selected.lang === "grc"
    ? el("span", { class: "sel-word grc", lang: "grc", text: selected.text })
    : el("span", { class: "sel-word" }, `“${selected.text}”`, el("span", { class: "muted", text: ` ${LANG_SHORT[selected.lang]}` }));
  inner.replaceChildren(
    panelHeader(title),
    ...(gids.length > 1 ? [el("p", { class: "muted small", text: t().alsoLinked })] : []),
    ...gids.map((gid) => greekCard(gid)));
}

function greekCard(gid) {
  const { token } = tokenIndex.get(gid);
  const lemma = lemmas[token.l];
  const lang = state.lang;
  const meaningOrder = [lang, ...LANGS.filter((l) => l !== lang)];
  const card = el("section", { class: "card" });

  card.append(
    el("div", { class: "greek-head" },
      el("span", { class: "greek-form", lang: "grc", text: token.w }),
      el("span", { class: "translit", text: token.tr })),
    el("dl", { class: "facts" },
      el("dt", { text: t().dictionaryForm }),
      el("dd", {},
        el("span", { class: "grc", lang: "grc", text: lemma.lemma }), ` (${lemma.tr})`,
        lemma.strong ? el("span", { class: "muted", text: ` · Strong ${lemma.strong}` }) : null),
      el("dt", { text: t().grammar }),
      el("dd", { text: describeMorph(token.m, lang) })),
  );
  if (lemma.origin) card.append(el("p", { class: "badge", text: t().origin[lemma.origin] ?? lemma.origin }));

  const meaning = el("div", { class: "meaning" });
  for (const l of meaningOrder) {
    const gloss = lemma.gloss?.[l] ?? (l === "en" ? lemma.dodson : null);
    const expl = lemma.expl?.[l];
    if (!gloss && !expl) continue;
    meaning.append(el("div", { class: "meaning-row" + (l === lang ? " primary" : ""), lang: l },
      el("span", { class: "tag", text: LANG_SHORT[l] }),
      el("div", {}, gloss ? el("b", { text: gloss }) : null, expl ? el("p", { text: expl }) : null)));
  }
  card.append(el("h3", { text: t().meaning }), meaning);

  const rows = el("div", { class: "verse-words" });
  for (const l of [lang, ...LANGS.filter((x) => x !== lang)]) {
    const words = renderingsInPassage(gid, l);
    rows.append(el("div", { class: "vw-row" }, el("span", { class: "tag", text: LANG_SHORT[l] }), el("span", { text: words || "—" })));
  }
  rows.append(el("div", { class: "vw-row" }, el("span", { class: "tag", text: "GRC" }), el("span", { class: "grc", lang: "grc", text: token.w })));
  card.append(el("h3", { text: t().inThisVerse }), rows);

  card.append(el("button", {
    type: "button", class: "primary-btn",
    onclick: () => { state.panel.push({ type: "conc", lemmaId: token.l, gid }); renderPanel(); },
  }, el("span", { text: t().otherUses }), el("span", { class: "count", text: t().timesInNT(lemma.count) })));
  return card;
}

// ------------------------------------------------------------------ concordance

const refKey = ([b, c, v, i]) => `${b} ${c}:${v}.${i}`;

async function renderConcordance(lemmaId, gid) {
  const inner = $("#panel-inner");
  const lemma = lemmas[lemmaId];
  const lang = state.lang;
  inner.replaceChildren(
    panelHeader(el("span", { class: "sel-word grc", lang: "grc", text: lemma.lemma }), { back: true }),
    el("p", { class: "muted", text: `${lemma.tr} · ${lemma.gloss?.[lang] ?? lemma.dodson ?? ""} · ${t().timesInNT(lemma.count)}` }),
    el("p", { class: "muted", text: t().loading }));
  const conc = await getJSON(`conc/${lemmaId}.json`);
  if (state.panel[state.panel.length - 1]?.lemmaId !== lemmaId) return; // navigated away meanwhile

  const body = [];
  // how the aligned passages translate this word
  const summary = el("div", { class: "renderings" });
  for (const l of [lang, ...LANGS.filter((x) => x !== lang)]) {
    const counts = new Map();
    for (const r of Object.values(conc.renderings)) {
      if (r[l]) counts.set(r[l].toLowerCase(), (counts.get(r[l].toLowerCase()) ?? 0) + 1);
    }
    if (!counts.size) continue;
    summary.append(el("div", { class: "vw-row" },
      el("span", { class: "tag", text: LANG_SHORT[l] }),
      el("span", {}, [...counts].sort((a, b) => b[1] - a[1]).map(([w, n]) => el("span", { class: "pill", text: n > 1 ? `${w} ×${n}` : w })))));
  }
  if (summary.childElementCount) body.push(el("h3", { text: t().translatedAs }), summary);

  // group occurrences by book, then by verse
  const groups = new Map();
  for (const ref of conc.refs) {
    const [b, c, v] = ref;
    if (!groups.has(b)) groups.set(b, new Map());
    const verses = groups.get(b);
    const k = `${c}:${v}`;
    if (!verses.has(k)) verses.set(k, []);
    verses.get(k).push(ref);
  }
  let budget = 40; // verses shown without asking
  const current = state.passage.book;
  const ordered = [...groups].sort(([a], [b]) => (b === current) - (a === current));
  for (const [book, verses] of ordered) {
    const n = [...verses.values()].reduce((s, r) => s + r.length, 0);
    const list = el("div", { class: "conc-list" });
    const group = el("section", { class: "conc-group" },
      el("h4", {}, bookName(book, lang), el("span", { class: "muted", text: ` · ${n}` })), list);
    const expand = () => fillGroup(list, book, verses, conc, gid);
    if (verses.size <= budget) {
      budget -= verses.size;
      expand();
    } else {
      list.append(el("button", { type: "button", class: "chip", text: `${t().expand} (${verses.size})`, onclick: expand }));
    }
    body.push(group);
  }
  inner.replaceChildren(inner.firstChild, inner.children[1], ...body);
}

async function fillGroup(list, book, verses, conc, currentGid) {
  list.replaceChildren(el("p", { class: "muted", text: t().loading }));
  const text = await getJSON(`text/${book}.json`);
  const lang = state.lang;
  const items = [];
  for (const [cv, refs] of verses) {
    const [c, v] = cv.split(":").map(Number);
    const highlight = new Set(refs.map((r) => r[3] - 1));
    const words = text.grc[cv] ?? [];
    const greek = el("p", { class: "grc", lang: "grc" });
    words.forEach((w, i) => {
      if (i) greek.append(" ");
      greek.append(highlight.has(i) ? el("mark", { text: w }) : w);
    });
    const isCurrent = refs.some((r) => `${r[1]}:${r[2]}.${r[3]}` === currentGid && r[0] === state.passage.book);
    const rendered = refs.map((r) => conc.renderings[refKey(r)]).filter(Boolean);
    items.push(el("article", { class: "conc-item" + (isCurrent ? " current" : "") },
      el("div", { class: "conc-ref" },
        el("b", { text: formatRef(book, c, v, null, null, lang) }),
        isCurrent ? el("span", { class: "pill", text: t().thisGospel }) : null,
        ...rendered.flatMap((r) => LANGS.filter((l) => r[l]).map((l) => el("span", { class: "pill soft", text: `${LANG_SHORT[l]}: ${r[l]}` })))),
      greek,
      el("p", { class: "conc-tr", lang, text: text[lang]?.[cv] ?? t().notAvailable })));
  }
  list.replaceChildren(...items);
}

// ------------------------------------------------------------------ events

function goTo(iso) {
  state.date = iso;
  history.replaceState(null, "", "#" + iso);
  loadDay();
}

function bindEvents() {
  $("#lang-switch").addEventListener("click", (e) => {
    const lang = e.target.dataset?.lang;
    if (!lang || lang === state.lang) return;
    state.lang = lang;
    store.set("lang", lang);
    const reopen = state.selected && state.panel.length;
    const sel = state.selected;
    render();
    if (reopen) {
      // keep the selection when switching language
      state.selected = sel;
      const again = document.querySelector(`#gospel .w[data-g="${sel.gids.join(" ")}"][data-lang="${sel.lang === "grc" ? "grc" : lang}"]`);
      if (again) state.selected.source = again;
      applyHighlight();
      renderPanel();
    } else {
      renderPanelEmpty();
    }
  });
  $("#view-switch").addEventListener("click", (e) => {
    const view = e.target.dataset?.view;
    if (!view) return;
    state.view = view;
    store.set("view", view);
    renderChrome();
    renderGospel();
  });
  $("#greek-toggle").addEventListener("change", (e) => {
    state.greek = e.target.checked;
    store.set("greek", state.greek ? "1" : "0");
    renderGospel();
  });
  $("#prev-day").addEventListener("click", () => goTo(formatDate(parseDate(state.date) - 1)));
  $("#next-day").addEventListener("click", () => goTo(formatDate(parseDate(state.date) + 1)));
  $("#today-btn").addEventListener("click", () => goTo(todayISO()));
  $("#date-input").addEventListener("change", (e) => e.target.value && goTo(e.target.value));
  $("#gospel").addEventListener("click", (e) => {
    const w = e.target.closest(".w");
    if (w) selectWord(w);
  });
  $("#gospel").addEventListener("keydown", (e) => {
    const w = e.target.closest?.(".w");
    if (w && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      selectWord(w);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("#panel").classList.contains("open")) closePanel();
  });
  window.addEventListener("hashchange", () => {
    if (/^#\d{4}-\d{2}-\d{2}$/.test(location.hash) && location.hash.slice(1) !== state.date) {
      state.date = location.hash.slice(1);
      loadDay();
    }
  });
}

async function main() {
  bindEvents();
  renderChrome();
  renderPanelEmpty();
  [lectionary, lemmas] = await Promise.all([getJSON("lectionary.json"), getJSON("lemmas.json")]);
  await loadDay();
}

main().catch((err) => {
  console.error(err);
  $("#gospel").replaceChildren(el("p", { class: "error", text: String(err) }));
});
