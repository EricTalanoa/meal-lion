# Three-meal visual pilot

Open pilot.html in a browser with the assets directory beside it. This standalone preview needs no installation. Select Shakshuka, Pancakes or Grilled cheese, reveal ingredients, replay reactions, then serve the meal. The names are intentionally visible: this is an asset review, not a guessing challenge.

Shakshuka: tomato, onion, bell pepper, garlic, cumin, paprika, egg.
Pancakes: flour, milk, egg, butter.
Grilled cheese: bread, butter, cheddar.

New assets: pilot-meals.png (three finished dishes in one row), pantry.png (flour, milk, butter / bread, cheddar, garlic), leo-pilot-cooking.png (mix, flip, serve pancakes / assemble, toast, pull grilled cheese). Existing onion, tomato and egg reaction sheets are reused. Other shakshuka ingredients use the neutral chef plus ingredient movement, not custom cooking poses.

Serving is available early for convenient art inspection. It reveals the entire list and the finished meal; reset clears it. No daily scheduling, scoring, saved progress or endless game is implemented here.

The animations are draft key-pose sequences and simple movement. Generated pose alignment and pixel scale still need cleanup before production. The new atlas originals remain untouched. See assets/pilot-prompts.txt for the prompts.

Validation: JavaScript syntax passed. Direct logic checks passed for all three ingredient lists, exhausted reveals, replay, serve, switch, reset and pause/resume. New PNG sizes and transparent corner pixels confirmed. Generated artwork was visually inspected. Live browser rendering of this pilot was not verified because the browser blocked local-file navigation; no visual-browser pass is claimed.
