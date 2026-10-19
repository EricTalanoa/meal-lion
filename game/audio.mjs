// Sound effects and background music, synthesized with Web Audio: no audio files to load or license.
// Browsers only allow sound after a user gesture, so nothing is created until unlock() runs from one.
// Defaults (unapproved): effects on, music off. Not saved, like the other settings.

const NOTE = /^([A-G])(#|b)?(-?\d)$/;
const SEMITONE = {C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2};

// 'A4' -> 440 Hz (equal temperament). '-' (a rest) -> null.
export function noteFreq(name) {
  const m = NOTE.exec(name);
  if (!m) return null;
  const n = SEMITONE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) - 4) * 12;
  return 440 * 2 ** (n / 12);
}

const step = (note, at, dur, wave = 'square', vol = 0.5) => ({note, at, dur, wave, vol});
export const SFX = {
  select: [step('E6', 0, 0.04, 'square', 0.25)],
  reveal: [step('C5', 0, 0.07), step('G5', 0.07, 0.12)],
  wrong: [step('E3', 0, 0.12, 'square', 0.4), step('C3', 0.11, 0.2, 'square', 0.4)],
  skip: [step('G4', 0, 0.05, 'triangle'), step('C5', 0.05, 0.05, 'triangle'), step('G5', 0.1, 0.08, 'triangle')],
  last: [step('A5', 0, 0.06, 'square', 0.35), step('A5', 0.12, 0.06, 'square', 0.35)],
  win: [step('C5', 0, 0.09), step('E5', 0.09, 0.09), step('G5', 0.18, 0.09), step('C6', 0.27, 0.4)],
  lose: [step('G4', 0, 0.18, 'triangle', 0.6), step('E4', 0.18, 0.18, 'triangle', 0.6), step('C4', 0.36, 0.45, 'triangle', 0.6)],
};

// A short kitchen loop in C (C - Am - F - G), one entry per eighth note; '-' is a rest.
export const SONG = {
  bpm: 112,
  lead: ['E5', '-', 'G5', 'E5', 'C5', '-', 'D5', 'E5', 'C5', '-', 'A4', '-', 'C5', 'E5', 'D5', 'C5',
    'A4', '-', 'C5', '-', 'F5', 'E5', 'D5', 'C5', 'B4', '-', 'D5', '-', 'G5', '-', 'F5', 'D5'],
  bass: ['C3', '-', 'G3', '-', 'C3', '-', 'G3', '-', 'A2', '-', 'E3', '-', 'A2', '-', 'E3', '-',
    'F2', '-', 'C3', '-', 'F2', '-', 'C3', '-', 'G2', '-', 'D3', '-', 'G2', '-', 'D3', '-'],
};

const LOOKAHEAD = 0.3; // seconds of music scheduled ahead of the clock
const TICK_MS = 100;

export function createAudio({createContext = () => new (window.AudioContext || window.webkitAudioContext)(),
  setInterval: every = globalThis.setInterval, clearInterval: stopEvery = globalThis.clearInterval} = {}) {
  let ctx = null, sfxBus = null, musicBus = null, timer = null;
  let sfxOn = true, musicOn = false, nextTime = 0, index = 0;

  function tone(bus, freq, at, dur, wave, vol) {
    const osc = ctx.createOscillator(), env = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, at);
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(vol, at + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(env).connect(bus);
    osc.start(at);
    osc.stop(at + dur + 0.02);
  }

  function schedule() {
    const eighth = 60 / SONG.bpm / 2;
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      const lead = noteFreq(SONG.lead[index]), bass = noteFreq(SONG.bass[index]);
      if (lead) tone(musicBus, lead, nextTime, eighth * 0.9, 'square', 0.35);
      if (bass) tone(musicBus, bass, nextTime, eighth * 1.8, 'triangle', 0.6);
      nextTime += eighth;
      index = (index + 1) % SONG.lead.length;
    }
  }

  function startMusic() {
    if (!ctx || timer !== null) return;
    nextTime = ctx.currentTime + 0.05;
    schedule();
    timer = every(schedule, TICK_MS);
  }
  function stopMusic() {
    if (timer !== null) stopEvery(timer);
    timer = null;
  }

  return {
    // Call from a click/tap/keypress handler. Safe to call repeatedly.
    unlock() {
      try {
        if (!ctx) {
          ctx = createContext();
          sfxBus = ctx.createGain(); sfxBus.gain.value = 0.18; sfxBus.connect(ctx.destination);
          musicBus = ctx.createGain(); musicBus.gain.value = 0.07; musicBus.connect(ctx.destination);
        }
        if (ctx.state !== 'running') ctx.resume();
        if (musicOn) startMusic();
      } catch { ctx = null; }
    },
    play(name) {
      const steps = SFX[name];
      if (!ctx || !sfxOn || !steps) return;
      const t = ctx.currentTime + 0.01;
      for (const s of steps) tone(sfxBus, noteFreq(s.note), t + s.at, s.dur, s.wave, s.vol);
    },
    setSfx(on) { sfxOn = on; },
    setMusic(on) { musicOn = on; on ? startMusic() : stopMusic(); },
    // Pause everything while the tab is hidden (saves battery, avoids surprise sound).
    setHidden(hidden) { if (!ctx) return; try { hidden ? ctx.suspend() : ctx.resume(); } catch { /* ignore */ } },
    state: () => ({sfx: sfxOn, music: musicOn, unlocked: !!ctx}),
  };
}
