import {createGame, submitGuess, skipClue, publicProgress} from './state.mjs';
import {createArt} from './art.mjs';

// Stable roster IDs for the slice: Shakshuka, Pancakes, Grilled cheese.
const ROUNDS = [3, 1, 22];
// Prototype default: clues reveal in roster order. Not an approved reveal sequence.
const MAX_SUGGESTIONS = 8;

const $ = id => document.getElementById(id);
const el = {
  stage: $('stage'), caption: $('caption'), replay: $('replayBtn'), motion: $('motionBtn'),
  clues: $('clues'), clueCount: $('clueCount'), round: $('roundLabel'), progress: $('progress'),
  composer: $('composer'), input: $('guess'), clear: $('clearBtn'), guessBtn: $('guessBtn'),
  matches: $('matchesWrap'), list: $('suggestions'), hint: $('hint'), error: $('error'), skip: $('skipBtn'),
  result: $('result'), plate: $('plate'), resultEyebrow: $('resultEyebrow'), resultTitle: $('resultTitle'),
  resultText: $('resultText'), resultIngredients: $('resultIngredients'), next: $('nextBtn'), again: $('againBtn'),
  history: $('history'), historyEmpty: $('historyEmpty'), announce: $('announce'),
  settings: $('settings'), help: $('help'), optClue: $('optClue'), optHide: $('optHide'), optMotion: $('optMotion'),
};

// Session-only settings; nothing is persisted in this slice.
const settings = {startWithClue: true, hideTotal: false, still: matchMedia('(prefers-reduced-motion: reduce)').matches};
const coarse = matchMedia('(pointer: coarse)');
const narrow = matchMedia('(max-width: 760px)');

let roster = [], art = null, roundIndex = 0, game = null;
let selection = null, options = [], active = -1;
let scene = {mood: 'idle', ingredient: null, mealId: null}, sceneStart = 0, clock = 0, last = 0, frame = 0;

const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const meal = id => roster.find(m => m.id === id);

async function boot() {
  try {
    const [r, map] = await Promise.all(['../reference/meal-lion-45-meals.json', '../assets/asset-map.json']
      .map(u => fetch(u).then(res => { if (!res.ok) throw new Error(u); return res.json(); })));
    roster = r.meals;
    art = createArt(map);
    const missing = await art.prepare();
    if (missing.length) console.warn('Missing artwork', missing);
    startRound(0);
    if (missing.length) el.caption.textContent = 'Some artwork failed to load; the game still works.';
    document.body.dataset.ready = 'true';
  } catch (e) {
    el.caption.textContent = 'The game data could not load. Serve the handoff folder (node tools/serve.cjs) and open /game/.';
    console.error(e);
  }
}

function startRound(index) {
  roundIndex = index;
  game = createGame(meal(ROUNDS[index]), {startWithClue: settings.startWithClue});
  resetComposer();
  // Don't keep the previous answer in hidden DOM or on the plate canvas.
  for (const node of [el.resultEyebrow, el.resultTitle, el.resultText, el.resultIngredients]) node.textContent = '';
  el.plate.getContext('2d').clearRect(0, 0, el.plate.width, el.plate.height);
  if (game.revealed) setScene('react', clue(0), `${clue(0)} revealed!`);
  else setScene('idle', null, 'No ingredients yet. Take a guess, or skip for a clue.');
  render();
}

const clue = i => game.meal.ingredients[i];

function setScene(mood, ingredient, caption) {
  scene = {mood, ingredient, mealId: game.meal.id};
  sceneStart = clock;
  el.caption.textContent = caption;
  say(caption);
  kick();
}

function say(text) { el.announce.textContent = ''; requestAnimationFrame(() => { el.announce.textContent = text; }); }

