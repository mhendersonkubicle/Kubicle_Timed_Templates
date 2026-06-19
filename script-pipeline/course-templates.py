# Course-level template usage: what templates earlier lessons of a course already
# used, so the director can prefer VARIETY across lessons (a soft recommendation,
# never at the cost of good fit). Variety is course-scoped and resets per course.
#
# Lessons of one course share a project-folder prefix, e.g.
#   projects/prof-services-marketing-l1, .../-l2, .../-l3
# The course id is that prefix (everything before the trailing -l<number>).
#
# Usage:
#   python course-templates.py <courseId> [--exclude <projectName>]
# Prints, for each prior lesson, the CONTENT templates it used, plus a frequency
# tally of content templates across the course (so the bias is visible). Structural
# templates that are MEANT to recur every lesson are listed separately and are NOT
# subject to the variety preference.

import sys, os, re, glob
from collections import Counter

HERE = os.path.dirname(__file__)
PROJECTS = os.path.normpath(os.path.join(HERE, '..', 'projects'))

# Structural / fixed-role templates: expected to recur across lessons, do NOT vary.
STRUCTURAL = {
    'LessonTitle',        # every lesson opens with one
    'LessonGoal',         # the lesson objective
    'LessonSummary',      # the recap
    'CaseStudyIntro',     # whenever a case study appears
    'BulletList6Pills',   # course-outline (first lesson only, but structural)
}

def templates_in(lesson_scenes_path):
    txt = open(lesson_scenes_path, encoding='utf-8').read()
    return re.findall(r'export const scene\d+:\s*(\w+)Props', txt)

def main():
    if not sys.argv[1:]:
        print('usage: python course-templates.py <courseId> [--exclude <projectName>]')
        sys.exit(1)
    course = sys.argv[1]
    exclude = None
    if '--exclude' in sys.argv:
        exclude = sys.argv[sys.argv.index('--exclude') + 1]

    # find this course's lesson folders: <course>-l<number>
    lessons = []
    for d in sorted(glob.glob(os.path.join(PROJECTS, f'{course}-l*'))):
        name = os.path.basename(d)
        if not re.match(rf'^{re.escape(course)}-l\d+$', name):
            continue
        if exclude and name == exclude:
            continue
        ls = os.path.join(d, 'src', 'lessonScenes.ts')
        if os.path.exists(ls):
            lessons.append((name, templates_in(ls)))

    if not lessons:
        print(f'No prior lessons found for course "{course}" (this may be the first lesson). Variety resets here.')
        return

    content_tally = Counter()
    print(f'Course "{course}", templates used in prior lessons:')
    for name, tmpls in lessons:
        content = [t for t in tmpls if t not in STRUCTURAL]
        struct = [t for t in tmpls if t in STRUCTURAL]
        for t in content:
            content_tally[t] += 1
        print(f'  {name}:')
        print(f'     content:    {", ".join(content) if content else "(none)"}')
        print(f'     structural: {", ".join(struct) if struct else "(none)"}')

    print('\nCONTENT-template frequency across the course (prefer LESS-used / unused when multiple fit):')
    for t, n in content_tally.most_common():
        flag = '  <- already used, prefer an alternative if one fits equally' if n >= 1 else ''
        print(f'  {n}x  {t}{flag}')
    print('\nStructural templates (LessonTitle/LessonGoal/LessonSummary/CaseStudyIntro/BulletList6Pills) are expected to recur, do NOT vary those.')

if __name__ == '__main__':
    main()
