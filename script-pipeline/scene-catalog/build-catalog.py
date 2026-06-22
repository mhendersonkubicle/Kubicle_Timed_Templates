#!/usr/bin/env python3
# Build the SCENE LIBRARY: one rendered example still of every template, grouped
# by category, into TEMPLATE-CATALOG.html at the repo root. This is the resource
# the producer browses at the approval stage (and the link the BREAKDOWN points to).
#
# Self-contained and repo-relative: reuses the in-repo `harness/` render deps
# (runs `npm ci` there once if needed), so any clone can regenerate the catalog
# after adding or changing a template.
#
# Usage:  python script-pipeline/scene-catalog/build-catalog.py
import os, re, sys, json, glob, shutil, base64, html, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))            # .../script-pipeline/scene-catalog -> repo
TEMPLATES = os.path.join(REPO, 'templates')
ICONS = os.path.join(REPO, 'Icons')
CHARS = os.path.join(REPO, 'CHARACTER LIBRARY (PNG)')
LOGOS = os.path.join(REPO, 'Logos')
FONTS = os.path.join(REPO, 'fonts')
HARNESS = os.path.join(REPO, 'harness')
BUILD = os.path.join(HERE, '_build')
OUT = os.path.join(HERE, 'out')
FPS = 30

# templates whose auto-frame lands on a sparse moment (one-at-a-time carousels etc.)
FRAME_OVERRIDES = {'Carousel7PillsHorizontalV1': 200}
# neutral placeholder for icon ids an example references that are not in the library
PLACEHOLDER = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
               '<circle cx="32" cy="32" r="22" fill="none" stroke="#8aa0b6" stroke-width="4"/>'
               '<circle cx="32" cy="32" r="7" fill="#8aa0b6"/></svg>')


def run(cmd, **kw):
    print('  $', ' '.join(cmd))
    subprocess.run(cmd, check=True, **kw)


def ensure_harness():
    if os.path.isdir(os.path.join(HARNESS, 'node_modules', '@remotion')):
        return
    print('harness render deps missing, installing once (npm ci in harness/) ...')
    npm = 'npm.cmd' if os.name == 'nt' else 'npm'
    run([npm, 'ci'], cwd=HARNESS)


def reset_build():
    shutil.rmtree(BUILD, ignore_errors=True)
    os.makedirs(os.path.join(BUILD, 'src'), exist_ok=True)
    os.makedirs(os.path.join(BUILD, 'public'), exist_ok=True)
    os.makedirs(OUT, exist_ok=True)


def copy_templates():
    dst_root = os.path.join(BUILD, 'src', 'templates')
    for root, _, files in os.walk(TEMPLATES):
        for f in files:
            if f.endswith('.tsx'):
                src = os.path.join(root, f)
                dst = os.path.join(dst_root, os.path.relpath(src, TEMPLATES))
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy(src, dst)


def stage_assets():
    pub = os.path.join(BUILD, 'public')
    run([sys.executable, os.path.join(REPO, 'script-pipeline', 'stage-assets.py'), '--dest', pub, '--all'])
    for sub, srcdir, pat in [('fonts', FONTS, '*.woff2'), ('characters', CHARS, '*.png')]:
        d = os.path.join(pub, sub); os.makedirs(d, exist_ok=True)
        for f in glob.glob(os.path.join(srcdir, pat)):
            shutil.copy(f, d)
    ldst = os.path.join(pub, 'logos'); os.makedirs(ldst, exist_ok=True)   # flatten logo tree
    for root, _, files in os.walk(LOGOS):
        for f in files:
            if f.endswith('.svg'):
                shutil.copy(os.path.join(root, f), os.path.join(ldst, f))


def categories():
    sel = {}
    idx = os.path.join(TEMPLATES, 'SELECTION_INDEX.md')
    if os.path.isfile(idx):
        for line in open(idx, encoding='utf-8'):
            m = re.match(r'\|\s*\[([A-Za-z0-9]+)\]\([^)]+\)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|', line)
            if m:
                sel[m.group(1)] = {'category': m.group(2).strip(), 'useWhen': m.group(3).strip()}
    return sel


