# Stage company logos into a render's public/logos/ folder.
#
# Case studies use FICTIONAL company logos (Logos/Fictional-Company-Logos/), and a
# real named product uses a Software logo (Logos/Software/). Logo ids are unique
# full filenames (e.g. "Company-AeroEdge-light", "Microsoft-Logo"), so a flat
# public/logos/ folder is collision-free. The CaseStudyIntro template fetches
# logos/<id>.svg.
#
# Usage:
#   python stage-logos.py --dest <public/logos> --ids Company-AeroEdge-light ...
#   python stage-logos.py --dest <public/logos> --scene-file <lessonScenes.ts>
#   python stage-logos.py --list            # print available fictional company ids
#
# Exits 1 if any referenced logo id is missing.

import sys, os, re, shutil

HERE = os.path.dirname(__file__)
LOGOS = os.path.normpath(os.path.join(HERE, '..', 'Logos'))
SRC_DIRS = [os.path.join(LOGOS, 'Fictional-Company-Logos'), os.path.join(LOGOS, 'Software')]

def find_logo(iid):
    for d in SRC_DIRS:
        p = os.path.join(d, iid + '.svg')
        if os.path.exists(p):
            return p
    return None

def ids_from_scene_file(path):
    txt = open(path, encoding='utf-8').read()
    return sorted(set(re.findall(r"\blogo\s*:\s*['\"]([^'\"]+)['\"]", txt)))

def main():
    args = sys.argv[1:]
    ids = []; dest = None; scene_file = None
    i = 0
    while i < len(args):
        a = args[i]
        if a == '--list':
            d = SRC_DIRS[0]
            names = sorted({re.sub(r'-(light|dark)$', '', os.path.splitext(f)[0])
                            for f in os.listdir(d) if f.endswith('.svg')})
            print('Fictional companies (use with -light on the light CaseStudyIntro card):')
            print('  ' + ', '.join(names))
            return
        if a == '--dest': dest = args[i+1]; i += 2
        elif a == '--ids':
            i += 1
            while i < len(args) and not args[i].startswith('--'):
                ids.append(args[i]); i += 1
        elif a == '--scene-file': scene_file = args[i+1]; i += 2
        else: i += 1
    if not dest:
        print('error: --dest <public/logos> required'); sys.exit(1)
    if scene_file:
        ids += ids_from_scene_file(scene_file)
    ids = sorted(set(ids))
    if not ids:
        print('no logo ids to stage'); return
    os.makedirs(dest, exist_ok=True)

    staged, missing = [], []
    for iid in ids:
        src = find_logo(iid)
        if src:
            shutil.copyfile(src, os.path.join(dest, iid + '.svg')); staged.append(iid)
        else:
            missing.append(iid)
    print(f"staged {len(staged)} logos into {dest}")
    for s in staged:
        print(f"   + {s}")
    if missing:
        print(f"  MISSING (not in Logos/): {len(missing)}")
        for m in missing:
            print(f"     x {m}  (check the name; try --list)")
        sys.exit(1)

if __name__ == '__main__':
    main()