// ---------- rendering ----------
function render() {
  const playing = game.status === 'playing';
  const hide = settings.hideTotal && playing;
  el.round.textContent = `Meal ${roundIndex + 1} of ${ROUNDS.length}`;
  el.progress.textContent = playing ? publicProgress(game, settings.hideTotal)
    : game.status === 'won' ? `Solved on guess ${game.history.length}/${game.budget}` : `Out of guesses · ${game.budget}/${game.budget}`;
  el.clueCount.textContent = hide ? `${game.revealed}` : `${game.revealed} / ${game.budget}`;

  const tiles = [];
  for (let i = 0; i < game.budget; i++) {
    const li = document.createElement('li');
    if (i < game.revealed) {
      const c = document.createElement('canvas');
      c.width = c.height = 96; c.setAttribute('aria-hidden', 'true');
      art.drawIngredient(c, clue(i));
      const label = document.createElement('span'); label.textContent = clue(i);
      li.className = 'clue'; li.append(c, label);
    } else if (!hide) {
      li.className = 'clue hidden'; li.innerHTML = '<span class="q" aria-hidden="true">?</span><span class="sr">Hidden ingredient</span>';
    } else continue;
    tiles.push(li);
  }
  if (!tiles.length) { const li = document.createElement('li'); li.className = 'none'; li.textContent = 'None revealed yet'; tiles.push(li); }
  el.clues.replaceChildren(...tiles);
  el.clues.parentElement.dataset.count = game.budget > 6 && !hide ? 'long' : '';

  el.history.replaceChildren(...game.history.map((h, i) => {
    const li = document.createElement('li');
    li.className = h.correct ? 'right' : h.type === 'skip' ? 'skip' : 'wrong';
    li.innerHTML = `<span class="n">${i + 1}</span><span class="name"></span><span class="badge">${h.correct ? 'Correct' : h.type === 'skip' ? 'Clue' : 'Not it'}</span>`;
    li.querySelector('.name').textContent = h.name;
    return li;
  }));
  el.historyEmpty.hidden = game.history.length > 0;

  el.input.disabled = el.guessBtn.disabled = !playing;
  el.skip.hidden = !playing;
  el.skip.disabled = playing && game.history.length >= game.budget - 1;
  el.skip.textContent = el.skip.disabled ? 'Last guess — no skipping' : 'Skip for a clue · uses a guess';
  el.composer.hidden = el.hint.hidden = !playing;
  el.result.hidden = playing;
  el.replay.disabled = !scene.ingredient && scene.mood === 'idle';
  el.motion.textContent = settings.still ? 'Play motion' : 'Pause motion';
  el.motion.setAttribute('aria-pressed', String(settings.still));
  if (!playing) renderResult();
}

function renderResult() {
  const won = game.status === 'won';
  el.resultEyebrow.textContent = won ? 'Order up!' : 'Kitchen’s closed';
  el.resultTitle.textContent = game.meal.name;
  el.resultText.textContent = won ? `You got it in ${game.history.length} of ${game.budget} guesses.` : `Out of guesses. It was ${game.meal.name}.`;
  el.resultIngredients.textContent = `Ingredients: ${game.meal.ingredients.join(', ')}`;
  art.drawMeal(el.plate, game.meal.id);
  el.next.textContent = roundIndex === ROUNDS.length - 1 ? 'Play the three again' : 'Next meal';
}

// ---------- stage loop ----------
function kick() { if (!frame) { last = 0; frame = requestAnimationFrame(loop); } }
function loop(t) {
  frame = 0;
  if (!art || !game) return;
  if (last && !settings.still) clock += Math.min((t - last) / 1000, 0.05);
  last = t;
  const elapsed = clock - sceneStart;
  // Idle uses the global clock for steam and blinks; reactions run from their own start.
  art.drawStage(el.stage, {...scene, elapsed: scene.mood === 'idle' ? clock : elapsed, still: settings.still});
  if (scene.mood === 'react' && elapsed > art.reactionLength(scene)) { scene = {...scene, mood: 'idle'}; }
  // Idle steam/blink keeps animating while motion is on; stills draw once.
  if (!settings.still) frame = requestAnimationFrame(loop);
}

