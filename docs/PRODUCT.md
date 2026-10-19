# Product and decision ledger

## Confirmed direction
- 2026-10-18: each meal allows exactly as many guesses as it has ingredients. Before the first attempt, show `Guess 1/7` for a seven-ingredient meal.
- Start with one free ingredient by default; offer a setting to start with zero. Starting-clue changes apply to the next round.
- Offer a setting to hide total ingredient count, showing `Guess 1/X`. Hide unrevealed tile counts and other total-count hints in this mode.
- 2026-10-18 (update): hidden totals are the default; the setting turns totals on. Even with totals hidden, tell the player when every ingredient has been revealed and when they are on their last guess.
- 2026-10-18: ingredient reveal order is randomized every round. In daily mode everyone gets the same order for a given date (seeded shuffle, decided 2026-10-18); endless/preview rounds reshuffle each time.
- 2026-10-18: daily dish changes at midnight US Eastern time (IANA zone America/New_York, so it follows EST/EDT daylight saving) for every player worldwide.
- 2026-10-18: skip policy approved as built — a skip uses one guess and reveals the next ingredient; not allowed on the last guess.
- 2026-10-18: suggestions include close matches for typos (shown as "Did you mean…?" when only close matches exist). The player still picks a dish before guessing.
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
- Difficulty; extra hints by dish family, cuisine, cooking method or other categories. The taxonomy-inspired idea is exploratory, not implemented.
- Final name; whether the chef is called Leo.
- Accepted aliases (typing an exact case/accent-insensitive full name auto-selects; typos only suggest), overlapping dish variants, scoring, streaks, share format and loss behavior.
- Daily start date, schedule, archive access and plan for reuse after the initial 45 meals.
- Endless selection rules, repeat avoidance, daily-answer exclusion and whether difficulty can be selected.
- Persistence/storage, framework, backend, hosting and analytics.

Use stable numeric meal IDs from the supplied roster. Do not mistake ingredient order in the JSON for an approved reveal sequence. Keep selection of a suggestion separate from submitting a guess. Finished meal images and recipe names must not leak the answer before results.
