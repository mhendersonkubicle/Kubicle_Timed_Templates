# Build a searchable index of the master Icons/ library.
#
# The library holds ~4,747 stems, each as a `-light` and `-dark` variant (a few
# carry `-2`/`-3` alternate designs). Filenames are keyword-rich and hyphenated,
# e.g. `business-strategy-team-light`, `conflict-management-conflict-dark`.
#
# This produces icon-index.json:
#   {
#     "root": "Icons",
#     "count": <stem count>,
#     "df": { token: document_frequency, ... },   # for IDF weighting in search
#     "stems": [
#        { "stem": "business-strategy-team",
#          "tokens": ["business","strategy","team"],
#          "light": "business-strategy-team-light",   # exact id or null
#          "dark":  "business-strategy-team-dark" },
#        ...
#     ]
#   }
#
# Usage: python build-icon-index.py [Icons-dir] [out.json]

import sys, os, re, json, math
from collections import defaultdict

ICONS_DIR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(__file__), '..', '..', 'Icons')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
    os.path.dirname(__file__), 'icon-index.json')

# filename (no .svg) -> stem + variant (+ optional alt index)
PAT = re.compile(r'^(?P<stem>.+?)-(?P<variant>light|dark)(?:-(?P<alt>\d+))?$')

def main():
    stems = {}  # stem -> {"tokens", "light", "dark"}
    skipped = []
    for fn in os.listdir(ICONS_DIR):
        if not fn.lower().endswith('.svg'):
            continue
        base = fn[:-4]
        m = PAT.match(base)
        if not m:
            skipped.append(fn)
            continue
        stem = m.group('stem')
        variant = m.group('variant')
        alt = m.group('alt')
        e = stems.setdefault(stem, {"light": None, "dark": None})
        # prefer the non-alt (canonical) id; only fill an alt if nothing yet
        if e[variant] is None or alt is None:
            if e[variant] is None or alt is None:
                e[variant] = base

    # tokens + document frequency
    df = defaultdict(int)
    out_stems = []
    for stem, e in sorted(stems.items()):
        toks = [t for t in stem.split('-') if not t.isdigit()]
        for t in set(toks):
            df[t] += 1
        out_stems.append({
            "stem": stem, "tokens": toks,
            "light": e["light"], "dark": e["dark"],
        })

    index = {
        "root": os.path.basename(os.path.normpath(ICONS_DIR)),
        "count": len(out_stems),
        "df": dict(sorted(df.items())),
        "stems": out_stems,
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False)
    print(f"indexed {len(out_stems)} stems, {len(df)} unique tokens -> {OUT}")
    if skipped:
        print(f"skipped {len(skipped)} non-variant files (e.g. {skipped[:3]})")

if __name__ == '__main__':
    main()
