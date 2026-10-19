// Endless mode dish picker: a shuffled deck. Every dish comes up once before any repeats,
// then the deck reshuffles. Never the same dish twice in a row, and today's daily dish is
// skipped (User decisions 2026-10-19). Decks are plain data; draws return a new deck.

export function newDeck(ids) {
  return {ids: [...ids], order: [], pos: 0, last: null};
}

function shuffle(items, rng) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const find = (order, pos, ok) => { for (let i = pos; i < order.length; i++) if (ok(order[i])) return i; return -1; };

// Returns {id, deck}; id is null only when every dish is excluded.
export function drawDish(deck, exclude, rng) {
  let order = deck.order, pos = deck.pos;
  const fresh = id => id !== exclude && id !== deck.last;
  let at = find(order, pos, fresh);
  if (at < 0) {
    // Deck used up (or only the excluded dish is left): reshuffle everything.
    order = shuffle(deck.ids, rng); pos = 0;
    at = find(order, pos, fresh);
    // A roster this small can't avoid back-to-back repeats.
    if (at < 0) at = find(order, pos, id => id !== exclude);
    if (at < 0) return {id: null, deck};
  }
  order = [...order];
  [order[pos], order[at]] = [order[at], order[pos]];
  const id = order[pos];
  return {id, deck: {ids: deck.ids, order, pos: pos + 1, last: id}};
}
