"""Fetch the Wujek 1923 New Testament (rendered HTML, one page per book) from pl.wikisource.org.

Wikisource rate-limits its API, so this uses the plain page renderer and waits between requests.
Usage: python3 tools/fetch_wujek.py sources/wujek
"""
import json
import os
import subprocess
import sys
import time
import urllib.parse

OUT = sys.argv[1]
UA = "BibledrillPoC/0.1 (https://github.com/imbirwmiodzie/Bibledrill)"
NT = ["Ewangelia wg św. Mateusza", "Ewangelia wg św. Marka", "Ewangelia wg św. Łukasza", "Ewangelia wg św. Jana",
      "Dzieje Apostolskie", "List do Rzymian", "Pierwszy List do Koryntian", "Drugi List do Koryntian",
      "List do Galatów", "List do Efezjan", "List do Filipian", "List do Kolosan",
      "Pierwszy List do Tesaloniczan", "Drugi List do Tesaloniczan", "Pierwszy List do Tymoteusza",
      "Drugi List do Tymoteusza", "List do Tytusa", "List do Filemona", "List do Hebrajczyków",
      "List św. Jakuba", "Pierwszy List św. Piotra", "Drugi List św. Piotra", "Pierwszy List św. Jana",
      "Drugi List św. Jana", "Trzeci List św. Jana", "List św. Judy", "Apokalipsa św. Jana"]


def render(title):
    url = "https://pl.wikisource.org/w/index.php?" + urllib.parse.urlencode({"title": title, "action": "render"})
    for attempt in range(8):
        r = subprocess.run(["curl", "-s", "-A", UA, "-w", "\n%{http_code}", url], capture_output=True, text=True)
        body, _, code = r.stdout.rpartition("\n")
        if code == "200":
            return body
        if code == "404":
            return None
        print(f"  {code}, waiting {30 * (attempt + 1)}s", flush=True)
        time.sleep(30 * (attempt + 1))
    raise SystemExit("giving up: " + title)


os.makedirs(OUT, exist_ok=True)
for i, book in enumerate(NT):
    path = os.path.join(OUT, f"{i:02d}.json")
    if os.path.exists(path):
        continue
    for title in (f"Biblia Wujka (1923)/{book} (całość)", f"Biblia Wujka (1923)/{book}"):
        page = render(title)
        if page and 'id="1:1"' in page:
            json.dump({"book": book, "page": title, "html": page}, open(path, "w"), ensure_ascii=False)
            print("ok", book, flush=True)
            break
        time.sleep(5)
    else:
        print("MISSING", book, flush=True)
    time.sleep(5)
print("DONE", flush=True)
