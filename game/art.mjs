// Canvas rendering over the normalized atlas map. Paths in the map are relative to the
// handoff root; `base` resolves them from the page. No game rules live here.

// Recommended routing from docs/ASSETS.md. Meal-specific cooking strips (pancakes,
// grilled-cheese) would reveal the answer, so they only play once a round is over.
const ROUTES = {Onion:'onion', Tomato:'tomato', Egg:'egg', Milk:'milk', Cheddar:'cheese', 'Pizza dough':'dough', Mushroom:'mushroom', Rice:'rice', 'Arborio rice':'rice', Garlic:'garlic'};
const SERVE = {1:'pancakes', 22:'grilled-cheese'};
const FRAME = 0.7; // seconds per key pose
const CHEF = {neutral:0, blink:1, thinking:2, celebrate:3};
const W = 1200, H = 400;

// Images load on first use so startup only waits for what the first screen draws. While a
// file is pending, draws fall back (plain backdrop, neutral chef, lettered icon) and
// `onLoad` fires once it arrives so the caller can redraw. Finished-meal art is only
// requested by the end-of-round draws, so it is never fetched while a round is in play.
export function createArt(map, base = '../', {onLoad = () => {}} = {}) {
  const images = new Map();
  const loaded = new Map();
  const icons = new Map();
  for (const item of map.ingredients) if (!icons.has(item.label) || item.preferred) icons.set(item.label, item);
  const anims = new Map(map.animations.map(a => [a.id, a]));

  // Resolves with the image, or null if it failed. Uses load events rather than decode(),
  // which can stall in background tabs.
  function load(file) {
    if (!images.has(file)) {
      images.set(file, new Promise(resolve => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => resolve(null);
        el.src = base + file;
      }).then(el => { loaded.set(file, el); onLoad(file); return el; }));
    }
    return images.get(file);
  }
  const failed = () => [...loaded].filter(([, el]) => !el).map(([f]) => f);

  // Cells may be fractional (e.g. 2172/4); keep float source rects rather than rounding per cell.
  function cell(c, file, cols, rows, index, x, y, w, h) {
    const el = loaded.get(file);
    if (!el) { load(file); return false; }
    const sw = el.naturalWidth / cols, sh = el.naturalHeight / rows;
    c.imageSmoothingEnabled = false;
    c.drawImage(el, (index % cols) * sw, Math.floor(index / cols) * sh, sw, sh, x, y, w, h);
    return true;
  }

  function rect(c, x, y, w, h, color) { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), w, h); }

  function drawIcon(c, label, x, y, size) {
    const item = icons.get(label);
    if (item && cell(c, item.file, item.columns, item.rows, item.index, x, y, size, size)) return true;
    // Fallback for the 53 ingredients without art yet: a lettered plate.
    c.fillStyle = '#16364d'; c.beginPath(); c.arc(x + size / 2, y + size / 2, size * 0.42, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#7ce5df'; c.font = `bold ${Math.round(size * 0.42)}px ui-monospace, monospace`;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label[0].toUpperCase(), x + size / 2, y + size / 2 + 1);
    return false;
  }

  return {
    // Loads the kitchen and chef; resolves with the files that failed.
    async prepare() {
      await Promise.all([load(map.background.file), load(map.chef.file)]);
      return failed();
    },
    // Waits for every image requested so far (including ones requested while waiting).
    async settled() {
      for (let n = -1; n !== images.size;) { n = images.size; await Promise.all(images.values()); }
      return failed();
    },
    hasIcon: label => icons.has(label),

    // scene: {ingredient, mood:'idle'|'react'|'wrong'|'won'|'lost', mealId, elapsed, still}
    drawStage(canvas, scene) {
      const c = canvas.getContext('2d');
      const {ingredient, mood, mealId, elapsed, still} = scene;
      c.clearRect(0, 0, W, H);
      if (!cell(c, map.background.file, 1, 1, 0, 0, 0, W, H)) { rect(c, 0, 0, W, H, '#59d6f2'); }
      const steps = n => still ? n - 1 : Math.min(n - 1, Math.floor(elapsed / FRAME));
      let drawn = false;
      const done = mood === 'won' || mood === 'lost';
      if (mood === 'react' && ROUTES[ingredient]) {
        const a = anims.get(ROUTES[ingredient]);
        drawn = cell(c, a.file, a.columns, a.rows, a.sequence[steps(a.sequence.length)], 472, 172, 162, 216);
      } else if (done && SERVE[mealId]) {
        const a = anims.get(SERVE[mealId]);
        drawn = cell(c, a.file, a.columns, a.rows, a.sequence[steps(a.sequence.length)], 462, 178, 206, 206);
      }
      if (!drawn) {
        const pose = mood === 'won' ? 'celebrate' : mood === 'wrong' || mood === 'lost' ? 'thinking' : !still && elapsed % 4 > 3.8 ? 'blink' : 'neutral';
        cell(c, map.chef.file, map.chef.columns, map.chef.rows, CHEF[pose], 490, 174, 152, 203);
      }
      if (done) {
        const meal = map.meals.find(m => m.id === mealId);
        if (meal) cell(c, meal.file, meal.columns, meal.rows, meal.index, 680, 242, 154, 154);
        if (mood === 'won' && !still && elapsed < 4) for (let i = 0; i < 18; i++) rect(c, 450 + (i * 43 % 370), 165 + ((elapsed * 45 + i * 15) % 180), 4, 6, ['#f97ba7', '#5be6e5', '#ffe3a0'][i % 3]);
        return;
      }
      // Covered pot with steam; reveals nothing about the dish.
      rect(c, 708, 343, 108, 18, '#10293d'); rect(c, 716, 336, 92, 10, '#4d8ba2'); rect(c, 814, 342, 35, 7, '#16364d');
      for (let i = 0; i < 3; i++) {
        const p = still ? 0.4 : (elapsed * 0.35 + i / 3) % 1;
        c.globalAlpha = (1 - p) * 0.5; rect(c, 740 + i * 19 + Math.sin(p * 7) * 5, 330 - p * 55, 5, 9, '#fff9d7');
      }
      c.globalAlpha = 1;
      if (mood === 'react' && ingredient) {
        const p = still ? 0.5 : Math.min(elapsed / 2.8, 1);
        drawIcon(c, ingredient, 660 + p * 85, 270 - Math.sin(p * Math.PI) * 35 + p * 36, 40);
      }
    },
    // Length of a reaction before the stage settles, so callers can stop animating.
    reactionLength(scene) {
      if (scene.mood === 'react' && ROUTES[scene.ingredient]) return anims.get(ROUTES[scene.ingredient]).sequence.length * FRAME + 0.8;
      if (scene.mood === 'won') return 4;
      return 3;
    },
    drawIngredient(canvas, label) {
      const c = canvas.getContext('2d');
      c.clearRect(0, 0, canvas.width, canvas.height);
      return drawIcon(c, label, 0, 0, canvas.width);
    },
    drawMeal(canvas, id) {
      const c = canvas.getContext('2d');
      c.clearRect(0, 0, canvas.width, canvas.height);
      const meal = map.meals.find(m => m.id === id);
      return meal ? cell(c, meal.file, meal.columns, meal.rows, meal.index, 0, 0, canvas.width, canvas.height) : false;
    },
  };
}
