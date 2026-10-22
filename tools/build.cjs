// Copies only the files the game needs into a publish folder (default: dist/).
// Usage: node tools/build.cjs [outDir]
// Netlify runs this (see netlify.toml) and publishes the result, so reference art notes,
// prompts, mockups, demos, docs, tests and tools never go online.
// Images: publishes the lossless WebP copies from assets/web/ (made by
// tools/optimize-images.py) in place of the reference/ PNGs, and writes a published
// asset-map.json pointing at them. A copy whose recorded source hash no longer matches
// the original is skipped in favour of the original PNG, with a warning.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const out = path.resolve(root, process.argv[2] || 'dist');
if (out === root || root.startsWith(out + path.sep)) throw new Error(`Refusing to clear ${out}`);

const map = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'asset-map.json'), 'utf8'));
const items = [map.background, map.chef, ...map.meals, ...map.ingredients, ...map.animations];
const manifestPath = path.join(root, 'assets', 'web', 'manifest.json');
const optimized = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')).files : {};
const publishAs = new Map();
for (const file of new Set(items.map(x => x.file))) {
  const copy = optimized[file];
  const fresh = copy && fs.existsSync(path.join(root, copy.file)) && fs.existsSync(path.join(root, file)) &&
    crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex') === copy.sourceSha256;
  if (!fresh) console.warn(`Publishing original ${file}: no up-to-date copy (run python tools/optimize-images.py)`);
  publishAs.set(file, fresh ? copy.file : file);
}
const publishedMap = JSON.parse(JSON.stringify(map));
for (const x of [publishedMap.background, publishedMap.chef, ...publishedMap.meals, ...publishedMap.ingredients, ...publishedMap.animations]) x.file = publishAs.get(x.file);

// One small sheet of every ingredient icon (made by tools/build-icon-atlas.py), loaded at
// startup so clues never wait on a download. Published only while it matches the map.
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
function inputSha256(m) {
  const icons = new Map();
  for (const item of m.ingredients) if (!icons.has(item.label) || item.preferred) icons.set(item.label, item);
  const lines = [...icons].map(([label, it]) => [label, it.file, it.columns, it.rows, it.index, sha(it.file)].join('|'));
  return crypto.createHash('sha256').update(lines.join('\n')).digest('hex');
}
const atlasPath = path.join(root, 'assets', 'web', 'icon-atlas.json');
const atlas = fs.existsSync(atlasPath) ? JSON.parse(fs.readFileSync(atlasPath, 'utf8')) : null;
const atlasFresh = atlas && fs.existsSync(path.join(root, atlas.file)) && atlas.inputSha256 === inputSha256(map);
if (atlasFresh) publishedMap.iconAtlas = {file: atlas.file, cell: atlas.cell, columns: atlas.columns, labels: atlas.labels};
else console.warn('Publishing without the icon sheet: missing or out of date (run python tools/build-icon-atlas.py)');

// Small copies of the finished-meal pictures (made by tools/build-meal-thumbs.py), so the
// result plate loads quickly. Each is published only while it matches its source cell.
const mealKey = m => crypto.createHash('sha256').update([m.file, m.columns, m.rows, m.index, sha(m.file)].join('|')).digest('hex');
const thumbsPath = path.join(root, 'assets', 'web', 'meals', 'meals.json');
const thumbs = fs.existsSync(thumbsPath) ? JSON.parse(fs.readFileSync(thumbsPath, 'utf8')).meals : {};
const mealArt = {};
for (const m of map.meals) {
  const t = thumbs[m.id];
  if (t && t.key === mealKey(m) && fs.existsSync(path.join(root, t.file))) mealArt[m.id] = t.file;
  else console.warn(`Publishing full-size art for meal ${m.id}: no up-to-date small copy (run python tools/optimize-images.py)`);
}
publishedMap.mealArt = mealArt;

const gameFiles = fs.readdirSync(path.join(root, 'game')).map(f => `game/${f}`);
const files = [...gameFiles, 'reference/meal-lion-45-meals.json', ...new Set(publishAs.values()), ...(atlasFresh ? [atlas.file] : []), ...Object.values(mealArt)];

fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(path.join(out, 'assets'), {recursive: true});
const mapJson = JSON.stringify(publishedMap, null, 2) + '\n';
fs.writeFileSync(path.join(out, 'assets', 'asset-map.json'), mapJson);
files.push('assets/asset-map.json');
let bytes = Buffer.byteLength(mapJson);
for (const rel of files.slice(0, -1)) {
  const from = path.join(root, rel), to = path.join(out, rel);
  if (!fs.existsSync(from)) throw new Error(`Missing file needed by the game: ${rel}`);
  fs.mkdirSync(path.dirname(to), {recursive: true});
  fs.copyFileSync(from, to);
  bytes += fs.statSync(from).size;
}
console.log(`Built ${files.length} files (${(bytes / 1e6).toFixed(1)} MB) into ${path.relative(root, out) || out}`);
