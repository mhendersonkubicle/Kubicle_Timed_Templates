# One command to view + render a built lesson locally in Remotion Studio.
# Loads the lesson into the repo harness, ensures deps, and opens Studio in the
# browser. Everything renders locally; nothing is uploaded.
#
# Usage:  python script-pipeline/open-in-studio.py <courseId>-l<n>
#   e.g.  python script-pipeline/open-in-studio.py marketing-in-professional-services-l4
import sys, os, shutil, glob, subprocess

if len(sys.argv) < 2:
    print('Usage: python script-pipeline/open-in-studio.py <courseId>-l<n>')
    sys.exit(1)

pid = sys.argv[1].strip('/\\')
proj = os.path.join('projects', pid)
harness = 'harness'
if not os.path.isdir(os.path.join(proj, 'src')):
    print(f'No project at {proj}. Did you `git pull`?')
    sys.exit(1)

# Make sure the lesson is fully self-contained first (icons, logos, assets).
subprocess.run([sys.executable, 'script-pipeline/bundle-project.py', proj], check=False)

# Load the lesson into the harness.
for f in glob.glob(os.path.join(proj, 'src', '*')):
    if os.path.isfile(f):
        shutil.copy(f, os.path.join(harness, 'src', os.path.basename(f)))
if os.path.isdir(os.path.join(proj, 'public')):
    shutil.copytree(os.path.join(proj, 'public'), os.path.join(harness, 'public'), dirs_exist_ok=True)

# Ensure dependencies (first run only).
if not os.path.isdir(os.path.join(harness, 'node_modules')):
    print('Installing Remotion (first run, ~1 min)...')
    subprocess.run(['npm', 'ci'], cwd=harness, shell=(os.name == 'nt'))

print(f'\nOpening "{pid}" in Remotion Studio. Your browser will open at localhost.')
print('Press play to preview; use the Render button (top right) to export the MP4. Ctrl+C to stop.\n')
subprocess.run(['npx', 'remotion', 'studio'], cwd=harness, shell=(os.name == 'nt'))
