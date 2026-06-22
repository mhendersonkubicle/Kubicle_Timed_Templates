export const meta = {
  name: 'build-lesson',
  description: 'One command, SRT + MP3 in, finished lesson video out. Director segments + assigns templates; per-scene re-edit fits content to the template and picks icon concepts; icons resolve to real ids; a compose step derives SRT timing + re-mention pulses, stages assets, writes + bundles the composition; a render-and-look verify loop fixes any visual issues; then the project is assembled.',
  phases: [
    { title: 'Plan',     detail: 'segment the SRT into scenes + assign a template each' },
    { title: 'Compose',  detail: 'per scene: re-edit to slots + anchors + icon concepts -> resolve icons' },
    { title: 'Assemble', detail: 'SRT timing + pulses + stage assets + write + bundle + validate' },
    { title: 'Verify',   detail: 'render each scene, look at it, patch issues (loop)' },
    { title: 'Project',  detail: 'copy the build into a project folder + README' },
  ],
}

// ---- inputs (pass via Workflow args) -----------------------------------------
let A = (typeof args === 'undefined' || args === null) ? {} : args
if (typeof A === 'string') { try { A = JSON.parse(A) } catch (e) { A = {} } }
log('build-lesson args: ' + JSON.stringify(A))
const REPO    = 'C:/Users/Mark/Desktop/GenAI/4K REPRODUCTION TEST/Kubicle_Motion_Video_Templates-main'
const BENCH   = 'C:/Users/Mark/.cache/claude-remotion-bench'
const PIPE    = REPO + '/script-pipeline'
const ICONS   = PIPE + '/icons'
const SRT     = A.srt        // required: absolute path to the .srt
const AUDIO   = A.audio      // required: absolute path to the .mp3
const COURSE  = A.courseTitle || 'Course'
const LESSON_NUM = A.lessonNumber || 1
const FIRST   = A.isFirstLesson ?? false
const PROJECT = A.projectName || 'lesson'
const COURSE_ID = A.courseId || PROJECT.replace(/-l\d+$/, '')   // course = project prefix sans -l<N>
const COURSE_ICON = A.courseIcon || ''   // fixed course-identifier icon id, reused across every lesson of the course
const INDEX   = REPO + '/templates/SELECTION_INDEX.md'
const RULES   = REPO + '/templates/README.md'

if (!SRT || !AUDIO) {
  log('ERROR: pass args { srt, audio, courseTitle, lessonNumber, isFirstLesson, projectName }')
  return { error: 'missing srt/audio' }
}

// ---- schemas -----------------------------------------------------------------
const DIRECTOR_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['lessonTitle', 'scenes'],
  properties: {
    lessonTitle: { type: 'string', description: 'a concise lesson title derived from the content (for the LessonTitle card)' },
    scenes: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['id', 'cueStart', 'cueEnd', 'template', 'rationale'],
      properties: {
        id: { type: 'string', description: 'scene-1, scene-2, ...' },
        cueStart: { type: 'number', description: '1-based SRT cue number where this scene begins' },
        cueEnd: { type: 'number', description: '1-based SRT cue number where this scene ends' },
        template: { type: 'string', description: 'template name from SELECTION_INDEX' },
        rationale: { type: 'string' },
      },
    }},
  },
}

const REEDIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['fitOk', 'contentProps', 'reveals', 'notes'],
  properties: {
    fitOk: { type: 'boolean' },
    // The template's CONTENT props as a JSON object MATCHING THAT TEMPLATE'S SCHEMA
    // (everything except `timings`). Any icon field is set to a concept string
    // prefixed "concept:" (e.g. "concept:a team of people"); the icon stage replaces
    // it with a real id. Character ids must be real CHARACTER_IDS where required.
    contentProps: { type: 'object', additionalProperties: true },
    // One entry per reveal target, with the spoken phrase that should trigger it.
    reveals: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['target', 'anchor'],
      properties: {
        target: { type: 'string', description: 'reveal target name (setup excluded; it is auto-added)' },
        anchor: { type: 'string', description: 'the exact phrase in this scene\'s narration whose spoken moment should trigger this reveal (pick the occurrence you want)' },
      },
    }},
    notes: { type: 'array', items: { type: 'string' } },
  },
}

