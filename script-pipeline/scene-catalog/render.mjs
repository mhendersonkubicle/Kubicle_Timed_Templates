// Render stills for the catalog. Two modes (set via MODE env), so the Python
// orchestrator can bundle ONCE and then render in small chunks across fresh node
// processes, this keeps Chrome's memory bounded (rendering ~80 stills in one
// process crashes it) and isolates any single bad still instead of aborting all.
//
//   MODE=bundle   -> bundle the catalog, write the serveUrl to _build/serveurl.txt
//   MODE=render   -> render manifest[START : START+COUNT] using that serveUrl
//
// Loads Remotion from the in-repo harness deps. Env: HARNESS, BUILD, OUT.
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const HARNESS = process.env.HARNESS;
const BUILD = process.env.BUILD;
const OUT = process.env.OUT;
const SERVE = path.join(BUILD, 'serveurl.txt');

const req = createRequire(path.join(HARNESS, 'package.json'));

if (process.env.MODE === 'bundle') {
  const { bundle } = req('@remotion/bundler');
  console.log('bundling once (deps from harness) ...');
  const serveUrl = await bundle({
    entryPoint: path.join(BUILD, 'src', 'index.ts'),
    publicDir: path.join(BUILD, 'public'),
    webpackOverride: (config) => {
      config.resolve = config.resolve || {};
      config.resolve.modules = [path.join(HARNESS, 'node_modules'), ...(config.resolve.modules || ['node_modules'])];
      return config;
    },
  });
  fs.writeFileSync(SERVE, serveUrl);
  console.log('bundled:', serveUrl);
} else {
  const { selectComposition, renderStill } = req('@remotion/renderer');
  const serveUrl = fs.readFileSync(SERVE, 'utf8').trim();
  const manifest = JSON.parse(fs.readFileSync(path.join(BUILD, 'catalog-manifest.json'), 'utf8'));
  fs.mkdirSync(OUT, { recursive: true });
  const start = parseInt(process.env.START || '0', 10);
  const count = parseInt(process.env.COUNT || String(manifest.length), 10);
  for (const m of manifest.slice(start, start + count)) {
    try {
      const comp = await selectComposition({ serveUrl, id: m.compId });
      await renderStill({ serveUrl, composition: comp, output: path.join(OUT, m.compId + '.png'), frame: m.frame, scale: 0.5 });
      console.log('OK  ', m.compId);
    } catch (e) {
      console.log('FAIL', m.compId, '->', String(e).split('\n')[0]);
    }
  }
}
