# Meal-lion — shared work log

Every AI must read this file before working and update it throughout the session. Follow docs/GIT_AND_CONTINUITY.md. Keep this summary current and append dated entries below.

## Current state

- Current milestone: game/ is playable with Daily dish (US Eastern midnight, shared clue order, saved on device) and Endless (shuffled deck, excludes today's daily, not saved). Browser-verified in emulation; real-device keyboards untested.
- Product: daily meal guessing plus endless mode. Approved desktop B split layout and mobile native-keyboard-aware layout.
- Available: 45-meal roster, 23 meal illustrations, 57 of 103 canonical ingredient icons, 11 draft custom animation groups, mockups, prompts, visual prototypes and normalized asset map.
- Implemented: responsive game, daily/endless, daily persistence, alias suggestions, streaks, sound and lazy-loaded art. Not implemented: deployment; final product decisions remain open. reference/meal-lion-demo/pilot.html remains a visual demo that exposes answers.
- Repository/branch/checkpoint: codex/missing-food-art; latest existing checkpoint 91d45d0. Remote: origin = https://github.com/EricTalanoa/meal-lion (private); main, feat/three-meal-game and codex/missing-food-art pushed 2026-10-19.
- Confirmed rules: ingredient-count guess budget, one free clue (zero optional), hidden total by default (showing totals is optional), with explicit 'all ingredients revealed' and 'last guess' cues; reveal order shuffled every round; skip policy approved; typo-tolerant suggestions. Open decisions: aliases, timezone/schedule, scoring and storage. See docs/PRODUCT.md.
- Images: startup now downloads ~2.4 MB (kitchen, chef, first clue atlas) instead of 32.9 MB; the rest loads on first use; published images are lossless WebP copies in assets/web/ (21.4 MB total). See the 2026-10-19 image-load entry.
- Next: user playtesting; deploy to Netlify only on the user's go-ahead (setup ready); set schedule startDate at launch; add dishes + art; real iOS/Android keyboard QA; open: share format, analytics.

### 2026-10-18 America/Los_Angeles — Codex — Approved rules / implementation start
- Branch: feat/three-meal-game; latest checkpoint 8f5e6e4. Working tree was clean before this task.
- User replaced proposed six-guess limit with one guess per ingredient and requested zero-start and hidden-total settings. Recorded in docs/PRODUCT.md.
- Implementing the previously described three-meal scope using plain browser modules and native controls. Source assets stay unchanged; app lives in game/.
- Ruling: hide empty clue slots in hidden-total mode; starting clues apply next round; settings are session-only in this slice. Skip costs an attempt but cannot spend the last attempt. These implementation defaults remain reviewable.
- Checkpoints: deterministic state and tests, then responsive app and browser verification. Daily/endless scheduling and persistence remain later milestones.

## Session history

### 2026-10-18 — Codex — Initial handoff

- Consolidated original sources under reference/ without altering them; added product, design, implementation, asset and QA guidance, Codex/Claude instructions, kickoff prompt, gallery index and portable review tools.
- Corrected authority in the new guidance: mobile keyboard-aware design is approved despite older notes saying otherwise.
- Original package verification: 77 ZIP entries matched source hashes; JSON, local HTML links, asset references/grid bounds and 45-meal ingredient bounds passed. Seven scripts passed syntax checks. These are package checks, not new browser/device gameplay tests.

### 2026-10-18 — Codex — Git and continuous handoff requirements

- User requested Git setup/use instructions and an always-current shared file so each next AI knows what was done, where the project stands and what comes next.
- Added docs/GIT_AND_CONTINUITY.md, .gitignore and this WORK_LOG.md. Updated AGENTS.md, CLAUDE.md, START_HERE.md and KICKOFF_PROMPT.md to require the workflow. README.md points to the new guides.
- Required cadence: start of session, every meaningful change/check/decision/blocker, and before handoff/final response. Commit the log alongside the work at coherent checkpoints.
- No game code, reference art, Git repository or remote changed. Actual repository initialization belongs in the receiving project directory after inspecting its existing Git context.
- Verification: seven scripts passed syntax checks; refreshed package verification passed 79 inventoried file hashes, JSON parsing, local HTML links, asset references/grid bounds and 45-meal ingredient bounds. These checks validate packaging, not gameplay. The delivery archive is rebuilt from this updated folder and separately checked against its files before delivery.
- Next steps: receiving agent reads this log, inspects Git state, follows setup instructions, and records its first task/checkpoint before implementation. No native mobile keyboard or production gameplay validation has been performed for this change.

### 2026-10-18 — America/Los_Angeles — Codex — Development kickoff

- Active task: establish a verified Git baseline, then prepare the responsive Shakshuka/Pancakes/Grilled cheese slice using the approved layouts.
- Reconciled files with the handoff: no existing repository or production game found. Read continuity, product, implementation, design and asset guidance.
- Initialized local main branch; reused existing Git identity without changing configuration. No remote or deployment.
- Checks: original package verifier passed before this log edit (79 file hashes, JSON, local links, asset references/grid bounds, roster bounds). Node v24.14.1 and Git 2.42.0 available. These are package checks, not gameplay or device validation.
- Proposed rules awaiting user response: six guesses, first ingredient free, wrong guesses reveal another ingredient, manual reveal costs one guess. These are not approved product decisions.
- Next: commit baseline, inspect approved mockups and asset data, settle first-slice rules and write the implementation scope. No product code changed.


### 2026-10-18 20:41 America/Los_Angeles — Codex — Baseline checkpoint verified

- Branch: main. Latest existing checkpoint: 25962a4 (Add Meal-lion design and asset handoff). Git status was clean after commit; no remote.
- Inspected both approved desktop B and mobile keyboard-state images. Preserve the split kitchen/guess panel and collapse the mobile stage while typing.
- Proposed implementation: modular browser JavaScript with native HTML controls, no backend; full-roster suggestions, three playable meals, hidden answer art until result, guess history, replay/reset, reduced motion and keyboard-aware layout. Daily scheduling and endless mode follow this slice.
- Awaiting response to the proposed attempt/reveal rules. No product implementation or browser/device validation has occurred.
- Initial staging hit sandbox permissions; authorized escalated Git staging and commit succeeded. No unresolved Git blocker.
- Original inventory remains unchanged; WORK_LOG.md hash now intentionally differs because development has begun.


- State checkpoint: wrote tests first and observed the missing-module failure; implemented immutable transitions in game/state.mjs. All 18 tests passed, including 3/4/7/9 budgets with both starting-clue settings, final-turn wins/losses, invalid/duplicate input, and skip limits. UI and device behavior not yet tested.

### 2026-10-18 America/Los_Angeles — Claude — Resume: Task 2 playable interface
- Branch: feat/three-meal-game; latest checkpoint 31cf46c (state + tests). Working tree clean at start; reconciled log with files (game/state.mjs, tests/game.test.mjs present; 18/18 tests pass on rerun).
- Active task: Task 2 of docs/superpowers/plans/2026-10-18-three-meal-game.md — game/index.html, style.css, app.mjs, art.mjs; then browser verification and commit.
- Built game/index.html, game/style.css, game/app.mjs, game/art.mjs on top of the existing game/state.mjs (unchanged). Desktop B split layout; phone layout with a sticky bottom composer; on input focus at <=760px the app pins to the visual viewport (--vvh/--vvtop from visualViewport), the kitchen collapses to a strip, history/skip hide, suggestions scroll, composer sits last. Valid submit on touch/narrow blurs the input and restores the kitchen.
- Art: kitchen + chef poses + routed ingredient strips (onion/tomato/egg/milk/cheddar->cheese/garlic etc. per docs/ASSETS.md); neutral chef with flying icon otherwise. Meal-specific pancake/grilled-cheese strips and finished-meal art play only after the round ends to avoid leaking answers. Lettered fallback for ingredients without icons.
- Prototype defaults (labelled in UI footer and docs/PRODUCT.md): clues reveal in roster order; exact case/accent-insensitive full-name typing auto-selects, otherwise a suggestion must be picked; Enter on a highlighted suggestion selects, a second Enter submits; tried dishes show "tried" and can't be reselected; settings are in-memory only (lost on reload); "Daily" and "Endless" tabs are shown disabled as "soon". No category match badges (unapproved idea in mockup).
- tools/serve.cjs: added .mjs MIME type and a PORT env override (port 8766 was occupied on this machine by an unrelated Python http.server, which was left running). Added .claude/launch.json (port 8777) for the desktop preview. README run instructions and root index.html link updated.
- Checks run: node --test tests/game.test.mjs 18/18 pass; node --check on all game modules and serve.cjs. In the built-in browser (Chromium): wrong guess via click; empty/unselected submit shows error without consuming; duplicate (typed exact + Enter) rejected without consuming; non-roster text cannot submit; keyboard ArrowDown/Enter select then Enter submit; skip reveals and consumes; skip disabled on last attempt; win on 4/7; Pancakes with zero-start + hidden total shows Guess 1/X, count "0", no placeholder tiles, then a full 4/4 loss; next/again/restart and wrap after round 3; answer names absent from DOM during play for all three rounds (stale result text cleared on new round); 375x812 emulation browsing + typing states, tap-select keeps focus, submit exits typing; simulated 430px visual viewport keeps composer visible; 1366x800 no horizontal overflow; pause/play motion toggles aria-pressed; no console errors. tools/verify.cjs: only expected integrity mismatches for docs/PRODUCT.md, tools/serve.cjs, WORK_LOG.md (development edits).
- Not tested: real iOS/Android native keyboards, rotation/landscape, safe-area insets on notched devices, screen readers (only DOM/ARIA attributes inspected), Firefox/Safari engines, slow networks/missing-asset fallback, long 9-10 ingredient meals in the UI (state tests cover budgets 3/4/7/9).
- Next steps: user plays the slice and reviews defaults; device keyboard QA; then daily mode (decide timezone/start date) and endless mode per docs/IMPLEMENTATION.md.

### 2026-10-18 America/Los_Angeles — Claude — Hidden totals by default + cues
- Branch: feat/three-meal-game; previous checkpoint bacad84.
- User decision: don't show total ingredients/guesses by default, but tell the player when all ingredients are shown and when it's the last guess. Recorded in docs/PRODUCT.md.
- game/state.mjs: added isLastGuess(state) and allRevealed(state) (test written first, observed failing, then passing). game/app.mjs: settings.hideTotal defaults to true; progress shows "Guess n/X · Last guess!" (pink tag); "All ingredients revealed" banner under clues; caption/live announcement appends "That's every ingredient." / "Last guess!". Settings and How to play copy updated.
- Checks: node --test 19/19 pass. Browser: Shakshuka fresh load shows Guess 1/X, no placeholder tiles, setting checked; cues absent on guesses 1-6, both appear on guess 7 (free-clue start). Zero-start case (last guess without all revealed) covered by unit test only. Real devices still untested.
- Next: user continues playtesting the remaining defaults.

### 2026-10-18 America/Los_Angeles — Claude — Shuffled clues + typo suggestions
- Branch: feat/three-meal-game; previous checkpoint d1a8328.
- User decisions: randomize ingredient reveal order every time; skip policy approved as is; add close suggestions for typos. Recorded in docs/PRODUCT.md (removed them from open proposals). New open question for daily mode: shared date-seeded shuffle vs personal shuffle.
- game/state.mjs: createGame(meal, {startWithClue, rng}) now stores a Fisher-Yates shuffled `clues` order (meal data not mutated); app reveals from game.clues. Result screen still lists ingredients in roster order.
- game/search.mjs (new): searchDishes(roster, text, limit) — prefix/word-prefix/substring matches first, then typo "close" matches (each typed word must match a distinct dish word prefix within an edit budget of 0/1/2 for <=3/4-5/6+ letters, optimal-string-alignment distance so swaps count as one edit; only for queries of 4+ chars). app.mjs uses it; heading switches to "Did you mean…?" when all results are close. Footer text no longer says skip/clue order are unapproved.
- Checks: tests written first; node --test tests/game.test.mjs tests/search.test.mjs 25/25 pass (one initial failure was a wrong test: "zz" is a real substring of "pizza"). Browser: 8 restarts gave varied first clues; full 7-clue order differed from roster order; "shaksuka" showed "Did you mean…? Shakshuka", click-select + Guess won; no console errors. Real devices still untested.
- Next: user playtesting; then daily mode (timezone, start date, shuffle sharing) and endless mode.

### 2026-10-18 America/Los_Angeles — Claude — Daily shuffle decision
- Branch: feat/three-meal-game; previous checkpoint 82fea86. Docs-only change.
- User decision: everyone gets the same ingredient order for a given daily dish. Recorded in docs/PRODUCT.md. Implementation note for daily mode: pass a deterministic rng seeded from the schedule date + meal ID (and content version) to createGame's existing `rng` option; preview/endless keep Math.random.
- Daily mode still needs: reset timezone, start date, schedule/reuse policy.

### 2026-10-18 America/Los_Angeles — Claude — Daily reset timezone decision
- Branch: feat/three-meal-game; previous checkpoint 96337bd. Docs-only change.
- User decision: daily dish resets at midnight US Eastern (America/New_York, DST-aware) for all players. Recorded in docs/PRODUCT.md.
- Still needed before building daily mode: start date (Dish #1) and what happens after the 45 meals run out.

### 2026-10-18/19 America/Los_Angeles — Claude — Daily mode
- Branch: feat/three-meal-game; previous checkpoint f2fa04c.
- User decisions: Dish #1 = the day the app is completed (placeholder start date until then); more dishes will be added before launch and over time, so no reuse policy now. Recorded in docs/PRODUCT.md with the append-only schedule rule.
- game/schedule.mjs (new): easternDate, dayNumber, mealIdForDay (cycles past the end as a fallback only), nextReset (DST-proof search for the next Eastern midnight), seededRng (xmur3+mulberry32), dailyClueRng(date, mealId). game/schedule.json (new): version 1, America/New_York, startDate 2026-10-18 flagged startDateIsPlaceholder, 45 roster IDs in a fixed seeded order (no back-to-back repeats).
- game/app.mjs/index.html/style.css: Daily dish / Practice · 3 tabs (Endless still "soon"); each mode keeps its own in-memory game; "Daily dish #N"; same clue order for everyone via dailyClueRng; footer countdown to next Eastern midnight; on rollover a "New dish ready — play it" button appears (never swaps mid-round); daily result hides replay, shows countdown and "Practice meals"; before the start date the Daily tab is disabled and Practice loads; plate hidden for dishes without meal art. Localhost-only ?now= clock override for QA.
- Checks: tests written first (missing-module failure observed); node --test tests/*.test.mjs 32/32 pass incl. EDT/EST midnight boundaries, fall-back/spring-forward days, append-only stability, shipped schedule covers roster once. Browser: real clock (00:09 ET Oct 19) showed Dish #2 (Falafel pita, lettered icon fallback); reload reproduced the same clue order (PITA, CHICKPEAS, PARSLEY); tab switching preserved both games; daily win result correct; ?now 03:59:56Z rolled #2 -> "new dish ready" -> #3; EST ?now 04:59:58Z rolled over; ?now before start disabled Daily and opened Practice; 375px no overflow; no console errors.
- Known limits: no persistence, so reloading lets a player replay today's dish; schedule.json exposes future dishes to anyone reading client files (expected for client-only, see docs/IMPLEMENTATION.md); 25/45 dishes lack meal art and many lack ingredient icons (fallbacks shown); real devices untested.

### 2026-10-19 America/Los_Angeles — Claude — Save daily progress on device
- Branch: feat/three-meal-game; previous checkpoint 71086f4.
- User decision: save daily progress in the browser on this device so a reload keeps today's result. Recorded in docs/PRODUCT.md.
- game/persist.mjs (new): stores {version, date, mealId, startWithClue, actions} under localStorage key meal-lion:daily; restore replays the actions through state.mjs with the shared daily clue order and discards the record if it is for another date/dish, malformed, or any move is invalid. Storage read/write never throws (private mode/blocked storage just means no saving). game/state.mjs: game now records its startWithClue (so a mid-day setting change doesn't alter today's restored game). app.mjs saves on daily start and after every guess/skip; practice and settings are not saved.
- Checks: tests first (missing-module failure observed); node --test tests/*.test.mjs 37/37 pass. Browser: mid-game reload restored guess count, clue order and history; won game reload went straight to the result with countdown; ?now next day started fresh Dish #3 and replaced the record; tampered record (invalid ID) discarded and a fresh game saved; no console errors. Cleared the QA record from the preview browser afterwards.
- Not tested: Safari private mode / storage-disabled browsers in practice (covered only by a throwing-storage unit test); real devices.

### 2026-10-19 America/Los_Angeles — Claude — Endless mode
- Branch: feat/three-meal-game; previous checkpoint 670e4ef.
- User decisions (asked first): shuffled deck (each dish once before repeats, no back-to-back across reshuffles); exclude today's daily dish; endless starts fresh each visit (not saved); endless replaces the Practice · 3 tab. Recorded in docs/PRODUCT.md.
- game/endless.mjs (new): newDeck(ids), drawDish(deck, exclude, rng) — immutable deck; skips the excluded daily dish at draw time (so a mid-session daily rollover is respected); reshuffles when only excluded/none remain; small-roster fallbacks. app.mjs: tabs are Daily dish / Endless; "Endless · dish N · X solved" (session only); results offer "Next dish" (endless) or "Play endless" (daily); before the start date Daily is disabled and Endless opens. Removed the three-meal ROUNDS, restart and play-again controls.
- Checks: tests first (missing-module failure observed); node --test tests/*.test.mjs 44/44 pass. Browser: 46 endless rounds — first cycle 44 unique dishes, today's daily (Falafel pita) never served, no back-to-back repeats; daily result -> Play endless; switching back keeps the daily result; pre-start ?now opens Endless with Daily disabled; no console errors. Cleared the QA daily record afterwards.
- Known limit: if the daily rolls over mid-endless-round, the round in progress may be the new daily dish (later draws exclude it).

### 2026-10-19 America/Los_Angeles — Claude — Alias suggestions, streaks, hosting choice
- Branch: feat/three-meal-game; previous checkpoint 6cec83d.
- User decisions (recorded in docs/PRODUCT.md): alternative dish names are suggestions only ("Did you mean <our name>?"), never accepted; settings are not saved; separate correct-in-a-row streaks — daily (saved on device; loss or missed day resets) and endless (this visit; loss resets); planned host Netlify (not deployed, needs explicit go-ahead).
- game/aliases.json (new): 34 dishes' alternative names keyed by roster ID. game/search.mjs: searchDishes(..., aliases) ranks real matches, then alias hits (direct or with typos), then plain typos; one entry per dish; reordered words ("soup tomato") now count as a close match (previously dropped). app.mjs: unselected submit of an alias/typo says "Did you mean X? Pick it from the list."
- game/streak.mjs (new): recordDaily (idempotent per date; consecutive-day check via schedule addDays, now exported), dailyStreakNow, nextEndlessStreak, validated read/write under localStorage meal-lion:streak. UI: footer "🔥 Daily streak N"; result shows daily streak + best, or endless streak; endless label "Endless · dish N · streak S".
- Checks: tests first each time (missing file/module failures observed); node --test tests/*.test.mjs 57/57 pass. Browser: mac n cheese / shepherds pie / spag bol / hamburgr -> Did you mean our name; alias submit consumed no turn; ?now days Oct 19 win (1), Oct 20 win (2), same-day reload stays 2, Oct 21 loss (0, best 2), Oct 22 win (1), Oct 24 after missed day shows 0; endless win, win, loss -> 1, 2, 0; footer kept on one line; no console errors. Cleared QA storage afterwards.

### 2026-10-19 America/Los_Angeles — Claude — Netlify setup (not deployed)
- Branch: feat/three-meal-game; previous checkpoint fd54bee.
- User asked to prepare Netlify so only needed files publish, without deploying. Nothing was deployed and no Netlify account/site was touched.
- tools/build.cjs (new): copies game/*, reference/meal-lion-45-meals.json, assets/asset-map.json and the 24 images the asset map references into dist/ (or an out-dir argument); refuses to clear the project root; fails if a needed file is missing. netlify.toml (new): build command, publish dist, NODE_VERSION 20, / -> /game/ 302, CSP (self only) + nosniff + referrer policy, .mjs as text/javascript, revalidate /game/*. tools/serve.cjs: optional ROOT and CSP env vars for local preview of dist; .claude/launch.json gains meal-lion-dist (port 8778).
- Checks: tests/build.test.mjs written first (missing-script failure observed): builds into a temp dir, verifies every game file, data file and mapped image is present, every JSON URL app.mjs fetches resolves inside the output, and nothing else (no md/txt/cjs, mockups, pilot) is published; netlify.toml publish/command asserted. node --test tests/*.test.mjs 61/61 pass. node tools/build.cjs: 38 files, 33.0 MB. Browser on dist with the CSP header: game loads (Daily dish #2), alias suggestion works, no CSP violations; pilot.html, docs and prompts return 404.
- Not tested: real Netlify build/headers/redirect (needs deployment). Concern: the game loads ~33 MB of PNGs at startup — should be compressed/resized or lazy-loaded before launch.

### 2026-10-19 America/Los_Angeles — Claude — Sound effects and music
- Branch: feat/three-meal-game; previous checkpoint 3ee6487. Shared checkout: the image-load session (local_7e65ef50) has uncommitted work here (assets/web/, tools/optimize-images.py, .claude/launch.json); left untouched and unstaged. Messaged it which files this change edits.
- User request: add sounds and toggleable music. Prototype defaults recorded in docs/PRODUCT.md: synthesized Web Audio (no files), effects on, music off, not saved.
- game/audio.mjs (new): noteFreq, SFX table (select, reveal, wrong, skip, last, win, lose), SONG (32-step C-Am-F-G square lead + triangle bass, 112 bpm), createAudio() with lazy AudioContext on first gesture, lookahead scheduler for music, separate effect/music volume buses, suspend while the tab is hidden, never throws without Web Audio. app.mjs: plays select/wrong/skip/last/win/lose/reveal at the matching moments; unlock on any pointerdown/keydown; "♪ Music: off/on" header toggle (aria-pressed) plus Sound effects and Music checkboxes in Settings.
- Checks: tests/audio.test.mjs written first (missing-module failure observed) using a fake AudioContext and fake timers; node --test tests/*.test.mjs 68/68 pass. Browser (Chromium) with oscillator starts instrumented: real click on Music started a running context and scheduled notes; turning it off stopped scheduling; select 1 tone, wrong 2, skip 3, last 2, win 4, lose 3; effects off -> 0 tones; 375px no overflow; no console errors. Cleared the test daily save from the preview browser.
- Not tested: actually listening (no audio output in this environment) — volume balance and how it sounds need the user's ears; iOS Safari silent switch/interruptions; real phones.

### 2026-10-19 America/Los_Angeles — Claude — Smaller startup image download
- Branch: feat/three-meal-game; previous checkpoint f2a4135 (sound session committed on the same branch meanwhile; no file overlap except game/app.mjs, where only my hunks are in this diff).
- Measured: 24 PNGs, 32.9 MB, all loaded before the game was playable (6 meal/serve sheets, 8 ingredient atlases, 10 reaction strips, kitchen, chef). First screen needs only kitchen + chef + the atlas of each revealed clue.
- game/art.mjs: images load on first use (load events, not decode(), which stalled in hidden/background tabs); prepare() loads kitchen + chef; settled() waits for everything requested so far; onLoad callback for redraws. Fallbacks unchanged while pending (blue backdrop, neutral chef + flying icon, lettered icon). Finished-meal art and pancake/grilled-cheese strips are only requested by end-of-round draws.
- game/app.mjs: boot requests the first screen's images via a scratch-canvas draw, holds canvas drawing until settled() so nothing flashes a fallback, then renders; redrawArt() (coalesced) re-renders when a later image arrives.
- tools/optimize-images.py (new, Pillow, free/offline): lossless WebP (method 6) copies under assets/web/ mirroring reference/ paths, same dimensions, verifies every visible pixel, records source SHA-256/bytes/size in assets/web/manifest.json; skips unchanged sources. 32.9 MB -> 21.4 MB (kitchen RGB 1.44 -> 0.99 MB; atlases 52-80% of original). reference/ untouched (git status clean there).
- tools/build.cjs: publishes the WebP copy when its recorded source hash matches the original (else the PNG, with a warning) and writes a published dist/assets/asset-map.json pointing at what it copied. tools/serve.cjs: .webp MIME type. Netlify needs no change (serves webp natively).
- Tests: tests/art.test.mjs (new: prepare loads only kitchen/chef; atlas on first draw with fallback; meal art never requested during play for idle/react/wrong moods; settled reports failures, no retry loop). tests/build.test.mjs: published map equals source map except paths, copies fresh (hash) with matching dimensions and smaller, no PNG/manifest/py published. node --test tests/*.test.mjs 74/74 pass.
- Browser checks (headless Chrome via DevTools protocol, because this session's browser pane was hidden and rAF/decode do not run there), old build vs new dist with the Netlify CSP: cold load at simulated 10 Mbps/40 ms: old 28.3 s to playable, 24 images / 32.9 MB; new 2.9 s, 3 images / 2.36 MB (kitchen, chef, butter's atlas), no further images until play. Three dailies (Pancakes, Grilled cheese, Shakshuka) played clue-by-clue to a loss with motion paused: all 17 stage frames (incl. egg/milk/cheese/tomato/onion strips, serve strips, finished meals) and clue/plate canvases match within 1-2/255 per channel; full-page screenshots desktop + 375px phone: same, apart from the countdown clock text. Difference is Chrome's WebP vs PNG premultiplied-alpha rounding on semi-transparent pixels only (opaque pixels and alpha identical; kitchen bit-identical). Console: only the pre-existing favicon.ico 404 in both builds.
- Not tested: Firefox/Safari decoders; throttled play where a reaction strip arrives mid-reaction (logic unit-tested; it starts from the strip's current step); real phones; real Netlify.
- Possible follow-ups: downscaled copies sized to the 1200x400 stage (much smaller, but visibly resamples the art, needs the user's OK); dark one-pixel bleed left of the Pancakes plate comes from the source atlas (pre-existing, unchanged).

### 2026-10-19 America/Los_Angeles — Codex — Missing food artwork kickoff
- User requested missing ingredient and meal artwork until usage runs out. Branch: codex/missing-food-art; existing checkpoint 2d78f84; initial working tree clean.
- Reconciled current summary with implemented daily/endless, persistence, aliases, streaks and audio. Coverage remains 20/45 meals and 50/103 ingredients (25 meals and 53 ingredient gaps).
- Plan: generate individual transparent pixel-art assets using built-in image generation, prioritizing shared ingredient gaps; inspect outputs, save outside reference/, update map/coverage/prompts, refresh lossless web copies, run asset/build checks and commit verified batches.
- Existing artwork is approved style; no visual redesign or gameplay changes requested. No generation performed yet.

`n- First assets: Parmesan and Basil generated, visually inspected, saved under assets/generated/food-2026-10-19/ and mapped. Prompts recorded. Coverage refresh utility added. Initial branch creation required sandbox escalation and then succeeded. Web copies/checkpoint checks pending.

- First checkpoint: mapped Parmesan, Basil, Macaroni, Mozzarella, Pizza dough and Chicken quesadilla. Coverage 21/45 meals and 55/103 ingredients; original reference/ untouched. Lossless web copies refreshed and all 74 tests passed (including map/build paths, source hashes and image dimensions).
- Visual inspection: subjects readable and follow pixel-food direction; transparency confirmed. Some low-alpha pixels reach image boundaries, so final halo cleanup/light-and-dark background approval is still pending. No real-device/browser artwork inspection in this pass yet.
- Next batch: Arborio rice generated and saved, not mapped yet; vegetable stock next. All artwork remains draft.

`n- Checkpoint 6bcefbd committed successfully. Arborio rice and Vegetable stock now saved and mapped, completing mushroom risotto ingredient art; coverage 21/45 meals, 57/103 ingredients. Prompts saved; optimized copies pending for these two additions.
`n- Second batch: Arborio rice, Vegetable stock, Tomato soup and Gnocchi with tomato sauce mapped; lossless copies generated successfully. Coverage 23/45 meals and 57/103 ingredients. All 74 tests passed. Pasta icon also saved for next batch; not mapped yet.


### 2026-10-19 — Claude — GitHub backup remote

- At the user's request, created private GitHub repo EricTalanoa/meal-lion and added it as origin. Pushed all three local branches (main, feat/three-meal-game, codex/missing-food-art) with upstream tracking. No deployment.
- Left the untracked assets/generated/food-2026-10-19/{pasta,pesto-pasta,pine-nuts}.png alone; they are not committed or pushed.
- Next: push future checkpoint commits to origin.
- Follow-up: committed and pushed the three generated images (pasta, pesto-pasta, pine-nuts) as source art at the user's request. They are not yet wired into assets/asset-map.json, assets/web/ or the game.
