# Stage template-specific PNG assets into a render's public/ folder, NAMESPACED
# per template so two templates can never clobber each other on a shared filename.
#
# Each template's assets live in templates/<T>/Template-Specific-Assets/<file>,
# and templates now fetch staticFile('Template-Specific-Assets/<T>/<file>'). This
# copies them into <public>/Template-Specific-Assets/<T>/<file>, which is
# collision-proof by construction (every file sits under its own template name).
#
# Usage:
#   python stage-assets.py --dest <public dir> --all
#   python stage-assets.py --dest <public dir> --templates Points3Subtopics2 YinYang2Points ...
#
# (Run this when a lesson reuses the shared bench, before rendering.)

import sys, os, shutil, glob

HERE = os.path.dirname(__file__)
TEMPLATES = os.path.normpath(os.path.join(HERE, '..', 'templates'))

def main():
    args = sys.argv[1:]
    dest = None; templates = []; do_all = False
    i = 0
    while i < len(args):
        a = args[i]
        if a == '--dest': dest = args[i+1]; i += 2
        elif a == '--all': do_all = True; i += 1
        elif a == '--templates':
            i += 1
            while i < len(args) and not args[i].startswith('--'):
                templates.append(args[i]); i += 1
        else: i += 1
    if not dest:
        print('error: --dest <public dir> required'); sys.exit(1)
    if do_all:
        templates = [os.path.basename(os.path.dirname(d))
                     for d in glob.glob(os.path.join(TEMPLATES, '*', 'Template-Specific-Assets'))]
    if not templates:
        print('error: pass --all or --templates <names>'); sys.exit(1)

    total = 0
    for t in sorted(set(templates)):
        srcdir = os.path.join(TEMPLATES, t, 'Template-Specific-Assets')
        if not os.path.isdir(srcdir):
            continue  # template has no bundled assets
        outdir = os.path.join(dest, 'Template-Specific-Assets', t)
        os.makedirs(outdir, exist_ok=True)
        n = 0
        for f in os.listdir(srcdir):
            sp = os.path.join(srcdir, f)
            if os.path.isfile(sp):
                shutil.copyfile(sp, os.path.join(outdir, f)); n += 1
        if n:
            print(f"  {t}: {n} assets -> Template-Specific-Assets/{t}/")
            total += n
    print(f"staged {total} assets (namespaced per template) into {dest}")

if __name__ == '__main__':
    main()
