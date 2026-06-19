# Lesson 1 scene plan (map-everything)

From `lesson1-script.md` via `script-to-scenes`. 10 scenes, 0 unmapped. Reveal order only; times filled later from the SRT.

## scene-1 -> LessonTitle

**VO:** Welcome to this course, Connecting AI Agents to Systems. So far, most of us have used AI to answer questions and generate content. In this course, we'll learn how AI can act on our systems for us, and how to connect it safely.

| Target | Text |
|---|---|
| `setup` | _(silent)_ |
| `logo` | Connecting AI Agents to Systems |
| `label` | Lesson One |
| `title` | From Map to Connection |
| `badge` | Kubicle |

## scene-2 -> LessonGoal  (reordered)

*Reorder:* The original narration leads with the goal content ("we'll explain what it means to connect an AI agent to a system...") with no framing beat first. The canonical reveal order requires a short framing beat as the heading appears, then the spoken goal as the goal copy reveals. I added a brief framing beat ("Here's the goal for this first lesson.") before the goal statement, preserving the original meaning and wording of the goal itself. setup carries no narration.

**VO:** Here's the goal for this first lesson. We'll explain what it means to connect an AI agent to a system, and why it's more than just adding a feature.

| Target | Text |
|---|---|
| `heading` | Lesson Goal |
| `goal` | Explain what connecting an AI agent to a system means, and why it's more than just adding a feature. |

## scene-3 -> YinYang2Points  (reordered)

*Reorder:* Side A in the source is mostly linear but states its conclusion ("the AI sits outside our systems, it has no hands") before fully explaining the consequence ("a person still has to carry it into the workflow"). I kept side A in its natural order: frame the comparison, name side A, then its two sub-points (it answers but stays outside / has no hands; a human must carry the output into the workflow). Side B is only introduced ("An AI agent is different"), so its title is taken verbatim and its two sub-points are best-guess parallels of side A's, placed after side A is fully delivered to satisfy the side-complete reveal order.

**VO:** Until now, most of us have used AI in one mode, and an AI agent flips it. First, the answering mode. We ask and it answers, but it sits outside our systems with no hands. So a person has to take what it produces and carry it into the real workflow. Now, the acting mode. An AI agent is different. It works inside our systems, and it carries the work through itself.

| Target | Text |
|---|---|
| `leftTitle` | AI that answers |
| `leftBox0` | Sits outside systems |
| `leftBox1` | You carry the output |
| `rightTitle` | AI that acts |
| `rightBox0` | Works inside systems |
| `rightBox1` | Carries work itself |

## scene-4 -> WordDefinition

**VO:** AI Agent. An AI model given tools to act on our systems, not just answer. An agent doesn't just produce text for a person to act on. It acts. Given access, it can read a record, update a field, or trigger the next step in a process. The AI model is still at the centre, deciding what to do. What's new is that it's given tools, connections that let it reach into our live systems and change them. That, in a sentence, is what connecting means: giving an AI the tools to act, not just answer.

| Target | Text |
|---|---|
| `setup` | _(silent)_ |
| `title` | AI Agent |
| `description` | An AI model given tools to act on our systems, not just answer. |

## scene-5 -> WordDefinition

**VO:** Connecting. Giving an AI the tools to act, not just answer. That difference, between answering and acting, is what this course is about. Once an AI can act, and not just describe, it matters a great deal where we let it act, where we don't, and who stays in control.

| Target | Text |
|---|---|
| `setup` | _(silent)_ |
| `title` | Connecting |
| `description` | Giving an AI the tools to act, not just answer. |

## scene-6 -> Topic1Subtopics6

**VO:** It's tempting to treat connecting an agent as a technical detail that comes after the real decisions are made. But connecting an agent doesn't just make one step faster. It changes who does the work, what the process can do on its own, and how information moves through it. A step that used to wait for a person can now run by itself. A check that used to happen in someone's head now happens in code. An action that used to need a signature can now happen automatically. Those are real changes to how the process behaves, and they affect the steps before and after, not just the one we touched.

| Target | Text |
|---|---|
| `header` | More than speed |
| `detail0` | Steps run without waiting for a person |
| `detail1` | Checks move from heads into code |
| `detail2` | Actions happen without a signature |

## scene-7 -> YinYang2Points  (reordered)

*Reorder:* The source already leads with the worst way and then the better way, so it is broadly side-complete. However it states each side as a single flowing sentence rather than a title plus discrete sub-points. I split each side into a short title and reinforcing sub-points so the wording maps onto the canonical leftTitle, leftBox0, leftBox1, rightTitle, rightBox0, rightBox1 reveal order, and I collapsed the better-way side's three ideas into two icon-able sub-points. No cross-side ping-pong was present to fix.

**VO:** There are two ways to connect an agent. First, the worst way. You drop it into whatever step seems convenient. No plan, you just see what happens. Now, the better way. You decide in advance exactly where the agent acts and what it is allowed to touch. And you keep a person in control.

| Target | Text |
|---|---|
| `leftTitle` | The worst way |
| `leftBox0` | Drop in anywhere |
| `leftBox1` | No plan, just see |
| `rightTitle` | The better way |
| `rightBox0` | Decide where it acts |
| `rightBox1` | Person stays in control |

## scene-8 -> Topic1Subtopics6

**VO:** That's why we start not from the technology but from a map of the work, even a rough one. A map is just a clear picture of how a process runs, with a few points marked. First, where an agent could add value. Second, where it must not be allowed to decide. And third, where a person stays in control. This course is about taking one of those points and turning it into a real, working, governed connection.

| Target | Text |
|---|---|
| `header` | A map of the work |
| `detail0` | Where an agent adds value |
| `detail1` | Where it must not decide |
| `detail2` | Where a person stays in control |

## scene-9 -> IconPointsV1

**VO:** In this course, we'll cover three things. First, how an agent actually connects to a system, through tools, APIs, and the Model Context Protocol. Second, how to judge where a connection is safe and where it carries real risk, by separating what an agent reads from what it can change, and limiting its access carefully. Third, how to build oversight and resilience into the connection, and then take it safely into live operation. By the end, we'll be able to take a single candidate point on a process map and produce a complete connection design: the tools it needs, the access it's allowed, the checkpoints around it, and the way it fails safely.

| Target | Text |
|---|---|
| `setup` | Course overview |
| `pill0` | Connecting agents |
| `pill1` | Safe vs risky |
| `pill2` | Oversight & launch |

## scene-10 -> LessonSummary

**VO:** Let's stop the lesson here. In this lesson, we first explained what connecting an AI agent actually means: giving it the tools to act on our systems, not just answer questions. We then saw why that changes how a process works, not just how fast it runs, which is why we plan a connection from a map rather than improvising it. Finally, we outlined what we'll build together: a complete, governed connection design for one part of a process map.

| Target | Text |
|---|---|
| `title` | Lesson Summary |
| `pill0` | What connecting an agent means |
| `pill1` | Why connection changes process |
| `pill2` | What this course will produce |
