# Guardrail: assert every icon id a lesson references actually exists, so no
# 404 (blank icon) ever ships.
#
# Ground truth is the master Icons/ directory (file existence), not the index,
# so it also catches alt designs (-dark-2) and anything added after indexing.
#
# Usage:
#   python validate-icons.py --ids id1 id2 ...
#   python validate-icons.py --scene-file path/to/lessonScenes.ts
#   python validate-icons.py --scene-file ... --public path/to/public/icons
#
# Exits 1 if any referenced id is missing from Icons/ (and, if --public given,
# warns about ids not yet staged into that public folder).

import sys, os, re, json

HERE = os.path.dirname(__file__)
ICONS_DIR = os.path.normpath(os.path.join(HERE, '..', '..', 'Icons'))

def ids_from_scene_file(path):
    txt = open(path, encoding='utf-8').read()
    # any field ending in icon/Icon (icon, titleIcon, centerIcon, centreIcon) ...
    ids = re.findall(r"(?:[A-Za-z]*[Ii]con)\s*:\s*['\"]([^'\"]+)['\"]", txt)
    # ... plus `id:` values that look like icon ids (end in -light/-dark), which
    # catches hero/discriminated-union icons while skipping character ids.
    ids += re.findall(r"\bid\s*:\s*['\"]([^'\"]+-(?:light|dark))['\"]", txt)
    return sorted(set(ids))

def main():
    args = sys.argv[1:]
    ids = []; scene_file = None; public = None
    i = 0
    while i < len(args):
        a = args[i]
        if a == '--ids':
            i += 1
            while i < len(args) and not args[i].startswith('--'):
                ids.append(args[i]); i += 1
        elif a == '--scene-file': scene_file = args[i+1]; i += 2
        elif a == '--public': public = args[i+1]; i += 2
        else: i += 1

    if scene_file:
        ids += ids_from_scene_file(scene_file)
    ids = sorted(set(ids))
    if not ids:
        print('no icon ids found to validate'); return

    missing, ok, unstaged = [], [], []
    for iid in ids:
        if os.path.exists(os.path.join(ICONS_DIR, iid + '.svg')):
            ok.append(iid)
            if public and not os.path.exists(os.path.join(public, iid + '.svg')):
                unstaged.append(iid)
        else:
            missing.append(iid)

    print(f"checked {len(ids)} icon ids against {ICONS_DIR}")
    print(f"  OK (real):  {len(ok)}")
    if missing:
        print(f"  MISSING (do not exist, would 404): {len(missing)}")
        for m in missing: print(f"     x {m}")
    if public:
        if unstaged:
            print(f"  NOT STAGED into {public}: {len(unstaged)}")
            for u in unstaged: print(f"     ! {u}  (run stage-icons.py)")
        else:
            print(f"  all real ids are staged into {public}")
    if missing:
        sys.exit(1)
    print("PASS: every referenced icon id is real.")

if __name__ == '__main__':
    main()
