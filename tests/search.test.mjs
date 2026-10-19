import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {searchDishes} from '../game/search.mjs';
const roster = JSON.parse(readFileSync(new URL('../reference/meal-lion-45-meals.json', import.meta.url))).meals;
const names = q => searchDishes(roster, q).map(r => r.meal.name);
const top = q => names(q)[0];

test('exact prefix, word prefix and substring matches still come first', () => {
  assert.equal(top('pan'), 'Pancakes');
  assert.ok(names('toma').includes('Tomato soup'));
  assert.ok(names('toma').includes('Gnocchi with tomato sauce'));
  assert.equal(searchDishes(roster, 'pan')[0].close, false);
});

test('typos suggest the intended dish', () => {
  for (const [typo, want] of [['shaksuka', 'Shakshuka'], ['shakshuak', 'Shakshuka'], ['pancaks', 'Pancakes'], ['pnacakes', 'Pancakes'],
    ['grild chese', 'Grilled cheese'], ['grilld', 'Grilled cheese'], ['lasanga', 'Beef lasagna'], ['bolognaise', 'Spaghetti Bolognese'],
    ['carbonra', 'Spaghetti carbonara'], ['quesadila', 'Chicken quesadilla'], ['briyani', 'Chicken biryani'], ['rosti', 'Potato rösti']]) {
    assert.ok(names(typo).includes(want), `${typo} -> ${want}; got ${names(typo)}`);
  }
});

test('typo matches are flagged and ranked after real matches', () => {
  const results = searchDishes(roster, 'pancaks');
  assert.equal(results[0].meal.name, 'Pancakes');
  assert.equal(results[0].close, true);
});

test('short or unrelated input stays quiet', () => {
  assert.deepEqual(names(''), []);
  assert.deepEqual(names('qx'), []);
  assert.deepEqual(names('xylophone'), []);
  assert.ok(names('qz').length === 0);
});

test('results are capped', () => {
  assert.ok(searchDishes(roster, 'chicken').length <= 8);
});

const aliasFile = JSON.parse(readFileSync(new URL('../game/aliases.json', import.meta.url)));
const withAliases = q => searchDishes(roster, q, 8, aliasFile.aliases);

test('alternative names suggest our dish name as a close match', () => {
  for (const [alt, want] of [['mac n cheese', 'Macaroni and cheese'], ['mac & cheese', 'Macaroni and cheese'], ['spag bol', 'Spaghetti Bolognese'],
    ['shepherds pie', 'Cottage pie'], ["shepherd's pie", 'Cottage pie'], ['hamburger', 'Cheeseburger'], ['eggs in purgatory', 'Shakshuka'],
    ['hotcakes', 'Pancakes'], ['flapjack', 'Pancakes'], ['saag paneer', 'Palak paneer'], ['lasagne', 'Beef lasagna'], ['toastie', 'Grilled cheese']]) {
    const hit = withAliases(alt).find(r => r.meal.name === want);
    assert.ok(hit, `${alt} -> ${want}; got ${withAliases(alt).map(r => r.meal.name)}`);
    assert.equal(hit.close, true);
    assert.equal(withAliases(alt)[0].meal.name, want, `${alt} should rank ${want} first`);
  }
});

test('typos in alternative names still suggest our dish', () => {
  assert.equal(withAliases('shepards pie')[0].meal.name, 'Cottage pie');
  assert.equal(withAliases('hamburgr')[0].meal.name, 'Cheeseburger');
});

test('real name matches outrank alias matches and each dish appears once', () => {
  const r = withAliases('pancakes');
  assert.equal(r[0].meal.name, 'Pancakes');
  assert.equal(r[0].close, false);
  const names = withAliases('carbonara').map(x => x.meal.name);
  assert.equal(new Set(names).size, names.length);
});

test('alias file only points at roster dishes and never repeats a real name', () => {
  const ids = new Set(roster.map(m => m.id));
  const real = new Set(roster.map(m => m.name.toLowerCase()));
  for (const [id, list] of Object.entries(aliasFile.aliases)) {
    assert.ok(ids.has(Number(id)), `unknown dish ${id}`);
    for (const a of list) assert.ok(!real.has(a.toLowerCase()), `${a} is a real dish name`);
  }
});

test('words typed in a different order still suggest the dish', () => {
  assert.equal(searchDishes(roster, 'soup tomato')[0].meal.name, 'Tomato soup');
  assert.equal(searchDishes(roster, 'soup tomato')[0].close, true);
});
