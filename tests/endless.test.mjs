import test from 'node:test';
import assert from 'node:assert/strict';
import {newDeck, drawDish} from '../game/endless.mjs';
import {seededRng} from '../game/schedule.mjs';

const ids = Array.from({length: 45}, (_, i) => i + 1);
function draws(n, {exclude = () => null, deckIds = ids, seed = 's'} = {}) {
  const rng = seededRng(seed);
  let deck = newDeck(deckIds), out = [];
  for (let i = 0; i < n; i++) { const r = drawDish(deck, exclude(i), rng); out.push(r.id); deck = r.deck; }
  return out;
}

test('every dish comes up once before any repeats', () => {
  for (const seed of ['a', 'b', 'c']) {
    const out = draws(90, {seed});
    assert.deepEqual([...out.slice(0, 45)].sort((a, b) => a - b), ids);
    assert.deepEqual([...out.slice(45)].sort((a, b) => a - b), ids);
  }
});

test('order is shuffled, not roster order', () => {
  assert.notDeepEqual(draws(45), ids);
  assert.notDeepEqual(draws(45, {seed: 'x'}), draws(45, {seed: 'y'}));
});

test('never the same dish twice in a row, including across reshuffles', () => {
  for (const seed of ['a', 'b', 'c', 'd', 'e']) {
    const out = draws(45 * 20, {seed});
    for (let i = 1; i < out.length; i++) assert.notEqual(out[i], out[i - 1], `repeat at ${i}`);
  }
});

test("today's daily dish is never served, and each cycle covers the rest once", () => {
  const out = draws(44 * 3, {exclude: () => 7});
  assert.ok(!out.includes(7));
  for (let c = 0; c < 3; c++) assert.deepEqual([...out.slice(c * 44, c * 44 + 44)].sort((a, b) => a - b), ids.filter(i => i !== 7));
});

test('the excluded dish can change mid-deck (daily rollover)', () => {
  const out = draws(60, {exclude: i => i < 20 ? 3 : 9});
  assert.ok(!out.slice(0, 20).includes(3));
  assert.ok(!out.slice(20).includes(9));
});

test('tiny rosters behave', () => {
  assert.equal(drawDish(newDeck([1]), 1, Math.random).id, null);
  assert.deepEqual(draws(5, {deckIds: [1, 2], exclude: () => 1}), [2, 2, 2, 2, 2]);
  const two = draws(10, {deckIds: [1, 2]});
  for (let i = 1; i < two.length; i++) assert.notEqual(two[i], two[i - 1]);
});

test('drawing does not mutate the previous deck', () => {
  const deck = newDeck(ids);
  const copy = JSON.parse(JSON.stringify(deck));
  drawDish(deck, null, seededRng('m'));
  assert.deepEqual(deck, copy);
});