const ICON_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['contentProps', 'surface', 'notes'],
  properties: {
    contentProps: { type: 'object', additionalProperties: true, description: 'the same content props with every "concept:" icon field replaced by a REAL id from icon-search.py output (correct -light/-dark for the surface)' },
    surface: { type: 'string', enum: ['dark', 'light', 'mixed'] },
    notes: { type: 'array', items: { type: 'string' } },
  },
}

const COMPOSE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['ok', 'totalSeconds', 'sceneFrames'],
  properties: {
    ok: { type: 'boolean' },
    totalSeconds: { type: 'number' },
    sceneFrames: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['id', 'midFrame'],
      properties: { id: { type: 'string' }, midFrame: { type: 'number' } },
    }},
    error: { type: 'string' },
  },
}

const QA_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['allClear', 'findings'],
  properties: {
    allClear: { type: 'boolean' },
    findings: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['sceneId', 'issue', 'fix'],
      properties: {
        sceneId: { type: 'string' },
        issue: { type: 'string', description: 'what is visually wrong (text overflow, blank icon, oversized/overlapping panel, wrong contrast, missing reveal)' },
        fix: { type: 'string', description: 'the concrete change to make' },
      },
    }},
  },
}

const RULES_PREAMBLE =
  `Follow the standards in ${RULES} and each template's GUIDANCE.md: SRT-derived timing, ` +
  `variety (one template per lesson), semantic fit, no dead air, frame-fit character limits, ` +
  `icon-contrast (-dark art on dark/coloured surfaces, -light on light), never guess icon ids, ` +
  `re-mention pulses from the SRT, a LessonTitle card opening EVERY lesson, the BulletList6Pills course-outline ONLY in the first lesson, ` +
  `presenter-led character variants only where they fit; a CASE STUDY about a specific company uses ` +
  `the CaseStudyIntro template with a fictional company LOGO from Logos/ (never an icon); ` +
  `NO em dashes or en dashes in any text.`

// ---- Phase 1: Plan -----------------------------------------------------------
phase('Plan')
const plan = await agent([
  `You are the DIRECTOR. ${RULES_PREAMBLE}`,
  `Read the subtitle file: ${SRT} (each numbered cue has a timestamp + text). Read the template catalogue: ${INDEX}.`,
  `Open EVERY lesson with a LessonTitle card as scene 1 (derive the lesson title from the content). The BulletList6Pills course-outline beat ("in this course we'll cover...") appears ONLY in the first lesson: this lesson ${FIRST ? 'IS' : 'is NOT'} the first, so ${FIRST ? 'include the course-outline' : 'do NOT include a course-outline'}.`,
  `Segment the narration into consecutive scenes by CUE RANGES (cueStart..cueEnd, 1-based, contiguous, covering all cues).`,
  `Assign each scene the single best template under the variety + semantic-fit + no-dead-air rules. Derive a concise lessonTitle from the content.`,
  `COURSE-LEVEL VARIETY (soft recommendation): run  python "${PIPE}/course-templates.py" ${COURSE_ID} --exclude ${PROJECT}  to see which CONTENT templates earlier lessons of THIS course already used (and how often). When a beat has MULTIPLE templates that fit equally well, prefer one that is unused or least-used in the course so far, to avoid bias toward favourites (e.g. YinYang2Points). This NEVER overrides good fit, always pick the best template for the beat; only use course history to break ties among equally-good options. Structural templates (LessonTitle, LessonGoal, LessonSummary, CaseStudyIntro, BulletList6Pills) recur normally and are exempt. The within-lesson at-most-once rule still applies; variety resets per course.`,
  `CASE STUDIES: if a beat introduces a worked example about a specific company, assign CaseStudyIntro ONLY for the establishing beat where the company is named (it shows just a company LOGO centred, not an icon). Put the case-study DETAIL/points in the FOLLOWING scene using an ICON-LEFT / BULLETS-RIGHT single-colour template: Checklist5Pills (hero icon left + bullet pills right), or Topic1Subtopics6 if not already used. Do NOT use the cycling IconPointsV1 (a case-study follow-up is short; no time to cycle all the points) or the multicoloured Points3Subtopics2.`,
  `Return lessonTitle + scenes in order.`,
].join('\n'), { label: 'director', phase: 'Plan', schema: DIRECTOR_SCHEMA })

