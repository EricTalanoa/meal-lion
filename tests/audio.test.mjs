import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudio, noteFreq, SFX, SONG} from '../game/audio.mjs';

// Minimal stand-in for Web Audio: records every oscillator started.
function fakeContext() {
  const param = () => ({value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {}});
  const ctx = {
    currentTime: 0, state: 'suspended', destination: {}, started: [],
    resume() { ctx.state = 'running'; return Promise.resolve(); },
    suspend() { ctx.state = 'suspended'; return Promise.resolve(); },
    createGain() { return {gain: param(), connect() { return this; }, disconnect() {}}; },
    createOscillator() {
      const o = {type: 'sine', frequency: param(), connect() { return this; }, start(t) { ctx.started.push({o, t}); }, stop() {}, onended: null};
      return o;
    },
  };
  return ctx;
}
function fakeTimers() {
  const t = {fns: new Map(), id: 0};
  t.setInterval = fn => { t.fns.set(++t.id, fn); return t.id; };
  t.clearInterval = id => t.fns.delete(id);
  t.run = () => [...t.fns.values()].forEach(fn => fn());
  return t;
}
const setup = () => { const ctx = fakeContext(), timers = fakeTimers(); return {ctx, timers, audio: createAudio({createContext: () => ctx, ...timers})}; };

test('note names map to equal-temperament frequencies', () => {
  assert.equal(noteFreq('A4'), 440);
  assert.ok(Math.abs(noteFreq('C4') - 261.63) < 0.01);
  assert.ok(Math.abs(noteFreq('A5') - 880) < 1e-9);
  assert.ok(Math.abs(noteFreq('F#3') - 185.0) < 0.01);
  assert.equal(noteFreq('-'), null);
});

test('every sound effect and song note is playable data', () => {
  for (const name of ['select', 'reveal', 'wrong', 'skip', 'win', 'lose', 'last']) assert.ok(SFX[name]?.length, name);
  for (const steps of Object.values(SFX)) for (const s of steps) { assert.ok(noteFreq(s.note) > 0, s.note); assert.ok(s.dur > 0); }
  assert.ok(SONG.bpm > 0);
  const len = SONG.lead.length;
  assert.ok(len > 0 && SONG.bass.length === len, 'lead and bass line up');
  for (const n of [...SONG.lead, ...SONG.bass]) assert.ok(n === '-' || noteFreq(n) > 0, n);
});

test('nothing plays and no context is made until a user gesture unlocks audio', () => {
  let made = 0;
  const audio = createAudio({createContext: () => { made++; return fakeContext(); }, ...fakeTimers()});
  audio.play('win');
  assert.equal(made, 0);
  audio.unlock();
  assert.equal(made, 1);
  audio.unlock();
  assert.equal(made, 1, 'one context only');
});

test('sound effects play when on and stay silent when off', () => {
  const {ctx, audio} = setup();
  audio.unlock();
  audio.play('win');
  assert.equal(ctx.started.length, SFX.win.length);
  audio.setSfx(false);
  audio.play('win');
  assert.equal(ctx.started.length, SFX.win.length);
  audio.play('no-such-sound');
});

test('music is off by default, schedules notes when on, and stops when off', () => {
  const {ctx, timers, audio} = setup();
  audio.unlock();
  assert.equal(audio.state().music, false);
  timers.run();
  assert.equal(ctx.started.length, 0);
  audio.setMusic(true);
  timers.run();
  const playing = ctx.started.length;
  assert.ok(playing > 0);
  audio.setMusic(false);
  assert.equal(timers.fns.size, 0, 'scheduler cleared');
  timers.run();
  assert.equal(ctx.started.length, playing);
});

test('music waits for the unlock if switched on first, and pauses while the page is hidden', () => {
  const {ctx, timers, audio} = setup();
  audio.setMusic(true);
  timers.run();
  assert.equal(ctx.started.length, 0);
  audio.unlock();
  timers.run();
  assert.ok(ctx.started.length > 0);
  audio.setHidden(true);
  assert.equal(ctx.state, 'suspended');
  audio.setHidden(false);
  assert.equal(ctx.state, 'running');
});

test('a missing Web Audio API never throws', () => {
  const audio = createAudio({createContext: () => { throw new Error('no audio'); }, ...fakeTimers()});
  assert.doesNotThrow(() => { audio.unlock(); audio.play('win'); audio.setMusic(true); audio.setHidden(true); });
});
