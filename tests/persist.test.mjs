import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame, submitGuess, skipClue} from '../game/state.mjs';
import {dailyClueRng} from '../game/schedule.mjs';
import {dailyRecord, replayDaily, readRecord, writeRecord} from '../game/persist.mjs';

const roster = Array.from({length: 12}, (_, i) => ({id: i + 1, name: `Meal ${i + 1}`, ingredients: ['a', 'b', 'c']}));
const dish = {id: 1, name: 'Meal 1', ingredients: ['Egg', 'Tomato', 'Onion', 'Garlic']};
const daily = {date: '2026-10-19', n: 2, id: 1};
const fresh = (startWithClue = true) => createGame(dish, {startWithClue, rng: dailyClueRng(daily.date, daily.id)});

function memoryStorage() {
  const data = new Map();
  return {getItem: k => data.has(k) ? data.get(k) : null, setItem: (k, v) => data.set(k, String(v)), data};
}

test('a saved daily game replays to the same state', () => {
  for (const startWithClue of [true, false]) {
    let g = fresh(startWithClue);
    g = submitGuess(g, 5, roster).state;
    g = skipClue(g).state;
    const restored = replayDaily(JSON.parse(JSON.stringify(dailyRecord(g, daily))), daily, dish, roster);
    assert.deepEqual(restored, g);
  }
});

test('finished games restore as finished', () => {
  let g = fresh();
  g = submitGuess(g, 4, roster).state;
  g = submitGuess(g, 1, roster).state;
  assert.equal(g.status, 'won');
  assert.equal(replayDaily(dailyRecord(g, daily), daily, dish, roster).status, 'won');
});

test('records from another day or dish are ignored', () => {
  const rec = dailyRecord(submitGuess(fresh(), 5, roster).state, daily);
  assert.equal(replayDaily(rec, {...daily, date: '2026-10-20'}, dish, roster), null);
  assert.equal(replayDaily(rec, {...daily, id: 2}, dish, roster), null);
});

test('damaged or impossible records are ignored', () => {
  const rec = dailyRecord(submitGuess(fresh(), 5, roster).state, daily);
  for (const bad of [null, 'x', {}, {...rec, version: 99}, {...rec, actions: 'nope'}, {...rec, actions: [5, 5]},
    {...rec, actions: [999]}, {...rec, actions: [2, 3, 4, 5, 6]}, {...rec, actions: [1, 2]}, {...rec, startWithClue: 'yes'}]) {
    assert.equal(replayDaily(bad, daily, dish, roster), null, JSON.stringify(bad));
  }
});

test('storage helpers survive missing or throwing storage', () => {
  const s = memoryStorage();
  writeRecord(s, {a: 1});
  assert.deepEqual(readRecord(s), {a: 1});
  s.setItem('meal-lion:daily', '{broken');
  assert.equal(readRecord(s), null);
  const throwing = {getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }};
  assert.equal(readRecord(throwing), null);
  assert.doesNotThrow(() => writeRecord(throwing, {a: 1}));
  assert.equal(readRecord(undefined), null);
});
