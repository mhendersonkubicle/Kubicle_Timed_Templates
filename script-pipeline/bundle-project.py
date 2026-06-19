# Make a built lesson self-contained: copy every asset it references into the
# project's public/ so it renders anywhere (CI compile-check, or a teammate's
# local Remotion Studio) with no missing-file 404s.
#
# Parses <project>/src/lessonScenes.ts for icon ids and the case-study logo,
# copies them from the repo Icons/ and Logos/ libraries, copies each used
# template's Template-Specific-Assets, and ensures narration.mp3 is in public/.
# Exits non-zero (and lists them) if any referenced asset is missing from the
# libraries, so a build can never silently ship an unrenderable lesson.
#
# Usage: python script-pipeline/bundle-project.py projects/<courseId>-l<n>
import sys, re, os, shutil, glob

proj = sys.argv[1].rstrip('/\\')
src = os.path.join(proj, 'src')
pub = os.path.join(proj, 'public')
scenes = open(os.path.join(src, 'lessonScenes.ts'), encoding='utf-8').read()

icon_ids = set(re.findall(r"(?:icon|id|titleIcon):\s*'([a-z0-9][a-z0-9-]*)'", scenes))
icon_ids |= set(re.findall(r"icons/([a-z0-9-]+)\.svg", scenes))
icon_ids.discard('icon')  # 'kind: icon' false positives, never an id
logo_ids = set(re.findall(r"logo:\s*'([A-Za-z0-9][A-Za-z0-9-]*)'", scenes))

missing = []
os.makedirs(os.path.join(pub, 'icons'), exist_ok=True)
for i in sorted(icon_ids):
    s = os.path.join('Icons', i + '.svg')
    if os.path.isfile(s):
        shutil.copy(s, os.path.join(pub, 'icons', i + '.svg'))
    else:
        missing.append('icon:' + i)

os.makedirs(os.path.join(pub, 'logos'), exist_ok=True)
for l in sorted(logo_ids):
    hits = glob.glob(f'Logos/**/{l}.svg', recursive=True)
    if hits:
        shutil.copy(hits[0], os.path.join(pub, 'logos', l + '.svg'))
    else:
        missing.append('logo:' + l)

# Template-Specific-Assets for each template actually used (one .tsx per template).
tmpl_count = 0
for f in glob.glob(os.path.join(src, '*.tsx')):
    name = os.path.splitext(os.path.basename(f))[0]
    if name == 'Root':
        continue
    tsa = os.path.join('templates', name, 'Template-Specific-Assets')
    if os.path.isdir(tsa):
        shutil.copytree(tsa, os.path.join(pub, 'Template-Specific-Assets', name), dirs_exist_ok=True)
        tmpl_count += 1

# narration must live in public/ (templates load staticFile('narration.mp3')).
root_mp3 = os.path.join(proj, 'narration.mp3')
if os.path.isfile(root_mp3):
    shutil.copy(root_mp3, os.path.join(pub, 'narration.mp3'))

print(f"bundled {len(icon_ids)} icons, {len(logo_ids)} logos, {tmpl_count} template asset sets into {pub}")
if missing:
    print('MISSING from libraries (build referenced an asset that does not exist): ' + ', '.join(missing))
    sys.exit(1)
