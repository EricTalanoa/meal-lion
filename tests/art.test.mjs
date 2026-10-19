import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createArt} from '../game/art.mjs';

// Minimal browser stand-ins: images "load" when the test says so; canvases record draws.
const requested = [];
let pending = [];
globalThis.Image = class {
  set src(url) { this.url = url; this.naturalWidth = 400; this.naturalHeight = 100; requested.push(url); pending.push(this); }
};
const flush = async (fail = () => false) => {
  const batch = pending; pending = [];
  for (const el of batch) fail(el.url) ? el.onerror() : el.onload();
  await new Promise(r => setTimeout(r));
};
const canvas = () => {
  const draws = [];
  const c = new Proxy({draws}, {get: (t, k) => k in t ? t[k] : k === 'drawImage' ? (img, ...a) => draws.push(img.url) : () => {}, set: () => true});
  return {width: 96, height: 96, getContext: () => c, draws};
};
const map = JSON.parse(readFileSync(new URL('../assets/asset-map.json', import.meta.url)));
const mealFiles = new Set(map.meals.map(m => m.file));
const reset = () => { requested.length = 0; pending = []; };

test('prepare loads only the kitchen and chef', async () => {
  reset();
  const art = createArt(map, '');
  const ready = art.prepare();
  assert.deepEqual(requested.sort(), [map.background.file, map.chef.file].sort());
  await flush();
  assert.deepEqual(await ready, []);
});

test('an ingredient atlas loads on first draw, with the lettered fallback meanwhile', async () => {
  reset();
  const loads = [];
  const art = createArt(map, '', {onLoad: f => loads.push(f)});
  const onion = map.ingredients.find(i => i.label === 'Onion' && i.preferred) || map.ingredients.find(i => i.label === 'Onion');
  const c = canvas();
  assert.equal(art.drawIngredient(c, 'Onion'), false);
  assert.deepEqual(requested, [onion.file]);
  await flush();
  assert.deepEqual(loads, [onion.file]);
  assert.equal(art.drawIngredient(c, 'Onion'), true);
  assert.deepEqual(c.draws, [onion.file]);
  assert.equal(requested.length, 1, 'not fetched twice');
});

test('finished-meal art is never requested while a round is in play', async () => {
  reset();
  const art = createArt(map, '');
  await Promise.all([art.prepare(), flush()]);
  const stage = canvas();
  for (const mealId of [1, 3, 22]) for (const mood of ['idle', 'react', 'wrong']) for (const ingredient of [null, 'Onion', 'Milk', 'Cheddar', 'Egg']) {
    art.drawStage(stage, {ingredient, mood, mealId, elapsed: 1, still: false});
    await flush();
    art.drawStage(stage, {ingredient, mood, mealId, elapsed: 1, still: false});
  }
  assert.deepEqual(requested.filter(f => mealFiles.has(f) || f.includes('pilot-cooking')), []);
  art.drawStage(stage, {ingredient: null, mood: 'lost', mealId: 1, elapsed: 1, still: true});
  assert.ok(requested.includes(map.meals.find(m => m.id === 1).file));
  assert.ok(requested.some(f => f.includes('pilot-cooking')));
});

test('settled waits for every requested image and reports failures', async () => {
  reset();
  const art = createArt(map, '');
  art.drawIngredient(canvas(), 'Onion');
  art.drawIngredient(canvas(), 'Milk');
  const done = art.settled();
  const bad = requested[1];
  await flush(url => url === bad);
  assert.deepEqual(await done, [bad]);
  const c = canvas();
  art.drawIngredient(c, 'Milk');
  assert.equal(requested.length, 2, 'a failed image is not retried every frame');
});
