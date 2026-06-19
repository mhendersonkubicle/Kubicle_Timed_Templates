// Marks a lesson as delivered: writes inputs/<id>/delivered.json with the R2 key
// of the uploaded MP4. The Requests tab then shows a Download button (the list
// function mints a fresh presigned link from this key). Called by the local
// deliver helper after you render and upload the video.
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ error: 'Bad JSON' }, 400); }

  if (b.accessCode !== process.env.ACCESS_CODE) return json({ error: 'Wrong access code' }, 401);
  if (!b.id || !b.videoKey) return json({ error: 'Missing id or videoKey' }, 400);

  const path = `inputs/${b.id}/delivered.json`;
  const repo = process.env.GITHUB_REPO;
  const api = `https://api.github.com/repos/${repo}/contents/${path}`;
  const ghHeaders = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    'User-Agent': 'lesson-submit-app',
    Accept: 'application/vnd.github+json',
  };

  let sha;
  const head = await fetch(api, { headers: ghHeaders });
  if (head.ok) sha = (await head.json()).sha;

  const body = { videoKey: b.videoKey, deliveredAt: new Date().toISOString() };
  const put = await fetch(api, {
    method: 'PUT',
    headers: { ...ghHeaders, 'content-type': 'application/json' },
    body: JSON.stringify({
      message: `Deliver ${b.id}`,
      content: Buffer.from(JSON.stringify(body, null, 2)).toString('base64'),
      sha,
    }),
  });
  if (!put.ok) return json({ error: 'GitHub commit failed', detail: await put.text() }, 500);
  return json({ ok: true });
};
