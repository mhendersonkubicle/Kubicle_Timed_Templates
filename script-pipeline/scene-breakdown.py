# Producer breakdown / CONFIRMATION document: turn a built lesson into the review
# document a producer approves BEFORE the lesson is rendered. Maps the full
# narration script onto the scenes (showing exactly where each scene transitions),
# names the template chosen per scene, lists the on-screen text WITH its character
# limit (so length is visible and enforceable), derives the reveal beats, links the
# scene library, and flags anything worth scrutinising. Writes <project>/BREAKDOWN.md.
#
# This is the human-in-the-loop gate: nothing is rendered until the producer ticks
# Approve (or requests changes) on every scene. See PRODUCER.md and the
# lesson-video-pipeline skill.
#
# Usage: python script-pipeline/scene-breakdown.py projects/<courseId>-l<n>
import sys, re, os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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
                     r'(point|detail|item|pill|message|card|box|leftBox|rightBox|title|left|right|tile|tick|row)\w*)$')

def is_human_text(val):
    if 'staticFile' in val or '/' in val or val.endswith('.svg'):
        return False
    if re.match(r'^[a-z0-9]+(-[a-z0-9]+)+$', val):   # icon-id-like (kebab)
        return False
    if re.match(r'^[a-z]+(_[a-z0-9]+)+$', val):       # character-id-like (snake)
        return False
    if TARGETS.match(val):
        return False
    return True

# ---- per-template character limits, parsed from the template's zod schema ----
_LIMIT_CACHE = {}
def tmpl_limits(tmpl):
    if tmpl in _LIMIT_CACHE:
        return _LIMIT_CACHE[tmpl]
    path = os.path.join(REPO, 'templates', tmpl, tmpl + '.tsx')
    lim = {}
    if os.path.isfile(path):
        src = open(path, encoding='utf-8').read()
        # direct string fields:  field: z.string()...max(N)
        for fld, mx in re.findall(r"(\w+):\s*z\.string\(\)(?:\.\w+\([^)]*\))*?\.max\((\d+)\)", src):
            lim.setdefault(fld, int(mx))
        # array-of-string element max:  field: z.array(z.string()...max(N))
        for fld, mx in re.findall(r"(\w+):\s*z\.array\(\s*z\.string\(\)(?:\.\w+\([^)]*\))*?\.max\((\d+)\)", src):
            lim.setdefault(fld, int(mx))
    _LIMIT_CACHE[tmpl] = lim
    return lim

def text_fields(block, limits):
    """Return [(text, count, limit_or_None)] for the on-screen copy in a scene block."""
    out, seen = [], set()
    def add(val, fld):
        if fld in ('kind', 'id') or val in ('icon', 'character'):   # discriminators, not copy
            return
        if val in seen or not is_human_text(val):
            return
        seen.add(val)
        out.append((val, len(val), limits.get(fld)))
    # named string fields (top-level AND inside object arrays, e.g. milestone title/description)
    for fld, val in re.findall(r"(\w+):\s*'([^']{2,})'", block):
        add(val, fld)
    # plain string arrays (bullets/details/recaps/responsibilities): items have no field name
    for fld, body in re.findall(r"(\w+):\s*\[([^\]]*)\]", block):
        if fld in ('sequence', 'pulses') or '{' in body:   # skip timing + object arrays
            continue
        for v in re.findall(r"'([^']{2,})'", body):
            add(v, fld)
    return out

def reveals(block):
    seq = re.search(r'sequence:\s*\[(.*?)\]', block, re.S)
    if not seq:
        return []
    return [(t, float(a)) for t, a in re.findall(r"target:\s*'(\w+)',\s*at:\s*([0-9.]+)", seq.group(1))]

def fmt(t):
    return f"{int(t // 60)}:{int(t % 60):02d}"

