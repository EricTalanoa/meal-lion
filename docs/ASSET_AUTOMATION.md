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

## Cloud feasibility investigation — 2026-10-20

Status: cloud scheduled image generation and downloading a resulting PNG verified. Full queue migration, automatic repository integration and quota-reset recovery are not verified. The existing local heartbeat is unchanged.

- Official scheduled-task documentation supports cloud/web tasks with uploaded context and connected tools, but explicitly says they cannot directly use the local project folder or retain a local worktree between runs: https://learn.chatgpt.com/docs/automations
- Official pricing documentation says Codex image generation counts toward general included usage alongside local messages and cloud chats. This does not establish tool availability in a particular scheduled cloud run: https://learn.chatgpt.com/docs/pricing?codex-pricing-plans=individual
- The automation tool available in this local chat exposes local cron and thread heartbeat destinations, not a cloud execution option. A local heartbeat cannot be made computer-independent by changing its prompt.
- User signed in to ChatGPT web. Created one-time cloud test `6ad7bfe9c2408191b650b820afd8a386` titled "Meal-lion cloud image capability test"; inspected "Runs on: Cloud", triggered Run now, and observed image output. The one-time schedule now displays Completed with no Pause action.
- Result chat: https://chatgpt.com/c/6ad7bfdb-aa44-83e8-9a56-37c884747cb6 . Downloaded the first rendered generated image using the browser media download API after the attachment-download wait stalled. Saved assets/generated/cloud-test-2026-10-20/chickpeas-test.png; Pillow verifies PNG, RGBA, 1312 x 1199, alpha extrema 0–255. Visually inspected six recognizable chickpeas. Draft only; not mapped or counted as production coverage.
- The run reported built-in generation without external API keys or purchased credits; no API fallback was configured here. This is not a billing audit. Two image renderings appeared in the chat after Run now and the scheduled time; one downloaded output was inspected. Future tests should avoid scheduling a near-future run and also using Run now.
- Computer remained on to observe the test. Execution destination is verified as Cloud; physical power-off operation, long-term attachment retention, repeated reset recovery and repository writes were not tested.

Checklist before moving the queue (steps 1–4 exercised for this account; remaining persistence/integration checks still open):

1. Confirm the account exposes a cloud execution mode and a suitable scheduled-task interface. Test in the cloud with no local-computer access.
2. Generate just one draft Chickpeas icon with the built-in image tool, using the established prompts.json style and a reference image if uploads are supported. Recheck coverage first in case the local queue already supplied it. Do not use an API key or paid fallback.
3. Verify the result is a downloadable image with alpha transparency, not merely a textual claim or an expired session path. Save its exact prompt and an explicit test receipt.
4. Exercise a single scheduled cloud generation and inspect the actual run result; an interactive image alone does not establish scheduled tool support.
5. Verify durable output and queue state across separate cloud runs. Cloud chat attachments may suffice for later manual import, but automatic project integration additionally requires confirmed repository write capability. Never assume a GitHub read connector can commit binary images.
6. Only after those checks pass, arrange recurring cloud generation and prevent duplicate local/cloud work. Preserve the current local schedule until a replacement is verified or the user requests otherwise.
