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

# Opener templates animate in EARLY over the first few seconds, ignoring the
# narration. Their reveals are front-loaded with fixed offsets (setup at 0.2,
# then each slot in order), never anchored to the SRT. This keeps the lesson
# intro and lesson goal from waiting on the voiceover. Requires the scene plan
# to carry `template` (or `frontload: true`).
FRONTLOAD_TEMPLATES = {'LessonTitle', 'LessonGoal'}
FRONTLOAD_START = 0.7    # first reveal after setup
FRONTLOAD_STEP = 0.6     # spacing between subsequent reveals

# Keep-moving rule: a scene must not sit still for long. The first content reveal
# lands by FIRST_CONTENT_CAP, and no static stretch (before the first reveal,
# between reveals, or after the last reveal) exceeds MAX_STATIC_GAP. If the
# narration-anchored timing would hang longer than that, the reveals are spread
# evenly across the scene (revealing slightly ahead of narration is acceptable for
# dynamism). If even an even spread can't get gaps under MAX_STATIC_GAP, the scene
# is too sparse for its length and a warning says to split it / use a denser template.
FIRST_CONTENT_CAP = 2.5
MAX_STATIC_GAP = 5.0
END_TAIL_PAD = 2.5

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
        frontload = sc.get('template') in FRONTLOAD_TEMPLATES or sc.get('frontload') is True
        for j, sl in enumerate(slots):
            if frontload:
                # Opener: front-load into the first few seconds, ignore the SRT anchor.
                at = round(FRONTLOAD_START + j * FRONTLOAD_STEP, 2)
            else:
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

        # Keep-moving: openers are already front-loaded; for other scenes, if the
        # anchored reveals cluster or leave a static gap > MAX_STATIC_GAP, spread
        # them evenly so something keeps happening across the whole scene.
        if not frontload and tail:
            n = len(tail)
            spans_gaps = ([tail[0]['at']]
                          + [tail[i]['at'] - tail[i - 1]['at'] for i in range(1, n)]
                          + [dur - tail[-1]['at']])
            if tail[0]['at'] > FIRST_CONTENT_CAP or max(spans_gaps) > MAX_STATIC_GAP:
                end = max(FIRST_CONTENT_CAP + 0.1, dur - END_TAIL_PAD)
                if n == 1:
                    tail[0]['at'] = round(min(FIRST_CONTENT_CAP, end), 2)
                else:
                    step = (end - FIRST_CONTENT_CAP) / (n - 1)
                    for i, c in enumerate(tail):
                        c['at'] = round(FIRST_CONTENT_CAP + i * step, 2)
                    if step > MAX_STATIC_GAP:
                        warnings.append(
                            f"{sc['id']}: {n} reveals over {dur:.0f}s still leave ~{step:.0f}s gaps when spread; "
                            f"too sparse, split this beat or use a denser/continuous-motion template")
                if n == 1 and dur > FIRST_CONTENT_CAP + MAX_STATIC_GAP:
                    warnings.append(
                        f"{sc['id']}: single reveal over {dur:.0f}s; split this beat or use a continuous-motion template")
                # re-sync re-mention reveal times to the redistributed reveals
                newat = {c['target']: c['at'] for c in tail}
                for r in rem_objs:
                    if r['target'] in newat:
                        r['revealAt'] = newat[r['target']]

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
