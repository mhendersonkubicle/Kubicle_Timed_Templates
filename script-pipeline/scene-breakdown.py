# Producer breakdown: turn a built lesson into a review document a producer can
# approve. Maps the full narration script onto the scenes (showing exactly where
# each scene transitions), names the template chosen per scene and what appears on
# screen, derives the reveal beats, and flags anything worth scrutinising (long
# lead-ins, sparse scenes, missing pulses). Writes <project>/BREAKDOWN.md.
#
# Usage: python script-pipeline/scene-breakdown.py projects/<courseId>-l<n>
import sys, re, os

proj = sys.argv[1].rstrip('/\\')
scenes_ts = open(os.path.join(proj, 'src', 'lessonScenes.ts'), encoding='utf-8').read()
srt_path = os.path.join(proj, 'lesson.srt')

# ---- parse SRT into (start, end, text) cues ----
def to_s(t):
    h, m, rest = t.split(':'); s, ms = rest.split(',')
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000

cues = []
if os.path.isfile(srt_path):
    raw = open(srt_path, encoding='utf-8-sig').read()
    for block in re.split(r'\n\s*\n', raw.strip()):
        lines = [l for l in block.splitlines() if l.strip()]
        if len(lines) < 2 or '-->' not in lines[1]:
            continue
        m = re.search(r'(\d\d:\d\d:\d\d,\d+)\s*-->\s*(\d\d:\d\d:\d\d,\d+)', lines[1])
        if not m:
            continue
        txt = ' '.join(lines[2:])
        txt = re.sub(r'<break[^>]*/?>', '', txt).strip()
        if txt:
            cues.append((to_s(m.group(1)), to_s(m.group(2)), txt))

# ---- parse scenes: spans, templates, blocks ----
spans = re.findall(r'\[\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\]', re.search(r'SCENE_SPANS[^\[]*\[(.*?)\];', scenes_ts, re.S).group(1))
spans = [(float(a), float(b)) for a, b in spans]
scene_blocks = re.findall(r'export const (scene\d+): (\w+)Props = \{(.*?)\n\};', scenes_ts, re.S)

TARGETS = re.compile(r'^(setup|header|title|label|logo|badge|goal|heading|description|intro|prompt|anchor|'
                     r'(point|detail|item|pill|message|card|box|leftBox|rightBox|title|left|right)\w*)$')

def onscreen_text(block):
    # human-readable strings = on-screen copy; skip icon ids, targets, staticFile paths.
    out = []
    for s in re.findall(r"'([^']{2,})'|\"([^\"]{2,})\"", block):
        val = s[0] or s[1]
        if 'staticFile' in val or '/' in val or val.endswith('.svg'):
            continue
        if re.match(r'^[a-z0-9]+(-[a-z0-9]+)+$', val):  # icon-id-like
            continue
        if TARGETS.match(val):
            continue
        out.append(val)
    # de-dupe preserving order
    seen = set(); uniq = []
    for v in out:
        if v not in seen: seen.add(v); uniq.append(v)
    return uniq

def reveals(block):
    seq = re.search(r'sequence:\s*\[(.*?)\]', block, re.S)
    if not seq: return []
    return [(t, float(a)) for t, a in re.findall(r"target:\s*'(\w+)',\s*at:\s*([0-9.]+)", seq.group(1))]

def fmt(t):
    return f"{int(t // 60)}:{int(t % 60):02d}"

# ---- lesson header ----
title = re.search(r'//.*?Lesson.*?:\s*(.+)', scenes_ts)
course = re.search(r"courseTitle:\s*'([^']+)'", scenes_ts)
total = re.search(r'TOTAL_SECONDS\s*=\s*([0-9.]+)', scenes_ts)
total = float(total.group(1)) if total else (spans[-1][1] if spans else 0)
tmpls = [t for _, t, _ in scene_blocks]

L = []
L.append(f"# Producer breakdown , {course.group(1) if course else proj}")
L.append("")
L.append(f"**{len(scene_blocks)} scenes | {fmt(total)} total | 30fps 1080p**"
         + (f" | course: {course.group(1)}" if course else ""))
L.append("")
L.append("Preview locally: `git pull`, then `python script-pipeline/open-in-studio.py "
         + os.path.basename(proj) + "`")
L.append("")
L.append("## How to review")
L.append("For each scene, read the **script** against the **template** and **on screen** copy: does the visual land the point being spoken? Tick Approve, or write a change under it (e.g. \"split this beat\", \"wrong template\", \"reword bullet 2\"). **Flags** call out anything already worth a look.")
L.append("")
L.append(f"**Templates used:** {', '.join(tmpls)}  ({len(set(tmpls))} distinct)")
L.append("")

# ---- per scene ----
for i, (nm, tmpl, block) in enumerate(scene_blocks):
    a, b = spans[i] if i < len(spans) else (0, 0)
    dur = b - a
    script = ' '.join(t for (cs, ce, t) in cues if cs < b - 0.05 and ce > a + 0.05).strip()
    text = onscreen_text(block)
    rv = reveals(block)
    # flags: lead-in / inter-gap / tail (content reveals only)
    content = [(t, at) for t, at in rv if t != 'setup']
    flags = []
    if content and tmpl not in ('LessonTitle', 'LessonGoal'):  # openers hold by design
        gaps = [content[0][1]] + [content[j][1] - content[j-1][1] for j in range(1, len(content))] + [dur - content[-1][1]]
        worst = max(gaps)
        if worst > 6:
            where = 'lead-in' if gaps[0] == worst else ('tail' if gaps[-1] == worst else 'mid-scene')
            flags.append(f"{worst:.0f}s static {where} , consider splitting/denser template")
    if 'pulses: [' in block and 'pulses: []' not in block:
        flags.append("has re-mention pulse(s)")

    L.append(f"### Scene {i+1} , {tmpl}   [{fmt(a)}–{fmt(b)}]  ({dur:.0f}s)")
    L.append("")
    L.append(f"> {script if script else '(no narration in this span)'}")
    L.append("")
    if text:
        L.append("**On screen:** " + "; ".join(text))
    if rv:
        L.append("**Reveals:** " + ", ".join(f"{t}@{at:.1f}s" for t, at in rv))
    L.append("**Flags:** " + ("; ".join(flags) if flags else "none"))
    L.append("")
    L.append("- [ ] Approve   ( changes: ____________________ )")
    L.append("")

open(os.path.join(proj, 'BREAKDOWN.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print(f"wrote {proj}/BREAKDOWN.md , {len(scene_blocks)} scenes, {len(cues)} cues mapped")
