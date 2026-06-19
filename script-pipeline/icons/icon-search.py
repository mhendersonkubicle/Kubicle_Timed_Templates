# Lexical search over the icon index -> a shortlist of REAL icon stems.
#
# This is the deterministic first half of the hybrid resolver: it ranks the
# 4,747-stem library for a query and returns the top candidates (all guaranteed
# to exist). An LLM then picks the best from this real shortlist, so it can never
# invent an id that 404s.
#
# Scoring: IDF-weighted token overlap. A query is tokenized, expanded with
# concept synonyms (concept-synonyms.json), and matched against each stem's
# tokens. Rare, specific tokens (hourglass, wrench) dominate; generic ones
# (business, management, and) barely move the score. Substring hits count at a
# discount so 'magnifier' still finds 'magnifyingglass'.
#
# Usage:
#   python icon-search.py "<query>" [--top N] [--surface dark|light] [--json]
# Examples:
#   python icon-search.py "team of staff" --surface dark
#   python icon-search.py "recurring problem returns" --top 15 --json

import sys, os, re, json, math

HERE = os.path.dirname(__file__)
INDEX = os.path.join(HERE, 'icon-index.json')
SYN = os.path.join(HERE, 'concept-synonyms.json')

STOP = set('a an the of and or to for in on at with is are this that those these '
           'it its as by be we us our you your they them their how what when '
           'where why who which not no into from over under more most less'.split())

def tokenize(s):
    return [t for t in re.split(r'[^a-z0-9]+', s.lower()) if t and t not in STOP]

def load():
    idx = json.load(open(INDEX, encoding='utf-8'))
    syn = {}
    if os.path.exists(SYN):
        raw = json.load(open(SYN, encoding='utf-8'))
        syn = {k: v for k, v in raw.items() if not k.startswith('_')}
    N = idx['count']
    df = idx['df']
    # idf: specific tokens (low df) weigh more. +1 smoothing; query tokens not in
    # the library still get a sensible (high) idf.
    def idf(tok):
        return math.log((N + 1) / (df.get(tok, 0) + 1)) + 1.0
    return idx, syn, idf

def expand(qtokens, syn):
    """Return [(token, weight)]: original query tokens at full weight, synonym
    expansions at a discount (they widen recall but shouldn't outrank a direct hit)."""
    terms = {}
    for t in qtokens:
        terms[t] = max(terms.get(t, 0), 1.0)
        for s in syn.get(t, []):
            for st in tokenize(s):
                terms[st] = max(terms.get(st, 0), 0.55)
    return list(terms.items())

def score_stem(stem_tokens, terms, idf):
    st = set(stem_tokens)
    total = 0.0
    matched = 0
    for term, w in terms:
        best = 0.0
        if term in st:
            best = idf(term)
        else:
            # substring either direction (len>=4 to avoid noise)
            for tok in st:
                if len(term) >= 4 and len(tok) >= 4 and (term in tok or tok in term):
                    best = max(best, 0.6 * idf(term))
        if best > 0:
            matched += 1
            total += w * best
    # small bonus for covering multiple distinct query terms (precision signal)
    if matched > 1:
        total *= (1 + 0.12 * (matched - 1))
    # gentle penalty for very long stems (diffuse meaning)
    total /= (1 + 0.04 * max(0, len(stem_tokens) - 3))
    return total

def search(query, top=15, surface='dark'):
    idx, syn, idf = load()
    terms = expand(tokenize(query), syn)
    scored = []
    for e in idx['stems']:
        sc = score_stem(e['tokens'], terms, idf)
        if sc > 0:
            scored.append((sc, e))
    scored.sort(key=lambda x: -x[0])
    out = []
    for sc, e in scored[:top]:
        vid = e.get(surface) or e.get('light') or e.get('dark')
        out.append({
            'id': vid,                       # exact id for the requested surface
            'stem': e['stem'],
            'score': round(sc, 3),
            'light': e['light'], 'dark': e['dark'],
        })
    return out

def main():
    args = sys.argv[1:]
    if not args:
        print('usage: python icon-search.py "<query>" [--top N] [--surface dark|light] [--json]')
        sys.exit(1)
    top = 15; surface = 'dark'; as_json = False; q = []
    i = 0
    while i < len(args):
        a = args[i]
        if a == '--top': top = int(args[i+1]); i += 2
        elif a == '--surface': surface = args[i+1]; i += 2
        elif a == '--json': as_json = True; i += 1
        else: q.append(a); i += 1
    query = ' '.join(q)
    res = search(query, top, surface)
    if as_json:
        print(json.dumps({'query': query, 'surface': surface, 'candidates': res}))
    else:
        print(f"query: {query!r}  surface: {surface}")
        for r in res:
            print(f"  {r['score']:7.3f}  {r['id']}")

if __name__ == '__main__':
    main()