# ---- lesson header ----
course = re.search(r"courseTitle:\s*'([^']+)'", scenes_ts)
total = re.search(r'TOTAL_SECONDS\s*=\s*([0-9.]+)', scenes_ts)
total = float(total.group(1)) if total else (spans[-1][1] if spans else 0)
tmpls = [t for _, t, _ in scene_blocks]

L = []
L.append(f"# Producer confirmation , {course.group(1) if course else proj}")
L.append("")
L.append(f"**{len(scene_blocks)} scenes | {fmt(total)} total | 30fps 1080p**"
         + (f" | course: {course.group(1)}" if course else ""))
L.append("")
L.append("**This is the sign-off gate. Nothing is rendered until you approve every scene below**")
L.append("(or note the changes you want, and they are applied first).")
L.append("")
L.append("- **Scene library** (every template, rendered): open `TEMPLATE-CATALOG.html` at the repo root, "
         "or browse it to swap a template.")
L.append("- **Preview locally:** `python script-pipeline/open-in-studio.py " + os.path.basename(proj) + "`")
L.append("")
L.append("## How to review")
L.append("For each scene, read the **script** against the **template** and the **on-screen** text: does the "
         "visual land the point being spoken? Each on-screen line shows `(used/limit)` characters. The limit is "
         "fixed by the template so the text fits its frame, if you ask for longer copy you will be pushed back to "
         "the limit (shorten the wording or pick a roomier template). Tick **Approve**, or write a change under "
         "the scene (\"split this beat\", \"wrong template, use X from the library\", \"reword bullet 2\").")
L.append("")
L.append(f"**Templates used:** {', '.join(tmpls)}  ({len(set(tmpls))} distinct)")
L.append("")

# ---- per scene ----
for i, (nm, tmpl, block) in enumerate(scene_blocks):
    a, b = spans[i] if i < len(spans) else (0, 0)
    dur = b - a
    script = ' '.join(t for (cs, ce, t) in cues if cs < b - 0.05 and ce > a + 0.05).strip()
    limits = tmpl_limits(tmpl)
    fields = text_fields(block, limits)
    rv = reveals(block)
    content = [(t, at) for t, at in rv if t != 'setup']
    flags = []
    if content and tmpl not in ('LessonTitle', 'LessonGoal'):
        gaps = [content[0][1]] + [content[j][1] - content[j-1][1] for j in range(1, len(content))] + [dur - content[-1][1]]
        worst = max(gaps)
        if worst > 6:
            where = 'lead-in' if gaps[0] == worst else ('tail' if gaps[-1] == worst else 'mid-scene')
            flags.append(f"{worst:.0f}s static {where} , consider splitting/denser template")
    over = [f"\"{t}\" ({c}/{lim})" for (t, c, lim) in fields if lim and c > lim]
    if over:
        flags.append("OVER character limit: " + ", ".join(over))
    if 'pulses: [' in block and 'pulses: []' not in block:
        flags.append("has re-mention pulse(s)")

    L.append(f"### Scene {i+1} , {tmpl}   [{fmt(a)} to {fmt(b)}]  ({dur:.0f}s)")
    L.append("")
    L.append(f"> {script if script else '(no narration in this span)'}")
    L.append("")
    if fields:
        L.append("**On screen** (used/limit chars):")
        for (t, c, lim) in fields:
            limtxt = f"{c}/{lim}" + ("  OVER" if (lim and c > lim) else "") if lim else f"{c}/-"
            L.append(f"- {t}  `({limtxt})`")
    if rv:
        L.append("")
        L.append("**Reveals:** " + ", ".join(f"{t}@{at:.1f}s" for t, at in rv))
    L.append("**Flags:** " + ("; ".join(flags) if flags else "none"))
    L.append("")
    L.append("- [ ] Approve   ( changes: ____________________ )")
    L.append("")

open(os.path.join(proj, 'BREAKDOWN.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print(f"wrote {proj}/BREAKDOWN.md , {len(scene_blocks)} scenes, {len(cues)} cues mapped")