// ---------- suggestions ----------
function search(text) {
  const q = fold(text);
  if (!q) return [];
  const scored = [];
  for (const m of roster) {
    const name = fold(m.name);
    const rank = name.startsWith(q) ? 0 : name.split(/[\s-]+/).some(w => w.startsWith(q)) ? 1 : name.includes(q) ? 2 : -1;
    if (rank >= 0) scored.push([rank, m]);
  }
  return scored.sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name)).slice(0, MAX_SUGGESTIONS).map(s => s[1]);
}

function renderSuggestions() {
  const text = el.input.value;
  options = search(text);
  const tried = new Set(game.history.map(h => h.id));
  if (active >= options.length) active = options.length - 1;
  el.list.replaceChildren(...options.map((m, i) => {
    const li = document.createElement('li');
    li.id = `opt-${m.id}`; li.role = 'option'; li.dataset.id = m.id;
    li.setAttribute('aria-selected', String(selection === m.id));
    if (tried.has(m.id)) { li.setAttribute('aria-disabled', 'true'); li.classList.add('tried'); }
    if (i === active) li.classList.add('active');
    li.innerHTML = '<span class="name"></span><span class="mark" aria-hidden="true"></span>';
    li.querySelector('.name').textContent = m.name + (tried.has(m.id) ? ' · tried' : '');
    return li;
  }));
  const open = text.trim() !== '';
  el.matches.hidden = !open;
  el.input.setAttribute('aria-expanded', String(open && options.length > 0));
  if (open && !options.length) el.list.innerHTML = '<li class="nomatch" role="presentation">No dishes match. Try another word.</li>';
  el.input.setAttribute('aria-activedescendant', active >= 0 && options[active] ? `opt-${options[active].id}` : '');
  el.clear.hidden = !text;
  el.hint.textContent = selection ? `Selected: ${meal(selection).name}. Press Guess to submit.` : 'Select a dish, then tap Guess.';
}

function choose(id) {
  if (game.history.some(h => h.id === id)) { showError('You already tried that dish. Choose another.'); return; }
  selection = id;
  el.input.value = meal(id).name;
  active = options.findIndex(m => m.id === id);
  showError('');
  renderSuggestions();
}

function resetComposer() {
  selection = null; active = -1; el.input.value = ''; showError('');
  if (game) renderSuggestions();
}

function showError(text) { el.error.textContent = text; el.input.setAttribute('aria-invalid', String(!!text)); }

// ---------- actions ----------
function apply(result, entryText) {
  if (result.error) { showError(result.error); return false; }
  const before = game.revealed;
  game = result.state;
  resetComposer();
  if (game.status === 'won') setScene('won', null, `Yes! It’s ${game.meal.name}.`);
  else if (game.status === 'lost') setScene('lost', null, `Out of guesses — it was ${game.meal.name}.`);
  else if (game.revealed > before) { const ing = clue(game.revealed - 1); setScene('react', ing, `${entryText}${ing} revealed!`); }
  else setScene('wrong', null, `${entryText}Keep going.`);
  render();
  if (game.status !== 'playing') { leaveTyping(); el.result.focus(); }
  return true;
}

el.composer.addEventListener('submit', e => {
  e.preventDefault();
  if (game.status !== 'playing') return;
  if (!selection) { showError(el.input.value.trim() ? 'Choose a dish from the list first.' : 'Type a dish name, then pick it from the list.'); el.input.focus(); return; }
  const name = meal(selection).name;
  if (apply(submitGuess(game, selection, roster), `Not ${name}. `) && game.status === 'playing') {
    // Valid submission: dismiss the native keyboard on touch devices so the kitchen returns.
    if (coarse.matches || narrow.matches) { el.input.blur(); leaveTyping(); } else el.input.focus();
  }
});

