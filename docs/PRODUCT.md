# Product and decision ledger

## Confirmed direction
- 2026-10-18: each meal allows exactly as many guesses as it has ingredients. Before the first attempt, show `Guess 1/7` for a seven-ingredient meal.
- Start with one free ingredient by default; offer a setting to start with zero. Starting-clue changes apply to the next round.
- Offer a setting to hide total ingredient count, showing `Guess 1/X`. Hide unrevealed tile counts and other total-count hints in this mode.
- 2026-10-18 (update): hidden totals are the default; the setting turns totals on. Even with totals hidden, tell the player when every ingredient has been revealed and when they are on their last guess.
- 2026-10-18: ingredient reveal order is randomized every round. In daily mode everyone gets the same order for a given date (seeded shuffle, decided 2026-10-18); endless/preview rounds reshuffle each time.
- 2026-10-18: daily dish changes at midnight US Eastern time (IANA zone America/New_York, so it follows EST/EDT daylight saving) for every player worldwide.
- 2026-10-18: daily Dish #1 launches on the day the app is completed; until then the start date is a placeholder in game/schedule.json. More dishes will be added before launch and over time, so no reuse policy is needed now. The daily schedule is append-only: adding dishes must never change the dish already assigned to an earlier date.
- 2026-10-18: today's daily progress and result are saved in the player's browser on that device (localStorage), so a reload keeps them. Only the current day is kept; practice rounds and settings are not saved. No accounts or cross-device sync.
- 2026-10-19: endless mode uses a shuffled deck — every dish once in random order before any repeat, then reshuffle, never the same dish twice in a row across reshuffles. Today's daily dish is never served in endless. Endless is not saved: each visit starts a fresh shuffle. Endless replaces the three-meal Practice tab (tabs: Daily dish, Endless).
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
The existing work is art, mockups, motion studies and standalone visual prototypes. The playable game lives in game/ (daily + endless). There is no account system or production deployment. reference/meal-lion-demo/pilot.html is a visual demo that exposes answers.

## Proposals that still need decisions
- Difficulty; extra hints by dish family, cuisine, cooking method or other categories. The taxonomy-inspired idea is exploratory, not implemented.
- Final name; whether the chef is called Leo.
- Accepted aliases (typing an exact case/accent-insensitive full name auto-selects; typos only suggest), overlapping dish variants, scoring, streaks, share format and loss behavior.
- Daily archive access (playing past dates).
- Endless difficulty selection; endless stats/streaks.
- Persistence/storage, framework, backend, hosting and analytics.

Use stable numeric meal IDs from the supplied roster. Do not mistake ingredient order in the JSON for an approved reveal sequence. Keep selection of a suggestion separate from submitting a guess. Finished meal images and recipe names must not leak the answer before results.