def generate():
    """Pick one example per template, write Root.tsx + index.ts + manifest, stage icons."""
    sel = categories()
    icon_files = set(os.path.splitext(f)[0] for f in os.listdir(ICONS) if f.endswith('.svg'))
    char_files = set(os.path.splitext(f)[0] for f in os.listdir(CHARS) if f.endswith('.png'))
    default_char = sorted(char_files)[0] if char_files else None
    entries, icon_refs, char_refs = [], set(), set()

    for tdir in sorted(os.listdir(TEMPLATES)):
        tpath = os.path.join(TEMPLATES, tdir)
        if not os.path.isdir(tpath) or tdir == 'examples':
            continue
        if not os.path.exists(os.path.join(tpath, tdir + '.tsx')):
            continue
        examples = sorted(glob.glob(os.path.join(tpath, 'examples', '*', '*.example.tsx')))
        if not examples:
            continue
        ex = examples[0]
        txt = open(ex, encoding='utf-8').read()
        mname = re.search(r'export\s+(?:const|function)\s+([A-Za-z0-9_]+)', txt)
        if not mname:
            continue
        # frame from the last CONTENT reveal (exclude outro/exit, which clear the stage)
        pairs = re.findall(r"target:\s*['\"]([^'\"]+)['\"]\s*,\s*at:\s*([\d.]+)", txt)
        content = [float(a) for tg, a in pairs if 'outro' not in tg.lower() and 'exit' not in tg.lower()]
        if not content:
            content = [float(x) for x in re.findall(r'\bat:\s*([\d.]+)', txt)] or [1.5]
        frame = FRAME_OVERRIDES.get(tdir, int(round((max(content) + 1.6) * FPS)))
        # collect referenced icon ids + character ids
        for m in re.findall(r"\b\w*[Ii]con\w*\s*:\s*['\"]([^'\"]+)['\"]", txt):
            icon_refs.add(m)
        for m in re.findall(r"['\"]([a-z0-9]+(?:-[a-z0-9]+)+)['\"]", txt):
            if re.search(r"-(?:light|dark)(?:-\d+)?$", m):
                icon_refs.add(m)
        for m in re.findall(r"\bcharacterId\s*:\s*['\"]([^'\"]+)['\"]", txt):
            char_refs.add(m)
        for m in re.findall(r"character=\{\{\s*id:\s*['\"]([^'\"]+)['\"]", txt):
            char_refs.add(m)
        rel = os.path.relpath(ex, TEMPLATES).replace('\\', '/')
        entries.append({
            'template': tdir, 'compId': tdir, 'component': mname.group(1),
            'import': './templates/' + rel[:-4], 'frame': frame, 'dur': frame + 60,
            'category': sel.get(tdir, {}).get('category', ''),
            'useWhen': sel.get(tdir, {}).get('useWhen', ''),
        })

    # Root.tsx + index.ts
    imports = '\n'.join(f"import {{ {e['component']} }} from '{e['import']}';" for e in entries)
    comps = '\n'.join(
        f'      <Composition id="{e["compId"]}" component={{{e["component"]}}} '
        f'durationInFrames={{{e["dur"]}}} fps={{{FPS}}} width={{1920}} height={{1080}} />'
        for e in entries)
    open(os.path.join(BUILD, 'src', 'Root.tsx'), 'w', encoding='utf-8').write(
        "import React from 'react';\nimport { Composition } from 'remotion';\n"
        f"{imports}\n\nexport const RemotionRoot: React.FC = () => {{\n  return (\n    <>\n{comps}\n    </>\n  );\n}};\n")
    open(os.path.join(BUILD, 'src', 'index.ts'), 'w', encoding='utf-8').write(
        "import { registerRoot } from 'remotion';\nimport { RemotionRoot } from './Root';\nregisterRoot(RemotionRoot);\n")

    # stage icons (real where they exist, else a neutral placeholder so nothing 404s)
    dst_icons = os.path.join(BUILD, 'public', 'icons'); os.makedirs(dst_icons, exist_ok=True)
    real = placed = 0
    for iid in sorted(icon_refs):
        if '/' in iid or ' ' in iid:
            continue
        dst = os.path.join(dst_icons, iid + '.svg')
        src = os.path.join(ICONS, iid + '.svg')
        if os.path.exists(src):
            shutil.copy(src, dst); real += 1
        else:
            open(dst, 'w', encoding='utf-8').write(PLACEHOLDER); placed += 1
    # patch any missing character portrait so it never renders a broken box
    dst_chars = os.path.join(BUILD, 'public', 'characters'); os.makedirs(dst_chars, exist_ok=True)
    if default_char:
        for cid in sorted(char_refs):
            if cid not in char_files and not os.path.exists(os.path.join(dst_chars, cid + '.png')):
                shutil.copy(os.path.join(CHARS, default_char + '.png'), os.path.join(dst_chars, cid + '.png'))

    json.dump(entries, open(os.path.join(BUILD, 'catalog-manifest.json'), 'w', encoding='utf-8'), indent=2)
    print(f"  generated {len(entries)} templates | icons: {real} real, {placed} placeholder")
    return entries


