# Product and decision ledger

## Confirmed direction
- Working title: Meal-lion, a meal/dinner wordplay. Name is not final.
- Guess the meal from ingredients revealed one by one.
- Daily: one shared different meal per day. Endless mode also wanted.
- 45-meal initial roster, each with 3–10 main ingredients. Supplied roster currently spans 3–9. Recipes are gameplay representations, not exhaustive cooking recipes.
- Pixel kitchen direction approved, inspired by Krillion. Existing lion chef style approved.
- Desktop B split layout explicitly selected. Mobile keyboard-aware mockup subsequently approved.
- Ingredient-specific lion interactions are a priority: onion slicing and crying is the defining example.

## Current status
The existing work is art, mockups, motion studies and standalone visual prototypes. There is no complete guessing game, daily scheduler, endless mode, persistence, account system or production deployment. The three-meal pilot exposes answers for visual review.

## Proposals that still need decisions
- Six guesses versus another limit; how reveals consume attempts; whether a first clue is free; skip policy; what happens when a 3-ingredient meal runs out of clues or a 9-ingredient meal exceeds guesses.
- Clue ordering and difficulty; extra hints by dish family, cuisine, cooking method or other categories. The taxonomy-inspired idea is exploratory, not implemented.
- Final name; whether the chef is called Leo.
- Accepted aliases, spelling tolerance, overlapping dish variants, scoring, streaks, share format and loss behavior.
- Daily reset timezone, start date, schedule, archive access and plan for reuse after the initial 45 meals.
- Endless selection rules, repeat avoidance, daily-answer exclusion and whether difficulty can be selected.
- Persistence/storage, framework, backend, hosting and analytics.

Use stable numeric meal IDs from the supplied roster. Do not mistake ingredient order in the JSON for an approved reveal sequence. Keep selection of a suggestion separate from submitting a guess. Finished meal images and recipe names must not leak the answer before results.
