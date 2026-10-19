import {createGame, submitGuess, skipClue, publicProgress, isLastGuess, allRevealed} from './state.mjs';
import {createArt} from './art.mjs';
import {searchDishes, fold} from './search.mjs';
import {easternDate, dayNumber, mealIdForDay, nextReset, dailyClueRng} from './schedule.mjs';
import {dailyRecord, replayDaily, readRecord, writeRecord} from './persist.mjs';
import {newDeck, drawDish} from './endless.mjs';
import {recordDaily, dailyStreakNow, nextEndlessStreak, readStreak, writeStreak} from './streak.mjs';
import {createAudio} from './audio.mjs';

const LOCAL = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
// QA only, local hosts only: ?now=2026-11-01T03:59:50Z runs the clock from that instant.
const nowParam = LOCAL && new URLSearchParams(location.search).get('now');
const offset = nowParam && !isNaN(Date.parse(nowParam)) ? Date.parse(nowParam) - Date.now() : 0;
const now = () => new Date(Date.now() + offset);
// User decision 2026-10-18: today's daily progress is kept in this browser across reloads.
const store = (() => { try { return window.localStorage; } catch { return null; } })();
const MAX_SUGGESTIONS = 8;

const $ = id => document.getElementById(id);
const el = {
  stage: $('stage'), caption: $('caption'), replay: $('replayBtn'), motion: $('motionBtn'),
  clues: $('clues'), clueCount: $('clueCount'), round: $('roundLabel'), progress: $('progress'),
  composer: $('composer'), input: $('guess'), clear: $('clearBtn'), guessBtn: $('guessBtn'),
  matches: $('matchesWrap'), matchesTitle: $('matchesTitle'), list: $('suggestions'), hint: $('hint'), error: $('error'), skip: $('skipBtn'),
  result: $('result'), plate: $('plate'), resultEyebrow: $('resultEyebrow'), resultTitle: $('resultTitle'),
  resultText: $('resultText'), resultIngredients: $('resultIngredients'), resultNext: $('resultNext'),
  countdown: $('countdown'), newDay: $('newDayBtn'), streak: $('streakLabel'), resultStreak: $('resultStreak'), next: $('nextBtn'),
  history: $('history'), allShown: $('allShown'), historyEmpty: $('historyEmpty'), announce: $('announce'),
  settings: $('settings'), help: $('help'), optClue: $('optClue'), optHide: $('optHide'), optMotion: $('optMotion'),
  optSfx: $('optSfx'), optMusic: $('optMusic'), music: $('musicBtn'),
};

// Session-only settings; nothing is persisted in this slice.
// User decision 2026-10-18: totals are hidden by default.
const settings = {startWithClue: true, hideTotal: true, still: matchMedia('(prefers-reduced-motion: reduce)').matches};
const coarse = matchMedia('(pointer: coarse)');
const narrow = matchMedia('(max-width: 760px)');

let roster = [], aliases = {}, art = null, schedule = null, game = null, booting = true;
// Each mode keeps its own game in memory so switching tabs doesn't lose progress.
let mode = 'daily', daily = null;
const games = {daily: null, endless: null};
// Endless is not saved (User decision 2026-10-19): a fresh deck every visit.
let deck = null;
const endless = {played: 0, streak: 0};
let streak = null;
const audio = createAudio();
let selection = null, options = [], active = -1;
let scene = {mood: 'idle', ingredient: null, mealId: null}, sceneStart = 0, clock = 0, last = 0, frame = 0;

const meal = id => roster.find(m => m.id === id);

async function boot() {
  try {
    const [r, map, sched, alias] = await Promise.all(['../reference/meal-lion-45-meals.json', '../assets/asset-map.json', 'schedule.json', 'aliases.json']
      .map(u => fetch(u).then(res => { if (!res.ok) throw new Error(u); return res.json(); })));
    roster = r.meals;
    schedule = sched;
    streak = readStreak(store);
    aliases = alias.aliases;
    art = createArt(map, '../', {onLoad: redrawArt});
    await art.prepare();
    loadDaily();
    deck = newDeck(roster.map(m => m.id));
    setMode(daily.id ? 'daily' : 'endless');
    // Hold canvas drawing until the first screen's images (revealed clue icons, a reaction
    // strip) arrive, so nothing flashes a fallback on a normal load. Drawing once to a scratch
    // canvas requests exactly those files. Later images load on first use.
    const scratch = document.createElement('canvas');
    for (let i = 0; i < game.revealed; i++) art.drawIngredient(scratch, clue(i));
    art.drawStage(scratch, {...scene, elapsed: 0, still: settings.still});
    const missing = await art.settled();
    booting = false;
    render(); kick();
    if (missing.length) console.warn('Missing artwork', missing);
    setInterval(tick, 1000); tick();
    if (missing.length) el.caption.textContent = 'Some artwork failed to load; the game still works.';
    document.body.dataset.ready = 'true';
  } catch (e) {
    el.caption.textContent = 'The game data could not load. Serve the handoff folder (node tools/serve.cjs) and open /game/.';
    console.error(e);
  }
}

