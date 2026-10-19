import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {easternDate, dayNumber, mealIdForDay, nextReset, seededRng, dailyClueRng} from '../game/schedule.mjs';
import {createGame} from '../game/state.mjs';

const at = iso => new Date(iso);
const schedule = {timeZone: 'America/New_York', startDate: '2026-10-18', days: [3, 1, 22]};

test('Eastern calendar date flips at local midnight in summer (EDT, UTC-4) and winter (EST, UTC-5)', () => {
  assert.equal(easternDate(at('2026-07-01T03:59:59Z')), '2026-06-30');
  assert.equal(easternDate(at('2026-07-01T04:00:00Z')), '2026-07-01');
  assert.equal(easternDate(at('2026-12-01T04:59:59Z')), '2026-11-30');
  assert.equal(easternDate(at('2026-12-01T05:00:00Z')), '2026-12-01');
});

test('DST change days still reset at midnight', () => {
  // 2026-11-01: clocks fall back at 2am EDT. Midnight that day is still EDT.
  assert.equal(easternDate(at('2026-11-01T03:59:59Z')), '2026-10-31');
  assert.equal(easternDate(at('2026-11-01T04:00:00Z')), '2026-11-01');
  assert.equal(easternDate(at('2026-11-02T04:59:59Z')), '2026-11-01');
  assert.equal(easternDate(at('2026-11-02T05:00:00Z')), '2026-11-02');
});

test('next reset is the coming Eastern midnight', () => {
  assert.equal(nextReset(at('2026-07-01T12:00:00Z')).toISOString(), '2026-07-02T04:00:00.000Z');
  assert.equal(nextReset(at('2026-12-01T05:00:00Z')).toISOString(), '2026-12-02T05:00:00.000Z');
  assert.equal(nextReset(at('2026-10-31T20:00:00Z')).toISOString(), '2026-11-01T04:00:00.000Z');
  assert.equal(nextReset(at('2026-11-01T12:00:00Z')).toISOString(), '2026-11-02T05:00:00.000Z');
  assert.equal(nextReset(at('2027-03-13T12:00:00Z')).toISOString(), '2027-03-14T05:00:00.000Z');
  assert.equal(nextReset(at('2027-03-14T12:00:00Z')).toISOString(), '2027-03-15T04:00:00.000Z');
});

test('day numbers count from the start date and map to the schedule', () => {
  assert.equal(dayNumber(schedule, '2026-10-18'), 1);
  assert.equal(dayNumber(schedule, '2026-10-20'), 3);
  assert.equal(dayNumber(schedule, '2026-10-17'), 0);
  assert.equal(dayNumber(schedule, '2027-10-18'), 366);
  assert.equal(mealIdForDay(schedule, 1), 3);
  assert.equal(mealIdForDay(schedule, 3), 22);
  assert.equal(mealIdForDay(schedule, 0), null);
});

test('appending dishes never changes earlier days', () => {
  const grown = {...schedule, days: [...schedule.days, 7, 9]};
  for (let d = 1; d <= schedule.days.length; d++) assert.equal(mealIdForDay(grown, d), mealIdForDay(schedule, d));
});

test('everyone gets the same clue order for a date; other dates differ', () => {
  const meal = {id: 3, name: 'Shakshuka', ingredients: ['Egg', 'Tomato', 'Bell pepper', 'Onion', 'Garlic', 'Cumin', 'Paprika']};
  const a = createGame(meal, {rng: dailyClueRng('2026-10-18', 3)}).clues;
  const b = createGame(meal, {rng: dailyClueRng('2026-10-18', 3)}).clues;
  assert.deepEqual(a, b);
  const others = new Set(['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22'].map(d => createGame(meal, {rng: dailyClueRng(d, 3)}).clues.join()));
  assert.ok([...others].some(o => o !== a.join()), 'other dates can shuffle differently');
  const r = seededRng('x'); for (let i = 0; i < 100; i++) { const v = r(); assert.ok(v >= 0 && v < 1); }
});

test('shipped schedule covers every roster meal exactly once', () => {
  const shipped = JSON.parse(readFileSync(new URL('../game/schedule.json', import.meta.url)));
  const roster = JSON.parse(readFileSync(new URL('../reference/meal-lion-45-meals.json', import.meta.url))).meals;
  assert.equal(shipped.timeZone, 'America/New_York');
  assert.match(shipped.startDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual([...shipped.days].sort((a, b) => a - b), roster.map(m => m.id).sort((a, b) => a - b));
  for (let i = 1; i < shipped.days.length; i++) assert.notEqual(shipped.days[i], shipped.days[i - 1]);
});
