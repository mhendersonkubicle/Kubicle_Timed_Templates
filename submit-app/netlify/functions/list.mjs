// Lists every lesson request and its status for the Requests tab.
// Reads the repo (inputs/* request.json + which projects/ folders exist + any
// delivered.json) and, for delivered lessons, mints a fresh presigned download
// URL for the video so the link never goes stale.
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

const repo = () => process.env.GITHUB_REPO;
const ghHeaders = () => ({
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  'User-Agent': 'lesson-submit-app',
  Accept: 'application/vnd.github+json',
});

async function ghDir(path) {
  const r = await fetch(`https://api.github.com/repos/${repo()}/contents/${path}`, { headers: ghHeaders() });
  if (!r.ok) return [];
  const j = await r.json();
  return Array.isArray(j) ? j : [];
}
async function ghFile(path) {
  const r = await fetch(`https://api.github.com/repos/${repo()}/contents/${path}`, { headers: ghHeaders() });
  if (!r.ok) return null;
  const j = await r.json();
  try { return JSON.parse(Buffer.from(j.content, 'base64').toString('utf-8')); } catch { return null; }
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ error: 'Bad JSON' }, 400); }
  if (b.accessCode !== process.env.ACCESS_CODE) return json({ error: 'Wrong access code' }, 401);

  const inputDirs = (await ghDir('inputs')).filter((e) => e.type === 'dir');
  const builtSet = new Set((await ghDir('projects')).filter((e) => e.type === 'dir').map((e) => e.name));

  const rows = [];
  for (const dir of inputDirs) {
    const reqj = await ghFile(`inputs/${dir.name}/request.json`);
    if (!reqj) continue;
    const built = builtSet.has(dir.name);
    const statusFile = await ghFile(`inputs/${dir.name}/status.json`);
    const delivered = await ghFile(`inputs/${dir.name}/delivered.json`);

    // Building -> Ready (built) -> Delivered; Error if the build reported failure.
    let status = built ? 'ready' : 'building';
    let runUrl = null;
    if (statusFile && statusFile.state === 'error') { status = 'error'; runUrl = statusFile.run || null; }
    let downloadUrl = null;
    if (delivered && delivered.videoKey) {
      status = 'delivered';
      downloadUrl = await getSignedUrl(
        r2,
        new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: delivered.videoKey }),
        { expiresIn: 3600 }
      );
    }
    rows.push({
      id: dir.name,
      course: reqj.course,
      lessonNumber: reqj.lessonNumber,
      lessonTitle: reqj.lessonTitle,
      submitter: reqj.submitter || '',
      submittedAt: reqj.submittedAt || '',
      status,
      runUrl,
      downloadUrl,
    });
  }
  rows.sort((a, b2) => (b2.submittedAt || '').localeCompare(a.submittedAt || ''));
  return json({ requests: rows });
};