function loadDaily() {
  const date = easternDate(now()), n = dayNumber(schedule, date);
  daily = {date, n, id: mealIdForDay(schedule, n)};
  games.daily = null;
  const tab = document.querySelector('[data-mode=daily]');
  tab.disabled = !daily.id;
  tab.title = daily.id ? '' : `The daily dish starts ${schedule.startDate}`;
}

function setMode(next) {
  if (game) games[mode] = game;
  mode = next;
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  if (games[mode]) { game = games[mode]; resetComposer(); resumeScene(); render(); }
  else if (mode === 'daily') {
    const saved = replayDaily(readRecord(store), daily, meal(daily.id), roster);
    if (saved) { game = games.daily = saved; resetComposer(); clearResult(); resumeScene(); render(); }
    else begin(meal(daily.id), {rng: dailyClueRng(daily.date, daily.id)});
  }
  else nextEndless();
}

function nextEndless() {
  const draw = drawDish(deck, daily?.id ?? null, Math.random);
  deck = draw.deck;
  endless.played++;
  begin(meal(draw.id), {});
}

function resumeScene() {
  if (game.status === 'won') setScene('won', null, `Yes! It’s ${game.meal.name}.`);
  else if (game.status === 'lost') setScene('lost', null, `Out of guesses — it was ${game.meal.name}.`);
  else if (game.revealed) setScene('react', clue(game.revealed - 1), `${clue(game.revealed - 1)} revealed!${cues()}`);
  else setScene('idle', null, 'No ingredients yet. Take a guess, or skip for a clue.');
}

function begin(dish, options) {
  game = games[mode] = createGame(dish, {startWithClue: settings.startWithClue, ...options});
  resetComposer();
  clearResult();
  save();
  if (game.revealed) audio.play('reveal');
  resumeScene();
  render();
}

// Don't keep a previous answer in hidden DOM or on the plate canvas.
function clearResult() {
  for (const node of [el.resultEyebrow, el.resultTitle, el.resultText, el.resultIngredients]) node.textContent = '';
  el.plate.getContext('2d').clearRect(0, 0, el.plate.width, el.plate.height);
}

function save() {
  if (mode === 'daily' && game && daily?.id === game.meal.id) writeRecord(store, dailyRecord(game, daily));
}

