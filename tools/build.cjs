// Copies only the files the game needs into a publish folder (default: dist/).
// Usage: node tools/build.cjs [outDir]
// Netlify runs this (see netlify.toml) and publishes the result, so reference art notes,
// prompts, mockups, demos, docs, tests and tools never go online.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.resolve(root, process.argv[2] || 'dist');
if (out === root || root.startsWith(out + path.sep)) throw new Error(`Refusing to clear ${out}`);

const map = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'asset-map.json'), 'utf8'));
const images = new Set([map.background.file, map.chef.file, ...[...map.meals, ...map.ingredients, ...map.animations].map(x => x.file)]);
const gameFiles = fs.readdirSync(path.join(root, 'game')).map(f => `game/${f}`);
const files = [...gameFiles, 'reference/meal-lion-45-meals.json', 'assets/asset-map.json', ...images];

fs.rmSync(out, {recursive: true, force: true});
let bytes = 0;
for (const rel of files) {
  const from = path.join(root, rel), to = path.join(out, rel);
  if (!fs.existsSync(from)) throw new Error(`Missing file needed by the game: ${rel}`);
  fs.mkdirSync(path.dirname(to), {recursive: true});
  fs.copyFileSync(from, to);
  bytes += fs.statSync(from).size;
}
console.log(`Built ${files.length} files (${(bytes / 1e6).toFixed(1)} MB) into ${path.relative(root, out) || out}`);