// ---- Phase 2: Compose per scene (re-edit -> resolve icons) -------------------
const scenes = await pipeline(
  (plan.scenes || []),
  // stage A: re-edit -> content props + reveal anchors + icon concepts
  (s) => agent([
    `You are the TEMPLATE RE-EDITOR for ${s.id}, assigned template "${s.template}". ${RULES_PREAMBLE}`,
    `Read the template component AND guidance: ${REPO}/templates/${s.template}/${s.template}.tsx and .../GUIDANCE.md.`,
    `Read this scene's cues ${s.cueStart}-${s.cueEnd} in ${SRT}.`,
    `Produce contentProps = the template's content props as JSON MATCHING ITS SCHEMA EXACTLY (correct field names + nesting, every char limit respected; omit the timings field).`,
    `For any icon field, put "concept:<plain words of what the icon should depict>" (do not guess an id). For character templates, use a real CHARACTER_IDS portrait id.`,
    `If this template is CaseStudyIntro: it is JUST eyebrow + logo (no summary, no points). Set \`logo\` to a REAL fictional company id ("Company-<Name>-light"; run  python "${PIPE}/stage-logos.py" --list  for options) or a Logos/Software/ id for a real product (a company logo is NOT an icon concept, no "concept:" prefix). Reveal anchors: eyebrow (the "for example/we'll follow" lead-in) and logo (the company name). The case-study detail belongs to the NEXT scene, not this one.`,
    `Produce reveals = one {target, anchor} per reveal target the template exposes (NOT setup). anchor = the exact phrase from THIS scene's narration whose spoken moment should trigger that reveal; pick the occurrence you actually want.`,
    `PREVIEW-THEN-EXPAND: if the narration NAMES a set of items as a group and THEN expands/defines each in turn (e.g. "the four Ps: product, price, place, promotion" then a line per P; or "three levers: people, process, physical evidence" then "People matter because..."), anchor each item to where it is FIRST NAMED (the preview), NOT to its later expansion. That makes the whole set appear as it is listed (no dead air); the rementions stage then auto-pulses each item when the narration returns to expand it. For a template with separate title vs detail slots (e.g. Points3Subtopics2), anchor the TITLE to the naming and the DETAILS to the expansion. In Points3Subtopics2 each detail shell is ONE complete, independent point (1 or 2 per section); never split a sentence across two shells, and use one detail if the section has only one point. See templates/README.md "preview-then-expand principle".`,
    `Linearize so reveal order matches the template's canonical order. Confirm fit (fitOk).`,
  ].join('\n'), { label: `re-edit:${s.id}`, phase: 'Compose', schema: REEDIT_SCHEMA })
    .then((r) => ({ ...s, ...r })),
  // stage B: resolve icon concepts -> real ids
  (s) => {
    const hasConcepts = JSON.stringify(s.contentProps || {}).includes('concept:')
    if (!hasConcepts) return { ...s, surface: 'light' }
    return agent([
      `You are the ICON RESOLVER for ${s.id} (template "${s.template}"). You may ONLY use ids that icon-search.py returns; never invent one.`,
      `Determine the icon surface from ${REPO}/templates/${s.template}/GUIDANCE.md (assets.iconVariant): dark/coloured -> -dark, light bg -> -light.`,
      `Here are the content props with "concept:..." placeholders:`,
      JSON.stringify(s.contentProps),
      `For each "concept:<words>" field, run:  python "${ICONS}/icon-search.py" "<words>" --surface <dark|light> --top 12`,
      `Pick the best REAL id (re-query with concrete words if a concept is abstract) and replace the placeholder. If the template forces a variant (e.g. IconPointsV1 requires -light, Points3Subtopics2 anchor requires -dark), honour it.`,
      `Then run:  python "${ICONS}/validate-icons.py" --ids <all chosen ids>   and confirm all real.`,
      `Return contentProps with every concept replaced by a real id, plus the surface.`,
    ].join('\n'), { label: `icons:${s.id}`, phase: 'Compose', schema: ICON_SCHEMA })
      .then((ic) => ({ ...s, contentProps: ic?.contentProps ?? s.contentProps, surface: ic?.surface ?? 'dark' }))
  },
)

