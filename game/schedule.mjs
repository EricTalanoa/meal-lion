// Daily schedule: which dish is live for a date, and when the next one starts.
// Days roll over at midnight US Eastern (America/New_York, DST-aware) for everyone.
// The schedule list is append-only, so adding dishes never changes an earlier date's dish.

export const TIME_ZONE = 'America/New_York';
const DAY = 86400000;

const parts = (instant, timeZone = TIME_ZONE) => Object.fromEntries(
  new Intl.DateTimeFormat('en-US', {timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hourCycle: 'h23'})
    .formatToParts(instant).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));

// Calendar date ('YYYY-MM-DD') in Eastern time for an instant.
export function easternDate(instant = new Date()) {
  const {year, month, day} = parts(instant);
  return `${year}-${month}-${day}`;
}

const utcDay = date => { const [y, m, d] = date.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const addDays = (date, n) => new Date(utcDay(date) + n * DAY).toISOString().slice(0, 10);

// Dish number for a date: the start date is Dish #1. Zero or less means "not started yet".
export function dayNumber(schedule, date) {
  return Math.round((utcDay(date) - utcDay(schedule.startDate)) / DAY) + 1;
}

// Meal ID for a dish number. Past the end of the list it cycles (a fallback only; the
// list is expected to keep growing as dishes are added).
export function mealIdForDay(schedule, n) {
  if (n < 1 || !schedule.days.length) return null;
  return schedule.days[(n - 1) % schedule.days.length];
}

// The instant of the next Eastern midnight after `now`.
export function nextReset(now = new Date()) {
  const tomorrow = addDays(easternDate(now), 1);
  // Eastern midnight falls at 04:00 or 05:00 UTC; check each hour to stay DST-proof.
  for (let h = 0; h < 24; h++) {
    const candidate = new Date(utcDay(tomorrow) + h * 3600000);
    if (easternDate(candidate) === tomorrow && easternDate(new Date(candidate - 1)) !== tomorrow) return candidate;
  }
  throw new Error(`No Eastern midnight found for ${tomorrow}`);
}

// Small deterministic PRNG (xmur3 hash -> mulberry32), returns values in [0, 1).
export function seededRng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
  let a = (h ^= h >>> 16) >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// User decision 2026-10-18: every player gets the same clue order for a given daily dish.
export const dailyClueRng = (date, mealId) => seededRng(`meal-lion:daily:${date}:${mealId}`);
