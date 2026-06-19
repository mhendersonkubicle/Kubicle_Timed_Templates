// Receives the lesson fields + the storage download links, then writes a
// request.json into the repo. That commit auto-starts the Build Lesson Action.
// Validates the shared access code first. The GitHub token stays server-side.

const slug = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ error: 'Bad JSON' }, 400); }

  if (b.accessCode !== process.env.ACCESS_CODE) return json({ error: 'Wrong access code' }, 401);
  for (const k of ['course', 'lessonNumber', 'lessonTitle', 'srtUrl', 'mp3Url']) {
    if (!b[k]) return json({ error: `Missing field: ${k}` }, 400);
  }

  const courseId = slug(b.course);
  const path = `inputs/${courseId}-l${b.lessonNumber}/request.json`;
  const content = {
    course: b.course,
    courseId,
    lessonNumber: String(b.lessonNumber),
    lessonTitle: b.lessonTitle,
    requirements: b.requirements || '',
    model: b.model || 'claude-sonnet-4-6',
    srtUrl: b.srtUrl,
    mp3Url: b.mp3Url,
  };

  const repo = process.env.GITHUB_REPO; // e.g. mhendersonkubicle/Kubicle_Timed_Templates
  const api = `https://api.github.com/repos/${repo}/contents/${path}`;
  const ghHeaders = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'User-Agent': 'lesson-submit-app',
    Accept: 'application/vnd.github+json',
  };

  // If a request.json already exists at this path we need its sha to overwrite.
  let sha;
  const head = await fetch(api, { headers: ghHeaders });
  if (head.ok) sha = (await head.json()).sha;

  const put = await fetch(api, {
    method: 'PUT',
    headers: { ...ghHeaders, 'content-type': 'application/json' },
    body: JSON.stringify({
      message: `Build ${courseId} lesson ${b.lessonNumber} (via submit form)`,
      content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
      sha,
    }),
  });
  if (!put.ok) return json({ error: 'GitHub commit failed', detail: await put.text() }, 500);

  return json({ ok: true, courseId, path });
};
