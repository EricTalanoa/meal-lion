import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, readdirSync, existsSync, rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join, relative, sep} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = mkdtempSync(join(tmpdir(), 'meal-lion-dist-'));
execFileSync(process.execPath, [join(root, 'tools', 'build.cjs'), out], {cwd: root});
const files = [];
(function walk(dir) { for (const e of readdirSync(dir, {withFileTypes: true})) { const p = join(dir, e.name); e.isDirectory() ? walk(p) : files.push(relative(out, p).split(sep).join('/')); } })(out);
test.after(() => rmSync(out, {recursive: true, force: true}));
const mapFiles = map => new Set([map.background.file, map.chef.file, ...[...map.meals, ...map.ingredients, ...map.animations].map(x => x.file)]);
const sourceMap = JSON.parse(readFileSync(join(root, 'assets', 'asset-map.json')));
const publishedMap = JSON.parse(readFileSync(join(out, 'assets', 'asset-map.json')));
const manifest = JSON.parse(readFileSync(join(root, 'assets', 'web', 'manifest.json'))).files;
// Width/height from a lossless WebP (VP8L) header.
function webpSize(buf) {
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF'); assert.equal(buf.toString('ascii', 8, 16), 'WEBPVP8L');
  const bits = buf.readUInt32LE(21);
  return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
}

test('publishes the game, its data and every image in the published asset map', () => {
  for (const f of ['game/index.html', 'game/style.css', 'game/app.mjs', 'game/schedule.json', 'game/aliases.json',
    'reference/meal-lion-45-meals.json', 'assets/asset-map.json']) assert.ok(files.includes(f), f);
  for (const f of readdirSync(join(root, 'game'))) assert.ok(files.includes(`game/${f}`), `game/${f}`);
  for (const f of mapFiles(publishedMap)) assert.ok(files.includes(f), f);
});

test('published asset map matches the source map except for image paths', () => {
  const strip = m => JSON.stringify(m, (k, v) => k === 'file' ? undefined : v);
  assert.equal(strip(publishedMap), strip(sourceMap));
  const flat = m => [m.background, m.chef, ...m.meals, ...m.ingredients, ...m.animations].map(x => x.file);
  flat(sourceMap).forEach((f, i) => assert.equal(flat(publishedMap)[i], manifest[f].file, f));
});

test('optimized copies match the current originals (hash and dimensions)', () => {
  for (const f of mapFiles(sourceMap)) {
    const entry = manifest[f];
    assert.ok(entry, `${f} has no optimized copy: run python tools/optimize-images.py`);
    assert.equal(createHash('sha256').update(readFileSync(join(root, f))).digest('hex'), entry.sourceSha256, `${f} changed: rerun tools/optimize-images.py`);
    assert.ok(entry.file.startsWith('assets/web/') && entry.file.endsWith('.webp'), entry.file);
    const png = readFileSync(join(root, f));
    const webp = readFileSync(join(root, entry.file));
    assert.deepEqual(webpSize(webp), [png.readUInt32BE(16), png.readUInt32BE(20)], `${f} dimensions`);
    assert.ok(webp.length < png.length, `${entry.file} is smaller`);
  }
});

test('every relative URL the game fetches resolves inside the published site', () => {
  const app = readFileSync(join(root, 'game', 'app.mjs'), 'utf8');
  const urls = [...app.matchAll(/'((?:\.\.\/)?[\w./-]+\.json)'/g)].map(m => m[1]);
  assert.ok(urls.length >= 4);
  for (const u of urls) assert.ok(existsSync(new URL(u, `file://${out.split(sep).join('/')}/game/`)), u);
});

test('publishes nothing else: no docs, prompts, mockups, demos, tests or tools', () => {
  const images = mapFiles(publishedMap);
  const allowed = f => f.startsWith('game/') || images.has(f) || ['reference/meal-lion-45-meals.json', 'assets/asset-map.json'].includes(f);
  assert.deepEqual(files.filter(f => !allowed(f)), []);
  assert.ok(!files.some(f => /\.(md|txt|cjs|py|png)$/.test(f) || f.includes('game-layouts') || f.endsWith('pilot.html') || f.endsWith('manifest.json')));
});

test('netlify config builds and publishes only dist', () => {
  const toml = readFileSync(join(root, 'netlify.toml'), 'utf8');
  assert.match(toml, /publish\s*=\s*"dist"/);
  assert.match(toml, /command\s*=\s*"node tools\/build\.cjs"/);
});
