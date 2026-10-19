# Meal-lion — shared work log

Every AI must read this file before working and update it throughout the session. Follow docs/GIT_AND_CONTINUITY.md. Keep this summary current and append dated entries below.

## Current state

- Current milestone: responsive three-meal slice is playable at game/ (Shakshuka, Pancakes, Grilled cheese) with ingredient-based guess limits and session settings. Browser-verified in emulation; real-device keyboards untested.
- Product: daily meal guessing plus endless mode. Approved desktop B split layout and mobile native-keyboard-aware layout.
- Available: 45-meal roster, 20 meal illustrations, 50 of 103 canonical ingredient icons, 11 draft custom animation groups, mockups, prompts, visual prototypes and normalized asset map.
- Implemented: game/ (index.html, style.css, app.mjs, art.mjs, state.mjs). Not implemented: daily schedule, endless mode, persistence, aliases, final rules, deployment. reference/meal-lion-demo/pilot.html remains a visual demo that exposes answers.
- Repository/branch/checkpoint: local repository initialized in the handoff root on main; baseline checkpoint 25962a4 created and verified; kickoff documentation checkpoint follows. Existing configured Git identity reused. No remote configured.
- Confirmed rules: ingredient-count guess budget, one free clue (zero optional), optional hidden total. Open decisions: skip policy, clue ordering, aliases, timezone/schedule, scoring and storage. See docs/PRODUCT.md.
- Next: real iOS Safari / Android Chrome keyboard QA of game/; user review of the slice and prototype defaults; then daily scheduling (needs timezone/start-date decision) and endless mode.

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
