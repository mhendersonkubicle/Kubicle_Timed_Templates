#!/usr/bin/env node
// Local helper: after you render a lesson MP4 in Studio, this uploads it to
// storage and marks the lesson "delivered" so a Download button appears in the
// Requests tab. Secrets stay in Netlify; this only needs the site URL + code.
//
// Usage:
//   APP_URL=https://your-site.netlify.app ACCESS_CODE=your-code \
//     node deliver-cli.mjs <mp4-path> <id>
//   <id> = the request folder name, e.g. marketing-in-professional-services-l4
import { readFile } from 'node:fs/promises';

const [, , mp4Path, id] = process.argv;
const { APP_URL, ACCESS_CODE } = process.env;
if (!mp4Path || !id) { console.error('Usage: node deliver-cli.mjs <mp4-path> <id>'); process.exit(1); }
if (!APP_URL || !ACCESS_CODE) { console.error('Set APP_URL and ACCESS_CODE env vars first.'); process.exit(1); }

const post = async (fn, body) => {
  const r = await fetch(`${APP_URL}/.netlify/functions/${fn}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ accessCode: ACCESS_CODE, ...body }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${fn} failed: ${j.error || r.status} ${j.detail || ''}`);
  return j;
};

const data = await readFile(mp4Path);
console.log('Requesting upload URL...');
const pres = await post('presign', { files: [{ name: `${id}.mp4` }] });
const { putUrl, key } = pres.files[0];

console.log('Uploading video...');
const up = await fetch(putUrl, { method: 'PUT', body: data });
if (!up.ok) throw new Error(`Upload failed: ${up.status}`);

console.log('Marking delivered...');
await post('deliver', { id, videoKey: key });
console.log(`Done. "${id}" now shows as Delivered with a Download button in the Requests tab.`);
