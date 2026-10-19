// Dish search over the full roster. Never looks at the hidden answer or revealed clues.
// Real matches (prefix / word prefix / substring) rank first; typo-tolerant "close" matches follow.

export const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const words = s => s.split(/[\s-]+/).filter(Boolean);

// Allowed edits per typed word: short words must be typed correctly.
const allowance = len => len <= 3 ? 0 : len <= 5 ? 1 : 2;

// Optimal string alignment distance (Levenshtein plus adjacent transpositions).
function distance(a, b) {
  const rows = Array.from({length: a.length + 1}, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) rows[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
    rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
  }
  return rows[a.length][b.length];
}

// Distance from a typed word to the start of a dish word, so half-typed words still match.
function prefixDistance(typed, word) {
  let best = Infinity;
  for (let len = Math.max(1, typed.length - 1); len <= Math.min(word.length, typed.length + 1); len++) best = Math.min(best, distance(typed, word.slice(0, len)));
  return best;
}

// Every typed word must closely match a different word of the dish name.
function closeness(query, name) {
  const dishWords = words(name), used = new Set();
  let total = 0;
  for (const typed of words(query)) {
    let best = Infinity, at = -1;
    dishWords.forEach((w, i) => { if (used.has(i)) return; const d = prefixDistance(typed, w); if (d < best) { best = d; at = i; } });
    if (best > allowance(typed.length)) return -1;
    used.add(at); total += best;
  }
  return total;
}

export function searchDishes(roster, text, limit = 8) {
  const q = fold(text);
  if (!q) return [];
  const scored = [];
  for (const meal of roster) {
    const name = fold(meal.name);
    const rank = name.startsWith(q) ? 0 : words(name).some(w => w.startsWith(q)) ? 1 : name.includes(q) ? 2 : -1;
    if (rank >= 0) { scored.push({meal, close: false, score: rank}); continue; }
    const d = q.length >= 4 ? closeness(q, name) : -1;
    if (d > 0) scored.push({meal, close: true, score: 10 + d});
  }
  return scored.sort((a, b) => a.score - b.score || a.meal.name.localeCompare(b.meal.name)).slice(0, limit);
}