const clue = i => game.clues[i];
// Spoken/caption cues for the two moments players need to notice even with totals hidden.
const cues = () => (allRevealed(game) ? ' That’s every ingredient.' : '') + (isLastGuess(game) ? ' Last guess!' : '');

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
  el.round.textContent = mode === 'daily' ? `Daily dish #${daily.n}` : `Endless · dish ${endless.played} · streak ${endless.streak}`;
  const last = isLastGuess(game);
  el.progress.textContent = playing ? publicProgress(game, settings.hideTotal) + (last ? ' · Last guess!' : '')
    : game.status === 'won' ? `Solved on guess ${game.history.length}/${game.budget}` : `Out of guesses · ${game.budget}/${game.budget}`;
  el.clueCount.textContent = hide ? `${game.revealed}` : `${game.revealed} / ${game.budget}`;
  el.progress.classList.toggle('last', playing && last);
  el.allShown.hidden = !(playing && allRevealed(game));

  const tiles = [];
  for (let i = 0; i < game.budget; i++) {
    const li = document.createElement('li');
    if (i < game.revealed) {
      const c = document.createElement('canvas');
      c.width = c.height = 96; c.setAttribute('aria-hidden', 'true');
      if (!booting) art.drawIngredient(c, clue(i));
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
  el.streak.textContent = daily?.id ? `Daily streak ${dailyStreakNow(streak, easternDate(now()))}` : '';
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
  // 25 of 45 dishes have no finished-meal art yet; hide the plate rather than show a blank.
  el.plate.hidden = !art.drawMeal(el.plate, game.meal.id);
  el.next.textContent = mode === 'daily' ? 'Play endless' : 'Next dish';
  el.resultStreak.textContent = mode === 'daily'
    ? `Daily streak: ${dailyStreakNow(streak, daily.date)} in a row · best ${streak.best}`
    : `Endless streak: ${endless.streak} in a row`;
  tick();
}

// An image finished loading: redraw anything that may have used a fallback. Coalesced so a
// burst of loads redraws once.
let redrawQueued = false;
function redrawArt() {
  if (booting || !game || redrawQueued) return;
  redrawQueued = true;
  setTimeout(() => { redrawQueued = false; render(); kick(); });
}

// ---------- stage loop ----------
function kick() { if (!frame) { last = 0; frame = requestAnimationFrame(loop); } }
function loop(t) {
  frame = 0;
  if (!art || !game || booting) return;
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
  const results = searchDishes(roster, text, MAX_SUGGESTIONS, aliases);
  el.matchesTitle.textContent = results.length && results.every(r => r.close) ? 'Did you mean…?' : 'Matching dishes';
  return results.map(r => r.meal);
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
  audio.play('select');
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
function apply(result, entryText, kind) {
  if (result.error) { showError(result.error); return false; }
  const before = game.revealed;
  game = result.state;
  if (game.status !== 'playing') {
    const won = game.status === 'won';
    if (mode === 'endless') endless.streak = nextEndlessStreak(endless.streak, won);
    else { streak = recordDaily(streak, daily.date, won); writeStreak(store, streak); }
  }
  save();
  resetComposer();
  if (game.status === 'won') setScene('won', null, `Yes! It’s ${game.meal.name}.`);
  else if (game.status === 'lost') setScene('lost', null, `Out of guesses — it was ${game.meal.name}.`);
  else if (game.revealed > before) { const ing = clue(game.revealed - 1); setScene('react', ing, `${entryText}${ing} revealed!${cues()}`); }
  else setScene('wrong', null, `${entryText}Keep going.${cues()}`);
  audio.play(game.status === 'won' ? 'win' : game.status === 'lost' ? 'lose' : isLastGuess(game) ? 'last' : kind);
  render();
  if (game.status !== 'playing') { leaveTyping(); el.result.focus(); }
  return true;
}

el.composer.addEventListener('submit', e => {
  e.preventDefault();
  if (game.status !== 'playing') return;
  if (!selection) {
    const close = el.input.value.trim() && searchDishes(roster, el.input.value, 1, aliases)[0];
    showError(!el.input.value.trim() ? 'Type a dish name, then pick it from the list.'
      : close?.close ? `Did you mean ${close.meal.name}? Pick it from the list.` : 'Choose a dish from the list first.');
    el.input.focus(); return;
  }
  const name = meal(selection).name;
  if (apply(submitGuess(game, selection, roster), `Not ${name}. `, 'wrong') && game.status === 'playing') {
    // Valid submission: dismiss the native keyboard on touch devices so the kitchen returns.
    if (coarse.matches || narrow.matches) { el.input.blur(); leaveTyping(); } else el.input.focus();
  }
});

el.skip.addEventListener('click', () => apply(skipClue(game), 'Skipped. ', 'skip'));

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

el.next.addEventListener('click', () => mode === 'daily' ? setMode('endless') : nextEndless());
document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { if (b.dataset.mode !== mode) setMode(b.dataset.mode); }));
el.newDay.addEventListener('click', () => { loadDaily(); if (mode === 'daily') { game = null; } setMode('daily'); tick(); });

// ---------- daily countdown ----------
const pad = n => String(n).padStart(2, '0');
function tick() {
  if (!daily || !schedule) return;
  const t = now();
  const rolled = easternDate(t) !== daily.date;
  const left = Math.max(0, nextReset(t) - t);
  const s = Math.floor(left / 1000);
  const text = `Next dish in ${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  // Don't swap a dish out from under someone mid-round; offer the new one instead.
  el.newDay.hidden = !rolled;
  el.countdown.textContent = rolled ? 'A new daily dish is ready' : text;
  el.resultNext.textContent = mode === 'daily' && game && game.status !== 'playing' ? (rolled ? 'A new daily dish is ready.' : text) : '';
}

// ---------- settings / help ----------
$('settingsBtn').addEventListener('click', () => { el.optClue.checked = settings.startWithClue; el.optHide.checked = settings.hideTotal; el.optMotion.checked = settings.still; syncAudio(); el.settings.showModal(); });

// ---------- sound ----------
// Browsers only allow audio after a gesture: unlock on the first tap/click/key, and again
// later in case the system interrupted it (e.g. a phone call on iOS).
for (const type of ['pointerdown', 'keydown']) document.addEventListener(type, () => audio.unlock(), {capture: true});
document.addEventListener('visibilitychange', () => audio.setHidden(document.hidden));
function syncAudio() {
  const {sfx, music} = audio.state();
  el.optSfx.checked = sfx; el.optMusic.checked = music;
  el.music.setAttribute('aria-pressed', String(music));
  el.music.textContent = `♪ Music: ${music ? 'on' : 'off'}`;
}
el.music.addEventListener('click', () => { audio.unlock(); audio.setMusic(!audio.state().music); syncAudio(); });
el.optMusic.addEventListener('change', () => { audio.unlock(); audio.setMusic(el.optMusic.checked); syncAudio(); });
el.optSfx.addEventListener('change', () => { audio.setSfx(el.optSfx.checked); syncAudio(); audio.play('select'); });
syncAudio();
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
