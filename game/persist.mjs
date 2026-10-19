// Saves today's daily game in this browser so a reload keeps progress and results.
// Only the moves are stored; restoring replays them through the game rules with the
// shared daily clue order, so a damaged or edited record can't produce an impossible state.
import {createGame, submitGuess, skipClue} from './state.mjs';
import {dailyClueRng} from './schedule.mjs';

const KEY = 'meal-lion:daily';
const VERSION = 1;

export function dailyRecord(game, daily) {
  return {version: VERSION, date: daily.date, mealId: daily.id, startWithClue: game.startWithClue,
    actions: game.history.map(h => h.type === 'skip' ? 'skip' : h.id)};
}

// Returns the restored game, or null if the record doesn't belong to today's dish or won't replay.
export function replayDaily(record, daily, meal, roster) {
  if (!record || typeof record !== 'object' || record.version !== VERSION) return null;
  if (record.date !== daily.date || record.mealId !== daily.id || meal.id !== daily.id) return null;
  if (typeof record.startWithClue !== 'boolean' || !Array.isArray(record.actions)) return null;
  let game = createGame(meal, {startWithClue: record.startWithClue, rng: dailyClueRng(daily.date, daily.id)});
  for (const action of record.actions) {
    const result = action === 'skip' ? skipClue(game) : Number.isInteger(action) ? submitGuess(game, action, roster) : {error: 'bad action'};
    if (result.error) return null;
    game = result.state;
  }
  return game;
}

// Storage can be missing, full or blocked (private mode, disabled site data): never throw.
export function readRecord(storage) {
  try { const raw = storage?.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function writeRecord(storage, record) {
  try { storage?.setItem(KEY, JSON.stringify(record)); } catch { /* progress just won't survive a reload */ }
}
