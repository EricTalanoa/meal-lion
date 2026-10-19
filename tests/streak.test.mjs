import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyStreak, recordDaily, dailyStreakNow, nextEndlessStreak, readStreak, writeStreak} from '../game/streak.mjs';

const play = (results) => results.reduce((s, [date, won]) => recordDaily(s, date, won), emptyStreak());

test('consecutive daily wins build the streak', () => {
  const s = play([['2026-10-19', true], ['2026-10-20', true], ['2026-10-21', true]]);
  assert.equal(s.count, 3);
  assert.equal(s.best, 3);
  assert.equal(dailyStreakNow(s, '2026-10-21'), 3);
});

test('the streak still shows the next day until that dish is lost or missed', () => {
  const s = play([['2026-10-19', true], ['2026-10-20', true]]);
  assert.equal(dailyStreakNow(s, '2026-10-21'), 2);
  assert.equal(dailyStreakNow(s, '2026-10-22'), 0, 'missed a day');
});

test('a loss resets the streak but keeps the best', () => {
  const s = play([['2026-10-19', true], ['2026-10-20', true], ['2026-10-21', false]]);
  assert.equal(s.count, 0);
  assert.equal(s.best, 2);
  assert.equal(dailyStreakNow(s, '2026-10-21'), 0);
  assert.equal(recordDaily(s, '2026-10-22', true).count, 1);
});

test('a missed day restarts at one on the next win', () => {
  const s = play([['2026-10-19', true], ['2026-10-20', true], ['2026-10-22', true]]);
  assert.equal(s.count, 1);
  assert.equal(s.best, 2);
});

test('the same day only counts once (reloads, replays)', () => {
  const once = play([['2026-10-19', true]]);
  assert.strictEqual(recordDaily(once, '2026-10-19', true), once);
  assert.strictEqual(recordDaily(once, '2026-10-19', false), once);
});

test('month and year boundaries count as consecutive days', () => {
  assert.equal(play([['2026-10-31', true], ['2026-11-01', true]]).count, 2);
  assert.equal(play([['2026-12-31', true], ['2027-01-01', true]]).count, 2);
});

test('endless streak counts wins in a row and resets on a loss', () => {
  let n = 0;
  for (const won of [true, true, true]) n = nextEndlessStreak(n, won);
  assert.equal(n, 3);
  assert.equal(nextEndlessStreak(n, false), 0);
});

test('stored streaks are validated and storage failures are harmless', () => {
  const data = new Map();
  const store = {getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v)};
  assert.deepEqual(readStreak(store), emptyStreak());
  const s = play([['2026-10-19', true]]);
  writeStreak(store, s);
  assert.deepEqual(readStreak(store), s);
  for (const bad of ['{bad', '{"count":-1}', '{"count":"3","best":3}', '[]', 'null']) {
    data.set('meal-lion:streak', bad);
    assert.deepEqual(readStreak(store), emptyStreak(), bad);
  }
  const throwing = {getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }};
  assert.deepEqual(readStreak(throwing), emptyStreak());
  assert.doesNotThrow(() => writeStreak(throwing, s));
});
