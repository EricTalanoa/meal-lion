import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, readdirSync, existsSync, rmSync} from 'node:fs';
import {join, relative, sep} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = mkdtempSync(join(tmpdir(), 'meal-lion-dist-'));
execFileSync(process.execPath, [join(root, 'tools', 'build.cjs'), out], {cwd: root});
const files = [];
(function walk(dir) { for (const e of readdirSync(dir, {withFileTypes: true})) { const p = join(dir, e.name); e.isDirectory() ? walk(p) : files.push(relative(out, p).split(sep).join('/')); } })(out);
test.after(() => rmSync(out, {recursive: true, force: true}));

test('publishes the game, its data and every image in the asset map', () => {
  for (const f of ['game/index.html', 'game/style.css', 'game/app.mjs', 'game/schedule.json', 'game/aliases.json',
    'reference/meal-lion-45-meals.json', 'assets/asset-map.json']) assert.ok(files.includes(f), f);
  for (const f of readdirSync(join(root, 'game'))) assert.ok(files.includes(`game/${f}`), `game/${f}`);
  const map = JSON.parse(readFileSync(join(root, 'assets', 'asset-map.json')));
  const images = new Set([map.background.file, map.chef.file, ...[...map.meals, ...map.ingredients, ...map.animations].map(x => x.file)]);
  for (const f of images) assert.ok(files.includes(f), f);
});

test('every relative URL the game fetches resolves inside the published site', () => {
  const app = readFileSync(join(root, 'game', 'app.mjs'), 'utf8');
  const urls = [...app.matchAll(/'((?:\.\.\/)?[\w./-]+\.json)'/g)].map(m => m[1]);
  assert.ok(urls.length >= 4);
  for (const u of urls) assert.ok(existsSync(new URL(u, `file://${out.split(sep).join('/')}/game/`)), u);
});

test('publishes nothing else: no docs, prompts, mockups, demos, tests or tools', () => {
  const map = JSON.parse(readFileSync(join(root, 'assets', 'asset-map.json')));
  const images = new Set([map.background.file, map.chef.file, ...[...map.meals, ...map.ingredients, ...map.animations].map(x => x.file)]);
  const allowed = f => f.startsWith('game/') || images.has(f) || ['reference/meal-lion-45-meals.json', 'assets/asset-map.json'].includes(f);
  assert.deepEqual(files.filter(f => !allowed(f)), []);
  assert.ok(!files.some(f => /\.(md|txt|cjs)$/.test(f) || f.includes('game-layouts') || f.endsWith('pilot.html')));
});

test('netlify config builds and publishes only dist', () => {
  const toml = readFileSync(join(root, 'netlify.toml'), 'utf8');
  assert.match(toml, /publish\s*=\s*"dist"/);
  assert.match(toml, /command\s*=\s*"node tools\/build\.cjs"/);
});