// ---- Phase 3: Assemble composition (deterministic-heavy, one builder agent) --
phase('Assemble')
const built = await agent([
  `You are the COMPOSER. Build the Remotion composition in the bench ${BENCH} from the scene plan below, then prove it compiles. ${RULES_PREAMBLE}`,
  `INPUT scenes (each: id, cueStart, cueEnd, template, contentProps (icons resolved), reveals [{target,anchor}]):`,
  JSON.stringify(scenes),
  `lessonTitle="${plan.lessonTitle}", course="${COURSE}", lessonNumber=${LESSON_NUM}.`,
  ``,
  `Do, in order:`,
  `0. TEMPLATES PRESENT: for each DISTINCT template used by the scenes, copy ${REPO}/templates/<T>/<T>.tsx to ${BENCH}/src/<T>.tsx (some templates may not be in the bench yet; the import must resolve).`,
  `1. Stage the audio: copy ${AUDIO} to ${BENCH}/public/narration.mp3.`,
  `2. TIMING: write a fit-timing plan JSON [{id,cueStart,cueEnd,slots:[{target,anchor}]}] from each scene's reveals, then run:`,
  `     python "${PIPE}/fit-timing.py" "${SRT}" <plan.json>`,
  `   It returns per-scene span + reveal sequence (SRT-derived) + a rementionsConfig + TOTAL seconds.`,
  `3. PULSES: run  python "${PIPE}/detect-rementions.py" "${SRT}" <rementionsConfig.json>  and take the per-scene pulses.`,
  `4. STAGE ASSETS: python "${PIPE}/stage-assets.py" --dest ${BENCH}/public --templates <all distinct templates used>`,
  `   and python "${ICONS}/stage-icons.py" --dest ${BENCH}/public/icons --ids <all resolved icon ids>.`,
  `   For any character template, copy the used portrait(s) from "${REPO}/CHARACTER LIBRARY (PNG)/<id>.png" to ${BENCH}/public/characters/.`,
  `   For any CaseStudyIntro scene, stage its logo: python "${PIPE}/stage-logos.py" --dest ${BENCH}/public/logos --ids <each \`logo\` id used>.`,
  `5. WRITE ${BENCH}/src/lessonScenes.ts: import each template's Props type; export FPS=30, SCENE_SPANS (from fit-timing spans), TOTAL_SECONDS; and one  export const sceneN: <Template>Props = { ...contentProps, timings: { sequence: <from fit-timing>, pulses: <from detect-rementions> } }  per scene, in order. The reveal targets in the sequence must be valid for that template. PULSES ARE MANDATORY where opportunities exist: every scene where a revealed item is named again >~4s later (especially lengthy or preview-then-expand scenes) MUST carry the detect-rementions pulses, never leave such a scene's pulses empty.`,
  `5a. COURSE IDENTITY (must be identical across every lesson of the course): in the LessonTitle scene set  courseTitle  EXACTLY to "${COURSE}" verbatim (do NOT paraphrase or re-derive it). For the top-left course icon, use the SAME icon every lesson: if a course icon is given use  courseIconUrl: staticFile('icons/${COURSE_ICON || '<courseIcon>'}.svg')  (and stage that icon); ELSE read a prior lesson's scene1 courseIconUrl from  ${REPO}/projects/${COURSE_ID}-l*/src/lessonScenes.ts  and reuse that EXACT id (stage it); ELSE omit courseIconUrl entirely. Never choose a new/different course icon per lesson.`,
  `6. WRITE ${BENCH}/src/Root.tsx: import the template components; an <AbsoluteFill> with <Audio src={staticFile('narration.mp3')}/> and a <Series> of <Series.Sequence durationInFrames={round((end-start)*FPS)}> wrapping each <Template {...sceneN}/>; register Composition id="Lesson", 1920x1080, fps 30, durationInFrames=ceil(TOTAL_SECONDS*30).`,
  `7. GATE bundle:   cd ${BENCH} && npx remotion compositions src/index.ts   (must list "Lesson"; fix any compile error before continuing).`,
  `8. GATE icons:    python "${ICONS}/validate-icons.py" --scene-file ${BENCH}/src/lessonScenes.ts --public ${BENCH}/public/icons   (must PASS).`,
  `Return { ok, totalSeconds, sceneFrames: [{id, midFrame}], error? } where midFrame is a frame near each scene's end (all content revealed) for QA stills.`,
].join('\n'), { label: 'compose', phase: 'Assemble', schema: COMPOSE_SCHEMA })

