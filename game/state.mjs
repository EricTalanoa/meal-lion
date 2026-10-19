// User decision 2026-10-18: clue order is reshuffled every round. `clues` is the reveal order.
export function createGame(meal, {startWithClue = true, rng = Math.random} = {}) {
  return {meal, clues:shuffle(meal.ingredients, rng), budget:meal.ingredients.length, revealed:startWithClue ? 1 : 0, history:[], status:'playing'};
}

function shuffle(items, rng) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function publicProgress(state, hideTotal) {
  const turn = Math.min(state.history.length + 1, state.budget);
  return `Guess ${turn}/${hideTotal ? 'X' : state.budget}`;
}

export function isLastGuess(state) {
  return state.status === 'playing' && state.history.length === state.budget - 1;
}

export function allRevealed(state) {
  return state.revealed >= state.meal.ingredients.length;
}

export function submitGuess(state, mealId, roster) {
  if (state.status !== 'playing') return {state, error:'This round is finished.'};
  const guess = roster.find(meal => meal.id === mealId);
  if (!guess) return {state, error:'Choose a dish from the suggestions first.'};
  if (state.history.some(item => item.id === mealId)) return {state, error:'You already tried that dish. Choose another.'};
  return advance(state, {id:guess.id, name:guess.name, type:'guess'}, mealId === state.meal.id);
}

export function skipClue(state) {
  if (state.status !== 'playing') return {state, error:'This round is finished.'};
  if (state.history.length >= state.budget - 1) return {state, error:'Use your last attempt to guess the dish.'};
  if (state.revealed >= state.meal.ingredients.length) return {state, error:'All ingredients are already revealed.'};
  return advance(state, {type:'skip', name:'Skipped for a clue'}, false);
}

function advance(state, entry, correct) {
  const history = [...state.history, {...entry, correct}];
  const status = correct ? 'won' : history.length >= state.budget ? 'lost' : 'playing';
  return {state:{...state, history, status, revealed: status === 'playing' ? Math.min(state.revealed + 1, state.budget) : state.budget}, error:null};
}
