# Required Git and continuity workflow

These instructions apply equally to Codex, Claude, and any successor agent. The project must use Git, and WORK_LOG.md must stay current during work, not only at the end. Chat history is not the project record.

## Set up or identify the repository

1. Work from the project folder. Run `git --version`, `git rev-parse --show-toplevel`, and `git status --short --branch`. If Git is unavailable, report the blocker and arrange installation for the user's platform. Continue documenting work in WORK_LOG.md meanwhile.
2. If a repository already contains this folder, inspect its root, branch, history, and scope before proceeding. Reuse the intended project repository. Do not accidentally commit a parent workspace or create a nested repository. If the parent is an unrelated workspace, place the extracted handoff in a dedicated project directory outside it before initialization, leaving the original intact.
3. In a genuinely new dedicated project directory, run `git init -b main`. Inspect `git config user.name` and `git config user.email`. If missing, obtain the user's preferred identity and configure it locally with `git config user.name "..."` and `git config user.email "..."`. Do not invent an identity or change global configuration.
4. Review the supplied .gitignore, then review `git status --short`. Stage the intended project files explicitly, inspect `git diff --cached --stat`, and create a baseline commit such as `git commit -m "Add Meal-lion design and asset handoff"`. Include reference art, mockups, docs, manifests, agent instructions, and WORK_LOG.md. Do not include secrets, dependencies, build caches, or redundant ZIP archives. Check hosting size limits before choosing a remote; use Git LFS if required and available, with a documented setup.
5. Local Git does not require GitHub or another remote. Do not create a remote repository, publish, or push until the user authorizes it. Use a user-supplied remote URL; never guess one. Record the repository location and remote status in WORK_LOG.md.

The distributed ZIP intentionally contains no .git history. Follow the above steps after extraction; do not assume this handoff has already been initialized or committed.

## Every working session

- Read WORK_LOG.md first, then the relevant product/design instructions. Inspect `git status --short --branch` and `git log -5 --oneline` (history may be empty in a new repository). Reconcile discrepancies with the files and record them.
- Record the active task and intended next checkpoint before editing. Inspect existing changes and preserve unrelated work. Prefer a descriptive task branch, for example `git switch -c feat/three-meal-game`, when starting a new task; continue the existing appropriate branch when resuming.
- Update WORK_LOG.md after each meaningful milestone, implementation change, test result, decision, or blocker, and before pausing or returning a final response. Save incremental progress so interruption does not erase the handoff context.
- At coherent checkpoints, run the relevant checks, review the diff, stage only task-owned changes and the log, inspect the staged diff, then commit with a descriptive message. Do not automatically use `git add .` in a dirty/shared workspace. Do not claim a commit succeeded without checking its output.
- Record the latest existing commit ID when known, or say changes are uncommitted. A log committed alongside code cannot contain that same commit's final hash; reference the previous checkpoint and describe the current checkpoint, then let the next session read Git history. Do not create an endless cycle of commits just to update a hash.
- Never silently discard changes, rewrite shared history, force-push, or use destructive resets. If multiple agents work concurrently, use separate branches/worktrees and reconcile their logs during integration.

## Asset-set checkpoints (user instruction, 2026-10-22)

After each completed asset set, save exact generation prompts and source files, update the asset map and coverage, run `python tools/optimize-images.py` (including icon-sheet and meal-thumbnail generation), run the tests and build, then commit the verified set with its work log. Fetch and reconcile remote changes, merge the checkpoint into `main` (fast-forward when possible), and push both the asset branch and `main`. Verify the remote refs and record the outcome. The user explicitly authorized these merges and pushes; no deployment is implied. Preserve concurrent work and never force-push. If a check or push fails, record the failure and resolve it before claiming the checkpoint is published.

## Required contents of WORK_LOG.md

Keep a short current-state summary at the top. Append session entries below it, preserving useful history. Use paths relative to the project root so the record is portable.

Each meaningful update should capture:

- Date/time with timezone and agent name (Codex, Claude, or other).
- Current task, branch, latest existing checkpoint, and whether changes are uncommitted.
- What was done and why; affected files and key decisions.
- Checks actually run and their results; explicitly list anything not tested.
- Current working/broken/incomplete behavior and blockers.
- Concrete ordered next steps, including how to run or reproduce relevant work.
- User decisions still needed, kept separate from temporary assumptions.

Suggested entry template:

```markdown
### YYYY-MM-DD HH:mm timezone — Agent — Task
- Branch/checkpoint:
- Completed / changed files:
- Decisions / assumptions:
- Checks and results:
- Incomplete / blockers:
- Next steps:
- Working tree / handoff notes:
```

Record durable product decisions in docs/PRODUCT.md as well and link them from the log. Update run instructions when commands change. Never put credentials or tokens in the log.

## Package integrity versus development

inventory.json is a snapshot of the delivered package, not a lock on future development. Once files change, old hashes are expected to differ. Preserve the original ZIP as a baseline. If distributing a refreshed handoff, regenerate the inventory deliberately and verify the new archive; do not hide unexpected mismatches by blindly refreshing hashes. The package verifier is not a substitute for application tests.
