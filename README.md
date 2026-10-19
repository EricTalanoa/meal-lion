# Meal-lion handoff

**For every AI session:** read [WORK_LOG.md](WORK_LOG.md) and follow [Git and continuity instructions](docs/GIT_AND_CONTINUITY.md). Set up or reuse Git, make focused checkpoint commits, and keep the shared log updated throughout the work. Both AGENTS.md and CLAUDE.md require this workflow.

Prepared 18 October 2026 for Codex and Claude. Start with [START_HERE.md](START_HERE.md), or open [the visual index](index.html).

This is a portable collection of the current design, content, assets and prototypes. It is not a finished game. Original files are preserved under reference/. New handoff documents are authoritative about decisions and current status. Older notes may contain superseded proposals.

Contents: 45 proposed meals; 20 meal illustrations; 50/103 unique ingredient icons; 11 custom animation groups; approved desktop/mobile mockups; alternative concepts; generation prompts; playable visual demos; asset map; implementation instructions and QA checklist.

Open HTML files directly, or with Node installed run: node tools/serve.cjs
Then visit http://127.0.0.1:8766/ . Use `PORT=8777 node tools/serve.cjs` if 8766 is busy. This server is for local review only. No dependencies or account required.

Playable game (Daily dish + Endless): http://127.0.0.1:8766/game/ (needs the server; ES modules and fetch do not run from file://). Tests: `node --test tests/game.test.mjs tests/search.test.mjs tests/schedule.test.mjs tests/persist.test.mjs tests/endless.test.mjs`.

Daily dish: changes at midnight US Eastern. Schedule lives in game/schedule.json (append new dish IDs to the end only; set `startDate` to launch day). QA on localhost only: add `?now=2026-11-01T03:59:50Z` to run the game clock from any instant.

To hand off: give the other agent this entire folder or extract the ZIP, and paste KICKOFF_PROMPT.md. No files outside this folder are needed for the included galleries.