el.skip.addEventListener('click', () => apply(skipClue(game), 'Skipped. '));

el.input.addEventListener('input', () => {
  const exact = roster.find(m => fold(m.name) === fold(el.input.value));
  selection = exact && !game.history.some(h => h.id === exact.id) ? exact.id : null;
  options = search(el.input.value);
  active = selection ? options.findIndex(m => m.id === selection) : options.length ? 0 : -1;
  showError('');
  renderSuggestions();
});

el.input.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    if (!options.length) return;
    e.preventDefault();
    active = (active + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
    renderSuggestions();
    $(`opt-${options[active].id}`)?.scrollIntoView({block: 'nearest'});
  } else if (e.key === 'Enter' && active >= 0 && options[active] && options[active].id !== selection) {
    // Enter on a highlighted suggestion selects it; a second Enter submits.
    e.preventDefault();
    choose(options[active].id);
  } else if (e.key === 'Escape') {
    if (el.input.value) { resetComposer(); } else el.input.blur();
  }
});

// Keep focus (and the keyboard) in the input when tapping a suggestion.
el.list.addEventListener('pointerdown', e => { if (e.target.closest('[role=option]')) e.preventDefault(); });
el.list.addEventListener('click', e => {
  const li = e.target.closest('[role=option]');
  if (li) choose(Number(li.dataset.id));
});
el.clear.addEventListener('click', () => { resetComposer(); el.input.focus(); });

el.replay.addEventListener('click', () => {
  // Replay never touches game state.
  const mood = game.status === 'playing' ? (scene.ingredient ? 'react' : scene.mood) : scene.mood;
  scene = {...scene, mood}; sceneStart = clock; kick();
});
function setStill(still) { settings.still = still; el.optMotion.checked = still; render(); kick(); }
el.motion.addEventListener('click', () => setStill(!settings.still));

el.next.addEventListener('click', () => startRound((roundIndex + 1) % ROUNDS.length));
el.again.addEventListener('click', () => startRound(roundIndex));
$('restartBtn').addEventListener('click', () => startRound(0));

// ---------- settings / help ----------
$('settingsBtn').addEventListener('click', () => { el.optClue.checked = settings.startWithClue; el.optHide.checked = settings.hideTotal; el.optMotion.checked = settings.still; el.settings.showModal(); });
$('helpBtn').addEventListener('click', () => el.help.showModal());
el.optClue.addEventListener('change', () => { settings.startWithClue = el.optClue.checked; say('Starting clue setting applies from the next round.'); });
el.optHide.addEventListener('change', () => { settings.hideTotal = el.optHide.checked; render(); });
el.optMotion.addEventListener('change', () => setStill(el.optMotion.checked));

// ---------- mobile keyboard handling ----------
// On narrow screens, focusing the input collapses the kitchen into a strip and pins the
// composer to the visual viewport (above the native keyboard). Real-device behaviour untested.
function syncViewport() {
  const vv = window.visualViewport;
  const root = document.documentElement.style;
  root.setProperty('--vvh', `${vv ? vv.height : innerHeight}px`);
  root.setProperty('--vvtop', `${vv ? vv.offsetTop : 0}px`);
}
function enterTyping() { if (narrow.matches) { syncViewport(); document.body.classList.add('typing'); } }
function leaveTyping() { document.body.classList.remove('typing'); }
el.input.addEventListener('focus', enterTyping);
el.input.addEventListener('blur', () => setTimeout(() => {
  if (!el.composer.contains(document.activeElement) && !el.matches.contains(document.activeElement)) leaveTyping();
}, 0));
$('doneBtn').addEventListener('click', () => { el.input.blur(); leaveTyping(); });
window.visualViewport?.addEventListener('resize', syncViewport);
window.visualViewport?.addEventListener('scroll', syncViewport);
narrow.addEventListener('change', () => { if (!narrow.matches) leaveTyping(); });

boot();
