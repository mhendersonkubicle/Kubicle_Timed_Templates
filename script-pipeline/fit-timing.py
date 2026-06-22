# Deterministic timing: turn a scene plan into SRT-derived reveal times.
#
# Input plan JSON:
#   { "scenes": [ { "id", "cueStart", "cueEnd",
#                   "setupIn": 0.6,                      # optional setup entrance
#                   "slots": [ {"target": "leftTitle", "anchor": "policy"}, ... ] } ] }
#   - cueStart/cueEnd are 1-based SRT cue numbers bounding the scene.
#   - each slot's `anchor` is a short phrase spoken when that slot should reveal.
#
# Output (JSON): for each scene a span + a reveal `sequence` (setup first, then each
# slot at the scene-relative second its anchor is spoken), plus a `rementions` block
# (target+anchor+revealAt) ready to feed detect-rementions.py. Also TOTAL seconds.
#
# Timing rule (matches the hand-built lessons): scene span = [first cue start, next
# scene's first cue start]; a slot's `at` = the char-offset time of its anchor inside
# the cue that first contains it, minus the scene start. No anchor match -> the slot
# is spaced evenly after setup and a warning is emitted (never silently wrong).
#
# Usage: python fit-timing.py <srt> <plan.json>   (prints JSON to stdout)

import sys, re, json

def to_s(t):
    h, m, rest = t.split(':'); s, ms = rest.split(',')
    return int(h)*3600 + int(m)*60 + int(s) + int(ms)/1000

def parse_srt(path):
    raw = open(path, encoding='utf-8-sig').read()
    cues = {}
    order = []
    for block in re.split(r'\n\s*\n', raw.strip()):
        lines = [l for l in block.splitlines() if l.strip()]
        if len(lines) < 2 or '-->' not in lines[1]:
            continue
        m = re.search(r'(\d\d:\d\d:\d\d,\d+)\s*-->\s*(\d\d:\d\d:\d\d,\d+)', lines[1])
        if not m:
            continue
        idx = int(lines[0])
        txt = ' '.join(lines[2:])
        txt = re.sub(r'<break[^>]*/?>', '', txt)
        txt = re.sub(r'time="[^"]*"\s*/?>?', '', txt)
        txt = (txt.replace('’', "'").replace('‘', "'")
                  .replace('“', '"').replace('”', '"')
                  .replace('–', '-').replace('—', ', '))
        cues[idx] = (to_s(m.group(1)), to_s(m.group(2)), txt.strip())
        order.append(idx)
    return cues, order

def anchor_time(cues, order, cue_start, cue_end, anchor):
    """Scene-relative-agnostic absolute time of `anchor` within [cue_start,cue_end]."""
    a = (anchor or '').lower().strip()
    if not a:
        return None
    for idx in order:
        if idx < cue_start or idx > cue_end:
            continue
        st, en, txt = cues[idx]
        i = txt.lower().find(a)
        if i != -1:
            frac = i / max(1, len(txt))
            return st + frac * (en - st)
    return None

def main():
    cues, order = parse_srt(sys.argv[1])
    plan = json.load(open(sys.argv[2], encoding='utf-8'))
    scenes_in = plan['scenes']
    last_cue = order[-1]

    out_scenes = []
    warnings = []
    for si, sc in enumerate(scenes_in):
        cs, ce = sc['cueStart'], sc['cueEnd']
        span_start = cues[cs][0]
        # span end = next scene's first cue start, else end of last cue in this scene
        if si + 1 < len(scenes_in):
            span_end = cues[scenes_in[si+1]['cueStart']][0]
        else:
            span_end = cues[ce][1] if ce in cues else cues[last_cue][1]
        dur = span_end - span_start

        seq = [{'target': 'setup', 'at': 0.2}]
        if sc.get('setupIn') is not None:
            seq[0]['in'] = sc['setupIn']
        rem_objs = []
        slots = sc.get('slots', [])
        unmatched = []
        for j, sl in enumerate(slots):
            t = anchor_time(cues, order, cs, ce, sl.get('anchor'))
            if t is None:
                unmatched.append((sl['target'], sl.get('anchor')))
                # evenly space unmatched slots across the scene as a safe fallback
                at = round(min(dur - 0.5, 0.5 + (j + 1) * (dur / (len(slots) + 1))), 2)
            else:
                at = round(max(0.0, t - span_start), 2)
            seq.append({'target': sl['target'], 'at': at})
            rem_objs.append({'target': sl['target'], 'anchor': sl.get('anchor', ''), 'revealAt': at})
        # keep reveal order monotonic by `at` (stable) after setup
        head, tail = seq[0], sorted(seq[1:], key=lambda s: s['at'])
        out_scenes.append({
            'id': sc['id'],
            'span': [round(span_start, 3), round(span_end, 3)],
            'sequence': [head] + tail,
            'rementions': {'id': sc['id'], 'span': [round(span_start, 3), round(span_end, 3)], 'objects': rem_objs},
        })
        for tgt, anc in unmatched:
            warnings.append(f"{sc['id']}: anchor not found for {tgt!r} (anchor={anc!r}); spaced evenly + flagged")

    result = {
        'totalSeconds': round(cues[last_cue][1], 3),
        'scenes': out_scenes,
        'rementionsConfig': {'scenes': [s['rementions'] for s in out_scenes]},
        'warnings': warnings,
    }
    print(json.dumps(result, indent=2))
    if warnings:
        sys.stderr.write('\n'.join(warnings) + '\n')

if __name__ == '__main__':
    main()