def render():
    env = {**os.environ, 'REPO': REPO, 'HARNESS': HARNESS, 'BUILD': BUILD, 'OUT': OUT}
    run(['node', os.path.join(HERE, 'render.mjs')], cwd=HERE, env=env)


def build_html(entries):
    def b64(p):
        return base64.b64encode(open(p, 'rb').read()).decode()
    groups, total = {}, 0
    for e in entries:
        png = os.path.join(OUT, e['compId'] + '.png')
        if not os.path.exists(png):
            continue
        e['img'] = 'data:image/png;base64,' + b64(png)
        groups.setdefault(e['category'] or 'other', []).append(e); total += 1
    order = ['opener', 'goal', 'definition', 'comparison', 'list', 'process', 'timeline',
             'cycle', 'hierarchy', 'people', 'chat', 'diagram', 'case-study', 'summary', 'other']
    def rank(c):
        c = c.lower()
        for i, k in enumerate(order):
            if k in c:
                return i
        return len(order)
    cats = sorted(groups.keys(), key=lambda c: (rank(c), c.lower()))
    cards = []
    for c in cats:
        items = sorted(groups[c], key=lambda e: e['template'].lower())
        cards.append(f'<h2 class="cat">{html.escape(c)} <span class="n">{len(items)}</span></h2>')
        cards.append('<div class="grid">')
        for e in items:
            cards.append('<figure class="card">'
                         f'<div class="shot"><img loading="lazy" src="{e["img"]}" alt="{html.escape(e["template"])}"></div>'
                         f'<figcaption><div class="name">{html.escape(e["template"])}</div>'
                         f'<div class="use">{html.escape(e["useWhen"])}</div></figcaption></figure>')
        cards.append('</div>')
    doc = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kubicle Template Catalog</title><style>
  :root { --bg:#0a1626; --panel:#102339; --ink:#eaf2fb; --muted:#94a9c0; --accent:#3aa0ff; --line:#1d3450; }
  * { box-sizing:border-box; } body { margin:0; background:var(--bg); color:var(--ink);
    font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif; }
  header { padding:34px 40px 10px; } h1 { margin:0; font-size:1.7rem; letter-spacing:-0.01em; }
  .sub { color:var(--muted); margin:6px 0 0; font-size:.92rem; max-width:70ch; line-height:1.5; }
  .legend { color:var(--muted); font-size:.8rem; margin-top:10px; } .legend b { color:var(--ink); }
  main { padding:8px 40px 64px; }
  h2.cat { text-transform:capitalize; font-size:1.05rem; margin:34px 0 14px; padding-bottom:8px; border-bottom:1px solid var(--line); }
  h2.cat .n { color:var(--muted); font-weight:500; font-size:.85rem; }
  .grid { display:grid; gap:20px; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); }
  .card { margin:0; background:var(--panel); border:1px solid var(--line); border-radius:12px; overflow:hidden; }
  .shot { background:#000; aspect-ratio:16/9; } .shot img { width:100%; height:100%; object-fit:contain; display:block; }
  figcaption { padding:12px 14px 14px; } .name { font-weight:700; font-size:1rem; }
  .use { color:var(--muted); font-size:.82rem; line-height:1.45; margin-top:5px; }
  @media print { body { background:#fff; color:#0a1626; } .card { background:#fff; border-color:#ccd6e0; break-inside:avoid; }
    .shot { background:#0a1626; } header, main { padding-left:18px; padding-right:18px; } .use,.sub,.legend,h2.cat .n { color:#566; } }
</style></head><body>
<header><h1>Kubicle Motion Template Catalog</h1>
  <p class="sub">One rendered example of every template in the library, grouped by category. Use it to pick the right template for a beat.</p>
  <p class="legend"><b>__TOTAL__ templates.</b> A grey target glyph is a placeholder where an example referenced an icon id not in the master Icons library; real lessons resolve real icons.</p>
</header><main>
__CARDS__
</main></body></html>"""
    doc = doc.replace('__TOTAL__', str(total)).replace('__CARDS__', '\n'.join(cards))
    open(os.path.join(REPO, 'TEMPLATE-CATALOG.html'), 'w', encoding='utf-8').write(doc)
    mb = len(doc.encode('utf-8')) / 1e6
    print(f"  wrote TEMPLATE-CATALOG.html ({mb:.1f} MB), {total} templates, {len(cats)} categories")


def main():
    print('Building scene library catalog ...')
    ensure_harness()
    reset_build()
    copy_templates()
    stage_assets()
    entries = generate()
    render()
    build_html(entries)
    print('Done. Open TEMPLATE-CATALOG.html at the repo root.')


if __name__ == '__main__':
    main()
