# Assets and animation handoff

All source artwork and generation prompts are in reference/. Do not overwrite originals during cleanup. See assets/asset-map.json for a consistent map; older batch manifests use different structures. Cell indexes are zero-based row-major, with paths relative to this package root. Ingredient entries marked preferred are the suggested default; the old purple Onion icon is retained as a variant, while the yellow Onion is preferred and Red onion remains its own label.

There are 20/45 meal illustrations, 50/103 canonical ingredient icons and 11 custom sequence groups. Chef neutral/blink/thinking/celebrate poses are separate. An animation group means a draft strip of distinct key poses, not a finished smooth animation. Pancake and grilled-cheese sequences share a 3-by-2 atlas. The other interactions are onion, tomato, egg, milk, cheese, dough, mushroom, rice and garlic. Existing demos add procedural steam, particles and ingredient movement.

Recommended interaction routing: Onion -> onion; Tomato -> tomato; Egg -> egg; Milk -> milk; Cheddar -> cheese; Pizza dough -> dough; Mushroom -> mushroom; Rice or Arborio rice -> rice; Garlic -> garlic. These are integration suggestions; most newer sequences are not wired into the pilot. Use neutral/general reactions for missing interactions until dedicated ones exist. A cheddar-colored animation is not automatically suitable for every cheese.

Production cleanup: align feet, body, counter and tools across poses; normalize scale/palette; inspect transparency and edge halos on light/dark backgrounds; remove stray particles where needed; add inbetween poses or purposeful holds; test seams and atlas gutters. Garlic's lower body differs from other strips. Avoid stretching frame proportions. Record derived crop bounds and anchors. Most sprites remain inside atlases, not individual exported PNGs.

Some atlases are 1774px wide over four columns, so cells are fractional. Compute source rectangles from actual dimensions and grid metadata, then visually inspect boundaries. Do not assume square/power-of-two frames or silently round every cell independently. Blank final cells in seven-meal sheets must not be indexed.

All generated assets are drafts; corner-alpha checks alone do not establish clean transparency. Prompts and generation notes are retained with their batches. There is no separately verified commercial licensing/provenance audit or source design file beyond these supplied assets.

Next icon gap for the newest three meals: Macaroni, Pizza dough, Mozzarella, Basil, Arborio rice, Vegetable stock, Parmesan. Use the complete coverage report before generating duplicates.
