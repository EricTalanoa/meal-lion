// Refresh the human-readable coverage report from the roster and normalized map.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const map = read('assets/asset-map.json');
const roster = read('reference/meal-lion-45-meals.json').meals;
const labels = new Set(map.ingredients.map(x => x.label));
const ids = new Set(map.meals.map(x => x.id));
const canonical = new Set(roster.flatMap(x => x.ingredients));
const text = ['# Artwork coverage', '',
  `${roster.filter(x => ids.has(x.id)).length}/${roster.length} meal illustrations; ${[...canonical].filter(x => labels.has(x)).length}/${canonical.size} canonical ingredient icons; ${map.animations.length} custom animation groups. All draft.`, '',
  '| ID | Meal | Meal art | Missing ingredient icons |', '|---|---|---|---|',
  ...roster.map(m => `| ${m.id} | ${m.name} | ${ids.has(m.id) ? 'Available' : 'Missing'} | ${m.ingredients.filter(x => !labels.has(x)).join(', ') || 'None'} |`), ''].join('\n');
fs.writeFileSync(path.join(root, 'assets/COVERAGE.md'), text);
console.log(text.split('\n')[2]);
