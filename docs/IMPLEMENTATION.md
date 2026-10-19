# Suggested implementation sequence

1. Build a responsive shell matching approved desktop B and mobile states. Reuse the kitchen/lion. Confirm real keyboard behavior before expanding content.
2. Implement a three-meal slice (Shakshuka, Pancakes, Grilled cheese) with structured meal data, guesses, reveals, results, replay and reset. Confirm or clearly mark temporary attempt/clue rules. Demo serve buttons and answer selectors belong only in a separate development gallery.
3. Add native input and accessible autocomplete over the full roster, alias validation, wrong-guess history and win/loss states. Do not show finished dishes until results.
4. Add daily scheduling using stable IDs and an explicitly selected timezone. Every user sees the same scheduled meal for a date. Keep schedule and content versioned. A 45-meal pool needs a future reuse/expansion policy.
5. Add endless play; a shuffled bag and avoiding today's answer are proposals. Keep daily progress/streaks separate from endless state.
6. Add local persistence or the chosen backend only after its scope is agreed. Define versioning and day rollover recovery.
7. Integrate the newer custom animations using the normalized map, clean sprite anchors, and fill missing art incrementally. Preserve neutral fallbacks.
8. Validate devices, accessibility and asset performance before release. Deployment is a separate authorized step.

No framework is committed. Existing examples are plain HTML/CSS/JS and canvas. A modular web app with structured content and a small renderer is sufficient; do not introduce accounts or a complex backend without a need. Separate game state from rendering, animation state and input state. Resolve assets relative to the application base, not original machine paths.

Suggested states: browsing/typing, revealing, playing reaction, won, lost. Suggested data boundaries: meal roster; alias lookup; schedule; per-mode progress; asset registry; animation routing. Prevent duplicate submissions and stale reaction timers. Keep guess/reveal logic deterministic and independently testable.

Assets in a client-only game are discoverable by determined players. If stronger answer secrecy becomes a requirement, agree a server design; don't claim client assets are secure.
