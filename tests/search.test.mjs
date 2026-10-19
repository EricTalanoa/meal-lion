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
