# Meal-lion animated kitchen — motion prototype

Open `index.html` in a browser. No installation or build step is needed. Keep the assets folder beside it. Alternatively run `python -m http.server 8765` in this directory and visit http://localhost:8765.

## Included
- Generated kitchen background and transparent four-pose lion chef sheet.
- Idle breathing, blinking, steam, and gently moving pot lid.
- Ingredient arc into an opening pot and progressive clue cards.
- Thinking pose and head shake for a wrong guess.
- Celebrating pose, bounce, confetti, and pot reveal for victory.
- Reset, motion pause, and reduced-motion preference support.
- Responsive desktop and mobile controls.

This is an exploratory motion prototype, not a working daily game. The reaction buttons simulate events. Shakshuka is the fixed example answer. Ingredient illustrations and the pot are simple canvas artwork; the chef uses four generated key poses rather than a polished frame-by-frame animation. Chef pose silhouettes vary slightly and would benefit from a pixel artist's cleanup before production. The kitchen itself is static scenery; the character, steam, lid, ingredient and confetti are independent live layers.

## Files and continuation
- `assets/kitchen.png`: scenery generated from the approved pixel kitchen concept.
- `assets/chef-poses.png`: four equal-width cells, neutral / blink / thinking / celebration. Original dimensions and transparency preserved.
- `app.js`: event state, timing, canvas drawing and ingredient cards.
- `style.css`: responsive layout and actual HTML title/controls.
- `generation-prompts.txt`: exact asset prompts; generated with the built-in image-generation tool.
- Approved visual concept: `../meal-lion-pixel-kitchen.png`.

Validation: JavaScript syntax checked; both images loaded in browser; top-left sprite alpha confirmed 0; ingredient reveal increments count; wrong and correct reaction states verified; reset returns to one clue; pause/resume works; 390px mobile viewport has no horizontal overflow and 56px reaction buttons. Desktop and mobile screenshots visually inspected.

Next production pass: refine sprite alignment and intermediate frames, create distinct ingredient artwork and final-dish reveals, add subtle ambient kitchen layers, then connect events to the actual guessing game.
