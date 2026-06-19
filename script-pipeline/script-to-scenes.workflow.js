export const meta = {
  name: 'script-to-scenes',
  description: 'Director segments a narration script and assigns each scene a Remotion template; a per-scene re-edit stage linearizes the narration and maps it to slots; an icon-resolution stage maps each slot icon CONCEPT to a real, validated library id (no invented ids).',
  phases: [
    { title: 'Direct', detail: 'segment the script + assign a template per scene' },
    { title: 'Re-edit', detail: 'per scene: linearize narration + map to slots/reveal order + icon CONCEPTS' },
    { title: 'Icons', detail: 'per scene: resolve each icon concept to a real library id (lexical shortlist + pick)' },
  ],
}

const REPO  = 'C:/Users/Mark/Desktop/GenAI/4K REPRODUCTION TEST/Kubicle_Motion_Video_Templates-main'
const SCRIPT = (args && args.script) || REPO + '/projects/systems-thinking-l1/narration.md'
const INDEX  = REPO + '/templates/SELECTION_INDEX.md'
const ICONS  = REPO + '/script-pipeline/icons'   // build-icon-index / icon-search / validate / stage

const DIRECTOR_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['scenes','unmapped'],
  properties: {
    scenes: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['id','segment','template','rationale','fitConfidence'],
      properties: {
        id: { type: 'string', description: 'scene-1, scene-2, ...' },
        segment: { type: 'string', description: 'the verbatim text span for this scene' },
        template: { type: 'string', description: 'chosen template name (MUST be one listed in SELECTION_INDEX)' },
        rationale: { type: 'string', description: 'why this template fits this segment' },
        fitConfidence: { type: 'string', enum: ['high','medium','low'] },
      },
    }},
    unmapped: { type: 'array', items: { type: 'string' }, description: 'spans that fit no available template' },
  },
}

// Re-edit now emits an icon CONCEPT (plain words for what the icon should depict)
// instead of guessing an id. The icon stage maps concepts to real ids.
const REEDIT_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['fitOk','fitNote','wasReordered','reorderNote','linearizedVO','slots','revealOrder','warnings'],
  properties: {
    fitOk: { type: 'boolean' },
    fitNote: { type: 'string', description: 'confirm fit, or explain mismatch + suggest an alternative template' },
    wasReordered: { type: 'boolean' },
    reorderNote: { type: 'string', description: 'what was non-linear and how it was linearized, or "already linear"' },
    linearizedVO: { type: 'string', description: 'the scene voiceover, reordered to the template reveal order; meaning + tone preserved, no invented facts' },
    slots: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['target','text'],
      properties: {
        target: { type: 'string', description: 'reveal target name from the template (e.g. leftTitle, step0, pill2)' },
        text: { type: 'string', description: 'the slot text, tightened to the slot char limit + phrasing rule' },
        iconConcept: { type: 'string', description: 'ONLY where the template uses a per-slot icon: a short plain-words description of WHAT the icon should depict (e.g. "a team of people", "a recurring cycle", "a magnifying glass examining detail"). Do NOT guess a library id. Omit entirely for slots/templates with no icon.' },
      },
    }},
    revealOrder: { type: 'array', items: { type: 'string' } },
    warnings: { type: 'array', items: { type: 'string' } },
  },
}

const ICON_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['usesIcons','surface','resolved','notes'],
  properties: {
    usesIcons: { type: 'boolean', description: 'false if this template has no per-slot icons (then resolved is empty)' },
    surface: { type: 'string', enum: ['dark','light','mixed'], description: 'the surface the icons sit on, read from the template GUIDANCE (dark/coloured -> -dark variant; light bg -> -light)' },
    resolved: { type: 'array', items: {
      type: 'object', additionalProperties: false,
      required: ['target','iconId','why'],
      properties: {
        target: { type: 'string' },
        iconId: { type: 'string', description: 'a REAL id taken from icon-search.py output (filename minus .svg, WITH the -light/-dark variant). Never invented.' },
        why: { type: 'string', description: 'one line: the concept + why this candidate fits + why this variant' },
      },
    }},
    notes: { type: 'array', items: { type: 'string' } },
  },
}

phase('Direct')
const direction = await agent(
  [
    `You are the DIRECTOR in a script-to-scenes pipeline.`,
    `Read the narration script: ${SCRIPT}`,
    `Read the catalogue of available scene templates (with their "use when" criteria): ${INDEX}`,
    ``,
    `MAP EVERYTHING. Every narration beat becomes an on-screen scene mapped to a template (no dead voiceover with nothing on screen). Distil explanatory prose into the best-fitting structured template by the shape it actually has (a two-state contrast -> a comparison template; one idea with supporting points -> a points/list template; a lesson opener -> LessonTitle; a course outline -> ALWAYS BulletList6Pills, first lesson only; a term+meaning -> WordDefinition; ordered steps -> a process template).`,
    `SEMANTIC FIT (MUST): a template whose visual carries strong meaning (a cycle/flywheel, a hierarchy, a timeline) is only for content that genuinely has that structure. Flywheel4Petals is ONLY for a genuine ongoing system that keeps cycling by design (test: would it keep going round on its own with no intervention?), never a one-time chain that merely ends where it began (that is a linear sequence -> Process5Steps).`,
    `NO DEAD AIR: if a beat has a lead-in before its first on-screen word, choose a template whose setup stages a panel/anchor in the first ~1s; never solve dead air by revealing content early. If nothing fits, add an establishing scene.`,
    `VARIETY (MUST): within ONE lesson use each template AT MOST ONCE; there is no default template. Route same-shape beats to the next-best fitting template. A repeat is allowed only by genuine exception and must be justified in that scene's rationale.`,
    `Pick the single best template per scene; only templates listed in SELECTION_INDEX. Keep each segment verbatim. Use "unmapped" only as a true last resort. Return scenes in script order.`,
  ].join('\n'),
  { label: 'director', phase: 'Direct', schema: DIRECTOR_SCHEMA },
)

