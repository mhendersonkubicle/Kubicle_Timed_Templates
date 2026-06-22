// Render one still per template composition into <scene-catalog>/out.
// Loads Remotion's bundler/renderer from the in-repo harness deps (so this works
// on any clone without a separate install), and points webpack at the harness
// node_modules so the template imports (react, remotion, zod) resolve there.
//
// Invoked by build-catalog.py with env: HARNESS, BUILD, OUT.
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const HARNESS = process.env.HARNESS;
const BUILD = process.env.BUILD;
const OUT = process.env.OUT;

const harnessRequire = createRequire(path.join(HARNESS, 'package.json'));
const { bundle } = harnessRequire('@remotion/bundler');
const { selectComposition, renderStill } = harnessRequire('@remotion/renderer');

const manifest = JSON.parse(fs.readFileSync(path.join(BUILD, 'catalog-manifest.json'), 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

console.log('bundling once (deps from harness) ...');
const serveUrl = await bundle({
  entryPoint: path.join(BUILD, 'src', 'index.ts'),
  publicDir: path.join(BUILD, 'public'),
  webpackOverride: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.modules = [
      path.join(HARNESS, 'node_modules'),
      ...(config.resolve.modules || ['node_modules']),
    ];
    return config;
  },
});
console.log('bundled. rendering', manifest.length, 'stills at scale 0.5');

let ok = 0, fail = 0;
for (const m of manifest) {
  try {
    const comp = await selectComposition({ serveUrl, id: m.compId });
    await renderStill({ serveUrl, composition: comp, output: path.join(OUT, m.compId + '.png'), frame: m.frame, scale: 0.5 });
    ok++; console.log('OK  ', m.compId);
  } catch (e) {
    fail++; console.log('FAIL', m.compId, '->', String(e).split('\n')[0]);
  }
}
console.log(`done: ${ok} ok, ${fail} fail`);
if (fail) process.exitCode = 1;
