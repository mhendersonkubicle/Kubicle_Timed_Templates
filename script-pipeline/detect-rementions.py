# Re-mention pulse detector (timing-fit step).
#
# For each scene, for each already-revealed CONTENT object, scan that scene's
# SRT cues for repeat mentions of the object's key term (anchor). An occurrence
# that lands MORE THAN `GAP` seconds after the object's reveal is a re-mention
# -> emit a pulse {target, at} (scene-relative seconds).
#
# Deterministic: timestamps come from the SRT (sub-cue char-offset estimate).
# Anchors are the object's distinctive term(s); the timing-fit author supplies
# them (the same terms used to place the reveal), so matching is reliable.
#
# Usage: python detect-rementions.py <srt> <config.json>
#   config.json: { "scenes": [ { "id", "span": [start,end],
#                                 "objects": [ {"target","anchor","revealAt"} ] } ] }
# Prints, per scene, the detected pulses (and the matched phrase + time).

import sys, re, json

GAP = 4.0          # a re-mention must be > GAP seconds after the reveal
DEDUPE = 1.0       # collapse matches within this many seconds
MAX_PULSES = 2     # cap pulses per object (avoid over-pulsing)
END_MARGIN = 1.0   # ignore re-mentions within this many seconds of the scene end (no point pulsing right before a cut)

def to_s(t):
    h, m, rest = t.split(':'); s, ms = rest.split(',');
    return int(h)*3600 + int(m)*60 + int(s) + int(ms)/1000

def parse_srt(path):
    raw = open(path, encoding='utf-8-sig').read()
    cues = []
    for block in re.split(r'\n\s*\n', raw.strip()):
        lines = [l for l in block.splitlines() if l.strip()]
        if len(lines) < 2 or '-->' not in lines[1]:
            continue
        m = re.search(r'(\d\d:\d\d:\d\d,\d+)\s*-->\s*(\d\d:\d\d:\d\d,\d+)', lines[1])
        if not m:
            continue
        cues.append((to_s(m.group(1)), to_s(m.group(2)), ' '.join(lines[2:]).strip()))
    return cues

def occurrences(cues, anchor, span):
    """All (scene_relative_seconds) occurrences of `anchor` within the scene span.
    A cue belongs to a scene if start <= cue.start < end; the boundary cue
    (cue.start == scene end == next scene's start) belongs to the NEXT scene, so
    it is excluded here. Matches whose computed time falls outside the span are
    dropped too (a char-offset can push a boundary match past `end`)."""
    a = anchor.lower(); start, end = span; dur = end - start; hits = []
    for st, en, txt in cues:
        if st < start - 0.01 or st >= end - 0.01:
            continue
        low = txt.lower(); idx = 0
        while True:
            i = low.find(a, idx)
            if i == -1:
                break
            rel = round((st + (i / max(1, len(txt))) * (en - st)) - start, 2)
            if 0 <= rel <= dur:
                hits.append(rel)
            idx = i + len(a)
    return sorted(hits)

def detect(cues, cfg):
    out = []
    for scene in cfg['scenes']:
        span = scene['span']; dur = span[1] - span[0]; pulses = []
        for obj in scene.get('objects', []):
            occ = occurrences(cues, obj['anchor'], span)
            reveal = obj['revealAt']
            # re-mentions: occurrences clearly after the reveal, and not jammed
            # against the end of the scene.
            rem = [t for t in occ if t > reveal + GAP and t <= dur - END_MARGIN]
            # dedupe near-duplicates
            kept = []
            for t in rem:
                if not kept or t - kept[-1] > DEDUPE:
                    kept.append(t)
            for t in kept[:MAX_PULSES]:
                pulses.append({'target': obj['target'], 'at': t, '_anchor': obj['anchor']})
        out.append({'id': scene['id'], 'pulses': pulses})
    return out

if __name__ == '__main__':
    cues = parse_srt(sys.argv[1])
    cfg = json.load(open(sys.argv[2], encoding='utf-8'))
    res = detect(cues, cfg)
    for s in res:
        if s['pulses']:
            print(f"-- {s['id']} --")
            for p in s['pulses']:
                print(f"   {p['target']:11} pulse at {p['at']:6.2f}s   <- re-mention of '{p['_anchor']}'")
    print()
    clean = [{'id': s['id'], 'pulses': [{'target': p['target'], 'at': p['at']} for p in s['pulses']]} for s in res]
    print(json.dumps(clean))