// ---- Phase 4: Verify loop (render -> look -> patch) --------------------------
phase('Verify')
let round = 0
let lastFindings = []
while (round < 3) {
  const qa = await agent([
    `You are the VISUAL QA reviewer. The bench ${BENCH} holds composition "Lesson". For EACH scene, render a still and LOOK at it:`,
    `  cd ${BENCH} && npx remotion still src/index.ts Lesson _verify/<sceneId>.png --frame=<midFrame>`,
    `then open the PNG with the Read tool and inspect it visually.`,
    `Scene mid-frames: ${JSON.stringify((built && built.sceneFrames) || [])}. If absent, derive a frame near each scene's end from SCENE_SPANS in ${BENCH}/src/lessonScenes.ts.`,
    `Flag ONLY real visual defects: text overflowing its frame, blank/missing icons, an oversized or overlapping baked panel (asset-collision symptom, md5 the bench asset vs templates/<T>/Template-Specific-Assets/<file>), wrong icon contrast (dark-on-dark, or a two-tone icon on a saturated blue/pink fill where its blue accents vanish), a missing reveal, or a title that did not render (often a wrong prop name).`,
    `ALSO inspect ${BENCH}/src/lessonScenes.ts directly for these non-visual defects: (a) MISSING PULSES, any lengthy or preview-then-expand scene whose items are named then re-mentioned/defined later (>~4s) but whose \`pulses\` array is EMPTY, this is a defect, re-run detect-rementions for that scene and populate it; (b) COURSE-IDENTITY DRIFT, the LessonTitle \`courseTitle\` must be EXACTLY the course title and its \`courseIconUrl\` must match the course icon used by other lessons (compare with ${REPO}/projects/${COURSE_ID}-l*/src/lessonScenes.ts), flag any mismatch.`,
    `For each defect give {sceneId, issue, fix}. If every scene is clean, set allClear=true with an empty findings list.`,
  ].join('\n'), { label: `qa:round${round + 1}`, phase: 'Verify', schema: QA_SCHEMA })

  lastFindings = qa?.findings || []
  if (!qa || qa.allClear || lastFindings.length === 0) break

  log(`QA round ${round + 1}: ${lastFindings.length} issue(s); patching`)
  await agent([
    `You are the PATCHER. Fix exactly these visual issues in the bench ${BENCH}, then re-bundle. ${RULES_PREAMBLE}`,
    `Issues:`,
    JSON.stringify(lastFindings),
    `Edit ${BENCH}/src/lessonScenes.ts (prop names/values, char limits) and/or re-stage a clobbered asset (copy from templates/<T>/Template-Specific-Assets/) or re-resolve a bad icon via ${ICONS}/icon-search.py + stage-icons.py. Do NOT change timing logic. Then  cd ${BENCH} && npx remotion compositions src/index.ts  must still list "Lesson".`,
  ].join('\n'), { label: `patch:round${round + 1}`, phase: 'Verify' })
  round += 1
}

// ---- Phase 5: Assemble the project record ------------------------------------
phase('Project')
const proj = await agent([
  `You are the PROJECT ASSEMBLER. Create the project record for this lesson. ${RULES_PREAMBLE}`,
  `Make folder ${REPO}/projects/${PROJECT}/ with: lesson.srt (copy ${SRT}), narration.mp3 (copy ${AUDIO}), src/ (copy ${BENCH}/src/lessonScenes.ts + Root.tsx + each used template's .tsx from ${BENCH}/src), and a README.md.`,
  `The README lists the scene plan (scene -> template -> beat), states how each rule was applied (SRT timing, variety, semantic fit, no dead air, char limits, icon resolution, re-mention pulses, first-lesson roles if any), and any QA fixes made. NO em dashes.`,
  `Return the project path + a one-paragraph summary.`,
].join('\n'), { label: 'project', phase: 'Project' })

return {
  lessonTitle: plan.lessonTitle,
  scenes: scenes.map((s) => ({ id: s.id, template: s.template })),
  build: built,
  qaResolved: lastFindings.length === 0,
  qaRoundsUsed: round,
  project: proj,
}
