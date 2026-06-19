// Mints short-lived upload (PUT) and download (GET) URLs for the SRT + MP3,
// so the browser uploads files straight to R2 storage (bypassing the function
// size limit). Validates the shared access code first. Secrets stay server-side.
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

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

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: 'Bad JSON' }, 400); }

  if (body.accessCode !== process.env.ACCESS_CODE) return json({ error: 'Wrong access code' }, 401);
  if (!Array.isArray(body.files) || body.files.length === 0) return json({ error: 'No files requested' }, 400);

  const bucket = process.env.R2_BUCKET;
  const prefix = randomUUID();
  const out = [];
  for (const f of body.files) {
    const key = `uploads/${prefix}/${f.name}`;
    const putUrl = await getSignedUrl(r2, new PutObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 900 });
    const getUrl = await getSignedUrl(r2, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 86400 });
    out.push({ name: f.name, key, putUrl, getUrl });
  }
  return json({ files: out });
};
