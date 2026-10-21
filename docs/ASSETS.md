# Assets and animation handoff

All source artwork and generation prompts are in reference/. Do not overwrite originals during cleanup. See assets/asset-map.json for a consistent map; older batch manifests use different structures. Cell indexes are zero-based row-major, with paths relative to this package root. Ingredient entries marked preferred are the suggested default; the old purple Onion icon is retained as a variant, while the yellow Onion is preferred and Red onion remains its own label.

There are 27/45 meal illustrations, 62/103 canonical ingredient icons and 11 custom sequence groups. Chef neutral/blink/thinking/celebrate poses are separate. An animation group means a draft strip of distinct key poses, not a finished smooth animation. Pancake and grilled-cheese sequences share a 3-by-2 atlas. The other interactions are onion, tomato, egg, milk, cheese, dough, mushroom, rice and garlic. Existing demos add procedural steam, particles and ingredient movement.

Recommended interaction routing: Onion -> onion; Tomato -> tomato; Egg -> egg; Milk -> milk; Cheddar -> cheese; Pizza dough -> dough; Mushroom -> mushroom; Rice or Arborio rice -> rice; Garlic -> garlic. These are integration suggestions; most newer sequences are not wired into the pilot. Use neutral/general reactions for missing interactions until dedicated ones exist. A cheddar-colored animation is not automatically suitable for every cheese.

Production cleanup: align feet, body, counter and tools across poses; normalize scale/palette; inspect transparency and edge halos on light/dark backgrounds; remove stray particles where needed; add inbetween poses or purposeful holds; test seams and atlas gutters. Garlic's lower body differs from other strips. Avoid stretching frame proportions. Record derived crop bounds and anchors. Most sprites remain inside atlases, not individual exported PNGs.

Some atlases are 1774px wide over four columns, so cells are fractional. Compute source rectangles from actual dimensions and grid metadata, then visually inspect boundaries. Do not assume square/power-of-two frames or silently round every cell independently. Blank final cells in seven-meal sheets must not be indexed.

All generated assets are drafts; corner-alpha checks alone do not establish clean transparency. Prompts and generation notes are retained with their batches. There is no separately verified commercial licensing/provenance audit or source design file beyond these supplied assets.

The original batch-04 meals now have all ingredient icons. New individual assets and exact prompts are stored under assets/generated/food-2026-10-19/. Use the complete coverage report before generating duplicates.

## Web copies and loading

assets/web/ holds lossless WebP copies of every image in the asset map, made by `python tools/optimize-images.py` (Pillow, free and offline). Same dimensions and cell grid, so fractional cells are unaffected; the script checks every visible pixel decodes identically and records source hashes in assets/web/manifest.json. tools/build.cjs publishes these copies (and a published asset-map.json pointing at them) instead of the reference/ PNGs; a stale or missing copy falls back to the original with a warning, and tests/build.test.mjs fails until the copies are refreshed. In Chrome, semi-transparent edge pixels can differ from the PNG by at most 1-2/255 per channel due to decoder premultiplication rounding; opaque pixels and alpha are identical. Local development (serving the project root) still uses the PNGs.

game/art.mjs loads images on first use: startup waits for the kitchen, chef poses and the atlases of already-revealed clues; reaction strips load when their ingredient is revealed; finished-meal art and meal-specific cooking strips are only requested by end-of-round drawing, never during play. While an image is pending the existing fallbacks draw (plain backdrop, neutral chef with flying icon, lettered icon) and the app redraws when it arrives.




