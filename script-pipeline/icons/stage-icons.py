# Stage resolved icons: copy the chosen SVGs from the master Icons/ library into
# a render's public/icons/ folder, so the (small, per-lesson) public set holds
# exactly the icons the lesson uses and nothing 404s.
#
# Usage:
#   python stage-icons.py --dest <public/icons dir> --ids id1 id2 ...
#   python stage-icons.py --dest <public/icons dir> --scene-file <lessonScenes.ts>
#
# Copies only what's referenced; existing files are overwritten (idempotent).

import sys, os, re, shutil

HERE = os.path.dirname(__file__)
ICONS_DIR = os.path.normpath(os.path.join(HERE, '..', '..', 'Icons'))

def ids_from_scene_file(path):
    txt = open(path, encoding='utf-8').read()
    ids = re.findall(r"(?:[A-Za-z]*[Ii]con)\s*:\s*['\"]([^'\"]+)['\"]", txt)
    ids += re.findall(r"\bid\s*:\s*['\"]([^'\"]+-(?:light|dark))['\"]", txt)
    return sorted(set(ids))

def main():
    args = sys.argv[1:]
    ids = []; dest = None; scene_file = None
    i = 0
    while i < len(args):
        a = args[i]
        if a == '--ids':
            i += 1
            while i < len(args) and not args[i].startswith('--'):
                ids.append(args[i]); i += 1
        elif a == '--dest': dest = args[i+1]; i += 2
        elif a == '--scene-file': scene_file = args[i+1]; i += 2
        else: i += 1
    if not dest:
        print('error: --dest <public/icons dir> required'); sys.exit(1)
    if scene_file:
        ids += ids_from_scene_file(scene_file)
    ids = sorted(set(ids))
    os.makedirs(dest, exist_ok=True)

    copied, missing = [], []
    for iid in ids:
        src = os.path.join(ICONS_DIR, iid + '.svg')
        if os.path.exists(src):
            shutil.copyfile(src, os.path.join(dest, iid + '.svg'))
            copied.append(iid)
        else:
            missing.append(iid)
    print(f"staged {len(copied)} icons into {dest}")
    if missing:
        print(f"  MISSING from library (NOT staged): {len(missing)}")
        for m in missing: print(f"     x {m}")
        sys.exit(1)

if __name__ == '__main__':
    main()
