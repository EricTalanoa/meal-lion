// "Correct in a row" streaks (User decision 2026-10-19), counted separately per mode.
// Daily: consecutive days the daily dish was solved, saved on this device; a loss or a
// missed day resets it. Endless: consecutive solves this visit, not saved.
import {addDays} from './schedule.mjs';

const KEY = 'meal-lion:streak';
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const emptyStreak = () => ({count: 0, best: 0, lastWon: null, lastResult: null});

// Record a finished daily dish. Each date counts once, so reloads can't double-count.
export function recordDaily(streak, date, won) {
  if (streak.lastResult === date) return streak;
  const count = !won ? 0 : streak.lastWon === addDays(date, -1) ? streak.count + 1 : 1;
  return {count, best: Math.max(streak.best, count), lastWon: won ? date : streak.lastWon, lastResult: date};
}

// The streak to show today: still alive if the last win was today or yesterday.
export function dailyStreakNow(streak, today) {
  return streak.lastWon === today || streak.lastWon === addDays(today, -1) ? streak.count : 0;
}

export const nextEndlessStreak = (count, won) => won ? count + 1 : 0;

const valid = s => s && typeof s === 'object' && !Array.isArray(s)
  && Number.isInteger(s.count) && s.count >= 0 && Number.isInteger(s.best) && s.best >= s.count
  && (s.lastWon === null || DATE.test(s.lastWon)) && (s.lastResult === null || DATE.test(s.lastResult));

export function readStreak(storage) {
  try {
    const s = JSON.parse(storage?.getItem(KEY) ?? 'null');
    return valid(s) ? {count: s.count, best: s.best, lastWon: s.lastWon, lastResult: s.lastResult} : emptyStreak();
  } catch { return emptyStreak(); }
}

export function writeStreak(storage, streak) {
  try { storage?.setItem(KEY, JSON.stringify(streak)); } catch { /* streak just won't be remembered */ }
}
