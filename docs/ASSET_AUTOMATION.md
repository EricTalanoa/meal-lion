# Scheduled asset generation

Authorized by the user on 2026-10-20: use available included usage to generate missing food artwork, resume after usage resets, and continue until the queue is complete.

## Schedule and limits

- Active Codex thread heartbeat: `resume-meal-lion-asset-generation`.
- Checks every 30 minutes, throughout the day and night. This is polling, not a reset-event trigger; an available run resumes after a reset.
- Check the live usage tool and the latest WORK_LOG.md entry before generation. Codex usage and image generation usage may be separate; do not infer image quota from Codex percentages.
- If a recorded retry/reset time is still in the future, skip generation. If no reset time was supplied, allow at most one generation attempt per scheduled run. Stop at the first quota error; never loop on errors.
- Use included built-in image generation only. Do not buy credits, spend banked resets, introduce paid API fallbacks or change subscriptions.
- A scheduled run may be delayed or unable to start when usage is exhausted. Keep the computer awake, Codex running and this project available for local work.

## Resume workflow

1. Read AGENTS.md, WORK_LOG.md, docs/GIT_AND_CONTINUITY.md, START_HERE.md, docs/PRODUCT.md and docs/ASSETS.md. Inspect Git branch/status/recent commits. Continue the asset branch only when safe; preserve unrelated changes. If another worker is editing the same map/log, defer instead of racing it.
2. Update the log at the start. Reconcile assets/asset-map.json, assets/COVERAGE.md, the roster and saved generated files. Integrate unfinished saved assets first; do not generate duplicates because a prior run stopped before mapping.
3. Use the imagegen skill and inspect existing approved artwork as reference. Prioritize missing ingredient icons shared by several meals, then finish ingredient sets and missing meal illustrations. Scope is the existing 45-meal roster, not new dishes, animations or visual redesigns.
4. Generate one asset at a time in the existing pixel-food direction with a transparent background. Save each result immediately under assets/generated/food-YYYY-MM-DD/ using a stable subject filename. Save its exact prompt, subject, output path and draft status in that batch's prompts.json before starting another asset. Preserve reference/.
5. Inspect the image for recognizability, style, clipping and transparency. Record defects honestly; do not map unusable output as completed. Do not claim that transparent corners establish clean edges or production readiness.
6. Map usable output with the existing schema in assets/asset-map.json, then run `node tools/update-food-coverage.cjs`. Keep docs/ASSETS.md coverage counts accurate. Run `python tools/optimize-images.py` using an available Python with Pillow to refresh lossless WebP copies.
7. Run `node --test tests/*.test.mjs` and `node tools/build.cjs` at coherent integration checkpoints. Inspect the diff, stage only task-owned files and WORK_LOG.md, and commit verified work. Save/log after every asset; checkpoint small batches so a quota interruption leaves recoverable progress. Do not mark browser or device checks as performed unless actually run.
8. Continue while work and usage remain. On quota exhaustion record the exact error, any supplied retry time, completed paths, integration/check status and the next subject. If execution is cut off abruptly, the next run must reconcile files before retrying.

## Completion and reporting

Notify only for meaningful completed batches, queue completion, new failures or required user action. Stay quiet on unchanged quota waits. Missing tools or permissions are blockers to report, not reasons to invent a successful run.

Stop when all 45 meals and all canonical ingredients have mapped, inspected artwork and pending integration checks pass. Pause the heartbeat through the automation tool, record completion in WORK_LOG.md, and report remaining draft-quality or device-review caveats. Do not consume usage on duplicate artwork after the queue is done. Deployment is outside this authorization.

Scheduling configuration is stored by the Codex app, not Git; this file preserves the intent and recovery procedure. Creation of the schedule does not prove an unattended image generation run has succeeded.