// Pipeline: each scene flows re-edit -> icon-resolve with NO barrier between them.
const plan = await pipeline(
  (direction.scenes || []),
  // Stage 1: re-edit (linearize + slots + icon CONCEPTS)
  (s) => agent(
    [
      `You are the TEMPLATE RE-EDITOR for ONE scene. The director assigned this segment to template "${s.template}".`,
      `Read that template's guidance: ${REPO}/templates/${s.template}/GUIDANCE.md (narration rules, canonical reveal order, slots + char limits, icon usage, Reprocessing directive).`,
      ``,
      `SCENE SEGMENT (verbatim):`,
      s.segment,
      ``,
      `Do, in order:`,
      `1. CONFIRM FIT against the guidance. If it does not truly fit, set fitOk=false, explain, name a better template, but still give a best-effort mapping.`,
      `2. LINEARIZE: rewrite the voiceover so its order matches the template's canonical reveal order. Preserve meaning + tone; invent nothing. If already linear, keep wording and set wasReordered=false.`,
      `3. MAP TO SLOTS: extract content into the reveal targets, tightening each slot's text to its char limit + phrasing rule (single word or short 2-4 word phrase for title/caption slots).`,
      `4. ICON CONCEPTS: for templates that use per-slot icons, set "iconConcept" to a SHORT PLAIN-WORDS description of what the icon should depict. Do NOT guess a library id (the icon stage resolves concepts to real ids). Omit iconConcept for slots/templates with no icon.`,
      `5. REVEAL ORDER: list the ordered reveal targets. Do NOT assign times (filled later from the SRT).`,
    ].join('\n'),
    { label: `re-edit:${s.id}:${s.template}`, phase: 'Re-edit', schema: REEDIT_SCHEMA },
  ).then((r) => (r ? { ...s, ...r } : { ...s, fitOk: false, slots: [], warnings: ['re-edit produced no output'] })),

  // Stage 2: icon-resolve (concept -> real library id), only if there are concepts
  (re) => {
    const need = (re.slots || []).filter((sl) => sl && sl.iconConcept)
    if (!need.length) return { ...re, icons: { usesIcons: false, surface: 'light', resolved: [], notes: ['no icon slots'] } }
    return agent(
      [
        `You are the ICON RESOLVER for scene "${re.id}" (template "${re.template}").`,
        `Goal: turn each slot's icon CONCEPT into a REAL, validated icon id from the master library. You may NEVER invent an id; you may only choose ids that the search tool returns.`,
        ``,
        `Step A. Read ${REPO}/templates/${re.template}/GUIDANCE.md and find the icon surface (the "assets.iconVariant" line / icon-contrast note). Icons on a dark or saturated-colour surface use the "-dark" variant (light artwork); icons on a light background use "-light". Set "surface" accordingly.`,
        `Step B. For EACH slot below, run the search tool to get a shortlist of real ids, then pick the single best id whose meaning matches the concept, using the correct variant for the surface:`,
        `   python "${ICONS}/icon-search.py" "<concept, in concrete nouns>" --surface <dark|light> --top 12`,
        `   If the concept is abstract and the shortlist is weak, RE-QUERY with more concrete words (e.g. "intervention backfires" -> try "fix creates new problem", "warning", "domino"). Pick only from real search output.`,
        `Step C. (Recommended) self-check: run`,
        `   python "${ICONS}/validate-icons.py" --ids <id1> <id2> ...`,
        `   and confirm every chosen id is real before returning.`,
        ``,
        `Slots needing an icon (target -> concept):`,
        ...need.map((sl) => `   ${sl.target} -> ${sl.iconConcept}`),
        ``,
        `Return usesIcons=true, the surface, and one {target, iconId, why} per slot above. iconId MUST be a real id from search output (with its -light/-dark suffix).`,
      ].join('\n'),
      { label: `icons:${re.id}:${re.template}`, phase: 'Icons', schema: ICON_SCHEMA },
    ).then((ic) => ({ ...re, icons: ic || { usesIcons: false, surface: 'light', resolved: [], notes: ['icon agent produced no output'] } }))
  },
)

return { scenes: plan.filter(Boolean), unmapped: direction.unmapped || [] }
