# Three-meal Game Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Play three meals with ingredient-based guess limits and optional starting-clue/hidden-count settings.
**Architecture:** Pure state transitions separate from DOM rendering and atlas rendering. Load the full roster and normalized asset map; use stable IDs 3, 1, 22 for rounds.
**Tech Stack:** Native browser JavaScript modules, HTML/CSS, Node built-in test runner. No install or backend.
**Spec:** docs/PRODUCT.md, docs/DESIGN.md, and user-approved first-slice description in WORK_LOG.md.

## Global Constraints
- Preserve reference/; use assets/asset-map.json.
- One guess per ingredient; default one free ingredient, optional zero; optional `Guess 1/X` hides totals everywhere during play.
- Selection is separate from submission. Answer presentation occurs only at results.
- Full roster search, native mobile keyboard, optional motion, accessible controls.
- Prototype skip/clue order/normalization defaults must be labeled; no daily schedule, storage, accounts or deployment in this milestone.

## Review Focus
- Invalid/duplicate input must not consume a turn (Task 1 tests).
- Correct final guesses must win; lost games cannot mutate (Task 1 tests).
- Zero-start rounds still receive exactly ingredient-count attempts (Task 1 tests).
- Hidden totals cannot leak through tile count or screen-reader labels (Task 2 browser checks).
- Mobile settings and suggestion selection must preserve usable focus and visible submission (Task 2 browser checks; real keyboard remains device QA).

### Task 1: Game state
Files: game/state.mjs, tests/game.test.mjs.
Interfaces: createGame(meal, {startWithClue}), submitGuess(state, mealId, roster), skipClue(state), publicProgress(state, hideTotal).
- [x] Write tests for first/final attempts, budgets 3/4/7/9, zero start, skip boundaries, invalid/duplicate input, terminal immutability, hidden progress.
- [x] Run `node --test tests/game.test.mjs` and observe missing-module failure.
- [x] Implement immutable transitions with `{state, error}` result; keep invalid guesses unchanged.
- [x] Run tests to green and commit with log.

### Task 2: Playable responsive interface
Files: game/index.html, game/style.css, game/app.mjs, game/art.mjs, README.md.
Consumes Task 1 interfaces. Art module exports createArt(map), returning async prepare(), drawStage(canvas, ingredient, elapsed, won), drawIngredient(canvas, label), drawMeal(canvas, id).
- [x] Build split layout with existing kitchen/chef, clue cards, search suggestions, explicit submission, history and results.
- [x] Add session settings, next/restart controls, mobile focus/visualViewport handling, reduced-motion/pause/replay, loading/error feedback.
- [x] Verify actual browser wrong/invalid/duplicate/correct/final guesses, next round, settings, hidden totals and selection behavior.
- [x] Inspect desktop and narrow viewport screenshots, missing assets, keyboard focus and overflow. Record actual-device keyboard gap.
- [x] Run state tests and module syntax checks, review diff, update run instructions/log, commit.

## Execution record
- Inline implementation in the existing dedicated clean project branch; WORK_LOG.md is the user-required shared ledger.
- Plan self-review: all requested settings and existing approved layout requirements covered; no interface conflicts found.
